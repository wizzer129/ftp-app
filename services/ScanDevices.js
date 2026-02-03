/**
 * ScanDevices service - mDNS device discovery for React Native
 *
 * This service scans for devices on the local network using mDNS (Bonjour/Zeroconf).
 * Devices should advertise themselves with the service type '_device._tcp'.
 *
 * Usage:
 *   import { startScanning, stopScanning, getDevices } from './services/ScanDevices';
 *
 *   startScanning((devices) => {
 *     console.log('Found devices:', devices);
 *   });
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import Zeroconf from 'react-native-zeroconf';

// Service type to scan for - devices should advertise as '_device._tcp'
const SERVICE_TYPE = '_device._tcp';

// derive service name and protocol for Zeroconf.scan()
const _parseServiceType = (svc) => {
	// expected format: _name._proto (e.g. _device._tcp)
	const normalized = svc.replace(/^_/, '');
	const parts = normalized.split('._');
	return {
		name: parts[0] || 'device',
		protocol: parts[1] || 'tcp',
	};
};

let isScanning = false;
let discoveredDevices = new Map();
let scanCallback = null;
let zeroconf = null;

/**
 * Initialize Zeroconf instance
 * @returns {Zeroconf}
 */
const initZeroconf = () => {
	if (!zeroconf) {
		zeroconf = new Zeroconf();

		zeroconf.on('resolved', (service) => {
			const device = {
				id: service.name,
				name: service.name,
				host: service.host,
				port: service.port,
				addresses: service.addresses,
				txt: service.txt, // Additional metadata
			};
			console.log('Device resolved:', device.name);
			discoveredDevices.set(device.id, device);
			scanCallback?.(Array.from(discoveredDevices.values()));
		});

		zeroconf.on('removed', (service) => {
			console.log('Device removed:', service.name);
			discoveredDevices.delete(service.name);
			scanCallback?.(Array.from(discoveredDevices.values()));
		});

		zeroconf.on('error', (error) => {
			console.error('Zeroconf error:', error);
		});
	}

	return zeroconf;
};

/**
 * Start scanning for devices on the network
 * @param {Function} callback - Called with updated device list when devices are found/lost
 * @returns {Promise<void>}
 */
export const startScanning = async (callback) => {
	if (isScanning) {
		console.warn('Already scanning for devices');
		return;
	}

	scanCallback = callback;
	discoveredDevices.clear();
	isScanning = true;

	try {
		const mdns = initZeroconf();

		// scan() is event-driven, not promise-based
		// It will emit 'resolved' and 'removed' events
		console.log(mdns);
		const { name, protocol } = _parseServiceType(SERVICE_TYPE);
		// scan for devices advertising the configured service type
		mdns.scan(name, protocol, 'local.');

		console.log(`Started scanning for devices with service type: ${SERVICE_TYPE}`);
	} catch (error) {
		console.error('Error starting device scan:', error);
		isScanning = false;
		throw error;
	}
};

/**
 * Stop scanning for devices
 * @returns {void}
 */
export const stopScanning = () => {
	if (!isScanning) {
		return;
	}

	if (zeroconf) {
		zeroconf.stop();
	}

	isScanning = false;
	scanCallback = null;
	console.log('Stopped scanning for devices');
};

/**
 * Get the current list of discovered devices
 * @returns {Array} Array of discovered device objects
 */
export const getDevices = () => {
	return Array.from(discoveredDevices.values());
};

/**
 * Check if currently scanning
 * @returns {boolean}
 */
export const getScanningStatus = () => {
	return isScanning;
};

/**
 * Clear all discovered devices
 * @returns {void}
 */
export const clearDevices = () => {
	discoveredDevices.clear();
	scanCallback?.(Array.from(discoveredDevices.values()));
};

export default {
	startScanning,
	stopScanning,
	getDevices,
	getScanningStatus,
	clearDevices,
	SERVICE_TYPE,
};

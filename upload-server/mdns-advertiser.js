/**
 * mDNS Advertiser - Advertise this device on the local network
 *
 * This service advertises the device using mDNS (Bonjour/Zeroconf)
 * so that mobile apps can discover it on the network.
 *
 * Run this on your device (e.g., Raspberry Pi, embedded device, or dev machine)
 * to make it discoverable by the FTP mobile app.
 *
 * Usage:
 *   node mdns-advertiser.js
 */

const multicastdns = require('multicast-dns');
const os = require('os');

// Configuration
const SERVICE_TYPE = '_device._tcp.local';
const SERVICE_NAME = process.env.DEVICE_NAME || 'Pump Device 001';
const SERVICE_PORT = parseInt(process.env.SERVICE_PORT || '3001', 10);

// Additional metadata that will be broadcast
const TXT_RECORD = {
	model: process.env.DEVICE_MODEL || 'PumpX1000',
	version: process.env.DEVICE_VERSION || '1.0.0',
	manufacturer: 'FTP Systems',
	capabilities: 'upload,firmware-update',
};

// Get local IP addresses
function getLocalIpAddresses() {
	const interfaces = os.networkInterfaces();
	const addresses = [];

	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			// Skip internal and non-IPv4 addresses
			if (!iface.internal && iface.family === 'IPv4') {
				addresses.push(iface.address);
			}
		}
	}

	return addresses;
}

// Encode TXT record data
function encodeTxtRecord(record) {
	const entries = [];
	for (const [key, value] of Object.entries(record)) {
		entries.push(Buffer.from(`${key}=${value}`));
	}
	return entries;
}

// Create and start the mDNS advertisement
function startAdvertising() {
	try {
		const mdns = multicastdns();
		const localIps = getLocalIpAddresses();
		const hostname = os.hostname();
		const instanceName = `${SERVICE_NAME}.${SERVICE_TYPE}`;
		const hostName = `${hostname}.local`;

		console.log('╔════════════════════════════════════════════════════════════╗');
		console.log('║            mDNS Device Advertisement Started              ║');
		console.log('╚════════════════════════════════════════════════════════════╝');
		console.log('');
		console.log(`📡 Service Name:  ${SERVICE_NAME}`);
		console.log(`🔧 Service Type:  ${SERVICE_TYPE}`);
		console.log(`🚪 Port:          ${SERVICE_PORT}`);
		console.log(`🌐 IP Addresses:  ${localIps.join(', ') || 'N/A'}`);
		console.log('');
		console.log('📋 Advertised Metadata:');
		Object.entries(TXT_RECORD).forEach(([key, value]) => {
			console.log(`   ${key}: ${value}`);
		});
		console.log('');
		console.log('✅ Device is now discoverable on the local network!');
		console.log('   Mobile apps can scan for this device using mDNS/Zeroconf.');
		console.log('   No native dependencies required (pure JavaScript).');
		console.log('');
		console.log('Press Ctrl+C to stop advertising...');
		console.log('');

		// Handle incoming queries
		mdns.on('query', (query) => {
			const answers = [];

			// Check if the query is for our service type or instance
			const isRelevantQuery = query.questions.some(
				(q) =>
					q.name === SERVICE_TYPE ||
					q.name === instanceName ||
					q.type === 'PTR' ||
					q.type === 'ANY'
			);

			if (!isRelevantQuery) {
				return;
			}

			// PTR record: maps service type to instance name
			answers.push({
				name: SERVICE_TYPE,
				type: 'PTR',
				ttl: 120,
				data: instanceName,
			});

			// SRV record: provides hostname and port
			answers.push({
				name: instanceName,
				type: 'SRV',
				ttl: 120,
				data: {
					priority: 0,
					weight: 0,
					port: SERVICE_PORT,
					target: hostName,
				},
			});

			// TXT record: provides metadata
			answers.push({
				name: instanceName,
				type: 'TXT',
				ttl: 120,
				data: encodeTxtRecord(TXT_RECORD),
			});

			// A records: map hostname to IP addresses
			localIps.forEach((ip) => {
				answers.push({
					name: hostName,
					type: 'A',
					ttl: 120,
					data: ip,
				});
			});

			// Send response
			mdns.respond(answers);
		});

		// Proactively announce our service
		const announce = () => {
			const answers = [
				{
					name: SERVICE_TYPE,
					type: 'PTR',
					ttl: 120,
					data: instanceName,
				},
				{
					name: instanceName,
					type: 'SRV',
					ttl: 120,
					data: {
						priority: 0,
						weight: 0,
						port: SERVICE_PORT,
						target: hostName,
					},
				},
				{
					name: instanceName,
					type: 'TXT',
					ttl: 120,
					data: encodeTxtRecord(TXT_RECORD),
				},
			];

			localIps.forEach((ip) => {
				answers.push({
					name: hostName,
					type: 'A',
					ttl: 120,
					data: ip,
				});
			});

			mdns.respond(answers);
		};

		// Announce immediately and then periodically
		announce();
		const announceInterval = setInterval(announce, 60000); // Every 60 seconds

		// Graceful shutdown
		const cleanup = () => {
			console.log('\n\n🛑 Stopping mDNS advertisement...');
			clearInterval(announceInterval);

			// Send goodbye messages (TTL 0)
			const goodbye = [
				{
					name: SERVICE_TYPE,
					type: 'PTR',
					ttl: 0,
					data: instanceName,
				},
			];

			mdns.respond(goodbye, () => {
				mdns.destroy();
				console.log('✅ Advertisement stopped. Goodbye!\n');
				process.exit(0);
			});
		};

		process.on('SIGINT', cleanup);
		process.on('SIGTERM', cleanup);

		return mdns;
	} catch (error) {
		console.error('Failed to start mDNS advertisement:', error);
		process.exit(1);
	}
}

// Start the service
if (require.main === module) {
	console.log('Starting mDNS advertiser...\n');
	startAdvertising();
}

module.exports = { startAdvertising };

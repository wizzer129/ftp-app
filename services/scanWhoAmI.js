/**
 * React Native compatible /whoami network scanner
 *
 * Exports:
 * - `scanWhoAmI(opts)` Promise -> [{ host, port, info }]
 * - `useWhoAmIScanner(opts)` React hook for scanning from components
 *
 * Notes:
 * - In React Native the module attempts to detect the device IP via
 *   `react-native-network-info` if installed. If not available you can
 *   pass `localIps: ['192.168.1.22']` in opts or `networkRanges: ['192.168.1.0/24']`.
 * - Works in Node.js too (uses `http` when `fetch` is missing).
 */

const defaultPorts = [8080];

function ipToInt(ip) {
	return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function intToIp(int) {
	return [(int >>> 24) & 0xff, (int >>> 16) & 0xff, (int >>> 8) & 0xff, int & 0xff].join('.');
}

function maskFromPrefix(prefix) {
	return prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
}

async function detectLocalIps() {
	// 1) Try Expo managed `expo-network`
	try {
		// eslint-disable-next-line global-require
		const expoNet = require('expo-network');
		const Network = expoNet && (expoNet.Network || expoNet);
		if (Network && typeof Network.getIpAddressAsync === 'function') {
			const ip = await Network.getIpAddressAsync();
			if (ip) return [ip];
		}
	} catch (e) {
		// ignore if not available
		console.log('Error attempting to detect IPs:', e.message || e);
	}

	return [];
}

function enumerateHostsFromRange(range, maxHostsCap = 254) {
	// range like 192.168.1.0/24 or 192.168.1.22/32
	const parts = range.split('/');
	const baseIp = parts[0];
	let prefix = parseInt(parts[1], 10);
	if (Number.isNaN(prefix)) prefix = 24;
	if (prefix < 24) prefix = 24; // cap for safety
	const ipInt = ipToInt(baseIp);
	const mask = maskFromPrefix(prefix);
	const base = ipInt & mask;
	const total = (1 << (32 - prefix)) - 2;
	const maxHosts = Math.min(maxHostsCap, total > 0 ? total : 254);
	const hosts = [];
	for (let i = 1; i <= maxHosts; i++) hosts.push(intToIp(base | i));
	return hosts;
}

function fetchWhoamiViaFetch(host, port, timeout) {
	try {
		const url = `http://${host}:${port}/whoami`;
		const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
		const signal = controller ? controller.signal : undefined;
		const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

		return fetch(url, { method: 'GET', signal })
			.then(async (res) => {
				if (!res.ok) throw new Error('non-200');
				const text = await res.text();
				try {
					const json = JSON.parse(text);
					return { ok: true, json };
				} catch (e) {
					return { ok: false };
				}
			})
			.catch(() => ({ ok: false }))
			.finally(() => {
				if (timer) clearTimeout(timer);
			});
	} catch (error) {
		console.log('fetchWhoamiViaFetch error:', error.message || error);
	}
}

async function probeWhoami(host, port, timeout) {
	return fetchWhoamiViaFetch(host, port, timeout);
}

/**
 * scanWhoAmI
 * opts:
 * - ports: number[]
 * - timeout: ms
 * - concurrency: number
 * - localIps: string[] (if provided, will be used to build /24 ranges)
 * - networkRanges: string[] like ['192.168.1.0/24'] to directly use ranges
 * - onResult: callback invoked for each found device
 * - shouldCancel: function that returns true to abort
 */
async function scanWhoAmI(opts = {}) {
	const ports = opts.ports || defaultPorts;
	const timeout = typeof opts.timeout === 'number' ? opts.timeout : 10_000;
	const concurrency = opts.concurrency || 100;
	const onResult = typeof opts.onResult === 'function' ? opts.onResult : null;
	const shouldCancel = typeof opts.shouldCancel === 'function' ? opts.shouldCancel : () => false;

	let ranges = opts.networkRanges ? [...opts.networkRanges] : [];
	if (opts.localIps && opts.localIps.length) {
		for (const ip of opts.localIps) ranges.push(`${ip}/24`);
	} else {
		const detected = await detectLocalIps();
		console.log('My IP:', detected);
		for (const ip of detected) ranges.push(`${ip}/24`);
	}

	if (!ranges.length)
		throw new Error(
			'No network ranges or local IPs found — pass `localIps` or install react-native-network-info'
		);

	const tasks = [];
	const seen = new Set();
	for (const range of ranges) {
		const hosts = enumerateHostsFromRange(range);
		for (const host of hosts) {
			if (seen.has(host)) continue;
			seen.add(host);
			for (const port of ports) tasks.push({ host, port });
		}
	}

	const results = [];
	let idx = 0;

	async function worker() {
		while (true) {
			if (shouldCancel()) return;
			const i = idx++;
			if (i >= tasks.length) return;
			const { host, port } = tasks[i];
			try {
				const res = await probeWhoami(host, port, timeout);
				console.log(`Probed ${host}:${port} -> ${res.ok ? 'OK' : 'no response'}`);
				if (res && res.ok && res.json) {
					const info = res.json;
					if (info && (info.id || info.name || info.schema)) {
						const record = { host, port, info };
						results.push(record);
						if (onResult) onResult(record);
					}
				}
			} catch (e) {
				// ignore
			}
		}
	}

	const workers = [];
	const spawn = Math.min(concurrency, Math.max(1, tasks.length));
	for (let w = 0; w < spawn; w++) workers.push(worker());
	await Promise.all(workers);
	return results;
}

// React hook for use in RN components
function useWhoAmIScanner(baseOpts = {}) {
	// require react lazily so file can be required in Node too
	// eslint-disable-next-line global-require
	const React = require('react');
	const [scanning, setScanning] = React.useState(false);
	const [results, setResults] = React.useState([]);
	const [error, setError] = React.useState(null);
	const cancelRef = React.useRef(false);

	const start = React.useCallback(
		async (override = {}) => {
			setScanning(true);
			setResults([]);
			setError(null);
			cancelRef.current = false;
			try {
				const found = await scanWhoAmI({
					...baseOpts,
					...override,
					onResult: (r) =>
						setResults((s) => {
							console.log('Found device:', r);
							// avoid duplicates by host:port
							const key = `${r.host}:${r.port}`;
							if (s.some((x) => `${x.host}:${x.port}` === key)) return s;
							return [...s, r];
						}),
					shouldCancel: () => cancelRef.current,
				});
				// final set (in case onResult not provided)
				setResults((s) => {
					if (s.length) return s;
					return found;
				});
			} catch (e) {
				setError(e);
			} finally {
				setScanning(false);
			}
		},
		[baseOpts]
	);

	const stop = React.useCallback(() => {
		cancelRef.current = true;
		setScanning(false);
	}, []);

	return { scanning, results, error, start, stop };
}

module.exports = { scanWhoAmI, useWhoAmIScanner };

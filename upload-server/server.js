const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
// ensure uploads directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, UPLOAD_DIR),
	filename: (req, file, cb) => {
		const safeName = file.originalname.replace(/[^a-z0-9.\-\_\.]/gi, '_');
		cb(null, safeName);
	},
});

const upload = multer({ storage });

// create HTTP server and WebSocket server so they share the same port
const server = http.createServer(app);

// map uploadId -> progress info for polling
const progressStore = new Map();

// Middleware to stream-count bytes and emit progress for a given uploadId
function progressMiddleware(req, res, next) {
	console.log('progresMiddleware');
	const uploadId = req.query.uploadId || req.headers['x-upload-id'];
	if (!uploadId) return next();

	const total = parseInt(req.headers['content-length'] || '0', 10) || 0;
	let received = 0;

	function onData(chunk) {
		received += chunk.length;
		// also persist progress for polling clients
		progressStore.set(uploadId, {
			received,
			total,
			percent: total ? Math.round((received / total) * 100) : null,
		});
	}

	function cleanup() {
		req.removeListener('data', onData);
		req.removeListener('close', cleanup);
		req.removeListener('end', cleanup);
	}

	req.on('data', onData);
	req.on('end', () => {
		// mark complete in store and schedule cleanup
		// progressStore.set(uploadId, { received, total, percent: 100, done: true });
		setTimeout(() => progressStore.delete(uploadId), 30 * 1000);
		cleanup();
	});
	req.on('close', cleanup);

	next();
}

app.get('/whoami', (req, res) => {
	res.json({
		schema: 'com.yourapp.device.whoami.v1',
		id: DEVICE_ID,
		name: DEVICE_NAME,
		type: 'ftp-server',
		platform: 'linux',
		ip: req.socket.localAddress,
		port: 8080,
		services: [{ name: 'ftp', port: 21 }],
		uptime: process.uptime(),
	});
});

// POST /upload - accepts multipart form with field 'file' and saves into uploads/
app.post('/upload', progressMiddleware, upload.single('file'), (req, res) => {
	console.log('Received upload request');
	// other form fields (host, port, user, password, remotePath) are accepted but ignored
	if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

	const savedName = req.file.filename;
	const originalName = req.file.originalname;
	const size = req.file.size;

	// If client provided uploadId, send final info over ws as well
	const uploadId = req.query.uploadId || req.headers['x-upload-id'];

	// also set final info in progress store for polling clients
	if (uploadId) {
		progressStore.set(uploadId, {
			received: size,
			total: size,
			percent: 100,
			done: true,
			filename: savedName,
			path: `/uploads/${savedName}`,
		});
		setTimeout(() => progressStore.delete(uploadId), 30 * 1000);
	}

	console.log({
		ok: true,
		filename: originalName,
		originalname: originalName,
		size,
		path: `/uploads/${savedName}`,
	});
	res.json({
		ok: true,
		filename: originalName,
		originalname: originalName,
		size,
		path: `/uploads/${savedName}`,
	});
});

// Polling endpoint: GET /progress?uploadId=...
app.get('/progress', (req, res) => {
	const uploadId = req.query.uploadId;
	if (!uploadId) return res.status(400).json({ error: 'uploadId required' });

	const info = progressStore.get(uploadId);
	if (!info) return res.status(404).json({ error: 'not found' });

	res.json(info);
});

// serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Upload server listening on ${PORT}`));

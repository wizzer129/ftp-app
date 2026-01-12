const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.post('/upload', upload.single('file'), async (req, res) => {
	const { host, port, user, password, remotePath } = req.body;
	if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

	const localPath = req.file.path;
	const remoteFilename = req.file.originalname;

	const client = new ftp.Client();
	client.ftp.verbose = true;

	try {
		await client.access({
			host,
			port: port ? parseInt(port, 10) : 21,
			user,
			password,
		});

		if (remotePath) {
			await client.ensureDir(remotePath);
			await client.cd(remotePath);
		}

		await client.uploadFrom(localPath, remoteFilename);

		res.json({ ok: true, filename: remoteFilename });
	} catch (err) {
		console.error('FTP upload error:', err);
		res.status(500).json({ error: 'FTP upload failed', details: err.message });
	} finally {
		client.close();
		// remove local uploaded file
		fs.unlink(localPath, () => {});
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FTP proxy server listening on ${PORT}`));

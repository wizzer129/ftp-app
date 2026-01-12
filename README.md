# FTP App

This workspace contains a React Native (Expo) app and a small Node Express FTP proxy server.

-   The Expo app is the UI that runs on your device or emulator and lets you select a file and provide FTP credentials.
-   The `ftp-proxy` server accepts a multipart upload from the app and uses `basic-ftp` to connect to a remote FTP server and upload the file.

## Running the app

1. Install dependencies for the app:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm run start
```

## Running the proxy server

1. Install proxy dependencies:

```bash
cd ftp-proxy
npm install
```

2. Start the proxy server:

```bash
npm run start
```

The proxy listens on port `4000` by default. If you're testing on an Android emulator, the app uses `http://10.0.2.2:4000/upload` to reach the host machine. On iOS simulator, use `http://localhost:4000/upload`.

## Notes & Security

-   This proxy accepts FTP credentials in the request body and will connect to the FTP server on your behalf — avoid using it in production without adding TLS (HTTPS) and authentication.
-   For production, consider uploading directly to the FTP server from a trusted backend over a secure channel.

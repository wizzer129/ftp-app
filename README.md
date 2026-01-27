# File Upload App

This workspace contains a React Native (Expo) app and a Node Express HTTP upload server.

-   The Expo app is the UI that runs on your device or emulator and lets you select a file.
-   The upload server accepts a multipart upload via POST request from the app and saves the file to the server.

## Running the app

1. Install dependencies for the app:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm run start
```

## Running the upload server

1. Install server dependencies:

```bash
cd upload-server
npm install
```

2. Start the upload server:

```bash
npm run start
```

The server listens on port `4000` by default. If you're testing on an Android emulator, the app uses `http://10.0.2.2:4000/upload` to reach the host machine.

## Notes & Security

-   This server accepts file uploads via HTTP POST requests — for production use, add TLS (HTTPS) and authentication.
-   Consider implementing file size limits, file type validation, and virus scanning for production environments.

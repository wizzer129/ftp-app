# mDNS Device Advertiser

This service advertises your device on the local network using mDNS (Multicast DNS / Zeroconf / Bonjour), making it discoverable by the FTP mobile app.

## Installation

```bash
cd upload-server
npm install
```

## Prerequisites

**No native dependencies required!** This implementation uses the pure JavaScript `multicast-dns` package, which works out-of-the-box on all platforms without requiring Avahi or Bonjour.

The service will work immediately after running `npm install`.

## Usage

### Basic Usage

```bash
npm run advertise
```

This will advertise your device with default settings:

-   Service Name: "Pump Device 001"
-   Port: 3001
-   Model: "PumpX1000"

### Custom Configuration

Use environment variables to customize the advertisement:

```bash
# Set custom device name and port
DEVICE_NAME="My Pump 123" SERVICE_PORT=8080 npm run advertise

# Full customization
DEVICE_NAME="Production Pump 5" \
SERVICE_PORT=3001 \
DEVICE_MODEL="PumpPro2000" \
DEVICE_VERSION="2.1.0" \
npm run advertise
```

### Environment Variables

| Variable         | Default           | Description                  |
| ---------------- | ----------------- | ---------------------------- |
| `DEVICE_NAME`    | "Pump Device 001" | Friendly name shown in app   |
| `SERVICE_PORT`   | 3001              | Port where your service runs |
| `DEVICE_MODEL`   | "PumpX1000"       | Device model identifier      |
| `DEVICE_VERSION` | "1.0.0"           | Firmware/software version    |

## Running on a Device

### Raspberry Pi / Linux Device

1. Copy the `upload-server` folder to your device
2. Install dependencies: `npm install`
3. Create a systemd service for auto-start:

```bash
sudo nano /etc/systemd/system/device-advertiser.service
```

```ini
[Unit]
Description=mDNS Device Advertiser
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/upload-server
Environment="DEVICE_NAME=Pump 001"
Environment="SERVICE_PORT=3001"
ExecStart=/usr/bin/node mdns-advertiser.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable device-advertiser
sudo systemctl start device-advertiser
```

### Development Machine

For testing, just run:

```bash
npm run advertise
```

## Verifying Advertisement

### On Linux

```bash
avahi-browse -rt _device._tcp
```

### On macOS

```bash
dns-sd -B _device._tcp
```

### On Windows

Use [Bonjour Browser](http://www.tildesoft.com/)

### From Your Mobile App

The FTP app will automatically discover advertised devices when you call:

```javascript
import { startScanning } from './services/ScanDevices';

startScanning((devices) => {
	console.log('Discovered devices:', devices);
});
```

## Troubleshooting

### Device not showing up in app

1. Ensure both device and phone are on the same network
2. Check firewall isn't blocking mDNS (UDP port 5353)
3. Verify the advertiser is running: check console output
4. Try discovery tools (avahi-browse, dns-sd) to confirm advertisement

### Port already in use

Change the port: `SERVICE_PORT=3002 npm run advertise`

## Technical Details

-   **Service Type**: `_device._tcp.local` (customizable in code)
-   **Protocol**: mDNS (Multicast DNS)
-   **Port**: UDP 5353
-   **Implementation**: Pure JavaScript (no native dependencies)
-   **TXT Records**: Includes model, version, manufacturer, capabilities

## Integration with Upload Server

You can run both the upload server and mDNS advertiser together:

```bash
# Terminal 1: Start upload server
npm start

# Terminal 2: Start mDNS advertiser
npm run advertise
```

Or integrate them in the same process by importing in `server.js`:

```javascript
const { startAdvertising } = require('./mdns-advertiser');

// After server starts
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	startAdvertising();
});
```

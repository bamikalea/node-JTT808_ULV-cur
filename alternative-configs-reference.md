# Alternative Configurations Reference

This document provides a quick reference for the alternative configurations implemented from `advanced-troubleshooting.md`.

## 🚀 Quick Start

Run the test script to try all alternative configurations:

```bash
node test-alternative-configs.js [TERMINAL_ID]
```

## 📋 Available Configurations

### 1. Parameter Configuration

Set device parameters to enable video streaming:

```bash
curl -X POST http://localhost:3000/api/terminal/set-params \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "parameters": {
      "0x0070": 1,    // Enable video upload
      "0x0064": 2,    // Set 720P resolution
      "0x0065": 5     // Set medium quality
    }
  }'
```

### 2. Alternative Streaming Ports

#### UDP Port 1935 (Alternative)

```bash
curl -X POST http://localhost:3000/api/streaming/udp-alternative \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "port": 1935
  }'
```

#### TCP Streaming

```bash
curl -X POST http://localhost:3000/api/streaming/tcp \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "port": 1936
  }'
```

### 3. Device Reset/Restart

Send device restart command:

```bash
curl -X POST http://localhost:3000/api/terminal/restart \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

### 4. Firmware Update Check

Query device version and capabilities:

```bash
curl -X POST http://localhost:3000/api/terminal/version \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

### 5. JT1078 Protocol Streaming

Try JT1078 protocol for live video:

```bash
curl -X POST http://localhost:3000/api/streaming/jt1078 \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "channelId": 1,
    "dataType": 0
  }'
```

### 6. Hardware Verification

Check device hardware capabilities:

```bash
curl -X POST http://localhost:3000/api/terminal/verify-hardware \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

## 📊 Status Monitoring

Check streaming status and alternative server status:

```bash
curl http://localhost:3000/api/streaming/status/628076842334
```

## 🔧 Protocol Details

### JT808 Message Types Added

| Message ID | Direction         | Description                   |
| ---------- | ----------------- | ----------------------------- |
| 0x8103     | Platform → Device | Set terminal parameters       |
| 0x0104     | Device → Platform | Parameter setting response    |
| 0x8105     | Platform → Device | Terminal control (restart)    |
| 0x8107     | Platform → Device | Query terminal attributes     |
| 0x8108     | Platform → Device | Query hardware capabilities   |
| 0x9101     | Platform → Device | JT1078 live video request     |
| 0x1101     | Device → Platform | JT1078 live video response    |
| 0x9102     | Platform → Device | Alternative streaming request |
| 0x9104     | Platform → Device | TCP streaming request         |

### Alternative Port Configurations

| Protocol | Default Port | Alternative Port | Usage                     |
| -------- | ------------ | ---------------- | ------------------------- |
| UDP      | 8000         | 1935             | Alternative UDP streaming |
| TCP      | N/A          | 1936             | TCP streaming             |
| JT1078   | N/A          | 1935             | JT1078 protocol streaming |

## 🐛 Troubleshooting

### Common Issues

1. **Device not responding to parameter changes**

   - Verify device supports the parameter IDs
   - Check if device requires restart after parameter changes
   - Try different parameter values

2. **No streaming data on alternative ports**

   - Verify device supports alternative protocols
   - Check firewall settings
   - Monitor server logs for connection attempts

3. **JT1078 protocol not working**
   - Confirm device supports JT1078
   - Check if device requires specific configuration
   - Try different channel IDs or data types

### Diagnostic Commands

Check terminal connection:

```bash
curl http://localhost:3000/api/terminals/628076842334
```

View all connected terminals:

```bash
curl http://localhost:3000/api/terminals
```

Check server status:

```bash
curl http://localhost:3000/status
```

## 📝 Implementation Notes

### Server-Side Changes

1. **JT808Server Class**: Added alternative configuration methods

   - `setVideoStreamingParameters()`
   - `requestJT1078LiveVideo()`
   - `startAlternativeUDPStreaming()`
   - `startTCPStreaming()`
   - `verifyDeviceHardware()`

2. **HTTP API Server**: Added new endpoints for alternative configurations

   - `/api/terminal/set-params`
   - `/api/terminal/restart`
   - `/api/terminal/version`
   - `/api/streaming/jt1078`
   - `/api/streaming/udp-alternative`
   - `/api/streaming/tcp`
   - `/api/terminal/verify-hardware`
   - `/api/streaming/status/:terminalId`

3. **Message Handlers**: Added handlers for new message types
   - `handleJT1078LiveVideoRequest()`
   - `handleJT1078LiveVideoResponse()`
   - `handleParameterSettingResponse()`

### Device Requirements

For full compatibility, devices should support:

- JT808 protocol (basic requirement)
- Parameter setting (0x8103/0x0104)
- Terminal control (0x8105)
- JT1078 protocol (optional, for advanced streaming)
- Multiple streaming protocols (UDP/TCP)
- Hardware capability reporting

## 🔄 Testing Workflow

1. **Initial Setup**

   - Ensure device is connected and authenticated
   - Check baseline functionality

2. **Parameter Configuration**

   - Set video streaming parameters
   - Verify device acknowledges changes

3. **Alternative Streaming**

   - Try different ports and protocols
   - Monitor for streaming data

4. **Device Management**

   - Test restart functionality
   - Query version and capabilities

5. **Advanced Features**

   - Test JT1078 protocol
   - Verify hardware capabilities

6. **Status Monitoring**
   - Check streaming status
   - Monitor server logs for responses

## 📚 References

- `advanced-troubleshooting.md` - Original troubleshooting guide
- `test-alternative-configs.js` - Automated test script
- JT808 Protocol Specification
- JT1078 Protocol Specification (for video streaming)

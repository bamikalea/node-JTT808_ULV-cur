# 🚀 JT808 HTTP API - Platform Control Guide

## 📋 **Overview**

The JT808 server now includes a comprehensive HTTP API that allows platforms to control terminals and trigger media uploads using simple REST endpoints.

## 🌐 **API Endpoints**

### **1. Health & Status**

```bash
# Health check
curl http://localhost:3000/health

# Server status
curl http://localhost:3000/status

# List connected terminals
curl http://localhost:3000/api/terminals
```

### **2. Terminal Management**

```bash
# Get specific terminal info
curl http://localhost:3000/api/terminals/628076842334

# Get terminal multimedia
curl http://localhost:3000/api/multimedia/terminal/628076842334
```

### **3. Platform-Triggered Media Uploads** ⭐

#### **Trigger Media Capture**

```bash
curl -X POST http://localhost:3000/api/multimedia/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "action": "capture_image",
    "channelId": 1,
    "multimediaDataId": 12345
  }'
```

#### **Request Specific Media Type**

```bash
curl -X POST http://localhost:3000/api/multimedia/request \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "type": "image",
    "format": "jpeg",
    "event": "platform_instruction"
  }'
```

#### **Send Platform Response (0x8800)**

```bash
curl -X POST http://localhost:3000/api/multimedia/response \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "multimediaDataId": 12345,
    "action": "retransmit",
    "packetIds": [1, 3, 5]
  }'
```

### **4. Media Monitoring**

```bash
# Get recent uploads
curl "http://localhost:3000/api/multimedia/uploads?limit=50"

# Get terminal-specific media
curl "http://localhost:3000/api/multimedia/terminal/628076842334?limit=20"
```

### **5. 🖼️ Photo Capture (NEW)** ⭐

#### **Trigger Immediate Photo Capture**

```bash
curl -X POST "http://localhost:3000/api/photo/capture" \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "channelId": 1,
    "quality": "high"
  }'
```

**Parameters:**

- `terminalId` (required): The terminal ID to capture from
- `channelId` (optional): Camera channel (default: 1)
- `quality` (optional): Photo quality (default: "high")

**Expected Device Response Flow:**

1. **0x0800** - Multimedia event upload (event coding = 0)
2. **0x8800** - Platform acknowledgment
3. **0x0801** - Multimedia data upload (actual image)
4. **0x8800** - Platform response (success/retransmission)

**Notes:**

- Uses existing 0x0800/0x0801 message system
- Device automatically includes GPS coordinates
- Image saved to `media/images/` directory
- Supports multi-channel capture

## 🔧 **Supported Media Types**

| Type  | Format | Code | Description            |
| ----- | ------ | ---- | ---------------------- |
| Image | JPEG   | 0    | Standard image capture |
| Image | PNG    | 1    | PNG format support     |
| Audio | MP3    | 2    | Audio recording        |
| Video | MP4    | 3    | Video recording        |
| Video | AVI    | 4    | AVI format support     |

## 📱 **Event Types**

| Event                | Code | Description                   |
| -------------------- | ---- | ----------------------------- |
| Platform Instruction | 0    | Triggered by platform command |
| Timing Action        | 1    | Scheduled/automatic capture   |
| Alarm                | 2    | Emergency/alert triggered     |

## 🎯 **Usage Examples**

### **Example 1: Trigger Image Capture**

```bash
# Platform sends command to capture image
curl -X POST http://localhost:3000/api/multimedia/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "action": "capture_image",
    "channelId": 1
  }'

# Response:
{
  "success": true,
  "message": "Media capture triggered for terminal 628076842334",
  "action": "capture_image",
  "channelId": 1,
  "multimediaDataId": 1702644000000
}
```

### **Example 2: Request Video Upload**

```bash
# Platform requests video upload
curl -X POST http://localhost:3000/api/multimedia/request \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "type": "video",
    "format": "mp4",
    "event": "platform_instruction"
  }'

# Response:
{
  "success": true,
  "message": "Multimedia request sent to terminal 628076842334",
  "type": "video",
  "format": "mp4",
  "event": "platform_instruction"
}
```

### **Example 3: Handle Retransmission**

```bash
# Platform requests missing packets
curl -X POST http://localhost:3000/api/multimedia/response \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "multimediaDataId": 12345,
    "action": "retransmit",
    "packetIds": [1, 3, 5]
  }'

# Response:
{
  "success": true,
  "message": "Platform response sent to terminal 628076842334",
  "multimediaDataId": 12345,
  "action": "retransmit",
  "packetIds": [1, 3, 5]
}
```

## 🔍 **Monitoring & Debugging**

### **Check Server Status**

```bash
curl http://localhost:3000/status | jq
```

### **Monitor Terminal Connections**

```bash
curl http://localhost:3000/api/terminals | jq
```

### **View Recent Media Uploads**

```bash
curl "http://localhost:3000/api/multimedia/uploads?limit=10" | jq
```

## ⚠️ **Error Handling**

### **Common Error Responses**

```json
{
  "error": "Terminal not connected"
}
{
  "error": "Terminal not authenticated"
}
{
  "error": "Missing required fields: terminalId, action"
}
{
  "error": "Terminal not found"
}
```

### **HTTP Status Codes**

- `200` - Success
- `400` - Bad Request (missing fields)
- `403` - Forbidden (not authenticated)
- `404` - Not Found (terminal not connected)
- `500` - Internal Server Error

## 📁 **File Upload Protocol Endpoints**

### **POST /api/file-upload/instructions**

Send file upload instructions (0x9206) to terminal for FTP upload.

**Request Body:**

```json
{
  "terminalId": "628076842334",
  "ftpServer": "ftp.example.com",
  "ftpPort": 21,
  "username": "user",
  "password": "pass",
  "uploadPath": "/uploads",
  "channelNumber": 1,
  "startTime": "2025-08-15T08:00:00Z",
  "endTime": "2025-08-15T18:00:00Z",
  "resourceType": 0,
  "streamType": 0,
  "storageLocation": 0,
  "wifiEnabled": true,
  "lanEnabled": true,
  "mobileEnabled": false
}
```

**Parameters:**

- `terminalId`: Target terminal ID
- `ftpServer`: FTP server address
- `ftpPort`: FTP server port (default: 21)
- `username`: FTP username
- `password`: FTP password
- `uploadPath`: File upload path on FTP server
- `channelNumber`: Logical channel number (1-based)
- `startTime`: Start time for file selection
- `endTime`: End time for file selection
- `resourceType`: 0=audio+video, 1=audio, 2=video, 3=video or audio
- `streamType`: 0=main+sub, 1=main, 2=sub
- `storageLocation`: 0=main+backup, 1=main, 2=backup
- `wifiEnabled`: Allow download under WIFI
- `lanEnabled`: Allow download under LAN
- `mobileEnabled`: Allow download under 3G/4G

### **POST /api/file-upload/control**

Control file upload process (0x9207) - pause, continue, or cancel.

**Request Body:**

```json
{
  "terminalId": "628076842334",
  "action": "pause",
  "responseSerial": 123
}
```

**Actions:**

- `pause`: Pause upload process
- `continue`: Resume upload process
- `cancel`: Cancel upload process

**Parameters:**

- `terminalId`: Target terminal ID
- `action`: Control action (pause/continue/cancel)
- `responseSerial`: Response serial number (optional)

## 🎮 **Terminal Control Endpoints**

### **Send Terminal Control Commands (0x8105)**

Send terminal control commands to connected terminals using the ULV protocol's 0x8105 message type.

**Endpoint:** `POST /api/terminal/control`

**Parameters:**

- `terminalId`: Target terminal ID (required)
- `command`: Control command to execute (required)

**Available Commands:**

- `disconnect_oil`: Disconnect the oil supply (0x70)
- `recovery_oil`: Recover the oil supply (0x71)
- `disconnect_circuit`: Disconnect the electrical circuit (0x72)
- `recovery_circuit`: Recover the electrical circuit (0x73)
- `restart_device`: Restart the terminal device (0x74)

**Example Commands:**

#### **1. Disconnect Oil Supply**

```bash
curl -X POST http://localhost:3000/api/terminal/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "command": "disconnect_oil"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Terminal control command 'disconnect_oil' sent to terminal 628076842334",
  "command": "disconnect_oil",
  "terminalId": "628076842334",
  "timestamp": "2025-08-15T11:50:00.000Z"
}
```

#### **2. Recover Oil Supply**

```bash
curl -X POST http://localhost:3000/api/terminal/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "command": "recovery_oil"
  }'
```

#### **3. Disconnect Electrical Circuit**

```bash
curl -X POST http://localhost:3000/api/terminal/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "command": "disconnect_circuit"
  }'
```

#### **4. Recover Electrical Circuit**

```bash
curl -X POST http://localhost:3000/api/terminal/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "command": "recovery_circuit"
  }'
```

#### **5. Restart Device**

```bash
curl -X POST http://localhost:3000/api/terminal/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "command": "restart_device"
  }'
```

### **File Upload Instructions (0x9206)**

Send file upload instructions to terminals for FTP-based file transfers.

**Endpoint:** `POST /api/terminal/file-upload`

**Parameters:**

- `terminalId`: Target terminal ID (required)
- `serverAddress`: FTP server address (required)
- `port`: FTP server port (required)
- `username`: FTP username (optional)
- `password`: FTP password (optional)
- `uploadPath`: File upload path (optional)
- `channelId`: Logical channel number (optional, default: 1)
- `startTime`: Start time for file selection (optional)
- `endTime`: End time for file selection (optional)

**Example:**

```bash
curl -X POST http://localhost:3000/api/terminal/file-upload \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "serverAddress": "ftp.example.com",
    "port": 21,
    "username": "user",
    "password": "pass",
    "uploadPath": "/uploads",
    "channelId": 1,
    "startTime": "2025-08-15T10:00:00.000Z",
    "endTime": "2025-08-15T11:00:00.000Z"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "File upload instructions sent to terminal 628076842334",
  "terminalId": "628076842334",
  "serverAddress": "ftp.example.com",
  "port": 21,
  "channelId": 1,
  "timestamp": "2025-08-15T11:50:00.000Z"
}
```

## 🔧 **Testing All Terminal Control Commands**

### **Test Script for All Commands**

```bash
#!/bin/bash

TERMINAL_ID="628076842334"
BASE_URL="http://localhost:3000"

echo "🧪 Testing all terminal control commands for terminal $TERMINAL_ID"
echo "================================================================"

# Test disconnect oil
echo "1. Testing disconnect_oil..."
curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"disconnect_oil\"}" | jq '.'

echo -e "\n2. Testing recovery_oil..."
curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"recovery_oil\"}" | jq '.'

echo -e "\n3. Testing disconnect_circuit..."
curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"disconnect_circuit\"}" | jq '.'

echo -e "\n4. Testing recovery_circuit..."
curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"recovery_circuit\"}" | jq '.'

echo -e "\n5. Testing restart_device..."
curl -s -X POST "$BASE_URL/api/terminal/control" \
  -H "Content-Type: application/json" \
  -d "{\"terminalId\": \"$TERMINAL_ID\", \"command\": \"restart_device\"}" | jq '.'

echo -e "\n✅ All terminal control commands tested!"
```

### **Individual Command Testing**

#### **Test Oil Control**

```bash
# Disconnect oil
curl -X POST http://localhost:3000/api/terminal/control \
  -d '{"terminalId": "628076842334", "command": "disconnect_oil"}'

# Wait a moment, then recover oil
sleep 5
curl -X POST http://localhost:3000/api/terminal/control \
  -d '{"terminalId": "628076842334", "command": "recovery_oil"}'
```

#### **Test Circuit Control**

```bash
# Disconnect circuit
curl -X POST http://localhost:3000/api/terminal/control \
  -d '{"terminalId": "628076842334", "command": "disconnect_circuit"}'

# Wait a moment, then recover circuit
sleep 5
curl -X POST http://localhost:3000/api/terminal/control \
  -d '{"terminalId": "628076842334", "command": "recovery_circuit"}'
```

#### **Test Device Restart**

```bash
# Restart device (use with caution!)
curl -X POST http://localhost:3000/api/terminal/control \
  -d '{"terminalId": "628076842334", "command": "restart_device"}'
```

## 📋 **Command Reference Table**

| Command              | ULV Code | Description                   | Use Case                         |
| -------------------- | -------- | ----------------------------- | -------------------------------- |
| `disconnect_oil`     | 0x70     | Disconnect oil supply         | Emergency fuel cutoff            |
| `recovery_oil`       | 0x71     | Recover oil supply            | Restore fuel after emergency     |
| `disconnect_circuit` | 0x72     | Disconnect electrical circuit | Emergency power cutoff           |
| `recovery_circuit`   | 0x73     | Recover electrical circuit    | Restore power after emergency    |
| `restart_device`     | 0x74     | Restart terminal device       | System recovery, troubleshooting |

## ⚠️ **Important Notes**

1. **Safety First**: Oil and circuit disconnect commands are for emergency situations
2. **Device Restart**: Use restart command carefully as it will disconnect the terminal temporarily
3. **Response Monitoring**: Monitor server logs to see device responses to commands
4. **Connection Status**: Commands only work on connected and authenticated terminals
5. **Protocol Compliance**: All commands follow the ULV protocol specification (Section 3.20)

## 🔍 **Monitoring Command Responses**

After sending a command, monitor the server logs to see the device's response:

```bash
# Monitor logs for terminal control responses
tail -f logs/combined.log | grep -E "(0x8105|Terminal Control|Command sent)"
```

## 🚀 **Getting Started**

### **1. Start the Server**

```bash
npm start
```

### **2. Verify HTTP API is Running**

```bash
curl http://localhost:3000/health
```

### **3. Connect a Terminal**

- Use the terminal simulator: `node test-terminal-simulator.js`
- Or connect a real JT808 device

### **4. Test Platform Control**

```bash
# Trigger media capture
curl -X POST http://localhost:3000/api/multimedia/trigger \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334", "action": "capture_image"}'
```

## 📊 **API Response Format**

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Description of action",
  "data": { ... }
}
```

Error responses:

```json
{
  "error": "Error description"
}
```

## 🔐 **Security Notes**

- Terminals must be authenticated before platform control
- Only connected and registered terminals can receive commands
- All API endpoints validate terminal status before processing

## 📝 **Protocol Compliance**

The HTTP API translates platform commands into proper JT808 protocol messages:

### **Multimedia Protocol**

- **0x8800**: Platform response/instruction messages
- **0x0800**: Multimedia event upload (triggered by platform)
- **0x0801**: Multimedia data upload (actual media content)

### **File Upload Protocol** ⭐ **NEW**

- **0x9206**: File upload instructions (platform → terminal)
- **0x1206**: File upload completion notice (terminal → platform)
- **0x9207**: File upload control (platform → terminal)

### **Terminal Control Protocol** ⭐ **NEW**

- **0x8105**: Terminal control commands (platform → terminal)

This ensures full compliance with the JT808 protocol specification while providing a modern REST API interface for platform control. The new endpoints implement the complete file upload workflow and terminal control capabilities as specified in the ULV protocol documentation.

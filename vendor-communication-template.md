# Vendor Communication Template for ULV Streaming Issues

## Device Information

- **Device Model**: N51
- **Firmware Version**: [Insert firmware version]
- **Terminal ID**: 628076842334
- **Protocol Version**: ULV Network Protocol V2.0.0-2019

## Issue Description

Device successfully acknowledges ULV streaming requests (0x9101) with SUCCESS response (0x0001, result=0x00) but does not establish RTP connection or send video data to the specified server.

## Technical Details

### ✅ What's Working:

1. **JT808 Connection**: Device maintains stable connection to server
2. **Message Handling**: Device correctly receives and parses 0x9101 messages
3. **Protocol Compliance**: Device sends proper 0x0001 response with result=0x00
4. **Network Connectivity**: Device can reach server IP (192.168.100.100)

### ❌ What's Not Working:

1. **RTP Connection**: No UDP connection established to port 8000
2. **Video Data**: No RTP packets received with frame header 0x30316364
3. **Streaming**: No video stream initiated after successful handshake

### 📋 Streaming Request Details:

```
Message ID: 0x9101 (Real-time audio/video preview request)
Server IP: 192.168.100.100
TCP Port: 1935
UDP Port: 8000
Channel: 1
Data Type: 0 (Audio+Video)
Stream Type: 0 (Main stream)
```

### 📊 Device Response:

```
Message ID: 0x0001 (General response)
Reply ID: 0x9101
Result: 0x00 (SUCCESS)
```

## Questions for Vendor (You)

### 1. Device Capabilities

- Does this device model support ULV video streaming (Section 3.11-3.13)?
- What firmware version is required for streaming functionality?
- Are there any hardware requirements (camera, video encoder)?

### 2. Configuration Requirements

- Are there specific terminal parameters that must be set for streaming?
- Does the device require additional configuration commands?
- Are there any prerequisites before streaming can be enabled?

### 3. Network Requirements

- What network protocols does the device use for RTP transmission?
- Does the device support the custom RTP format (Table 3.13.1)?
- Are there any firewall or routing considerations?

### 4. Debugging Information

- How can we enable debug logging on the device?
- Are there device status indicators for streaming functionality?
- What diagnostic commands are available?

### 5. Expected Behavior

- How long should we wait after 0x9101 acknowledgment before RTP starts?
- Should we see any intermediate messages or status updates?
- What is the expected RTP packet format and frequency?

## Test Environment

- **Server OS**: macOS
- **Network**: 192.168.100.0/24
- **JT808 Server**: Custom implementation (Node.js)
- **RTP Server**: Custom UDP server listening on port 8000
- **Protocol Reference**: ULV network protocol_V2.0.0-2019-20240924.pdf

## Logs Available

- JT808 message logs showing successful handshake
- Network traffic captures
- RTP server monitoring logs
- Device connection status logs

## Request

Please provide:

1. Confirmation that this device model supports ULV streaming
2. Required configuration steps or parameters
3. Expected timeline for RTP connection establishment
4. Debugging procedures or diagnostic commands
5. Sample working configuration or reference implementation

## Contact Information

- **Technical Contact**: [Your name and email]
- **Project**: ULV JT808 Streaming Implementation
- **Urgency**: High - Production deployment pending

---

**Note**: We have successfully implemented the ULV protocol according to the specification and can demonstrate proper message exchange. The issue appears to be device-specific configuration or capability related.

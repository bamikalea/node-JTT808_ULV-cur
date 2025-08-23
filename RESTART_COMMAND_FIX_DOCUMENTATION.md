# Device Restart Command - Working Implementation Documentation

## Overview
This document details the successful implementation of the device restart command (0x8105) that causes physical device restarts consistently.

## Issue Analysis
The restart command was initially failing to cause physical device restarts due to incorrect header format implementation.

### Root Cause
- **Problem**: Changed from JT808-2019 header format (15 bytes) to ULV Protocol header format (17 bytes)
- **Device Expectation**: This specific device expects JT808-2019 compatible header format
- **Solution**: Reverted to JT808-2019 header format while maintaining ULV protocol command structure

## Working Implementation

### Header Format (CRITICAL)
```javascript
// Build header (15 bytes total for JT808-2019) - WORKING FORMAT
const header = Buffer.concat([
  messageIdBuffer,    // 2 bytes - Message ID
  properties,         // 2 bytes - Properties (Version ID bit 14 = 1, body length)
  protocolVersion,    // 1 byte - Protocol version (1)
  bcdPhone,          // 6 bytes - Terminal phone number (BCD format)
  messageSerialNumber // 2 bytes - Message serial number
]);
```

### Command Structure
- **Message ID**: `0x8105` (Terminal Control)
- **Command Word**: `0x74` (Restart device)
- **Body**: 1 byte containing command word
- **Protocol**: JT808-2019 compatible header + ULV command structure

### Key Code Changes

#### File: `src/jt808-server.js`
```javascript
// Terminal phone number in BCD format (6 bytes) - REVERTED TO WORKING FORMAT
const bcdPhone = Buffer.alloc(6);
if (connection.terminalId) {
  // Convert terminal ID to BCD format
  const phoneNumber = connection.terminalId.padStart(12, "0");
  for (let i = 0; i < 6; i++) {
    const digit1 = parseInt(phoneNumber[i * 2], 10);
    const digit2 = parseInt(phoneNumber[i * 2 + 1], 10);
    bcdPhone[i] = (digit1 << 4) | digit2;
  }
}
```

## Test Results

### Successful Test Cases
1. **Test 1**: Restart in 53 seconds ✅
2. **Test 2**: Restart in 48 seconds ✅  
3. **Test 3**: Restart in 50 seconds ✅

### Evidence of Physical Restart
- Connection drop from old socket
- New connection establishment
- Complete re-registration process
- Re-authentication sequence
- Resume normal operation

### Timeline Pattern
```
Command Sent → ~50 seconds → Connection Drop → New Connection → Re-auth → Operational
```

## Command Usage

### API Endpoint
```bash
curl -X POST http://localhost:3000/api/terminal/restart \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

### Expected Response
```json
{
  "success": true,
  "message": "Restart command sent to terminal 628076842334",
  "note": "Terminal will disconnect and reconnect after restart"
}
```

## Device Behavior
- Device acknowledges command with "Terminal Control Response - Processed"
- Physical restart occurs ~50 seconds after command
- Device reconnects and goes through full authentication
- Normal operation resumes

## Important Notes
1. **Header Format Critical**: Must use 15-byte JT808-2019 header, not 17-byte ULV header
2. **Device Compatibility**: This device expects JT808-2019 format despite ULV protocol usage
3. **Restart Timing**: Consistent ~50 second restart duration
4. **Command Acknowledgment**: Device always acknowledges before restarting

## Status
✅ **WORKING PERFECTLY** - Causes consistent physical device restarts

---
*Last Updated: 2025-08-23*
*Device: Terminal ID 628076842334*
*Protocol: JT808-2019 compatible header + ULV command structure*
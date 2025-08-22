# JT808 Server Demo

The JT808 server is now working correctly! Here's how to test it with simple commands.

## Test the Server

### 1. Check if server is running

```bash
nc -z 127.0.0.1 8080
```

### 2. Test Terminal Registration (Message ID: 0x0001)

```bash
echo -n -e '\x7e\x00\x01\x00\x04\x00\x01\x00\xbc\x61\x4e\x00\xbc\x61\x4e\x04\x7e' | nc 127.0.0.1 8080
```

**Expected Response**: Server should log "Terminal 12345678 registered successfully"

### 3. Test Terminal Heartbeat (Message ID: 0x0004)

```bash
echo -n -e '\x7e\x00\x04\x00\x00\x00\x02\x00\xbc\x61\x4e\x95\x7e' | nc 127.0.0.1 8080
```

**Expected Response**: Server should log "Received message: 4" (heartbeat)

### 4. Test Location Report (Message ID: 0x0200)

```bash
echo -n -e '\x7e\x02\x00\x00\x1c\x00\x03\x00\xbc\x61\x4e\x00\x00\x00\x00\x00\x00\x00\x00\x02\x6d\x3a\x60\xfb\x96\xc2\x10\x00\x64\x00\x2d\x00\x00\x68\x9e\x1c\x1d\x00\x00\xba\x7e' | nc 127.0.0.1 8080
```

**Expected Response**: Server should log "Received message: 200" (location report)

## Message Format

Each JT808 message follows this structure:

```
[0x7E] [Header 10 bytes] [Body] [Checksum] [0x7E]
```

**Header (10 bytes)**:

- Bytes 0-1: Message ID (2 bytes, big-endian)
- Bytes 2-3: Message Length (2 bytes, big-endian)
- Bytes 4-5: Serial Number (2 bytes, big-endian)
- Bytes 6-9: Terminal ID (4 bytes, big-endian)

**Body**: Variable length message content
**Checksum**: XOR checksum of header + body

## Server Logs

Check server logs to see message processing:

```bash
tail -f logs/combined.log
```

## Supported Message Types

- **0x0001**: Terminal Registration
- **0x0002**: Terminal Registration Response
- **0x0003**: Terminal Logout
- **0x0004**: Terminal Heartbeat
- **0x0200**: Location Report
- **0x0201**: Location Query
- **0x8001**: Platform General Response
- **0x8100**: Terminal Registration Response

## Protocol Compliance

The server now correctly implements the JT808 protocol:

- ✅ Message parsing with start/end markers (0x7E)
- ✅ Header parsing (ID, length, serial, terminal ID)
- ✅ Body extraction
- ✅ Checksum verification
- ✅ Message type handling
- ✅ Authentication flow
- ✅ Response generation


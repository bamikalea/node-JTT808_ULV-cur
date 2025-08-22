# JT808 Server - Vendor Debugging Guide

## 🎯 Purpose

This server is configured for **vendor debugging of multimedia issues** with your JT808 device. It monitors RTP streams and provides detailed logging to help identify multimedia problems.

## 🚀 Quick Start

### 1. Deploy the Server

```bash
./deploy.sh
```

This script will:

- Install dependencies
- Configure the server
- Start RTP monitoring
- Enable detailed logging

### 2. Server Configuration

- **JT808 Server**: Port 8080 (for device connections)
- **HTTP API**: Port 3000 (for monitoring and control)
- **RTP Monitoring**: Enabled (shows streaming data in console)

## 📺 RTP Stream Monitoring

The server automatically monitors RTP streams and logs:

- **Stream Details**: Channel, type, format, data size
- **RTP Analysis**: Version, padding, extension, payload type
- **Data Preview**: First 32 bytes of each stream
- **Error Detection**: Low data volume, connection issues

### Console Output Example

```
🎥 Active RTP Stream: Terminal 628076842334, Event 1
   Channel: 1, Type: 1, Format: 1
   Data Size: 2048 bytes
   Last Data: 10:30:45 AM
   RTP Analysis: v2, p=0, x=0, cc=0, m=0, pt=96
```

## 🔍 Debug Endpoints

### 1. General Debug Info

```bash
curl http://localhost:3000/api/multimedia/debug
```

### 2. Vendor-Specific Debug Info

```bash
curl http://localhost:3000/api/multimedia/debug/vendor
```

This endpoint provides:

- Connection summary
- Multimedia event counts
- Active stream status
- Vendor recommendations

## 🛠️ Testing Commands

### 1. Test Device Connection

```bash
curl http://localhost:3000/status
```

### 2. Test Terminal Commands

```bash
# Restart device
curl -X POST http://localhost:3000/api/terminal/restart \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'

# Start streaming
curl -X POST http://localhost:3000/api/streaming/jt1078 \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334", "channelId": 1, "dataType": 0}'
```

## 📋 What to Monitor

### 1. Connection Status

- Device connects to port 8080
- Authentication successful
- Registration completed

### 2. Multimedia Events

- Event upload (0x0800)
- Data upload (0x0801)
- Platform responses (0x8800)

### 3. RTP Stream Analysis

- Data format validation
- Stream continuity
- Error patterns

## 🔧 Troubleshooting

### Common Issues

1. **No Multimedia Events**

   - Check device multimedia settings
   - Verify ULV protocol support
   - Check event trigger configuration

2. **RTP Data Issues**

   - Monitor console for RTP analysis
   - Check data format compliance
   - Verify stream parameters

3. **Connection Problems**
   - Check network connectivity
   - Verify device IP configuration
   - Check firewall settings

### Debug Commands

```bash
# Check server logs
tail -f logs/combined.log

# Check error logs
tail -f logs/error.log

# Monitor RTP streams in real-time
curl http://localhost:3000/api/multimedia/debug/vendor
```

## 📊 Expected Behavior

### Normal Operation

1. Device connects to port 8080
2. Authentication and registration complete
3. Multimedia events start flowing
4. RTP streams appear in console
5. Debug endpoints show active connections

### Debugging Success

- Console shows RTP stream analysis
- Debug endpoints return connection data
- Logs show multimedia event processing
- Stream data appears in real-time

## 🆘 Getting Help

If you encounter issues:

1. Check console output for RTP analysis
2. Use debug endpoints to verify status
3. Check logs for error details
4. Monitor connection and stream status

## 📝 Notes

- **No Docker/SRS**: Simplified deployment for debugging
- **Console Monitoring**: RTP streams logged directly to console
- **Real-time Analysis**: Streams analyzed every 5 seconds
- **Vendor Focus**: Optimized for multimedia issue debugging

The server will automatically start monitoring RTP streams 10 seconds after startup. Watch the console for detailed streaming information that will help identify multimedia issues.

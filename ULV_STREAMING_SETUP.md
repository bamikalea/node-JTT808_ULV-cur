# 🎥 ULV JT808 Streaming System with SRS

## 📋 Overview

This project implements a **complete ULV JT808 streaming system** that integrates with **SRS (Simple Realtime Server)** for professional-grade media streaming. The system follows the official ULV network protocol specification and provides multiple streaming formats for web/mobile playback.

## 🏗️ Architecture

```
ULV Device → JT808 Server (0x9101) → SRS Media Server → Web/Mobile Clients
     ↓              ↓                    ↓
  0x9103        Streaming          RTMP/HLS/WebRTC
  RTP Data      Commands          Output Streams
```

## ✨ Features

### **🚀 ULV Protocol Compliance**

- **0x9101**: Real-time audio/video preview request
- **0x9102**: Real-time audio/video preview transmission control
- **0x9103**: Audio/video data transmission (RTP format)
- **Protocol**: Follows ULV network protocol V2.0.0 specification

### **🎯 Multiple Streaming Formats**

- **HLS**: HTTP Live Streaming for web browsers
- **HTTP-FLV**: Low-latency streaming
- **WebRTC**: Modern browser support
- **RTMP**: Standard streaming protocol

### **🌐 Web Interface**

- **Real-time Controls**: Start/stop/pause/resume streaming
- **Multi-format Player**: HLS, FLV, and WebRTC support
- **Status Monitoring**: Live streaming statistics
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Installation & Setup

### **Prerequisites**

- Docker and Docker Compose
- Node.js 16+
- ULV JT808 device (for testing)

### **1. Clone and Setup**

```bash
git clone <repository>
cd new-cursor-jt808node
npm install
```

### **2. Start SRS Media Server**

```bash
# Start SRS with Docker
docker-compose up -d

# Verify SRS is running
docker ps | grep srs
```

### **3. Start JT808 Server**

```bash
# Start the JT808 server with ULV streaming support
npm start
```

### **4. Access Web Interface**

Open your browser and navigate to:

- **Web Player**: http://localhost:8080/player.html
- **SRS API**: http://localhost:1985
- **HLS Streams**: http://localhost:8080/ulv/

## 🎮 Usage

### **Starting a Stream**

#### **Via Web Interface**

1. Open http://localhost:8080/player.html
2. Enter your Terminal ID (e.g., `628076842334`)
3. Configure streaming parameters:
   - **Channel**: 1-4 (device channel number)
   - **Data Type**: Audio+Video, Video Only, Intercom, Monitor
   - **Stream Type**: Main Stream or Sub Stream
4. Click "🚀 Start Streaming"

#### **Via API**

```bash
curl -X POST http://localhost:3000/api/ulv/streaming/start \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "serverIP": "192.168.100.100",
    "tcpPort": 1935,
    "udpPort": 8000,
    "channelNumber": 1,
    "dataType": 0,
    "streamType": 0
  }'
```

### **Controlling Streams**

#### **Available Commands**

- **0**: Turn off streaming
- **1**: Switch stream type (main/sub)
- **2**: Pause streaming
- **3**: Resume streaming

#### **Example: Pause Stream**

```bash
curl -X POST http://localhost:3000/api/ulv/streaming/control \
  -H "Content-Type: application/json" \
  -d '{
    "terminalId": "628076842334",
    "sessionId": "ulv_stream_1234567890_abc123",
    "controlCommand": 2
  }'
```

### **Getting Stream Status**

```bash
curl -X GET "http://localhost:3000/api/ulv/streaming/status/628076842334/ulv_stream_1234567890_abc123"
```

## 🧪 Testing

### **Test ULV Streaming Endpoints**

```bash
# Run the comprehensive test script
./test-ulv-streaming-curl.sh
```

### **Test Web Player**

1. Start a streaming session via API
2. Open http://localhost:8080/player.html
3. Enter the session details
4. Verify video playback in all formats

## 🔧 Configuration

### **SRS Configuration**

The `srs.conf` file is pre-configured for ULV streaming:

- **RTP Input**: Port 8000 (ULV device output)
- **RTMP**: Port 1935
- **HLS Output**: Port 8080
- **WebRTC**: Port 8001

### **Network Configuration**

- **SRS Server IP**: 192.168.100.100 (configurable)
- **ULV Device**: Should be on same network
- **Ports**: 8000 (RTP), 1935 (RTMP), 8080 (HTTP), 8001 (WebRTC)

## 📊 API Endpoints

### **ULV Streaming**

- `POST /api/ulv/streaming/start` - Start streaming session
- `POST /api/ulv/streaming/control` - Control streaming (start/stop/pause/resume)
- `GET /api/ulv/streaming/status/:terminalId/:sessionId` - Get stream status

### **Legacy Streaming (0x0900)**

- `POST /api/streaming/start` - Start legacy streaming
- `POST /api/streaming/stop` - Stop legacy streaming
- `GET /api/streaming/status/:terminalId` - Get legacy stream status

## 🚨 Troubleshooting

### **Common Issues**

#### **1. SRS Not Starting**

```bash
# Check Docker logs
docker logs ulv-srs-server

# Verify ports are available
netstat -tulpn | grep :8000
```

#### **2. Device Not Responding**

- Verify device is connected to JT808 server
- Check device supports ULV streaming (0x9101-0x9103)
- Ensure network connectivity between device and SRS

#### **3. Video Not Playing**

- Check SRS logs for RTP input
- Verify stream URLs in web player
- Test with VLC: `vlc http://localhost:8080/ulv/ulv_ch1.m3u8`

### **Debug Mode**

Enable detailed logging in JT808 server:

```bash
# Set log level to debug
export LOG_LEVEL=debug
npm start
```

## 🔗 Integration Examples

### **Web Application**

```javascript
// Start streaming
const response = await fetch("/api/ulv/streaming/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    terminalId: "628076842334",
    channelNumber: 1,
    dataType: 0,
    streamType: 0,
  }),
});

const { sessionId } = await response.json();

// Get HLS stream URL
const hlsUrl = `http://192.168.100.100:8080/ulv/ulv_ch1.m3u8`;
```

### **Mobile App**

- Use HLS.js for web-based apps
- Use native video players for mobile apps
- WebRTC for low-latency requirements

## 📚 Protocol Details

### **ULV Message Types**

- **0x9101**: Platform → Device (streaming request)
- **0x9102**: Platform → Device (streaming control)
- **0x9103**: Device → Platform (RTP data)

### **RTP Format**

ULV uses custom RTP headers with:

- Frame header: 0x30316364
- Timestamp: 64-bit millisecond precision
- Data types: Video I/P/B frames, Audio, Transparent
- Payload: H.264/H.265 video, G.711 audio

## 🚀 Performance Optimization

### **SRS Tuning**

- **HLS Fragment**: 1-2 seconds for low latency
- **Buffer Size**: Adjust based on network conditions
- **Worker Processes**: Scale based on CPU cores

### **Network Optimization**

- **UDP Buffer**: Increase for high-bitrate streams
- **QoS**: Prioritize RTP traffic
- **Bandwidth**: Monitor and adjust stream quality

## 🔒 Security Considerations

### **Network Security**

- **Firewall**: Restrict access to streaming ports
- **Authentication**: Implement device authentication
- **Encryption**: Consider SRTP for sensitive streams

### **Access Control**

- **API Rate Limiting**: Prevent abuse
- **Session Management**: Secure session tokens
- **Logging**: Monitor streaming activities

## 📈 Monitoring & Analytics

### **SRS Statistics**

```bash
# Get SRS API statistics
curl http://localhost:1985/api/v1/streams/

# Monitor active streams
curl http://localhost:1985/api/v1/streams/live
```

### **JT808 Server Logs**

- Streaming session lifecycle
- Device communication status
- Error tracking and debugging

## 🤝 Contributing

### **Development Setup**

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test with ULV device
5. Submit pull request

### **Testing Requirements**

- Test with real ULV JT808 device
- Verify protocol compliance
- Performance testing under load
- Cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### **Documentation**

- [ULV Network Protocol V2.0.0](./ULV%20network%20protocol_V2.0.0-2019-20240924.md)
- [JT808 Protocol Specification](https://www.iotone.com/specification/jt-t-808-2019-vehicle-terminal-communication-protocol)
- [SRS Documentation](https://ossrs.net/lts/en-us/docs/v5/doc/)

### **Community**

- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for additional documentation

---

**🎉 Happy Streaming with ULV JT808! 🎉**

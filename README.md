# JT808 ULV Server

A professional JT808 protocol server implementation with ULV protocol support and JTT2019 compliance.

## 🚀 Features

- **✅ JT808 Protocol Server** - Full JT808-2019 standard compliance
- **✅ ULV Protocol Support** - Multimedia data handling (0x0801)
- **✅ JTT2019 Date Format** - Proper timestamp handling (seconds since 2000-01-01)
- **✅ HTTP API Server** - Easy monitoring and control
- **✅ Raw Video Feed Logging** - Monitor all multimedia data
- **✅ Clean Architecture** - No unnecessary complexity
- **✅ Vendor Ready** - Addresses vendor date format requirements

## 📋 Protocol Compliance

### JT808-2019 Standard

- Terminal registration and authentication
- Location reporting and querying
- Multimedia data upload (0x0801)
- Terminal control commands
- File upload protocol

### ULV Protocol (Ultravision Technology)

- Multimedia header structure (8 bytes)
- Location information (28 bytes)
- Media data handling
- Streaming support

### JTT2019 Date Format

- **Timestamp**: Seconds since 2000-01-01 00:00:00 UTC
- **Format**: DWORD (4 bytes)
- **Compliance**: Vendor specification requirement

## 🏗️ Architecture

```
src/
├── index.js              # Server entry point
├── jt808-server.js       # Main JT808 server
├── http-api-server.js    # HTTP API for monitoring
├── commands/             # Command implementations
├── protocol/             # JT808 protocol parsing
└── utils/                # Utilities (logging, etc.)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/bamikalea/node-JTT808_ULV-cur.git
cd node-JTT808_ULV-cur

# Install dependencies
npm install

# Start server
npm start
```

### Environment Variables

```bash
# Server configuration
PORT=3000                    # HTTP API port
HOST=0.0.0.0                # Server host
HTTP_PORT=3000              # HTTP server port
LOG_LEVEL=info              # Logging level
```

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

### Server Status

```bash
GET /status
```

### Terminal Information

```bash
GET /api/terminals
GET /api/terminals/:terminalId
```

### Multimedia Control

```bash
POST /api/multimedia/trigger
```

## 🔧 Configuration

### Firewall Ports

- **3000**: HTTP API
- **8080**: JT808 protocol
- **22**: SSH (for server management)

### JT808 Message Types

- `0x0001`: Terminal registration
- `0x0002`: Terminal heartbeat
- `0x0100`: Terminal authentication
- `0x0200`: Location report
- `0x0801`: Multimedia data upload
- `0x8105`: Terminal control

## 📊 Monitoring

### Logs

- **Console**: Real-time server logs
- **Files**: Structured logging to files
- **Levels**: Error, Warn, Info, Debug

### Raw Data

- **Multimedia**: All video/audio data logged
- **Protocol**: JT808 message parsing
- **Connections**: Terminal connection status

## 🚀 Deployment

### Vultr Cloud

1. Create server with IPv4 support
2. Configure firewall rules
3. Deploy code and start services
4. Monitor logs for raw video feeds

### Docker (Optional)

```bash
docker build -t jt808-server .
docker run -p 3000:3000 -p 8080:8080 jt808-server
```

## 🔍 Testing

### Multimedia Test

```bash
node test-multimedia-debug.js
```

### HTTP API Test

```bash
curl http://localhost:3000/health
curl http://localhost:3000/status
```

## 📚 Documentation

- **ULV Protocol**: `ULV network protocol_V2.0.0-2019-20240924.md`
- **API Usage**: `HTTP_API_USAGE.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Deployment Guide**: `DEPLOYMENT_READY.md`

## 🎯 Vendor Compliance

### Date Format Issue Resolved

- **Previous**: Unix timestamp (seconds since 1970-01-01)
- **Current**: JTT2019 timestamp (seconds since 2000-01-01)
- **Compliance**: ✅ Vendor specification met

### Protocol Structure

- **Multimedia Header**: 8 bytes (ULV compliant)
- **Location Data**: 28 bytes (JTT2019 format)
- **Message Structure**: JT808-2019 standard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: See docs/ folder
- **Protocol**: ULV specification document

## 🔗 Links

- **Repository**: https://github.com/bamikalea/node-JTT808_ULV-cur
- **Protocol**: ULV Network Protocol V2.0.0-2019
- **Standard**: JT/T 808-2019 Vehicle Terminal Communication Protocol

---

**Built with ❤️ for professional JT808 deployments**

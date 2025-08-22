# Advanced Troubleshooting Steps

## 1. Parameter Configuration

Send device configuration commands to enable streaming:

```bash
# Set video recording parameters
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

## 2. Alternative Streaming Ports

Try different port configurations:

- UDP Port 1935 (instead of 8000)
- TCP streaming (instead of UDP)
- Different IP addresses

## 3. Device Reset/Restart

Send device restart command:

```bash
curl -X POST http://localhost:3000/api/terminal/restart \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

## 4. Firmware Update Check

Query device version and check for updates:

```bash
curl -X POST http://localhost:3000/api/terminal/version \
  -H "Content-Type: application/json" \
  -d '{"terminalId": "628076842334"}'
```

## 5. Alternative Streaming Commands

Try JT1078 protocol if device supports it:

- Message ID: 0x9101 (JT1078 live video request)
- Different parameter structure

## 6. Hardware Verification

Check if device has:

- Working camera
- Video encoding capability
- Sufficient processing power
- Adequate network bandwidth

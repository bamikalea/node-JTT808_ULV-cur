// Analyze the device response according to ULV protocol
const rawResponse = "7e00014005010000000062807684233414040000910100c27e";

console.log("🔍 ULV Protocol Response Analysis");
console.log("=" .repeat(50));
console.log(`Raw HEX: ${rawResponse}`);
console.log("");

// Remove start/end markers (0x7E)
const messageData = rawResponse.slice(2, -2);
console.log(`Message Data (without markers): ${messageData}`);
console.log("");

// Parse JT808-2019 header format
let offset = 0;
const messageId = messageData.slice(offset, offset + 4);
offset += 4;
const properties = messageData.slice(offset, offset + 4);
offset += 4;
const protocolVersion = messageData.slice(offset, offset + 2);
offset += 2;
const terminalPhone = messageData.slice(offset, offset + 20); // 10 bytes = 20 hex chars
offset += 20;
const serialNumber = messageData.slice(offset, offset + 4);
offset += 4;

console.log("📋 JT808-2019 Header Analysis:");
console.log(`  Message ID: 0x${messageId} (${parseInt(messageId, 16)})`);
console.log(`  Properties: 0x${properties} (${parseInt(properties, 16)})`);
console.log(`  Protocol Version: 0x${protocolVersion} (${parseInt(protocolVersion, 16)})`);
console.log(`  Terminal Phone: ${terminalPhone}`);
console.log(`  Serial Number: 0x${serialNumber} (${parseInt(serialNumber, 16)})`);
console.log("");

// Extract message body
const bodyLength = parseInt(properties, 16) & 0x3FF; // Lower 10 bits
const messageBody = messageData.slice(offset, offset + (bodyLength * 2));
const checksum = messageData.slice(offset + (bodyLength * 2), offset + (bodyLength * 2) + 2);

console.log("📦 Message Body Analysis:");
console.log(`  Body Length: ${bodyLength} bytes`);
console.log(`  Body Data: ${messageBody}`);
console.log(`  Checksum: 0x${checksum}`);
console.log("");

// Parse General Response body according to Table 3.1.1
if (parseInt(messageId, 16) === 0x0001 && bodyLength === 5) {
    let bodyOffset = 0;
    const replySerial = messageBody.slice(bodyOffset, bodyOffset + 4);
    bodyOffset += 4;
    const replyId = messageBody.slice(bodyOffset, bodyOffset + 4);
    bodyOffset += 4;
    const result = messageBody.slice(bodyOffset, bodyOffset + 2);
    
    console.log("✅ ULV General Response (Table 3.1.1) Analysis:");
    console.log(`  Reply Serial Number: 0x${replySerial} (${parseInt(replySerial, 16)})`);
    console.log(`  Reply ID: 0x${replyId} (${parseInt(replyId, 16)})`);
    console.log(`  Result: 0x${result} (${parseInt(result, 16)})`);
    console.log("");
    
    // Interpret result code according to protocol
    const resultCode = parseInt(result, 16);
    const resultMeaning = {
        0: "SUCCESS",
        1: "FAILURE", 
        2: "MESSAGE ERROR",
        3: "NOT SUPPORTED"
    };
    
    console.log("🎯 Protocol Interpretation:");
    console.log(`  Result Code: ${resultCode} = ${resultMeaning[resultCode] || "UNKNOWN"}`);
    console.log(`  Reply to Message: 0x${replyId} (${parseInt(replyId, 16) === 0x9101 ? "ULV Streaming Request" : "Unknown"})`);
    console.log(`  Device Response: ${resultCode === 0 ? "✅ ACCEPTED streaming request" : "❌ REJECTED streaming request"}`);
}
#!/usr/bin/env node

/**
 * Debug JT808 Message Creation
 */

console.log('🔍 Debugging JT808 Message Creation');
console.log('===================================');

const terminalId = '628076842334';
const messageId = 0x8105;
const body = Buffer.alloc(0);

console.log(`\n📋 Input Parameters:`);
console.log(`   Message ID: 0x${messageId.toString(16).toUpperCase()}`);
console.log(`   Body length: ${body.length} bytes`);
console.log(`   Terminal ID: ${terminalId}`);

// Step 1: Create header + body + checksum
console.log(`\n📋 Step 1: Create header + body + checksum`);
const message = Buffer.alloc(15 + body.length + 1);
console.log(`   Buffer allocated: ${message.length} bytes`);

// Step 2: Write header
console.log(`\n📋 Step 2: Write header`);
message.writeUInt16BE(messageId, 0);
console.log(`   Message ID at pos 0-1: 0x${message[0].toString(16).padStart(2, '0')}${message[1].toString(16).padStart(2, '0')}`);

message.writeUInt16BE(0x4000 | body.length, 2);
console.log(`   Properties at pos 2-3: 0x${message[2].toString(16).padStart(2, '0')}${message[3].toString(16).padStart(2, '0')}`);

message.writeUInt8(0x01, 4);
console.log(`   Protocol Version at pos 4: 0x${message[4].toString(16).padStart(2, '0')}`);

// Step 3: Write terminal phone number
console.log(`\n📋 Step 3: Write terminal phone number`);
if (terminalId) {
    const phoneNumber = terminalId.padStart(12, '0');
    console.log(`   Padded phone number: ${phoneNumber}`);
    
    for (let i = 0; i < 6; i++) {
        const digit1 = parseInt(phoneNumber[i * 2], 10);
        const digit2 = parseInt(phoneNumber[i * 2 + 1], 10);
        const bcd = (digit1 << 4) | digit2;
        message[5 + i] = bcd;
        console.log(`   Pos ${5 + i}: ${digit1}${digit2} -> 0x${bcd.toString(16).padStart(2, '0')}`);
    }
}

// Step 4: Write serial number
console.log(`\n📋 Step 4: Write serial number`);
const serialNumber = 1;
message.writeUInt16BE(serialNumber, 11);
console.log(`   Serial number at pos 11-12: 0x${message[11].toString(16).padStart(2, '0')}${message[12].toString(16).padStart(2, '0')}`);

// Step 5: Copy body
console.log(`\n📋 Step 5: Copy body`);
if (body.length > 0) {
    body.copy(message, 13);
    console.log(`   Body copied to pos 13`);
} else {
    console.log(`   No body to copy`);
}

// Step 6: Calculate checksum
console.log(`\n📋 Step 6: Calculate checksum`);
let checksum = 0;
for (let i = 0; i < 13 + body.length; i++) {
    checksum ^= message[i];
}
message.writeUInt8(checksum, 13 + body.length);
console.log(`   Checksum at pos ${13 + body.length}: 0x${checksum.toString(16).padStart(2, '0')}`);

// Step 7: Wrap with markers
console.log(`\n📋 Step 7: Wrap with start/end markers`);
const wrappedMessage = Buffer.alloc(message.length + 2);
wrappedMessage.writeUInt8(0x7E, 0);
console.log(`   Start marker at pos 0: 0x${wrappedMessage[0].toString(16).padStart(2, '0')}`);

message.copy(wrappedMessage, 1);
console.log(`   Message copied to pos 1`);

wrappedMessage.writeUInt8(0x7E, wrappedMessage.length - 1);
console.log(`   End marker at pos ${wrappedMessage.length - 1}: 0x${wrappedMessage[wrappedMessage.length - 1].toString(16).padStart(2, '0')}`);

// Final result
console.log(`\n📋 Final Result:`);
console.log(`   Total length: ${wrappedMessage.length} bytes`);
console.log(`   Raw hex: ${wrappedMessage.toString('hex')}`);

// Verify each byte
console.log(`\n📋 Byte-by-byte verification:`);
for (let i = 0; i < wrappedMessage.length; i++) {
    const byte = wrappedMessage[i];
    const hex = byte.toString(16).padStart(2, '0');
    const ascii = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
    
    let description = '';
    if (i === 0) description = ' (Start marker)';
    else if (i === 1) description = ' (Message ID high)';
    else if (i === 2) description = ' (Message ID low)';
    else if (i === wrappedMessage.length - 1) description = ' (End marker)';
    
    console.log(`   Byte ${i.toString().padStart(2)}: 0x${hex} (${byte.toString().padStart(3)}) '${ascii}'${description}`);
}


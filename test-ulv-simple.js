#!/usr/bin/env node

// Simple test script to verify ULV protocol parsing improvements
const testData = Buffer.from([
  // Item 1: Driver Information (ID 0x00, Length 8)
  0x00, 0x08, 0x44, 0x72, 0x69, 0x76, 0x65, 0x72, 0x31,
  
  // Item 2: Reserved Field (ID 0x3F, Length 4) - often contains "None"
  0x3F, 0x04, 0x4E, 0x6F, 0x6E, 0x65
]);

console.log('Testing ULV Additional Info Items Parsing');
console.log(`Test data length: ${testData.length} bytes`);
console.log(`Raw data: ${testData.toString('hex')}`);

// Simulate the parseAdditionalInfoItems method logic
function parseAdditionalInfoItems(data) {
  const items = [];
  let offset = 0;

  while (offset < data.length && offset + 2 <= data.length) {
    const infoId = data.readUInt8(offset); offset += 1;
    const infoLength = data.readUInt8(offset); offset += 1;

    if (offset + infoLength > data.length) {
      console.log(`Warning: Additional info item ${infoId} length ${infoLength} exceeds remaining data`);
      break;
    }

    const infoData = data.slice(offset, offset + infoLength);
    offset += infoLength;

    let itemInfo = {
      id: infoId,
      length: infoLength,
      data: infoData
    };

    // Parse according to ULV Protocol Table 3.10.11
    switch (infoId) {
      case 0x00: // Driver information (Table 3.10.12)
        if (infoLength >= 8) {
          itemInfo.parsed = {
            type: 'Driver Information',
            driverName: infoData.slice(0, 8).toString('utf8').replace(/\0/g, ''),
            rawData: infoData.toString('hex')
          };
        }
        break;

      case 0x3F: // Reserved field (often contains "None" or empty data)
        itemInfo.parsed = {
          type: 'Reserved Field',
          value: infoData.toString('utf8').replace(/\0/g, ''),
          rawData: infoData.toString('hex')
        };
        break;

      default:
        itemInfo.parsed = {
          type: 'Unknown',
          value: `ID: 0x${infoId.toString(16)}, Length: ${infoLength}`,
          rawData: infoData.toString('hex')
        };
    }

    items.push(itemInfo);
  }

  return items;
}

// Test the parsing
const parsedItems = parseAdditionalInfoItems(testData);

console.log('\nParsed Additional Info Items:');
parsedItems.forEach((item, index) => {
  console.log(`  Item ${index + 1}:`);
  console.log(`    ID: 0x${item.id.toString(16)}`);
  console.log(`    Length: ${item.length}`);
  console.log(`    Type: ${item.parsed.type}`);
  if (item.parsed.value) {
    console.log(`    Value: ${item.parsed.value}`);
  }
  console.log(`    Raw Data: ${item.parsed.rawData}`);
  console.log('');
});

console.log('ULV parsing test completed!'); 

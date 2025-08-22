# RTP Format Comparison: ULV vs RFC 3550

## Standard RFC 3550 RTP Header (12 bytes):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|X|  CC   |M|     PT      |       sequence number         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           timestamp                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           synchronization source (SSRC) identifier          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

## ULV Custom RTP Format (15+ bytes):

```
Byte 0-3:   Frame Header (0x30316364) - NOT in RFC 3550
Byte 4:     V=2, P=0, X=0, C=1 (similar to RFC 3550)
Byte 5:     M bit + PT (7 bits) (similar to RFC 3550)
Byte 6-7:   Sequence Number (similar to RFC 3550)
Byte 8-13:  SIM Card Number (NOT in RFC 3550)
Byte 14:    Channel Number (NOT in RFC 3550)
Byte 15+:   Payload data
```

## Key Differences:

1. **Custom Frame Header**: 0x30316364 prefix (4 bytes)
2. **SIM Card Field**: 6-byte BCD SIM card number
3. **Channel Field**: 1-byte channel identifier
4. **Missing Fields**: No timestamp, no SSRC from RFC 3550
5. **Incompatible**: Cannot be processed by standard RTP libraries

## Conclusion:

ULV RTP is a **proprietary format** that borrows some concepts from RFC 3550
but is **NOT compatible** with standard RTP implementations like SRS.

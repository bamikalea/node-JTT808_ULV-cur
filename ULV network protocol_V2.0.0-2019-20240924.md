

<table>
  <thead>
    <tr>
      <th colspan="2"></th>
      <th><b>Document number</b></th>
      <th><b>Version</b></th>
      <th><b>Confidentiality level</b></th>
    </tr>
<tr>
      <th colspan="2"></th>
      <th></th>
      <th>V1.0.0</th>
      <th>Internal</th>
    </tr>
<tr>
      <th colspan="2"></th>
      <th><b>Product Name</b></th>
      <th colspan="2"><b>MDVR</b></th>
    </tr>
  </thead>
</table>

<p style="text-align:center;">(For internal use only)</p>

# Network Communication Protocol  
ShenZhen Ultravision Technology Co., LTD

<p style="text-align:center;"><b>Copyright Do not copy</b></p>

<table>
  <thead>
    <tr>
      <th>Version</th>
      <th>Describe</th>
      <th>Author</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>V1.0.0</td>
      <td>First draft, based on JTT808-2019 and JTT1078-2016</td>
      <td>TOM</td>
      <td>2021-06-01</td>
    </tr>
<tr>
      <td>V2.0.1</td>
      <td>Add GPS type in transparent transmission command</td>
      <td>TOM</td>
      <td>2022-08-16</td>
    </tr>
<tr>
      <td rowspan="3">V2.0.2</td>
      <td>3.5.6 Upload the mobile detection and video loss status to the server in the table</td>
      <td rowspan="3">MA</td>
      <td rowspan="3">2022-11-16</td>
    </tr>
<tr>
      <td>3.10.3 Speed=255km/h in GPS data in the table indicates that GPS is invalid</td>
    </tr>
<tr>
      <td>3.17 Add power parameter configuration in the table</td>
    </tr>
<tr>
      <td>V2.0.3</td>
      <td>3.17 Add company name parameter and installation date parameter</td>
      <td>MA</td>
      <td>2022-11-19</td>
    </tr>
<tr>
      <td rowspan="2">V2.0.4</td>
      <td>3.21 File upload instructions</td>
      <td rowspan="2">MA</td>
      <td rowspan="2">2023-01-12</td>
    </tr>
<tr>
      <td>3.22 File upload completion notice<br>3.23 File upload control</td>
    </tr>
<tr>
      <td>V2.0.5</td>
      <td>3.17 Add vehicle mileage parameter configuration</td>
      <td>MA</td>
      <td>2023-03-02</td>
    </tr>
<tr>
      <td>V2.0.6</td>
      <td>3.24 MDVR Upload Passenger Data</td>
      <td>MA</td>
      <td>2023-05-06</td>
    </tr>
<tr>
      <td rowspan="2">V2.0.7</td>
      <td>3.5.6 Add auxiliary oil quantity in the table</td>
      <td rowspan="2">MA</td>
      <td rowspan="2">2023-05-09</td>
    </tr>
<tr>
      <td>3.10.6 Add 4 temperatures to the table</td>
    </tr>
<tr>
      <td rowspan="2">V2.0.8</td>
      <td>3.17 Add parameter configuration for sleep mode and control parameters for unlisted driving buzzer alarm switch</td>
      <td rowspan="2">MA</td>
      <td rowspan="2">2023-05-30</td>
    </tr>
<tr>
      <td></td>
    </tr>
<tr>
      <td>V2.0.9</td>
      <td>3.10.6 Temperature correction</td>
      <td>MA</td>
      <td>2023-06-05</td>
    </tr>
<tr>
      <td rowspan="2">V2.0.10</td>
      <td>3.10.2 Add WiFi information upload command<br>Added Table 3.10.7</td>
      <td rowspan="2">MA</td>
      <td rowspan="2">2023-06-07</td>
    </tr>
<tr>
      <td></td>
    </tr>
<tr>
      <td>V2.0.11</td>
      <td>3.10.3 Upload new fuel value data</td>
      <td>MA</td>
      <td>2023-08-12</td>
    </tr>
<tr>
      <td>V2.0.12</td>
      <td>Add 3.25 text message distribution</td>
      <td>MA</td>
      <td>2023-08-24</td>
    </tr>
<tr>
      <td>V2.0.13</td>
      <td>Adding CMS protocol upload stream parameters in 3.17</td>
      <td>MA</td>
      <td>2023-08-28</td>
    </tr>
<tr>
      <td>V2.0.14</td>
      <td>Add recording switch parameters to the main and sub code streams in 3.17</td>
      <td>MA</td>
      <td>2023-09-06</td>
    </tr>
<tr>
      <td>V2.0.15</td>
      <td>3.10.2 Modify the OBD type in the table to 0x41</td>
      <td>MA</td>
      <td>2023-09-15</td>
    </tr>
<tr>
      <td rowspan="2">V2.0.16</td>
      <td>Add algorithm alarm upload<br>1.3.5.6 Add alarm event upload to the table</td>
      <td rowspan="2">MA</td>
      <td rowspan="2">2024-01-27</td>
    </tr>
<tr>
      <td></td>
    </tr>
  </tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th> </th>
      <th> </th>
      <th> </th>
      <th> </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2. Add secondary directory 4. Upload alarm attachments<br>3.3.25 Text information distribution and modification<br>3.17.1 Table modification</td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
<tr>
      <td>V2.0.17 Add "MDVR Status" to Table 3.5.6<br>3.10.7 Add "Manufacturer type, audio format, and disk type" to the table</td>
      <td>MA</td>
      <td>2024-04-01</td>
    </tr>
<tr>
      <td>V2.0.18 Add ULV transparent data structure</td>
      <td>HE</td>
      <td>2024-04-07</td>
    </tr>
<tr>
      <td>V2.0.19 Add memory fault status to table 3.5.6</td>
      <td>MA</td>
      <td>2024-09-24</td>
    </tr>
  </tbody>
</table>

# Content

1 Introduction .................................................................................................................................... 3  
1.1 Writing purpose .................................................................................................................. 3  
1.2 References .......................................................................................................................... 3  
1.3 Terms and Abbreviations ................................................................................................... 3  

2 Network protocol ............................................................................................................................ 3  
2.1 type of data ......................................................................................................................... 3  
2.2 Message structure ............................................................................................................... 4  
2.3 way of communication ....................................................................................................... 5  

3 Protocol command (message body) ................................................................................................. 5  
3.1 General answer .................................................................................................................... 5  
3.2 heartbeat message ............................................................................................................... 6  
3.3 Device registration message ............................................................................................... 6  
3.4 Device authentication ........................................................................................................ 7  
3.5 location information report ................................................................................................. 7  
3.6 Bulk location information reporting .................................................................................. 14  
3.7 Multimedia event upload .................................................................................................. 14  
3.8 Multimedia data upload .................................................................................................... 14  
3.9 Collect and report driver identity information ................................................................. 15  
3.10 Data transparent transmission ......................................................................................... 16  
3.11 Real-time audio and video preview request ................................................................... 24  
3.12 Real-time audio and video preview transmission control ............................................. 25  
3.13 Audio and video data transmission ............................................................................... 25  
3.14 Query the list of audio and video resources ................................................................. 26  
3.15 Audio and video playback request ................................................................................. 27  
3.16 Audio and video playback control .................................................................................. 28  
3.17 ULV parameter configuration network protocol description ......................................... 28  
3.19 The server queries the vehicle information ................................................................... 43  
3.20 Terminal control .............................................................................................................. 44  
3.21 File upload instructions ................................................................................................... 45  
3.23 File upload control ........................................................................................................... 46  


---


# 3.24. MDVR Upload Passenger Data ......................................................................................46  
# 3.25 Text information distribution .......................................................................................... 47  

# 4 Alarm attachment upload .......................................................................................................... 48  
- 4.1 Alarm attachment upload command ..................................................................................48  
- 4.2 Vehicle status data record file .......................................................................................... 48  
- 4.3 Alarm attachment information message ........................................................................... 49  
- 4.4 File information upload .................................................................................................... 50  
- 4.5 File data upload ................................................................................................................ 51  
- 4.6 File upload completion message ...................................................................................... 51  
- 4.7 File upload completion message response ....................................................................... 52  

# 1 Introduction

## 1.1 Writing purpose  
Describe the network communication interface, process, and precautions of our MDVR products and platform software as much as possible, so as to facilitate the writing of our CMS and related SDKs, and compile firmware products compatible with our equipment for third-party manufacturers.

## 1.2 References  
- GB/T2260 Administrative Region Planning Code of the People's Republic of China  
- GB/T19056 Car driving recorder  
- JT/T808-2019 "Terminal Communication Protocol and Data Format of Satellite Positioning System for Road Transport Vehicles"  
- JT/T1078-2016 "Road Transport Vehicle Satellite Positioning System Vehicle Video Communication Protocol"  
- Include the documentation referenced in the above  

## 1.3 Terms and Abbreviations  
- GPS: Global Position System  
- MDVR: Mobile Digital Video Recorder, mobile digital video recorder.  
- CMS: Center Monitor System  
- Device: ie MDVR. Since they are all in-vehicle applications, they are sometimes called in-vehicle devices or in-vehicle machines.  
- Platform: The central server is CMS.  

# 2 Network protocol

## 2.1 type of data  

<table>
<thead>
<tr>
<th>type of data</th>
<th>Illustrate</th>
</tr>
</thead>
<tbody>
<tr>
<td>BYTE</td>
<td>8-bit unsigned integer</td>
</tr>
<tr>
<td>WORD</td>
<td>16-bit unsigned integer</td>
</tr>
<tr>
<td>DWORD</td>
<td>32-bit unsigned integer</td>
</tr>
<tr>
<td>BYTE[n]</td>
<td>N bytes</td>
</tr>
<tr>
<td>BCD[n]</td>
<td>8421 code, n bytes</td>
</tr>
</tbody>
</table>



---


# 2.2 Message structure

Each message consists of "identification bit, message header, message body, check code".  
As shown in the figure:

<table>
  <thead>
    <tr>
      <th>identification bit</th>
      <th>header</th>
      <th>message body</th>
      <th>check code</th>
      <th>identification bit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0x7e</td>
      <td>Table 2.2.2</td>
      <td>Corresponding message type</td>
      <td>1 BYTE</td>
      <td>0x7e</td>
    </tr>
  </tbody>
</table>

## 2.2.1 Identification bit

It is represented by `0x7e`. If `0x7e` and `0x7d` appear in "check code, message header and message body", escape processing is required. Escape processing is defined as follows:  
* `'0x7d'` escapes to fixed 2 bytes `'0x7d 0x01'`  
* `'0x7e'` escapes to fixed 2 bytes `'0x7d 0x02'`  

**The escaping process is as follows:**  
When sending a message: message encapsulation → calculation and filling of the verification code → escape;  
When receiving a message: Escape recovery → verify check code → parse the message.  

Example: Send a packet of `'0x30 0x7E 0x08 0x7d 0x55'`, after escaping, it will be encapsulated as follows `'0x30 0x7d 0x02 0x08 0x7d 0x01 0x55'`

## 2.2.2 Header

<table>
  <thead>
    <tr>
      <th>start byte</th>
      <th>field</th>
      <th>type of data</th>
      <th>description and requirements</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>message ID</td>
      <td>WORD</td>
      <td></td>
    </tr>
<tr>
      <td>2</td>
      <td>Properties</td>
      <td>WORD</td>
      <td>See Message Body Properties (Table 2.2.2.1)</td>
    </tr>
<tr>
      <td>4</td>
      <td>Protocol version</td>
      <td>BYTE</td>
      <td>Protocol version number, incremented with each revision, the initial value is 1</td>
    </tr>
<tr>
      <td>5</td>
      <td>Terminal phone number</td>
      <td>BCD[10]</td>
      <td>According to the conversion of the mobile phone number of the terminal itself after installation, if the mobile phone number is less than 12 digits, add the number 0 in front</td>
    </tr>
<tr>
      <td>15</td>
      <td>Message serial number</td>
      <td>WORD</td>
      <td>Circular accumulation starting from 0 according to the sending order</td>
    </tr>
<tr>
      <td>17</td>
      <td>Message Packet Encapsulation Item</td>
      <td>—</td>
      <td>If the relevant identification bit in the message body attribute determines the packet processing of the message, the item has content, otherwise there is no item.</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>15</th>
      <th>14</th>
      <th>13</th>
      <th>12</th>
      <th>11</th>
      <th>10</th>
      <th>9</th>
      <th>8</th>
      <th>7</th>
      <th>6</th>
      <th>5</th>
      <th>4</th>
      <th>3</th>
      <th>2</th>
      <th>1</th>
      <th>0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Reserved</td>
      <td>Version ID</td>
      <td colspan="2">Multiple packages</td>
      <td colspan="2">Data encryption method</td>
      <td colspan="7">message body length</td>
    </tr>
  </tbody>
</table>

**Version ID:**  
The version before JTT808-2019 is 0, and this protocol is fixed to **1**  


---


Multiple packages：  
When the 13th bit in the message body attribute is 1, it indicates that the message body is a long message, which is divided into multiple packets for sending and processing, and the specific packet information is determined by the message packet encapsulation item. If bit 13 is 0, there is no packet encapsulation item field in the message header (Table 2.2.3.2).

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Total number of packages</td>
<td>WORD</td>
<td>total number of message packets</td>
</tr>
<tr>
<td>2</td>
<td>package serial number</td>
<td>WORD</td>
<td>start from 1</td>
</tr>
</tbody>
</table>

Data encryption method  
Bit10~bit12 are data encryption identification bits. When all three bits are 0, it means that the message body is not encrypted; when bit10 is 1, it means that the message body is encrypted by the RSA algorithm. The others are reserved.

**2.2.3 message body**  
The message body is the content of the protocol instruction

**2.2.4 check code**  
The check code is calculated from the first byte of the message header and XORed with the next byte until the end of the last byte of the message body; the check code is one byte.

## 2.3 way of communication

### 2.3.1 Connect the platform  
TCP communication is used between the device and the platform. After the device establishes a connection with the platform, it actively sends a registration message; after the device receives the correct response from the platform, it sends an authentication message; after the device receives the correct response, it considers the device to connect to the platform successfully.

### 2.3.2 Stay connected  
After the device is connected to the platform, it needs to send a heartbeat packet. The interval can be negotiated. The default is 30s. The platform must respond after receiving the heartbeat packet. If the heartbeat packet is not received or the response is not received within 3 times of the interval, it is considered that the connection between the device and the platform is disconnected.

### 2.3.3 Response method  
For each message, both parties need to give a response. The response is divided into a general response and a proprietary response. When the response type is not specified, the general response is used.

# 3 Protocol command (message body)

### 3.1 General answer  
Device side:  
- Message ID: 0x0001  
- Message Structure: Table 3.1.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Reply serial number</td>
<td>WORD</td>
<td>Corresponding platform message serial number</td>
</tr>
<tr>
<td>2</td>
<td>Reply ID</td>
<td>WORD</td>
<td>Corresponding platform message ID</td>
</tr>
<tr>
<td>4</td>
<td>Result</td>
<td>BYTE</td>
<td>0: success; 1: failure; 2: message error; 3: not supported</td>
</tr>
</tbody>
</table>

Platform side：  
- Message ID: 0x8001  
- Message Structure: Table 3.1.2


---



<table>
<thead>
<tr>
<th colspan="4" style="text-align:center;">Table 3.1.2</th>
</tr>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Reply serial number</td>
<td>WORD</td>
<td>Corresponding device message serial number</td>
</tr>
<tr>
<td>2</td>
<td>Reply ID</td>
<td>WORD</td>
<td>Corresponding device message ID</td>
</tr>
<tr>
<td>4</td>
<td>Result</td>
<td>BYTE</td>
<td>0: success; 1: failure; 2: message error; 3: not supported</td>
</tr>
</tbody>
</table>

## 3.2 heartbeat message
**Device side：**  
- Message ID: 0x0002  
- message structure: none

## 3.3 Device registration message
**Device side：**  
- Message ID: 0x0100  
- Message Structure: Table 3.3.1

<table>
<thead>
<tr>
<th colspan="5" style="text-align:center;">Table 3.3.1</th>
</tr>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th colspan="2">Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Province ID</td>
<td>WORD</td>
<td colspan="2">Indicates the province where the terminal installation vehicle is located, 0 is reserved, and the platform takes the default value. The provincial ID adopts the first two digits of the six digits of the administrative division code specified in GB/T 2260.</td>
</tr>
<tr>
<td>2</td>
<td>County ID</td>
<td>WORD</td>
<td colspan="2">Indicates the city and county where the terminal installation vehicle is located, 0 is reserved, and the platform takes the default value. The city and county ID adopts the last four digits of the six digits of the administrative division code stipulated in GB/T 2260.</td>
</tr>
<tr>
<td>4</td>
<td>Manufacturer ID</td>
<td>BYTE[11]</td>
<td colspan="2">Local administrative division code (6 bytes) and manufacturer (5 bytes)</td>
</tr>
<tr>
<td>15</td>
<td>Terminal model</td>
<td>BYTE[30]</td>
<td colspan="2">Manufacturer-defined model, add 0 before the number of digits is insufficient</td>
</tr>
<tr>
<td>45</td>
<td>Terminal ID</td>
<td>BYTE[30]</td>
<td colspan="2">Manufacturer-defined ID, add 0 before the number of digits is insufficient</td>
</tr>
<tr>
<td>75</td>
<td>license plate color</td>
<td>BYTE</td>
<td colspan="2">When the vehicle is not registered, it is marked with 0. The rest are in accordance with the provisions of JTT697.7-2014</td>
</tr>
<tr>
<td>76</td>
<td>license plate</td>
<td>STRING</td>
<td colspan="2">Motor vehicle license plate issued by public security traffic management department</td>
</tr>
</tbody>
</table>

**platform response message：**  
- Message ID: 0x8100  
- Message structure: Table 3.3.2

<table>
<thead>
<tr>
<th colspan="4" style="text-align:center;">Table 3.3.2</th>
</tr>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Reply serial number</td>
<td>WORD</td>
<td>Corresponding device message serial number</td>
</tr>
<tr>
<td>2</td>
<td>Result</td>
<td>BYTE</td>
<td>0: successful; 1: the vehicle has been registered; 2: the vehicle is not in the database; 3: the terminal has been registered; 4: the terminal is not in the database</td>
</tr>
</tbody>
</table>



---


# 3.4 Device authentication
**Device side:**  
Message ID: 0x0102  
Message structure: Table 3.4  

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Authentication code length</td>
<td>BYTE</td>
<td></td>
</tr>
<tr>
<td>1</td>
<td>Authentication code content</td>
<td>STRING</td>
<td>n is the length of the authentication code</td>
</tr>
<tr>
<td>n + 1</td>
<td>Terminal IMEI</td>
<td>BYTE[15]</td>
<td>Local administrative division code (6 bytes) and manufacturer (5 bytes)</td>
</tr>
<tr>
<td>n + 16</td>
<td>Firmware version number</td>
<td>BYTE[20]</td>
<td>Manufacturer-defined model, add 0 before the number of digits is insufficient</td>
</tr>
</tbody>
</table>

# 3.5 location information report
**Device side:**  
Message ID: 0x0200  
Message structure: consists of a list of location basic information and location additional information items (Table 3.5.1)  

<table>
<thead>
<tr>
<th colspan="2">Location Basic Information (Table 3.5.2)</th>
<th>Location Additional Information (Table 3.5.5)</th>
</tr>
</thead>
</table>

### Table 3.5.2 Location Basic Information

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>alarm sign</td>
<td>DWORD</td>
<td>Definition of alarm flags (Table 3.5.3)</td>
</tr>
<tr>
<td>4</td>
<td>condition</td>
<td>DWORD</td>
<td>Status Bit Definitions (Table 3.5.4)</td>
</tr>
<tr>
<td>8</td>
<td>latitude</td>
<td>DWORD</td>
<td>The latitude value in degrees multiplied by 10 to the 6th power is accurate to one millionth of a degree.</td>
</tr>
<tr>
<td>12</td>
<td>longitude</td>
<td>DWORD</td>
<td>The longitude value in degrees is multiplied by 10 to the 6th power to the nearest millionth of a degree.</td>
</tr>
<tr>
<td>16</td>
<td>high</td>
<td>WORD</td>
<td>Altitude, in meters.</td>
</tr>
<tr>
<td>18</td>
<td>speed</td>
<td>WORD</td>
<td>Unit (0.1km/h).</td>
</tr>
<tr>
<td>20</td>
<td>direction</td>
<td>WORD</td>
<td>0~359°, true north is 0, clockwise.</td>
</tr>
<tr>
<td>22</td>
<td>Time</td>
<td>BCD[6]</td>
<td>YY-MM-DD-hh-mm-ss (GMT+8 time, the time involved in this standard is in this time zone).</td>
</tr>
</tbody>
</table>

### Table 3.5.3 Definition of alarm flags

<table>
<thead>
<tr>
<th>Bit</th>
<th>Definition</th>
<th>Handling instructions</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>1: Emergency Alarm (SOS)</td>
<td>Triggered after the alarm switch is touched, and cleared after receiving the response</td>
</tr>
<tr>
<td>1</td>
<td>1: Overspeed alarm</td>
<td>The flag is maintained until the alarm condition is released</td>
</tr>
<tr>
<td>2</td>
<td>1: Fatigue driving</td>
<td>The flag is maintained until the alarm condition is released JT/T808-201115 / 33</td>
</tr>
<tr>
<td>4</td>
<td>1: GNSS module failure</td>
<td>The flag is maintained until the alarm condition is released</td>
</tr>
<tr>
<td>5</td>
<td>1: GNSS antenna not connected or</td>
<td>The flag is maintained until the alarm condition is</td>
</tr>
</tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th>cut off</th>
      <th>released</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>6<br>1: GNSS antenna short circuit</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>8<br>1: The main power supply of the terminal is powered off</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>14<br>1: Fatigue driving warning</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>18<br>1: Cumulative driving overtime on the day</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>19<br>1: Overtime parking</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>29<br>1: Collision alarm</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
  </tbody>
</table>

> Note: The functions corresponding to the unspecified data bits are not supported

<table>
  <caption>Table 3.5.4 Definition of Status Bits</caption>
  <thead>
    <tr>
      <th>Bit</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>0 Acc off; 1 Acc on</td></tr>
<tr><td>1</td><td>0 is not located; 1 is located</td></tr>
<tr><td>2</td><td>0 north latitude; 1 south latitude</td></tr>
<tr><td>3</td><td>0 east longitude; 1 west longitude</td></tr>
<tr><td>13</td><td>0: Door 1 closed; 1: Door 1 open (front door) (right front door of passenger car)</td></tr>
<tr><td>14</td><td>0: Door 2 closed; 1: Door 2 open (middle door)</td></tr>
<tr><td>15</td><td>0: Door 3 closed; 1: Door 3 open (rear door) (right rear door of passenger car)</td></tr>
<tr><td>16</td><td>0: Door 4 closed; 1: Door 4 open (driver’s seat door) (left front door of passenger car)</td></tr>
<tr><td>18</td><td>0: GPS satellites are not used for positioning; 1: GPS satellites are used for positioning.</td></tr>
<tr><td>19</td><td>0: Do not use Beidou satellites for positioning; 1: Use Beidou satellites for positioning.</td></tr>
<tr><td>20</td><td>0: GLONASS satellites are not used for positioning; 1: GLONASS satellites are used for positioning.</td></tr>
<tr><td>21</td><td>0: Do not use Galileo satellites for positioning; 1: Use Galileo satellites for positioning.</td></tr>
<tr><td>22</td><td>0: The vehicle is in a stopped state; 1: The vehicle is in a running state</td></tr>
  </tbody>
</table>

> Note: The functions corresponding to the unspecified data bits are not supported

<table>
  <caption>Table 3.5.5 Location Additional Information</caption>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type of data</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Additional information ID</td>
      <td>BYTE</td>
      <td>1~255</td>
    </tr>
<tr>
      <td>Additional information length</td>
      <td>BYTE</td>
      <td></td>
    </tr>
<tr>
      <td>Additional information</td>
      <td>indefinite length</td>
      <td>Additional Information ID (Table 3.5.6)</td>
    </tr>
  </tbody>
</table>

<table>
  <caption>Table 3.5.6 Additional Information IDs</caption>
  <thead>
    <tr>
      <th>Additional information ID</th>
      <th>Additional information length</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0x01</td>
      <td>4</td>
      <td>Mileage, DWORD, unit 0.1km, corresponding to the odometer reading on the vehicle</td>
    </tr>
<tr>
      <td>0x02</td>
      <td>2</td>
      <td>Fuel quantity, WORD, unit 0.1L, corresponding to the reading of the fuel gauge on the vehicle</td>
    </tr>
<tr>
      <td>0x03</td>
      <td>2</td>
      <td>Speed obtained by the tachograph, WORD, 0.1km/h</td>
    </tr>
<tr>
      <td>0x14</td>
      <td>4</td>
      <td>Video related alarm, expressed in bit,</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td></td>
    <td></td>
    <td>
      bit0 indicates video loss alarm, and the flag is maintained until the alarm condition is lifted<br/>
      bit4 indicates abnormal driving behavior alarm, and the sign is maintained until the alarm condition is lifted
    </td>
  </tr>
<tr>
    <td>0x15</td>
    <td>4</td>
    <td>
      Video signal loss alarm state, DWORD, set by bit, bit0-bit31 respectively represents the 1st to the 32nd logical channel, the corresponding bit is 1, it means that the video signal loss occurs in the change logic channel
    </td>
  </tr>
<tr>
    <td>0x17</td>
    <td>2</td>
    <td>
      Memory fault alarm status: WORD，Set by bit, bit0-bit11 represent the 1st to 12th memory respectively. If the corresponding bit is 1, it indicates that the memory has malfunctioned
    </td>
  </tr>
<tr>
    <td>0x18</td>
    <td>5</td>
    <td>Abnormal driving is represented by bit, bit34 is motion detection alarm, 0 is none, 1 is yes</td>
  </tr>
<tr>
    <td>0x25</td>
    <td>4</td>
    <td>Extended Vehicle Signal Status Bits (Table 3.5.7)</td>
  </tr>
<tr>
    <td>0x2A</td>
    <td>2</td>
    <td>IO Status Bits (Table 3.5.8)</td>
  </tr>
<tr>
    <td>0x30</td>
    <td>1</td>
    <td>BYTE, wireless communication network signal strength</td>
  </tr>
<tr>
    <td>0x31</td>
    <td>1</td>
    <td>BYTE, the number of GNSS positioning stars</td>
  </tr>
<tr>
    <td>0xEC</td>
    <td>2</td>
    <td>(Auxiliary) Fuel quantity, WORD, unit: 0.1L<br/>
      Temperature 1 Word range: -40 ° to below 80 ° C with the same temperature<br/>
      Humidity 1 Word range: 0% to below 100% humidity is the same<br/>
      Temperature 2<br/>
      Humidity 2<br/>
      Temperature 3<br/>
      Humidity 3<br/>
      Temperature 4<br/>
      Humidity 4
    </td>
  </tr>
<tr>
    <td>0x64</td>
    <td></td>
    <td>Advanced driving assistance system alarm information, defined in Table 3.5.9</td>
  </tr>
<tr>
    <td>0x65</td>
    <td></td>
    <td>Driver status monitoring system alarm information, defined in Table 3.5.10</td>
  </tr>
<tr>
    <td>0x67</td>
    <td></td>
    <td>Blind spot monitoring system alarm information, defined in Table 3.5.11</td>
  </tr>
<tr>
    <td>0xEF</td>
    <td>13</td>
    <td>MDVR status, defined in Table 3.5.13</td>
  </tr>
</table>

<br/>

<table>
  <thead>
    <tr>
      <th>Bit</th>
      <th>status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>9</td>
      <td>0 air conditioner off; 1 air conditioner on</td>
    </tr>
  </tbody>
</table>

<p style="color:red;">Note: The functions corresponding to the unspecified data bits are not supported</p>

<br/>

<table>
  <thead>
    <tr>
      <th>Bit</th>
      <th>status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>8</td>
      <td>Corresponding device IoInput1</td>
    </tr>
<tr>
      <td>9</td>
      <td>Corresponding device IoInput2</td>
    </tr>
<tr>
      <td>10</td>
      <td>Corresponding device IoInput3</td>
    </tr>
<tr>
      <td>11</td>
      <td>Corresponding device IoInput4</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>12</td>
    <td>Corresponding device IoInput5</td>
  </tr>
<tr>
    <td>13</td>
    <td>Corresponding device IoInput6</td>
  </tr>
<tr>
    <td>14</td>
    <td>Corresponding device IoInput7</td>
  </tr>
<tr>
    <td>15</td>
    <td>Corresponding device IoInput8</td>
  </tr>
</table>

<p><font color="red">Note: The functions corresponding to the unspecified data bits are not supported</font></p>

<p>Table 3.5.9 Advanced Driving Assistance Alarm Information Data Format</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>Length</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Alarm ID</td>
      <td>DWORD</td>
      <td>According to the order of alarms, loop accumulation starts from 0, without distinguishing between alarm types.</td>
    </tr>
<tr>
      <td>4</td>
      <td>Flag Status</td>
      <td>BYTE</td>
      <td>0x00: Not available, default to 0</td>
    </tr>
<tr>
      <td>5</td>
      <td>Alarm/Event Type</td>
      <td>BYTE</td>
      <td>
        0x01: Forward collision alarm<br>
        0x02: Lane departure warning<br>
        0x03: Car distance too close alarm<br>
        0x04: Pedestrian collision alarm
      </td>
    </tr>
<tr>
      <td>6</td>
      <td>Alarm level</td>
      <td>BYTE</td>
      <td>0x01: First level alarm</td>
    </tr>
<tr>
      <td>9</td>
      <td>Deviation type</td>
      <td>BYTE</td>
      <td>
        0x01: Left deviation<br>
        0x02: Right deviation<br>
        Only valid when alarm type is 0x02
      </td>
    </tr>
<tr>
      <td>12</td>
      <td>Speed</td>
      <td>BYTE</td>
      <td>Unit: Km/h. Range 0-250</td>
    </tr>
<tr>
      <td>13</td>
      <td>elevation</td>
      <td>WORD</td>
      <td>Altitude, in meters (m)</td>
    </tr>
<tr>
      <td>15</td>
      <td>latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>19</td>
      <td>longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>23</td>
      <td>Date Time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-hh-mm-ss （GMT+8时间）</td>
    </tr>
<tr>
      <td>29</td>
      <td>Vehicle status</td>
      <td>WORD</td>
      <td>See Table 3.5.4</td>
    </tr>
<tr>
      <td>31</td>
      <td>Alarm identification number</td>
      <td>BYTE[16]</td>
      <td>The definition of alarm identification number is shown in Table 3.5.12</td>
    </tr>
  </tbody>
</table>

<p>Table 3.5.10 Alarm Information Data Format of Driving Status Monitoring System</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>Length</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Alarm ID</td>
      <td>DWORD</td>
      <td>According to the order of alarms, loop accumulation starts from 0, without</td>
    </tr>
  </tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th></th>
      <th>Field</th>
      <th>Type</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>4</td>
      <td>Flag Status</td>
      <td>BYTE</td>
      <td>0x00: Not available, default to 0</td>
    </tr>
<tr>
      <td rowspan="11">5</td>
      <td rowspan="11">Alarm/Event Type</td>
      <td rowspan="11">BYTE</td>
      <td>0x01: Fatigue driving alarm</td>
    </tr>
<tr>
      <td>0x02: Responding to phone calls and reporting to the police</td>
    </tr>
<tr>
      <td>0x03: Smoking alarm</td>
    </tr>
<tr>
      <td>0x04: distracted driving alarm</td>
    </tr>
<tr>
      <td>0x05: Driver abnormal alarm</td>
    </tr>
<tr>
      <td>0x06: Seat belt not fastened</td>
    </tr>
<tr>
      <td>0x0A: occlusion</td>
    </tr>
<tr>
      <td>0x11: Driver change event</td>
    </tr>
<tr>
      <td>0x1F: Infrared blocking</td>
    </tr>
<tr></tr>
<tr></tr>
<tr>
      <td>6</td>
      <td>Alarm level</td>
      <td>BYTE</td>
      <td>0x01: First level alarm<br>0x02: Level 2 alarm</td>
    </tr>
<tr>
      <td>7</td>
      <td>Fatigue level</td>
      <td>BYTE</td>
      <td>Range 1-10. The larger the value, the more severe the fatigue level, and it is only effective when the alarm type is 0x01</td>
    </tr>
<tr>
      <td>8</td>
      <td>reserve</td>
      <td>BYTE[4]</td>
      <td>reserve</td>
    </tr>
<tr>
      <td>12</td>
      <td>Speed</td>
      <td>BYTE</td>
      <td>Unit: Km/h. Range 0-250</td>
    </tr>
<tr>
      <td>13</td>
      <td>elevation</td>
      <td>WORD</td>
      <td>Altitude, in meters (m)</td>
    </tr>
<tr>
      <td>15</td>
      <td>latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>19</td>
      <td>longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>23</td>
      <td>Date Time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-hh-mm-ss (GMT+8 time)</td>
    </tr>
<tr>
      <td>29</td>
      <td>Vehicle status</td>
      <td>WORD</td>
      <td>See Table 3.5.4</td>
    </tr>
<tr>
      <td>31</td>
      <td>Alarm identification number</td>
      <td>BYTE[16]</td>
      <td>The definition of alarm identification number is shown in Table 3.5.12</td>
    </tr>
  </tbody>
</table>

<br>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>Length</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Alarm ID</td>
      <td>DWORD</td>
      <td>According to the order of alarms, loop accumulation starts from 0, without distinguishing between alarm types.</td>
    </tr>
  </tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th> </th>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>4</td>
      <td>Flag Status</td>
      <td>BYTE</td>
      <td>0x00: Unavailable</td>
    </tr>
<tr>
      <td>5</td>
      <td>Alarm/Event Type</td>
      <td>BYTE</td>
      <td>
        0x01: Rear approach alarm<br/>
        0x02: Left rear approach alarm<br/>
        0x03: Right rear approach alarm
      </td>
    </tr>
<tr>
      <td>6</td>
      <td>Speed</td>
      <td>BYTE</td>
      <td>Unit: Km/h. Range 0-250</td>
    </tr>
<tr>
      <td>7</td>
      <td>elevation</td>
      <td>WORD</td>
      <td>Altitude, in meters (m)</td>
    </tr>
<tr>
      <td>9</td>
      <td>latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>13</td>
      <td>longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10, accurate to one millionth of a degree</td>
    </tr>
<tr>
      <td>17</td>
      <td>Date Time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-hh-mm-ss （GMT+8 Time）</td>
    </tr>
<tr>
      <td>23</td>
      <td>Vehicle status</td>
      <td>WORD</td>
      <td>See Table 3.5.4</td>
    </tr>
<tr>
      <td>25</td>
      <td>Alarm identification number</td>
      <td>BYTE[16]</td>
      <td>The definition of alarm identification number is shown in Table 3.5.12</td>
    </tr>
  </tbody>
</table>

<br/>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>Field</th>
      <th>Length</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Termination ID</td>
      <td>BYTE[7]</td>
      <td>7 bytes, composed of uppercase letters and numbers</td>
    </tr>
<tr>
      <td>7</td>
      <td>time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-hh-mm-ss （GMT+8 time）</td>
    </tr>
<tr>
      <td>13</td>
      <td>Serial Number</td>
      <td>BYTE</td>
      <td>The serial number of alarms at the same time point, accumulated in a loop from 0</td>
    </tr>
<tr>
      <td>14</td>
      <td>Number of attachments</td>
      <td>BYTE</td>
      <td>Indicates the number of attachments corresponding to this alarm</td>
    </tr>
<tr>
      <td>15</td>
      <td>reserve</td>
      <td>BYTE</td>
      <td> </td>
    </tr>
  </tbody>
</table>

<br/>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>Field</th>
      <th>Length</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Camera</td>
      <td>BYTE[6]</td>
      <td>
        Every 3 digits represent the status of one camera<br/>
        BIT0-BIT2: Camera 1<br/>
        BIT3-BIT5: Camera 2<br/>
        BIT45-BIT47: Camera 16<br/>
        0: Normal (the camera is normal and the
      </td>
    </tr>
  </tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>6</td>
      <td>IPC</td>
      <td>BCD[3]</td>
      <td>
        audio and video data stream is stored in memory)<br>
        1: Not recorded (camera normal)<br>
        2: Not enabled<br>
        3: Abnormal (camera not connected or other hardware malfunction)<br>
        4-7: Reserved<br><br>

        Every 3 represents the status of one IPC camera<br>
        BIT0-BIT2: IPC Camera 1<br>
        BIT3-BIT5: IPC Camera 2<br><br>

        BIT21-BIT23: IPC Camera 8<br>
        0: Normal (IPC camera is normal and audio and video data is stored in memory)<br>
        1: Not recorded (IPC camera normal)<br>
        2: Not enabled<br>
        3: Abnormal (IPC camera not connected or other hardware malfunction)<br>
        4-7: Reserved
      </td>
    </tr>
<tr>
      <td>9</td>
      <td>Main memory</td>
      <td>WORD</td>
      <td>
        BIT0-BIT3: Main memory 1<br>
        BIT4-BIT7: Main memory 2<br>
        BIT8-BIT11: Main memory 3<br>
        BIT12-BIT15: Main memory 4<br>
        0x00: Normal<br>
        0x01: Not enabled<br>
        0x02: Not inserted<br>
        0x03-0x0F: Reserved
      </td>
    </tr>
<tr>
      <td>11</td>
      <td>Reserved</td>
      <td>BYTE</td>
      <td></td>
    </tr>
<tr>
      <td>12</td>
      <td>Network status</td>
      <td>BYTE</td>
      <td>
        BIT0-BIT3: represents the network standard<br>
        0x00: Unknown, default 3G<br>
        0x01: 3G<br>
        0x02: 3G<br>
        0x03: 4G<br>
        0x04: 5G<br>
        0x05-0x08: Reserved<br>
        0x09: WIFI<br>
        0x0A: Wired
      </td>
    </tr>
  </tbody>
</table>



---


# 3.6 Bulk location information reporting
**Device side:**  
Message ID: 0x0704  
Message structure: Table 3.6.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>number of data items</td>
<td>WORD</td>
<td>Greater than 0</td>
</tr>
<tr>
<td>2</td>
<td>type of data</td>
<td>BYTE</td>
<td>0: Batch report for normal position<br>1: Supplementary report for blind area</td>
</tr>
<tr>
<td>3</td>
<td>location reporting data item</td>
<td>-</td>
<td>Table 3.6.2</td>
</tr>
</tbody>
</table>

### Table 3.6.2 Location Data Items

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>data body length</td>
<td>WORD</td>
<td>data body length n</td>
</tr>
<tr>
<td>2</td>
<td>data body</td>
<td>BYTE[n]</td>
<td>See 3.5 Location Information Reporting</td>
</tr>
</tbody>
</table>

# 3.7 Multimedia event upload
**Device side:**  
Message ID: 0x0800  
Message Structure: Table 3.7.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>multimedia data ID</td>
<td>DWORD</td>
<td>Greater than 0</td>
</tr>
<tr>
<td>4</td>
<td>Multimedia Type</td>
<td>BYTE</td>
<td>0: Image; 1: Audio; 2: Video</td>
</tr>
<tr>
<td>5</td>
<td>multimedia format</td>
<td>BYTE</td>
<td>0: JPEG; others reserved</td>
</tr>
<tr>
<td>6</td>
<td>event coding</td>
<td>BYTE</td>
<td>0: The platform issues an instruction; 1: Timing action; other reservations</td>
</tr>
<tr>
<td>7</td>
<td>channel ID</td>
<td>BYTE</td>
<td></td>
</tr>
</tbody>
</table>

# 3.8 Multimedia data upload
**Device side:**  
Message ID: 0x0801  
Message structure: Table 3.8.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>multimedia data ID</td>
<td>DWORD</td>
<td>Greater than 0</td>
</tr>
<tr>
<td>4</td>
<td>Multimedia Type</td>
<td>BYTE</td>
<td>0: Image; 1: Audio; 2: Video</td>
</tr>
<tr>
<td>5</td>
<td>multimedia format</td>
<td>BYTE</td>
<td>0: JPEG; others reserved</td>
</tr>
<tr>
<td>6</td>
<td>event coding</td>
<td>BYTE</td>
<td>0: The platform issues an instruction; 1: Timing action; other reservations</td>
</tr>
<tr>
<td>7</td>
<td>channel ID</td>
<td>BYTE</td>
<td></td>
</tr>
<tr>
<td>8</td>
<td>location information</td>
<td>BYTE[28]</td>
<td>0x200 message body, only contains basic location information, no additional information</td>
</tr>
</tbody>
</table>



---


# Protocol Specification

| 36 | multimedia packet | | |

platform response message:  
message ID: 0x8800  
Message Structure: Table 3.8.2  

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>multimedia data ID</td>
<td>DWORD</td>
<td>&gt;0, no subsequent fields if all packets are received</td>
</tr>
<tr>
<td>4</td>
<td>Total number of retransmitted packets</td>
<td>BYTE</td>
<td>n</td>
</tr>
<tr>
<td>5</td>
<td>List of retransmission packet IDs</td>
<td>BYTE[2*n]</td>
<td>The sequence numbers of the retransmission packets are arranged in order, such as "packet ID1 packet ID2...packet IDn".</td>
</tr>
</tbody>
</table>

> Note: The response to this message should use the 0x0801 message to retransmit the sub-packet in the retransmission ID list once, which is exactly the same as the original sub-packet message.

## 3.9 Collect and report driver identity information

Device side:  
message ID: 0x0702  
Message Structure: Table 3.9.1  

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>status</td>
<td>BYTE</td>
<td>
0x01: The IC card of the qualification certificate is inserted (the driver goes to work);  
0x02: The IC card of the qualification certificate is pulled out (the driver gets off work).
</td>
</tr>
<tr>
<td>1</td>
<td>Time</td>
<td>BCD[6]</td>
<td>
Card insertion/removal time, YY-MM-DD-hh-mm-ss;  
The following fields are only valid and populated when the status is 0x01.
</td>
</tr>
<tr>
<td>7</td>
<td>Card reading result</td>
<td>BYTE</td>
<td>
0x00: IC card reading is successful;  
0x01: Card reading failed because the card key authentication failed;  
0x02: Card reading failed because the card has been locked;  
0x03: Card reading failed because the card was pulled out;  
0x04: Card reading failed due to data verification error.  
The following fields are only valid when the IC card read result is equal to 0x00.
</td>
</tr>
<tr>
<td>8</td>
<td>Driver's name length</td>
<td>BYTE</td>
<td>n</td>
</tr>
<tr>
<td>9</td>
<td>driver name</td>
<td>STRING</td>
<td></td>
</tr>
<tr>
<td>9 + n</td>
<td>Qualification certificate code</td>
<td>STRING</td>
<td>The length is 20 digits, if it is insufficient, 0x00 is added.</td>
</tr>
<tr>
<td>29 + n</td>
<td>The length of the name of the issuing authority</td>
<td>BYTE</td>
<td>m</td>
</tr>
<tr>
<td>30 + n</td>
<td>Issuing agency name</td>
<td>STRING</td>
<td></td>
</tr>
<tr>
<td>30 + n + m</td>
<td>Certificate validity</td>
<td>BCD[4]</td>
<td>YYYYMMDD</td>
</tr>
<tr>
<td>34 + n + m</td>
<td>identification</td>
<td>STRING</td>
<td>The length is 20 digits, if it is insufficient,</td>
</tr>
</tbody>
</table>



---


# 3. 10 Data transparent transmission

Device side:  
- message ID: 0x0900  
- Message structure: Table 3.10.1  

Platform side:  
- message ID: 0x8900  
- Message structure: Table 3.10.1  

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Transparent message type</td>
<td>BYTE</td>
<td>Message Type (Table 3.10.2)</td>
</tr>
<tr>
<td>1</td>
<td>Transparent data</td>
<td>-</td>
<td></td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th>message type</th>
<th>description and requirements</th>
</tr>
</thead>
<tbody>
<tr>
<td>0xF0-0xFF</td>
<td>User-defined transparent message</td>
</tr>
<tr>
<td>0xF0</td>
<td>Transparent transmission of gps data (data structure table 3.10.3)</td>
</tr>
<tr>
<td>0xF1</td>
<td>GPS Data Transmission (Data Structure Table 3.10.6)<br>
Obd data transmission (data structure table 3.10.5)<br>
Data in string format starting with $OBD-RT:<br>
Reference example data:<br>
$OBD-RT,28.3,629,20,0.00,23.00,74,0.00,99.99,15.58,15,4.50,5534.00,0,0,0\r\n
</td>
</tr>
<tr>
<td>0xA1</td>
<td>CMS Private, WiFi Information (Data Structure 3.10.7)</td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th colspan="4">Table 3.10.3 Data structure of GPS transparent transmission message</th>
</tr>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Transmission type</td>
<td>BYTE</td>
<td>
0: real-time upload of ordinary data;<br>
1: Common data supplementary transmission;<br>
2: real-time upload of alarm data;<br>
3: Supplementary transmission of alarm data;
</td>
</tr>
<tr>
<td>1</td>
<td>alarm sign</td>
<td>DWORD</td>
<td>Definition of alarm flags (Table 3.5.3)</td>
</tr>
<tr>
<td>5</td>
<td>state</td>
<td>DWORD</td>
<td>Status Bit Definitions (Table 3.5.4)</td>
</tr>
<tr>
<td>9</td>
<td>latitude</td>
<td>DWORD</td>
<td>The latitude value in degrees is multiplied by 10 to the sixth power, accurate to one millionth of a degree.</td>
</tr>
<tr>
<td>13</td>
<td>longitude</td>
<td>DWORD</td>
<td>The latitude value in degrees is multiplied by 10 to the sixth power, accurate to one millionth of a degree.</td>
</tr>
<tr>
<td>17</td>
<td>high</td>
<td>WORD</td>
<td>Altitude, in meters.</td>
</tr>
<tr>
<td>19</td>
<td>speed</td>
<td>WORD</td>
<td>Unit (0.1km/h).</td>
</tr>
<tr>
<td>21</td>
<td>direction</td>
<td>WORD</td>
<td>0~359, true north is 0, clockwise.</td>
</tr>
<tr>
<td>23</td>
<td>time</td>
<td>HEX[6]</td>
<td>YY-MM-DD-hh-mm-ss (GMT+8 time, the time involved in this standard is in this time zone).</td>
</tr>
<tr>
<td>29</td>
<td>mileage</td>
<td>DWORD</td>
<td>Unit: 0.1km</td>
</tr>
<tr>
<td>33</td>
<td>oil quantity</td>
<td>WORD</td>
<td>Unit: 0.1L</td>
</tr>
<tr>
<td>35</td>
<td>vehicle status</td>
<td>DWORD</td>
<td></td>
</tr>
</tbody>
</table>



---



<table>
  <tr>
    <td>39</td>
    <td>network signal value</td>
    <td>BYTE</td>
    <td>0-100</td>
  </tr>
<tr>
    <td>40</td>
    <td>number of satellites</td>
    <td>BYTE</td>
    <td></td>
  </tr>
<tr>
    <td>41</td>
    <td>driver’s status</td>
    <td>BYTE</td>
    <td>
      0x00: Indicates status, no driver;<br>
      0x01: Indicates status, have driver;<br>
      0x02: Indicates event, The IC card of the qualification certificate is inserted (the driver goes to work);<br>
      0x03: Indicates event, The IC card of the qualification certificate is pulled out (the driver gets off work).
    </td>
  </tr>
<tr>
    <td>42</td>
    <td>driver’s name</td>
    <td>BYTE[32]</td>
    <td></td>
  </tr>
<tr>
    <td>74</td>
    <td>driver’s license number</td>
    <td>BYTE[24]</td>
    <td></td>
  </tr>
<tr>
    <td>98</td>
    <td>card num</td>
    <td>BYTE[8]</td>
    <td></td>
  </tr>
<tr>
    <td>106</td>
    <td>driving time</td>
    <td>DWORD</td>
    <td>Unit: min</td>
  </tr>
<tr>
    <td>110</td>
    <td>Other alarm</td>
    <td>BYTE</td>
    <td>Other of alarm flags (Table 3.11.4)</td>
  </tr>
<tr>
    <td>111</td>
    <td>historical speed count</td>
    <td>BYTE</td>
    <td>
      N-1 (Number of GPS uploaded according to menu configuration-1). For example: the device menu is set to 30, here it is equal to 29
    </td>
  </tr>
<tr>
    <td>112</td>
    <td>historical speed value</td>
    <td>WORD[n-1]</td>
    <td>
      Unit (0.1km/h). For example, the menu sets 30 speed values, and here 29 speed values before the 30th second are passed. The speed of 255km/h indicates that the GPS is invalid
    </td>
  </tr>
<tr>
    <td>112+2*n</td>
    <td>Fuel real-time value</td>
    <td>WORD</td>
    <td></td>
  </tr>
<tr>
    <td>114+2*n</td>
    <td>Average fuel value</td>
    <td>WORD</td>
    <td></td>
  </tr>
</table>

<table>
  <thead>
    <tr>
      <th>Bit</th>
      <th>Definition</th>
      <th>Handling instructions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>1: Rest alarm</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>1</td>
      <td>1: Fatigue driving</td>
      <td>The flag is maintained until the alarm condition is released</td>
    </tr>
<tr>
      <td>2</td>
      <td>1: Fuel alarm</td>
      <td>Set the flag bit to 1 when triggered only, and then to 0</td>
    </tr>
<tr>
      <td>3</td>
      <td>1: The Watch dog mechanism is triggered, and an alarm is triggered after the device restarts</td>
      <td>Set the flag bit to 1 when triggered only, and then to 0</td>
    </tr>
<tr>
      <td>4</td>
      <td>1: 4G module cannot detect and triggers an alarm after network recovery</td>
      <td>Set the flag bit to 1 when triggered only, and then to 0</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>Data serial number</th>
      <th>The name of the data</th>
      <th>Unit and Remarks</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>$OBD-RT</td>
      <td></td>
    </tr>
<tr>
      <td>1</td>
      <td>The battery voltage</td>
      <td>V</td>
    </tr>
<tr>
      <td>2</td>
      <td>Speed of engine</td>
      <td>rpm</td>
    </tr>
<tr>
      <td>3</td>
      <td>The speed</td>
      <td>km/h</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>4</td>
    <td>Throttle degrees</td>
    <td>%</td>
  </tr>
<tr>
    <td>5</td>
    <td>Load of engine</td>
    <td>%</td>
  </tr>
<tr>
    <td>6</td>
    <td>Cooling fluid temperature</td>
    <td>℃</td>
  </tr>
<tr>
    <td>7</td>
    <td>The instantaneous fuel consumption</td>
    <td>(idle speed) : L/h (driving) : L/100km<br/>Judging by the speed of the current idle state or driving state</td>
  </tr>
<tr>
    <td>8</td>
    <td>The average fuel consumption</td>
    <td>L/100km</td>
  </tr>
<tr>
    <td>9</td>
    <td>This driving distance</td>
    <td>km</td>
  </tr>
<tr>
    <td>10</td>
    <td>Total mileage</td>
    <td>km</td>
  </tr>
<tr>
    <td>11</td>
    <td>Fuel consumption this time</td>
    <td>L</td>
  </tr>
<tr>
    <td>12</td>
    <td>Cumulative fuel consumption</td>
    <td>L</td>
  </tr>
<tr>
    <td>13</td>
    <td>Current number of fault codes</td>
    <td></td>
  </tr>
<tr>
    <td>14</td>
    <td>Number of rapid accelerations</td>
    <td>Times</td>
  </tr>
<tr>
    <td>15</td>
    <td>Times of rapid deceleration</td>
    <td>Times</td>
  </tr>
</table>

<br/>

<table>
  <caption>Table 3.10.6 GPS transparent message data structure</caption>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Data type</td>
      <td>BYTE</td>
      <td>
        0: Real time upload of ordinary data;<br/>
        1: Ordinary data supplementary transmission;<br/>
        2: Real time upload of alarm data;<br/>
        3: Supplementary transmission of alarm data;
      </td>
    </tr>
<tr>
      <td>1</td>
      <td>Alarm Flag</td>
      <td>DWORD</td>
      <td>Definition of Alarm Flag Bits (Table 3.5.3)</td>
    </tr>
<tr>
      <td>5</td>
      <td>Status</td>
      <td>DWORD</td>
      <td>Status bit definition (Table 3.5.4)</td>
    </tr>
<tr>
      <td>9</td>
      <td>Latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10 to the nearest millionth of a degree.</td>
    </tr>
<tr>
      <td>13</td>
      <td>Longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10 to the nearest millionth of a degree.</td>
    </tr>
<tr>
      <td>17</td>
      <td>Height</td>
      <td>WORD</td>
      <td>Altitude, in meters.</td>
    </tr>
<tr>
      <td>19</td>
      <td>Speed</td>
      <td>WORD</td>
      <td>Unit (0.1km/h).</td>
    </tr>
<tr>
      <td>21</td>
      <td>Direction</td>
      <td>WORD</td>
      <td>0~359, 正北为 0，顺时针。</td>
    </tr>
<tr>
      <td>23</td>
      <td>Time</td>
      <td>HEX[6]</td>
      <td>YY-MM-DD-hh-mm-ss (GMT+8 time, all subsequent times referred to in this standard use this time zone).</td>
    </tr>
<tr>
      <td>29</td>
      <td>mileage</td>
      <td>DWORD</td>
      <td>Unit: 0.1km</td>
    </tr>
<tr>
      <td>33</td>
      <td>Fuel sensor status</td>
      <td>BYTE</td>
      <td>
        bit0 : fuel-LIGO<br/>
        bit1 : fuel-LIGO-EUP<br/>
        bit2 : fuel-UL212-EUP<br/>
        0: Fuel sensor not connected<br/>
        1: Fuel sensor already connected
      </td>
    </tr>
<tr>
      <td>34</td>
      <td>Device Differences</td>
      <td>BYTE</td>
      <td></td>
    </tr>
  </tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th>Index</th>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>35</td>
      <td>Fuel</td>
      <td>WORD</td>
      <td>Smooth height, Unit: mm</td>
    </tr>
<tr>
      <td>37</td>
      <td>Signal strength</td>
      <td>BYTE</td>
      <td>
        0~99%<br>
        &gt;30 Best
      </td>
    </tr>
<tr>
      <td>38</td>
      <td>Software Code</td>
      <td>BYTE</td>
      <td>
        0: Normal<br>
        3: Weak signal<br>
        6: Refueling alarm<br>
        9: Fuel theft alarm
      </td>
    </tr>
<tr>
      <td>39</td>
      <td>valid signal</td>
      <td>BYTE</td>
      <td>&gt;30 Best</td>
    </tr>
<tr>
      <td>40</td>
      <td>Tangent angle</td>
      <td>BYTE</td>
      <td>
        Unit: degrees<br>
        &lt;5 Best
      </td>
    </tr>
<tr>
      <td>41</td>
      <td>Firmware version</td>
      <td>WORD</td>
      <td>For example, 4230; 4: Hardware version, 230: Firmware version</td>
    </tr>
<tr>
      <td>43</td>
      <td>temperature</td>
      <td>WORD</td>
      <td>For example, 628; (628-400) * 0.1 ℃ = 22.8 ℃</td>
    </tr>
<tr>
      <td>45</td>
      <td>Check Code</td>
      <td>BYTE</td>
      <td>CheckSum</td>
    </tr>
<tr>
      <td>46</td>
      <td>Fuel 2</td>
      <td>DWORD</td>
      <td></td>
    </tr>
<tr>
      <td>50</td>
      <td>Vehicle status</td>
      <td>DWORD</td>
      <td></td>
    </tr>
<tr>
      <td>54</td>
      <td>Network signal value</td>
      <td>BYTE</td>
      <td>0-100</td>
    </tr>
<tr>
      <td>55</td>
      <td>Number of satellites</td>
      <td>BYTE</td>
      <td></td>
    </tr>
<tr>
      <td>56</td>
      <td>Login status</td>
      <td>BYTE</td>
      <td>
        0x00: indicates status, no driver logged in;<br>
        0x01: indicates the status, with a driver logged in;<br>
        0x02: Refers to the event where the IC card of the employment qualification certificate is inserted (the driver works);<br>
        0x03: Refers to the event where the IC card of the employment qualification certificate is removed (the driver is off duty).
      </td>
    </tr>
<tr>
      <td>57</td>
      <td>Driver’s name</td>
      <td>BYTE[32]</td>
      <td></td>
    </tr>
<tr>
      <td>89</td>
      <td>Driver’s license number</td>
      <td>BYTE[24]</td>
      <td></td>
    </tr>
<tr>
      <td>113</td>
      <td>Card number</td>
      <td>BYTE[8]</td>
      <td></td>
    </tr>
<tr>
      <td>121</td>
      <td>driving time</td>
      <td>DWORD</td>
      <td>Unit: min</td>
    </tr>
<tr>
      <td>125</td>
      <td>Other alarms</td>
      <td>BYTE</td>
      <td>Definition of Alarm Flag Bits (Table 3.10.4)</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>126</td>
    <td>Number of historical speeds</td>
    <td>BYTE</td>
    <td>n</td>
  </tr>
<tr>
    <td>127</td>
    <td>speed value</td>
    <td>WORD[n]</td>
    <td>Unit (0.1km/h), previous speed</td>
  </tr>
<tr>
    <td>127+2*n</td>
    <td>temperature</td>
    <td>WORD[4]</td>
    <td>
      Temperature 1-4, unit 0.1° range -40° to 80°<br>
      The first code represents positive and negative values, 0 represents negative values, and 1 represents positive values<br>
      The temperature values for the 2nd to 4th codes are 0.1 degrees Celsius. Example of HEX data calculation:<br>
      00E3 =&gt; negative, 14 * 16 + 3 = 227, at -22.7 degrees<br>
      10E2 =&gt; positive, 14 * 16 + 2 = 226, at +22.6 degrees
    </td>
  </tr>
<tr>
    <td>135+2*n</td>
    <td>Other statuses</td>
    <td>DWORD</td>
    <td>Definition of Status Bits (Table 3.10.8)</td>
  </tr>
</table>

<br>

<table>
  <caption>Table 3.10.7</caption>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Network</td>
      <td>BYTE</td>
      <td>
        0: Wired<br>
        1: Wifi<br>
        2: 3G/4G
      </td>
    </tr>
<tr>
      <td>1</td>
      <td>Network name length</td>
      <td>BYTE</td>
      <td>When it is a wifi type, fill in the length of the specific network name, otherwise it is 0</td>
    </tr>
<tr>
      <td>2</td>
      <td>Network Name</td>
      <td>BYTE[n]</td>
      <td>When it is a WiFi type, enter the specific network name, and fill in the blank for other network types</td>
    </tr>
<tr>
      <td>2+n</td>
      <td>Manufacturer type</td>
      <td>BYTE</td>
      <td>Default: 70</td>
    </tr>
<tr>
      <td>2+n+1</td>
      <td>Audio type</td>
      <td>BYTE</td>
      <td>
        10: G711A<br>
        12: AAC_8K
      </td>
    </tr>
<tr>
      <td>2+n+1+1</td>
      <td>Disk type</td>
      <td>BYTE</td>
      <td>
        0: Invalid<br>
        1: SD card<br>
        2: Hard disk<br>
        3: SSD
      </td>
    </tr>
  </tbody>
</table>

<br>

<table>
  <caption>Table 3.10.8 Definition of Status Bits</caption>
  <thead>
    <tr>
      <th>bit</th>
      <th>status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Recording CH1: 0 indicates no recording status, 1 indicates recording status</td>
    </tr>
<tr>
      <td>1</td>
      <td>Recording CH2: 0 indicates no recording status, 1 indicates recording status</td>
    </tr>
<tr>
      <td>2</td>
      <td>Recording CH3: 0 indicates no recording status, 1 indicates recording status</td>
    </tr>
<tr>
      <td>3</td>
      <td>Recording CH4: 0 indicates no recording status, 1 indicates recording status</td>
    </tr>
<tr>
      <td>4</td>
      <td>Video loss CH1: 0 indicates normal, 1 indicates video loss</td>
    </tr>
<tr>
      <td>5</td>
      <td>Video loss CH2: 0 indicates normal, 1 indicates video loss</td>
    </tr>
<tr>
      <td>6</td>
      <td>Video loss CH3: 0 indicates normal, 1 indicates video loss</td>
    </tr>
<tr>
      <td>7</td>
      <td>Video loss CH4: 0 indicates normal, 1 indicates video loss</td>
    </tr>
<tr>
      <td>8</td>
      <td>Disk status: 0 indicates presence of a disk, 1 indicates absence of a disk</td>
    </tr>
<tr>
      <td>9</td>
      <td>IO input1: 0 indicates not triggered, 1 indicates triggered</td>
    </tr>
<tr>
      <td>10</td>
      <td>IO input1: 0 indicates not triggered, 1 indicates triggered</td>
    </tr>
<tr>
      <td>11</td>
      <td>IO input3: 0 indicates not triggered, 1 indicates triggered</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>12</td>
    <td>IO</td>
    <td>input4:0 indicates not triggered, 1 indicates triggered</td>
  </tr>
<tr>
    <td>13</td>
    <td>IO</td>
    <td>input5: 0 indicates not triggered, 1 indicates triggered</td>
  </tr>
<tr>
    <td>14</td>
    <td>IO</td>
    <td>input6:0 indicates not triggered, 1 indicates triggered</td>
  </tr>
<tr>
    <td>15</td>
    <td>IO</td>
    <td>input7:0 indicates not triggered, 1 indicates triggered</td>
  </tr>
<tr>
    <td>16</td>
    <td>IO</td>
    <td>input8:0 indicates not triggered, 1 indicates triggered</td>
  </tr>
<tr>
    <td>17</td>
    <td>IO</td>
    <td>input8,0 indicates not triggered, 1 indicates triggered</td>
  </tr>
</table>

<br/>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Message type</td>
      <td>BYTE</td>
      <td>ULV transparent data, fixed 0xf3</td>
    </tr>
<tr>
      <td>1</td>
      <td>data type</td>
      <td>BYTE</td>
      <td>0: Vehicle information (Table 3.10.10)<br/>Other: Keep</td>
    </tr>
<tr>
      <td>2</td>
      <td>Customer ID</td>
      <td>BYTE</td>
      <td>0: Standard universal;<br/>Other: Customized by the customer, not currently used</td>
    </tr>
  </tbody>
</table>

<br/>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4">0</td>
      <td rowspan="4">data type</td>
      <td rowspan="4">BYTE</td>
      <td>0: Real time upload of regular data;</td>
    </tr>
<tr>
      <td>1: Ordinary data supplementary transmission;</td>
    </tr>
<tr>
      <td>2: Real time upload of alarm data;</td>
    </tr>
<tr>
      <td>3: Alarm data supplementary transmission;</td>
    </tr>
<tr>
      <td>1</td>
      <td>Alarm Flag</td>
      <td>DWORD</td>
      <td>Alarm Flag Definition (Table 3.5.3)</td>
    </tr>
<tr>
      <td>5</td>
      <td>state</td>
      <td>DWORD</td>
      <td>Status bit definition (Table 3.5.4)</td>
    </tr>
<tr>
      <td>9</td>
      <td>latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by 10 to the 6th power, accurate to one millionth of a degree.</td>
    </tr>
<tr>
      <td>13</td>
      <td>longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by 10 to the 6th power, accurate to one millionth of a degree.</td>
    </tr>
<tr>
      <td>17</td>
      <td>Latitude direction</td>
      <td>BYTE</td>
      <td>N: North latitude; S: South latitude</td>
    </tr>
<tr>
      <td>18</td>
      <td>Longitude direction</td>
      <td>BYTE</td>
      <td>W: West longitude; E: East longitude</td>
    </tr>
<tr>
      <td>19</td>
      <td>height</td>
      <td>WORD</td>
      <td>Altitude, measured in meters.</td>
    </tr>
<tr>
      <td>21</td>
      <td>speed</td>
      <td>WORD</td>
      <td>Unit (0.1km/h).</td>
    </tr>
<tr>
      <td>23</td>
      <td>direction</td>
      <td>WORD</td>
      <td>0-359, due north is 0, clockwise.</td>
    </tr>
<tr>
      <td>25</td>
      <td>time</td>
      <td>HEX[6]</td>
      <td>YY-MM-DD-hh-mm-ss (GMT+8 time, this time zone is used for all subsequent times in this standard).</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>31</td>
    <td>mileage</td>
    <td>DWORD</td>
    <td>Unit: 0.1km</td>
  </tr>
<tr>
    <td>35</td>
    <td>Number of satellites</td>
    <td>BYTE</td>
    <td></td>
  </tr>
<tr>
    <td>36</td>
    <td>Additional information items</td>
    <td>n</td>
    <td>Table 3.10.11</td>
  </tr>
</table>

<p>Table 3.10.11 Vehicle Information Additional Information Item Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3">0</td>
      <td>Additional item ID</td>
      <td>BYTE</td>
      <td>
        0: Driver information (see Table 3.10.12 for additional data structure)<br>
        1: Historical speed (see Table 3.10.13 for additional data structure)<br>
        2: Oil volume (see Table 3.10.14 for additional data structure)<br>
        3: Temperature and humidity information (see Table 3.10.15 for additional data structure)<br>
        4: Network information (see Table 3.10.16 for additional data structures)<br>
        5: Video status (see Table 3.10.17 for additional data structure)<br>
        6: IO input status (see Table 3.10.18 for additional data structures)<br>
        7: Disk status (see Table 3.10.19 for additional data structures)
      </td>
    </tr>
<tr>
      <td>Data length</td>
      <td>BYTE</td>
      <td>n</td>
    </tr>
<tr>
      <td>Additional data</td>
      <td>n</td>
      <td></td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.12 Driver Information Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Driver's name</td>
      <td>BYTE[32]</td>
      <td></td>
    </tr>
<tr>
      <td>32</td>
      <td>Driver's license number</td>
      <td>BYTE[24]</td>
      <td></td>
    </tr>
<tr>
      <td>56</td>
      <td>Login status</td>
      <td>BYTE</td>
      <td>0: Not logged in; 1: Login available; 2: Swipe your card to work; 3: Swipe card after work</td>
    </tr>
<tr>
      <td>57</td>
      <td>Continuous driving time</td>
      <td>DWORD</td>
      <td>Unit (min)</td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.13 Historical Speed Information Data Structure</p>


---



<table>
  <thead>
    <tr>
      <th>Byte</th>
      <th> </th>
      <th> </th>
      <th> </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Number of speeds</td>
      <td>BYTE</td>
      <td>n</td>
    </tr>
<tr>
      <td>1</td>
      <td>Speed value</td>
      <td>BYTE[n]</td>
      <td>Km/h</td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.14 Fuel Information Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Fuel sensor type</td>
      <td>BYTE</td>
      <td>Temporarily fixed to 0</td>
    </tr>
<tr>
      <td>1</td>
      <td>Fuel value</td>
      <td>WORD[4]</td>
      <td>//The unit is determined by the fuel sensor used, please fill in the numerical value here</td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.15 Structure of Temperature and Humidity Information Data</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Temperature value</td>
      <td>WORD[4]</td>
      <td>Unit (0.1 ℃)</td>
    </tr>
<tr>
      <td>8</td>
      <td>Humidity value</td>
      <td>WORD[4]</td>
      <td> </td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.16 Network Information Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Network connection method</td>
      <td>BYTE</td>
      <td>0:wired; 1:wifi; 2:xg; other:unknown</td>
    </tr>
<tr>
      <td>1</td>
      <td>Signal value</td>
      <td>BYTE</td>
      <td>range(0~100)</td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.17 Video Status Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Video loss status</td>
      <td>DWORD</td>
      <td>bit0:chn0; bit1:chn1; ...</td>
    </tr>
<tr>
      <td>4</td>
      <td>Recording status</td>
      <td>DWORD</td>
      <td>bit0:chn0; bit1:chn1; ...</td>
    </tr>
  </tbody>
</table>

<p>Table 3.10.18 IO Input Status Data Structure</p>

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>



---



<table>
<thead>
<tr>
<th>Byte</th>
<th></th>
<th></th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>IO input status</td>
<td>BYTE</td>
<td>bit0:io_0; bit1:io_1; ...</td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th colspan="4">Table 3.10.19 Disk Status Data Structure</th>
</tr>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Number of hard drives</td>
<td>BYTE</td>
<td>Number of valid HDDs (0 indicates unsupported, maximum of 2)</td>
</tr>
<tr>
<td>1</td>
<td>Total hard disk capacity</td>
<td>DWORD[2]</td>
<td>Unit (MB)</td>
</tr>
<tr>
<td>9</td>
<td>Remaining capacity of hard drive</td>
<td>DWORD[2]</td>
<td>Unit (MB)</td>
</tr>
<tr>
<td>17</td>
<td>Number of SD cards</td>
<td>BYTE</td>
<td>Number of valid Sd (0 indicates unsupported, maximum of 2)</td>
</tr>
<tr>
<td>18</td>
<td>Total capacity of SD card</td>
<td>DWORD[2]</td>
<td>Unit (MB)</td>
</tr>
<tr>
<td>26</td>
<td>SD card remaining capacity</td>
<td>DWORD[2]</td>
<td>Unit (MB)</td>
</tr>
</tbody>
</table>

## 3.11 Real-time audio and video preview request

Platform side:  
message ID: 0x9101  
Message structure: Table 3.11.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Server IP length</td>
<td>BYTE</td>
<td>length n</td>
</tr>
<tr>
<td>1</td>
<td>Server IP address</td>
<td>STRING</td>
<td>IP address of the audio and video server to be connected</td>
</tr>
<tr>
<td>1 + n</td>
<td>TCP port</td>
<td>WORD</td>
<td></td>
</tr>
<tr>
<td>3 + n</td>
<td>UDP port</td>
<td>WORD</td>
<td></td>
</tr>
<tr>
<td>5 + n</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>6 + n</td>
<td>type of data</td>
<td>BYTE</td>
<td>0: Audio and video; 1: Video; 2: Intercom; 3: Monitor</td>
</tr>
<tr>
<td>7 + n</td>
<td>Stream type</td>
<td>BYTE</td>
<td>0: main stream; 1: sub stream</td>
</tr>
</tbody>
</table>

> The platform sends this message when it needs to preview audio and video. After receiving this message, the device will give a general response, and then establish a new connection with the designated video server. The previous communication connection remains unchanged, video data transmission see 3.13



---


# 3. 12 Real-time audio and video preview transmission control

Platform side:  
message ID: 0x9102  
Message structure: Table 3.12.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>1</td>
<td rowspan="4">Control instruction</td>
<td>BYTE</td>
<td>
0: Turn off the audio and video transmission command<br>
1: switch stream<br>
2: Pause sending stream<br>
3: Resume the stream transmission before the pause<br>
4: Turn off the intercom
</td>
</tr>
<tr>
<td>2</td>
<td>Turn off audio and video types</td>
<td>BYTE</td>
<td>
0: Turn off the audio and video of the corresponding channel<br>
1: Turn off the audio of the corresponding channel and keep the video<br>
2: Turn off the video of the corresponding channel and keep the audio
</td>
</tr>
<tr>
<td>3</td>
<td>switch stream</td>
<td>BYTE</td>
<td>0: main stream; 1: sub stream</td>
</tr>
</tbody>
</table>

# 3. 13 Audio and video data transmission

Device side:  
When the device receives a video request from the platform, it uses the specified packet format (Table 3.13.1) to transmit data in the newly established connection. This packet format is extended on the basis of the IETF RFC 3550 RTP protocol.

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>frame header</td>
<td>DWORD</td>
<td>Fixed to 0x30316364</td>
</tr>
<tr>
<td>4</td>
<td>V</td>
<td>2 bits</td>
<td>fixed at 2</td>
</tr>
<tr>
<td></td>
<td>P</td>
<td>1 bit</td>
<td>fixed at 0</td>
</tr>
<tr>
<td></td>
<td>X</td>
<td>1 bit</td>
<td>fixed at 0</td>
</tr>
<tr>
<td></td>
<td>C</td>
<td>4 bits</td>
<td>fixed at 1</td>
</tr>
<tr>
<td>5</td>
<td>M</td>
<td>1 bit</td>
<td>Flag bit to confirm whether it is a complete data boundary</td>
</tr>
<tr>
<td></td>
<td>PT</td>
<td>7 bits</td>
<td>Load Type (Table 3.13.2)</td>
</tr>
<tr>
<td>6</td>
<td>package serial number</td>
<td>WORD</td>
<td>The initial value is 0. Each time an RTP packet is sent, the sequence number is incremented by 1.</td>
</tr>
<tr>
<td>8</td>
<td>SIM card number</td>
<td>BCD[6]</td>
<td>Terminal SIM card number</td>
</tr>
<tr>
<td>14</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>15</td>
<td>type of data</td>
<td>4 bits</td>
<td>
0000: Video I frame<br>
0001: Video P frame<br>
0010: Video B frame<br>
0011: Audio frame<br>
0100: Transparent transmission<br>
other reservations
</td>
</tr>
<tr>
<td></td>
<td>Multi-packet processing flags</td>
<td>4 bits</td>
<td>
0000: Atomic packet, not splittable<br>
0001: The first packet in multi-packet processing
</td>
</tr>
</tbody>
</table>



---



<table>
  <tr>
    <td colspan="2"></td>
    <td>0010: The last packet when processing multiple packets<br>0011: Intermediate package when processing multiple packages</td>
  </tr>
<tr>
    <td>16</td>
    <td>timestamp</td>
    <td>BYTE[8]</td>
    <td>Identifies the time (ms) corresponding to the current audio and video data packet, non-audio and video data does not have this field</td>
  </tr>
<tr>
    <td>24</td>
    <td>I frame interval</td>
    <td>WORD</td>
    <td>Time interval (ms) between adjacent I frames in video data, non-video frames do not have this field</td>
  </tr>
<tr>
    <td>26</td>
    <td>frame interval</td>
    <td>WORD</td>
    <td>The time interval (ms) between adjacent frames in the video data, non-video frames do not have this field</td>
  </tr>
<tr>
    <td>28</td>
    <td>data body length</td>
    <td>WORD</td>
    <td></td>
  </tr>
<tr>
    <td>30</td>
    <td>data body</td>
    <td>BYTE[n]</td>
    <td>The length of the data body does not exceed 950 bytes</td>
  </tr>
</table>

<table>
  <thead>
    <tr>
      <th>load type</th>
      <th>load name</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>6</td>
      <td>G.711A</td>
      <td>audio</td>
    </tr>
<tr>
      <td>7</td>
      <td>G.711U</td>
      <td>audio</td>
    </tr>
<tr>
      <td>8</td>
      <td>G.726</td>
      <td>audio</td>
    </tr>
<tr>
      <td>91</td>
      <td>Transparent transmission</td>
      <td>audio</td>
    </tr>
<tr>
      <td>98</td>
      <td>H.264</td>
      <td>video</td>
    </tr>
<tr>
      <td>99</td>
      <td>H.265</td>
      <td>video</td>
    </tr>
  </tbody>
</table>

# 3.14 Query the list of audio and video resources

Platform side:  
- message ID: 0x9205  
- Message structure: Table 3.14.1

<table>
  <thead>
    <tr>
      <th>Start byte</th>
      <th>Field</th>
      <th>Type of data</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>channel number</td>
      <td>BYTE</td>
      <td>start from 1</td>
    </tr>
<tr>
      <td>1</td>
      <td>Starting time</td>
      <td>BCD[6]</td>
      <td>YYMMDDHHMMSS</td>
    </tr>
<tr>
      <td>2</td>
      <td>End Time</td>
      <td>BCD[6]</td>
      <td>YYMMDDHHMMSS</td>
    </tr>
<tr>
      <td>13</td>
      <td>alarm sign</td>
      <td>64 bits</td>
      <td>0 means to search all resources, others are reserved</td>
    </tr>
<tr>
      <td>21</td>
      <td>Resource Type</td>
      <td>BYTE</td>
      <td>0: audio and video; 1: audio; 2: video; 3: audio or video</td>
    </tr>
<tr>
      <td>22</td>
      <td>Stream type</td>
      <td>BYTE</td>
      <td>0: all code streams; 1: main code stream; 2: sub code stream</td>
    </tr>
<tr>
      <td>23</td>
      <td>memory type</td>
      <td>BYTE</td>
      <td>0: All memory</td>
    </tr>
  </tbody>
</table>

device response:  
- message ID: 0x1205  
- Message structure: Table 3.14.2

<table>
  <thead>
    <tr>
      <th>Start byte</th>
      <th>Field</th>
      <th>Type of data</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>



---



<table>
<thead>
<tr>
<th>0</th>
<th>serial number</th>
<th>WORD</th>
<th>The serial number corresponding to the query command</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Total resources</td>
<td>DWORD</td>
<td>The number of resources that meet the query requirements</td>
</tr>
<tr>
<td>2</td>
<td>List of resources</td>
<td></td>
<td>See the data structure (Table 3.14.3)</td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>1</td>
<td>Starting time</td>
<td>BCD[6]</td>
<td>YYMMDDHHMMSS</td>
</tr>
<tr>
<td>2</td>
<td>End Time</td>
<td>BCD[6]</td>
<td>YYMMDDHHMMSS</td>
</tr>
<tr>
<td>13</td>
<td>alarm sign</td>
<td>64 bits</td>
<td>0 means to search all resources, others are reserved</td>
</tr>
<tr>
<td>21</td>
<td>Resource Type</td>
<td>BYTE</td>
<td>0: audio and video; 1: audio; 2: video</td>
</tr>
<tr>
<td>22</td>
<td>Stream type</td>
<td>BYTE</td>
<td>1: Main stream; 2: Sub stream</td>
</tr>
<tr>
<td>23</td>
<td>memory type</td>
<td>BYTE</td>
<td>0: All memory</td>
</tr>
<tr>
<td>24</td>
<td>File size</td>
<td>DWORD</td>
<td>Unit (byte)</td>
</tr>
</tbody>
</table>

## 3.15 Audio and video playback request

Platform side:  
message ID: 0x9201  
Message structure: Table 3.15.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Server IP length</td>
<td>BYTE</td>
<td>length n</td>
</tr>
<tr>
<td>1</td>
<td>Server IP address</td>
<td>STRING</td>
<td>IP address of the audio and video server to be connected</td>
</tr>
<tr>
<td>1 + n</td>
<td>TCP port</td>
<td>WORD</td>
<td></td>
</tr>
<tr>
<td>3 + n</td>
<td>UDP port</td>
<td>WORD</td>
<td></td>
</tr>
<tr>
<td>5 + n</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>6 + n</td>
<td>type of data</td>
<td>BYTE</td>
<td>0: audio and video; 1: audio; 2: video; 3: audio or video</td>
</tr>
<tr>
<td>7 + n</td>
<td>Stream type</td>
<td>BYTE</td>
<td>0: Main stream; 1: Substream; 0 when transmitting audio</td>
</tr>
<tr>
<td>8 + n</td>
<td>memory type</td>
<td>BYTE</td>
<td>0: All memory</td>
</tr>
<tr>
<td>9 + n</td>
<td>Playback method</td>
<td>BYTE</td>
<td>
0: normal playback<br>
1: Fast forward playback<br>
2: keyframe fast rewind playback<br>
3: Keyframe playback
</td>
</tr>
<tr>
<td>10 + n</td>
<td>Fast forward or rewind multiples</td>
<td>BYTE</td>
<td>
Valid when playback mode is 1 or 2<br>
0: invalid<br>
1: 1 times<br>
2: 2 times<br>
3: 4 times<br>
4: 8 times<br>
5: 16 times<br><br>
When the playback mode is 0, the multiplier is 0xff, and the data is sent at the fastest speed to download the video quickly
</td>
</tr>
</tbody>
</table>



---


# 3.16 Audio and video playback control

**Platform side：**  
Message ID: 0x9202  
Message structure: Table 3.16.1

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>channel number</td>
<td>BYTE</td>
<td>start from 1</td>
</tr>
<tr>
<td>1</td>
<td>playback control</td>
<td>BYTE</td>
<td>
0: Start playback<br>
1: Pause playback<br>
2: End playback<br>
3: Fast forward playback<br>
4: Keyframe fast rewind playback<br>
5: Drag playback<br>
6: Keyframe playback
</td>
</tr>
<tr>
<td>2</td>
<td>Fast forward or rewind multiples</td>
<td>BYTE</td>
<td>
Valid when playback mode is 3 or 4<br>
0: invalid<br>
1: 1 times<br>
2: 2 times<br>
3: 4 times<br>
4: 8 times<br>
5: 16 times
</td>
</tr>
<tr>
<td>3</td>
<td>Drag playback position</td>
<td>BCD[6]</td>
<td>YYMMDDHHMMSS, valid when playback mode is 5</td>
</tr>
</tbody>
</table>

The platform sends this message when it needs to play back the audio and video of the device. After receiving this message, the device will give a general response, and then establish a new connection with the designated video server. The previous communication connection remains unchanged, video data transmission see 3.13.

----

# 3.17 ULV parameter configuration network protocol description

**Platform “get/set” parameters**  
Message ID: 0xB050.  
The format of the message body data is shown in Table 3.17.1

<table>
<thead>
<tr>
<th>Start Byte</th>
<th>Field</th>
<th>Data Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Type</td>
<td>DWORD</td>
<td>Not used yet, just fill in 0</td>
</tr>
<tr>
<td>4</td>
<td>parameter length</td>
<td>DWORD</td>
<td></td>
</tr>
<tr>
<td>8</td>
<td>string parameter</td>
<td>BYTE[]</td>
<td></td>
</tr>
</tbody>
</table>

**Device replies with "get/set" parameters**  
Message ID: 0xB051.  
The format of the message body data is shown in Table 3.17.2



---



<table>
  <thead>
    <tr>
      <th>Start Byte</th>
      <th>Field</th>
      <th>Field Data Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Reply serial number</td>
      <td>WORD</td>
      <td>Corresponding serial number</td>
    </tr>
<tr>
      <td>2</td>
      <td>parameter length</td>
      <td>DWORD</td>
      <td></td>
    </tr>
<tr>
      <td>6</td>
      <td>string parameter</td>
      <td>BYTE[]</td>
      <td>Reply "parameters"</td>
    </tr>
  </tbody>
</table>

Description: String parameters are transmitted in json, and "get and set" are distinguished by "keywords"

Generic "keywords":
* CmdType: Command type (Get/Set), see Table 3.17.3
* ParamType: Parameter type, this "keyword" is used to distinguish different types of parameter configurations, see Table 3.17.4
* Other "keywords": other "keywords" are the specific parameters of ParamType, see the corresponding example

<p>Table 3.17.3 Command Keywords (CmdType)</p>

<table>
  <thead>
    <tr>
      <th>Keywords</th>
      <th>the value of the keyword</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">CmdType</td>
      <td>Get</td>
      <td>get parameters</td>
    </tr>
<tr>
      <td>Set</td>
      <td>Setting parameters</td>
    </tr>
  </tbody>
</table>

<p>Table 3.17.4 Parameter type keyword (ParamType)</p>

<table>
  <thead>
    <tr>
      <th>Keywords</th>
      <th>the value of the keyword</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="9" style="color:red;">ParamType</td>
      <td style="color:red;">GenDevInfo</td>
      <td>Set MDVR basic information, see corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">GenDateTime</td>
      <td>Set the system time, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">GenDst</td>
      <td>Set daylight saving time, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">GenStartUp</td>
      <td>Set the power configuration parameters, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">GenUser</td>
      <td>Set the administrator account password, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">VehBaseInfo</td>
      <td>Set vehicle and driver information, see corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">VehPosition</td>
      <td>Set GPS information parameters, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">VehMileage</td>
      <td>Set the vehicle mileage, see the corresponding example</td>
    </tr>
<tr>
      <td style="color:red;">RecAttr</td>
      <td>Set the recording attribute parameters, see the</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tbody>
    <tr>
      <td>RecStream_M</td>
      <td>Set the main code stream, see the corresponding example</td>
    </tr>
<tr>
      <td>RecStream_S</td>
      <td>Set the sub-code stream, see the corresponding example</td>
    </tr>
<tr>
      <td>ReCamAttr</td>
      <td>Set camera attribute parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>ReCapAttr</td>
      <td>Set the image capture interval, see the corresponding example</td>
    </tr>
<tr>
      <td>AlmIoIn</td>
      <td>Set IO alarm input parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>AlmSpd</td>
      <td>Set the speed limit information parameter, see the corresponding example</td>
    </tr>
<tr>
      <td>AlmGsn</td>
      <td>Set the Gsensor alarm, see the corresponding example</td>
    </tr>
<tr>
      <td>Driving</td>
      <td>Set fatigue driving parameters, see corresponding examples</td>
    </tr>
<tr>
      <td>NetWired</td>
      <td>Set wired network parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>NetWifi</td>
      <td>Set WiFi parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>NetXg</td>
      <td>Set 4G parameter configuration, see the corresponding example</td>
    </tr>
<tr>
      <td>NetCms</td>
      <td>Set cms parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>NetFtp</td>
      <td>Set ftp parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>PerUart</td>
      <td>Set the serial port configuration parameters, see the corresponding example</td>
    </tr>
<tr>
      <td>PerIoOutput</td>
      <td>Set IO output configuration parameters, see the corresponding example</td>
    </tr>
  </tbody>
</table>

## Get Parameter Example
```json
{
  "CmdType" : "Get",
  "ParamType" : "VehBaseInfo"
}
```
> Note: ParamType values are shown in Table 3.17.4

## Example of setting parameters

### 1. Device information
```json
{
  "CmdType":"Set",
```


---


```json
"ParamType":"GenDevInfo",
"DevId":"90123467893",
"DevName":"MDVR1"
}
```
**DevId**: string, the maximum device ID is 31 characters  
**DevName**: string, the maximum length of device name is 31 characters  

## 2. System time
```json
{
  "CmdType":"Set",
  "ParamType":"GenDateTime",
  "DateFormat":0,
  "DateTime":"2022/12/06 14:55:43",
  "GpsSync":1,
  "NtpSync":"1,1",
  "TimeFormat":0,
  "Zone":"20,0"
}
```
**DateFormat**: integer, date display mode  
- 0: MMDDYY  
- 1: YYMMDD  
- 2: DDMMYY  

**DateTime**: string, "year/month/day hour: minute: second"  
**GpsSync**: integer, GPS timing switch, 0: off, 1: on  
**NtpSync**: string, "Ntp timing switch, Ntp timing server"  
- Ntp timing switch, 0: off, 1: on  
- Ntp timing server, 0: time.windows.com  
- 1: pool.ntp.org  

**TimeFormat**: integer, time display mode  
- 0: 24 hours  
- 1: 12 hours  

**Zone**: string, "time zone, offset time"  
- time zone 0-24 means 25 time zones from West 12 to East 12  
- 0: West 12  
- 1: West 11  
- 12: 0 time zone  
- 13: East 1  
- 24: East 12  
- Offset time  
  - 0: +0 minutes  
  - 1: +15 minutes  
  - 2: +30 minutes  
  - 3: +45 minutes  

## 3. Daylight Saving Time
```json
{
  "CmdType":"Set",
  "ParamType":"GenDst",
  "Enable":1,
  "Mode":0,
  "OffsetTime":0,
  "StartTime":"0,0,00:00:00",
  "EndTime":"0,0,00:00:00"
}
```
**Enable**: enable switch, 0: off, 1: on  
**Mode**: mode, 0: date mode, 1: week mode  
**OffsetTime**: offset time, 0: 1 hour  
**StartTime**: start time  
- date mode: "month, day, hour: minute: second"  
- week mode: "month, day of week, hour: minute: second"  

**Month**:  
- 0: January  
- 11: December  
- 0: the first  
- 30: 31  


---


Week: 0: Sunday 6: The first one on Saturday: 0: The first one 3: the fourth 4: the last  
EndTime: end time, date mode "month, day, hour: minute: second", week mode "month, day of week, hour: minute: second"  
Month: 0: January 11: December: 0: the first 30: 31  
Week: 0: Sunday 6: The first one on Saturday: 0: The first one 3: the fourth 4: the last  

## 4. Switch on/off
```json
{
  "CmdType": "Set",
  "ParamType": "GenStartUp",
  "Mode": 0,
  "DelayTime": 10,
  "RunTime": "06:00:00,23:00:00",
  "PwrProtect": "1,90",
  "RebootTime": "0,00:00:00",
  "WakeUpInteval": 10
}
```

* **Mode**: mode 0: ACC mode, 1: timing mode  
* **DelayTime**: delay time min max 9999 min  
* **RunTime**: power-on time "power-on time, power-off time"  
* **PwrProtect**: level protection (0.1V) "enable switch, voltage threshold"  
* **Enable switch**: 0 close, 1 open voltage threshold: 360 maximum and 70 minimum  
* **RebootTime**: timed restart "enable switch, restart time"  
* **Enable switch**: 0 off, 1 on Restart time: hours, minutes and seconds  
* **WakeUpInternal**: Wake up interval in sleep mode, min, maximum 255 min  

## 5. User settings
```json
{
  "CmdType": "Set",
  "ParamType": "GenUser",
  "Enable": 1,
  "User_00": {"Name": "Admin", "Password": "888888"},
  "User_01": {"Name": "Guest", "Password": "000000"}
}
```

* **Enable**: enable switch 0 off, 1 on  
* **Password**: Up to 8 digits of password  
* **Note**: Do not change the user name and user order  

## 6. Vehicle information
```json
{
  "CmdType": "Set",
  "ParamType": "VehBaseInfo",
  "ShortName": 0,
  "CarPlate": "B65324"
}
```


---


```
"PhoneNum":"123123",
"Company":"ULV-BW",
"AssemblyDate":"2021/12/25",
"DriverLic":"123456789abcdef",
"DriverName":"Ni Heng Suai"
}
```

**ShortName:** abbreviation of provincial capital of Chinese license plate,  
0: None  
1: Beijing  
2: Tianjin  
3: Ji  
4: Jin  
5: Inner  
6: Liao  
7: Ji  
8: Black  
9: Shanghai  
10: Su  
11: Zhe  
12: Wan  
13: Min  
14: Gan  
15: Lu  
16: Yu  
17: E  
18: Xiang  
19: Yue  
20: Gui  
21: Qiong  
22: Yu  
23: Chuan  
24: Gui  
25: Yun  
26: Zang  
27: Shan  
28: Gan  
29: Qing  
30: Xin  
31: Hong Kong  
32: Macao  
33: Taiwan  

**CarPlate:** license plate number, up to 10 characters  
**PhoneNum:** phone number, up to 16 characters  
**DriverName:** Driver name, up to 25 characters  
**DriverLic:** Driver license number, up to 15 characters  
**Company:** company name, up to 32 characters  
**AssemblyDate:** installation date, "MM/DD/YY"  

## 7.Vehicle positioning
```json
{
  "CmdType": "Set",
  "ParamType": "VehPosition",
  "GpsBatchNum": 5,
  "GpsUpInterval": 3
}
```
**GpsBatchNum:** the number of GPS batch uploads, up to 30  
**GpsUpInterval:** GPS interval (s), maximum 255  

## 8.Vehicle mileage
```json
{
  "CmdType": "Set",
  "ParamType": "VehMileage",
  "BaseV": 12
}
```
**BaseV:** vehicle mileage (km)  

## 9.Recording Properties
```json
{
  "CmdType": "Set",
  "ParamType": "RecAttr",
  "Duration": 30,
  "Encrypt": "0,0",
  "FileFormat": 0,
  "Mode": 0,
  "PreDuration": 10,
```


---


"SaveDays":0,  
"StreamType":0,  
"VencFormat":1  
}  

**Duration**: duration of video file (min), minimum 5, maximum 99  
**Encrypt**: video encryption, "enable switch, password", enable switch, 0 off, 1 on, password up to 31 digits  
**FileFormat**: video file format, 0: asf  
**Mode**: recording mode, 0: boot recording 1: alarm recording 2: timing recording  
**PreDuration**: Pre-delayed recording duration (s), maximum 10  
**SaveDays**: the number of days to save the alarm video file, up to 99  
**StreamType**: video stream, 0: main stream 1: sub-stream 2: dual stream  
**VencFormat**: video encoding format, 0: H264 1: H265  

## 10. Main code stream  
```json
{
  "CmdType": "Set",
  "ParamType": "RecStream_M",
  "Chn_00": {"Enable":1, "FrmRate":15, "Qp":2, "Res":4},
  "Chn_01": {"Enable":1, "FrmRate":15, "Qp":2, "Res":4},
  "Chn_02": {"Enable":1, "FrmRate":15, "Qp":2, "Res":4},
  "Chn_03": {"Enable":1, "FrmRate":15, "Qp":2, "Res":4}
}
```
- **Enable**: enable switch 0 off 1 on  
- **FrmRate**: frame rate  
- **Qp**: picture quality, 0: excellent 1: good 2: good 3: general  
- **Res**: resolution, 0: CIF 1: D1 2:960H 3:720P 4:1080N 5:1080P  
- **Audio**: Recording switch 0 off 1 on  

## 11. Sub-code stream  
```json
{
  "CmdType": "Set",
  "ParamType": "RecStream_S",
  "Chn_00": {"Enable":1, "FrmRate":15, "Qp":2, "Res":0},
  "Chn_01": {"Enable":1, "FrmRate":15, "Qp":2, "Res":0},
  "Chn_02": {"Enable":1, "FrmRate":15, "Qp":2, "Res":0},
  "Chn_03": {"Enable":1, "FrmRate":15, "Qp":2, "Res":0}
}
```
- **Enable**: enable switch 0 off 1 on  
- **FrmRate**: frame rate  
- **Qp**: picture quality, 0: excellent 1: good 2: good 3: general  
- **Res**: resolution, 0: CIF 1: D1 2:960H 3:720P 4:1080N 5:1080P  
- **Audio**: Recording switch 0 off 1 on  


---


# 12. Camera Properties
```json
{
  "CmdType": "Set",
  "ParamType": "ReCamAttr",
  "Chn_00": {"Direction": 0, "Enable": 1, "FrmRate": 0, "Mode": 0, "Res": 4, "Type": 0},
  "Chn_01": {"Direction": 0, "Enable": 1, "FrmRate": 0, "Mode": 0, "Res": 4, "Type": 0},
  "Chn_02": {"Direction": 0, "Enable": 1, "FrmRate": 1, "Mode": 0, "Res": 5, "Type": 0},
  "Chn_03": {"Direction": 0, "Enable": 1, "FrmRate": 1, "Mode": 0, "Res": 5, "Type": 0}
}
```

**Direction:** direction, 0: normal 1: mirror 2: flip 3: mirror flip  
**Enable:** enable switch 0 off 1 on  
**FrmRate:** frame rate, 0: 25 frames, 1: 30 frames  
**Mode:** mode, 0: automatic mode 1: manual mode  
**Res:** resolution, 0: CIF 1: D1 2: 960H 3: 720P 4: 1080N 5: 1080P  
**Type:** Type, 0: AHD 1: CVI 2: TVI 3: CVBS  

# 13. Photo capture
```json
{
  "CmdType": "Set",
  "ParamType": "ReCapAttr",
  "Enable": 0,
  "SaveDays": 30,
  "Inteval": 60,
  "ChnMask": 255,
  "UploadEn": 0
}
```

**Enable:** enable switch 0 off 1 on  
**SaveDays:** save time (day), minimum 1, maximum 99  
**Inteval:** capture interval (s), minimum 10, maximum 65535  
**ChnMask:** capture channel mask. A bit value of 1 means that the channel is enabled for capture.  
- bit0: 1 channel  
- bit1: 2 channel  
**UploadEn:** upload enable switch, 0: off 1: on  

# 14. IO input alarm
```json
{
  "CmdType": "Set",
  "ParamType": "AlmIoIn",
  "Chn_00": {
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0"
  }
}
```


---


```json
{
  "LnkRec": "0,255",
  "Thr": 0,
  "Type": 0
},
"Chn_01": {
  "En": 0,
  "LnkBz": "0,0",
  "LnkCap": "0,0",
  "LnkIoOut": "0,0,0",
  "LnkPopup": "0,0,0",
  "LnkRec": "0,255",
  "Thr": 0,
  "Type": 0
},
"Chn_02": {
  "En": 0,
  "LnkBz": "0,0",
  "LnkCap": "0,0",
  "LnkIoOut": "0,0,0",
  "LnkPopup": "0,0,0",
  "LnkRec": "0,255",
  "Thr": 0,
  "Type": 0
},
"Chn_03": {
  "En": 0,
  "LnkBz": "0,0",
  "LnkCap": "0,0",
  "LnkIoOut": "0,0,0",
  "LnkPopup": "0,0,0",
  "LnkRec": "0,255",
  "Thr": 0,
  "Type": 0
}
```

* `En`: enable switch, 0: off 1: on  
* `Thr`: trigger level, 0: low level 1: high level  
* `Type`: type, 0: default 1: air conditioning 2: SOS 3: front door 1 4: front door 2 5: middle door 6: rear door 7: reverse 8: left turn 9: right turn  
* `LnkBz`: buzzer configuration, the first parameter represents the enable switch, and the second parameter represents the number of drop-down options in the drop-down box  
* `LnkCap`: snapshot configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0: 1 channel, bit1: 2 channel, Bit value 0 means unchecked, 1 means checked  


---


**LnkIoOut:** IO output configuration, the first parameter represents the enable switch, the second parameter represents the state of the second parameter in the IO out configuration, and the third parameter represents the state of the third parameter in the IO out configuration  
**LnkPopup:** single-channel amplification configuration, the first parameter represents the enable switch, the second parameter represents the channel, and the third parameter represents the duration, in seconds  
**LnkRec:** alarm recording configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  

## 15. Speed alarm
```json
{
  "CmdType": "Set",
  "ParamType": "AlmSpd",
  "MaxSpd": {    // Speed Alarm
    "En": 0,     // Enable switch, 0: Off 1: On
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 120   // Speed threshold (km/h)
  },
  "MinSpd": {    // Low speed alarm
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 30    // Speed threshold (km/h)
  },
  "Parking": {   // Parking timeout alarm
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 120   // Parking duration threshold (s), maximum 9999
  }
}
```

**LnkBz:** buzzer configuration, the first parameter represents the enable switch, and the second parameter represents the number of drop-down options in the drop-down box  


---


LnkCap: snapshot configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  
LnkIoOut: IO output configuration, the first parameter represents the enable switch, the second parameter represents the state of the second parameter in the IO out configuration, and the third parameter represents the state of the third parameter in the IO out configuration  
LnkPopup: single-channel amplification configuration, the first parameter represents the enable switch, the second parameter represents the channel, and the third parameter represents the duration, in seconds  
LnkRec: alarm recording configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  

## 16. Gsensor alarm  
```json
{
  "CmdType": "Set",
  "ParamType": "AlmGsn",
  "Mode": 0,
  "X": {
    "En": 0,  // Enable switch, 0: Off 1: On
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 30  // Threshold (0.01g), maximum 9999, minimum 5
  },
  "Y": {
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 30
  },
  "Z": {
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 30
  }
}
```


---


LnkBz: buzzer configuration, the first parameter represents the enable switch, and the second parameter represents the number of drop-down options in the drop-down box  
LnkCap: snapshot configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  
LnkIoOut: IO output configuration, the first parameter represents the enable switch, the second parameter represents the state of the second parameter in the IO out configuration, and the third parameter represents the state of the third parameter in the IO out configuration  
LnkPopup: single-channel amplification configuration, the first parameter represents the enable switch, the second parameter represents the channel, and the third parameter represents the duration, in seconds  
LnkRec: alarm recording configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  
**Mode**: alarm mode, 0 represents scene mode, 1 represents value mode  

## 17. Driving status alarm  
```json
{
  "CmdType": "Set",
  "ParamType": "Driving",
  "MinRest": 15,
  "PreTired": {  // Fatigue warning
    "En": 0,  // Enable switch, 0: Off 1: On
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 120  // Driving duration threshold (min), maximum 9999
  },
  "Tired": {  // Fatigue alarm
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
    "LnkIoOut": "0,0,0",
    "LnkPopup": "0,0,0",
    "LnkRec": "0,255",
    "Thr": 180  // Driving duration threshold (min), maximum 9999
  },
  "TimeOut": {  // Driving overtime alarm
    "En": 0,
    "LnkBz": "0,0",
    "LnkCap": "0,0",
```


---


"LnkIoOut":"0,0,0",  
"LnkPopup":"0,0,0",  
"LnkRec":"0,255",  
"Thr":240 //Driving duration threshold (min), maximum 9999  
},  
"LogoutAlarmEN":0 //When not logged in, if the vehicle has speed and the buzzer sounds, 0: does not sound 1: sounds  
}  

**LnkBz**: buzzer configuration, the first parameter represents the enable switch, and the second parameter represents the number of drop-down options in the drop-down box  
**LnkCap**: snapshot configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  
**LnkIoOut**: IO output configuration, the first parameter represents the enable switch, the second parameter represents the state of the second parameter in the IO out configuration, and the third parameter represents the state of the third parameter in the IO out configuration  
**LnkPopup**: single-channel amplification configuration, the first parameter represents the enable switch, the second parameter represents the channel, and the third parameter represents the duration, in seconds  
**LnkRec**: alarm recording configuration, the first parameter represents enable switch, the second parameter represents channel mask, bit0:1 channel, bit1:2 channel, Bit value 0 means unchecked, 1 means checked  

## 18. Wired network  
```json
{
  "CmdType": "Set",
  "ParamType": "NetWired",
  "Enable": 0,
  "IP": "192.168.0.108",
  "SubMask": "255.255.255.0",
  "Gateway": "192.168.0.254",
  "DNS1": "114.114.114.114",
  "DNS2": "0.0.0.0",
  "DhcpEn": 0
}
```  
* Enable: enable switch, 0: off 1: on  
* DhcpEn: DHCP enable switch, 0: Off 1: On  

## 19. WiFi  
```json
{
  "CmdType": "Set",
  "ParamType": "NetWifi",
  "Enable": 0,
  "Mode": 1,
```


---


```
"Pwd":"12345678",
"SSID":"w1234",
"DhcpEn":1,
"EncryptType":0
}
```

**Enable:** enable switch, 0: off 1: on  
**Mode:** mode, 0: Sta automatic 1: Sta manual 2: AP  
**SSID:** SSID, maximum 31 bits  
**Pwd:** password, maximum 31 digits  
**DhcpEn:** DHCP enable switch, 0: Off 1: On  
**EncryptType:** encryption method, 0: None 1: WEP 2: WPA/WPA2-PSK 3: WPA-PSK 4: WPA2-PSK 5: UNKNOW  

## 20. 3G/4G
```
{
  "CmdType":"Set",
  "ParamType":"NetXg",
  "Enable":1,
  "Mode":0,
  "APN":"3gnet",
  "CenterNum":"*99#",
  "User":"",
  "Pwd":"",
  "AuthType":0
}
```

**Enable:** enable switch, 0: off 1: on  
**Mode:** mode, 0: hybrid network 1:2G 2:3G_ WCDMA 3:3G_ EVDO 4:3G_ TD_ SCDMA 5:4G_ LTE  
**APN:** APN, maximum 31 bits  
**CenterNum:** center number, up to 15 digits  
**User:** User name, maximum 15 digits  
**Pwd:** password, maximum 15 digits  
**AuthType:** authentication method, 0: no authentication 1: CHAP 2: PAP  

## 21. Cms platform
```
{
  "CmdType":"Set",
  "ParamType":"NetCms",
  "Server_00":{"Enable":1,"Protocol":2,"ServersAddr":"120.79.58.1:6608","VisitType":0},
  "Server_01":{"Enable":0,"Protocol":0,"ServersAddr":"120.79.58.1:6608","VisitType":0}
}
```

**Enable:** enable switch, 0: off 1: on  
**Protocol:** protocol type, 0: none, 1: cmsv6, 2: jt808_ 2019，3:jt808_ two thousand and thirteen  
**VisitType:** ip access or domain name access, 0: ip 1: domain name  


---


# 22. FTP
```json
{
  "CmdType": "Set",
  "ParamType": "NetFtp",
  "Enable": 1,
  "ServersAddr": "120.79.58.1:2121",
  "User": "admin",
  "Pwd": "cmsserverv6"
}
```
**Enable**: enable switch, 0: off 1: on  
**User**: User name, maximum 16 digits  
**Pwd**: password, maximum 16 bits  

# 23. Serial port configuration
```json
{
  "CmdType": "Set",
  "ParamType": "PerUart",
  "Uart_00": {"BaudRate":0, "DataBit":0, "DevType":0, "Enable":0, "IntfType":0, "StopBit":0, "Verify":0},
  "Uart_01": {"BaudRate":0, "DataBit":0, "DevType":0, "Enable":0, "IntfType":1, "StopBit":0, "Verify":0},
  "Uart_02": {"BaudRate":0, "DataBit":0, "DevType":0, "Enable":0, "IntfType":2, "StopBit":0, "Verify":0},
  "Uart_03": {"BaudRate":0, "DataBit":0, "DevType":0, "Enable":0, "IntfType":3, "StopBit":0, "Verify":0}
}
```
**Enable**: enable switch, 0: off 1: on  

**IntfType**: interface type  
- 0: RS232_1  
- 1: RS232_2  
- 2: RS485_1  
- 3: RS485_2  
- 4: ttyUSB1  
- 5: ttyUSB2  

**DevType**: peripheral type  
- 0: None  
- 1: rfid-R21S  
- 2: pcTool-VN  
- 3: fuel  
- 4: Tranmission  
- 5: rfid-147  
- 6: Screen-YX  
- 7: TempHmii  
- 8: rfid-988  
- 9: rfid F-PROT  
- 10: LED Panel  
- 11: rfid-W2193  
- 12: Tpms-TDS100  
- 13: rfid-W2193_2  
- 14: fuel-LIGO  
- 15: fuel-LIGO-EUP  
- 16: fuel-UL212-EUP  

**BaudRate**: Baud rate  
- 0: 1200  
- 1: 2400  
- 2: 4800  
- 3: 9600  
- 4: 19200  
- 5: 38400  
- 6: 57600  
- 7: 115200  

**DataBit**: data bit  
- 0: 8  
- 1: 7  
- 2: 6  
- 3: 5  

**StopBit**: stop bit  
- 0: 1  
- 1: 2  

**Verify**: check bit  
- 0: none  
- 1: odd check  
- 2: even check  

# 24. IO output
```json
{
  "CmdType": "Set",
  "ParamType": "PerIoOutput",
  "IoOut_1": 0,
  "IoOut_2": 0
}
```
**IoOut_1**: IO output 1 mode, 0: alarm linkage 1: control switch  
**IoOut_2**: IO output 2 mode, 0: alarm linkage 1: control switch  

# 25. CMS protocol upload stream


---


# Protocol Specification

```json
{
 "CmdType":"Set",
 "ParamType":"OtherParam",
 "CmsUploadStream":0
}
```

CmsUploadStream: CMS protocol upload stream type, 0: upload main stream  1: upload sub stream

## 3.18 MDVR upload number of passengers  
Message ID: 0x1005.  
Packet type: Signaling data packet.  
The terminal device counts the passengers getting on and off the bus through video analysis, and sends the counting results to the platform. The data format of the message body is shown in Table 3.18.

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Start time</td>
<td>BCD[6]</td>
<td>YY-MM-DD-HH-MM-SS</td>
</tr>
<tr>
<td>6</td>
<td>End time</td>
<td>BCD[6]</td>
<td>YY-MM-DD-HH-MM-SS</td>
</tr>
<tr>
<td>12</td>
<td>Number of people get on</td>
<td>WORD</td>
<td>Number of people get on from the start time to the end time</td>
</tr>
<tr>
<td>14</td>
<td>Number of people get off</td>
<td>WORD</td>
<td>Number of people get off from the start time to the end time</td>
</tr>
</tbody>
</table>

## 3.19 The server queries the vehicle information  
Platform side：  
* Message ID: 0xB040  
* The message body is empty  

Device response：  
* Message ID: 0x4040  
* The message body data format is shown in Table 3.19.1  

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Answer the serial number</td>
<td>WORD</td>
<td>Specifies the serial number to be delivered</td>
</tr>
<tr>
<td>2</td>
<td>Number of parameters</td>
<td>BYTE</td>
<td></td>
</tr>
<tr>
<td>3</td>
<td>Parameter list</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th>Field</th>
<th>Type of data</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>The parameter ID</td>
<td>DWORD</td>
<td>See the following table for parameter</td>
</tr>
</tbody>
</table>



---



<table>
  <tr>
    <td colspan="3" rowspan="1"></td>
  </tr>
<tr>
    <td>Parameter length</td>
    <td>BYTE</td>
    <td></td>
  </tr>
</table>

The list of parameters

<table>
  <thead>
    <tr>
      <th>Start byte</th>
      <th>Field</th>
      <th>Type of data</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0x01</td>
      <td>The manufacturer ID</td>
      <td>BTYE[5]</td>
      <td></td>
    </tr>
<tr>
      <td>0x02</td>
      <td>Terminal type</td>
      <td>BYTE[20]</td>
      <td></td>
    </tr>
<tr>
      <td>0x03</td>
      <td>Version</td>
      <td>BYTE[40]</td>
      <td>
        Firmware version(BYTE[20])<br>
        Hardware version(BYTE[20])
      </td>
    </tr>
<tr>
      <td>0x04</td>
      <td>Audio load type</td>
      <td>BTYE</td>
      <td>See table 3.13.2</td>
    </tr>
<tr>
      <td>0x05</td>
      <td>The channel information</td>
      <td>BYTE[12]</td>
      <td>
        The number of channels(DWORD)<br>
        Video loss status (DWORD) By bit (1: lost 0: normal)<br>
        Video Recording Status (DWORD) by bit (1: video recording)
      </td>
    </tr>
<tr>
      <td>0x06</td>
      <td>Hard disk information</td>
      <td>BYTE[4+8*N]</td>
      <td>
        Number of Hard Disks (DWORD)<br>
        Total Capacity of Disk A1 (DWORD)<br>
        Disk A1 Remaining Capacity (DWORD)<br>
        Disk A2 Total capacity (DWORD)<br>
        Disk A2 Remaining Capacity (DWORD)<br>
        Units (MB)
      </td>
    </tr>
<tr>
      <td>0x07</td>
      <td>The wireless network</td>
      <td>BYTE[18]</td>
      <td>
        Network type (BYTE) (0:2G; 1:3G-EVDO; 2:3G-WCDMQA 3:TD_CMDMA; 4:TD_LED; 5:FDD)<br>
        Network address (BYTE[16])<br>
        Network quality (BYTE) 0-100
      </td>
    </tr>
<tr>
      <td>0x08</td>
      <td>WiFi network Status</td>
      <td>BTYE[33]</td>
      <td>
        Hotspot name (BYTE[16])<br>
        Network address (BYTE[16])<br>
        Network quality (BYTE) 0-100
      </td>
    </tr>
<tr>
      <td>0x09</td>
      <td>IMEI</td>
      <td>BYTE[15]</td>
      <td></td>
    </tr>
<tr>
      <td>0x0A</td>
      <td>Hard disk type</td>
      <td>BYTE</td>
      <td>1:SD card 2: hard disk 3:SSD</td>
    </tr>
  </tbody>
</table>

## 3.20 Terminal control

Message ID: `0x8105`  
Example: `7e 81 05 40 01 01 00 00 00 00 90 12 34 56 78 98 00 04 74 b4 7e`

<table>
  <thead>
    <tr>
      <th>Command word</th>
      <th>parameter</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0x70</td>
      <td>None</td>
      <td>Disconnect the oil</td>
    </tr>
<tr>
      <td>0x71</td>
      <td>None</td>
      <td>Recovery oil</td>
    </tr>
<tr>
      <td>0x72</td>
      <td>None</td>
      <td>Disconnect the circuit</td>
    </tr>
  </tbody>
</table>



---



<table>
  <tr>
    <td>0x73</td>
    <td>None</td>
    <td>Recovery circuit</td>
  </tr>
<tr>
    <td>0x74</td>
    <td>None</td>
    <td>Restart the device</td>
  </tr>
</table>

## 3.21 File upload instructions

Message ID: 0x9206.  
Message type: signaling data message.  

The platform sends a text upload command to the terminal, and the terminal replies to the general response and uploads the file to the specified path of the target FTP server through FTP. See Table 3.21.1 for message body data format.

<table>
  <thead>
    <tr>
      <th>Start byte</th>
      <th>Field</th>
      <th>Data type</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Server address length</td>
      <td>BYTE</td>
      <td>Length k</td>
    </tr>
<tr>
      <td>1</td>
      <td>server address</td>
      <td>STRING</td>
      <td>FTP server address</td>
    </tr>
<tr>
      <td>1+k</td>
      <td>port</td>
      <td>WORD</td>
      <td>FTP server port number</td>
    </tr>
<tr>
      <td>3+k</td>
      <td>User name length</td>
      <td>BYTE</td>
      <td>Length l</td>
    </tr>
<tr>
      <td>4+k</td>
      <td>user name</td>
      <td>STRING</td>
      <td>FTP user name</td>
    </tr>
<tr>
      <td>4+k+l</td>
      <td>Password length</td>
      <td>BYTE</td>
      <td>Length m</td>
    </tr>
<tr>
      <td>5+k+l</td>
      <td>password</td>
      <td>STRING</td>
      <td>FTP password</td>
    </tr>
<tr>
      <td>5+k+l+m</td>
      <td>File upload path length</td>
      <td>BYTE</td>
      <td>Length n</td>
    </tr>
<tr>
      <td>6+k+l+m</td>
      <td>File upload path</td>
      <td>STRING</td>
      <td>File upload path</td>
    </tr>
<tr>
      <td>6+k+l+m+n</td>
      <td>Logical channel number</td>
      <td>BYTE</td>
      <td>Start at 1</td>
    </tr>
<tr>
      <td>7+k+l+m+n</td>
      <td>Start time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-HH-MM-SS</td>
    </tr>
<tr>
      <td>13+k+l+m+n</td>
      <td>End time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-HH-MM-SS</td>
    </tr>
<tr>
      <td>19+k+l+m+n</td>
      <td>Alarm sign</td>
      <td>64BITS</td>
      <td>Not used temporarily, fill in 0</td>
    </tr>
<tr>
      <td>27+k+l+m+n</td>
      <td>Audio and video resource type</td>
      <td>BYTE</td>
      <td>0: audio and video, 1: audio, 2: video, 3: video or audio</td>
    </tr>
<tr>
      <td>28+k+l+m+n</td>
      <td>Stream type</td>
      <td>BYTE</td>
      <td>0: main code stream or sub-code stream, 1: main code stream, 2: sub-code stream</td>
    </tr>
<tr>
      <td>29+k+l+m+n</td>
      <td>Storage location</td>
      <td>BYTE</td>
      <td>0: main storage or disaster recovery storage, 1: main storage, 2: disaster recovery storage</td>
    </tr>
<tr>
      <td>30+k+l+m+n</td>
      <td>Task execution conditions</td>
      <td>BYTE</td>
      <td>Bit0: WIFI, when it is 1, it means it can be downloaded under WIFI;</td>
    </tr>
  </tbody>
</table>



---


Bit1: LAN, if it is 1, it means it can be downloaded when connecting to the LAN;  
Bit2: 3G/4G, when it is 1, it means it can be downloaded when 3G/4G is connected

# 3.22 File upload completion notice
- Message ID: 0x1206.  
- Message type: signaling data message.  
- When all files are notified to FTP upload, the terminal reports this instruction to notify the platform. See Table 3.22.1 for message body data format.

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Data type</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Response serial number</td>
<td>WORD</td>
<td>The serial number of the corresponding platform file upload message</td>
</tr>
<tr>
<td>2</td>
<td>Result</td>
<td>BYTE</td>
<td>0: Success;<br>1: Failed</td>
</tr>
</tbody>
</table>

# 3.23 File upload control
- Message ID: 0x9207.  
- Message type: signaling data message.  
- The platform notifies the terminal to suspend, continue or cancel all files being transferred. See Table 3.23.1 for message body data format.

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Data type</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Response serial number</td>
<td>WORD</td>
<td>The serial number of the corresponding platform file upload message</td>
</tr>
<tr>
<td>2</td>
<td>Upload control</td>
<td>BYTE</td>
<td>0: Pause;<br>1: Continue;<br>2: Cancel</td>
</tr>
</tbody>
</table>

# 3.24. MDVR Upload Passenger Data
- Message ID: 0x0D03.  
- Message type: Signaling data message.  
- The terminal device counts passengers boarding and alighting through video analysis, identifies the station through GPS, and sends the counting results to the platform. The message body data format is shown in Table 3.24.1.

<table>
<thead>
<tr>
<th>Start byte</th>
<th>Field</th>
<th>Data type</th>
<th>Describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Alarm Flag</td>
<td>DWORD</td>
<td>Definition of Alarm Flag Bits (Table 3.5.3)</td>
</tr>
<tr>
<td>4</td>
<td>status</td>
<td>DWORD</td>
<td>Status bit definition (Table 3.5.4)</td>
</tr>
</tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th>Byte</th>
      <th>Field</th>
      <th>Data Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>8</td>
      <td>Latitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10 to the nearest millionth of a degree.</td>
    </tr>
<tr>
      <td>12</td>
      <td>Longitude</td>
      <td>DWORD</td>
      <td>Multiply the latitude value in degrees by the 6th power of 10 to the nearest millionth of a degree.</td>
    </tr>
<tr>
      <td>16</td>
      <td>Height</td>
      <td>WORD</td>
      <td>Altitude, in meters.</td>
    </tr>
<tr>
      <td>18</td>
      <td>Speed</td>
      <td>WORD</td>
      <td>Unit (0.1km/h).</td>
    </tr>
<tr>
      <td>20</td>
      <td>Direction</td>
      <td>WORD</td>
      <td>0-359, due north is 0, clockwise.</td>
    </tr>
<tr>
      <td>22</td>
      <td>Time</td>
      <td>BCD[6]</td>
      <td>YY-MM-DD-hh-mm-ss (GMT+8 time, this time zone is used for subsequent references in this standard).</td>
    </tr>
<tr>
      <td>28</td>
      <td>Line number</td>
      <td>DWORD</td>
      <td></td>
    </tr>
<tr>
      <td>32</td>
      <td>Business type</td>
      <td>BYTE</td>
      <td>Fill in 0 by default</td>
    </tr>
<tr>
      <td>33</td>
      <td>Station serial number</td>
      <td>BYTE</td>
      <td></td>
    </tr>
<tr>
      <td>34</td>
      <td>Distance from the station</td>
      <td>DWORD</td>
      <td>Unit: meters</td>
    </tr>
<tr>
      <td>38</td>
      <td>Collection type</td>
      <td>BYTE</td>
      <td>Default fill in 0x12</td>
    </tr>
<tr>
      <td>39</td>
      <td>Information Item List</td>
      <td>BYTE[n]</td>
      <td>See Table 3.24.2 Passenger Count Data</td>
    </tr>
  </tbody>
</table>

<table>
  <caption>Table 3.24.2 Passenger Count Data</caption>
  <thead>
    <tr>
      <th>Start byte</th>
      <th>Field</th>
      <th>Data type</th>
      <th>Describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>0x0000</td>
      <td>BYTE</td>
      <td>Passenger ID, starting from 0, 0,1,2</td>
    </tr>
<tr>
      <td>4</td>
      <td>0x0001</td>
      <td>WORD</td>
      <td>Accumulated number of people getting on</td>
    </tr>
<tr>
      <td>9</td>
      <td>0x0002</td>
      <td>WORD</td>
      <td>Accumulated number of people getting off</td>
    </tr>
<tr>
      <td>14</td>
      <td>0x0003</td>
      <td>BYTE</td>
      <td>Door status, 0x00-Open 0x01-Close</td>
    </tr>
<tr>
      <td>18</td>
      <td>0x0004</td>
      <td>WORD</td>
      <td>Door opening and closing times, for reference only</td>
    </tr>
<tr>
      <td>23</td>
      <td>0x0005</td>
      <td>DWORD</td>
      <td>Data accumulation count, clear 0 after power failure</td>
    </tr>
<tr>
      <td>30</td>
      <td>0x0006</td>
      <td>WORD</td>
      <td>Number of passengers boarding at the previous station</td>
    </tr>
<tr>
      <td>35</td>
      <td>0x0007</td>
      <td>WORD</td>
      <td>Number of people getting off at the previous station</td>
    </tr>
<tr>
      <td>40</td>
      <td>0x0008</td>
      <td>BYTE</td>
      <td>Fault information, 1-fault, 0-normal</td>
    </tr>
  </tbody>
</table>

## 3.25 Text information distribution

Message ID: `0x8300`.

The format of message body data for text information distribution is shown in Table 3.25.1

<table>
  <caption>Table 3.25.1 Text Information Distribution Message Body Data Format</caption>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>sign</td>
      <td>BYTE</td>
      <td>Meaning of text information marker bit (Table 3.25.2), default to fill in 09</td>
    </tr>
<tr>
      <td>1</td>
      <td>Text Type</td>
      <td>BYTE</td>
      <td>1=notification, 2=service, default to 1</td>
    </tr>
<tr>
      <td>2</td>
      <td>text information</td>
      <td>STRING</td>
      <td>Up to 1024 bytes, GBK encoded</td>
    </tr>
  </tbody>
</table>

<table>
  <caption>Table 3.25.2 Meaning of Text Information Flag Bits</caption>
  <thead>
    <tr>
      <th>bit</th>
      <th>sign</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0~1</td>
      <td>10: Urgent; Default fill in 10</td>
    </tr>
  </tbody>
</table>



---


# Alarm attachment upload

## 4.1 Alarm attachment upload command

Message ID: 0x9208.  
Message type: signaling data message.  
After receiving the alarm/event information with attachments, the platform issues an attachment upload command to the terminal. The format of the command message body data is shown in Table 4.1.

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Attachment server IP address length</td>
<td>BYTE</td>
<td>Length k</td>
</tr>
<tr>
<td>1</td>
<td>Attachment server IP address</td>
<td>STRING</td>
<td>Server IP Address</td>
</tr>
<tr>
<td>1+k</td>
<td>Attachment server port (TCP)</td>
<td>WORD</td>
<td>Server port number when using TCP transmission</td>
</tr>
<tr>
<td>3+k</td>
<td>Attachment server port (UDP)</td>
<td>WORD</td>
<td>Server port number when using UDP transmission</td>
</tr>
<tr>
<td>5+k</td>
<td>Alarm identification number</td>
<td>BYTE[16]</td>
<td>The definition of alarm identification number is shown in Table 3.5.12</td>
</tr>
<tr>
<td>21+k</td>
<td>Alarm number</td>
<td>BYTE[32]</td>
<td>The unique number assigned by the platform to the alarm</td>
</tr>
<tr>
<td>53+k</td>
<td>reserve</td>
<td>BYTE[16]</td>
<td></td>
</tr>
</tbody>
</table>

After receiving the alarm attachment upload command issued by the platform, the terminal sends a universal response message to the platform.

## 4.2 Vehicle status data record file

The vehicle status data recording file is a binary file, which records the vehicle status data in the form of continuous data blocks. The data format of the data blocks is shown in Table 4.2.

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Total number of data blocks</td>
<td>DWORD</td>
<td>Record the total number of data blocks in the file</td>
</tr>
</tbody>
</table>



---



<table>
  <thead>
    <tr>
      <th>4</th>
      <th>Current block number</th>
      <th>DWORD</th>
      <th>The sequence number of the current data block in the record file</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>8</td>
      <td>reserve</td>
      <td>BYTE[55]</td>
      <td></td>
    </tr>
<tr>
      <td>63</td>
      <td>check bit</td>
      <td>BYTE</td>
      <td>
        The accumulated sum from the first character to the character before the checksum, and then take the lower 8 digits of the accumulated sum as the checksum
      </td>
    </tr>
  </tbody>
</table>

### 4.3 Alarm attachment information message

Message ID: 0x1210.  
Message type: signaling data message.  
The terminal connects to the attachment server according to the attachment upload command and sends an alarm attachment information message to the server. The message body data format is shown in Table 4.3.

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Termination ID</td>
      <td>BYTE[7]</td>
      <td>
        7 bytes, consisting of uppercase letters and numbers, this terminal ID is defined by the manufacturer. If there are not enough digits, add "0x00" after it
      </td>
    </tr>
<tr>
      <td>7</td>
      <td>Alarm identification number</td>
      <td>BYTE[16]</td>
      <td>The definition of alarm identification number is shown in Table 3.5.12</td>
    </tr>
<tr>
      <td>23</td>
      <td>Alarm number</td>
      <td>BYTE[32]</td>
      <td>The unique number assigned by the platform to the alarm</td>
    </tr>
<tr>
      <td>55</td>
      <td>information type</td>
      <td>BYTE</td>
      <td>
        0x00: Normal alarm file information<br>
        0x01: Supplementary transmission of alarm file information
      </td>
    </tr>
<tr>
      <td>56</td>
      <td>Number of attachments</td>
      <td>BYTE</td>
      <td>Number of attachments associated with alarms</td>
    </tr>
<tr>
      <td>57</td>
      <td>Attachment Information List</td>
      <td></td>
      <td>See Table 4.3.2</td>
    </tr>
  </tbody>
</table>

After receiving the alarm attachment information message uploaded by the terminal, the attachment server sends a universal response message to the terminal. If the terminal abnormally disconnects from the attachment server during the process of


---


uploading alarm attachments, it is necessary to resend the alarm attachment information message when restoring the link. The attachment files in the message are those that were not uploaded or completed before the disconnection

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>File name length</td>
<td>BYTE</td>
<td>Length k</td>
</tr>
<tr>
<td>1</td>
<td>file name</td>
<td>STRING</td>
<td>File Name String</td>
</tr>
<tr>
<td>1+k</td>
<td>file size</td>
<td>DWORD</td>
<td>The current file size</td>
</tr>
</tbody>
</table>

The naming convention for file names is:  
`<File Type>_<Channel Number>_<Alarm Type>_<Serial Number>_<Alarm Number><Suffix name>`

The field definition is as follows:  
* File type: 00- Image; 01- Audio; 02- Video; 03- Text; 04- Other.  
* Channel numbers: 0-37 represent the video channels defined in Table 2 of the JT/T 1076 standard.  
* 64 represents the video channel of the ADAS module.  
* 65 represents the video channel of the DSM module.  
* If the attachment is not related to the channel, fill in 0 directly.  
* Alarm type: A code composed of the peripheral ID and the corresponding module alarm type, for example, the forward collision alarm is represented as "6401".  
* Serial number: used to distinguish file numbers of the same channel and type.  
* Alarm Number: The unique number assigned by the platform to an alarm.  
* Suffix name: Image file is jpg or png, audio file is wav, video file is h264, and text file is bin.  

After receiving the alarm attachment information command reported by the terminal, the attachment server sends a universal response message to the terminal.

## 4.4 File information upload

* Message ID: 0x1211.  
* Message type: signaling data message.  

After sending an alarm attachment information command to the attachment server and receiving a response, the terminal sends an attachment file information message to the attachment server. The format of the message body data is shown in Table 4.4.

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>File name length</td>
<td>BYTE</td>
<td>The file name length is 1</td>
</tr>
<tr>
<td>1</td>
<td>File name</td>
<td>STRING</td>
<td>File name</td>
</tr>
<tr>
<td>1+1</td>
<td>File type</td>
<td>BYTE</td>
<td>0x00: Image</td>
</tr>
</tbody>
</table>



---


# 4.5 File data upload

Message type: Bitstream data message.  
After sending file information upload instructions to the attachment server and receiving a response, the terminal sends file data to the attachment server. The payload packet format is defined in Table 4.5.

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>Frame header identifier</td>
<td>DWORD</td>
<td>Fixed to 0x30 0x31 0x63 0x64</td>
</tr>
<tr>
<td>4</td>
<td>File name</td>
<td>BYTE[50]</td>
<td>File name</td>
</tr>
<tr>
<td>54</td>
<td>Data Offset</td>
<td>DWORD</td>
<td>The data offset of the current transfer file</td>
</tr>
<tr>
<td>58</td>
<td>Length</td>
<td>DWORD</td>
<td>The length of load data</td>
</tr>
<tr>
<td>62</td>
<td>Data body</td>
<td>BYTE[n]</td>
<td>The default length is 64K, and if the file is less than 64K, it will be the actual length</td>
</tr>
</tbody>
</table>

When the attachment server receives the file stream reported by the terminal, it does not need to respond.

# 4.6 File upload completion message

Message ID: 0x1212.  
Message type: signaling data message.  
When the terminal completes a file data transmission to the attachment server, it sends a file transmission completion message to the attachment server. The format of the message body data is shown in Table 4.6.

<table>
<thead>
<tr>
<th>Starting Byte</th>
<th>field</th>
<th>data type</th>
<th>describe</th>
</tr>
</thead>
<tbody>
<tr>
<td>0</td>
<td>File name length</td>
<td>BYTE</td>
<td>1</td>
</tr>
<tr>
<td>1</td>
<td>File name</td>
<td>STRING</td>
<td>File name</td>
</tr>
<tr>
<td>1+k</td>
<td>File type</td>
<td>BYTE</td>
<td>0x00: Image</td>
</tr>
</tbody>
</table>



---


# 4.7 File upload completion message response

Message ID: 0x9212.  
Message type: signaling data message.  

When the attachment server receives the file upload completion message reported by the terminal, it sends a file upload completion message response to the terminal. The response data structure is shown in Table 4.7.1.

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>File name length</td>
      <td>BYTE</td>
      <td>1</td>
    </tr>
<tr>
      <td>1</td>
      <td>File name</td>
      <td>STRING</td>
      <td>file name</td>
    </tr>
<tr>
      <td>1+l</td>
      <td>file type</td>
      <td>BYTE</td>
      <td>
        0x00: Image<br>
        0x01: Audio<br>
        0x02: Video<br>
        0x03: Text<br>
        0x04: Other
      </td>
    </tr>
<tr>
      <td>2+l</td>
      <td>Upload results</td>
      <td>BYTE</td>
      <td>
        0x00: Completed<br>
        0x01: Additional transmission required
      </td>
    </tr>
<tr>
      <td>3+l</td>
      <td>Number of supplementary data packets</td>
      <td>BYTE</td>
      <td>The number of data packets that need to be retransmitted is 0 when there is no retransmission</td>
    </tr>
<tr>
      <td>4+l</td>
      <td>List of supplementary data packets</td>
      <td></td>
      <td>See Table 4.7.2</td>
    </tr>
  </tbody>
</table>

Table 4.7.2 Supplementary Data Packet Information Data Structure

<table>
  <thead>
    <tr>
      <th>Starting Byte</th>
      <th>field</th>
      <th>data type</th>
      <th>describe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0</td>
      <td>Data Offset</td>
      <td>DWORD</td>
      <td>The offset of the data that needs to be transferred in the file</td>
    </tr>
<tr>
      <td>1</td>
      <td>Length</td>
      <td>DWORD</td>
      <td>The length of data that needs to be supplemented</td>
    </tr>
  </tbody>
</table>

If there is any data that needs to be supplemented, the terminal should upload the file data for data supplementation. After the supplementation is completed, the file upload completion message should


---


be reported until the file data is sent.  
After sending all the files, the terminal actively disconnects from the attachment server.

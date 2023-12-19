export default {
  "worker": {
    "logLevel": "warn",
    "logTags": [
      "info",
      "ice",
      "dtls",
      "rtp",
      "srtp",
      "rtcp"
    ],
    "rtcMinPort": 40000,
    "rtcMaxPort": 49999
  },
  "codecs": [
    {
      "kind": "audio",
      "mimeType": "audio/opus",
      "clockRate": 48000,
      "channels": 2
    },
    {
      "kind": "video",
      "mimeType": "video/VP8",
      "clockRate": 90000,
      "parameters": {
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/VP9",
      "clockRate": 90000,
      "parameters": {
        "profile-id": 2,
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/h264",
      "clockRate": 90000,
      "parameters": {
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/h264",
      "clockRate": 90000,
      "parameters": {
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000
      }
    }
  ],
  "webRtcTransport": {
    "listenIps": [
      {
        "ip": "0.0.0.0",
        "announcedIp": "192.168.110.6"
      }
    ],
    "enableUdp": true,
    "enableTcp": true,
    "preferUdp": true,
    "enableSctp": false,
    "initialAvailableOutgoingBitrate": 1000000,
    "maxSctpMessageSize": 262144
  }
}
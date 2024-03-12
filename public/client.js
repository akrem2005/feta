// client.js
const socket = io();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// Set up a local media stream
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localVideo.srcObject = stream;

    // Set up a RTCPeerConnection
    const pc = new RTCPeerConnection();
    pc.onicecandidate = handleIceCandidate;
    pc.ontrack = handleTrackEvent;

    // Add local stream to the peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Signaling logic
    pc.onnegotiationneeded = () => {
      if (pc.signalingState !== "stable") return;
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", {
            room: "your-room-id",
            target: "otherUser",
            sdp: pc.localDescription,
          });
        });
    };

    // Connection handling
    socket.on("offer", (data) => {
      if (data.room === "your-room-id" && data.sender !== socket.id) {
        pc.setRemoteDescription(data.sdp)
          .then(() => pc.createAnswer())
          .then((answer) => pc.setLocalDescription(answer))
          .then(() => {
            socket.emit("answer", {
              room: "your-room-id",
              target: data.sender,
              sdp: pc.localDescription,
            });
          });
      }
    });

    socket.on("answer", (data) => {
      if (data.room === "your-room-id" && data.sender !== socket.id) {
        pc.setRemoteDescription(data.sdp);
      }
    });

    socket.on("candidate", (data) => {
      if (data.room === "your-room-id" && data.sender !== socket.id) {
        const candidate = new RTCIceCandidate(data.candidate);
        pc.addIceCandidate(candidate);
      }
    });
  })
  .catch((error) => {
    console.error("Error accessing user media:", error);
  });

// Helper functions
function handleIceCandidate(event) {
  if (event.candidate) {
    socket.emit("candidate", {
      room: "your-room-id",
      target: "otherUser",
      candidate: event.candidate,
    });
  }
}

function handleTrackEvent(event) {
  remoteVideo.srcObject = event.streams[0];
}

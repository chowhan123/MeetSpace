import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { InputAdornment } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const server_url = "http://localhost:8000";
var connections = {};
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState();
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([])
    let [videos, setVideos] = useState([])
    const messageEndRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });

    
    const getPermissions = async () => {
      try {
        // Request both video and audio in one go
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // If successful, update states
        setVideoAvailable(true);
        setAudioAvailable(true);
        console.log("Video and Audio permissions granted");

        // Set the stream to video element
        window.localStream = userMediaStream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = userMediaStream;
    }

    // Check for screen sharing support
    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }

  } catch (error) {
    console.error("Permission denied or error:", error);

    // Handle individual permission fallback (optional)
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(true);
      if (!window.localStream) {
        window.localStream = videoStream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = videoStream;
        }
      }
    } catch {
      setVideoAvailable(false);
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(true);
      if (window.localStream && audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        window.localStream.addTrack(audioTrack);
      } else if (!window.localStream) {
        window.localStream = audioStream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = audioStream;
        }
      }
    } catch {
      setAudioAvailable(false);
    }

    // Fallback screen share support check
    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
  }
};

    useEffect(() => {
        getPermissions();
    },[])

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (error) { 
            console.log(error) 
        }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }
        }
    }


    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })
        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id
            // add user message to chat 
            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }
    
    // If a user stops sharing video or audio, you don’t want the connection to break — instead, send these fake tracks.
    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    // Function to request access to user's camera and microphone    
    const getMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Permission denied or failed:", err);
        }
    };

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDislayMediaSuccess = (stream) => {
        // Stop existing local media tracks (camera/mic) before switching to screen share
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (error) { 
            console.log(error);
        }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        // Loop through all connected peers to share your screen stream with them
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                         // 🔁 Send the offer to the remote peer via Socket.IO signaling
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(error => console.log(error));
                }
            )
        }
        // 🛑 Listen for when the user manually stops screen sharing (e.g., via browser UI)
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (error) { 
                console.log(error);
            }
            // ⬛ Replace the stream with a black screen + silent audio as fallback
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            getUserMedia()
        })
    }

    // Function to handle screen sharing
    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    //useEffect React hook to run side effects (e.g., start/stop screen sharing)
    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    // Add a new chat message to the messages list
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { 
                sender: sender, 
                data: data
            }
        ]);
        // Increment notification if message is from another user
        if (socketIdSender !== socketIdRef.current.id) {
            setNewMessages((prevNewMessages) => (prevNewMessages + 0) || 1);
        }
    };

    // when users want to chat send message will push their chat on chat box
    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    }

    let handleScreen = () => {
        setScreen(!screen);
    }

    // Function to end the video call and redirect the user
    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (error) {
            console.log(error);
        }
        // Redirect the user to the home page after ending the call
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }
    
    const connect = async () => {
        if (!username.trim()) {
            setSnackbar({
                open: true,
                message: "Username is required to join!",
                severity: "warning",
            });
            return;
        }
        
        setAskForUsername(false); // hide join screen
        await getPermissions(); // Request media permissions first

        // Set audio/video state to trigger user media setup
        setVideo(true);
        setAudio(true);

        // Connect to socket server to begin call setup
        connectToSocketServer();
    };

    // Auto-scroll when messages update
    useEffect(() => {
        if (messageEndRef.current) {
           messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
    <div>
        {/* STYLE FOR WEHN USERS JOIN PAGE  */}
        {askForUsername ? (
            <div style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f2f5",
                padding: "1rem",
              }}
            >
                
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
                width: "100%",
                maxWidth: "400px",
              }}
            >
                    
            <VideoCameraFrontIcon style={{ fontSize: "3rem", color: "#1976d2" }} />
            <h2 style={{ margin: 0, color: "#333", fontWeight: "600" }}>
                Join Meeting
            </h2>
                
            <TextField
                id="username"
                label="Enter your name"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <PersonIcon />
                    </InputAdornment>
                ),
              }}
            />
            
            <Button variant="contained" onClick={connect} fullWidth
              sx={{
                paddingY: "0.8rem",
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              Connect & Join
            </Button>

           <div style={{ width: "100%", marginTop: "1rem", position: "relative" }}>
            <video
              ref={localVideoref}
              autoPlay
              muted
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                border: "1px solid #ccc",
                backgroundColor: "#000",
                objectFit: "cover",
              }}
            />
            {!isCameraOn && (
                <div
                  style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "1.2rem",
                  fontWeight: "500",
                 }}
                >
                  Camera Off
            </div>
          )}
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>

      </div>
    ) : (
      <div className={styles.meetVideoContainer}>
        {/* CHAT Box CODE*/}
        {showModal && (
          <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
              <h1>Team Chat</h1>
              <hr/>

              <div className={styles.chattingDisplay}>
                {messages.length > 0 ? (
                  messages.map((item, index) => (
                    <div style={{ marginBottom: "20px" }} key={index}>
                      <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                      <p>{item.data}</p>
                    </div>
                  ))
                ) : (
                  <p>No Messages Yet</p>
                )}
                <div ref={messageEndRef} />
              </div>

              <div className={styles.chattingArea}>
                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="outlined-basic"
                  variant="outlined"
                   onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       e.preventDefault();
                        sendMessage();
                    }
                    }}
                   fullWidth
                    placeholder="Type a message..."
                />
                <Button variant="contained" onClick={sendMessage} 
                  sx={{
                        fontSize: '1rem',      // increase text size
                        padding: '10px 20px',  // increase padding
                        minWidth: '80px',     // optional: widen the button
                        minHeight: '56px'      // optional: height
                    }}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Controls */}
        <div className={styles.buttonContainers}>
          <IconButton onClick={handleVideo} style={{ color: "white" }}>
            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton onClick={handleEndCall} style={{ color: "red" }}>
            <CallEndIcon />
          </IconButton>

          <IconButton onClick={handleAudio} style={{ color: "white" }}>
            {audio === true ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          {screenAvailable && (
            <IconButton onClick={handleScreen} style={{ color: "white" }}>
              {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton>
          )}

          <Badge badgeContent={newMessages} max={999} color="secondary">
            <IconButton
              onClick={() => setModal(!showModal)}
              style={{ color: "white" }}
            >
              <ChatIcon />
            </IconButton>
          </Badge>
        </div>

        <video
          className={styles.meetUserVideo}
          ref={localVideoref}
          autoPlay
          muted
        ></video>

        {/* Video Grid */}
        <div className={styles.conferenceView}>
          {videos.map((video) => (
            <div key={video.socketId}>
              <video
                data-socket={video.socketId}
                ref={(ref) => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
              ></video>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
 
}
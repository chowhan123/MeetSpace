import { Server } from "socket.io";

let connections = {}; // how many users are connected in Meeting
let messages = {};    // how many messages are sent by users in meeting
let timeOnline = {};  // how many user are in online 

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET" ,"POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    // when users connect the socket they will be added to the connections object.
    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED")
        socket.on("join-call", (path) => { 
            if(connections[path] === undefined){ // if meeting doesnt exisit in room, create it
                connections[path] = [];
            }
            connections[path].push(socket.id); // add the users in the meeting
            timeOnline[socket.id] = new Date(); // store the date when users connected
            for(let i=0;i<connections[path].length;i++){ // send the new users in the meeting
                io.to(connections[path][i]).emit("user-joined", socket.id, connections[path]); 
            }
            if (messages[path] !== undefined) {  // send the messages to the user who just joined
              for (let i = 0; i < messages[path].length; i++) {
                  const msg = messages[path][i];
                  io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
                }
            }

        });

        // Users will send the signal to other users in the meeting
        socket.on("signal" , (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // Users will send the message in the meeting
        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound],[roomkey, roomValue]) => {
                if(!isFound && roomValue.includes(socket.id)){  // check if the user in the meeting
                    return [roomkey, true]; 
                }
                return [room, isFound];
            }, ["",false]); 
            // If the user is in the meeting, we will send the message to all users in the meeting
            if(found === true){ 
                if(messages[matchingRoom] === undefined){  
                    messages[matchingRoom] = []; 
                }
                messages[matchingRoom].push({"sender": sender, "data": data, "socket-id-sender": socket.id});
                console.log("messages", matchingRoom, ":", sender, data); 
                connections[matchingRoom].forEach(element => {  
                    io.to(element).emit("chat-message", data, sender, socket.id)
                });
            }
        });

        // Users will leave the meeting 
        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date()); 
            var key;
            for(const [k,v] of Object.entries(connections)){ 
                for(let i=0;i<v.length;i++){ 
                    if(v[i] === socket.id){
                        key = k;

                        for(let i=0;i<connections[key].length;i++){ // send the user left message to all users in meeting
                            io.to(connections[key][i]).emit("user-left", socket.id); 
                        }
                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        if(connections[key].length === 0){ // if no users in meeting, delete the meeting
                            delete connections[key]; 
                        }
                    }
                }
            }
        });
    });
    return io;
}
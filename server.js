const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 5000;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));


io.on("connection", socket => {
    socket.on("send-message", (message, room) => {
        if (room === '') {
            socket.broadcast.emit("recieve-message", "Global: " + socket.username + ": " + message)
        }
        socket.to(room).emit("recieve-message", room + ": " + socket.username + ": " + message)
    })
    socket.on("join-room", (room, cb) => {
        socket.join(room)
        getSocketsRoom(room);
        cb(`You joined the room: ${room}`)
        socket.to(room).emit("recieve-message", socket.username + ": " + "Joined the room!")
    })
    socket.on("leave-room", (room, cb) => {
        socket.leave(room)
        getSocketsRoom(room);
        cb(`You left the room: ${room}`)
        socket.to(room).emit("recieve-message", socket.username + ": " + "Left the room!")
    })
    socket.on("set-name", (nickname) => {
        socket.username = nickname
        getSockets()
        
    })
    socket.on("disconnect", (reason) => {
        console.log("User disconnected: " + reason);
        getSockets();
    })
})

async function getSockets() {
    const sockets = await io.fetchSockets()
    let usernames = [];
    for (const socket of sockets) {
        usernames.push(socket.username)

        io.emit("populate-all", usernames)
    }
}

async function getSocketsRoom(room){
    const sockets = await io.in(room).fetchSockets()
    let usernames = [];
    for (const socket of sockets) {
        usernames.push(socket.username)

        io.in(room).emit("populate-room", usernames)
    }
}

server.listen(port, "0.0.0.0", function() {
    console.log('listening on ' + port);
 });


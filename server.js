const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 5000;

const logging = require('./logging.js');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));


io.on("connection", socket => {

    socket.on("send-message", (message, room) => {
        /* if (room === '') {
            socket.broadcast.emit("recieve-message", "[Global]: " + socket.username + ": " + message)
        } */
        socket.to(room).emit("recieve-message",  socket.username + ": " + message)
        if (room === "Global") {
            logging.log(socket.username + ": " + message)
        }
    })
    socket.on("join-room", (room, cb) => {
        socket.leave("Global")
        socket.join(room)
        getSocketsRoom(room);
        cb(`You joined room: ${room}`)
        socket.to(room).emit("alert-message", socket.username + " joined the room!")
    })
    socket.on("leave-room", (room, cb) => {
        socket.leave(room)
        getSocketsRoom(room);
        cb(`You left room: ${room}`)
        socket.to(room).emit("alert-message", socket.username + ": " + "Left the room!")
    })
    socket.on("set-name", (nickname) => {
        socket.username = nickname
        getSockets()
        /* socket.broadcast.emit("alert-message", socket.username + " joined!") */
        
    })
    socket.on("disconnect", (reason) => {
        console.log("User disconnected: " + reason);
        getSockets();
        getSocketsRoom("Global")
        io.emit("alert-message", socket.username + " left")
    })
    socket.on("is-typing", (state) =>{ 
        if (state === true) {
            socket.broadcast.emit("user-typing", socket.username + " is typing...")
        }
        else if (state === false) {
            socket.broadcast.emit("user-stop-typing")
        }
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



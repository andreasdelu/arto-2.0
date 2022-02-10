const joinRoomButton = document.getElementById("room-button");
const leaveRoomButton = document.getElementById("leave-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");
const allList = document.getElementById("all-list");
const roomList = document.getElementById("room-list");
const userTyping = document.getElementById("typing");
const roomName = document.getElementById("room-name");



const socket = io()

const storage = window.sessionStorage;

function timeSet() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    
    if (minutes <= 9) {
        minutes = "0" + minutes;
    }
    if (hours <= 9) {
        hours = "0" + hours;
    }
    
    let time = hours + ":" + minutes;

    return time;
}


function updateScroll(){
    const messageContainer = document.getElementById("message-container");
    if (messageContainer.scrollTop + 600 > messageContainer.scrollHeight) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    else return;
}

socket.on("connect", () => {
    alertMessage(`Connected!`);
    setName();
    joinGlobal();
    loadChat();
    updateScroll();
    
})

function joinGlobal() {
    socket.emit("join-room", "Global", message => {
        alertMessage(message);
    })
    updateScroll();
    roomName.textContent = 'Global'
}

function setName() {
    let nickname;
    if (storage.getItem("nickname") == null) {
        nickname = prompt("Username: ");
        if (nickname == null || nickname == '') {
            const nickname = socket.id.substring(0,6);
            socket.emit("set-name", nickname);
        }
        else if (nickname == storage.getItem("nickname")) {
            socket.emit("set-name", nickname);
            alertMessage("Your nickname is already: " + nickname);
        }
        
        else {
            socket.emit("set-name", (nickname));
            alertMessage("Your nickname is: " + nickname);
            storage.setItem("nickname", nickname);
        }
    }
    else {
        nickname = storage.getItem("nickname");
        socket.emit("set-name", (nickname));
        alertMessage("Your nickname is: " + nickname);
    }
}

socket.on("recieve-message", (message) => {
    displayMessage(message);
    updateScroll();
})

socket.on("populate-all", online => {
    populateAll(online);
})
socket.on("populate-room", online => {
    populateRoom(online);
})


form.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value;
    let room = roomInput.value;
    if (roomInput.value.length === 0) {
        room = "Global"
    }

    if (message === "") return
    yourMessage(message)
    socket.emit("send-message", message, room)
    messageInput.value = ""
    updateScroll();
    socket.emit("is-typing", false)
})

joinRoomButton.addEventListener("click", () => {

    const room = roomInput.value;
    if (room !=='') {
        socket.emit("join-room", room, message => {
            alertMessage(message);
        })
        roomInput.readOnly = true;
        updateScroll();
        joinRoomButton.disabled = true
        leaveRoomButton.disabled = false
        roomName.textContent = room
    }
    else return;
})
leaveRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
    roomList.innerHTML = '';
    roomInput.value = '';
    socket.emit("leave-room", room, message => {
        alertMessage(message);
    })
    roomInput.readOnly = false;
    joinRoomButton.disabled = false;
    leaveRoomButton.disabled = true
    roomName.textContent = ''
    updateScroll();
    joinGlobal();
})

function displayMessage(message) {
    const p = document.createElement("p")
    p.textContent = timeSet() + " · " +  message
    p.classList.add("message")
    document.getElementById("message-container").append(p)
    updateScroll();
}

function yourMessage(message) {
    const p = document.createElement("p")
    p.textContent = timeSet() + " · " + "You: " + message
    p.classList.add("you")
    document.getElementById("message-container").append(p)
    
}

function alertMessage(message) {
    const p = document.createElement("p")
    p.textContent = message
    p.classList.add("alert")
    document.getElementById("message-container").append(p)
}

function populateAll(list) {
    allList.innerHTML = '';
    list = list.sort();
    for (const user of list) {
        const li = document.createElement("li")
        li.textContent = "🟢" + " " + user
        allList.append(li)
    }
}
function populateRoom(list) {
    roomList.innerHTML = '';
    list = list.sort();
    for (const user of list) {
        const li = document.createElement("li")
        li.textContent = "🟢" + " " + user
        roomList.append(li)
    }
}

messageInput.addEventListener("input", function(){

    if (messageInput.value.length == 1) {
        socket.emit("is-typing", true)  
    }
    else if (messageInput.value.length <= 0)
    {
        socket.emit("is-typing", false)  
    }
})

socket.on("user-typing", message => {
    userTyping.classList.add("typing")
    userTyping.textContent = message;

})

socket.on("user-stop-typing", () => {
    userTyping.classList.remove("typing")
    userTyping.textContent = '';
})

socket.on("alert-message", message => {
    alertMessage(message)
})

async function loadChat() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const response = await fetch('chatlogs/log' + day + month + year + '.json')
    const chats = await response.json()

    
    chats.forEach(chat => {
        const p = document.createElement("p")
        p.textContent = chat
        p.classList.add("message")
        document.getElementById("message-container").append(p)
        updateScroll();
    });
};


const gear = document.getElementById("settings");
const modal = document.getElementById("modal-settings");

gear.addEventListener("click", function(){
    modal.classList.add("modal-shown");
})
document.getElementById("modal-background").addEventListener("click", function(){
    modal.classList.remove("modal-shown");
});
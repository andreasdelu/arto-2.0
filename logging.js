const { json } = require("express/lib/response");
const fs = require("fs");

exports.log = function(message){ addToLog(message)};


const chatLog = []


const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();

fs.readFile('chatlogs/log' + day + month + year + '.json', function(err, data) {
    if (err) {
        throw err;
    }
    let chats = JSON.parse(data);
    chats.forEach(chat => {
        chatLog.push(chat);
    });
});

function addToLog(message) {
    if (chatLog.length <= 200) {
        chatLog.push(message)
        writeChatLog()
    }
    else{
        chatLog.shift()
        chatLog.push(message)
        writeChatLog()
    }
}

function writeChatLog() {
    let data = JSON.stringify(chatLog);
    let remove = '';
    fs.writeFile('chatlogs/log' + day + month + year + '.json', remove, (err) => {
        if (err) {
            throw err;
        }
    });

    fs.appendFile('chatlogs/log' + day + month + year + '.json', data, (err) => {
        if (err) {
            throw err;
        }
    });
}
const fs = require("fs");

exports.log = function(message){ addToLog(message)};

const chatLog = []

function addToLog(message) {
    if (chatLog.length <= 100) {
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
    fs.writeFile('chatlogs/log.json', data, (err) => {
        if (err) {
            throw err;
        }
    });
}
const { json } = require("express/lib/response");
const fs = require("fs");
const { dirname } = require("path");

exports.log = function(message){ addToLog(message)};


const chatLog = []


const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();

const logFile = 'log' + day + month + year + '.json';
const path = 'chatlogs/';

fs.readdir(__dirname + "/chatlogs", (err, files) => {
    if (err)
        console.log(err);
    else {
        if (files.length == 0) {
            console.log("No logs! Creating Log")
            fs.writeFile(path+logFile, "[]", (err) => {
                if (err) {
                    throw err;
                }
            });
        }
        else{
            files.forEach(file => {
            if (file == logFile) {
                console.log("Reading Log")
                fs.readFile(path+logFile, function(err, data) {
                    if (err) {
                        throw err;
                    }
                    const chats = JSON.parse(data);
                    chats.forEach(chat => {
                        chatLog.push(chat);
                    });
                });
            }
            else{
                console.log("Creating Log")
                fs.writeFile(path+logFile, "[]", (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
            
            })
        }
  }
})


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
    fs.writeFile(path+logFile, remove, (err) => {
        if (err) {
            throw err;
        }
    });

    fs.appendFile(path+logFile, data, (err) => {
        if (err) {
            throw err;
        }
    });
}
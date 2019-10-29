const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = 8080
const ip = '192.168.0.3'
const io = require('socket.io')(http)
const Chat = require('./ChatSchema')
const dbConnection = require('./dbConnection')
const bodyParser = require('body-parser')
const chatRoute = require('./chatRoute')
const cors = require('cors')
const RSA = require('./rsa')
const path = require('path');
let connectedUsers = []
app.use(bodyParser.json());
app.use(cors())
app.use("/chats", chatRoute)

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

//generate RSA keys
const keys = RSA.generate(250)
console.log('Keys:')
console.log('Public Key: ', keys.n.toString())
console.log('Private Key: ', keys.d.toString())
console.log('Public Exponent ', keys.e.toString())

io.on('connection', (socket) => {
  socket.on('userData', (userData) => {
    //verify if there is a second user with same name
    if(connectedUsers.indexOf(userData) === -1){
      const name = userData
      //send name of the user to frontend
      socket.emit('sendName', name)
      console.log(name + " connected.")
      connectedUsers.push(name)
      console.log("Users: " + connectedUsers)
      // send to frontend that there are no same nicknames
      socket.emit("availableNickname", true)
      //send public keys to client
      io.emit('publicKey',{publicKey: keys.n, publicExp: keys.e})
      //send info about how many connected users are
      io.emit('connectedUsers',connectedUsers.length)
      //send if someone is typing smth
      socket.on('typing', (entry) => {
        socket.broadcast.emit('typingTrue', name)
      
      })
      //send message to all
      socket.on('msg', (msgData) => {
        console.log("Encrypted Message: " + msgData)
        const decryptedMessage = RSA.decrypt(msgData, keys.d, keys.n)
        const decodedMessage = RSA.decode(decryptedMessage)
        console.log("Decoded Message: " + decodedMessage)
        io.emit("received", {message: decodedMessage, sender: name})
        dbConnection.then(db => {
          console.log("Connected to db")
          let chatMessage = new Chat({message: decodedMessage, sender: name})
          chatMessage.save((err) => {
            if(err === null){
              console.log("Save to db succesfull")
            } else {
              console.log("An error occured " + err)
            }
          })
        })
      })
      socket.on('disconnect', () => {
        console.log(name + " disconnected.")
        const index = connectedUsers.indexOf(name)
        if(index !== -1){
          connectedUsers.splice(index, 1)
          io.emit('connectedUsers',connectedUsers.length) 
        }
        console.log("Users: " + connectedUsers)
      })
    } else {
      //if there are 2 same nicknames it send false
      socket.emit("availableNickname", false)
    }
  })
})


http.listen(port, ip, () => {
  console.log(`listening on ${ip}:${port}`)
})
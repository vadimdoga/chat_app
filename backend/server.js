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
let usersKeys = []
let userIds = []
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
      userIds.push({id: socket.id, name: name})
      console.log("Users: ", userIds)
      //send name of the user to frontend
      socket.emit('sendName', name)
      console.log(name + " connected.")
      connectedUsers.push(name)
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
      socket.on('keys', (entry) => {
        console.log("Public Key received from client")
        const clientPublicKey = Object.values(entry)[0]
        const clientPublicExp = Object.values(entry)[1]
        usersKeys.push({publicKey: clientPublicKey, publicExp: clientPublicExp, name: name})        
      })
      //send message to all
      socket.on('msg', (msgData) => {
        console.log("Encrypted Message from client: " + msgData)
        const decryptedMessage = RSA.decrypt(msgData, keys.d, keys.n)
        const decodedMessage = RSA.decode(decryptedMessage)
        console.log("Decoded Message from client: " + decodedMessage)

        usersKeys.map(userKey => {
          userIds.map(userId => {
            if(userKey.name === userId.name){
              const clientPublicKey = userKey.publicKey
              const clientPublicExp = userKey.publicExp
              const encodeMessageToClient = RSA.encode(decodedMessage)
              const encryptMessageToClient = RSA.encrypt(encodeMessageToClient, clientPublicKey, clientPublicExp)
              console.log("Encrypted message to : " + userId.name + encryptMessageToClient)
              io.to(`${userId.id}`).emit('received', {message: encryptMessageToClient, sender: name})
            }
          })
        })  
        

        // io.emit("received", {message: encryptMessageToClient, sender: name})
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
        //userskeys
        usersKeys.map((user, index) => {
          if(user.name === name){
            usersKeys.splice(index, 1)
          }
        })
        //userids
        userIds.map((user, index) => {
          if(user.name === name){
            userIds.splice(index, 1)
          }
        })
        console.log("Users: ", userIds)
        console.log(name + " disconnected.")
        const index = connectedUsers.indexOf(name)
        if(index !== -1){
          connectedUsers.splice(index, 1)
          io.emit('connectedUsers',connectedUsers.length) 
        }
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
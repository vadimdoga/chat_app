const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = 8080
const io = require('socket.io')(http)
const Chat = require('./ChatSchema')
const dbConnection = require('./dbConnection')
const bodyParser = require('body-parser')
const chatRoute = require('./chatRoute')
const cors = require('cors')
const RSA = require('./rsa')
let connectedUsers = []
app.use(bodyParser.json());
app.use(cors())
app.use("/chats", chatRoute)

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
      socket.emit('sendName', name)
      console.log(name + " connected.")
      connectedUsers.push(name)
      console.log("Users: " + connectedUsers)
      socket.emit("availableNickname", true)
      io.emit('publicKey',{publicKey: keys.n, publicExp: keys.e})
      io.emit('connectedUsers',connectedUsers.length)

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
      socket.emit("availableNickname", false)
    }
  })
})


http.listen(port, () => {
  console.log(`listening on localhost:${port}`)
})
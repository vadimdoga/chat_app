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
let connectedUsers = []
app.use(bodyParser.json());
app.use(cors())
app.use("/chats", chatRoute)

io.on('connection', (socket) => {
  socket.on('userData', (userData) => {
    //verify if ther is a second user with same name
    if(connectedUsers.indexOf(userData) === -1){
      const name = userData
      socket.emit('sendName', name)
      console.log(name + " connected.")
      connectedUsers.push(name)
      console.log(connectedUsers)
      socket.emit("availableNickname", true)

      io.emit('connectedUsers',connectedUsers.length)

      socket.on('msg', (msgData) => {
        console.log(msgData)
        io.emit("received", {message: msgData, sender: name})
        dbConnection.then(db => {
          console.log("Connected to db")
  
          let chatMessage = new Chat({message: msgData, sender: name})
          chatMessage.save()
        })
      })
      socket.on('disconnect', () => {
        console.log(name + " disconnected")
        const index = connectedUsers.indexOf(name)
        console.log(index)
        if(index !== -1){
          connectedUsers.splice(index, 1)
          io.emit('connectedUsers',connectedUsers.length) 
        }
        console.log(connectedUsers)
      })
    } else {
      socket.emit("availableNickname", false)
    }
  })
})


http.listen(port, () => {
  console.log(`listening on localhost:${port}`)
})
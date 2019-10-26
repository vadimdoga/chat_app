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
app.use(bodyParser.json());
app.use(cors())
app.use("/chats", chatRoute)
io.on('connection', (socket) => {
  socket.on('userData', (userData) => {
    const name = userData
    socket.emit('sendName', name)
    console.log(name + " connected.")
    socket.on('disconnect', () => {
      console.log(name + " disconnected")
    })

    socket.on('msg', (msgData) => {
      console.log(msgData)
      io.emit("received", {message: msgData, sender: name})

      dbConnection.then(db => {
        console.log("Connected to db")

        let chatMessage = new Chat({message: msgData, sender: name})
        chatMessage.save()
      })
    })
  })
})


http.listen(port, () => {
  console.log(`listening on localhost:${port}`)
})
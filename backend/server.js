const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = 8080
const io = require('socket.io')(http)
const Chat = require('./ChatSchema')
const dbConnection = require('./dbConnection')
const bodyParser = require('body-parser')
const chatRoute = require('./chatRoute')

app.use(bodyParser.json());

app.use("/chats", chatRoute)

io.on('connection', (socket) => {
  console.log("User connected.")
  
  socket.on('disconnect', () => {
    console.log("User disconnected")
  })

  socket.on('msg', (msgData) => {
    console.log(msgData)

    socket.broadcast.emit("received",msgData)

    dbConnection.then(db => {
      console.log("Connected to db")

      let chatMessage = new Chat({message: msgData, sender: "Anon"})
      chatMessage.save()
    })
  })
})


http.listen(port, () => {
  console.log(`listening on localhost:${port}`)
})
const express  = require("express");
const Chat = require('./ChatSchema')
const dbConnection = require('./dbConnection')

const router = express.Router()

router.route("/").get((req, res, next) => {
  res.sendStatus = 200
  dbConnection.then(db => {
    Chat.find({}).then(chat => {
       res.json(chat);
    })
  })
})

module.exports = router
import React from 'react'
import Emit from '../components/EmitText/Emit'
import Show from '../components/ShowText/Show'
import UserData from '../components/UserData/UserData'
import io from 'socket.io-client'
const socket = io.connect('http://localhost:8080')

function Chat() {
  return(
    <div>
      <UserData socket={socket} />
      <Show socket={socket} />
      <Emit socket={socket} />
    </div>
  )
}
export default Chat
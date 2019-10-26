import React, { Component } from 'react'
import axios from 'axios'
import './Show.css'
export default class Show extends Component {
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      msgData: []
    }
    this.props.socket.on('received', (entry) => {
      console.log(entry)
      this.setState(prevState => ({
        msgData: [...prevState.msgData, entry]
      }))
    })
  
  }
  componentDidMount() {
    axios.get('http://localhost:8080/chats')
      .then(res => {
        console.log(res)
        const messages = res.data
        this.setState({
          messages: messages
        })
      })
  }
  render(){
    return(
      <div className="chat-box">
        {this.state.messages.map(msg => 
          <p className="chat-text" key={msg._id}>
            <span className="sender">{msg.sender}</span> {msg.message} 
          </p>
        )}
        {this.state.msgData.map((msg, index) => 
          <p className="chat-text" key={index}>
            <span className="sender">{msg.sender}</span> {msg.message} 
          </p>
        )} 
     
      </div>
    )
  }
}
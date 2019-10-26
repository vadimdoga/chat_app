import React, { Component } from 'react'
import axios from 'axios'
import './Show.css'

export default class Show extends Component {
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      msgData: [],
      senderName: ""
    }
    this.props.socket.on('received', (entry) => {
      console.log(entry)
      this.setState(prevState => ({
        msgData: [...prevState.msgData, entry]
      }))
    })
    this.props.socket.on('sendName', (entry) => {
      this.setState({
        senderName: entry
      })
    })
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }
  componentDidMount() {
    this.scrollToBottom()
    axios.get('http://localhost:8080/chats')
      .then(res => {
        console.log(res)
        const messages = res.data
        this.setState({
          messages: messages
        })
      })
  }
  componentDidUpdate() {
    this.scrollToBottom()
  }
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView();
  }
  render(){
    return(
      <ul className="chat-box">
        {this.state.messages.map(msg => 
          <div className = {this.state.senderName === msg.sender ? "flex-container-true":"flex-container-false"}>
            <li className={this.state.senderName === msg.sender ? "chat-text-true":"chat-text-false"} key={msg._id}>
            {msg.message} 
            </li>
            <span className="sender" >{msg.sender}</span>       
          </div>
        )}
        {this.state.msgData.map((msg, index) => 
          <div className = {this.state.senderName === msg.sender ? "flex-container-true":"flex-container-false"}>
            <li className={this.state.senderName === msg.sender ? "chat-text-true":"chat-text-false"} key={index}>
              {msg.message} 
            </li>
            <span className="sender" >{msg.sender}</span> 
          </div>
        )} 
        <div ref={(el) => { this.messagesEnd = el; }}></div>
      </ul>
    )
  }
}
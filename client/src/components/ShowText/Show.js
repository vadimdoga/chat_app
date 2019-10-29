import React, { Component } from "react";
import axios from "axios";
import "./Show.css";

export default class Show extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      msgData: [],
      senderName: "",
      connectedUsers: 0,
      typing: false,
      typingName: []
    };
    this.props.socket.on("received", entry => {
      this.setState(prevState => ({
        msgData: [...prevState.msgData, entry]
      }));
    });
    this.props.socket.on("sendName", entry => {
      this.setState({
        senderName: entry
      });
    });
    this.props.socket.on("connectedUsers", entry => {
      this.setState({
        connectedUsers: entry
      });
    });
    this.props.socket.on("typingTrue", entry => {
      this.setState({
        typing: true
      });
      if (!this.state.typingName.includes(entry)) {
        this.setState(prevState => ({
          typingName: [...prevState.typingName, entry]
        }));
      }
      setTimeout(() => {
        this.setState({
          typing: false
        });
      }, 3000);
    });

    this.scrollToBottom = this.scrollToBottom.bind(this);
  }
  componentDidMount() {
    this.scrollToBottom();
    axios.get("http://192.168.0.3:8080/chats").then(res => {
      const messages = res.data;
      this.setState({
        messages: messages
      });
    });
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView();
  };
  render() {
    return (
      <ul className="chat-box">
        <div className="chat-header">
          <p className="name">Chat App</p>
          <p className="connected">Connected: {this.state.connectedUsers}</p>
        </div>
        {this.state.messages.map(msg => (
          <div
            className={
              this.state.senderName === msg.sender
                ? "flex-container-true"
                : "flex-container-false"
            }
            key={msg._id}
          >
            <li
              className={
                this.state.senderName === msg.sender
                  ? "chat-text-true"
                  : "chat-text-false"
              }
            >
              {msg.message}
            </li>
            <span
              className={
                this.state.senderName === msg.sender ? "sender-hide" : "sender"
              }
            >
              {msg.sender}
            </span>
          </div>
        ))}
        {this.state.msgData.map((msg, index) => (
          <div
            className={
              this.state.senderName === msg.sender
                ? "flex-container-true"
                : "flex-container-false"
            }
            key={index}
          >
            <li
              className={
                this.state.senderName === msg.sender
                  ? "chat-text-true"
                  : "chat-text-false"
              }
            >
              {msg.message}
            </li>
            <span
              className={
                this.state.senderName === msg.sender ? "sender-hide" : "sender"
              }
            >
              {msg.sender}
            </span>
          </div>
        ))}
        {this.state.typing
          ? this.state.typingName.map(name => (
              <div>
                <span className="sender">{name}</span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            ))
          : 
          this.state.typingName.splice(
              this.state.typingName.indexOf(0)
            )
            }

        <div
          ref={el => {
            this.messagesEnd = el;
          }}
        ></div>
      </ul>
    );
  }
}

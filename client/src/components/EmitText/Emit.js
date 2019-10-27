import React, { Component } from 'react'
import './Emit.css'
import bigInt from 'big-integer'
 export default class Emit extends Component{
   constructor(props){
     super(props)
     this.state = {
      msg: "",
      publicObject: Object
    }
    

    this.handleChange = this.handleChange.bind(this);
    this.sendToServer = this.sendToServer.bind(this)
   }
  handleChange(evt){
    this.setState({
      msg: evt.target.value
    })
  }
  componentDidMount(){
    this.props.socket.on('publicKey', entry => {
      this.setState({
        publicObject: entry
      })
    })
  }
  sendToServer(evt) {
    evt.preventDefault();
    
    const encodedMessage = this.encode(this.state.msg)
    const publicKey = Object.values(this.state.publicObject)[0]
    const publicExp = Object.values(this.state.publicObject)[1]
    console.log("Encoded Message: " + encodedMessage)
    console.log("Public Key: " + publicKey)
    console.log("Public Exponent: " + publicExp)
    const encryptedMessage = this.encrypt(encodedMessage, publicKey, publicExp)
    console.log("Encrypted message: " + encryptedMessage)
    this.props.socket.emit('msg', encryptedMessage)
    // this.props.socket.emit('msg', this.state.msg)
    
    this.setState({
      msg:""
    })
  }
  encode = (str) => {
    const codes = str
      .split('')
      .map(i => i.charCodeAt())
      .join('');

    return bigInt(codes);
  }
  encrypt = (encodedMsg, n, e) => {
    return bigInt(encodedMsg).modPow(e, n);
  }
   render(){
     return(
       <div>
         <form onSubmit={this.sendToServer}>
          <input className="input-text" type="text" name="input" value={this.state.msg} onChange={this.handleChange} />
          <input className="input-submit" type="submit" value="Send" />
        </form>
       </div>
     )
   }
 }
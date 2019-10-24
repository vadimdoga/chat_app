import React, { Component } from 'react'
import io from 'socket.io-client'
const socket = io.connect('http://localhost:8080')

 export default class Emit extends Component{
   constructor(){
     super()
     this.state = {
      msg: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.sendToServer = this.sendToServer.bind(this)
   }
  handleChange(evt){
    this.setState({
      msg: evt.target.value
    })
  }
  sendToServer(evt) {
    evt.preventDefault();

    socket.emit('msg', this.state.msg)
    
    this.setState({
      msg:""
    })
  }
   render(){
     return(
       <div>
         <form onSubmit={this.sendToServer}>
          <input type="text" name="input" value={this.state.msg} onChange={this.handleChange} />
          <input type="submit" value="Submit" />
        </form>
       </div>
     )
   }
 }
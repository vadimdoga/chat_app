import React, { Component } from 'react'
import io from 'socket.io-client'
const socket = io.connect('http://localhost:8080')

 export default class Client extends Component{
  constructor(){
    super()
    this.state = {
      msg: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.connectToServer = this.connectToServer.bind(this)
  }
  connectToServer(evt) {
    evt.preventDefault();

    socket.emit('data', this.state.msg)
    socket.on('send back', (data) => {
      console.log(data)
    })
    
    this.setState({
      msg:""
    })
  }
  handleChange(evt){
    this.setState({
      msg: evt.target.value
    })
  }
   render(){
     return(
       <div>
        <form onSubmit={this.connectToServer}>
          <input type="text" name="input" value={this.state.msg} onChange={this.handleChange} />
          <input type="submit" value="Submit" />
        </form>
       </div>
     )
   }
 }
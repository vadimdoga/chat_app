import React, { Component } from 'react'
import './Emit.css'
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

    this.props.socket.emit('msg', this.state.msg)
    
    this.setState({
      msg:""
    })
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
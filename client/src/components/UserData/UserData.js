import React from 'react'
import './UserData.css'
export default class UserData extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      name: "",
      connectedUsers: false
    }

    this.handelSubmit = this.handelSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  handelSubmit(evt){
    evt.preventDefault()
    //send name to server
    this.props.socket.emit('userData', this.state.name)

    //check result from server if name is already connected
    this.props.socket.on("availableNickname", entry => {
      if(entry){
        let modal = document.getElementsByClassName("modal")[0]
        modal.style.display = "none"
      } else {
        this.setState({
          name: "This name is already used"
        })
      }
    })

  }
  handleChange(evt){
    this.setState({
      name: evt.target.value
    })
  }
  render() {
    return(
      <div className="modal">
        <div className="modal-content">
          <form onSubmit={this.handelSubmit}>
            <h1>What is your name?</h1>
            <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    )
  }
}
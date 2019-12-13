import React from 'react'
import Emit from '../components/EmitText/Emit'
import Show from '../components/ShowText/Show'
import UserData from '../components/UserData/UserData'
import io from 'socket.io-client'
import RSA from './RSA'
const socket = io.connect('http://192.168.0.3:8080')

export default class Chat extends React.Component{
  constructor(){
    super()
    this.state = {
      publicKey: null,
      publicExp: null,
      privateKey: null
    }
  }
  componentDidMount() {
    //generate RSA keys
    const keys = RSA.generate(250)

    this.setState({
      publicKey: keys.n,
      publicExp: keys.e,
      privateKey: keys.d
    })
    console.log('Keys:')
    console.log('Public Key: ',keys.n.toString())
    console.log('Private Key: ', keys.d.toString())
    console.log('Public Exponent ', keys.e.toString())    

  }
  
  render(){
    return(
      <div>
        <UserData socket={socket} publicKey={this.state.publicKey} publicExp={this.state.publicExp}/>
        <Show socket={socket} privateKey={this.state.privateKey} publicKey={this.state.publicKey} />
        <Emit socket={socket} />
      </div>
    )
  }
}

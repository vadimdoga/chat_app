import React from 'react'
import Emit from '../components/EmitText/Emit'
import Show from '../components/ShowText/Show'
import UserData from '../components/UserData/UserData'
import io from 'socket.io-client'
import RSA from './RSA'
const DSA = require('z-dsa2')()
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
    //generate DSA keys
    const dsaKeys = DSA.keyPairNew()
    const dsaPrivateKey = dsaKeys.private
    const dsaPublicKey = dsaKeys.public

    this.setState({
      publicKey: keys.n,
      publicExp: keys.e,
      privateKey: keys.d,
      dsaPrivateKey: dsaPrivateKey,
      dsaPublicKey: dsaPublicKey
    })
    console.log('Keys:')
    console.log('Public Key: ',keys.n.toString())
    console.log('Private Key: ', keys.d.toString())
    console.log('Public Exponent ', keys.e.toString())    
  }
  
  render(){
    return(
      <div>
        <UserData 
          socket={socket} 
          publicKey={this.state.publicKey} 
          publicExp={this.state.publicExp}
          dsaPublicKey={this.state.dsaPublicKey}
          dsaPrivateKey={this.state.dsaPrivateKey}
        />
        <Show 
          socket={socket} 
          privateKey={this.state.privateKey} 
          publicKey={this.state.publicKey} 
          dsaPublicKey={this.state.dsaPublicKey}
          />
        <Emit 
          socket={socket}  
          dsaPrivateKey={this.state.dsaPrivateKey}
        />
      </div>
    )
  }
}

import React from 'react';
import {Auth, Database, Storage, Token} from '@three0dev/js-sdk'
import { env } from './env';
import IconButton from '@mui/material/IconButton';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SendIcon from '@mui/icons-material/Send';
import PaidIcon from '@mui/icons-material/Paid';
import Swal from 'sweetalert2'

function App() {
  return (
    <div className="App">
      <header>
        <h1>Chat App ⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {/* {Auth.isLoggedIn() ? <ChatRoom /> : <SignIn />} */}
        <ChatRoom />
      </section>

    </div>
  );
}

function SignIn() {
  const signIn = Auth.login;

  return (
      <button onClick={signIn}>Sign in with NEAR</button>
  )
}
function SignOut() {
  const signOut = async () => {
    await Auth.logout()
  }

  return Auth.isLoggedIn() && (
      <button onClick={signOut}>Sign out</button>
  )
}

function ChatRoom() {
  const [messagesRef, setMessagesRef] = React.useState(null);
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
      Database.DocStore(env.chatAppDBURL, {indexBy: 'createdAt'}).then((docstore) => {
        setMessagesRef(docstore);
        setMessages(docstore.get().reverse());
        docstore.onChange(() => {
          setMessages(docstore.get().reverse())
        })
      })
  }, []);


  const [formValue, setFormValue] = React.useState('');


  const sendTextMessage = async (e) => {
    e.preventDefault();

    const uid = Auth.getAccountId();

    const payload = {
      text: formValue,
      createdAt: Database.timestamp(),
      uid,
    }

    const id = await messagesRef.add(payload)

    setMessages([...messages, { ...payload, _id: id }])

    setFormValue('');
  }

  const [files, setFile] = React.useState(null);
  const sendFileMessage = async (e) => {
    e.preventDefault();

    const uid = Auth.getAccountId();

    console.log(files);

    const payload = {
      file : files.name,
      createdAt: Database.timestamp(),
      uid,
    }

    const id = await messagesRef.add(payload)

    setMessages([...messages, { ...payload, _id: id }])
    Storage.uploadFile(files)
    setFormValue('');
    // setFile(null);
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg._id} message={msg} />)}
    </main>
    <form onSubmit={formValue === files?.name ? sendFileMessage : sendTextMessage}>
      <input value={formValue} onChange={(e) => {
        setFormValue(e.target.value);}} placeholder="say something nice"/>
      <IconButton color="primary" aria-label="upload picture" component="label" onClick={
        // open sweetalert
        async () => {
          const { value: amount } = await Swal.fire({
            title: 'Three0 Pay',
            html:
              '<input id="swal-input1" class="swal2-input" placeholder="Amount">' +
              '<select id="swal-input2" class="swal2-input">' +
              '<option value="send">Send</option>' +
              '<option value="request">Request</option>' +
              '</select>',
            focusConfirm: false,
            preConfirm: () => {
              return [
                  document.getElementById('swal-input1').value,
                  document.getElementById('swal-input2').value
                ]
            }
          }).then((result) => {
            if(result.value[1] === 'request'){
              Swal.fire({
                title: 'Request Sent',
                text: 'You have requested ' + result.value[0] + ' NEAR',
                icon: 'success',
                confirmButtonText: 'Ok'
              })
            }
            else{
              if (Token.isUserRegistered()){
                Token.transferTokens(result.value[0]).then((result) => {
                  Token.getBalance().then((balance) => {
                    Swal.fire({
                      title: 'Payment Sent',
                      text: 'You have sent ' + result.value[0] + ' NEAR. Your balance is ' + balance + ' NEAR',
                      icon: 'success',
                      confirmButtonText: 'Ok'
                    })
                    console.log(balance)
                  })
                  console.log(result)
                })
            }}
          })
        }
      }>
        {/* send money */}
        <PaidIcon />
      </IconButton>
      <IconButton color="primary" aria-label="upload picture" component="label">
        <input hidden accept="image/*" type="file" id="myFile" name="filename" onChange={
        (e) => {
          setFile(e.target.files[0]);
          console.log(e.target.files[0]);
          setFormValue(e.target.files[0].name);
        }
      }/>
        <InsertPhotoIcon />
      </IconButton>

      <button type="submit" disabled={!formValue}><SendIcon/></button>
    </form>
  </>)
}
function ChatMessage(props) {
  const messageClass = props.message.uid === Auth.getAccountId() ? 'sent' : 'received';
  const [imageMedia, setImageMedia] = React.useState("")

  React.useEffect(() => {
    if(props.message.file){
      Storage.openFile(props.message.file).then((data) => {
        console.log(data)
        setImageMedia(data.media)
      })
    }
  }, []);

  return (
  <>
    <div className={`message ${messageClass}`}>
      {props.message.file ? <img border-radius='0%' 
      
      src={imageMedia}/> : <p>{props.message.text}</p>}
    </div>
  </>)
}

export default App;

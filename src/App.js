import React from 'react';
import {Auth, Database, Storage} from '@three0dev/js-sdk'
import { env } from './env';


let files = [];
function App() {
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {Auth.isLoggedIn() ? <ChatRoom /> : <SignIn />}
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
function UploadFile() {
  const uploadFile = Storage.uploadFile();
  return (
    <button onClick={uploadFile}>Upload File</button>
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

  const [file, setFile] = React.useState(null);
  // send files
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
    setFormValue('image')
    Storage.uploadFile(files);
    Storage.openFile(files.name);
  }
  // let selected = false;
  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg._id} message={msg} />)}
    </main>
    <form onSubmit={formValue === 'image' ? sendFileMessage : sendTextMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <input type="file" id="myFile" name="filename" onChange={
        (e) => {
          files = e.target.files[0];
          setFormValue('image');
          setFile(files);
        }
      }/>

      <button type="submit" disabled={!formValue}>🕊️</button>
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
      {props.message.file ? <img border-radius='80%' src={imageMedia}/> : <p>{props.message.text}</p>}
    </div>
  </>)
}

export default App;

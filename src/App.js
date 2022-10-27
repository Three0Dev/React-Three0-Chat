import React from 'react';
import {Auth, Database} from '@three0dev/js-sdk'
import { env } from './env';

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


  const sendMessage = async (e) => {
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

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg._id} message={msg} />)}
    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}
function ChatMessage(props) {
  const { text, uid } = props.message;

  const messageClass = uid === Auth.getAccountId() ? 'sent' : 'received';

  return (
  <>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}

export default App;

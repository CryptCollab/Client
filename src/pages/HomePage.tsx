import io from 'socket.io-client';
import Navbar from '../components/Navbar';




function Home() {

  /**
   * Socket.io demo
   */
  const socket = io('http://localhost:8000');

  socket.on('reply', function (data: any) { console.log("reply: ", data) });

  socket.on('connect', function () {
    console.log('connected')
    console.log("msg: What did the ocean say to the beach ?")
    socket.emit('msg', "What did the ocean say to the beach ?");
  });

  socket.on('disconnect', function () { console.log('disconnected') });




  return (<div>
    <p>Home(Landing) Page</p>
    <Navbar />
  </div>)
}

export default Home

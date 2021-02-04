const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require('body-parser')
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(bodyParser.urlencoded({extended:false}));


app.get("/join", (req, res) => {
  res.render("join");
});

app.post("/room", (req, res) => {
  res.render("room", { room: req.body.room,username: req.body.Username });
});


io.on("connection", (socket) => {
  socket.on("join-room", (roomName,username, userId) => {
    console.log(userId);
    socket.join(roomName);
   
    socket.emit('createMessage', { message: `${username },welcome to the room ${roomName}`,username: 'Admin', });

    socket.to(roomName).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomName).emit("createMessage", {message,username});
    });
  
    socket.on('disconnect', () => {
      io.to(roomName).emit('createMessage', { message: `${username }, has left the room`,username: 'Admin', })
      socket.to(roomName).broadcast.emit('user-disconnected', userId)
    })

  });
});

server.listen(process.env.PORT || 3030,()=>{
  console.log("Server is Up and running on port 3030")
});

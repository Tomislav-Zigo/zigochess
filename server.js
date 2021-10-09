const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const jsChessEngine = require('js-chess-engine')
const port = process.env.port || 3000; 


app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log(res.socket.remoteAddress)
    res.sendFile(path.join(__dirname, "public", "/index.html"));
});

app.get('/*', (req, res) => {
    console.log(res.socket.remoteAddress)
    res.sendFile(path.join(__dirname, "public", "/404.html"));
});

io.on("connect",(socket)=>{
    socket.on("legal moves req" , (msg)=>{
        console.log(msg)
        let game = new jsChessEngine.Game(msg.boardFEN);
        let result = {"square": msg.square, "moves" : game.moves(msg.square)}
        socket.emit('legal moves res', result)
    })
    
    socket.on("computer move req",(msg)=>{
        var game = new jsChessEngine.Game(msg.boardFEN);
        game.aiMove(msg.difficulty)  
        socket.emit("computer move res" , game.exportFEN());
    })

    socket.on("player move", (msg)=>{
        var game = new jsChessEngine.Game(msg.FENString);
        try {
            game.move(msg.square1 , msg.square2);
        } catch (error) {
            socket.emit("invalid move", msg)
        }
        socket.emit("position update" , game.exportFEN());
    })
})

server.listen(port, () => {
    console.log('listening on *:3000');
});
      


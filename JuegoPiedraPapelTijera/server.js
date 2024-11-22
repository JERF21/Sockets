const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};
let history = [];

app.use(express.static('public')); 

io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

 
    if (Object.keys(players).length === 1) {
        io.emit('player_joined', 'El otro jugador ya ha elegido su jugada. Espera el resultado.');
    }

   
    socket.on('play', (move) => {
        players[socket.id] = move;
        console.log(`Jugador ${socket.id} jugó: ${move}`);

  
        if (Object.keys(players).length === 2) {
            const [player1, player2] = Object.keys(players);
            const result = resolveGame(players[player1], players[player2]);
       
            history.push({
                player1: { id: player1, move: players[player1], result: result.player1 },
                player2: { id: player2, move: players[player2], result: result.player2 }
            });
        
        
            io.to(player1).emit('result', { result: result.player1, history });
            io.to(player2).emit('result', { result: result.player2, history });
            
        
            players = {}; 
        }
        
        
    });


    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
        delete players[socket.id];
    });
});


function resolveGame(move1, move2) {
    if (move1 === move2) {
        return { player1: 'Empate!', player2: 'Empate!' };
    }

    if (
        (move1 === 'piedra' && move2 === 'tijera') ||
        (move1 === 'papel' && move2 === 'piedra') ||
        (move1 === 'tijera' && move2 === 'papel')
    ) {
        return { player1: 'Ganaste!', player2: 'Perdiste!' };
    } else {
        return { player1: 'Perdiste!', player2: 'Ganaste!' };
    }
}

server.listen(3500, () => {
    console.log('Servidor corriendo en http://localhost:3500');
});

const path = require('path');
const express = require('express');
const app = express();

//settings
app.set('port', process.env.PORT || 3000);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//start the server
const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});

//websockets
const SocketIO = require('socket.io');
const io = SocketIO(server);

//almacenar los nombres de usuarios
const users = {};

io.on('connection', (socket) => {
    console.log('new connection', socket.id);

//escuchar cuando un usuario envía su nombre
    socket.on('chat:register', (username) => {
        users[socket.id] = username; 
        console.log(`${username} se ha conectado`);
    });
//emitir mensaje a todos los usuarios, incluyendo al emisor
    socket.on('chat:message', (data) => {
        io.sockets.emit('chat:message', data);
        socket.broadcast.emit('chat:notification', {
            message: `${data.username} envió un mensaje`
        });
    });

//cuando alguien está escribiendo, emitir a los demás
    socket.on('chat:typing', (data) => {
        socket.broadcast.emit('chat:typing', data);
        socket.broadcast.emit('chat:notification', {
            message: `${data} está escribiendo...`
        });
    });

//detectar cuando un usuario se desconecta
    socket.on('disconnect', () => {
        const username = users[socket.id] || 'Alguien';
        delete users[socket.id];
        console.log(`${username} se ha desconectado`);
        io.sockets.emit('chat:notification', {
            message: `${username} se ha desconectado`,
            type: 'disconnect'
        });
    });
});



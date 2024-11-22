const socket = io();
let message = document.getElementById('message');
let username = document.getElementById('username');
let btn = document.getElementById('send');
let output = document.getElementById('output');
let actions = document.getElementById('actions');
let notification = document.getElementById('notification');

//para los sonidos
const sonidoMensaje = new Audio('/sonidos/mensaje.mp3');
const sonidoDesconexion = new Audio('/sonidos/desconexion.mp3');
const sonidoEscribir = new Audio('/sonidos/escribir.mp3');

//para cuando se esta escribiendo
let escribiendoActivo = false;

//registras nombre de usuario
username.addEventListener('change', function () {
    socket.emit('chat:register', getUsername());
});

//acciones del boton
btn.addEventListener('click', function () {
    const user = getUsername(); 
    socket.emit('chat:message', {
        message: message.value,
        username: user,
        socketId: socket.id
    });
    message.value = '';
});

//sonido escribir
message.addEventListener('keypress', function () {
    const user = getUsername();
    socket.emit('chat:typing', user);
    if (!escribiendoActivo) {
        sonidoEscribir.currentTime = 0;
        sonidoEscribir.play();
        escribiendoActivo = true;
    }
});

//cuando se deja de escribir
message.addEventListener('keyup', function () {
    if (message.value === '') {
        socket.emit('chat:stopTyping', getUsername());
    }
});


//cuando se envia un mensaje
socket.on('chat:message', function (data) {
    actions.innerHTML = '';
    output.innerHTML += `<p>
        <strong>${data.username}</strong>: ${data.message}
    </p>`;
    if (data.socketId !== socket.id) {
        showNotification(`${data.username} envió un mensaje`, sonidoMensaje, 'green');
    }
});

//notificacion escribiendo
socket.on('chat:typing', function (data) {
    actions.innerHTML = `<p><em>${data} está escribiendo...</em></p>`;
    showNotification(`${data} está escribiendo...`, sonidoEscribir, 'yellow');
});

//detener sonido escribir
socket.on('chat:stopTyping', function () {
    sonidoEscribir.pause();
    escribiendoActivo = false;
    actions.innerHTML = '';
});

//sonido de desconexion
socket.on('chat:notification', function (data) {
    if (data.type === 'disconnect') {
        showNotification(`${data.message}`, sonidoDesconexion, 'red');
        output.innerHTML += `<p style="color: red; font-style: italic;"><strong>${data.message}</strong></p>`;
    }
});

//parte del nombre
function getUsername() {
    return username.value.trim() === '' ? 'alguien' : username.value.trim();
}


//ejecutar notificaciones, sonidos y mensajes
function showNotification(message, sound, color) {
    notification.innerHTML = `<div class="notification" style="background-color: ${color}; color: white;">${message}</div>`;
    sound.currentTime = 0;
    sound.play();

    setTimeout(() => {
        notification.innerHTML = '';
    }, 3000);
}

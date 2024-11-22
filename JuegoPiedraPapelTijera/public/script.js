const socket = io();

// Referencias al modal y botones
const modal = document.getElementById('gameModal');
const openGameButton = document.getElementById('openGame');
const closeGameButton = document.getElementById('closeGame');

// Abrir el modal
openGameButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Cerrar el modal
closeGameButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Enviar la jugada al servidor
function play(move) {
    socket.emit('play', move);
    document.getElementById('result').innerText = 'Esperando la jugada del oponente...';
}

// Escuchar el resultado del servidor
socket.on('result', (data) => {
    const { result, history } = data;

    // Mostrar el resultado de la ronda actual
    document.getElementById('result').innerText = result;

    // Actualizar el historial en la interfaz
    const historyElement = document.getElementById('history');
    historyElement.innerHTML = ''; // Limpiar el historial actual
    history.forEach((entry, index) => {
        const historyItem = document.createElement('p');
        historyItem.textContent = `
            Ronda ${index + 1}: 
            Jugador 1 (${entry.player1.move} - ${entry.player1.result}) vs 
            Jugador 2 (${entry.player2.move} - ${entry.player2.result})
        `;
        historyElement.appendChild(historyItem);
    });
});


const chatInput = document.getElementById('chat-input');
const messages = document.querySelector('.messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

socket.emit('userJoin', { name, room });

socket.on('room', ({ room, users }) => {
    showRoom(room);
    showUsers(users);
});

socket.on('message', msg => {
    showMessage(msg);
});

chatInput.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chat', msg);
    e.target.elements.msg.value = '';
});

function showMessage(msg){
    const message = document.createElement('div');
    message.innerHTML = `<p>${msg.name}</p><p>${msg.msg}</p>`;
    messages.appendChild(message);
}

function showRoom(room){
    roomName.innerText = room;
}

function showUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.name}</li>`).join('')}`;
}
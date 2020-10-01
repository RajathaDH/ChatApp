const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

io.on('connection', socket => {
    socket.on('userJoin', ({ name, room }) => {
        const user = joinUser(socket.id, name, room);
        socket.join(user.room);
        socket.emit('message', { name: 'Server', msg: 'Welcome'});
        socket.broadcast.to(user.room).emit('message', { name: 'Server', msg: `${user.name} joined` });
    

        io.to(user.room).emit('room', { room: user.room, users: getUsers(user.room)});
    });

    socket.on('chat', msg => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { name: user.name, msg: msg });
    });

    socket.on('disconnect', () => {
        const user = leaveUser(socket.id);

        if(user){
            io.to(user.room).emit('message', { name: 'Server', msg: `${user.name} left` });
            io.to(user.room).emit('room', { room: user.room, users: getUsers(user.room) });
        }
    });
});

server.listen(3000, () => console.log('Server running'));

const users = [];

function joinUser(id, name, room){
    const user = { id, name, room };
    users.push(user);
    return user;
}

function getUser(id){
    return users.find(user => user.id == id);
}

function leaveUser(id){
    const userIndex = users.findIndex(user => user.id == id);
    if(userIndex != -1){
        return users.splice(userIndex, 1)[0];
    }
}

function getUsers(room){
    return users.filter(user => user.room == room);
}
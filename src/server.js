const { io, app, publicDirectoryPath, Filter } = require('./index');
const {
    generateMessage,
    generateLocationMessage,
} = require('./utils/messages');

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require('./utils/users');

app.get('/', (req, res) => {
    res.sendFile('/html/index.html', { root: publicDirectoryPath });
});

io.on('connection', (socket) => {
    console.log('New Websocket Connection');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit(
            'welcomeMessage',
            generateMessage(`Welcome to the ${user.room} chatroom!`)
        );

        socket.broadcast
            .to(user.room)
            .emit(
                'welcomeMessage',
                generateMessage(`${user.username} has joined the chat!`)
            );

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed.');
        }

        io.to(user.room).emit('message', generateMessage(message, user));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit(
            'locationMessage',
            generateLocationMessage(
                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
                user
            )
        );
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                'goodbyeMessage',
                generateMessage(`${user.username} left the chat.`, user)
            );
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

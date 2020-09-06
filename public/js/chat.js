const socket = io();

// Elements
const messageForm = document.querySelector('.form');
const text = document.querySelector('.text');
const messageBtn = document.getElementById('sendMessage');
const getLocation = document.getElementById('send_location');
const messages = document.getElementById('messages');

// Templates
const messageTemplate = document.getElementById('message_template').innerHTML;
const welcomeTemplate = document.getElementById('welcome_template').innerHTML;
const locationUrlTemplate = document.getElementById('locationUrl_template')
    .innerHTML;
const sidebarTemplate = document.getElementById('sidebar_template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoscroll = () => {
    // New Message Elements
    const newMessage = messages.lastElementChild;

    // Height of the New Message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = messages.offsetHeight;

    // Height of Messages Container
    const contentHeight = messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (contentHeight - newMessageHeight - 50 <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.user.username,
        date: moment(message.createdAt).format('MMM Do'),
        createdAt: moment(message.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('welcomeMessage', (message) => {
    console.log(message);
    const html = Mustache.render(welcomeTemplate, {
        greeting: message.text,
        date: moment(message.createdAt).format('MMM Do'),
        createdAt: moment(message.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('goodbyeMessage', (message) => {
    console.log(message);
    const html = Mustache.render(welcomeTemplate, {
        greeting: message.text,
        date: moment(message.createdAt).format('MMM Do'),
        createdAt: moment(message.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (location) => {
    console.log(location);
    const link = Mustache.render(locationUrlTemplate, {
        location: location.url,
        username: location.user.username,
        date: moment(location.createdAt).format('MMM Do'),
        createdAt: moment(location.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend', link);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    document.getElementById('sidebar').innerHTML = html;
});

function submitOnEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        messageBtn.click();
    }
}

text.addEventListener('keypress', submitOnEnter);

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    messageBtn.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', text.value, (err) => {
        messageBtn.removeAttribute('disabled');
        text.value = '';
        text.focus();

        if (err) {
            return console.log('Message not delivered. ' + err);
        }

        console.log('Message Delivered!');
    });
});

getLocation.addEventListener('click', (e) => {
    getLocation.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            socket.emit('sendLocation', { latitude, longitude }, () => {
                console.log('Location shared!');
            });
        },
        function (err) {
            if (err.code == err.PERMISSION_DENIED) {
                return alert(
                    'Geolocation feature has been turned off by your browser.'
                );
            }
        }
    );
    getLocation.removeAttribute('disabled');
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

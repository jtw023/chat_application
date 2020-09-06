const generateMessage = (text, user) => {
    return {
        text,
        user,
        createdAt: new Date().getTime(),
    };
};

const generateLocationMessage = (url, user) => {
    return {
        url,
        user,
        createdAt: new Date().getTime(),
    };
};

module.exports = {
    generateMessage,
    generateLocationMessage,
};

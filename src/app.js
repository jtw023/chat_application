const { server, port } = require('./index');
require('./server');

server.listen(port, () => {
    console.log('Server is up on port ' + port);
});

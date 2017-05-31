const express = require('express');
const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);
const firstTodos = require('./data');
const Todo = require('./todo');
// import Todo from './todo';
const public = `${__dirname}/root`;
let count = 0;

// socket.io connection
app.get('/', (req, res) => {

    // when someone goes to root, send index page
    res.sendFile(`${public}/index.html`);

});

socket.on('connection', (client) => {

    client.send(firstTodos);

    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    const DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title = t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        console.log('something');
        socket.emit('load', DB);
    }

    // // Accepts when a client makes a new todo
    client.on('make', (t) => {

        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        reloadTodos();
    });

    // Send the DB downstream on connect
    reloadTodos();

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.use(express.static(public));

console.log('Waiting for clients to connect');
server.listen(3003);

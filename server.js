const express = require('express');
const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);
const firstTodos = require('./data');
const Todo = require('./todo');
const public = `${__dirname}/root`;
const Cookies = require('js-cookie');
let count = 0;
// let savedTodos = (window.localStorage) ? JSON.parse(localStorage.getItem('data')) : false;

// socket.io connection
app.get('/', (req, res) => {

    // when someone goes to root, send index page
    res.sendFile(`${public}/index.html`);

});

// SOCKET CONNECTION
socket.on('connection', (client) => {
    // client.send(firstTodos);

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...
    let DB = firstTodos.map((t) => {
        // Form new Todo objects
        return new Todo(title = t.title);
    });

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        socket.emit('load', DB);
    }

    // Sends a message to the client to reload all todos
    const addTodos = (t) => {
        const data = {
            history: DB,
            newItem: t
        }
        socket.emit('add', data);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {

        // Make a new todo
        const newTodo = new Todo(title = t.newItem.title);
        if (t.history) {
            console.log(t.history);
            DB = t.history;
        }
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        addTodos(newTodo);

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

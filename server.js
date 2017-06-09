/**
* Todo
*
* Multi-user live to-do list.
* A socket.io project.
*
* Denis Nossevitch - 2017
*/

const express = require('express');
const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);
const firstTodos = require('./data');
const Todo = require('./todo');
const public = `${__dirname}/root`;
let count = 0;

// socket.io connection
app.get('/', (req, res) => {

    // When someone goes to root, send index page
    res.sendFile(`${public}/index.html`);

});

// When a user connects
socket.on('connection', (client) => {

    // Add to active user count
    count++;

    // Connections from the last time the server was run...
    let DB = firstTodos.map((t) => {

        // Form new Todo objects
        return new Todo(title = t.title);

    });

    // Sends message to the client to display connected user info
    const userCount = (event) => {
        const data = {
            event: event,
            count: count
        }
        socket.emit('updateUsers', data);
    }
    userCount('connected');

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        socket.emit('load', DB);
    }

    // deleteTodos, completeTodos, uncompleteTodos,
    const modifyTodos = (t) => {

        const data = {
            history: DB,
            index: t
        }

        socket.emit('modified', data);

    }

    // Sends a message to the client to add new todos
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

        // Update the "DB" with latest array of Todos
        if (t.history) {
            DB = t.history;
        }

        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todo to the client
        addTodos(newTodo);

    });

    // Accepts when a client deletes existing todo
    client.on('delete', (d) => {

        // Determine which todo to delete
        const index = d.index;

        // If stored "DB" exists (anything but initial Todos) - use it
        if (d.history) {
            DB = d.history;
        }

        // Remove the specified todo
        DB.splice(index, 1);

        // Send deleted todo index to client
        // deleteTodos(index);
        modifyTodos(index);

    });

    // Accepts when client delets all existing todos
    client.on('deleteAll', (d) => {

        // Reset "DB" to empty array
        DB = d;

        // Send client empty "DB" to signify all todos being deleted
        socket.emit('deletedAll', DB);

    });

    // Accepts when client completes existing todo
    client.on('complete', (d) => {

        // Determing which todo to complete
        const index = d.index;

        // If stored "DB" exists - use it
        if (d.history) {
            DB = d.history;
        }

        // Create completed Todo
        const todo = new Todo(DB[index].title);
        DB[index] = todo.completed();

        // Send compelted todo index to client
        modifyTodos(index);

    });

    // Accepts when client marks existing completed todo as not completed
    client.on('uncomplete', (d) => {

        // Determine which todo to uncomplete
        const index = d.index;

        // If stored "DB" exists - use it
        if (d.history) {
            DB = d.history;
        }

        // Create uncomplete Todo
        const todo = new Todo(DB[index].title);
        DB[index] = todo.uncompleted();

        // Send uncompleted todo index to client
        modifyTodos(index);

    });

    // Accepts when client marks all existing todos as completed
    client.on('completeAll', (d) => {

        // Make a completed Todo for each todo in "DB"
        let result = [];
        d.forEach((todo, index) => {
            const newTodo = new Todo(todo.title);
            result.push(newTodo.completed());
        });
        DB = result;

        // Send completed todos to client
        socket.emit('completedAll', DB);

    });

    // Reload todos
    reloadTodos();

    // When a client disconnects
    client.on('disconnect', () => {

        // Decrease user count and update user information
        count--;
        userCount('disconnect');

    });

});

app.use(express.static(public));

server.listen(3003);

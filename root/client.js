const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {

    console.warn(event);
    const input = document.getElementById('todo-input');
    console.log(JSON.parse(localStorage.getItem('data')));
    const data = {
        history: JSON.parse(localStorage.getItem('data')),
        newItem: {
            title : input.value
        }
    }

    // Emit the new todo as some data to the server
    server.emit('make', data);

    // Clear the input
    input.value = '';
    // TODO: refocus the element
}

// Clear list contents
function clear() {
    document.getElementById("todo-list").innerHTML = "";
}

// Render the available Todo object(s) as DOM elements
function render(todo) {

    // console.log(todo);
    const listItem = document.createElement('li');
    const listItemText = document.createTextNode(todo.title);
    const listDeleteBtn = document.createElement('button');
    const listItemCheck = document.createElement('input');
    listDeleteBtn.innerHTML = 'x';
    listItemCheck.type = 'checkbox';

    listItem.appendChild(listDeleteBtn);
    listItem.appendChild(listItemText);
    list.append(listItem);
    listItem.appendChild(listItemCheck);

}

// Delete element of deleted Todo
function delete() {

}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {

    if (localStorage.getItem('data')) {
        clear();
        console.log(localStorage.getItem("data"));

        const history = JSON.parse(localStorage.getItem('data'));
        history.forEach((todo) => render(todo));
    } else {
        todos.forEach((todo) => render(todo));
    }
});

server.on('add', (data) => {

    localStorage.setItem("data", JSON.stringify(data.history));
    console.log(localStorage.getItem("data"));
    render(data.newItem);

});

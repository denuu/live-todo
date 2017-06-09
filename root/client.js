/**
* Todo
*
* Multi-user live to-do list.
* A socket.io project.
*
* Denis Nossevitch - 2017
*/

const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server

// This function adds a new todo from the input
function add() {

    // Grab submitted input value and store it in our localStorage 'DB'
    const input = document.getElementById('todo-input');

    if (input.value.trim()) {
        const data = {
            history: JSON.parse(localStorage.getItem('data')),
            newItem: {
                title : input.value,
                done: false
            }
        }

        // Emit the new todo as some data to the server
        server.emit('make', data);
    }

    // Clear the input
    input.value = '';

}

// Function to delete, complete, or uncomplete and item
function modifyItem(index, action) {

    // Get DB data
    const history = JSON.parse(localStorage.getItem('data'));
    const data = {
        history: history,
        index: index
    }

    // Emit action and index
    server.emit(action, data);

}

// Function to mark all existing todos as complete
function completeAll() {

    // Get DB data
    const history = JSON.parse(localStorage.getItem('data'));

    // Emit DB to server to mark all as complete
    server.emit('completeAll', history);

}

// Function to delete all existing todos
function deleteAll() {

    // Simply tell the server to reset our database of todos
    server.emit('deleteAll', []);

}

// Function to clear list contents
function clear() {

    // Remove all elements within the todo-list
    document.getElementById("todo-list").innerHTML = "";

}

// Render the available Todo object(s) as DOM elements
function render(todo, index) {

    // Todo DOM element pieces
    const listItem = document.createElement('li');
    const listItemP = document.createElement('p');
    const listItemText = document.createTextNode(todo.title);
    const listDeleteBtn = document.createElement('button');
    const listDoneBtn = document.createElement('button');
    const toast = document.getElementById("user-toaster");

    // Combine and add attributes to the pieces
    listItem.setAttribute("data-index", index);
    listDoneBtn.innerHTML = '<img src="img/005-mark.svg" class="check"/>';
    listDoneBtn.className = "btn btn-check";
    listDeleteBtn.innerHTML = '<img src="img/multiplication-sign.svg" class="delete"/>';
    listDeleteBtn.className = "btn btn-delete";
    listItem.setAttribute('value', todo.title);
    listDeleteBtn.onclick = function() {
        modifyItem(index, 'delete');
    };

    // If a Todo is completed...
    if (todo.complete) {

        // ... clicking checkbox uncompletes it
        listItem.className = "completed";
        listDoneBtn.onclick = function() {
            modifyItem(index, 'uncomplete');
        };

    } else {

        // ... clicking checkbox completes it
        listDoneBtn.onclick = function() {
            modifyItem(index, 'complete');
        };

    }

    // Build the Todo DOM element
    listItem.appendChild(listDoneBtn);
    listItem.appendChild(listItemP);
    listItemP.appendChild(listItemText);
    list.append(listItem);
    listItem.appendChild(listDeleteBtn);

}

// Function to visualize number of active users, and notify of new connected user
function renderUsers (data) {

    const u = document.getElementById("user-number");
    const toast = document.getElementById("user-toaster");

    // Update count of connected users
    u.innerHTML = data.count;

    // If new user connects, show a toaster notification
    if (data.event == 'connected') {
        toast.className = 'notify';
        window.setTimeout( () => {
            toast.removeAttribute("class");
        }, 2500);
    }

}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {

    // Load saved Todos
    if (localStorage.getItem('data')) {

        // If a localStorage data exists, clear Todo elements and load these
        clear();
        const history = JSON.parse(localStorage.getItem('data'));
        history.forEach((todo, index) => render(todo, index));

    } else {

        // If no localStorage data exists, load default Todos as DOM elements
        clear();
        todos.forEach((todo, index) => render(todo, index));

    }

});

// Event for deleted, completed, or uncompleted todo
server.on('modified', (data) => {

    // Load Todos from DB
    localStorage.setItem("data", JSON.stringify(data.history));

    // Clear the list
    clear();

    // Render Todos
    data.history.forEach((todo, index) => render(todo, index));

});

// Event for adding a new todo to the "DB" and rendering it
server.on('add', (data) => {

    // Add the new Todo to our DB history
    localStorage.setItem("data", JSON.stringify(data.history));

    // Render new as DOM element
    render(data.newItem, data.history.length - 1);

});

// Event for when server emits delete all todos, clear stored DB and DOM list
server.on('deletedAll', (data) => {

    // Update our DB with empty array
    localStorage.setItem('data', JSON.stringify(data));

    // Clear the list
    clear();

});

// Event for when server emits complete all todos
server.on('completedAll', (data) => {

    // Update DB
    localStorage.setItem('data', JSON.stringify(data));

    // Clear list and render updated todos
    clear();
    data.forEach((todo, index) => render(todo, index));

});

// Event for when server emits connected user update
server.on('updateUsers', (data) => {

    // Render updated users with count
    renderUsers(data);

});

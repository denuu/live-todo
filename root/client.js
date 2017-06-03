const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server

// This function adds a new todo from the input
function add() {

    // Grab submitted input value and store it in our localStorage 'DB'
    console.warn(event);
    const input = document.getElementById('todo-input');
    const data = {
        history: JSON.parse(localStorage.getItem('data')),
        newItem: {
            title : input.value,
            done: false
        }
    }

    // Emit the new todo as some data to the server
    server.emit('make', data);

    // Clear the input
    input.value = '';
    // TODO: refocus the element
}

function deleteItem(index) {
    const history = JSON.parse(localStorage.getItem('data'));
    // history.splice(index, 1);
    const data = {
        history: history,
        deleteItem: index
    }
    // Emit the index and history of the deleted todo
    server.emit('delete', data);
}

function deleteAll() {
    server.emit('deleteAll', []);
}

// Mark a Todo as completed
function completeItem(index) {
    const history = JSON.parse(localStorage.getItem('data'));

    const data = {
        history: history,
        completeItem: index
    }
    // Emit the index and history of the deleted todo
    server.emit('complete', data);
}

function completeAll() {

    const history = JSON.parse(localStorage.getItem('data'));

    server.emit('completeAll', history);

}

// Clear list contents
function clear() {
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

    listItem.setAttribute("data-index", index);
    listDoneBtn.innerHTML = '<img src="img/005-mark.svg" class="check"/>';
    listDoneBtn.className = "btn btn-check";
    listDeleteBtn.innerHTML = '<img src="img/multiplication-sign.svg" class="delete"/>';
    listDeleteBtn.className = "btn btn-delete";
    listItem.setAttribute('value', todo.title);

    if (todo.complete) {
        listItem.className = "completed";
    }

    // Give the pieces onClick actions
    listDeleteBtn.onclick = function() {
        deleteItem(index);
    };

    // Give the pieces onClick actions
    listDoneBtn.onclick = function() {
        completeItem(index);
    };

    // Build the Todo DOM element
    listItem.appendChild(listDoneBtn);
    listItem.appendChild(listItemP);
    listItemP.appendChild(listItemText);
    list.append(listItem);
    listItem.appendChild(listDeleteBtn);

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
        clear();

        // FIXME If 2 browsers clear storage, refresh one and second will have 2 sets of default Todos
        // If no localStorage data exists, load default Todos as DOM elements
        todos.forEach((todo, index) => render(todo, index));

    }
});

server.on('add', (data) => {

    // Add the new Todo to our DB history, and render new as DOM element
    localStorage.setItem("data", JSON.stringify(data.history));
    render(data.newItem, data.history.length-1);

});

server.on('deleted', (data) => {

    // Add the new Todo to our DB history, and render new as DOM element
    localStorage.setItem("data", JSON.stringify(data.history));
    clear();
    data.history.forEach((todo, index) => render(todo, index));

});

// Server emitted deleteAll, clear stored DB and DOM list
server.on('deletedAll', (data) => {

    localStorage.setItem('data', JSON.stringify(data));
    clear();

});

server.on('completed', (data) => {

    // Add the new Todo to our DB history, and render new as DOM element
    localStorage.setItem("data", JSON.stringify(data.history));
    clear();
    data.history.forEach((todo, index) => render(todo, index));

});

server.on('completedAll', (data) => {

    localStorage.setItem('data', JSON.stringify(data));

    // Clear the DOM list
    clear();

    // Render each Todo
    data.forEach((todo, index) => render(todo, index));

});

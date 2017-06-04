class Todo {

    constructor(title = '') {
        this.title = title;
        this.complete = false;
    }

    completed() {
        this.complete = true;
        return this;
    }

    uncompleted() {
        this.complete = false;
        return this;
    }

}

module.exports = Todo;

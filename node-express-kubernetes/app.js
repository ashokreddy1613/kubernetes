const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;

// In-memory To-Do list
let todos = [];

// Middleware
app.use(bodyParser.json());

// Routes

// Home
app.get('/', (req, res) => {
    res.send('Welcome to the ToDo App running on EKS!');
});

// Get all todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// Add new todo
app.post('/todos', (req, res) => {
    const todo = req.body.todo;
    if (!todo) {
        return res.status(400).json({ error: 'Todo is required' });
    }
    todos.push({ id: todos.length + 1, todo });
    res.status(201).json({ message: 'Todo added!' });
});

// Delete todo by id
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== id);
    res.json({ message: `Todo with id ${id} deleted!` });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

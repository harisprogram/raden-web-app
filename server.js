// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

const DATA_FILE = './tasks.json';

function loadTasks() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  const newTask = {
    text: req.body.text,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:index', (req, res) => {
  const tasks = loadTasks();
  const index = parseInt(req.params.index);
  if (tasks[index]) {
    tasks[index].completed = !tasks[index].completed;
    tasks[index].updatedAt = new Date().toISOString();
    saveTasks(tasks);
    res.json(tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.put('/api/tasks/:index/text', (req, res) => {
  const tasks = loadTasks();
  const index = parseInt(req.params.index);
  if (tasks[index]) {
    tasks[index].text = req.body.text;
    tasks[index].updatedAt = new Date().toISOString();
    saveTasks(tasks);
    res.json(tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:index', (req, res) => {
  const tasks = loadTasks();
  const index = parseInt(req.params.index);
  if (tasks[index]) {
    const deleted = tasks.splice(index, 1);
    saveTasks(tasks);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks', (req, res) => {
  saveTasks([]);
  res.status(204).send();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

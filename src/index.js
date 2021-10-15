const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkIfUserExists = users.find((user) => user.username === username);

  if (!checkIfUserExists) {
    return response.status(400).json({ error: "User does not exists!" });
  }

  request.user = checkIfUserExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkIfUsernameIsTaken = users.some(
    (user) => user.username === username
  );

  if (checkIfUsernameIsTaken) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const todo = user.todos.find((task) => task.id === id);

  if (!todo) {
    return response
      .status(404)
      .json({ error: "Task with such ID does not exists!" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((task) => task.id === id);

  if (!todo) {
    return response
      .status(404)
      .json({ error: "Task with such ID does not exists!" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((task) => task.id === id);

  if (!todo) {
    return response
      .status(404)
      .json({ error: "Task with such ID does not exists!" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;

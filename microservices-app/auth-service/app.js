const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const SECRET = 'mysecretkey';

app.get('/', (req, res) => {
  res.send('Auth Service is running');
});
app.post('/login', (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/signup', (req, res) => {
  // Here you would save user to DB (dummy for now)
  res.send('User signed up successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

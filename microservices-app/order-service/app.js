const express = require('express');
const app = express();

app.get('/profile', (req, res) => {
  res.json({ username: "john_doe", email: "john@example.com" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));

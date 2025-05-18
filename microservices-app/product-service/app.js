const express = require('express');
const app = express();

app.get('/products', (req, res) => {
  res.json([
    { id: 1, name: 'Laptop' },
    { id: 2, name: 'Mobile' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));

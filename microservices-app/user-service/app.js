const express = require('express');
const app = express();

app.get('/orders', (req, res) => {
  res.json([
    { orderId: 101, item: 'Laptop', status: 'shipped' },
    { orderId: 102, item: 'Mobile', status: 'processing' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Connect to SQLite
const db = new sqlite3.Database(path.resolve(__dirname, 'shop.db'), (err) => {
  if (err) console.error('❌ DB error:', err.message);
  else console.log('✅ Connected to shop.db');
});

app.use(cors({
  origin: 'https://mysql-try-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// 🔍 Flexible search
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  const sql = `SELECT * FROM inventory WHERE LOWER(item_name) LIKE LOWER('%' || ? || '%')`;
  db.all(sql, [query], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (rows.length === 0) return res.json({ message: `No results for "${query}"` });
    res.json(rows);
  });
});

// ✅ Get ALL items
app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ✅ Get single item by name
app.get('/api/inventory/:item', (req, res) => {
  db.get('SELECT * FROM inventory WHERE item_name = ?', [req.params.item], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// ➕ Add new item
app.post('/api/inventory', (req, res) => {
  const { item_name, category, unit, price, quantity } = req.body;

  if (!item_name || !category || !price) {
    return res.status(400).json({ error: 'item_name, category, and price are required.' });
  }

  db.run(
    'INSERT INTO inventory (item_name, category, unit, price, quantity) VALUES (?, ?, ?, ?, ?)',
    [item_name, category, unit || null, price, quantity || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Product added successfully!' });
    }
  );
});

// ✏️ Update item (price and quantity)
app.put('/api/inventory/:item', (req, res) => {
  const { price, quantity } = req.body;
  const { item } = req.params;

  if (price == null || quantity == null) {
    return res.status(400).json({ error: 'Both price and quantity are required' });
  }

  db.run(
    'UPDATE inventory SET price = ?, quantity = ? WHERE item_name = ?',
    [price, quantity, item],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
      res.json({ message: 'Item updated successfully' });
    }
  );
});

// ❌ Delete item
app.delete('/api/inventory/:item', (req, res) => {
  db.run('DELETE FROM inventory WHERE item_name = ?', [req.params.item], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  });
});

module.exports = app;

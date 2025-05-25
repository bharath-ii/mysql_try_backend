const express = require('express');
const router = express.Router();
const db = require('../db/config'); // Your mysql connection

// Get all inventory items
router.get('/inventory', (req, res) => {
  db.query('SELECT * FROM inventory', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Get inventory item by name
router.get('/inventory/:item', (req, res) => {
  const item = req.params.item;
  db.query('SELECT * FROM inventory WHERE item_name = ?', [item], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(results[0]);
  });
});

module.exports = router;

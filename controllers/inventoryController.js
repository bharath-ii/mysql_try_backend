// controllers/inventoryController.js
const db = require('../db/config');

exports.getAllItems = (req, res) => {
  db.query('SELECT * FROM inventory', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getItemByName = (req, res) => {
  const itemName = req.params.name;
  db.query('SELECT * FROM inventory WHERE item_name = ?', [itemName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.json(results[0]);
  });
};

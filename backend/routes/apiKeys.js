const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const API_KEY_FILE = path.join(__dirname, '../auth/apikeys.json');

// Helper functions
function readApiKeys() {
  try {
    const data = fs.readFileSync(API_KEY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading API key file:', err);
    return { keys: [] };
  }
}

function writeApiKeys(data) {
  try {
    fs.writeFileSync(API_KEY_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing API key file:', err);
  }
}

// Get all API keys
router.get('/', (req, res) => {
  const apiKeys = readApiKeys();
  res.json(apiKeys);
});

// Create new API key
router.post('/', (req, res) => {
  const { key, description } = req.body;
  const apiKeys = readApiKeys();
  
  if (apiKeys.keys.some(k => k.key === key)) {
    return res.status(400).json({ error: 'API key already exists' });
  }
  
  apiKeys.keys.push({ key, description });
  writeApiKeys(apiKeys);
  res.json({ success: true });
});

// Delete API key
router.delete('/:key', (req, res) => {
  const keyToDelete = req.params.key;
  const apiKeys = readApiKeys();
  
  const initialLength = apiKeys.keys.length;
  apiKeys.keys = apiKeys.keys.filter(k => k.key !== keyToDelete);
  
  if (apiKeys.keys.length === initialLength) {
    return res.status(404).json({ error: 'API key not found' });
  }
  
  writeApiKeys(apiKeys);
  res.json({ success: true });
});

module.exports = router;
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_PATH = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Read and write data helpers
async function readData() {
try {
const txt = await fs.readFile(DATA_PATH, 'utf8');
return JSON.parse(txt || '{}');
} catch (err) {
return { users: [], scores: [] };
}
}

async function writeData(data) {
await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Ping endpoint
app.get('/api/ping', (req, res) => {
res.json({ ok: true, now: Date.now() });
});

// Users endpoints
app.get('/api/users', async (req, res) => {
const data = await readData();
res.json(data.users || []);
});

app.post('/api/users', async (req, res) => {
const { name, email, password } = req.body;
if (!email) return res.status(400).json({ error: 'email required' });

const data = await readData();
data.users = data.users || [];

if (data.users.find(u => u.email === email)) {
return res.status(409).json({ error: 'user exists' });
}

const user = { name, email, password };
data.users.push(user);
await writeData(data);
res.status(201).json({ user });
});

// Scores endpoints
app.get('/api/scores', async (req, res) => {
const data = await readData();
data.scores = data.scores || [];

let changed = false;
data.scores = data.scores.map(s => {
if (!s.id) {
changed = true;
return { id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`, ...s };
}
return s;
});

if (changed) await writeData(data);
res.json(data.scores);
});

app.post('/api/scores', async (req, res) => {
const score = req.body;
const data = await readData();
data.scores = data.scores || [];

const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const record = { id, kept: false, timestamp: Date.now(), ...score };

data.scores.push(record);
await writeData(data);
res.status(201).json({ score: record });
});

app.put('/api/scores/:id', async (req, res) => {
const id = req.params.id;
const updates = req.body || {};
const data = await readData();
data.scores = data.scores || [];

const idx = data.scores.findIndex(s => s.id === id);
if (idx === -1) return res.status(404).json({ error: 'not found' });

data.scores[idx] = { ...data.scores[idx], ...updates };
await writeData(data);
res.json({ score: data.scores[idx] });
});

app.delete('/api/scores/:id', async (req, res) => {
const id = req.params.id;
const data = await readData();
data.scores = data.scores || [];

const idx = data.scores.findIndex(s => s.id === id);
if (idx === -1) return res.status(404).json({ error: 'not found' });

const removed = data.scores.splice(idx, 1)[0];
await writeData(data);
res.json({ removed });
});

app.listen(PORT, () => console.log(`Quiz backend listening on http://localhost:${PORT}`));

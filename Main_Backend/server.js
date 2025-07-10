const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const STATS_FILE = 'userStats.json';

if (!fs.existsSync(STATS_FILE)) {
  fs.writeFileSync(STATS_FILE, '{}');
}

app.post('/record', (req, res) => {
  const { player, result } = req.body;
  const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));

  if (!stats[player]) {
    stats[player] = { wins: 0, losses: 0 };
  }

  if (result === 'win') stats[player].wins++;
  else if (result === 'loss') stats[player].losses++;

  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  res.send({ message: 'Stats updated' });
});

app.get('/stats/:player', (req, res) => {
  const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  const player = req.params.player;
  res.send(stats[player] || { wins: 0, losses: 0 });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

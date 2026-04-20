const { kv } = require('@vercel/kv');

const MAX_ENTRIES = 10;
const KV_KEY = 'nikud-leaderboard';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const board = (await kv.get(KV_KEY)) || [];
      return res.status(200).json(board);
    }

    if (req.method === 'POST') {
      const { name, score } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }
      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Valid score is required' });
      }

      const board = (await kv.get(KV_KEY)) || [];
      const date = new Date().toLocaleDateString('he-IL');
      board.push({ name: name.trim().substring(0, 20), score, date });
      board.sort((a, b) => b.score - a.score);
      if (board.length > MAX_ENTRIES) board.length = MAX_ENTRIES;
      await kv.set(KV_KEY, board);
      return res.status(200).json(board);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

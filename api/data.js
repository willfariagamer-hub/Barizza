const { neon } = require('@neondatabase/serverless');

const ROW_ID = 'building';
let tableReady = false;

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS predio_data (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

module.exports = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      res.status(500).json({ error: 'DATABASE_URL não configurada nas variáveis de ambiente da Vercel' });
      return;
    }
    const sql = neon(process.env.DATABASE_URL);
    await ensureTable(sql);

    if (req.method === 'GET') {
      const rows = await sql`SELECT payload FROM predio_data WHERE id = ${ROW_ID}`;
      res.status(200).json(rows[0] ? rows[0].payload : null);
      return;
    }
    if (req.method === 'POST') {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        res.status(400).json({ error: 'invalid payload' });
        return;
      }
      await sql`
        INSERT INTO predio_data (id, payload, updated_at)
        VALUES (${ROW_ID}, ${JSON.stringify(payload)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE
          SET payload = EXCLUDED.payload, updated_at = now()
      `;
      res.status(200).json({ ok: true });
      return;
    }
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
};

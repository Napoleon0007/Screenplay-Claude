const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_DEFAULT_REGION || 'auto';
const ENDPOINT = process.env.AWS_ENDPOINT_URL;
const KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET = process.env.AWS_SECRET_ACCESS_KEY;

const cloudConfigured = !!(BUCKET && ENDPOINT && KEY && SECRET);

const s3 = cloudConfigured
  ? new S3Client({
      endpoint: ENDPOINT,
      region: REGION,
      credentials: { accessKeyId: KEY, secretAccessKey: SECRET },
      forcePathStyle: false,
    })
  : null;

const hashVault = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

app.get('/api/health', (req, res) => {
  res.json({ ok: true, cloud: cloudConfigured, bucket: BUCKET ? `${BUCKET}/${REGION}` : null });
});

app.get('/api/sync', async (req, res) => {
  try {
    if (!cloudConfigured) return res.status(503).json({ error: 'Cloud storage not configured on the server.' });
    const vault = req.headers['x-vault-key'];
    if (!vault || String(vault).length < 4) return res.status(400).json({ error: 'A vault key of at least 4 characters is required.' });
    const key = `vaults/${hashVault(vault)}.json`;
    try {
      const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const body = await resp.Body.transformToString();
      res.type('application/json').send(body);
    } catch (e) {
      const code = e?.$metadata?.httpStatusCode;
      if (e.name === 'NoSuchKey' || code === 404) return res.status(404).json({ error: 'No library yet for this vault key.' });
      throw e;
    }
  } catch (e) {
    console.error('GET /api/sync failed:', e);
    res.status(500).json({ error: e.message || 'Sync read failed.' });
  }
});

app.put('/api/sync', async (req, res) => {
  try {
    if (!cloudConfigured) return res.status(503).json({ error: 'Cloud storage not configured on the server.' });
    const vault = req.headers['x-vault-key'];
    if (!vault || String(vault).length < 4) return res.status(400).json({ error: 'A vault key of at least 4 characters is required.' });
    const body = req.body;
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be a JSON object.' });
    const key = `vaults/${hashVault(vault)}.json`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(body),
      ContentType: 'application/json',
    }));
    res.json({ ok: true, savedAt: Date.now() });
  } catch (e) {
    console.error('PUT /api/sync failed:', e);
    res.status(500).json({ error: e.message || 'Sync write failed.' });
  }
});

app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Screenplay editor listening on :${PORT} — cloud=${cloudConfigured ? 'on' : 'off'}`);
});

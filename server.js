require('dotenv').config();
const express = require('express');
const cors = require('cors');

process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err && err.message ? err.message : err);
});
process.on('unhandledRejection', (err) => {
  console.error('UnhandledRejection:', err && err.message ? err.message : err);
});

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';
const SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1024';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const PROMPT_TEMPLATE = `You have two images:
- Image 1: A photo of a real building facade or interior taken by a client
- Image 2: A texture sample of a finishing material called "[MATERIAL_NAME]"

YOUR TASK: Переделай фасад дома или дизайн интерьера на Image 1, используя плитку из Image 2 как основной материал фасада или дизайна интерьера.

Задача: аккуратно наложить эту плитку на стены дома так, как будто она реально установлена на фасаде здания.

STRICT REQUIREMENTS:
- не изменяй окна
- не закрывай окна плиткой
- не изменяй балконы
- не изменяй двери
- не изменяй крышу
- не изменяй стекло
- не изменяй перила

Плитка должна появиться только на основных поверхностях стен.
Материал должен повторять перспективу стен и архитектуру здания.
Не делай эффект наклеенной текстуры.
Плитка должна выглядеть как реальный установленный фасадный материал.
Сделай фотореалистичную архитектурную визуализацию с натуральным освещением и тенями.
Сохрани геометрию и структуру дома без изменений.
Высокая детализация, архитектурный рендер, фотореализм.

Формат изображения строго как на исходном фото, ничего не добавлять лишнего и не убирать.

OUTPUT: Return only the final edited image. No text, no watermarks.
`;

function mimeFromUrl(url) {
  const u = url.toLowerCase().split('?')[0];
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function extFromMime(mime) {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  return 'jpg';
}

app.post('/api/generate', async (req, res) => {
  const started = Date.now();
  try {
    const { clientImageBase64, clientImageMime, materialImageUrl, materialName } = req.body || {};
    if (!clientImageBase64 || !clientImageMime || !materialImageUrl || !materialName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server' });
    }

    console.log(`[${new Date().toISOString()}] /api/generate start material="${materialName}" model=${MODEL}`);

    const matResp = await fetch(materialImageUrl);
    if (!matResp.ok) throw new Error(`Failed to fetch material image: ${matResp.status}`);
    const matAB = await matResp.arrayBuffer();
    const materialMime = mimeFromUrl(materialImageUrl);

    const clientBuf = Buffer.from(clientImageBase64, 'base64');
    const clientExt = extFromMime(clientImageMime);
    const materialExt = extFromMime(materialMime);

    console.log(`  client image: ${Math.round(clientBuf.length/1024)}KB, material: ${Math.round(matAB.byteLength/1024)}KB`);

    const prompt = PROMPT_TEMPLATE.replace('[MATERIAL_NAME]', materialName);

    async function callOpenAI(attempt) {
      const formBody = new FormData();
      formBody.append('model', MODEL);
      formBody.append('prompt', prompt);
      formBody.append('size', SIZE);
      formBody.append('quality', QUALITY);
      formBody.append('n', '1');
      formBody.append('image[]', new Blob([clientBuf], { type: clientImageMime }), `client.${clientExt}`);
      formBody.append('image[]', new Blob([new Uint8Array(matAB)], { type: materialMime }), `material.${materialExt}`);
      return await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: formBody
      });
    }

    let apiResp;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`  attempt ${attempt}/3...`);
        apiResp = await callOpenAI(attempt);
        break;
      } catch (e) {
        lastErr = e;
        console.error(`  attempt ${attempt} failed: ${e.message}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
    if (!apiResp) throw lastErr || new Error('All attempts failed');

    const text = await apiResp.text();
    let data;
    try { data = JSON.parse(text); }
    catch (_) {
      console.error('Non-JSON response:', text.slice(0, 300));
      return res.status(502).json({ error: `OpenAI returned non-JSON (status ${apiResp.status})` });
    }

    if (!apiResp.ok) {
      const msg = (data && data.error && data.error.message) || `OpenAI error ${apiResp.status}`;
      console.error('OpenAI error:', msg);
      return res.status(502).json({ error: msg });
    }

    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      return res.status(502).json({ error: 'No image returned from OpenAI' });
    }

    const resultDataUrl = `data:image/png;base64,${data.data[0].b64_json}`;
    const generationTime = Date.now() - started;

    console.log(`[${new Date().toISOString()}] /api/generate done in ${generationTime}ms`);
    res.json({ resultDataUrl, generationTime });
  } catch (err) {
    const generationTime = Date.now() - started;
    const msg = (err && err.message) || 'Unknown server error';
    console.error(`[${new Date().toISOString()}] /api/generate failed in ${generationTime}ms:`, msg);
    if (!res.headersSent) res.status(500).json({ error: msg });
  }
});

app.get('/', (_req, res) => res.send('DesignAI proxy is running'));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`DesignAI proxy listening on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL} · Size: ${SIZE} · Quality: ${QUALITY}`);
  if (!OPENAI_API_KEY) console.warn('WARNING: OPENAI_API_KEY is empty — set it in .env');
});

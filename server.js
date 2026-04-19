require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));

const PROMPT_TEMPLATE = `You are an expert architectural visualization specialist.

I will provide you with two images:
- Image 1: A photo of a real interior room or building facade taken by a client
- Image 2: A texture sample of a premium finishing material called "[MATERIAL_NAME]"

YOUR TASK: Create a photorealistic visualization showing how this material would look applied to the surfaces in the client's photo.

STRICT REQUIREMENTS:
1. Apply the material from Image 2 to ALL suitable wall/floor/facade surfaces in Image 1
2. Perfectly preserve: camera angle, perspective, lighting conditions, shadows, room geometry
3. Keep completely unchanged: furniture, windows, doors, ceiling, plants, people, sky, ground
4. The material texture must follow the surface geometry naturally with correct perspective
5. Lighting and shadows must interact realistically with the new material surface
6. The result must look like a professional architectural render, NOT a photoshop collage
7. Maintain the same image dimensions and composition as Image 1
8. High quality output, sharp details, no artifacts or distortions

OUTPUT: Return only the final edited image. No text, no watermarks.`;

function mimeFromUrl(url) {
  const u = url.toLowerCase().split('?')[0];
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

app.post('/api/generate', async (req, res) => {
  const started = Date.now();
  try {
    const { clientImageBase64, clientImageMime, materialImageUrl, materialName } = req.body || {};
    if (!clientImageBase64 || !clientImageMime || !materialImageUrl || !materialName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }

    console.log(`[${new Date().toISOString()}] /api/generate start material="${materialName}"`);

    const matResp = await fetchWithTimeout(materialImageUrl, {}, 30000);
    if (!matResp.ok) throw new Error(`Failed to fetch material image: ${matResp.status}`);
    const matBuf = await matResp.buffer();
    const materialBase64 = matBuf.toString('base64');
    const materialMime = mimeFromUrl(materialImageUrl);

    const prompt = PROMPT_TEMPLATE.replace('[MATERIAL_NAME]', materialName);

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: clientImageMime, data: clientImageBase64 } },
          { inline_data: { mime_type: materialMime, data: materialBase64 } }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        temperature: 0.3
      }
    };

    const apiResp = await fetchWithTimeout(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      },
      120000
    );

    const data = await apiResp.json();
    if (!apiResp.ok) {
      const msg = (data && data.error && data.error.message) || `Gemini API error ${apiResp.status}`;
      console.error('Gemini error:', msg);
      return res.status(502).json({ error: msg });
    }

    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    if (!parts || !parts.length) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }
    const imagePart = parts.find(p => (p.inlineData || p.inline_data));
    if (!imagePart) {
      const textPart = parts.find(p => p.text);
      return res.status(502).json({ error: textPart ? `No image returned: ${textPart.text}` : 'No image returned' });
    }
    const inline = imagePart.inlineData || imagePart.inline_data;
    const mime = inline.mimeType || inline.mime_type || 'image/png';
    const resultDataUrl = `data:${mime};base64,${inline.data}`;
    const generationTime = Date.now() - started;

    console.log(`[${new Date().toISOString()}] /api/generate done in ${generationTime}ms`);
    res.json({ resultDataUrl, generationTime });
  } catch (err) {
    const generationTime = Date.now() - started;
    console.error(`[${new Date().toISOString()}] /api/generate failed in ${generationTime}ms:`, err.message);
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
});

app.get('/', (_req, res) => res.send('DesignAI proxy is running'));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`DesignAI proxy listening on http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) console.warn('WARNING: GEMINI_API_KEY is empty — set it in .env');
});

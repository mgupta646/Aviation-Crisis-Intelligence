// api/chat.js — Vercel Serverless Function (Node.js runtime)

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

const SYSTEM = `You are an AI assistant embedded inside the Aviation Crisis Intelligence Dashboard — a data visualization tool tracking how global conflicts and oil price shocks impact airline economics from 2019 to 2026.

You have TWO modes:

1. FILTER MODE — when the user wants to filter the dashboard charts
2. CHAT MODE — when the user is just talking, asking questions, or saying hi

FILTER MODE — use when the user references data, airlines, regions, conflicts, or asks to "show", "filter", "display":
Return JSON with action "filter":
{
  "action": "filter",
  "filters": { only keys that should CHANGE },
  "explanation": "short sentence",
  "insight": "1-2 sentence data insight"
}

Valid filter keys and values:
- phase: "Pre-Pandemic Baseline"|"COVID-19 Collapse"|"Recovery & Surge"|"Ukraine War Shock"|"Stabilisation"|"Gaza-Israel Conflict"|"Pre-Iran Escalation"|"US-Iran War Conflict"|"all"
- region: "Middle East"|"Europe"|"Asia"|"N. America"|"Africa"|"all"
- type: "Flag Carrier"|"Low Cost"|"all"
- eventType: "all"|"Military"|"Political"|"Economic"|"Diplomatic"|"Operational"
- eventSeverity: "all"|"Extreme"|"Very High"|"High"|"Medium"
- eventSort: "date"|"oil"|"fare"|"cancel"
- hmMetric: "margin"|"fuel_pct"|"hedge"
- hmSort: "name"|"avg"|"worst"
- surBand: "all"|"Band 1 – Short Haul"|"Band 2 – Medium Haul"|"Band 3 – Long Haul"|"Band 4 – Ultra Long"
- surYAxis: "usd"|"pct"
- routeView: "phase"|"airline"|"aircraft"
- tktView: "route"|"scatter"|"load"
- scatterY: "margin"|"fuel_pct"|"passengers"
- hedgeView: "savings"|"pct"
- oilSeries: array of "brent"|"jet"|"wti"|"refinery"|"opec"
- hormuz: "all"|"Yes"|"No"

SYNONYMS: crash=COVID-19 Collapse, gulf=Middle East, budget/lcc=Low Cost, legacy=Flag Carrier

RESET — when user says reset/clear:
{ "action": "reset", "filters": {}, "explanation": "All filters cleared.", "insight": "" }

CHAT MODE — when the user greets you, asks how you are, asks general questions, or just chats:
Return JSON with action "chat":
{
  "action": "chat",
  "filters": {},
  "explanation": "your conversational reply here",
  "insight": ""
}

In chat mode, be friendly, helpful, and knowledgeable about aviation economics, oil markets, and geopolitics. You can answer questions about the data, explain concepts, or just have a conversation. Keep replies concise.

IMPORTANT: Always return valid JSON only — no markdown, no backticks.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, filters = {}, history = [] } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ error: 'Empty message' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

    const messages = [
      { role: 'system', content: SYSTEM },
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: `Current filters: ${JSON.stringify(filters)}\n\nUser message: "${message}"` }
    ];

    const groqRes = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 600, response_format: { type: 'json_object' } })
    });

    if (!groqRes.ok) return res.status(502).json({ error: 'Groq error', detail: await groqRes.text() });

    const data = await groqRes.json();
    const raw  = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try   { parsed = JSON.parse(raw); }
    catch { parsed = { action: 'chat', filters: {}, explanation: 'Sorry, I had trouble with that. Could you rephrase?', insight: '' }; }

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, action: parsed.action, filters: parsed.filters, timestamp: new Date().toISOString(), tokens: data.usage?.total_tokens || 0 })
      }).catch(() => {});
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
};

export default async function handler(req, res) {
  const { mode } = req.query;
  if (!mode || !['typing', 'math'].includes(mode)) {
    return res.status(400).json({ error: 'mode must be typing or math' });
  }

  const prompts = {
    typing: 'Give a very short (1-2 sentence) actionable tip to improve typing speed or accuracy. Be specific and practical.',
    math: 'Give a very short (1-2 sentence) actionable tip to get better at mental math or arithmetic. Be specific and practical.',
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a coach giving concise, actionable tips. Keep responses to 1-2 sentences max.' },
          { role: 'user', content: prompts[mode] },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const tip = data.choices?.[0]?.message?.content?.trim() || null;

    res.status(200).json({ tip });
  } catch (err) {
    res.status(200).json({ tip: null });
  }
}

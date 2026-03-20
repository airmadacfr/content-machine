export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY non configurée sur le serveur." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant." });
  }

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Erreur API Gemini" });
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts) {
      return res.status(500).json({ error: "Réponse vide de Gemini. Réessaie." });
    }

    // Extract only text parts (skip thinking parts)
    const textParts = data.candidates[0].content.parts
      .filter(part => part.text && !part.thought)
      .map(part => part.text);

    const text = textParts.join("\n").trim();

    if (!text) {
      return res.status(500).json({ error: "Réponse vide après filtrage. Réessaie." });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
}

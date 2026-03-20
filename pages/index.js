import { useState } from "react";
import Head from "next/head";

const STEPS = { INPUT: "input", GENERATING: "generating", PREVIEW: "preview" };

function stripEmojis(text) {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{200D}]/gu, "")
    .replace(/[\u{20E3}]/gu, "")
    .replace(/[\u{E0020}-\u{E007F}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function Home() {
  const [step, setStep] = useState(STEPS.INPUT);
  const [tweet, setTweet] = useState("");
  const [script, setScript] = useState("");
  const [imageLinks, setImageLinks] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ stage: "", percent: 0 });
  const [copied, setCopied] = useState(false);

  async function callAPI(prompt) {
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  }

  function getImageCount(wordCount) {
    const seconds = Math.round(wordCount / 3.2);
    if (seconds <= 25) return 5;
    if (seconds <= 30) return 6;
    if (seconds <= 35) return 7;
    if (seconds <= 40) return 8;
    return 9;
  }

  async function handleGenerate() {
    if (!tweet.trim()) return;
    setError("");
    setCopied(false);
    setStep(STEPS.GENERATING);

    try {
      const cleanTweet = stripEmojis(tweet);
      const lowerTweet = tweet.trim().toLowerCase();
      const isOfficiel = lowerTweet.startsWith("officiel");
      const isBreaking = lowerTweet.startsWith("breaking");

      setProgress({ stage: "Écriture du script...", percent: 20 });

      const generatedScript = await callAPI(`Tu es un créateur de contenu TikTok spécialisé dans le football et le Real Madrid. Ton compte s'appelle "rmadrid_actu".

MISSION : Transforme ce tweet en script de voix-off vidéo TikTok VIRAL.

TWEET (nettoyé) :
"${cleanTweet}"

${isOfficiel ? "Le tweet commence par 'OFFICIEL' → tu peux utiliser le mot 'officiel' dans le script." : "Le tweet NE commence PAS par 'officiel' → N'UTILISE JAMAIS le mot 'officiel' dans le script."}
${isBreaking ? "Le tweet commence par 'BREAKING' → utilise le terme 'polémique' ou 'info de dernière minute' dans le hook." : ""}

STRUCTURE EXACTE DU SCRIPT :

PARAGRAPHE 1 — HOOK D'ACCROCHE (1-2 phrases max)
Utilise des accroches PUISSANTES et percutantes qui créent de la curiosité et donnent envie de regarder toute la vidéo. Le ton doit être sérieux et impactant, PAS familier (jamais de "gros", "frère", "mec", etc.).
Exemples de hooks puissants :
- "L'info vient de tomber et elle va faire du bruit..."
- "Personne ne s'attendait à ça au Real Madrid..."
- "Stop. Il faut qu'on parle de ce qui vient de se passer..."
- "Cette info change absolument tout pour le Real Madrid..."
- "Attention, ce qu'on vient d'apprendre est énorme..."
- "Le Real Madrid vient de frapper un très grand coup..."
${isBreaking ? 'Intègre le mot "polémique" ou "info de dernière minute" dans le hook.' : ""}

PARAGRAPHE 2 — CTA ABONNEMENT (toujours ce texte exact, mot pour mot)
"Abonne-toi à rmadrid_actu pour connaître toutes les infos du Real Madrid en temps réel et like si t'es un vrai madridista."

PARAGRAPHE 3 — DÉVELOPPEMENT DE L'INFO (corps du script)
Raconte l'info du tweet en détail. Phrases courtes, dynamiques. Vocabulaire foot (transfert, mercato, buteur, passeur, Bernabéu, Florentino, etc.). Tu RELAIES UNIQUEMENT l'info du tweet, pas de divagation.

PARAGRAPHE 4 — CONCLUSION + QUESTION
Termine par une phrase de conclusion puis une QUESTION SIMPLE qui incite les viewers à commenter. La question doit être directe, clivante, facile à répondre.

RÈGLES :
- Appelle les joueurs par leur NOM DE FAMILLE (Mbappé, Vinicius, Bellingham) ou Prénom + Nom. JAMAIS juste le prénom.
- Dis "Real Madrid" et pas "Casa Blanca"
- JAMAIS d'emojis dans le script
- JAMAIS de langage familier ou d'argot (pas de "gros", "frère", "mec", "ouf", "chaud")
- Entre 80 et 120 mots
- Sépare chaque paragraphe par une ligne vide pour la lisibilité
- OBJECTIF VIRALITÉ TIKTOK : phrases courtes, rythme rapide, mots forts, tension narrative, question clivante à la fin
- Vocabulaire simple mais pas familier (audience jeune mais ton sérieux)

Réponds UNIQUEMENT avec le script. Rien d'autre. Pas de titre, pas de commentaire, pas de guillemets autour du script.`);

      setScript(generatedScript);

      const wc = generatedScript.split(/\s+/).filter(Boolean).length;
      const imgCount = getImageCount(wc);

      setProgress({ stage: `Préparation de ${imgCount} images...`, percent: 65 });

      const imgResult = await callAPI(`Analyse ce tweet football et le script vidéo qui en découle.

TWEET : "${cleanTweet}"

SCRIPT :
"${generatedScript}"

Le script fait environ ${wc} mots soit ~${Math.round(wc / 3.2)} secondes. Pour garder du rythme dans la vidéo, génère exactement ${imgCount} recherches Google Images.

RÈGLES :
- Les images suivent l'ORDRE CHRONOLOGIQUE du script (image 1 = début, image ${imgCount} = fin)
- Si UN joueur est le sujet → ${imgCount} images de CE joueur sous des angles variés qui suivent le fil du script
- Si PLUSIEURS joueurs → répartis dans l'ordre d'apparition dans le script
- OBLIGATOIRE : ajoute "2026" dans CHAQUE requête pour avoir les images les plus récentes
- Requêtes en anglais, ultra-spécifiques, pour des images HD

Réponds UNIQUEMENT en JSON valide (exactement ${imgCount} éléments), sans backticks, sans commentaire :
[{"query": "recherche en anglais 2026", "label": "description courte en français"}]`);

      const cleanJson = imgResult.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      setImageLinks(parsed.map(item => ({
        label: item.label,
        query: item.query,
        url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.query)}`,
      })));

      setProgress({ stage: "C'est prêt !", percent: 100 });
      setTimeout(() => setStep(STEPS.PREVIEW), 300);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep(STEPS.INPUT);
    }
  }

  function copyScript() {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setStep(STEPS.INPUT); setTweet(""); setScript(""); setImageLinks([]); setError(""); setCopied(false);
  }

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const readTime = Math.round(wordCount / 3.2);
  const A = "#ff5a32", AL = "#ff7a45";
  const card = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28, marginBottom: 18 };
  const lbl = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 };

  return (
    <>
      <Head>
        <title>Content Machine — rmadrid_actu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#09090b", color: "#e4e2df", fontFamily: "'DM Sans',-apple-system,sans-serif", position: "relative" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 15% 0%,rgba(255,80,40,0.05) 0%,transparent 55%),radial-gradient(ellipse at 85% 100%,rgba(40,80,255,0.03) 0%,transparent 55%)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "36px 20px 60px" }}>

          <header style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 100, padding: "7px 18px", marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>⚽</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>rmadrid_actu · Content Creator</span>
            </div>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, margin: "10px 0 6px", background: "linear-gradient(135deg,#fff,rgba(255,255,255,0.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Content Machine
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", maxWidth: 500, margin: "0 auto", lineHeight: 1.5 }}>
              Tweet → Script viral + Images → Prêt pour CapCut
            </p>
          </header>

          {step === STEPS.INPUT && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={card}>
                <label style={lbl}>📋 Colle ton tweet</label>
                <textarea value={tweet} onChange={e => setTweet(e.target.value)} rows={5}
                  style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px", fontSize: 14, lineHeight: 1.65, color: "#e4e2df", resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color .2s", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,90,50,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                  <span>
                    {tweet.toLowerCase().startsWith("officiel") && "🟢 Mode OFFICIEL détecté"}
                    {tweet.toLowerCase().startsWith("breaking") && "🔴 Mode BREAKING détecté"}
                    {!tweet.toLowerCase().startsWith("officiel") && !tweet.toLowerCase().startsWith("breaking") && tweet.trim() ? "Emojis retirés automatiquement" : ""}
                  </span>
                  <span>{tweet.length > 0 ? `${tweet.length} car.` : ""}</span>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!tweet.trim()}
                style={{ width: "100%", padding: "17px 32px", background: tweet.trim() ? `linear-gradient(135deg,${A},${AL})` : "rgba(255,255,255,0.04)", border: "none", borderRadius: 14, color: tweet.trim() ? "#fff" : "rgba(255,255,255,0.15)", fontSize: 15, fontWeight: 700, cursor: tweet.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all .3s", boxShadow: tweet.trim() ? "0 4px 28px rgba(255,90,50,0.25)" : "none" }}>
                Générer le script 🚀
              </button>
              {error && (
                <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(255,50,50,0.07)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 12, color: "#ff6b6b", fontSize: 13, lineHeight: 1.5 }}>⚠️ {error}</div>
              )}
            </div>
          )}

          {step === STEPS.GENERATING && (
            <div style={{ textAlign: "center", padding: "70px 0", animation: "fadeUp .4s ease" }}>
              <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 28px" }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                  <circle cx="55" cy="55" r="48" fill="none" stroke="url(#pg)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`} strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress.percent / 100)}`}
                    transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset .6s ease" }} />
                  <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={A} /><stop offset="100%" stopColor={AL} /></linearGradient></defs>
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 22, fontWeight: 800, color: AL }}>{progress.percent}%</div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{progress.stage}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Gemini 2.5 Pro en action...</p>
            </div>
          )}

          {step === STEPS.PREVIEW && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ ...card, padding: "18px 24px", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Tweet original</span>
                  {tweet.toLowerCase().startsWith("officiel") && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(100,255,100,0.1)", color: "rgba(100,255,100,0.6)", fontWeight: 700 }}>OFFICIEL</span>}
                  {tweet.toLowerCase().startsWith("breaking") && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(255,60,60,0.1)", color: "rgba(255,100,100,0.6)", fontWeight: 700 }}>BREAKING</span>}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{tweet}</div>
              </div>

              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span style={lbl}>📝 Script voix-off</span>
                    <div style={{ display: "flex", gap: 12, marginTop: -6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{wordCount} mots</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontSize: 11, color: readTime >= 25 ? "rgba(100,255,100,0.5)" : "rgba(255,180,50,0.5)" }}>~{readTime}s</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontSize: 11, color: "rgba(100,180,255,0.4)" }}>{imageLinks.length} images</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontSize: 11, color: "rgba(100,180,255,0.4)" }}>~{imageLinks.length > 0 ? Math.round(readTime / imageLinks.length) : 0}s/image</span>
                    </div>
                  </div>
                  <button onClick={copyScript}
                    style={{ background: copied ? "rgba(100,255,100,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? "rgba(100,255,100,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "8px 18px", color: copied ? "rgba(100,255,100,0.7)" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, transition: "all .2s" }}>
                    {copied ? "✓ Copié !" : "Copier le script"}
                  </button>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "22px 24px", fontSize: 15, lineHeight: 1.9, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,0.04)" }}>{script}</div>
              </div>

              <div style={card}>
                <span style={lbl}>🖼️ {imageLinks.length} images (ordre du script · ~{imageLinks.length > 0 ? Math.round(readTime / imageLinks.length) : 0}s par image)</span>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 16, lineHeight: 1.5, marginTop: 0 }}>Clique → choisis la meilleure image → clic droit "Enregistrer"</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {imageLinks.map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, textDecoration: "none", transition: "all .15s", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,90,50,0.3)"; e.currentTarget.style.background = "rgba(255,90,50,0.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.25)"; }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${A}22,${AL}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0, border: `1px solid ${A}33`, color: "rgba(255,255,255,0.5)" }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{img.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.query}</div>
                      </div>
                      <div style={{ fontSize: 18, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>→</div>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ ...card, background: "rgba(255,90,50,0.03)", borderColor: "rgba(255,90,50,0.1)" }}>
                <span style={{ ...lbl, color: "rgba(255,90,50,0.4)" }}>📱 Workflow CapCut</span>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
                  <strong style={{ color: "rgba(255,255,255,0.55)" }}>1.</strong> Copie le script<br />
                  <strong style={{ color: "rgba(255,255,255,0.55)" }}>2.</strong> Enregistre les {imageLinks.length} images dans l{"'"}ordre<br />
                  <strong style={{ color: "rgba(255,255,255,0.55)" }}>3.</strong> CapCut → importe les images (~{imageLinks.length > 0 ? Math.round(readTime / imageLinks.length) : 0}s chacune)<br />
                  <strong style={{ color: "rgba(255,255,255,0.55)" }}>4.</strong> Lis le script en voix-off ou TTS CapCut<br />
                  <strong style={{ color: "rgba(255,255,255,0.55)" }}>5.</strong> Publie et regarde les vues monter 🔥
                </div>
              </div>

              <button onClick={reset}
                style={{ width: "100%", padding: "17px 32px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ↺ Nouveau tweet
              </button>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          *{box-sizing:border-box;margin:0;padding:0}
          body{margin:0;background:#09090b}
          textarea::placeholder{color:rgba(255,255,255,0.18)}
          ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
        `}</style>
      </div>
    </>
  );
}

/* =====================================================================================
   LARGE LANGUAGE MONSTERS - MODEL FACTS
   This is the ONLY file you need to edit to update facts. No programming needed:
   change the text between the quotes, save, and reload the page.

   Each model has:
     name / short   Full name, and a short name (10 letters or fewer) for small screens.
     maker          Who makes it (and where).
     area           Where it lives in the game: "cloud", "woods", "studio" or "ghost".
     category       One short line shown on its card.
     stats          1 (low) to 5 (high): context, reasoning, speed, thrift (5 = cheapest).
     openness       "closed", "open-weight" or "fully open".
     local          "yes" (runs on a computer you own), "server" (only on big servers), "no".
     reads / makes  What it takes IN and what it puts OUT: "text", "image", "audio", "video".
     knownFor / caveat / classroom   The three short lines on its card. Keep them short!
   ===================================================================================== */
window.LLM_DATA = {
  factsAsOf: "November 2026",

  // Short explanations shown when a player asks "what's this?" on a card.
  statHelp: [
    ["CONTEXT", "How much a model can read at once, like the size of its desk. A big context window fits whole books."],
    ["REASONING", "How well it handles multi-step problems. Many models have a slower 'thinking' mode for these."],
    ["SPEED", "How quickly answers come back. Smaller models are usually faster."],
    ["THRIFT", "How cheap it is to use. More pips means lower cost."],
    ["OPENNESS", "CLOSED: you can only use it through the maker's app or API. OPEN-WEIGHT: anyone can download the model. FULLY OPEN: even the training data is public."],
    ["RUNS LOCALLY", "Can it run on a computer you control? If yes, private data never has to leave the building."],
    ["IN and OUT", "IN is what a model can take in. OUT is what it can make. Reading video is not the same as making video!"]
  ],

  models: [
    /* ------------------------------ CLOUD CITY ------------------------------ */
    {
      id: "gpt56", name: "GPT-6.2 Astra", short: "GPT-6.2", maker: "OpenAI (USA)", area: "cloud",
      category: "Closed frontier model",
      stats: { context: 5, reasoning: 5, speed: 2, thrift: 2 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["text"],
      knownFor: "OpenAI's top model, released in November 2026. It can read about a million tokens at once and always 'thinks' before it answers. Built for long agent and coding jobs.",
      caveat: "Everyday ChatGPT chats do not use it by default: they run on smaller siblings called Sol and Luna. It reads text and images, not audio or video.",
      classroom: "The famous app and the top model are not always the same thing. Check your district's data rules before pasting anything about students."
    },
    {
      id: "claude", name: "Claude", short: "Claude", maker: "Anthropic (USA)", area: "cloud",
      category: "Closed model family",
      stats: { context: 5, reasoning: 4, speed: 4, thrift: 3 },
      // Claude comes in sizes. The game lets players turn a "size dial" to feel the trade-off.
      sizes: [
        { name: "Haiku", stats: { context: 4, reasoning: 3, speed: 5, thrift: 4 } },
        { name: "Sonnet", stats: { context: 5, reasoning: 4, speed: 4, thrift: 3 } },
        { name: "Opus", stats: { context: 5, reasoning: 5, speed: 2, thrift: 1 } }
      ],
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["text"],
      knownFor: "A family in sizes: small, fast Haiku; mid-size Sonnet; big Opus; and Fable at the very top. Known for writing, long documents and coding.",
      caveat: "Bigger sizes are slower and cost more. All of them are cloud-only.",
      classroom: "Use a small size for quick drafts and a big one for hard thinking. Turn the size dial on this card to feel the trade-off."
    },
    {
      id: "gemini", name: "Gemini 4 Carbon", short: "Gemini 4", maker: "Google (USA)", area: "cloud",
      category: "Closed frontier model",
      stats: { context: 5, reasoning: 5, speed: 3, thrift: 2 },
      openness: "closed", local: "no",
      reads: ["text", "image", "audio", "video"], makes: ["text"],
      knownFor: "Google's strongest reasoning model, widely available since November 2026. Strongly multimodal: it takes in text, images, audio, video and PDFs.",
      caveat: "In the Gemini app it is for top-tier subscribers; most people get smaller siblings. And reading a video is not the same as making one.",
      classroom: "Handy if your school lives in Google tools. Ask which Gemini model your district's account actually gives you."
    },
    {
      id: "grok", name: "Grok 4.7", short: "Grok 4.7", maker: "SpaceXSI, formerly xAI (USA)", area: "cloud",
      category: "Closed frontier model",
      stats: { context: 4, reasoning: 4, speed: 4, thrift: 4 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["text"],
      knownFor: "Built for coding, agents and knowledge work at a low price. Released in September 2026.",
      caveat: "Reviewers ranked it just behind its top rivals, and its maker changed names twice in 2026. It reads text and images only.",
      classroom: "A good example of how fast names and rankings change. Always check the date on what you read."
    },

    /* --------------------------- OPEN WEIGHTS WOODS --------------------------- */
    {
      id: "gptoss", name: "gpt-oss", short: "gpt-oss", maker: "OpenAI (USA)", area: "woods",
      category: "Open-weight model",
      stats: { context: 3, reasoning: 3, speed: 4, thrift: 5 },
      openness: "open-weight", local: "yes",
      reads: ["text"], makes: ["text"],
      knownFor: "OpenAI's downloadable model. The 20B version runs in about 16GB of memory.",
      caveat: "Less capable than the big cloud flagships.",
      classroom: "Proof that one company can make both closed and open models."
    },
    {
      id: "gemma", name: "Gemma 4", short: "Gemma 4", maker: "Google (USA)", area: "woods",
      category: "Open-weight model family",
      stats: { context: 3, reasoning: 2, speed: 4, thrift: 5 },
      openness: "open-weight", local: "yes",
      reads: ["text", "image"], makes: ["text"],
      knownFor: "A family from tiny to mid-size. The small ones can run on modest hardware.",
      caveat: "Smaller models make more mistakes, and Gemma has its own terms of use to read.",
      classroom: "Good for showing AI running with the Wi-Fi switched off."
    },
    {
      id: "olmo", name: "Olmo 3.1", short: "Olmo 3.1", maker: "Ai2 (USA nonprofit)", area: "woods",
      category: "Fully open model",
      stats: { context: 2, reasoning: 2, speed: 3, thrift: 5 },
      openness: "fully open", local: "yes",
      reads: ["text"], makes: ["text"],
      knownFor: "A 'glass box': the weights, the code AND the training data are all public.",
      caveat: "Not the most powerful model, and at 32B parameters it wants a strong workstation. Transparency is the point.",
      classroom: "The best example for asking: what was this AI trained on?"
    },
    {
      id: "qwen", name: "Qwen3.8-27B", short: "Qwen3.8", maker: "Alibaba (China)", area: "woods",
      category: "Open-weight model",
      stats: { context: 3, reasoning: 3, speed: 3, thrift: 4 },
      openness: "open-weight", local: "yes",
      reads: ["text", "image", "video"], makes: ["text"],
      knownFor: "A balanced mid-size model that also understands images and video.",
      caveat: "It needs a strong workstation, not a classroom Chromebook.",
      classroom: "A realistic 'school server' model for an IT team to try."
    },
    {
      id: "nemotron", name: "Nemotron 3 Nano", short: "Nemotron 3", maker: "NVIDIA (USA)", area: "woods",
      category: "Open-weight model",
      stats: { context: 3, reasoning: 2, speed: 5, thrift: 5 },
      openness: "open-weight", local: "yes",
      reads: ["text"], makes: ["text"],
      knownFor: "An efficient hybrid design that does a lot with a little.",
      caveat: "Small and fast means it struggles on the hardest problems.",
      classroom: "Shows the trade-off between speed and smarts."
    },
    {
      id: "deepseek", name: "DeepSeek V4", short: "DeepSeek V4", maker: "DeepSeek (China)", area: "woods",
      category: "Open-weight model, MIT license",
      stats: { context: 4, reasoning: 4, speed: 3, thrift: 5 },
      openness: "open-weight", local: "server",
      reads: ["text"], makes: ["text"],
      knownFor: "A huge open-weight model, widely used through low-cost APIs.",
      caveat: "Hosting it yourself needs server-class hardware. Through someone else's API, your data still travels.",
      classroom: "Shows that 'open' and 'runs on my laptop' are different things."
    },
    {
      id: "mistral", name: "Mistral Small 4", short: "Mistral S4", maker: "Mistral AI (France)", area: "woods",
      category: "Open-weight model",
      stats: { context: 3, reasoning: 3, speed: 3, thrift: 4 },
      openness: "open-weight", local: "server",
      reads: ["text", "image"], makes: ["text"],
      knownFor: "A business helper, with a coding sibling called Devstral Small 2.",
      caveat: "'Small' is a name, not a size: about 119 billion parameters in total, though only a slice is used for each word.",
      classroom: "A fun way to explain parameters, and proof that major AI comes from Europe too."
    },
    {
      id: "kimi", name: "Kimi K3", short: "Kimi K3", maker: "Moonshot AI (China)", area: "woods",
      category: "Open-weight model",
      stats: { context: 4, reasoning: 4, speed: 2, thrift: 4 },
      openness: "open-weight", local: "server",
      reads: ["text"], makes: ["text"],
      knownFor: "A giant open model built for agents: AI that carries out multi-step jobs.",
      caveat: "Far too big for ordinary computers, and it comes with its own custom license. Read it first!",
      classroom: "Introduces 'agent' as AI that takes steps, not just answers."
    },
    {
      id: "glm", name: "GLM-5.3", short: "GLM-5.3", maker: "Z.ai (China)", area: "woods",
      category: "Open-weight model",
      stats: { context: 4, reasoning: 4, speed: 3, thrift: 4 },
      openness: "open-weight", local: "server",
      reads: ["text"], makes: ["text"],
      knownFor: "Another giant open model aimed at agents and coding.",
      caveat: "It needs big servers and has a custom license. Leaderboard rankings shift month to month.",
      classroom: "A reminder that major models come from many countries."
    },

    /* ------------------------------ PIXEL STUDIO ------------------------------ */
    {
      id: "kling", name: "Kling", short: "Kling", maker: "Kuaishou (China)", area: "studio",
      category: "Closed video model",
      stats: { context: 1, reasoning: 1, speed: 3, thrift: 3 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video"],
      knownFor: "Hugely popular for short social clips. Version 4.0 recently launched.",
      caveat: "Clips are short, and odd details still sneak in.",
      classroom: "Your students have probably seen its output without knowing it."
    },
    {
      id: "ltx", name: "LTX-2.5", short: "LTX-2.5", maker: "Lightricks (Israel)", area: "studio",
      category: "Open-weight video model",
      stats: { context: 1, reasoning: 1, speed: 4, thrift: 5 },
      openness: "open-weight", local: "yes",
      reads: ["text", "image"], makes: ["video", "audio"],
      knownFor: "Open-weight video with sound that can run on one consumer graphics card (about 12 to 16GB).",
      caveat: "Less polished than the big hosted models, and its license has conditions.",
      classroom: "Video generation that can stay on a school computer."
    },
    {
      id: "veo", name: "Veo 3.1 / Gemini Omni Flash", short: "Veo 3.1", maker: "Google (USA)", area: "studio",
      category: "Closed video model",
      stats: { context: 1, reasoning: 1, speed: 2, thrift: 2 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video", "audio"],
      knownFor: "High-quality video up to 4K, stamped with an invisible watermark called SynthID.",
      caveat: "Watermarks only help if someone checks, and not every tool adds one.",
      classroom: "A natural start for a lesson on labeling AI-made content."
    },
    {
      id: "wan", name: "Wan", short: "Wan", maker: "Alibaba (China)", area: "studio",
      category: "Video model (new: hosted, old: open)",
      stats: { context: 1, reasoning: 1, speed: 3, thrift: 3 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video"],
      knownFor: "Version 3.0 makes clips up to about 30 seconds long, and is one of the big names on video leaderboards.",
      caveat: "The newest version is hosted only. The downloadable one (2.2) is older.",
      classroom: "One name can cover both closed and open versions. Always ask: which one?"
    },
    {
      id: "seedance", name: "Seedance 2.5", short: "Seedance", maker: "ByteDance (China)", area: "studio",
      category: "Closed video model",
      stats: { context: 1, reasoning: 1, speed: 2, thrift: 3 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video"],
      knownFor: "Longer clips guided by many reference images.",
      caveat: "Reference images raise a question: whose pictures are you allowed to use?",
      classroom: "A way into talking about consent and student photos."
    },
    {
      id: "runway", name: "Runway Gen-4.5", short: "Runway", maker: "Runway (USA)", area: "studio",
      category: "Closed video model",
      stats: { context: 1, reasoning: 1, speed: 3, thrift: 2 },
      openness: "closed", local: "no",
      reads: ["text", "image", "video"], makes: ["video"],
      knownFor: "Editing tools wrapped around video generation.",
      caveat: "It runs on paid credits, and they go quickly.",
      classroom: "Frames AI as one step in editing, not a magic button."
    },
    {
      id: "luma", name: "Luma Ray3.2", short: "Luma Ray", maker: "Luma AI (USA)", area: "studio",
      category: "Closed video model",
      stats: { context: 1, reasoning: 1, speed: 3, thrift: 2 },
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video"],
      knownFor: "HDR video used in professional color workflows.",
      caveat: "The pro features are more than most class projects need.",
      classroom: "A peek at how studios actually use these tools."
    },

    /* --------------------------------- GHOST --------------------------------- */
    {
      id: "sora", name: "Sora", short: "Sora", maker: "OpenAI (USA)", area: "ghost",
      category: "Retired video model",
      stats: null,
      openness: "closed", local: "no",
      reads: ["text", "image"], makes: ["video"],
      knownFor: "The video model that made AI video famous.",
      caveat: "It was discontinued in 2026. Tools get retired!",
      classroom: "Build lessons around skills, not around one app."
    }
  ]
};

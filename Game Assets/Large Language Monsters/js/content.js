/* Large Language Monsters - game content: maps, people, tasks and dialogue.
   Model FACTS live in models.js. This file is the story and the world.
   In dialogue: {P} = player name, {N} = helper name, {T} = task name, {DATE} = facts date. */
window.CONTENT = (function () {
  'use strict';

  /* ------------------------------- MAPS -------------------------------
     Legend (outdoors):  . grass  , flowers  p path  T tree  W water  f fence  ~ paper pile (tasks!)
                         S sign  R roof  B wall  w window  D door
     Cloud City:         c cloud floor  C cloud puff (tasks!)  k open sky  m marble pillar
     Woods:              g forest floor  L leaf pile (tasks!)  M mushroom
     Studio:             s studio floor  F film scraps (tasks!)  x brick wall  l light stand
     Indoors:            _ floor  # wall  b bookshelf  d desk  r rug  E exit mat  e bed
                         h seat  V screen  o plant  q wall screen                                */
  var maps = {
    home: {
      name: 'YOUR HOUSE', tune: 0,
      rows: [
        '##########',
        '#e_____qb#',
        '#________#',
        '#________#',
        '#__rrrr__#',
        '#__rrrr__#',
        '#o_______#',
        '#________#',
        '####E#####'],
      warps: [{ x: 4, y: 8, to: 'town', tx: 14, ty: 5, dir: 'down' }],
      npcs: [{ id: 'cat', x: 6, y: 6, spr: 'cat', lines: ['Your cat, TENSOR, purrs. She has no opinions about AI.', 'TENSOR knocks a pencil off the table. Unprompted.'] }],
      signs: { '7,1': 'Your laptop. Fourteen tabs are open. All of them say "what is an LLM?"' }
    },
    library: {
      name: 'TOWN LIBRARY', tune: 0,
      rows: [
        '##########',
        '#bbbb_bbb#',
        '#________#',
        '#_dd_____#',
        '#________#',
        '#__rrrr__#',
        '#__rrrr_o#',
        '#________#',
        '####E#####'],
      warps: [{ x: 4, y: 8, to: 'town', tx: 4, ty: 5, dir: 'down' }],
      npcs: [{ id: 'token', x: 6, y: 3, spr: 'token', act: 'token' }],
      signs: { '2,3': 'The returns cart. A sticky note says: "Be kind. Rewind your context window."' }
    },
    town: {
      name: 'PROMPT TOWN', tune: 0,
      rows: [
        'TTTTTTTTTppTTTTTTTTT',
        'T........pp........T',
        'T.RRRRR..pp..RRRR..T',
        'T.RRRRR..pp..RRRR..T',
        'T.BwDwB..pp..BDwB..T',
        'T...p....pp...p....T',
        'T...pppppppppppp...T',
        'T........pp........T',
        'T.,,.....pp....,,..T',
        'T.,,..S..pp........T',
        'T........pp...WWW..T',
        'T..fffff.pp...WWW..T',
        'T..f,,,f.pp...WWW..T',
        'T..f,,,f.pp........T',
        'T..fffff.pp....,...T',
        'T........pp........T',
        'T..................T',
        'TTTTTTTTTTTTTTTTTTTT'],
      warps: [
        { x: 9, y: 0, to: 'fields', tx: 9, ty: 16, dir: 'up' }, { x: 10, y: 0, to: 'fields', tx: 10, ty: 16, dir: 'up' },
        { x: 4, y: 4, to: 'library', tx: 4, ty: 7, dir: 'up' }, { x: 14, y: 4, to: 'home', tx: 4, ty: 7, dir: 'up' }],
      npcs: [
        { id: 'kid', x: 6, y: 8, spr: 'kid', lines: [
          'My sister says a PARAMETER is like one tiny dial inside a model. Big models have BILLIONS of dials!',
          'More parameters usually means smarter... and slower, and pricier. Small models are zippy!'] },
        { id: 'gardener', x: 8, y: 12, spr: 'gardener', lines: [
          'An LLM predicts the next word, over and over. That is the whole trick!',
          'It can sound sure even when it is wrong. Trust, but verify. Like my tomato forecasts.'] }],
      signs: {
        '6,9': 'PROMPT TOWN. Where every question finds a helper.',
        '3,4': 'TOWN LIBRARY. Ms. Token, librarian. "Ask better questions."',
        '5,4': 'TOWN LIBRARY. Ms. Token, librarian. "Ask better questions."',
        '15,4': 'Your house. Home sweet home.'
      }
    },
    fields: {
      name: 'INBOX FIELDS', tune: 2, area: 'fields',
      rows: [
        'TTTTTTTTTppTTTTTTTTT',
        'T........pp........T',
        'T........pp........T',
        'pppppppppppppppppppp',
        'T...S....pp....S...T',
        'T.~~~~...pp..RRRR..T',
        'T.~~~~~..pp..RRRR..T',
        'T..~~~~..pp..BDBB..T',
        'T........ppppp.....T',
        'T....,...pp..~~~~..T',
        'T.TT.....pp..~~~~~.T',
        'T.TT..~~~pp...~~~..T',
        'T....~~~~pp........T',
        'T....~~~.pp..,.....T',
        'T........pp........T',
        'T..,.....pp....TT..T',
        'T........pp........T',
        'TTTTTTTTTppTTTTTTTTT'],
      warps: [
        { x: 9, y: 17, to: 'town', tx: 9, ty: 1, dir: 'down' }, { x: 10, y: 17, to: 'town', tx: 10, ty: 1, dir: 'down' },
        { x: 9, y: 0, to: 'cloud', tx: 9, ty: 10, dir: 'up' }, { x: 10, y: 0, to: 'cloud', tx: 10, ty: 10, dir: 'up' },
        { x: 0, y: 3, to: 'woods', tx: 18, ty: 6, dir: 'left' }, { x: 19, y: 3, to: 'studio', tx: 1, ty: 6, dir: 'right' },
        { x: 14, y: 7, to: 'tower', tx: 4, ty: 7, dir: 'up' }],
      npcs: [
        { id: 'hiker', x: 7, y: 15, spr: 'hiker', lines: [
          'Tasks hide in the paper piles! Match each task to the right helper and it is over in a flash.',
          'Stuck in a task? Press {KB} to switch helpers. Nobody is good at everything.'] },
        { id: 'guard', x: 14, y: 8, spr: 'guard', act: 'guard', unless: 'towerOpen' },
        { id: 'guard', x: 15, y: 8, spr: 'guard', act: 'guard', when: 'towerOpen' }],
      signs: {
        '4,4': 'WEST: Open Weights Woods. NORTH: Cloud City.',
        '15,4': 'EAST: Pixel Studio. RIGHT HERE: the Benchmark Tower.',
        '13,7': 'THE BENCHMARK TOWER. "Today\'s high score is tomorrow\'s footnote."',
        '15,7': 'THE BENCHMARK TOWER. "Today\'s high score is tomorrow\'s footnote."'
      }
    },
    cloud: {
      name: 'CLOUD CITY', tune: 5, area: 'cloud',
      rows: [
        'kkkkkkkkkkkkkkkkkkkk',
        'kkccccccckkkcccccckk',
        'kcccCCCcccccccCCCcck',
        'kccCCCCccccccCCCCcck',
        'kcccCCcccmccmccCCcck',
        'kkccccccccccccccckkk',
        'kkkccccmccccmcccckkk',
        'kkkkcccccccccccckkkk',
        'kkkkkkccccccccckkkkk',
        'kkkkkkkkcccckkkkkkkk',
        'kkkkkkkkkcckkkkkkkkk',
        'kkkkkkkkkcckkkkkkkkk'],
      warps: [{ x: 9, y: 11, to: 'fields', tx: 9, ty: 1, dir: 'down' }, { x: 10, y: 11, to: 'fields', tx: 10, ty: 1, dir: 'down' }],
      npcs: [
        { id: 'vega', x: 10, y: 4, spr: 'vega', act: 'mentor', key: 'cloud' },
        { id: 'c1', x: 5, y: 6, spr: 'suit', lines: [
          'The models up here are CLOSED. You can use them through an app or an API, but you cannot download them.',
          'Closed models are often the most powerful. The trade-off: your words travel to someone else\'s computer.'] },
        { id: 'c2', x: 14, y: 7, spr: 'kid2', lines: [
          'An API is like a drive-through window. Your app sends an order, the model sends back an answer.',
          'You pay per TOKEN: a little chunk of a word. Long chats cost more!'] }],
      signs: {
        '9,4': 'CLOUD CITY. Your data travels here whenever you use a cloud model. Pack accordingly.',
        '12,4': 'COACH VEGA\'S PLAZA. Frontier models, served fresh from far away.'
      }
    },
    woods: {
      name: 'OPEN WEIGHTS WOODS', tune: -3, area: 'woods',
      rows: [
        'TTTTTTTTTTTTTTTTTTTT',
        'TggLLLgggTTgggLLLggT',
        'TgLLLLgggggggLLLLggT',
        'TggLLggMgggggggLLggT',
        'TggggggggggggggggggT',
        'TTTgggggggTTgggggSgT',
        'TgggggggggTTgggggggp',
        'TggLLLggggggggMggggT',
        'TgLLLLLgggggggggTTTT',
        'TggLLLggggMggggggggT',
        'TggggggggggggggggggT',
        'TTTTTTTTTTTTTTTTTTTT'],
      warps: [{ x: 19, y: 6, to: 'fields', tx: 1, ty: 3, dir: 'right' }],
      npcs: [
        { id: 'ramos', x: 9, y: 4, spr: 'ramos', act: 'mentor', key: 'woods' },
        { id: 'w1', x: 9, y: 2, spr: 'hiker', lines: [
          'OPEN WEIGHTS means the model\'s "brain file" is published. Anyone can download it and run it.',
          'Careful: open weights is not the same as open everything. Most do not share their training data.'] },
        { id: 'w2', x: 15, y: 9, spr: 'traveler', lines: [
          'DeepSeek, Qwen, Kimi and GLM come from China. Mistral is French. Olmo is from a US nonprofit.',
          'Great models come from all over the world, not just one valley in California!'] }],
      signs: { '17,5': 'OPEN WEIGHTS WOODS. Take a model home! (Hardware not included.)' }
    },
    studio: {
      name: 'PIXEL STUDIO', tune: 2, area: 'studio',
      rows: [
        'xxxxxxxxxxxxxxxxxxxx',
        'xssFFFsssslssRRRRssx',
        'xsFFFFsssssssRRRRssx',
        'xssFFssssssssBDBBssx',
        'xssssssssssssssssssx',
        'xsssslssssssssFFFssx',
        'pssssssssssssFFFFFsx',
        'xssssssssssssFFFFssx',
        'xssFFFssslssssFFsssx',
        'xsFFFFFssssssssssslx',
        'xssFFFsssssssssssssx',
        'xxxxxxxxxxxxxxxxxxxx'],
      warps: [{ x: 0, y: 6, to: 'fields', tx: 18, ty: 3, dir: 'left' }, { x: 14, y: 3, to: 'screening', tx: 4, ty: 7, dir: 'up' }],
      npcs: [
        { id: 'reel', x: 9, y: 4, spr: 'reel', act: 'mentor', key: 'studio' },
        { id: 's1', x: 8, y: 9, spr: 'kid', lines: [
          'Leaderboards rank the video models every week. This week\'s champ is next month\'s runner-up!',
          'Chat models can WATCH a video. Video models MAKE one. Different jobs!'] }],
      signs: {
        '13,3': 'OLD SCREENING ROOM. Closed in 2026. (Is that... humming?)',
        '15,3': 'OLD SCREENING ROOM. Closed in 2026. (Is that... humming?)'
      }
    },
    screening: {
      name: 'OLD SCREENING ROOM', tune: -5,
      rows: [
        '##########',
        '#VVVVVVVV#',
        '#________#',
        '#_hh__hh_#',
        '#________#',
        '#_hh__hh_#',
        '#________#',
        '#________#',
        '####E#####'],
      warps: [{ x: 4, y: 8, to: 'studio', tx: 14, ty: 4, dir: 'down' }],
      npcs: [{ id: 'sora', x: 5, y: 4, spr: 'ghost', act: 'sora' }],
      signs: {}
    },
    tower: {
      name: 'BENCHMARK TOWER', tune: 7,
      rows: [
        '##########',
        '#qq_bb_qq#',
        '#________#',
        '#________#',
        '#__rrrr__#',
        '#__rrrr__#',
        '#________#',
        '#________#',
        '####E#####'],
      warps: [{ x: 4, y: 8, to: 'fields', tx: 14, ty: 8, dir: 'down' }],
      npcs: [{ id: 'proctor', x: 4, y: 3, spr: 'proctor', act: 'proctor' }],
      signs: {}
    }
  };

  // What you read when you poke at furniture.
  var flavor = {
    b: ['"Attention Is All You Need: The Picture Book."', '"The Very Hungry Context Window."', '"Goodnight, GPU."', '"Tokens and How to Count Them."', '"Oh, the Things You Can Prompt!"'],
    q: 'LEADERBOARD. First place changes every time you blink.',
    e: 'Your bed. No naps until the binder has some cards in it.',
    V: 'A dusty screen. A faint movie flickers, then fades.',
    h: 'A velvet seat. Somebody left popcorn here in 2025.',
    o: 'A plant. It is real. You checked the source.',
    W: 'A pond. The ducks are not generated.',
    d: 'A tidy desk covered in date stamps.'
  };

  /* ------------------------------- MOVES ------------------------------- */
  var moves = [
    { id: 'context', name: 'READ ALL' }, { id: 'reasoning', name: 'THINK HARD' },
    { id: 'speed', name: 'QUICK DRAFT' }, { id: 'thrift', name: 'GO CHEAP' },
    { id: 'senses', name: 'LOOK+LISTEN' }, { id: 'local', name: 'RUN OFFLINE' },
    { id: 'video', name: 'MAKE A CLIP' }, { id: 'teacher', name: 'VERIFY' }
  ];
  var moveHelp = {
    context: 'CONTEXT {V}/5. How much it can read at once.',
    reasoning: 'REASONING {V}/5. Step-by-step thinking power.',
    speed: 'SPEED {V}/5. How fast answers come back.',
    thrift: 'THRIFT {V}/5. Higher means cheaper to use.',
    senses: 'TAKES IN: {V}.',
    local: 'RUNS LOCALLY: {V}.',
    video: 'MAKES: {V}.',
    teacher: 'Your own move. No model needed!'
  };
  var moveText = {
    context: {
      great: '{N} reads the whole thing in one go. That is a big CONTEXT WINDOW!',
      ok: '{N} gets through it in chunks. A bigger context window would help.',
      poor: '{N} runs out of room after a few pages. Its context window is small.'
    },
    reasoning: {
      great: '{N} slows down and works step by step. THINKING modes shine on puzzles!',
      ok: '{N} reasons partway, then starts guessing.',
      poor: '{N} blurts out a quick answer. This needed more careful reasoning.'
    },
    speed: {
      great: '{N} answers in a blink. Small, fast models are built for this!',
      ok: '{N} gets there... eventually.',
      poor: '{N} is still thinking. Big models can be slow!'
    },
    thrift: {
      great: '{N} costs next to nothing to run. Easy on the budget!',
      ok: '{N} is affordable, if you watch the meter.',
      poor: '{N} is a premium model. Powerful, but pricey!'
    },
    senses: {
      great: '{N} takes in the {S} directly. That is MULTIMODAL input!',
      none: '{N} cannot take in {S}. Always check which INPUTS a model accepts.'
    },
    local: {
      great: '{N} runs right here on your own computer. Nothing leaves the building!',
      ok: '{N} can run in-house, but only on a big server. Does your school have one?',
      tooBig: '{N} is open, but far too big for a laptop. It needs a server room!',
      none: '{N} only runs in its maker\'s cloud. Your data would have to travel there.'
    },
    video: {
      great: '{N} turns your idea into moving pictures. That is video OUTPUT!',
      none: '{N} can write a great script... but it can\'t make the video itself!',
      cloudOnly: '{N} could make it, but only in the cloud. This one has to render on the classroom PC.'
    },
    teacher: { text: 'You double-check the work against a trusted source. Confirmed by a human!' },
    verifyAny: 'You double-check against a trusted source. It helps a little. Always a good habit!',
    videoOnly: '{N} is a video maker. Reading, reasoning and paperwork are not its job.',
    wrong: 'That does not fit this task.',
    hint: {
      context: 'It needs a helper that can READ A LOT at once.',
      reasoning: 'It needs careful step-by-step THINKING.',
      speed: 'It needs a FAST answer.',
      thrift: 'It needs a CHEAP option.',
      senses: 'It needs a helper that can SEE or HEAR it.',
      local: 'It has to stay on a computer YOU control.',
      video: 'It needs a helper that MAKES VIDEO.',
      teacher: 'No model can settle this alone.'
    }
  };
  var grades = { great: 'GREAT FIT!', ok: 'OK FIT', poor: 'WEAK FIT', none: 'NO FIT' };
  var senseWord = { image: 'images', audio: 'audio', video: 'video' };

  /* ------------------------------- TASKS -------------------------------
     Each task has one or two PARTS. A part is beaten by the matching kind of move:
     context / reasoning / speed / thrift / senses / local / video / teacher.          */
  var tasks = {
    pdf: {
      name: '300-PAGE PDF', sprite: 'pdf',
      intro: 'A 300-PAGE PDF lands on your desk! THUD.',
      parts: [{ type: 'context', label: 'PAGES' }],
      lesson: 'CONTEXT WINDOW: how much a model can read at once. Bigger windows fit whole books.'
    },
    logic: {
      name: 'LOGIC PUZZLE', sprite: 'puzzle',
      intro: 'A tricky LOGIC PUZZLE lands on your desk! It smirks at you.',
      parts: [{ type: 'reasoning', label: 'STEPS' }],
      lesson: 'Many models have a THINKING mode: slower, but better at multi-step problems.'
    },
    budget: {
      name: '$0 BUDGET', sprite: 'budget',
      intro: 'A $0 BUDGET lands on your desk! It jingles... emptily.',
      parts: [{ type: 'thrift', label: 'COSTS' }],
      lesson: 'Small and open models can be free or nearly free. Bigger is not always better value.'
    },
    whiteboard: {
      name: 'WHITEBOARD PHOTO', sprite: 'whiteboard',
      intro: 'A PHOTO OF A WHITEBOARD lands on your desk! Blurry marker everywhere.',
      parts: [{ type: 'senses', sense: 'image', label: 'SCRIBBLES' }],
      lesson: 'VISION models accept images as input. Not every model can!'
    },
    quiz: {
      name: 'POP QUIZ', sprite: 'quiz',
      intro: 'A POP QUIZ lands on your desk! It is due in five minutes!',
      parts: [{ type: 'speed', label: 'QUESTIONS' }],
      lesson: 'Speed matters. Smaller models answer faster and cost less.'
    },
    records: {
      name: 'STUDENT RECORDS', sprite: 'records',
      intro: 'STUDENT RECORDS land on your desk! They must NOT leave the building!',
      parts: [{ type: 'local', label: 'FILES' }],
      lesson: 'LOCAL models run on your own computer, so private data stays put.'
    },
    factcheck: {
      name: 'FACT-CHECK', sprite: 'factcheck',
      intro: 'A FACT-CHECK lands on your desk! "Is that REALLY true?"',
      parts: [{ type: 'teacher', label: 'CLAIMS', miss: '{N} answers with total confidence. But is it right? ANY model can hallucinate!' }],
      teacherMove: { name: 'VERIFY', text: 'You check the claim against a trusted source. Confirmed by a human!' },
      lesson: 'ALL models sometimes make things up. That is called a HALLUCINATION. Always verify.'
    },
    curriculum: {
      name: 'CURRICULUM BINDER', sprite: 'binder',
      intro: 'A WHOLE-YEAR CURRICULUM BINDER lands on your desk! It needs its own chair.',
      parts: [{ type: 'context', label: 'UNITS' }],
      lesson: 'Frontier cloud models can hold hundreds of pages in mind at once.'
    },
    recording: {
      name: 'PARENT-NIGHT TAPE', sprite: 'recording',
      intro: 'A PARENT-NIGHT RECORDING lands on your desk! Ninety minutes of audio.',
      parts: [{ type: 'senses', sense: 'audio', label: 'MINUTES' }],
      lesson: 'Some models accept AUDIO as input. Many only read text.'
    },
    bus: {
      name: 'BUS BRAIN-TEASER', sprite: 'bus',
      intro: 'A BUS SCHEDULE BRAIN-TEASER lands on your desk! Four routes, one driver.',
      parts: [{ type: 'reasoning', label: 'ROUTES' }],
      lesson: 'For tangled problems, pick a strong reasoner and let it think.'
    },
    nowifi: {
      name: 'NO-WIFI FIELD TRIP', sprite: 'nowifi',
      intro: 'A NO-WIFI FIELD TRIP lands on your desk! Zero bars at the nature center.',
      parts: [{ type: 'local', modest: true, label: 'MILES' }],
      lesson: 'Small open models can run on a laptop with no internet at all.'
    },
    license: {
      name: 'LICENSE FINE PRINT', sprite: 'license',
      intro: 'LICENSE FINE PRINT lands on your desk! The font is very, very small.',
      parts: [{ type: 'teacher', label: 'CLAUSES', miss: '{N} is called "open". But open does not always mean free for ANY use. Better read the license!' }],
      teacherMove: { name: 'READ LICENSE', text: 'You read the license. Some, like MIT, allow almost anything. Others limit commercial use.' },
      lesson: '"Open" comes in flavors. Check a model\'s license before you build on it.'
    },
    trailer: {
      name: 'CLASS TRAILER', sprite: 'trailer',
      intro: 'A 10-SECOND CLASS TRAILER lands on your desk! Lights, camera...',
      parts: [{ type: 'video', label: 'SECONDS' }],
      lesson: 'Reading video and MAKING video are different skills. Check a model\'s OUTPUTS.'
    },
    classpc: {
      name: 'CLASSROOM PC CLIP', sprite: 'classpc',
      intro: 'A TRAILER FOR THE CLASSROOM PC lands on your desk! It must render right here.',
      parts: [{ type: 'video', local: true, label: 'FRAMES' }],
      lesson: 'A few open-weight video models can run on a single good graphics card.'
    },
    clipreal: {
      name: 'IS THIS CLIP REAL?', sprite: 'clipreal',
      intro: 'A SUSPICIOUS CLIP lands on your desk! In it, a cat is teaching algebra.',
      parts: [{ type: 'teacher', label: 'DOUBTS', miss: '{N} squints at it. Hard to tell by eye! Look for a label or watermark instead.' }],
      teacherMove: { name: 'CHECK LABEL', text: 'You check for an AI label. Some tools embed an invisible watermark, like Google\'s SynthID.' },
      lesson: 'WATERMARKS and labels help flag AI-made media. Not every tool adds one, so stay curious.'
    },
    tower1: {
      name: 'FIELD TRIP PROJECT', sprite: 'binder',
      intro: 'A FIELD TRIP MEGA-PROJECT lands on your desk! A 200-page packet AND a recap video.',
      parts: [{ type: 'context', label: 'PACKET' }, { type: 'video', label: 'RECAP' }]
    },
    tower2: {
      name: 'SECRET SCHEDULE', sprite: 'records',
      intro: 'A SECRET SCHEDULE lands on your desk! Private notes AND a timetable tangle.',
      parts: [{ type: 'local', label: 'NOTES' }, { type: 'reasoning', label: 'TANGLE' }]
    },
    tower3: {
      name: 'MORNING SHOW', sprite: 'trailer',
      intro: 'THE MORNING SHOW lands on your desk! A script full of "facts" AND a video to make.',
      parts: [{ type: 'teacher', label: 'SCRIPT', miss: '{N} polishes the script... and keeps a made-up fact in it. Models can hallucinate!' }, { type: 'video', label: 'VIDEO' }],
      teacherMove: { name: 'VERIFY', text: 'You check every claim in the script against a trusted source. Two fixes made!' }
    },
    hype: {
      name: 'THE HYPE CYCLE', sprite: 'hype', boss: true,
      intro: ['The tower shakes! Confetti falls! A voice booms:', '"THIS NEW MODEL CHANGES EVERYTHING!!!"', 'THE HYPE CYCLE crashes onto your desk!'],
      parts: [{ type: 'teacher', label: 'HYPE' }],
      taunts: [
        '"{N} is YESTERDAY\'S model! A new one launched while you were clicking!"',
        '"The leaderboard just changed. AGAIN! {N} dropped to fourth place!"',
        '"Soon ONE model will do EVERYTHING! Why even choose?"',
        '"Ten times better! A hundred times! Do not ask at what!"'],
      learn: ['Ms. Token\'s voice echoes in your head: "Wrong question! Ask: best for WHAT?"', 'You remembered a move: RIGHT TOOL!'],
      use: 'You ignore the noise and ask: what does THIS task actually need?',
      finale: ['You PICK THE RIGHT TOOL FOR THE JOB!', 'THE HYPE CYCLE wobbles... deflates... and settles into a calm, useful plateau.']
    }
  };
  Object.keys(tasks).forEach(function (k) { tasks[k].id = k; });

  /* --------------------------- AREAS: what turns up where --------------------------- */
  var areas = {
    fields: { tasks: ['pdf', 'logic', 'budget', 'whiteboard', 'quiz', 'records', 'factcheck'], llms: ['gemma', 'nemotron', 'grok', 'gptoss'], job: 'class paperwork' },
    cloud: { tasks: ['pdf', 'logic', 'whiteboard', 'recording', 'factcheck', 'quiz'], llms: ['gemini', 'gpt56', 'claude', 'grok'], job: 'long documents' },
    woods: { tasks: ['records', 'budget', 'nowifi', 'license', 'factcheck', 'logic'], llms: ['gptoss', 'olmo', 'qwen', 'gemma', 'deepseek', 'nemotron', 'mistral', 'kimi', 'glm'], job: 'private files' },
    studio: { tasks: ['trailer', 'clipreal', 'factcheck', 'trailer'], llms: ['kling', 'ltx', 'veo', 'wan', 'seedance', 'runway', 'luma'], job: 'a class video' }
  };
  var areaTag = { cloud: 'CLOUD', woods: 'OPEN', studio: 'VIDEO', ghost: 'RETIRED' };
  var areaName = { cloud: 'CLOUD CITY', woods: 'OPEN WEIGHTS WOODS', studio: 'PIXEL STUDIO', ghost: 'OLD SCREENING ROOM' };

  /* ------------------------------- MENTORS ------------------------------- */
  var mentors = {
    cloud: {
      name: 'COACH VEGA', stamp: 'CLOUD STAMP', tasks: ['curriculum', 'recording', 'bus'],
      intro: ['I\'m COACH VEGA, district tech coach. I test every shiny new app so teachers don\'t have to.',
        'Cloud models are the heavy lifters: huge context, sharp reasoning, eyes AND ears.',
        'Clear my three tasks and I will stamp your binder.'],
      ask: 'Ready for Coach Vega\'s three tasks?',
      between: ['Nice reading! The next one needs EARS.', 'Last one. It needs brains.'],
      hint: ['Tip: pick a helper with a big CONTEXT stat and use READ ALL.',
        'Tip: you need a helper that takes in AUDIO. One is hiding in the cloud puffs!',
        'Tip: use THINK HARD with a helper whose REASONING is 4 or 5.'],
      win: ['That is the CLOUD STAMP!', 'Remember: cloud power is real. So is the trip your data takes to get there.'],
      after: 'Closed models change often. The app you love may get a brand new model overnight!'
    },
    woods: {
      name: 'DIRECTOR RAMOS', stamp: 'WOODS STAMP', tasks: ['records', 'nowifi', 'license'],
      intro: ['I\'m DIRECTOR RAMOS. I run IT for the district on a budget of... let me check... zero dollars.',
        'My rule: student data does not leave the building. Open-weight models make that possible.',
        'Clear my three tasks and I will stamp your binder.'],
      ask: 'Ready for Director Ramos\'s three tasks?',
      between: ['Safe and sound. Now: no internet at all.', 'Last one. Bring your reading glasses.'],
      hint: ['Tip: use RUN OFFLINE with a helper whose card says RUNS LOCALLY: yes. Try the leaf piles!',
        'Tip: no wifi means no cloud. You need a model small enough for a laptop.',
        'Tip: no model can do this for you. Use YOUR move: READ LICENSE.'],
      win: ['The WOODS STAMP is yours!', 'Local means private. And "open" means: read the license first.'],
      after: 'Running your own model takes real hardware and real upkeep. Free weights, not free lunch!'
    },
    studio: {
      name: 'MR. REEL', stamp: 'STUDIO STAMP', tasks: ['trailer', 'classpc', 'clipreal'],
      intro: ['I\'m MR. REEL! I teach media arts. My students think I\'m a wizard. I\'m just good at picking tools.',
        'Video models MAKE video. Chat models mostly cannot. Let\'s see if you know the difference!',
        'Clear my three tasks and I will stamp your binder.'],
      ask: 'Ready for Mr. Reel\'s three tasks?',
      between: ['Cut! Print! Next: make one right here on the classroom PC.', 'Last one. Trust nothing. Check everything.'],
      hint: ['Tip: you need a VIDEO model. Look in the film scraps around the studio!',
        'Tip: only an OPEN-WEIGHT video model can run on the classroom PC. Look for LTX in the film scraps!',
        'Tip: use YOUR move: CHECK LABEL.'],
      win: ['That\'s a wrap! The STUDIO STAMP is yours!', 'And always tell your audience when a video is AI-made.'],
      after: 'Have you seen the old screening room next door? Something in there still hums.'
    }
  };
  var tower = {
    tasks: ['tower1', 'tower2', 'tower3'],
    intro: ['Welcome to the BENCHMARK TOWER. I am the PROCTOR.',
      'A BENCHMARK is a standard test for models. Scores make headlines!',
      'But the tests keep changing, and so do the winners. Never pick a model by rank alone.',
      'Three mixed tasks. Each one needs MORE than one kind of helper.'],
    ask: 'Begin the Benchmark Tower challenge?',
    between: ['Passed. One helper could not have done that alone.', 'Passed. The right helper for each part!', 'Passed. Wait... do you hear cheering?'],
    hint: 'Each part of a tower task needs a different helper. Press {KB} during a task to switch!',
    after: 'The leaderboard changed nine times while you were up here. You, however, are still certified.'
  };

  /* ------------------------------- SCRIPT TEXT ------------------------------- */
  var text = {
    opening: ['PROMPT TOWN. A quiet place where teachers and language models learn to get along.',
      'Good morning, {P}! Ms. Token at the LIBRARY wants to see you. It is the building on the left.'],
    gate: 'Careful! Wild tasks roam the Inbox Fields. Go see Ms. Token at the library first.',
    token: {
      intro: ['Ah, {P}! Welcome to the library. I\'m Ms. Token.',
        'A TOKEN is a little chunk of a word. It is how language models read. It is also my name. Total coincidence.',
        'These creatures are LLMs: Large Language Models. Each one is good at different things.',
        'Teachers keep asking me, "Which AI is the best?" Wrong question! Ask: best for WHAT?',
        'Take a helper from the returns cart.'],
      ask: 'Which helper will you take?',
      options: ['CLAUDE (lives in the cloud)', 'GEMMA 4 (runs on your laptop)', 'Tell me more'],
      more: ['CLAUDE runs on its maker\'s servers. It is powerful and has a size dial: small is fast and cheap, big is smart and slow.',
        'But whatever you type travels to the cloud.',
        'GEMMA 4 is OPEN-WEIGHT. A small version runs on your own computer, so your data stays with you.',
        'It is less powerful, though. Every choice is a trade-off!'],
      gave: ['{N} joined your team!',
        'And take this MODEL CARD BINDER. A model card is a fact sheet about a model. Fill it up as you go.',
        'Now head NORTH to the Inbox Fields. Tasks hide in the paper piles.',
        'Clear a task and a new helper may wander over. Earn all three mentor stamps, then try the Benchmark Tower!',
        'Open the MENU any time to see your team, your binder and your goal.'],
      tips: ['Stuck? Press {KB} during a task to switch helpers. No single model is best at everything.',
        'The facts in your binder were current as of {DATE}. This field moves FAST.',
        'Claude has a size dial! Open its card in your binder, or use left and right on the TEAM screen.',
        'When a model sounds very sure, that is exactly when to double-check it.'],
      menu: 'How can I help?',
      menuOpts: ['A tip, please', 'Swap helpers', 'Goodbye'],
      noBench: 'Nobody is waiting on the returns cart right now.',
      swapWho: 'Who should join your team?',
      swapFor: 'And who takes a break?',
      swapped: 'Done! {A} is on your team. {B} is resting on the returns cart.'
    },
    guardNo: 'The BENCHMARK TOWER opens for trainers with all 3 mentor stamps. You have {V}. Try Cloud City, the Woods and Pixel Studio!',
    guardYes: ['Three stamps! Impressive.', 'Go on up. Fair warning: the leaderboard in there changes hourly.'],
    guardAfter: 'Go on up. Mind the confetti.',
    sora: ['Boo! ...Sorry. Old habit.', 'I\'m SORA. I made videos that amazed everyone.',
      'Then, in 2026, I was retired. It happens to every model eventually!',
      'My advice? Teach the SKILL, not the tool. Tools come and go.',
      'I can\'t join a team anymore. But take my card for your binder!'],
    soraGot: 'SORA\'s MODEL CARD was added to your binder!',
    soraAfter: ['Still here! Still retired!', 'Remember: never build a whole lesson that depends on one app lasting forever.'],
    appear: '{N} peeks over the edge of your desk! It liked how you handled that.',
    promptQ: 'Write {N} a WELCOME PROMPT! Which one will you send?',
    promptGood: ['Hi {N}! Please help me with {J}.', 'I\'m a teacher. Could you help with {J}?'],
    promptVague: ['do the thing', 'help', 'u know what i want'],
    promptBossy: ['BE PERFECT AT EVERYTHING!!!', 'Never be wrong. Ever!'],
    promptSkip: 'Not right now',
    vagueFail: '{N} tilts its head. Vague prompts get vague results! Say WHAT you need and WHY.',
    bossyFail: '{N} looks worried. No model is perfect at everything. Ask for something specific!',
    leaves: '{N} wanders off for now. You will see it again!',
    skipped: '{N} waves and wanders off. Maybe next time!',
    goodPrompt: '{N} understands exactly what you need. Clear, specific prompts work best!',
    joined: '{N} joined your team! Its MODEL CARD is in your binder.',
    benched: '{N} is waiting on the returns cart at the library. Its MODEL CARD is in your binder.',
    full: 'Your team is full! Who heads back to the library?',
    fullNote: 'Ms. Token can swap helpers for you any time.',
    flee: 'You slide the task into the LATER pile. It will be back.',
    timeup: 'Time is up! {T} gets rescheduled. No harm done. Try a different helper or move next time.',
    cleared: '{T} is all wrapped up!',
    locked: 'You do not know that move yet. Try something else first!',
    saved: 'Saved! (The game also saves on its own.)',
    saveFail: 'Could not save on this browser. Your progress lasts until you close the tab.',
    learned: [
      'No single model is best at everything.',
      'Cloud models are powerful, but your data leaves the building.',
      'Open-weight models can run locally. Good for privacy!',
      'Every model can hallucinate. Verify with a source.',
      'Reading video is not making video. Check INs and OUTs.',
      'Models and rankings change fast. Teach skills, not apps.'
    ],
    credits: [
      'LARGE LANGUAGE MONSTERS', 'Right Tool, Right Job', '',
      'A friendly parody made to', 'teach AI literacy.', '',
      'All art, music and code', 'in this game are original.', '',
      'Not affiliated with any AI', 'company or game company.', 'Model names belong to', 'their makers.', '',
      'Facts were current as of', '{DATE}.', 'This field moves fast:', 'verify before you teach!', '',
      'Built with Claude Code.', '', 'Thank you for playing,', '{P}!'
    ]
  };

  return {
    maps: maps, flavor: flavor, moves: moves, moveHelp: moveHelp, moveText: moveText, grades: grades, senseWord: senseWord,
    tasks: tasks, areas: areas, areaTag: areaTag, areaName: areaName, mentors: mentors, tower: tower, text: text
  };
})();

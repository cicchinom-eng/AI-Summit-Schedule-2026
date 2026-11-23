export const PODCAST_TRANSCRIPTS: string[] = [
  // Episode 1 — Your Newest Superpower
  `I want to tell you about a physics teacher.

She teaches in a mid-sized district in New Jersey. Good school. Decent budget. And every year, she runs into the same problem. She needs a simulation. Something her students can play with — adjust the angle of a ramp, change the mass of a ball, watch what happens to the velocity. The kind of thing that makes Newton's second law go from words on a whiteboard to something a sixteen-year-old can actually feel.

She's looked for this tool. She's Googled it. She's browsed those sprawling educational software catalogs that look like they were designed in 2008 — because they were. And the tools she finds are either too expensive, too clunky, or too locked down. They don't do quite what she needs. Close, but not right.

So every year, she puts in a request. She emails the tech department. She fills out the form. And then she waits. And waits. And sometime around April, someone tells her they'll look into it over the summer.

This year, she built it herself.

In an afternoon.

She sat down with Claude — that's an AI from a company called Anthropic — and she described what she wanted. Not in code. In English. She said, "I need an interactive physics simulation where students can adjust the mass of an object and the angle of an inclined plane, and watch how the acceleration changes in real time. It should show force vectors. It should have a graph that updates as they drag the sliders."

And Claude wrote the code. All of it. HTML, CSS, JavaScript. She previewed it right there in her browser. She tweaked a few things — "make the sliders bigger, add a reset button, change the colors so it matches my class website" — and ten minutes later, she had a working, interactive physics simulation that did exactly what she needed.

She published it on Google Sites. Free. Her students used it the next day.

Now. I need you to understand what just happened, because it's easy to hear that story and think, Oh, neat, a teacher used AI to save some time. That's not what happened. What happened is that the person closest to the problem — the person who actually understands what a sixteen-year-old needs to learn Newton's second law — that person, for the first time in the history of educational technology, was also the person who could build the solution.

No ticket. No vendor. No committee. No budget line item.

They call this "vibe coding." I know — it's a ridiculous name. But the name doesn't matter. What matters is the idea: you describe what you want in plain language, and AI writes the code. You don't need to know what JavaScript is. You don't need to understand what a function does. You just need to know what your students need.

And it turns out teachers are really good at knowing what their students need.

Here's what I find fascinating about this. For decades, we've had this awkward dance in schools between the people who understand teaching and the people who understand technology. The teacher knows the problem. The developer knows the tools. And somewhere in the middle — in the email chain, in the feature request, in the committee meeting — the original insight gets lost. The tool that ships is never quite right. It solves a version of the problem. A committee's interpretation of the problem. Not the actual problem.

What vibe coding does is collapse that distance to zero.

And it's not just simulations. At the summit today, people were building vocabulary flashcard apps, random student pickers, lab timers, self-checking quizzes, curriculum alignment tools, scheduling conflict checkers, approval workflows, data dashboards. Things that would have required a developer six months ago. Things that are now a conversation.

One administrator built a tool that checks for PII — personally identifiable information — in documents before they get shared. It runs entirely offline, on the user's own device. No data ever leaves the building. She built it because she needed it, and nobody was going to build it for her.

Now, I want to be careful here, because I don't want to oversell this. Vibe coding is not magic. The code AI writes isn't always perfect. Sometimes it breaks. Sometimes you have to go back and forth five or six times before the tool does what you actually want. And if you're building something truly complex — a full application with user accounts and a database — you're going to need more sophisticated tools.

That's where the deeper end of the pool comes in. Some educators at the summit are using VS Code — that's a professional code editor — paired with something called Claude Code, which is basically an AI that sits inside the editor and writes alongside you. They're deploying to Vercel, which puts your app live on the internet with a single click. They're building things that look and feel like the polished apps you download from the App Store.

But here's the thing: you don't have to go that far. The teacher who built the physics simulation? She used the simplest possible approach. She talked to an AI. She copied the code. She pasted it into Google Sites using an HTML embed. Done. That's the floor. And the floor is already extraordinary.

I keep thinking about something a presenter said today. She said, "Stop asking for the tool you need. Start building it." And I think that's the shift. For the first time, the gap between I wish this existed and I made this is not a gap anymore. It's a conversation.

The question isn't whether teachers can code. That question is already obsolete. The question is: what will they build when nothing is stopping them?`,

  // Episode 2 — The Thinking Problem
  `Let me ask you a question. When was the last time you watched a student struggle?

I mean really struggle. Not frustrated. Not shut down. But that particular kind of stuck where you can almost see the gears turning — where they're reaching for an idea they don't have yet, and the reaching itself is the learning.

Cognitive scientists have a name for it. They call it "productive struggle." And it turns out it's one of the most important things that happens in a classroom. Not the right answer. Not the finished product. The struggle. The gap between I don't get it and oh, wait. That's where the neural pathways form. That's where learning actually lives.

And we just handed every student in America a tool that can skip it entirely.

ChatGPT launched in November of 2022. Within three months, it had a hundred million users. Within a year, it was in every school whether schools wanted it there or not. And the first question everyone asked was the wrong one. They asked: How do we stop students from using it?

That was always the wrong question. You cannot stop a hundred million people from using a free tool that's available on every phone. It's like asking how to stop students from using Google in 2005. The ship has sailed. It's not coming back to port.

The right question — the harder question — is this: How do we make sure they keep thinking?

Here's what I mean. A ninth grader has an essay due on The Great Gatsby. She opens ChatGPT. She types, "Write me a five-paragraph essay about the American Dream in The Great Gatsby." And in eight seconds, she has an essay. It's grammatically correct. It's structured. It makes reasonable points. And she learned absolutely nothing. The productive struggle — the part where she had to decide what she actually thinks about Gatsby, the part where she had to organize her thoughts, the part where she had to wrestle with an argument that didn't quite work and figure out why — all of that just vanished.

That's the thinking problem.

But here's where it gets interesting. Because the same tool that can skip the thinking can also intensify it. And the difference has nothing to do with blocking or restricting. It has to do with design.

Think about productive struggle for a second. Where does it actually live? We tend to think it lives in the big, obvious places — solving the equation, writing the essay, building the project. But it's hiding everywhere. It's in the brainstorm. It's in the outline. It's in the moment a student stares at a blank page and has to decide, out of everything in the world, what they want to say.

That moment — the blank page moment — is cognitively enormous. It's identity work. It's taste. It's agency. And when a student types "give me five project ideas about climate change" into a chatbot, all of that vanishes. They didn't choose. They selected. There's a difference.

Or take outlining. Outlining sounds mechanical — Roman numerals, sub-points, indent, done. But outlining is actually where a student learns to structure thought. It's where they discover that their third point is actually their first point, and that two of their examples are saying the same thing, and that their conclusion doesn't follow from their argument. That mess — that confusion, that rearranging — that's the learning. That's where they internalize what an argument is.

So the first question a teacher should ask isn't "Can my students use AI on this assignment?" It's: Where is the productive struggle hiding in this task? Which of these twenty small cognitive acts is the actual learning?

That's the harder question. And the more important one.

But here's where it flips. Because once you've identified where the struggle is, AI becomes a tool for creating more of it — not less.

Imagine a student writes a first draft of an argument. It's rough. It has holes. That's fine — that's the point. Now, instead of turning it in and waiting three days for teacher feedback, she pastes it into an AI and says, "Challenge this argument. Where are the weak points? What's the strongest counterargument?" And the AI pushes back. It finds the gap in her reasoning. It asks the question she didn't think of.

She hasn't outsourced the thinking. She's been forced into more of it. The AI didn't write her argument. It stress-tested it. And now she has to go back and make it better — which is the hardest, most valuable kind of cognitive work there is.

Or think about a math student who's solved a problem but isn't sure if her approach is right. She asks the AI, "Don't tell me the answer. Tell me if my method makes sense." That's a fundamentally different interaction than "solve this for me." She's using the tool to stay inside the struggle, not to escape it.

This is the shift that the best educators are making right now. They're not asking "how do we keep AI out?" They're asking "how do we use AI to make the thinking harder?"

Ask a chatbot to generate five counterarguments to a student's thesis — and then make the student defeat them, one by one. Use AI to generate a flawed essay on the same topic — and have students find the errors, the weak evidence, the logical fallacies. Have the AI roleplay as a skeptical audience that keeps asking "But why?" until the student's reasoning is bulletproof.

In each of these cases, AI isn't replacing the struggle. It's engineering it. It's creating the resistance that makes the thinking muscle grow. The teacher used to be the only source of that resistance. Now she has a tireless sparring partner she can deploy to every student at the same time.

But there's a deeper issue here that I think is worth raising. Because all of this works for assignments. For products — essays, projects, problem sets. But what about the thinking that happens between assignments? What about the student who, instead of wondering about something and sitting with the wonder for a while, just asks ChatGPT? What about the slow erosion of curiosity that happens when every question has an instant answer?

That's harder to design for. You can't engineer productive struggle around curiosity.

But you can model something. You can model what it looks like to not know. To be comfortable with uncertainty. To say, in front of your students, "I don't know the answer to that. Let's think about it for a minute before we look it up." That's a pedagogical move. And it might be the most important one we have left.

Because the technology isn't going to slow down. The models are going to get better. The answers are going to get faster. The only thing that keeps human thinking alive in the classroom is a human who insists on it.

There's a phrase I heard today that I haven't been able to shake. Someone said it almost in passing, but it stuck with me: "Brain first, bot second."

Four words. And I think they might be the whole philosophy.

Use your brain first. Then use the bot. Not because the bot is bad. Because the brain needs to go first, or it won't go at all. And when the bot shows up second — as the challenger, the stress-tester, the sparring partner — the brain gets stronger.

That's not a restriction. That's a superpower.`,

  // Episode 3 — Six Assistants and a Cup of Coffee
  `Picture this. It's 6:47 in the morning. You haven't had coffee yet. You open your laptop, and there's an email waiting for you. It's from your Chief of Staff.

Your Chief of Staff is not a person.

Your Chief of Staff is an AI agent that ran at 5:30 AM, while you were sleeping. It checked your calendar for the day. It flagged two scheduling conflicts. It pulled the agenda for your 9 o'clock meeting and drafted three bullet points you'll want to raise. It noticed that a parent email from last Thursday is still unanswered and suggested a response. It cross-referenced your to-do list with your calendar and determined that you have a 45-minute window at 2:15 to work on the budget proposal that's due Friday.

All of this happened before you woke up.

This is not science fiction. This is what an educational leader demonstrated today at the summit. He calls it his "agent cabinet." It's a team of AI agents — six of them — each with a name, a role, and a set of instructions. There's a Chief of Staff. A research analyst. A communications director. A project manager. Each one is essentially a custom AI assistant with a specific job description.

And here's the part that changes everything: they run on a schedule. Not when you remember to open a chatbot. Not when you think to ask. They run automatically, every weekday morning, and the results land in your inbox like a briefing from a team you hired but never have to manage.

Now, let's slow down, because I realize this might sound a little... much. Six AI agents? Running on a schedule? For a school administrator? Isn't that overkill?

Let me ask you this. How many emails did you send this week that were basically the same email you sent last month, with slightly different dates? How many times did you stare at a spreadsheet trying to remember what the data was supposed to tell you? How many meetings did you walk into without having had time to prepare?

That's what agents fix. Not the important work. The everything else. The substrate. The logistics. The stuff that fills your day but doesn't actually require you.

Google is moving in this direction too. If you've been using Gemini, you might have heard of Gems — custom AI assistants you could build inside Gemini. Those are being replaced by something called Skills. And Skills are more interesting than Gems were, because Skills can be scheduled. They can run at a specific time. They can be embedded into Flows — which means they can live inside Gmail, responding to triggers, processing information, drafting responses. Not as a separate app you have to remember to open. As part of the work you're already doing.

Think about what that means for a building principal.

A Skill that runs every Monday morning, pulls the week's attendance data, and flags students whose absences have increased over the past three weeks. Not a dashboard you have to log into. An email that arrives with three names and a one-sentence explanation for each.

A Skill that monitors incoming parent emails and drafts suggested responses for the ones that follow predictable patterns — "My child will be absent," "Can you send home the homework," "I'd like to schedule a conference." The principal reviews, edits if needed, and sends. What used to take twenty minutes now takes two.

A Skill that takes the notes from last week's department meeting, compares them to the notes from the previous three meetings, and generates a summary of which action items are still open. Not because the principal can't do that. Because the principal doesn't have time to do that.

But here's where I want to get serious for a moment. Because agents aren't just about saving time. They're about something more fundamental. They're about what happens to a leader's attention when the logistical noise goes quiet.

I talked to a curriculum director today who told me she used to spend the first two hours of every morning on email and scheduling. Two hours. That's the freshest, sharpest part of her day — the part where she has the most cognitive bandwidth — and she was spending it on logistics. Now she has an agent that handles the first pass. She still reviews everything. She still makes the decisions. But the drafting, the organizing, the cross-referencing — that's done before she arrives.

And so she spends those two hours in classrooms. Watching teaching. Having conversations. Doing the work that actually requires a human being.

That's not a time-saving story. That's a role transformation story.

One more thing. And this is important.

There's a version of this that goes wrong. The version where you hand everything to the agents and stop checking. The version where the email goes out with your name on it but you never actually read it. The version where the data summary says everything's fine, and you believe it because you didn't look at the underlying numbers.

The people doing this well — the ones I saw today — have a phrase for it. They say the agent proposes. The human decides. The agent drafts. The human sends. The agent flags. The human acts.

That's the move.

Because the point of having six assistants isn't to stop paying attention. It's to finally have time to pay attention to the things that matter.`,

  // Episode 4 — Carpe Datum
  `I'm going to say something that might make a few tech directors uncomfortable.

The most important AI decision your district will make this year has nothing to do with which chatbot to license. It's not about whether you pick ChatGPT or Gemini or Claude. It's not about prompt engineering workshops or AI policy documents or any of the things that fill conference agendas.

It's about where the data lives.

Let me explain. Every school district in America is sitting on an enormous amount of data. Test scores. Report cards. Attendance records. Disciplinary referrals. IEP documentation. Survey results. Progress monitoring data. Grade distributions by teacher, by subject, by quarter, going back years. It's all there. And almost nobody is using it.

Not because they don't want to. Because the tools haven't been there. Because analyzing that data used to require a statistician, or at minimum someone comfortable with pivot tables and regression formulas. And most districts don't have that person. Or they have one person, and that person has forty-seven other responsibilities.

So the data sits. In spreadsheets nobody opens. In reports nobody reads past page two. In dashboards that were exciting for a week and then became wallpaper.

Here's what's changing.

There's a tool from Google that some districts are starting to use for exactly this. It used to be called NotebookLM — Google has since renamed it Gemini Notebook. And it does something genuinely new. You upload your documents — your data, your reports, your spreadsheets — and it reads them. All of them. And then you just... ask questions. In plain English.

"Which students showed declining attendance in the last quarter?" "What are the common characteristics of students who improved in math this year?" "Compare our reading scores to last year and tell me where the biggest drops are." "What story does this data tell?"

And it answers. With citations. Pointing back to the specific documents and cells where it found the information.

Now, to be clear: when you use Gemini Notebook, your data is going to Google's servers. Some districts are comfortable with that — especially Google Workspace schools that already have data processing agreements in place. Others aren't. And that's a legitimate conversation to have, because school data isn't just data. It's student data. It's protected by FERPA. It includes personally identifiable information — names, grades, behavior records, disability classifications. You cannot — legally, ethically — paste that into just any chatbot. And yet the temptation is enormous, because the AI is right there, and the data is right there, and the question you need answered is burning a hole in your afternoon.

So the question becomes: how do you get the power of AI analysis while managing the risk of data exposure?

And there are, right now, three approaches worth knowing about.

The first is managed cloud tools — Gemini Notebook, Gemini in Google Sheets — where the analysis happens inside a platform your district already has a relationship with. Some districts are comfortable with this. They've reviewed the terms, they've signed the agreements, and they've decided the tradeoff works. This is the easiest path. You upload the spreadsheet. You ask the question. You get the answer. But you need to know what you've agreed to.

The second is what I'd call the vibe-coded dashboard approach. And this one is clever. Instead of uploading your data to an AI, you use AI to build a tool that runs entirely in your own browser. You describe the dashboard you want — "I need a tool where I can upload a CSV of student test scores and see a histogram of score distributions, with the ability to filter by teacher and by quarter." AI writes the code. You host it on your own server, or even just open it as a local file. The data never touches the internet. It goes from your spreadsheet, into your browser, onto your screen. That's it. The AI was involved in building the tool, not in seeing the data.

That distinction is worth pausing on. The AI builds the instrument. The AI never sees the patient.

The third approach is local AI. And this one is for the districts that want to go all in. Some schools are now running large language models on their own hardware — Apple Silicon servers, GPU clusters, machines that sit in a closet in the server room. The AI runs entirely on campus. No internet connection required. No third-party servers. No data leaves the building, ever. It's expensive to set up. It requires technical expertise. But for districts that handle sensitive data at scale — special education records, disciplinary files, personnel evaluations — it's the gold standard for privacy.

I realize this episode might sound like it's for tech directors. And partly, it is. But here's why it matters for everyone.

If you're a teacher, the data question affects you because you are the one who needs the insights. You're the one staring at a stack of formative assessment results wondering which three students need a different approach tomorrow. The right data tool, with the right privacy architecture, turns that from a two-hour task into a two-minute conversation.

If you're a principal, the data question affects you because every hard decision you make — about scheduling, about staffing, about intervention — is better when it's grounded in evidence instead of intuition. And right now, the evidence is locked inside a spreadsheet you don't have time to analyze.

And if you're a superintendent, the data question affects you because the board is going to ask. The parents are going to ask. The community is going to ask: Is our students' data safe? And your answer needs to be more specific than "yes." It needs to be: Here's the architecture. Here's where the data lives. Here's who can see it. Here's who can't.

Privacy isn't the enemy of insight. That's the thing people get wrong. They think there's a tradeoff — that you can have powerful AI analysis or you can have strong data protection, but not both. That's a false choice. The tools exist right now, today, to do both. The question is whether your district knows about them.

Seize the data. But know where it sleeps.`,

  // Episode 5 — Creativity in the Age of AI
  `Here's something I've been turning over in my head all day.

There's a question that keeps coming up whenever AI enters a conversation about creativity. And the question is this: if a machine can paint, compose, write, and edit video — what's left for the human? If AI can generate a song in fifteen seconds, why would a student spend fifteen weeks learning to play the guitar?

It's a reasonable question. And I think the answer is hiding in a place nobody's looking.

Think about what a teacher actually does when she creates a lesson. She doesn't sit down and produce content from nothing. She makes decisions. What's the right example for this group of kids? What order should the ideas go in? Where do I slow down? Where do I speed up? What's the hook that gets a bored fourteen-year-old to lean forward instead of checking out?

Those are creative decisions. Every one of them. And none of them require the ability to draw, compose, or code. They require taste. Judgment. An understanding of your audience. The ability to look at something and say, That's not quite right, and know how to fix it.

What AI does is strip away the production layer — the formatting, the rendering, the grunt work — and leave those decisions exposed. Front and center. The teacher who used to spend three hours making a worksheet look presentable can now spend those three hours thinking about whether the worksheet is even the right approach.

That's not less creativity. That's more.

Let me give you a few examples of what this looks like in practice.

There's a tool called Suno. It's an AI music generator. You type in a description — "upbeat country song about the water cycle, appropriate for fourth graders, with a catchy chorus" — and it generates a full song. Vocals, instruments, production. It sounds like something you'd hear on the radio. And it takes about fifteen seconds.

Now, you could look at that and say: Well, that's the end of music in schools.

Or you could do what some teachers are doing. Use Suno to generate five different songs about the same topic — in five different genres. A country version. A hip-hop version. A Broadway number. A punk rock anthem. A lullaby. And then play all five for your students and ask: Which one works? Which one makes you remember the content? Why? What does the genre do to the message?

That's not a lesson about AI. That's a lesson about rhetoric, about audience, about the relationship between form and content. It's a music lesson and a media literacy lesson all at once. And it was only possible because the AI removed the bottleneck. The bottleneck used to be: I can't compose five songs in five different genres. Nobody can. It would take weeks. So you'd never try. The question would never get asked.

AI didn't replace the creativity. It removed the obstacle that was preventing it.

This pattern keeps showing up.

Google Vids lets you take a Google Doc or a set of slides and turn it into a narrated, visually polished instructional video in a few minutes. Not a screen recording where you can hear the HVAC system in the background. A real video, with transitions, with pacing, with text overlays that actually look professional.

A cynical reading: AI made the video, so it's not creative. But that misses the point entirely. The teacher still decided what to teach. She still chose the structure, the examples, the pacing of the ideas. What she didn't have to do was spend three hours fighting with video editing software. The creative decisions were hers. The production labor was the machine's.

That's the trade. That's the deal AI offers. I'll handle the formatting. You handle the thinking.

Adobe Express is opening up similar possibilities in visual arts. There's a feature called Animate Character — a student draws something, or uploads an image, and the AI animates it. It moves. It talks. A kid can draw a wobbly stick figure with a purple hat, and suddenly that stick figure is narrating a book report. Is the animation sophisticated? No. But it doesn't need to be. What it needs to be is theirs. Their character. Their story. Their creative vision — amplified by a tool that handles the parts they can't do yet.

And that's the word I keep coming back to. Yet.

A third grader can't animate a character by hand. Yet. A seventh grader can't compose a song in five genres. Yet. A high school student can't produce a documentary-quality video. Yet. But with AI handling the production layer, they can experience what it feels like to create at that level. They can make the creative decisions — the real ones — and see them come to life. And that experience, that feeling of I made this and it's real, is the thing that makes someone want to learn the deeper skills.

AI doesn't replace the ladder. It lets you see the view from the top, so you're motivated to climb.

Here's what I think we're really talking about when we talk about creativity in the age of AI.

For a long time, creative work in schools was gated by technical skill. You needed to draw to make art. You needed to play an instrument to make music. You needed to code to make interactive media. And those gates kept a lot of people out — students and teachers. Plenty of educators have extraordinary taste, beautiful ideas, a deep sense of what would resonate with their students. But they couldn't execute. They didn't have the production skills. So the ideas stayed in their heads.

AI is removing the gates. Not the creativity. The gates.

And what's flowing through? Teachers who would never call themselves creative are making comics, songs, interactive timelines, animated characters. They're not creative because they can draw. They're creative because they can see — they can envision what a student needs to experience, and now, for the first time, they can actually make it real.

Vision. Taste. Judgment. The willingness to look at the first draft and say, "No, not that — more like this."

Those are the creative skills that matter now. And they always were. We just couldn't see them, because the production skills were in the way.

Creativity in the age of AI isn't smaller. It's wider. It belongs to more people. And it might be the most exciting shift happening in schools right now.`,
];

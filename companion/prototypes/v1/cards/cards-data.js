// Prototype v1, third build ("the card build") — the CARD LAYER.
//
// This file is an ATTRIBUTE OVERLAY, not a fork. The single source of truth
// for the 53 information blocks stays ../team-a/v1-data.js, loaded by
// reference exactly as the semantic build loads it. This file adds three new
// attributes per block, keyed by block id, and the card template renders
// them. Remove this file and the build degrades to the semantic build's
// lists; nothing here re-states a name, a url, a filing, or a moment.
//
//   sit   The situation lead: the moment a teacher reaches for this skill,
//         in teacher words. This extends the tree test's D4 move (five
//         harvested situation labels) to all 53 blocks. THE FIVE D4 LABELS
//         ARE REUSED VERBATIM — they were justified from participant
//         wording and stay authoritative. The other 48 are authored from
//         the instructor's ear, the same provenance as the semantic build's
//         21 situation sentences, and carry the same caveat (see the
//         revision notes, "what we are ignoring").
//
//   first The first move: the smallest concrete thing a teacher could
//         actually do with this skill, one imperative sentence. Authored.
//
//   prep  "none" | "ahead". DERIVED, not authored: read off the manual's
//         own verb for the skill. create / prepare / plan / study / send /
//         use-the-document / develop => "ahead" (you do something before
//         Sunday or during the week); ask / listen / respond / invite /
//         testify / observe / communicate => "none" (usable live, mid-
//         lesson, with nothing in your hands).
//
// The card template treats a missing entry as render-what-you-have, so this
// overlay can never break a block that gains or loses an id upstream.
window.V1_CARDS = {
  builtFor: "CS 356 Project 1 — prototype v1, third build (instructor revision)",
  revisionOf: "prototypes/v1/semantic/ (which revises prototypes/v1/team-a/)",

  cards: {
    "004.title_number1": {
      sit: "When your lesson is turning into a school lesson",
      first: "Pick tonight’s principle and ask, “When did the Savior live this?”",
      prep: "none" },
    "004.title_number2": {
      sit: "When you want them to see Him, not just hear about Him",
      first: "Choose one picture of Christ and plan the one question you will ask about it.",
      prep: "ahead" },
    "005.p16": {
      sit: "When you want the scriptures to show them who He is",
      first: "Write one question that sends them hunting a title of Christ in the passage.",
      prep: "ahead" },
    "005.title_number17": {
      sit: "When you want them to see what He can be in their lives",
      first: "Ask: “Which of these roles do you need Him to fill this week?”",
      prep: "none" },
    "006.title_number1": {
      sit: "When a symbol is sitting in the passage waiting to be found",
      first: "Point at the bread, the water, the lamb — ask what it says about Him.",
      prep: "none" },
    "006.title_number2": {
      // sit = the D4 situation label, verbatim (tree test, Team A report).
      sit: "Let them handle something that points to Christ",
      first: "Bring the object itself — oil, a stone, a seed — and let it go around the room.",
      prep: "ahead" },
    "007.title_number1": {
      sit: "When the lesson names a truth but not the Lord behind it",
      first: "Rephrase your next question to include Him: “Where is the Lord’s mercy in this verse?”",
      prep: "none" },
    "007.title_number2": {
      sit: "When you want them to spot His hand in their own lives",
      first: "Invite them to name one moment this month they would now call His hand.",
      prep: "none" },
    "008.title_number1": {
      sit: "When somebody in the room needs to hear that God loves them",
      first: "Say it plainly, by name: “God knows you, and He loves you.”",
      prep: "none" },
    "008.title_number2": {
      sit: "When His love is in the passage and nobody has noticed",
      first: "Ask: “Where do you see the Father’s love in these verses?”",
      prep: "none" },
    "009.title_number1": {
      sit: "When you catch a kid quietly being like Him",
      first: "Tell one student, this week, the Christlike thing you saw them do.",
      prep: "none" },
    "009.title_number2": {
      sit: "When you want the lesson to leave the room with them",
      first: "End class with: “Watch for one chance to do what He did.”",
      prep: "none" },
    "011.title_number1": {
      sit: "When you are struggling to see what God sees in them",
      first: "Read one recent conference talk asking only: how does God see these kids?",
      prep: "ahead" },
    "011.title_number2": {
      sit: "When a student has become “that kid” in your head",
      first: "Pick the student who wears you out and imagine who they are becoming.",
      prep: "none" },
    "012.intro2": {
      sit: "When you realize you don’t actually know them",
      first: "Ask one student what their week really looks like — then remember it.",
      prep: "none" },
    "012.title_number4": {
      sit: "When you want to react less and understand more",
      first: "Before you respond, ask yourself: “What is really going on for them?”",
      prep: "none" },
    "012.title_number3": {
      sit: "When the question they asked isn’t the real question",
      first: "Answer their question with: “Say more about what you mean.”",
      prep: "none" },
    "013.intro2": {
      sit: "When you don’t know what a student needs",
      first: "Tonight, pray with your class list in front of you — and listen.",
      prep: "ahead" },
    "013.intro3": {
      sit: "When you want the class to care about each other",
      first: "Invite someone to pray for a classmate, by name, to open class.",
      prep: "none" },
    "014.intro2": {
      sit: "When a hand goes halfway up and comes back down",
      first: "Catch the half-raised hand: “I want to hear yours.”",
      prep: "none" },
    "014.title_number3": {
      sit: "When somebody thinks class would run fine without them",
      first: "Tell the back row the truth: the class is poorer when they are silent.",
      prep: "none" },
    "015.title_number1": {
      sit: "When a kid did something good and their parents should hear it",
      first: "Text one parent tonight: “Here’s what I noticed about your kid on Sunday.”",
      prep: "ahead" },
    "015.title_number2": {
      sit: "When loving one of them is honestly hard right now",
      first: "Testify of God’s love for them — let His carry yours for a while.",
      prep: "none" },
    "017.title_number1": {
      sit: "When you want a mirror held up to your own teaching",
      first: "Run the personal evaluation once, honestly, before you open the outline.",
      prep: "ahead" },
    "017.title_number2": {
      sit: "When the lesson is ready but you aren’t",
      first: "Ask yourself first: “What do I actually believe about this doctrine?”",
      prep: "ahead" },
    "018.title_number1": {
      sit: "When you’re about to move on and aren’t sure they’re with you",
      first: "Before the next section, ask: “What would you tell someone this means?”",
      prep: "none" },
    "018.title_number2": {
      sit: "When an answer has more behind it than they said",
      first: "Follow their answer with: “What makes you say that?”",
      prep: "none" },
    "019.intro1": {
      sit: "When you want them to see where they actually stand",
      first: "Draft three “I can…” statements and let them rate themselves privately.",
      prep: "ahead" },
    "019.title_number2": {
      sit: "When a song would carry it better than you can",
      first: "Pick one hymn line that says what your lesson says, and ask them to find it.",
      prep: "ahead" },
    "020.intro2": {
      sit: "When your first instinct is to just answer them",
      first: "Count two seconds, then ask: “What do the rest of you think?”",
      prep: "none" },
    "020.title_number3": {
      sit: "When someone can’t tell if it was the Spirit or just them",
      first: "Name the feeling out loud: “That peace you felt — that has a source.”",
      prep: "none" },
    "021.title_number1": {
      sit: "When you want them to put what they feel into words",
      first: "Prompt with: “Finish this sentence — I know for myself that…”",
      prep: "ahead" },
    "021.title_number2": {
      sit: "When it’s been weeks since you testified of Him",
      first: "Testify of Christ this Sunday, in two sentences, unannounced.",
      prep: "none" },
    "023.title_number1": {
      // sit = the D4 situation label, verbatim.
      sit: "When you want them to find it themselves",
      first: "Swap “Does anyone know…” for “What do you find in verse 3?”",
      prep: "ahead" },
    "023.title_number2": {
      sit: "When your own understanding is running on empty",
      first: "Take one verse from Sunday’s block and chase it through the Topical Guide.",
      prep: "ahead" },
    "024.title_number1": {
      sit: "When the scriptures and the prophets are saying the same thing",
      first: "Pair one verse with one conference quote and ask what they share.",
      prep: "ahead" },
    "024.title_number2": {
      sit: "When the prophet’s words deserve more than a read-through",
      first: "Before quoting the prophet, tell the class why you trust him.",
      prep: "none" },
    "025.intro2": {
      sit: "When you don’t know what they can do with the scriptures yet",
      first: "Ask them to mark the verse they would struggle to explain — start there.",
      prep: "ahead" },
    "025.title_number3": {
      sit: "When you’re not sure the story earns its minutes",
      first: "Ask of every story: “What truth does it teach, and how long does it take?”",
      prep: "ahead" },
    "026.intro2": {
      // sit = the D4 situation label, verbatim.
      sit: "When you want them to say the principle out loud",
      first: "Ask: “What principle would you write on the board from this?”",
      prep: "none" },
    "026.title_number3": {
      // sit = the D4 situation label, verbatim.
      sit: "When you do not know the answer",
      first: "Say “I don’t know — let’s find out,” and write the question down.",
      prep: "none" },
    "027.title_number1": {
      sit: "When the chapter feels far away from their lives",
      first: "Prepare one prompt that starts with their week, not the chapter.",
      prep: "ahead" },
    "027.title_number2": {
      sit: "When you need them leaning in from the first minute",
      first: "Open with: “Think of a time this week you needed patience” — then teach.",
      prep: "none" },
    "029.title_number1": {
      sit: "When you keep answering every comment yourself",
      first: "After the next comment, look at the class, not the commenter.",
      prep: "none" },
    "029.title_number2": {
      sit: "When you’re doing all the work in the room",
      first: "Hand something over on Sunday: the reading, the board, the summary.",
      prep: "none" },
    "030.intro2": {
      sit: "When you want scripture study to become theirs, daily",
      first: "Give the last five minutes to writing one small daily goal.",
      prep: "none" },
    "030.title_number3": {
      // sit = the D4 situation label, verbatim.
      sit: "When you want their home study in the room",
      first: "Open with: “What did you find in your own reading this week?”",
      prep: "ahead" },
    "031.title_number1": {
      sit: "When you want next week’s lesson to start this week",
      first: "Close with one specific thing to look for before next Sunday.",
      prep: "ahead" },
    "031.title_number2": {
      sit: "When you want the opening minute already working for you",
      first: "Write next week’s opening invitation the moment this lesson ends.",
      prep: "ahead" },
    "032.intro2": {
      sit: "When the gospel talk shouldn’t end at the classroom door",
      first: "Challenge them: start one gospel conversation before Friday.",
      prep: "none" },
    "032.title_number3": {
      sit: "When they’d learn more saying it to each other",
      first: "Two minutes, in pairs: “Tell each other the one thing you’re taking home.”",
      prep: "ahead" },
    "033.title_number1": {
      sit: "When last week’s invitation deserves a next chapter",
      first: "Start Sunday with: “Who tried it? What happened?”",
      prep: "ahead" },
    "033.title_number2": {
      sit: "When you want them searching for who God really is",
      first: "Ask: “Who is God in this passage — and what is He offering you?”",
      prep: "none" }
  },

  // Display names for the prep attribute, in teacher words.
  prepNames: {
    none:  "No prep — use it live",
    ahead: "Takes getting ready"
  }
};

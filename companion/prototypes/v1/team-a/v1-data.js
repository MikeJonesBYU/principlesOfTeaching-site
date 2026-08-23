// Team A — prototype v1 single source. CS 356 Project 1, November 2026.
// One record per information block (one skill). Every view in this prototype —
// both hierarchies and the search results — is produced by selecting on these
// attributes. No block is written into the HTML or into app.js.
//
// name and url stay verbatim from the live site's assets/lang/eng/skills-data.js.
// Everything else is ours.
//
// -------------------------------------------------------------------------
// What changed since the wireframe (all six decisions from our tree test):
//
//   D1  New top-level branch "What it feels like", marked trial: true. It
//       holds one block, cross-listed from Bearing witness in class. The
//       label is what the next study has to judge, so the UI says so.
//   D2  category is no longer one value. Each block carries filings[], a list
//       of {category, group}. 006.title_number2 is filed twice — Something
//       they do, not watch AND Finding Him in the scriptures.
//   D3  Group renames: "Getting yourself ready" gains the subtitle "you,
//       before Sunday"; "Planning the lesson" becomes "Planning what happens
//       in class". Slugs are unchanged — a slug is an address, not a label.
//   D4  New optional label field: the situation a block is for, in teacher
//       words. Five blocks have one. Lists and search results show the label;
//       the block page still leads with the verbatim manual sentence.
//   D5  The five original L1 categories are untouched.
//   D6  moment is untouched on every block, and the by-moment view with it.
//
// Filings and concept targets reference categories, groups and moments by
// slug/key, never by display name, so a rename is a display change only.
// -------------------------------------------------------------------------
window.V1_DATA = {
  builtFor: "CS 356 Project 1 — prototype v1 turn-in (Team A)",
  source: "53-skill inventory, Teacher Development Skills manual",
  revisionOf: "prototypes/wireframe/team-a/wireframe-data.js",

  // L1 of the category view, in the order of our revised hierarchy.
  categories: [
    { slug: "christ",    name: "Teaching about Jesus Christ" },
    { slug: "attention", name: "Keeping their attention" },
    { slug: "love",      name: "Knowing and loving the people you teach" },
    { slug: "prep",      name: "Getting ready before Sunday" },
    { slug: "talk",      name: "Getting people to talk" },
    { slug: "feels",     name: "What it feels like",
      trial: true,
      // It has no entry in groups[] below, so it files its one block directly:
      // no L2 to walk. The views read that off the data rather than a flag.
      trialNote: "This label is what our next study has to test, not a settled answer. It holds one block, cross-listed from Bearing witness in class, and it goes if it does not earn its place." }
  ],

  // L2 of the category view. "What it feels like" has none, on purpose.
  groups: [
    { slug: "about-their-own-life",         category: "christ",    name: "Making it about their own life" },
    { slug: "finding-him-in-the-scriptures",category: "christ",    name: "Finding Him in the scriptures" },
    { slug: "bearing-witness-in-class",     category: "christ",    name: "Bearing witness in class" },
    { slug: "what-the-prophets-say",        category: "christ",    name: "What the prophets say" },
    { slug: "see-or-hear",                  category: "attention", name: "Something they can see or hear" },
    { slug: "do-not-watch",                 category: "attention", name: "Something they do, not watch" },
    { slug: "safe-to-speak-up",             category: "love",      name: "Making the room safe to speak up" },
    { slug: "getting-to-know-them",         category: "love",      name: "Getting to know them" },
    { slug: "during-the-week",              category: "love",      name: "Caring about them during the week" },
    { slug: "getting-yourself-ready",       category: "prep",      name: "Getting yourself ready", subtitle: "you, before Sunday" },
    { slug: "planning-the-lesson",          category: "prep",      name: "Planning what happens in class" },
    { slug: "invitations-they-take-home",   category: "prep",      name: "Invitations they take home" },
    { slug: "not-answering-it-yourself",    category: "talk",      name: "Not answering it yourself" },
    { slug: "talking-to-each-other",        category: "talk",      name: "Getting them talking to each other" },
    { slug: "asking-for-a-real-answer",     category: "talk",      name: "Asking so you get a real answer" }
  ],

  // The second view. Not a category — an attribute every block carries. D6.
  moments: [
    { key: "opening", name: "The first few minutes", blurb: "You are starting the lesson." },
    { key: "during",  name: "In the middle of the lesson", blurb: "You are in the thick of it." },
    { key: "closing", name: "The last few minutes", blurb: "You are landing it and sending them out." },
    { key: "after",   name: "After class and during the week", blurb: "Sunday is over, or next Sunday is coming." }
  ],

  // The 53 information blocks.
  skills: [
    { id: "004.title_number1",
      name: "Help students connect what they are learning with how Christ exemplifies the principle.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/004-emphasize-the-example-of-jesus-christ?lang=eng#title_number1",
      filings: [{ category: "christ", group: "about-their-own-life" }],
      moment: ["during"] },
    { id: "004.title_number2",
      name: "Use pictures and videos of Jesus Christ to illustrate a gospel principle.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/004-emphasize-the-example-of-jesus-christ?lang=eng#title_number2",
      filings: [{ category: "attention", group: "see-or-hear" }],
      moment: ["opening", "during"] },
    { id: "005.p16",
      name: "Create search questions to help students identify roles, titles, symbols, attributes, and characteristics of Jesus Christ.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/005-teach-about-titles-roles-attributes?lang=eng#p16",
      filings: [{ category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] },
    { id: "005.title_number17",
      name: "Ask questions that allow students to identify roles Jesus Christ can have in their lives.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/005-teach-about-titles-roles-attributes?lang=eng#title_number17",
      filings: [{ category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] },
    { id: "006.title_number1",
      name: "Ask questions that help students learn about Jesus Christ through symbols in the scriptures.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/006-look-for-symbols-that-testify-of-christ?lang=eng#title_number1",
      filings: [{ category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] },
    { id: "006.title_number2",
      name: "Help students have a sensory experience with scriptural objects that symbolize Jesus Christ.",
      label: "Let them handle something that points to Christ",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/03-teach-about-jesus-christ/006-look-for-symbols-that-testify-of-christ?lang=eng#title_number2",
      filings: [{ category: "attention", group: "do-not-watch" },
                { category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] },
    { id: "007.title_number1",
      name: "Ask questions that focus on connecting the Lord’s power, mercy, and influence to the truths being taught.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/007-help-learners-recognize-love-power-mercy?lang=eng#title_number1",
      filings: [{ category: "christ", group: "bearing-witness-in-class" }],
      moment: ["during"] },
    { id: "007.title_number2",
      name: "Give invitations that help learners recognize the Lord’s love, power, and mercy in their own experiences.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/007-help-learners-recognize-love-power-mercy?lang=eng#title_number2",
      filings: [{ category: "christ", group: "about-their-own-life" }],
      moment: ["closing"] },
    { id: "008.title_number1",
      name: "Statements that help students know and feel the love of Heavenly Father and Jesus Christ.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/008-help-learners-strengthen-relationship-with-heavenly-father?lang=eng#title_number1",
      filings: [{ category: "christ", group: "bearing-witness-in-class" }],
      moment: ["during", "closing"] },
    { id: "008.title_number2",
      name: "Ask questions that help students find examples of Heavenly Father’s love in the scripture passage.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/008-help-learners-strengthen-relationship-with-heavenly-father?lang=eng#title_number2",
      filings: [{ category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] },
    { id: "009.title_number1",
      name: "Observe Christlike attributes in students and share what you’ve noticed in ways that inspire them to continue to be like Him.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/009-help-learners-strive-to-be-more-like-jesus-christ?lang=eng#title_number1",
      filings: [{ category: "love", group: "safe-to-speak-up" }],
      moment: ["during", "after"] },
    { id: "009.title_number2",
      name: "Invite students to look for ways to follow the example of Jesus Christ in their personal lives.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/04-help-learners-come-unto-jesus-christ/009-help-learners-strive-to-be-more-like-jesus-christ?lang=eng#title_number2",
      filings: [{ category: "christ", group: "about-their-own-life" }],
      moment: ["closing"] },
    { id: "011.title_number1",
      name: "Study recent prophetic messages to understand how Heavenly Father sees young people.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/011-see-learners-the-way-god-sees?lang=eng#title_number1",
      filings: [{ category: "love", group: "getting-to-know-them" }],
      moment: ["after"] },
    { id: "011.title_number2",
      name: "“Think celestial” about your students to help you see them as God does.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/011-see-learners-the-way-god-sees?lang=eng#title_number2",
      filings: [{ category: "love", group: "getting-to-know-them" }],
      moment: ["opening", "after"] },
    { id: "012.intro2",
      name: "Observe and ask about students’ interests.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/012-seek-to-know-them?lang=eng#intro2",
      filings: [{ category: "love", group: "getting-to-know-them" }],
      moment: ["opening", "after"] },
    { id: "012.title_number4",
      name: "Pause, reflect, and answer questions we ask ourselves that invite a Christlike spirit of discernment, love, and empathy in our interactions.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/012-seek-to-know-them?lang=eng#title_number4",
      filings: [{ category: "love", group: "during-the-week" }],
      moment: ["during", "after"] },
    { id: "012.title_number3",
      name: "Seek to clarify and understand the real intent of students’ questions, feelings, and beliefs.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/012-seek-to-know-them?lang=eng#title_number3",
      filings: [{ category: "love", group: "getting-to-know-them" }],
      moment: ["during"] },
    { id: "013.intro2",
      name: "Pray and ask how you can help your students and follow the promptings from the Holy Ghost.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/013-pray-for-them-by-name?lang=eng#intro2",
      filings: [{ category: "love", group: "during-the-week" }],
      moment: ["after"] },
    { id: "013.intro3",
      name: "Invite students to pray for other students.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/013-pray-for-them-by-name?lang=eng#intro3",
      filings: [{ category: "love", group: "safe-to-speak-up" }],
      moment: ["opening", "closing"] },
    { id: "014.intro2",
      name: "Communicate that you value students before they comment or as they raise their hand to comment.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/014-create-a-safe-environment?lang=eng#intro2",
      filings: [{ category: "love", group: "safe-to-speak-up" }],
      moment: ["during"] },
    { id: "014.title_number3",
      name: "Communicate that students are not only welcome but needed.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/014-create-a-safe-environment?lang=eng#title_number3",
      filings: [{ category: "love", group: "safe-to-speak-up" }],
      moment: ["opening", "during"] },
    { id: "015.title_number1",
      name: "Send a message to a student’s parent about something positive you have noticed about their child.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/015-find-appropriate-ways-to-express-love?lang=eng#title_number1",
      filings: [{ category: "love", group: "during-the-week" }],
      moment: ["after"] },
    { id: "015.title_number2",
      name: "Testify of God’s love when it is hard for you to feel or express love to those you teach.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/05-love-those-you-teach/015-find-appropriate-ways-to-express-love?lang=eng#title_number2",
      filings: [{ category: "love", group: "during-the-week" }],
      moment: ["during"] },
    { id: "017.title_number1",
      name: "Use the document “Improving as a Christlike Teacher—A Personal Evaluation” to invite the Holy Ghost to help you refine your preparations to teach.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/017-prepare-yourself-spiritually?lang=eng#title_number1",
      filings: [{ category: "prep", group: "getting-yourself-ready" }],
      moment: ["after"] },
    { id: "017.title_number2",
      name: "Ask questions to assess your own experience and testimony with Jesus Christ and the doctrine and principles in the lesson.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/017-prepare-yourself-spiritually?lang=eng#title_number2",
      filings: [{ category: "prep", group: "getting-yourself-ready" }],
      moment: ["after"] },
    { id: "018.title_number1",
      name: "Ask a question to assess learning before moving on in the lesson.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/018-always-be-ready-to-respond-to-spiritual-promptings?lang=eng#title_number1",
      filings: [{ category: "talk", group: "not-answering-it-yourself" }],
      moment: ["during"] },
    { id: "018.title_number2",
      name: "Listen to and observe students to ask follow-up questions.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/018-always-be-ready-to-respond-to-spiritual-promptings?lang=eng#title_number2",
      filings: [{ category: "talk", group: "not-answering-it-yourself" }],
      moment: ["during"] },
    { id: "019.intro1",
      name: "Create student self-evaluations about a doctrine, truth, or principle.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/019-create-settings-and-opportunities-to-be-taught-by-holy-ghost?lang=eng#intro1",
      filings: [{ category: "prep", group: "planning-the-lesson" }],
      moment: ["during", "after"] },
    { id: "019.title_number2",
      name: "Use sacred music. Invite students to identify lines and phrases in sacred music that connect with the truths they are learning.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/019-create-settings-and-opportunities-to-be-taught-by-holy-ghost?lang=eng#title_number2",
      filings: [{ category: "attention", group: "see-or-hear" }],
      moment: ["opening", "during"] },
    { id: "020.intro2",
      name: "Before responding to a student’s question or comment, pause and think, “What can I ask them?” or “What can I invite them to do?”",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/020-help-learners-seek-recognize-act-on-personal-revelation?lang=eng#intro2",
      filings: [{ category: "talk", group: "not-answering-it-yourself" }],
      moment: ["during"] },
    { id: "020.title_number3",
      name: "Share statements that help students recognize when the Holy Ghost is performing His role or function.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/020-help-learners-seek-recognize-act-on-personal-revelation?lang=eng#title_number3",
      filings: [{ category: "christ", group: "bearing-witness-in-class" },
                { category: "feels", group: null }],
      moment: ["during"] },
    { id: "021.title_number1",
      name: "Create prompts that help students verbalize their feelings, experiences, and testimony.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/021-bear-testimony-often?lang=eng#title_number1",
      filings: [{ category: "talk", group: "talking-to-each-other" }],
      moment: ["during", "closing"] },
    { id: "021.title_number2",
      name: "Testify more frequently and more powerfully of Jesus Christ.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/06-teach-by-the-spirit/021-bear-testimony-often?lang=eng#title_number2",
      filings: [{ category: "christ", group: "bearing-witness-in-class" }],
      moment: ["during", "closing"] },
    { id: "023.title_number1",
      name: "Create open-ended search questions that help learners discover gospel doctrine and principles for themselves and do not lead students to a specific response.",
      label: "When you want them to find it themselves",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/023-learn-the-doctrine-of-jesus-christ?lang=eng#title_number1",
      filings: [{ category: "talk", group: "asking-for-a-real-answer" }],
      moment: ["during"] },
    { id: "023.title_number2",
      name: "Search the scriptures and words of the prophets for deeper understanding.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/023-learn-the-doctrine-of-jesus-christ?lang=eng#title_number2",
      filings: [{ category: "prep", group: "getting-yourself-ready" }],
      moment: ["after"] },
    { id: "024.title_number1",
      name: "Prepare invitations that help students connect truths found in the scriptures to what living prophets are saying.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/024-teach-from-scriptures?lang=eng#title_number1",
      filings: [{ category: "christ", group: "what-the-prophets-say" }],
      moment: ["during"] },
    { id: "024.title_number2",
      name: "Express your love for and testimony of prophets as their words are shared in class.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/024-teach-from-scriptures?lang=eng#title_number2",
      filings: [{ category: "christ", group: "what-the-prophets-say" }],
      moment: ["during"] },
    { id: "025.intro2",
      name: "Create student self-evaluations that help them recognize their current understanding and abilities about scripture study skills.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/025-help-learners-seek-recognize-understand-truths?lang=eng#intro2",
      filings: [{ category: "prep", group: "planning-the-lesson" }],
      moment: ["during", "after"] },
    { id: "025.title_number3",
      name: "Consider assessment questions to carefully choose media, personal stories, and object lessons.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/025-help-learners-seek-recognize-understand-truths?lang=eng#title_number3",
      filings: [{ category: "prep", group: "planning-the-lesson" }],
      moment: ["after"] },
    { id: "026.intro2",
      name: "Ask questions that help students identify and state converting principles.",
      label: "When you want them to say the principle out loud",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/026-focus-on-truths-that-lead-to-conversion?lang=eng#intro2",
      filings: [{ category: "talk", group: "asking-for-a-real-answer" }],
      moment: ["during"] },
    { id: "026.title_number3",
      name: "Respond to questions in a way that avoids speculation and nondoctrinal personal ideas.",
      label: "When you do not know the answer",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/026-focus-on-truths-that-lead-to-conversion?lang=eng#title_number3",
      filings: [{ category: "talk", group: "asking-for-a-real-answer" }],
      moment: ["during"] },
    { id: "027.title_number1",
      name: "Prepare invitations and prompts that help students find personal relevance to a scripture block.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/027-help-learners-find-personal-relevance?lang=eng#title_number1",
      filings: [{ category: "prep", group: "planning-the-lesson" }],
      moment: ["during", "after"] },
    { id: "027.title_number2",
      name: "Start a learning activity by inviting students to ponder a personal circumstance.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/07-teach-the-doctrine/027-help-learners-find-personal-relevance?lang=eng#title_number2",
      filings: [{ category: "attention", group: "do-not-watch" }],
      moment: ["opening"] },
    { id: "029.title_number1",
      name: "Resist the tendency to respond to every comment and question and invite the class to respond.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/029-help-learners-take-responsibility?lang=eng#title_number1",
      filings: [{ category: "talk", group: "not-answering-it-yourself" }],
      moment: ["during"] },
    { id: "029.title_number2",
      name: "Focus on what the learner can do in class that the teacher typically does.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/029-help-learners-take-responsibility?lang=eng#title_number2",
      filings: [{ category: "talk", group: "not-answering-it-yourself" }],
      moment: ["during"] },
    { id: "030.intro2",
      name: "Assist students in creating a daily scripture study goal.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/030-encourage-learners-to-know-the-savior?lang=eng#intro2",
      filings: [{ category: "prep", group: "invitations-they-take-home" }],
      moment: ["closing", "after"] },
    { id: "030.title_number3",
      name: "Develop and ask questions that help learners connect what they have learned in their personal and family scripture study to the classroom experience.",
      label: "When you want their home study in the room",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/030-encourage-learners-to-know-the-savior?lang=eng#title_number3",
      filings: [{ category: "talk", group: "asking-for-a-real-answer" }],
      moment: ["opening", "during"] },
    { id: "031.title_number1",
      name: "Create invitations that help learners prepare for the next learning experience.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/031-invite-learners-to-prepare?lang=eng#title_number1",
      filings: [{ category: "prep", group: "invitations-they-take-home" }],
      moment: ["closing", "after"] },
    { id: "031.title_number2",
      name: "Create a meaningful invitation connected to the lesson outcome to be used at the beginning of each lesson.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/031-invite-learners-to-prepare?lang=eng#title_number2",
      filings: [{ category: "prep", group: "planning-the-lesson" }],
      moment: ["opening"] },
    { id: "032.intro2",
      name: "Help students create or begin gospel conversations.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/032-encourage-learners-to-share-truths?lang=eng#intro2",
      filings: [{ category: "talk", group: "talking-to-each-other" }],
      moment: ["during", "after"] },
    { id: "032.title_number3",
      name: "Prepare invitations for students to share with each other what they are learning.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/032-encourage-learners-to-share-truths?lang=eng#title_number3",
      filings: [{ category: "talk", group: "talking-to-each-other" }],
      moment: ["during"] },
    { id: "033.title_number1",
      name: "Plan to follow up on invitations given in a previous class and invite learners to share their experiences living what they learned.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/033-invite-learners-to-live?lang=eng#title_number1",
      filings: [{ category: "prep", group: "invitations-they-take-home" }],
      moment: ["opening", "after"] },
    { id: "033.title_number2",
      name: "Ask search questions that help learners consider who God is and blessings He offers them.",
      url: "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills/08-invite-diligent-learning/033-invite-learners-to-live?lang=eng#title_number2",
      filings: [{ category: "christ", group: "finding-him-in-the-scriptures" }],
      moment: ["during"] }
  ],

  // -----------------------------------------------------------------------
  // The concept layer behind the search box.
  //
  // Literal keyword matching over name, label, group and category gets a
  // teacher nowhere when the words they use are not the words the manual
  // uses — which is most of the time. Every term below was said out loud by
  // a participant in one of our two studies, or is the wording of a task
  // those participants were answering. Nothing here was invented at the
  // keyboard, and no model wrote any of it: 35 terms, each with the session
  // it came from in the comment beside it, so we can defend them one at a
  // time in review.
  //
  // term + also[] are matched as whole phrases against the typed query.
  // to{} names what the term means, by slug/key/id — never by display name.
  // -----------------------------------------------------------------------
  concepts: [

    // -- what people hunted for and could not find (tree test, T09) --------
    { term: "spirit",
      also: ["the spirit", "holy ghost", "promptings", "prompting"],
      to: { categories: ["feels"], blocks: ["020.title_number3"] } },
      // Tree test, T09 · Is it the Spirit? Marlo Wheeler read the five
      // category names twice: "I keep waiting for the one that says Spirit."

    { term: "is it the spirit",
      also: ["just me", "my own thoughts", "how do i know", "was that the spirit"],
      to: { blocks: ["020.title_number3"], categories: ["feels"] } },
      // Tree test, T09 scenario wording: "she can never tell whether a
      // feeling is the Spirit or just her own thoughts."

    { term: "what it feels like",
      also: ["feelings", "how it feels"],
      to: { categories: ["feels"] } },
      // Tree test, listening notes. Tessa Bingham: "None of these headings
      // are about what it feels like. They're all about what I do."

    // -- attention (card sort S1/S6 piles; tree test T04) ------------------
    { term: "bored",
      also: ["boring", "losing them", "restless", "not paying attention", "checked out"],
      to: { categories: ["attention"] } },
      // Card sort S1 pile "Keeping their attention"; tree test T04 brief,
      // "you are losing them ten minutes in."

    { term: "little kids",
      also: ["seven year olds", "seven-year-olds", "primary", "children", "kids"],
      to: { categories: ["attention"], blocks: ["006.title_number2", "027.title_number2"] } },
      // Card sort S6 pile "Keeping seven-year-olds alive"; Rylee Beckstrand:
      // "If you don't answer a seven-year-old, they'll answer themselves."

    { term: "pictures",
      also: ["picture", "images", "art", "visuals"],
      to: { blocks: ["004.title_number2"], groups: ["see-or-hear"] } },
      // Card sort deck C02, "Pictures & videos of Christ"; S1 filed it under
      // "Keeping their attention."

    { term: "music",
      also: ["sing", "singing", "hymn", "hymns", "song"],
      to: { blocks: ["019.title_number2"], groups: ["see-or-hear"] } },
      // Card sort deck C13. Trent Larkin held it ten seconds: "We never sing
      // in my class. It still belongs somewhere, doesn't it?"

    { term: "video",
      also: ["videos", "clip", "show a video"],
      to: { blocks: ["004.title_number2"] } },
      // Card sort deck C02.

    { term: "object lesson",
      also: ["object lessons", "hands on", "something to hold", "props", "with their hands"],
      to: { blocks: ["006.title_number2", "025.title_number3"], groups: ["do-not-watch"] } },
      // Tree test D2 relabel ("let them handle something"); card sort deck
      // C18, "Choose media & stories carefully."

    { term: "symbols",
      also: ["symbol", "types of christ"],
      to: { blocks: ["006.title_number1", "006.title_number2"] } },
      // Card sort deck C03; tree test T04 wrong-turn analysis — 2 of 3 misses
      // stopped on the Christ-symbols sibling.

    // -- getting people to talk (card sort S1/S2/S5; tree test T02, T03) ---
    { term: "nobody answers",
      also: ["no one answers", "nobody talks", "no one talks", "silence", "dead air"],
      to: { categories: ["talk"], blocks: ["023.title_number1"] } },
      // Tree test, T02 scenario: "You ask the class a question. Nobody
      // answers. You wait. Still nothing."

    { term: "i don't know the answer",
      also: ["dont know the answer", "cant answer", "can't answer", "hard question", "put on the spot"],
      to: { blocks: ["026.title_number3"], groups: ["asking-for-a-real-answer"] } },
      // Tree test T03; card sort piles "Handling questions" (Trent) and
      // "When I don't know what to say" (Whitney) — two sorters invented it.

    { term: "search question",
      also: ["search questions", "open ended", "open-ended"],
      to: { blocks: ["023.title_number1"] } },
      // Card sort, Cami Sprague: "Is search question a church word or a real
      // word?" It is manual vocabulary, so it belongs in search, not in a label.

    { term: "discussion",
      also: ["talk to each other", "talking to each other", "conversation", "group work"],
      to: { groups: ["talking-to-each-other"] } },
      // Card sort piles "Running a discussion" (S2) and "The discussion
      // itself" (S5).

    { term: "i talk too much",
      also: ["answering my own questions", "stop talking", "lecturing", "i answer everything"],
      to: { groups: ["not-answering-it-yourself"] } },
      // Card sort deck C21, and the Kade/Rylee argument over where it goes.

    { term: "scripture study",
      also: ["home study", "family scripture study", "reading at home", "study at home"],
      to: { blocks: ["030.title_number3", "030.intro2"] } },
      // Tree test D4 label, "when you want their home study in the room."

    // -- knowing and loving them (card sort S1/S3/S4/S6; tree test T06, T07)
    { term: "quiet kid",
      also: ["shy", "never says a word", "back row", "won't talk", "doesn't participate"],
      to: { blocks: ["014.title_number3"], groups: ["safe-to-speak-up"] } },
      // Tree test, T06 scenario: "One boy sits at the back and never says a
      // word, and you think he believes the class would run fine without him."

    { term: "safe",
      also: ["welcome", "belong", "needed", "class culture", "comfortable"],
      to: { groups: ["safe-to-speak-up"] } },
      // Card sort S2 pile "Class culture"; deck C09, "Students are needed,
      // not just welcome."

    { term: "parents",
      also: ["parent", "text a parent", "message a parent", "their mom", "their dad"],
      to: { blocks: ["015.title_number1"] } },
      // Tree test T07; card sort deck C10.

    { term: "get to know them",
      also: ["their interests", "who they are", "learn about them", "knowing them"],
      to: { groups: ["getting-to-know-them"] } },
      // Card sort S3 pile "Knowing them"; deck C06.

    { term: "pray for them",
      also: ["prayer", "pray", "by name"],
      to: { blocks: ["013.intro2", "013.intro3"] } },
      // Card sort deck C08. C08+C10 were in the same pile in 6 of 8 sorts.

    { term: "love them",
      also: ["loving the kids", "love the students", "care about them"],
      to: { categories: ["love"] } },
      // Card sort pile labels: "Loving the kids" (S1), "Love the students"
      // (S4), "Loving them" (S6).

    // -- preparation (card sort S1/S3/S6/S7; tree test T01, T05) -----------
    { term: "saturday night",
      also: ["last minute", "night before", "haven't prepared", "not prepared", "tonight"],
      to: { groups: ["getting-yourself-ready"], blocks: ["017.title_number2"] } },
      // Tree test, T01 scenario: "It is Saturday night and you have not
      // opened the manual yet."

    { term: "homework",
      also: ["my homework", "grown-up homework", "prep", "preparation"],
      to: { categories: ["prep"] } },
      // Card sort pile labels: "My homework" (S1), "Prep I should do" (S3),
      // "Grown-up homework" (S6) — three words, one pile, six sorts.

    { term: "planning",
      also: ["plan the lesson", "lesson plan", "what to do in class"],
      to: { groups: ["planning-the-lesson"] } },
      // Card sort S7 pile "Planning"; the group's tree-test rename (D3) came
      // from the same vocabulary.

    { term: "follow up",
      also: ["follow-up", "last week", "check in on", "did they do it"],
      to: { blocks: ["033.title_number1"], groups: ["invitations-they-take-home"] } },
      // Tree test T05; card sort S2 pile "Follow-through."

    { term: "invitation",
      also: ["invitations", "homework for them", "something to take home", "assignment"],
      to: { groups: ["invitations-they-take-home"] } },
      // Card sort deck C22 and C24; C24 wandered across four sorts.

    // -- teaching about Christ (card sort S3/S4/S6; tree test T08) ---------
    { term: "jesus",
      also: ["christ", "savior", "about jesus", "the savior"],
      to: { categories: ["christ"] } },
      // Card sort pile labels: "About the Savior" (S3), "Center on Christ"
      // (S4), "Jesus cards" (S6).

    { term: "school lesson",
      also: ["too academic", "just a lesson", "bring christ in", "make it about christ"],
      to: { blocks: ["004.title_number1"], categories: ["christ"] } },
      // Tree test, T08 scenario: "Your lesson on honesty is turning into a
      // school lesson."

    { term: "testimony",
      also: ["bear testimony", "testify", "share my testimony"],
      to: { groups: ["bearing-witness-in-class"], blocks: ["021.title_number2"] } },
      // Card sort deck C15, "Testify more often of Christ."

    { term: "prophets",
      also: ["prophet", "conference", "general conference"],
      to: { groups: ["what-the-prophets-say"] } },
      // Card sort S4 pile "Teach the doctrine", standardized into the group
      // label our sorters actually wrote.

    // -- when in the lesson (card sort S3/S5; tree test T10) ---------------
    { term: "first two minutes",
      also: ["opening", "openers", "start the lesson", "how to start", "beginning"],
      to: { moments: ["opening"], blocks: ["027.title_number2"] } },
      // Tree test T10; card sort piles "Openers" (S3) and "Opening minutes"
      // (S5).

    { term: "ending",
      also: ["closing", "last few minutes", "landing it", "wrap up", "end of class"],
      to: { moments: ["closing"] } },
      // Card sort S5 pile "Landing it."

    { term: "during the week",
      also: ["after class", "after sunday", "between sundays", "weekday"],
      to: { moments: ["after"] } },
      // Card sort S5 piles "During the week before" and "After Sunday" —
      // the only fully sequential sort in the study.

    // -- the vocabulary we deliberately kept out of the navigation ---------
    { term: "engagement",
      also: ["questioning strategies", "participation", "student engagement"],
      to: { categories: ["attention", "talk"] } }
      // Card sort, Lonnie Tolman's professional labels. She disowned them
      // herself ("Twenty years of faculty meetings, that's what those words
      // are"), so they are not navigation — but search should still answer them.

  ]
};

/* ============================================================================
   problems-data.js — THE DEFINITIVE SOURCE for the problem-driven experience.

   Edit THIS file to evolve the tool: add/remove problems, rename or re-order
   categories, or change which skills a problem maps to. problems.html renders
   entirely from here, joined with skills-data.js (skill names/links/section come
   from the skill id). To add a skill to a problem, add its id to that problem's
   `skills` array (the trailing comment is just the skill name, for readability).

   Shape: window.TDS_PROBLEMS = { version, categories: [ { id, title, blurb,
   problems: [ { id, title, blurb, skills:[skillId,...] } ] } ] }
   Category & problem `id`s are stable slugs (safe to deep-link / reference).
   ========================================================================== */
window.TDS_PROBLEMS = {
  "version": "2026-06-02",
  "categories": [
    {
      "id": "participate",
      "title": "Getting everyone to participate",
      "blurb": "Silence, shallow answers, a few voices carrying the room, or eyes glazing over.",
      "problems": [
        {
          "id": "silence",
          "title": "No one answers when I ask a question — the room just goes silent.",
          "blurb": "You ask, and you wait, and nobody volunteers — so you end up answering yourself.",
          "skills": [
            "023.title_number1",  // Create open-ended search questions that help learners discover gospel doctrine and principles for themselves and do not lead students to a specific response.
            "029.title_number1",  // Resist the tendency to respond to every comment and question and invite the class to respond.
            "020.intro2"  // Before responding to a student’s question or comment, pause and think, “What can I ask them?” or “What can I invite them to do?”
          ]
        },
        {
          "id": "teacher-centered",
          "title": "The class is too teacher-centered — I talk too much, or the same few people carry every discussion.",
          "blurb": "A handful of regulars respond to everything while everyone else stays quiet.",
          "skills": [
            "029.title_number1",  // Resist the tendency to respond to every comment and question and invite the class to respond.
            "029.title_number2",  // Focus on what the learner can do in class that the teacher typically does.
            "014.title_number3"  // Communicate that students are not only welcome but needed.
          ]
        },
        {
          "id": "shallow",
          "title": "Answers stay shallow — predictable “Sunday School answers” with no real thinking.",
          "blurb": "Students give the safe, expected answer and the discussion never goes deeper.",
          "skills": [
            "023.title_number1",  // Create open-ended search questions that help learners discover gospel doctrine and principles for themselves and do not lead students to a specific response.
            "026.intro2",  // Ask questions that help students identify and state converting principles.
            "018.title_number1"  // Ask a question to assess learning before moving on in the lesson.
          ]
        },
        {
          "id": "bored",
          "title": "Students look bored, distracted, or checked out.",
          "blurb": "Phones, blank stares, side conversations — their minds are somewhere else.",
          "skills": [
            "031.title_number2",  // Create a meaningful invitation connected to the lesson outcome to be used at the beginning of each lesson.
            "027.title_number2",  // Start a learning activity by inviting students to ponder a personal circumstance.
            "019.title_number2"  // Use sacred music. Invite students to identify lines and phrases in sacred music that connect with the truths they are learning.
          ]
        },
        {
          "id": "children",
          "title": "The children won't sit still or stay focused.",
          "blurb": "Short attention spans and wiggles make it hard to hold a Primary class together.",
          "skills": [
            "006.title_number2",  // Help students have a sensory experience with scriptural objects that symbolize Jesus Christ.
            "004.title_number2",  // Use pictures and videos of Jesus Christ to illustrate a gospel principle.
            "029.title_number2"  // Focus on what the learner can do in class that the teacher typically does.
          ]
        }
      ]
    },
    {
      "id": "center-on-christ",
      "title": "Keeping Jesus Christ at the center",
      "blurb": "Lessons that drift from the Savior, or stay about Him without helping students feel and follow Him.",
      "problems": [
        {
          "id": "drift",
          "title": "Lessons drift into topics, stories, or programs and quietly lose focus on the Savior.",
          "blurb": "The material takes over and Jesus Christ becomes a footnote rather than the point.",
          "skills": [
            "004.title_number1",  // Help students connect what they are learning with how Christ exemplifies the principle.
            "005.title_number17",  // Ask questions that allow students to identify roles Jesus Christ can have in their lives.
            "021.title_number2"  // Testify more frequently and more powerfully of Jesus Christ.
          ]
        },
        {
          "id": "connect-topic",
          "title": "I can't see how to connect this particular topic or passage to Jesus Christ.",
          "blurb": "Some lessons don't obviously point to Christ and you're not sure how to get there.",
          "skills": [
            "004.title_number1",  // Help students connect what they are learning with how Christ exemplifies the principle.
            "006.title_number1",  // Ask questions that help students learn about Jesus Christ through symbols in the scriptures.
            "007.title_number1"  // Ask questions that focus on connecting the Lord’s power, mercy, and influence to the truths being taught.
          ]
        },
        {
          "id": "feel-his-love",
          "title": "Students know about Christ but don't feel His love and power in their own lives.",
          "blurb": "The doctrine stays abstract instead of becoming personal and felt.",
          "skills": [
            "007.title_number2",  // Give invitations that help learners recognize the Lord’s love, power, and mercy in their own experiences.
            "008.title_number1",  // Statements that help students know and feel the love of Heavenly Father and Jesus Christ.
            "008.title_number2"  // Ask questions that help students find examples of Heavenly Father’s love in the scripture passage.
          ]
        },
        {
          "id": "become-like-him",
          "title": "Students learn about Christ but don't move toward becoming more like Him.",
          "blurb": "Information doesn't translate into a desire to follow His example.",
          "skills": [
            "009.title_number2",  // Invite students to look for ways to follow the example of Jesus Christ in their personal lives.
            "009.title_number1",  // Observe Christlike attributes in students and share what you’ve noticed in ways that inspire them to continue to be like Him.
            "033.title_number2"  // Ask search questions that help learners consider who God is and blessings He offers them.
          ]
        }
      ]
    },
    {
      "id": "relevance",
      "title": "Making it relevant and leading to real change",
      "blurb": "Bridging the gap between a good class discussion and a changed week.",
      "problems": [
        {
          "id": "so-what",
          "title": "Students don't see how the lesson applies to their lives (“so what?”).",
          "blurb": "The truth is true, but they don't connect it to their actual circumstances.",
          "skills": [
            "027.title_number1",  // Prepare invitations and prompts that help students find personal relevance to a scripture block.
            "027.title_number2",  // Start a learning activity by inviting students to ponder a personal circumstance.
            "005.title_number17"  // Ask questions that allow students to identify roles Jesus Christ can have in their lives.
          ]
        },
        {
          "id": "no-followthrough",
          "title": "We have a good discussion, but nothing changes during the week — no follow-through.",
          "blurb": "Invitations are given and then never revisited, so learning doesn't stick.",
          "skills": [
            "033.title_number1",  // Plan to follow up on invitations given in a previous class and invite learners to share their experiences living what they learned.
            "031.title_number1",  // Create invitations that help learners prepare for the next learning experience.
            "009.title_number2"  // Invite students to look for ways to follow the example of Jesus Christ in their personal lives.
          ]
        },
        {
          "id": "unprepared-week",
          "title": "Students come unprepared and don't study on their own during the week.",
          "blurb": "Class is the only time they open the scriptures, so depth is limited.",
          "skills": [
            "030.intro2",  // Assist students in creating a daily scripture study goal.
            "030.title_number3"  // Develop and ask questions that help learners connect what they have learned in their personal and family scripture study to the classroom experience.
          ]
        },
        {
          "id": "gospel-conversations",
          "title": "I want students to take what they learn into gospel conversations outside of class.",
          "blurb": "Learning stays inside the classroom instead of shaping how they share the gospel.",
          "skills": [
            "032.intro2",  // Help students create or begin gospel conversations.
            "032.title_number3"  // Prepare invitations for students to share with each other what they are learning.
          ]
        }
      ]
    },
    {
      "id": "relationships",
      "title": "Building relationships and a safe class",
      "blurb": "Knowing, loving, and including the people in the room — including the hard-to-love ones.",
      "problems": [
        {
          "id": "dont-know-them",
          "title": "I'm new to the calling (or the class is new to me) and I don't know my students or their needs.",
          "blurb": "Without knowing their circumstances it's hard to teach to what they actually need.",
          "skills": [
            "012.intro2",  // Observe and ask about students’ interests.
            "013.intro2",  // Pray and ask how you can help your students and follow the promptings from the Holy Ghost.
            "011.title_number1"  // Study recent prophetic messages to understand how Heavenly Father sees young people.
          ]
        },
        {
          "id": "hard-to-love",
          "title": "A student is hard to love — disruptive or draining — and I feel frustrated with them.",
          "blurb": "Your patience runs thin and it's affecting how you see and treat them.",
          "skills": [
            "011.title_number2",  // “Think celestial” about your students to help you see them as God does.
            "012.title_number4",  // Pause, reflect, and answer questions we ask ourselves that invite a Christlike spirit of discernment, love, and empathy in our interactions.
            "015.title_number2"  // Testify of God’s love when it is hard for you to feel or express love to those you teach.
          ]
        },
        {
          "id": "not-safe",
          "title": "Students are afraid to participate for fear of being wrong; the class doesn't feel safe.",
          "blurb": "People hold back because contributing feels risky.",
          "skills": [
            "014.intro2",  // Communicate that you value students before they comment or as they raise their hand to comment.
            "014.title_number3",  // Communicate that students are not only welcome but needed.
            "012.title_number3"  // Seek to clarify and understand the real intent of students’ questions, feelings, and beliefs.
          ]
        },
        {
          "id": "not-needed",
          "title": "Students don't feel needed; attendance and investment are slipping.",
          "blurb": "Some quietly conclude it wouldn't matter if they came or not.",
          "skills": [
            "014.title_number3",  // Communicate that students are not only welcome but needed.
            "015.title_number1",  // Send a message to a student’s parent about something positive you have noticed about their child.
            "013.intro3"  // Invite students to pray for other students.
          ]
        },
        {
          "id": "understand-meaning",
          "title": "I want to really understand what a student means, or where a comment is coming from.",
          "blurb": "A comment or question has something behind it, and you want to respond to the real need.",
          "skills": [
            "012.title_number3",  // Seek to clarify and understand the real intent of students’ questions, feelings, and beliefs.
            "012.title_number4",  // Pause, reflect, and answer questions we ask ourselves that invite a Christlike spirit of discernment, love, and empathy in our interactions.
            "018.title_number2"  // Listen to and observe students to ask follow-up questions.
          ]
        }
      ]
    },
    {
      "id": "invite-spirit",
      "title": "Inviting the Spirit and deepening testimony",
      "blurb": "When the lesson feels like information without spiritual power, or testimony is thin.",
      "problems": [
        {
          "id": "feels-flat",
          "title": "The lesson feels like information with no spiritual feeling — the Spirit just isn't there.",
          "blurb": "Everything is correct, but nothing is felt.",
          "skills": [
            "008.title_number1",  // Statements that help students know and feel the love of Heavenly Father and Jesus Christ.
            "019.title_number2",  // Use sacred music. Invite students to identify lines and phrases in sacred music that connect with the truths they are learning.
            "021.title_number1"  // Create prompts that help students verbalize their feelings, experiences, and testimony.
          ]
        },
        {
          "id": "testimony",
          "title": "I want to bear testimony more naturally and powerfully — and help students do the same.",
          "blurb": "Testimony feels rare or forced, for you and for them.",
          "skills": [
            "021.title_number2",  // Testify more frequently and more powerfully of Jesus Christ.
            "021.title_number1",  // Create prompts that help students verbalize their feelings, experiences, and testimony.
            "024.title_number2"  // Express your love for and testimony of prophets as their words are shared in class.
          ]
        },
        {
          "id": "recognize-spirit",
          "title": "Students struggle to recognize the Spirit and personal revelation.",
          "blurb": "They aren't sure what the Spirit feels like or how to act on promptings.",
          "skills": [
            "020.title_number3",  // Share statements that help students recognize when the Holy Ghost is performing His role or function.
            "020.intro2",  // Before responding to a student’s question or comment, pause and think, “What can I ask them?” or “What can I invite them to do?”
            "021.title_number1"  // Create prompts that help students verbalize their feelings, experiences, and testimony.
          ]
        }
      ]
    },
    {
      "id": "sound-doctrine",
      "title": "Handling hard questions and teaching sound doctrine",
      "blurb": "Staying anchored in scripture and prophets when questions, speculation, or controversy come up.",
      "problems": [
        {
          "id": "cant-answer",
          "title": "A student asks a question I can't answer, or one that could open speculation or controversy.",
          "blurb": "You don't want to shut them down, but you also don't want to wing it.",
          "skills": [
            "026.title_number3",  // Respond to questions in a way that avoids speculation and nondoctrinal personal ideas.
            "023.title_number2",  // Search the scriptures and words of the prophets for deeper understanding.
            "020.intro2"  // Before responding to a student’s question or comment, pause and think, “What can I ask them?” or “What can I invite them to do?”
          ]
        },
        {
          "id": "speculation",
          "title": "Discussion wanders into speculation, personal theories, or “deep doctrine” rabbit holes.",
          "blurb": "Tangents pull the class away from converting truth.",
          "skills": [
            "026.title_number3",  // Respond to questions in a way that avoids speculation and nondoctrinal personal ideas.
            "026.intro2",  // Ask questions that help students identify and state converting principles.
            "024.title_number1"  // Prepare invitations that help students connect truths found in the scriptures to what living prophets are saying.
          ]
        },
        {
          "id": "ground-in-scripture",
          "title": "I want to ground teaching in the scriptures and living prophets, not opinions or outside material.",
          "blurb": "It's easy to drift toward personal ideas or internet sources instead of the sources of truth.",
          "skills": [
            "024.title_number1",  // Prepare invitations that help students connect truths found in the scriptures to what living prophets are saying.
            "023.title_number2",  // Search the scriptures and words of the prophets for deeper understanding.
            "024.title_number2"  // Express your love for and testimony of prophets as their words are shared in class.
          ]
        },
        {
          "id": "media-choices",
          "title": "I'm not sure which media, stories, or object lessons are appropriate.",
          "blurb": "Some illustrations feel sensational or distracting rather than faith-building.",
          "skills": [
            "025.title_number3",  // Consider assessment questions to carefully choose media, personal stories, and object lessons.
            "004.title_number2",  // Use pictures and videos of Jesus Christ to illustrate a gospel principle.
            "006.title_number2"  // Help students have a sensory experience with scriptural objects that symbolize Jesus Christ.
          ]
        }
      ]
    },
    {
      "id": "prepare",
      "title": "Preparing yourself and managing the lesson",
      "blurb": "The teacher's own readiness — spiritual preparation, time, assessment, and freshness.",
      "problems": [
        {
          "id": "unqualified",
          "title": "I feel unqualified or spiritually underprepared, and I'm not sure how to prepare well.",
          "blurb": "The calling feels bigger than you, and the manual feels like a lot.",
          "skills": [
            "017.title_number2",  // Ask questions to assess your own experience and testimony with Jesus Christ and the doctrine and principles in the lesson.
            "017.title_number1",  // Use the document “Improving as a Christlike Teacher—A Personal Evaluation” to invite the Holy Ghost to help you refine your preparations to teach.
            "023.title_number2"  // Search the scriptures and words of the prophets for deeper understanding.
          ]
        },
        {
          "id": "out-of-time",
          "title": "I run out of time and rush to cover everything.",
          "blurb": "You over-prepare and race the clock instead of teaching for learning.",
          "skills": [
            "018.title_number1",  // Ask a question to assess learning before moving on in the lesson.
            "031.title_number2",  // Create a meaningful invitation connected to the lesson outcome to be used at the beginning of each lesson.
            "018.title_number2"  // Listen to and observe students to ask follow-up questions.
          ]
        },
        {
          "id": "cant-tell-learning",
          "title": "I can't tell whether they're actually learning.",
          "blurb": "You finish the lesson with no real read on what landed.",
          "skills": [
            "018.title_number1",  // Ask a question to assess learning before moving on in the lesson.
            "019.intro1",  // Create student self-evaluations about a doctrine, truth, or principle.
            "018.title_number2"  // Listen to and observe students to ask follow-up questions.
          ]
        },
        {
          "id": "same-every-week",
          "title": "Every week feels the same — I'm stuck in read-and-discuss and want more variety.",
          "blurb": "The format has gone stale and you want fresh ways to teach.",
          "skills": [
            "023.title_number1",  // Create open-ended search questions that help learners discover gospel doctrine and principles for themselves and do not lead students to a specific response.
            "019.title_number2",  // Use sacred music. Invite students to identify lines and phrases in sacred music that connect with the truths they are learning.
            "027.title_number2"  // Start a learning activity by inviting students to ponder a personal circumstance.
          ]
        }
      ]
    }
  ]
};

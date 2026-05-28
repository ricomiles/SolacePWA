export const PROMPTS = [
  // Memory & Nostalgia
  "What's a place you haven't visited in years that still feels like yours?",
  "Describe a meal you remember more clearly than you'd expect.",
  "What did you believe at age ten that you've since quietly let go of?",
  "Which friendship ended without a proper goodbye?",
  "What summer do you keep returning to in your mind?",
  "Write about a version of yourself you've mostly left behind.",
  "What's something a parent or grandparent said that you still hear?",
  "Describe the last time you were somewhere truly new.",
  "What childhood smell stops you in your tracks?",
  "Write about a photograph you wish existed — a moment no one thought to capture.",

  // Present Moment
  "What's one small thing that's been beautiful this week?",
  "What are you pretending is fine when it isn't?",
  "What would you do differently if today were a second chance?",
  "What have you been putting off that weighs on you quietly?",
  "What are you grateful for that you rarely say aloud?",
  "What does your body feel like right now, honestly?",
  "What did you notice today that surprised you?",
  "Who were you today — and who did you want to be?",
  "What are you carrying that no one else can see?",
  "What's the smallest thing you could do today that would matter?",

  // Desire & Longing
  "What would you attempt if you knew you couldn't fail?",
  "What kind of life are you building, and is it the one you want?",
  "What do you want more of? Less of?",
  "If you could change one thing about your daily life, what would it be?",
  "What have you been afraid to want?",
  "What's something you've been working toward so long you've forgotten why?",
  "If you had one unscheduled hour, what would you do with it?",
  "What's a life you imagine sometimes that you've never spoken about?",
  "What are you waiting for permission to do?",

  // Relationships
  "Who makes you feel most like yourself?",
  "Write about a misunderstanding that still matters to you.",
  "Who in your life do you wish you knew better?",
  "What would you say to someone you've lost touch with?",
  "When did someone surprise you with unexpected kindness?",
  "What's something you've never told the people closest to you?",
  "Write about a relationship that quietly changed you.",
  "What does love look like in your life right now — not the idea of it, but the actual daily shape?",
  "Who do you turn to when you don't know what to do?",
  "What's something you learned about yourself through another person?",

  // Work & Purpose
  "What's work you're proud of that no one else knows about?",
  "What would make your days feel more meaningful?",
  "When do you feel most alive in what you do?",
  "What are you building that matters to you?",
  "Write about a moment when you felt you were exactly where you were meant to be.",
  "What would you do with your time if money weren't the question?",
  "What parts of your work feel like you, and which feel like performance?",

  // Growth & Change
  "What have you become that you didn't plan to be?",
  "What's a belief you've changed your mind on in the last year?",
  "What are you in the middle of becoming?",
  "What's the hardest thing you've done that you'd do again?",
  "Write about a version of yourself from five years ago.",
  "What would your future self want you to know right now?",
  "What have you learned from something that went wrong?",
  "What does growing up still mean for you?",
  "What's a habit or pattern you're trying to leave behind?",

  // Joy & Lightness
  "What's making you smile lately, even a little?",
  "Describe a moment of pure, uncomplicated happiness.",
  "What do you love about someone in your life, right now?",
  "What's something you do just for the pleasure of it?",
  "Write about a small, ordinary thing that brings you joy.",
  "What are you looking forward to?",
  "When did you last laugh until it hurt?",
  "What's something beautiful you almost didn't notice?",

  // Nature & The World
  "Describe the weather outside right now like it matters.",
  "What's something you've seen in nature that stopped you?",
  "What does your neighborhood look like at the hour you usually forget?",
  "When did you last feel small in a good way?",
  "Write about water — a river, a rain, a glass, the ocean.",
  "What season are you in right now, inside?",

  // Identity & Self
  "How would the people who love you describe you?",
  "What part of yourself are you still figuring out?",
  "What do you know about yourself that took years to learn?",
  "Write about a label you've outgrown.",
  "What do you want to be remembered for?",
  "What's a strength you often overlook in yourself?",
  "What do you need right now that you're not giving yourself?",
  "Write about the version of yourself you're most afraid of becoming.",
  "What do you hide, and why?",
  "What are you most honest about when no one is reading?",

  // Difficulty & Hardship
  "Write about a time you surprised yourself with your resilience.",
  "What's something painful that also made you who you are?",
  "What do you wish had gone differently?",
  "What's a fear you're finally ready to name?",
  "Write about a moment you wanted to give up but didn't.",
  "What's something you've forgiven yourself for, or are still working on?",
  "What does grief look like in your life — not necessarily loss of a person?",

  // Curiosity & Questions
  "What's a question you keep returning to without an answer?",
  "What are you curious about right now?",
  "What would you study if time and money were no obstacle?",
  "What's a mystery you've made peace with not understanding?",
  "What have you been reading, watching, or listening to that's stayed with you?",
  "What's a conversation you keep having in your head?",

  // Time & Seasons
  "How is this year different from what you expected?",
  "Write about something that happened faster than you thought it would.",
  "What are you not ready to let go of?",
  "What from the past year are you most relieved is behind you?",
  "How have you changed in the last six months?",
  "What does this particular season ask of you?",

  // Quiet & Ritual
  "What do you think about when you're alone?",
  "Write about a quiet moment that felt sacred.",
  "What's something you can only hear when it's silent?",
  "What does real rest look like for you, and when did you last have it?",
  "Write about a daily habit that's become a kind of ritual.",
  "What does your morning feel like before the day has asked anything of you?",

  // Endings & Beginnings
  "What chapter of your life is ending right now?",
  "What are you in the process of beginning?",
  "Write about something you've finally let go of.",
  "Write about the last time you had to say goodbye.",

  // Loose & Poetic
  "If your life right now were a season, which would it be and why?",
  "Write the opening line of the story of your life as it stands today.",
  "If today were the last entry you ever wrote, what would you want it to say?",
]

export function getDailyPrompt() {
  const epochDays = Math.floor(Date.now() / 86400000)
  return PROMPTS[epochDays % PROMPTS.length]
}

export function getPromptForDate(date) {
  const epochDays = Math.floor(date.getTime() / 86400000)
  return PROMPTS[epochDays % PROMPTS.length]
}

export function hasTodayEntry(entries) {
  const t = new Date()
  const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
  return entries.some(e => {
    const d = new Date(e.client_updated_at || e.created_at)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key
  })
}


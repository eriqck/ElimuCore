import type { LearningClass } from "@/lib/types";

const numbersTopicLessons = [
  {
    slug: "counting-objects",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Counting objects",
    summary: "Count familiar objects from 1 to 10 with clear visual prompts.",
    description:
      "Learners count pictures, compare totals, and build confidence with one-to-one counting.",
    lessonType: "practice" as const,
    access: "free" as const,
    estimatedMinutes: 8,
    sortOrder: 1,
    objectives: [
      "Count everyday objects from 1 to 10.",
      "Match the spoken count to the total seen on the screen.",
      "Check answers carefully before moving on."
    ],
    learningCards: [
      {
        id: "counting-1",
        title: "Count slowly",
        body: "Point to each object one time as you count.",
        visual: "⭐ ⭐ ⭐ ⭐"
      },
      {
        id: "counting-2",
        title: "Say the last number",
        body: "The last number you say tells how many objects there are.",
        visual: "🍎 🍎 🍎 🍎 🍎"
      },
      {
        id: "counting-3",
        title: "Check again",
        body: "If you are not sure, count from the beginning once more.",
        visual: "🚗 🚗 🚗"
      }
    ],
    questions: [
      {
        id: "count-q1",
        prompt: "How many stars are there?",
        visual: "⭐ ⭐ ⭐ ⭐ ⭐",
        choices: ["3", "4", "5", "6"],
        correctIndex: 2,
        hint: "Touch each star once as you count.",
        explanation: "There are 5 stars."
      },
      {
        id: "count-q2",
        prompt: "How many apples are there?",
        visual: "🍎 🍎 🍎",
        choices: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "Count one apple at a time.",
        explanation: "There are 3 apples."
      },
      {
        id: "count-q3",
        prompt: "How many balls are there?",
        visual: "⚽ ⚽ ⚽ ⚽ ⚽ ⚽",
        choices: ["4", "5", "6", "7"],
        correctIndex: 2,
        hint: "Keep your finger moving across the row.",
        explanation: "There are 6 balls."
      },
      {
        id: "count-q4",
        prompt: "How many books are there?",
        visual: "📘 📘 📘 📘",
        choices: ["2", "3", "4", "5"],
        correctIndex: 2,
        hint: "Count all the books from left to right.",
        explanation: "There are 4 books."
      }
    ],
    passingScore: 100
  },
  {
    slug: "number-recognition",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Number recognition",
    summary: "Recognize the written numbers 1 to 10 quickly and confidently.",
    description:
      "This lesson helps learners connect the number symbol they see with the number name they know.",
    lessonType: "practice" as const,
    access: "premium" as const,
    estimatedMinutes: 8,
    sortOrder: 2,
    objectives: [
      "Identify number symbols from 1 to 10.",
      "Choose the correct number when given a prompt.",
      "Notice the difference between similar-looking numbers."
    ],
    learningCards: [
      {
        id: "recognition-1",
        title: "Look carefully",
        body: "Each number has its own shape and name.",
        visual: "1 2 3 4 5"
      },
      {
        id: "recognition-2",
        title: "Spot the number",
        body: "Find the exact number the question asks for.",
        visual: "6 7 8 9 10"
      }
    ],
    questions: [
      {
        id: "recognition-q1",
        prompt: "Which number is 7?",
        choices: ["5", "6", "7", "8"],
        correctIndex: 2,
        hint: "Say the numbers in order until you reach 7.",
        explanation: "7 is the correct number."
      },
      {
        id: "recognition-q2",
        prompt: "Which number is 10?",
        choices: ["8", "9", "10", "6"],
        correctIndex: 2,
        hint: "10 comes after 9.",
        explanation: "10 is correct."
      },
      {
        id: "recognition-q3",
        prompt: "Which number is 2?",
        choices: ["1", "2", "3", "4"],
        correctIndex: 1,
        hint: "2 comes after 1.",
        explanation: "2 is correct."
      },
      {
        id: "recognition-q4",
        prompt: "Which number is 9?",
        choices: ["9", "6", "8", "10"],
        correctIndex: 0,
        hint: "9 comes just before 10.",
        explanation: "9 is correct."
      }
    ],
    passingScore: 100
  },
  {
    slug: "number-tracing",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Number tracing",
    summary: "Follow simple tracing guides and connect movement with number shapes.",
    description:
      "Learners study how each number is formed, then answer recognition checks after guided tracing.",
    lessonType: "guided" as const,
    access: "premium" as const,
    estimatedMinutes: 9,
    sortOrder: 3,
    objectives: [
      "Notice the direction used to write number shapes.",
      "Connect tracing steps to the correct number.",
      "Build confidence before pencil practice."
    ],
    learningCards: [
      {
        id: "tracing-1",
        title: "Trace 1",
        body: "Start at the top and draw one straight line down.",
        visual: "1"
      },
      {
        id: "tracing-2",
        title: "Trace 3",
        body: "Curve once at the top, then curve again at the bottom.",
        visual: "3"
      },
      {
        id: "tracing-3",
        title: "Trace 8",
        body: "Make the top loop, then the bottom loop.",
        visual: "8"
      }
    ],
    questions: [
      {
        id: "tracing-q1",
        prompt: "Which number is one straight line down?",
        choices: ["1", "2", "5", "7"],
        correctIndex: 0,
        hint: "It is the easiest number to start tracing.",
        explanation: "A straight line down makes 1."
      },
      {
        id: "tracing-q2",
        prompt: "Which number has two round loops?",
        choices: ["3", "6", "8", "9"],
        correctIndex: 2,
        hint: "Think of one loop above another.",
        explanation: "8 has two loops."
      },
      {
        id: "tracing-q3",
        prompt: "Which number curves at the top and curves again at the bottom?",
        choices: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "It looks like two open curves stacked together.",
        explanation: "3 is made with two curves."
      }
    ],
    passingScore: 100
  },
  {
    slug: "matching-numbers-to-objects",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Matching numbers to objects",
    summary: "Match a number symbol to the correct group of objects.",
    description:
      "This lesson helps learners connect quantity and symbol in both directions.",
    lessonType: "practice" as const,
    access: "premium" as const,
    estimatedMinutes: 8,
    sortOrder: 4,
    objectives: [
      "Connect the number symbol with the correct quantity.",
      "Spot when a group has more or fewer objects than the number shown.",
      "Practice matching quickly and accurately."
    ],
    learningCards: [
      {
        id: "matching-1",
        title: "Look at the group",
        body: "Count the objects before choosing the number.",
        visual: "🐟 🐟 🐟 🐟"
      },
      {
        id: "matching-2",
        title: "Check the number",
        body: "Make sure the number and the group are exactly the same.",
        visual: "4 = 🐟 🐟 🐟 🐟"
      }
    ],
    questions: [
      {
        id: "matching-q1",
        prompt: "Which number matches this group?",
        visual: "🍊 🍊 🍊 🍊 🍊 🍊",
        choices: ["4", "5", "6", "7"],
        correctIndex: 2,
        hint: "Count all the oranges carefully.",
        explanation: "The group matches 6."
      },
      {
        id: "matching-q2",
        prompt: "Which number matches this group?",
        visual: "🧸 🧸",
        choices: ["1", "2", "3", "4"],
        correctIndex: 1,
        hint: "There are only two bears.",
        explanation: "The group matches 2."
      },
      {
        id: "matching-q3",
        prompt: "Which group matches the number 9?",
        choices: ["🌼 🌼 🌼 🌼", "🌼 🌼 🌼 🌼 🌼 🌼 🌼", "🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼", "🌼 🌼 🌼"],
        correctIndex: 2,
        hint: "Choose the group with 9 flowers.",
        explanation: "That group has 9 flowers."
      },
      {
        id: "matching-q4",
        prompt: "Which group matches the number 5?",
        choices: ["🪁 🪁 🪁 🪁 🪁", "🪁 🪁 🪁", "🪁 🪁 🪁 🪁", "🪁 🪁 🪁 🪁 🪁 🪁"],
        correctIndex: 0,
        hint: "Look for five kites.",
        explanation: "That group has 5 kites."
      }
    ],
    passingScore: 100
  },
  {
    slug: "simple-addition",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Simple addition",
    summary: "Add small groups together using numbers up to 10.",
    description:
      "Learners combine two small groups and choose the total.",
    lessonType: "practice" as const,
    access: "premium" as const,
    estimatedMinutes: 9,
    sortOrder: 5,
    objectives: [
      "Join two small groups together.",
      "Count on to find the total.",
      "Check addition answers with objects."
    ],
    learningCards: [
      {
        id: "addition-1",
        title: "Join groups",
        body: "Put both groups together, then count them all.",
        visual: "🍎 🍎 + 🍎 = ?"
      },
      {
        id: "addition-2",
        title: "Count on",
        body: "Start with the first number, then add the next group.",
        visual: "3 + 2 = 5"
      }
    ],
    questions: [
      {
        id: "addition-q1",
        prompt: "What is 2 + 3?",
        visual: "🍎 🍎 + 🍎 🍎 🍎",
        choices: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "Count all the apples after joining both groups.",
        explanation: "2 + 3 = 5."
      },
      {
        id: "addition-q2",
        prompt: "What is 1 + 4?",
        visual: "⭐ + ⭐ ⭐ ⭐ ⭐",
        choices: ["3", "4", "5", "6"],
        correctIndex: 2,
        hint: "One more than four makes five.",
        explanation: "1 + 4 = 5."
      },
      {
        id: "addition-q3",
        prompt: "What is 3 + 2?",
        visual: "🚗 🚗 🚗 + 🚗 🚗",
        choices: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "Count on from 3 by 2 more.",
        explanation: "3 + 2 = 5."
      },
      {
        id: "addition-q4",
        prompt: "What is 5 + 1?",
        visual: "⚽ ⚽ ⚽ ⚽ ⚽ + ⚽",
        choices: ["5", "6", "7", "8"],
        correctIndex: 1,
        hint: "One more than five is six.",
        explanation: "5 + 1 = 6."
      }
    ],
    passingScore: 100
  },
  {
    slug: "simple-subtraction",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Simple subtraction",
    summary: "Take away small groups and find how many are left.",
    description:
      "Learners solve early subtraction questions by removing objects and recounting what remains.",
    lessonType: "practice" as const,
    access: "premium" as const,
    estimatedMinutes: 9,
    sortOrder: 6,
    objectives: [
      "Take away objects from a group.",
      "Count how many are left after removing some.",
      "Use subtraction language with confidence."
    ],
    learningCards: [
      {
        id: "subtraction-1",
        title: "Start with all",
        body: "Count the full group before taking any away.",
        visual: "🍌 🍌 🍌 🍌 🍌"
      },
      {
        id: "subtraction-2",
        title: "Take away",
        body: "Remove the number asked for, then count what is left.",
        visual: "5 - 2 = 3"
      }
    ],
    questions: [
      {
        id: "subtraction-q1",
        prompt: "What is 5 - 2?",
        visual: "🍪 🍪 🍪 🍪 🍪",
        choices: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "If you take 2 cookies away from 5, 3 remain.",
        explanation: "5 - 2 = 3."
      },
      {
        id: "subtraction-q2",
        prompt: "What is 4 - 1?",
        visual: "🎈 🎈 🎈 🎈",
        choices: ["1", "2", "3", "4"],
        correctIndex: 2,
        hint: "Take one balloon away from four.",
        explanation: "4 - 1 = 3."
      },
      {
        id: "subtraction-q3",
        prompt: "What is 6 - 3?",
        visual: "🐠 🐠 🐠 🐠 🐠 🐠",
        choices: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "Taking away three from six leaves three.",
        explanation: "6 - 3 = 3."
      },
      {
        id: "subtraction-q4",
        prompt: "What is 7 - 2?",
        visual: "🪀 🪀 🪀 🪀 🪀 🪀 🪀",
        choices: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "Take two away from seven.",
        explanation: "7 - 2 = 5."
      }
    ],
    passingScore: 100
  },
  {
    slug: "number-order",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "Number order",
    summary: "Practice what comes before, after, and between numbers 1 to 10.",
    description:
      "Learners build fluency with number order by answering sequence questions.",
    lessonType: "practice" as const,
    access: "premium" as const,
    estimatedMinutes: 8,
    sortOrder: 7,
    objectives: [
      "Say and spot numbers in order from 1 to 10.",
      "Find the number before and after.",
      "Complete simple missing-number patterns."
    ],
    learningCards: [
      {
        id: "order-1",
        title: "Say the line",
        body: "Practice the number line from 1 to 10 every time you begin.",
        visual: "1 2 3 4 5 6 7 8 9 10"
      },
      {
        id: "order-2",
        title: "Find the gap",
        body: "Look at the numbers before and after the missing space.",
        visual: "4 __ 6"
      }
    ],
    questions: [
      {
        id: "order-q1",
        prompt: "Which number comes after 6?",
        choices: ["5", "6", "7", "8"],
        correctIndex: 2,
        hint: "Count forward one step from 6.",
        explanation: "7 comes after 6."
      },
      {
        id: "order-q2",
        prompt: "Which number comes before 4?",
        choices: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "Count backward one step from 4.",
        explanation: "3 comes before 4."
      },
      {
        id: "order-q3",
        prompt: "Which number is missing? 2, 3, __, 5",
        choices: ["1", "4", "6", "7"],
        correctIndex: 1,
        hint: "The numbers go in order.",
        explanation: "4 fits between 3 and 5."
      },
      {
        id: "order-q4",
        prompt: "Which number is missing? 7, __, 9",
        choices: ["5", "6", "8", "10"],
        correctIndex: 2,
        hint: "What comes after 7?",
        explanation: "8 fits between 7 and 9."
      }
    ],
    passingScore: 100
  },
  {
    slug: "end-of-topic-quiz",
    topicSlug: "numbers-1-10",
    classSlug: "grade-1-math",
    title: "End-of-topic quiz",
    summary: "Check understanding across counting, matching, addition, subtraction, and order.",
    description:
      "This quiz mixes the full topic into one score-based challenge for learners, parents, and teachers to review together.",
    lessonType: "quiz" as const,
    access: "premium" as const,
    estimatedMinutes: 10,
    sortOrder: 8,
    objectives: [
      "Show understanding of numbers 1 to 10.",
      "Complete a full mixed quiz with confidence.",
      "Review strengths and gaps after the score screen."
    ],
    learningCards: [
      {
        id: "quiz-1",
        title: "Take your time",
        body: "Read every question carefully before choosing an answer."
      },
      {
        id: "quiz-2",
        title: "Do your best",
        body: "Your score will show you what to practice next."
      }
    ],
    questions: [
      {
        id: "quiz-q1",
        prompt: "How many stars are there?",
        visual: "⭐ ⭐ ⭐ ⭐",
        choices: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "Count each star once.",
        explanation: "There are 4 stars."
      },
      {
        id: "quiz-q2",
        prompt: "Which number is 8?",
        choices: ["6", "7", "8", "9"],
        correctIndex: 2,
        hint: "8 comes after 7.",
        explanation: "8 is correct."
      },
      {
        id: "quiz-q3",
        prompt: "Which group matches 5?",
        choices: ["🐦 🐦 🐦", "🐦 🐦 🐦 🐦 🐦", "🐦 🐦", "🐦 🐦 🐦 🐦"],
        correctIndex: 1,
        hint: "Count the birds in each group.",
        explanation: "That group has 5 birds."
      },
      {
        id: "quiz-q4",
        prompt: "What is 2 + 2?",
        choices: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "Join two and two together.",
        explanation: "2 + 2 = 4."
      },
      {
        id: "quiz-q5",
        prompt: "What is 6 - 1?",
        choices: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "One less than 6 is 5.",
        explanation: "6 - 1 = 5."
      },
      {
        id: "quiz-q6",
        prompt: "Which number comes after 9?",
        choices: ["8", "9", "10", "11"],
        correctIndex: 2,
        hint: "Count one more than 9.",
        explanation: "10 comes after 9."
      },
      {
        id: "quiz-q7",
        prompt: "Which number comes before 3?",
        choices: ["1", "2", "3", "4"],
        correctIndex: 1,
        hint: "Count backward one step from 3.",
        explanation: "2 comes before 3."
      },
      {
        id: "quiz-q8",
        prompt: "How many books are there?",
        visual: "📗 📗 📗 📗 📗 📗 📗",
        choices: ["5", "6", "7", "8"],
        correctIndex: 2,
        hint: "Count all the books carefully.",
        explanation: "There are 7 books."
      },
      {
        id: "quiz-q9",
        prompt: "What is 4 + 3?",
        choices: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "Count on three more from 4.",
        explanation: "4 + 3 = 7."
      },
      {
        id: "quiz-q10",
        prompt: "What is 8 - 3?",
        choices: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "Take three away from eight.",
        explanation: "8 - 3 = 5."
      }
    ],
    passingScore: 70
  }
];

export const fallbackLearningClasses: LearningClass[] = [
  {
    slug: "grade-1-math",
    title: "Grade 1 Mathematics",
    subtitle: "Early numeracy lessons for classroom and home learning",
    description:
      "A structured digital class that guides young learners through counting, number recognition, matching, early operations, and quizzes with member progress support.",
    audience:
      "Built for lower-primary learners, teachers guiding class practice, and parents supporting study at home.",
    statusLabel: "Available now",
    available: true,
    sortOrder: 1,
    topics: [
      {
        slug: "numbers-1-10",
        classSlug: "grade-1-math",
        title: "Numbers 1-10",
        summary:
          "Count objects, recognize numbers, match quantities, and solve simple operations within 10.",
        description:
          "This topic introduces foundational number sense through short lessons that feel child-friendly but still give teachers and parents a clear learning path.",
        access: "premium",
        sortOrder: 1,
        lessons: numbersTopicLessons
      }
    ]
  },
  {
    slug: "pp2-numeracy",
    title: "PP2 Numeracy",
    subtitle: "Play-based number readiness for early learners",
    description:
      "A coming-soon pathway for counting, comparing sizes, shapes, and simple classroom numeracy routines.",
    audience:
      "Designed for PP2 teachers, caregivers, and families preparing learners for lower-primary number work.",
    statusLabel: "Coming next",
    available: false,
    sortOrder: 2,
    topics: []
  },
  {
    slug: "grade-2-math",
    title: "Grade 2 Mathematics",
    subtitle: "Number growth, place value, and practical problem solving",
    description:
      "A planned continuation track that expands early numeracy into larger numbers, patterns, and problem solving.",
    audience:
      "Designed for learners ready to move beyond introductory counting and early operations.",
    statusLabel: "Coming next",
    available: false,
    sortOrder: 3,
    topics: []
  },
  {
    slug: "grade-1-english",
    title: "Grade 1 English",
    subtitle: "Letter sounds, reading readiness, and early language practice",
    description:
      "A future class focused on phonics, word building, listening, and reading confidence for early learners.",
    audience:
      "Useful for teachers building literacy lessons and parents supporting reading practice at home.",
    statusLabel: "Planned",
    available: false,
    sortOrder: 4,
    topics: []
  }
];

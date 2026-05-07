import "server-only";
import type {
  AssessmentDocumentContent,
  AssessmentDocumentItem,
  AssessmentQuestionType,
  LessonNotesDocumentContent,
  LessonNotesDocumentSection,
  LessonPlanDocumentContent,
  LessonPlanDocumentLesson,
  MarkingSchemeDocumentContent,
  MarkingSchemeDocumentItem,
  SchemeDocumentContent,
  SchemeDocumentRow,
  SchemeLanguage,
  TeacherDocumentKind
} from "@/lib/types";

function formatTerm(term: string, language: SchemeLanguage) {
  return language === "sw" ? `Muhula wa ${term}` : `Term ${term}`;
}

function uniqueValues(values: string[], limit = 4) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).slice(0, limit);
}

function pickFocus(row: SchemeDocumentRow) {
  return [row.strand, row.subStrand].filter(Boolean).join(" - ");
}

function buildLessonTitle(
  classLabel: string,
  subject: string,
  term: string,
  year: number
) {
  return `${year} ${classLabel.toUpperCase()} ${subject.toUpperCase()} LESSON PLAN TERM ${term}`;
}

function buildAssessmentTitle(
  classLabel: string,
  subject: string,
  term: string,
  year: number
) {
  return `${year} ${classLabel.toUpperCase()} ${subject.toUpperCase()} ASSESSMENT TERM ${term}`;
}

function buildMarkingSchemeTitle(
  classLabel: string,
  subject: string,
  term: string,
  year: number
) {
  return `${year} ${classLabel.toUpperCase()} ${subject.toUpperCase()} MARKING SCHEME TERM ${term}`;
}

function buildLessonNotesTitle(
  classLabel: string,
  subject: string,
  term: string,
  year: number
) {
  return `${year} ${classLabel.toUpperCase()} ${subject.toUpperCase()} LESSON NOTES TERM ${term}`;
}

function getStarterPrompt(row: SchemeDocumentRow, language: SchemeLanguage) {
  const question = row.keyInquiryQuestions[0]?.trim();

  if (question) {
    return question;
  }

  return language === "sw"
    ? `Anzisha kipindi kwa kukumbusha wanafunzi kuhusu ${row.subStrand}.`
    : `Start the lesson by helping learners recall key ideas in ${row.subStrand}.`;
}

function buildLessonActivities(
  row: SchemeDocumentRow,
  language: SchemeLanguage
) {
  const activities = row.experiences.slice(0, 3);

  if (activities.length >= 3) {
    return activities;
  }

  const fallback =
    language === "sw"
      ? [
          "Mwalimu aongoze kazi ya mfano kwa hatua.",
          "Wanafunzi wafanye kazi ya jozi au vikundi vidogo.",
          "Wanafunzi wakamilishe mazoezi ya kujitegemea."
        ]
      : [
          "Teacher models the task step by step.",
          "Learners work in pairs or small groups.",
          "Learners complete short independent practice."
        ];

  return uniqueValues([...activities, ...fallback], 3);
}

function buildLessonHomework(
  row: SchemeDocumentRow,
  language: SchemeLanguage
) {
  const assessmentTask = row.assessment[0]?.trim();

  if (assessmentTask) {
    return [
      assessmentTask,
      language === "sw"
        ? "Kamilisha kazi ya nyumbani na uje tayari kwa mapitio."
        : "Complete the follow-up task and be ready for review."
    ];
  }

  return [
    language === "sw"
      ? `Fanya kazi fupi kuhusu ${row.subStrand} nyumbani.`
      : `Complete a short home task on ${row.subStrand}.`
  ];
}

function buildLessonDifferentiation(language: SchemeLanguage) {
  return language === "sw"
    ? [
        "Toa msaada wa karibu kwa wanafunzi wanaohitaji mwongozo zaidi.",
        "Panua kazi kwa wanafunzi wanaokamilisha mapema."
      ]
    : [
        "Give guided support to learners who need more help.",
        "Extend the task for learners who finish early."
      ];
}

function buildLessonPlanLesson(
  row: SchemeDocumentRow,
  language: SchemeLanguage
): LessonPlanDocumentLesson {
  return {
    lessonLabel:
      language === "sw"
        ? `Wiki ${row.weekLabel} Kipindi ${row.lessonLabel}`
        : `Week ${row.weekLabel} Lesson ${row.lessonLabel}`,
    duration: language === "sw" ? "Dakika 35-40" : "35-40 minutes",
    focus: pickFocus(row),
    objectives: row.outcomes.slice(0, 2),
    materials: uniqueValues(row.resources, 5),
    introduction: [getStarterPrompt(row, language)],
    activities: buildLessonActivities(row, language),
    assessment: row.assessment.slice(0, 2),
    homework: buildLessonHomework(row, language),
    differentiation: buildLessonDifferentiation(language)
  };
}

function buildAssessmentPrompt(
  row: SchemeDocumentRow,
  language: SchemeLanguage,
  type: AssessmentQuestionType
) {
  const stem = row.outcomes[0]?.trim() || row.subStrand;

  if (language === "sw") {
    if (type === "application") {
      return `Eleza jinsi mwanafunzi angeweza kutumia ${stem} katika kazi ya vitendo ya darasani.`;
    }

    if (type === "structured") {
      return `Kwa kutumia mada ya ${row.subStrand}, jibu swali lifuatalo kwa hatua zilizopangwa.`;
    }

    return `Taja na ufafanue jambo muhimu kuhusu ${stem}.`;
  }

  if (type === "application") {
    return `Explain how a learner can apply ${stem} in a practical classroom task.`;
  }

  if (type === "structured") {
    return `Using the sub-strand ${row.subStrand}, answer the following question in clear steps.`;
  }

  return `State and explain one key idea about ${stem}.`;
}

function buildExpectedAnswer(row: SchemeDocumentRow, language: SchemeLanguage) {
  const evidence = row.experiences[0]?.trim() || row.assessment[0]?.trim();

  if (evidence) {
    return evidence;
  }

  return language === "sw"
    ? `Majibu yaonyeshe uelewa wa ${row.subStrand} na matumizi yake ya msingi.`
    : `Responses should show understanding of ${row.subStrand} and its basic application.`;
}

function createAssessmentItem(
  row: SchemeDocumentRow,
  index: number,
  language: SchemeLanguage
): AssessmentDocumentItem {
  const type: AssessmentQuestionType =
    index % 3 === 0
      ? "short-answer"
      : index % 3 === 1
        ? "structured"
        : "application";
  const marks = type === "application" ? 10 : type === "structured" ? 8 : 5;

  return {
    numberLabel: `${index + 1}.`,
    prompt: buildAssessmentPrompt(row, language, type),
    expectedAnswer: buildExpectedAnswer(row, language),
    marks,
    type
  };
}

function buildNotesExplanation(row: SchemeDocumentRow, language: SchemeLanguage) {
  return uniqueValues(
    [
      ...row.outcomes,
      row.experiences[0] || "",
      language === "sw"
        ? `Mada inalenga kueleza ${row.subStrand} kwa njia rahisi ya darasani.`
        : `The note should explain ${row.subStrand} in a simple classroom-ready way.`
    ],
    3
  );
}

function buildNotesExamples(row: SchemeDocumentRow, language: SchemeLanguage) {
  const baseExamples = row.resources.slice(0, 2);

  if (baseExamples.length > 0) {
    return baseExamples;
  }

  return language === "sw"
    ? ["Mfano wa mwalimu darasani.", "Mazoezi mafupi ya wanafunzi."]
    : ["Worked classroom example.", "Short learner practice example."];
}

function buildNotesTasks(row: SchemeDocumentRow, language: SchemeLanguage) {
  return uniqueValues(
    [
      ...row.assessment,
      language === "sw"
        ? `Wanafunzi waandike kazi fupi kuhusu ${row.subStrand}.`
        : `Learners complete a short task on ${row.subStrand}.`
    ],
    3
  );
}

function buildHomeSupport(row: SchemeDocumentRow, language: SchemeLanguage) {
  return [
    language === "sw"
      ? `Mzazi au mlezi akague kama mwanafunzi anaweza kueleza ${row.subStrand} kwa maneno yake mwenyewe.`
      : `Ask the learner to explain ${row.subStrand} in their own words at home.`,
    language === "sw"
      ? "Toa zoezi fupi la mapitio nyumbani."
      : "Give a short home review activity."
  ];
}

function buildLessonNotesSection(
  row: SchemeDocumentRow,
  language: SchemeLanguage
): LessonNotesDocumentSection {
  return {
    sectionLabel:
      language === "sw"
        ? `Wiki ${row.weekLabel}: ${row.subStrand}`
        : `Week ${row.weekLabel}: ${row.subStrand}`,
    focus: pickFocus(row),
    objectives: row.outcomes.slice(0, 3),
    explanation: buildNotesExplanation(row, language),
    examples: buildNotesExamples(row, language),
    learnerTasks: buildNotesTasks(row, language),
    homeSupport: buildHomeSupport(row, language)
  };
}

function buildMarkingAnswerPoints(
  item: AssessmentDocumentItem,
  language: SchemeLanguage
) {
  const fallback =
    language === "sw"
      ? [
          `Pointi 1: Tambua wazo kuu la swali.`,
          `Pointi 2: Toa maelezo sahihi kutoka kwa mada.`,
          `Pointi 3: Tumia mfano ufaao pale inapohitajika.`
        ]
      : [
          "Point 1: Identify the main idea being tested.",
          "Point 2: Give a correct explanation from the topic.",
          "Point 3: Use a relevant example where needed."
        ];

  const answerParts = item.expectedAnswer
    .split(/[.;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (answerParts.length > 0) {
    return answerParts.map((part, index) =>
      language === "sw"
        ? `Alama ${index + 1}: ${part}`
        : `Mark ${index + 1}: ${part}`
    );
  }

  return fallback;
}

function createMarkingSchemeItem(
  item: AssessmentDocumentItem,
  language: SchemeLanguage
): MarkingSchemeDocumentItem {
  return {
    questionLabel: item.numberLabel,
    prompt: item.prompt,
    marks: item.marks,
    answerPoints: buildMarkingAnswerPoints(item, language)
  };
}

function buildMarkingSchemeSectionsFromAssessment(
  assessment: AssessmentDocumentContent
) {
  return assessment.sections.map((section) => ({
    title:
      assessment.language === "sw"
        ? `${section.title} - Mwongozo wa Uwekaji Alama`
        : `${section.title} - Marking Guide`,
    guidance:
      assessment.language === "sw"
        ? "Tumia pointi zifuatazo unapoweka alama za kila swali."
        : "Use the points below when awarding marks for each question.",
    items: section.items.map((item) =>
      createMarkingSchemeItem(item, assessment.language)
    )
  }));
}

export function getTeacherDocumentKindLabel(kind: TeacherDocumentKind) {
  switch (kind) {
    case "lesson-plan":
      return "Lesson Plan";
    case "assessment":
      return "Assessment";
    case "marking-scheme":
      return "Marking Scheme";
    case "lesson-notes":
      return "Lesson Notes";
    default:
      return "Scheme";
  }
}

export function generateLessonPlanDocumentContentFromScheme(args: {
  scheme: SchemeDocumentContent;
  textbook: string;
}): LessonPlanDocumentContent {
  const { scheme, textbook } = args;
  const lessons = scheme.rows.slice(0, 10).map((row) =>
    buildLessonPlanLesson(row, scheme.language)
  );
  const bookReference = textbook.trim();

  return {
    title: buildLessonTitle(
      scheme.classLabel,
      scheme.subject,
      scheme.term,
      scheme.year
    ),
    subtitle:
      scheme.language === "sw"
        ? `Mpango wa vipindi uliotokana na scheme ya ${formatTerm(scheme.term, scheme.language)}${bookReference ? ` kwa kutumia ${bookReference}` : ""}.`
        : `Lesson-by-lesson classroom guide created from the ${formatTerm(scheme.term, scheme.language)} scheme${bookReference ? ` using ${bookReference}` : ""}.`,
    language: scheme.language,
    schoolName: scheme.schoolName,
    teacherName: scheme.teacherName,
    classLabel: scheme.classLabel,
    subject: scheme.subject,
    term: scheme.term,
    year: scheme.year,
    lessons
  };
}

export function generateAssessmentDocumentContentFromScheme(args: {
  scheme: SchemeDocumentContent;
  textbook: string;
}): AssessmentDocumentContent {
  const { scheme, textbook } = args;
  const selectedRows = scheme.rows.slice(0, 9);
  const items = selectedRows.map((row, index) =>
    createAssessmentItem(row, index, scheme.language)
  );
  const sections = [
    {
      title:
        scheme.language === "sw"
          ? "SEHEMU A: Maswali mafupi"
          : "SECTION A: Short response questions",
      instructions:
        scheme.language === "sw"
          ? "Jibu maswali yote kwa ufupi na kwa usahihi."
          : "Answer all questions briefly and clearly.",
      items: items.filter((item) => item.type === "short-answer")
    },
    {
      title:
        scheme.language === "sw"
          ? "SEHEMU B: Maswali yenye mpangilio"
          : "SECTION B: Structured questions",
      instructions:
        scheme.language === "sw"
          ? "Andika hatua na maelezo muhimu."
          : "Show clear steps and key points in your responses.",
      items: items.filter((item) => item.type === "structured")
    },
    {
      title:
        scheme.language === "sw"
          ? "SEHEMU C: Matumizi"
          : "SECTION C: Application tasks",
      instructions:
        scheme.language === "sw"
          ? "Tumia maarifa ya mada katika hali halisi ya darasani."
          : "Apply the topic knowledge to a practical classroom situation.",
      items: items.filter((item) => item.type === "application")
    }
  ].filter((section) => section.items.length > 0);
  const totalMarks = sections
    .flatMap((section) => section.items)
    .reduce((sum, item) => sum + item.marks, 0);
  const durationMinutes = Math.max(
    30,
    sections.flatMap((section) => section.items).length * 6
  );
  const bookReference = textbook.trim();

  return {
    title: buildAssessmentTitle(
      scheme.classLabel,
      scheme.subject,
      scheme.term,
      scheme.year
    ),
    subtitle:
      scheme.language === "sw"
        ? `Tathmini ya ${formatTerm(scheme.term, scheme.language)} iliyotokana na scheme${bookReference ? ` na ikarejelea ${bookReference}` : ""}.`
        : `Term assessment created from the ${formatTerm(scheme.term, scheme.language)} scheme${bookReference ? ` and guided by ${bookReference}` : ""}.`,
    language: scheme.language,
    schoolName: scheme.schoolName,
    teacherName: scheme.teacherName,
    classLabel: scheme.classLabel,
    subject: scheme.subject,
    term: scheme.term,
    year: scheme.year,
    durationMinutes,
    totalMarks,
    instructions:
      scheme.language === "sw"
        ? [
            "Soma kila swali kwa makini kabla ya kujibu.",
            "Jibu kwa uwazi na tumia mifano pale inapohitajika.",
            "Fuata maelekezo ya mwalimu kuhusu muda wa kufanya kazi."
          ]
        : [
            "Read each question carefully before answering.",
            "Answer clearly and use examples where needed.",
            "Follow the teacher's instructions on time and presentation."
          ],
    sections
  };
}

export function generateMarkingSchemeDocumentContentFromScheme(args: {
  scheme: SchemeDocumentContent;
  textbook: string;
}): MarkingSchemeDocumentContent {
  const { scheme, textbook } = args;
  const assessment = generateAssessmentDocumentContentFromScheme({
    scheme,
    textbook
  });
  const bookReference = textbook.trim();

  return {
    title: buildMarkingSchemeTitle(
      scheme.classLabel,
      scheme.subject,
      scheme.term,
      scheme.year
    ),
    subtitle:
      scheme.language === "sw"
        ? `Mwongozo wa uwekaji alama uliotokana na tathmini ya ${formatTerm(scheme.term, scheme.language)}${bookReference ? ` kwa kurejelea ${bookReference}` : ""}.`
        : `Marking guide created from the ${formatTerm(scheme.term, scheme.language)} assessment${bookReference ? ` with reference to ${bookReference}` : ""}.`,
    language: scheme.language,
    schoolName: scheme.schoolName,
    teacherName: scheme.teacherName,
    classLabel: scheme.classLabel,
    subject: scheme.subject,
    term: scheme.term,
    year: scheme.year,
    totalMarks: assessment.totalMarks,
    sections: buildMarkingSchemeSectionsFromAssessment(assessment)
  };
}

export function generateLessonNotesDocumentContentFromScheme(args: {
  scheme: SchemeDocumentContent;
  textbook: string;
}): LessonNotesDocumentContent {
  const { scheme, textbook } = args;
  const bookReference = textbook.trim();

  return {
    title: buildLessonNotesTitle(
      scheme.classLabel,
      scheme.subject,
      scheme.term,
      scheme.year
    ),
    subtitle:
      scheme.language === "sw"
        ? `Maelezo ya somo yaliyoandaliwa kutoka kwa scheme ya ${formatTerm(scheme.term, scheme.language)}${bookReference ? ` kwa kutumia ${bookReference}` : ""}.`
        : `Teacher-ready lesson notes created from the ${formatTerm(scheme.term, scheme.language)} scheme${bookReference ? ` using ${bookReference}` : ""}.`,
    language: scheme.language,
    schoolName: scheme.schoolName,
    teacherName: scheme.teacherName,
    classLabel: scheme.classLabel,
    subject: scheme.subject,
    term: scheme.term,
    year: scheme.year,
    sections: scheme.rows
      .slice(0, 8)
      .map((row) => buildLessonNotesSection(row, scheme.language))
  };
}

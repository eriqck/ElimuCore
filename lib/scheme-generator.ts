import "server-only";
import {
  getSchemeSubjectFamily,
  getSuggestedSchemeTextbook,
  resolveSchemeBand,
  type SchemeBand,
  type SchemeSubjectFamily
} from "@/lib/scheme-catalog";
import type {
  SchemeDocumentContent,
  SchemeDocumentRow,
  SchemeLanguage,
  SchemeStage
} from "@/lib/types";

export type SchemeGenerationInput = {
  stage: SchemeStage;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  schoolName: string;
  teacherName: string;
  textbook: string;
  notes: string;
  weeksInTerm: number;
  lessonsPerWeek: number;
  language: SchemeLanguage;
};

type LocalizedText = {
  en: string;
  sw: string;
};

type SubjectUnit = {
  strand: LocalizedText;
  subStrand: LocalizedText;
  topic: LocalizedText;
  experiences?: LocalizedText[];
  inquiry?: LocalizedText[];
  resources?: LocalizedText[];
  assessments?: LocalizedText[];
};

function text(en: string, sw: string): LocalizedText {
  return { en, sw };
}

function localize(value: LocalizedText, language: SchemeLanguage) {
  return language === "sw" ? value.sw : value.en;
}

function createUnit(args: {
  strand: LocalizedText;
  subStrand: LocalizedText;
  topic: LocalizedText;
  experiences?: LocalizedText[];
  inquiry?: LocalizedText[];
  resources?: LocalizedText[];
  assessments?: LocalizedText[];
}): SubjectUnit {
  return args;
}

function getMathematicsUnits(band: SchemeBand) {
  switch (band) {
    case "early-years":
      return [
        createUnit({
          strand: text("Number Work", "Ujuzi wa Nambari"),
          subStrand: text("Counting objects", "Kuhesabu vitu"),
          topic: text("counting, sorting, and matching quantities", "kuhesabu, kupanga, na kuoanisha kiasi"),
          resources: [text("counters and counting sticks", "vihesabio na vijiti vya kuhesabia")]
        }),
        createUnit({
          strand: text("Number Work", "Ujuzi wa Nambari"),
          subStrand: text("Number recognition", "Kutambua nambari"),
          topic: text("reading number symbols and tracing them correctly", "kusoma alama za nambari na kuzifuatilia kwa usahihi"),
          resources: [text("number cards and tracing sheets", "kadi za nambari na karatasi za kufuatilia")]
        }),
        createUnit({
          strand: text("Shapes and Space", "Maumbo na Nafasi"),
          subStrand: text("Basic shapes", "Maumbo ya msingi"),
          topic: text("identifying and using common shapes", "kutambua na kutumia maumbo ya kawaida"),
          resources: [text("shape cut-outs", "vifaa vya maumbo")]
        }),
        createUnit({
          strand: text("Patterns", "Mifumo"),
          subStrand: text("Pattern making", "Kutengeneza mifumo"),
          topic: text("completing and extending simple patterns", "kukamilisha na kuendeleza mifumo rahisi"),
          resources: [text("beads and colour cards", "shanga na kadi za rangi")]
        })
      ];
    case "lower-primary":
      return [
        createUnit({
          strand: text("Numbers", "Nambari"),
          subStrand: text("Whole numbers", "Nambari nzima"),
          topic: text("reading, writing, and comparing whole numbers", "kusoma, kuandika, na kulinganisha nambari nzima")
        }),
        createUnit({
          strand: text("Operations", "Utendaji"),
          subStrand: text("Addition and subtraction", "Jumla na kutoa"),
          topic: text("solving addition and subtraction tasks", "kutatua kazi za jumla na kutoa")
        }),
        createUnit({
          strand: text("Measurement", "Vipimo"),
          subStrand: text("Length, time, and money", "Urefu, muda, na pesa"),
          topic: text("using simple measurements in daily situations", "kutumia vipimo rahisi katika hali za kila siku")
        }),
        createUnit({
          strand: text("Geometry", "Jiometri"),
          subStrand: text("Shapes and patterns", "Maumbo na mifumo"),
          topic: text("identifying shapes and pattern rules", "kutambua maumbo na kanuni za mifumo")
        })
      ];
    case "middle-primary":
      return [
        createUnit({
          strand: text("Numbers", "Nambari"),
          subStrand: text("Whole numbers and fractions", "Nambari nzima na sehemu"),
          topic: text("working with whole numbers, fractions, and place value", "kutumia nambari nzima, sehemu, na thamani ya nafasi")
        }),
        createUnit({
          strand: text("Operations", "Utendaji"),
          subStrand: text("Multi-step operations", "Hatua nyingi za utendaji"),
          topic: text("solving number operations accurately", "kutatua utendaji wa nambari kwa usahihi")
        }),
        createUnit({
          strand: text("Measurement", "Vipimo"),
          subStrand: text("Perimeter, area, and time", "Mzunguko, eneo, na muda"),
          topic: text("measuring and solving practical tasks", "kupima na kutatua kazi za vitendo")
        }),
        createUnit({
          strand: text("Data", "Data"),
          subStrand: text("Charts and graphs", "Chati na grafu"),
          topic: text("collecting and interpreting simple data", "kukusanya na kutafsiri data rahisi")
        })
      ];
    case "senior":
      return [
        createUnit({
          strand: text("Algebra", "Aljebra"),
          subStrand: text("Expressions and equations", "Manyunyu na milinganyo"),
          topic: text("simplifying expressions and solving equations", "kurahisisha manyunyu na kutatua milinganyo")
        }),
        createUnit({
          strand: text("Geometry", "Jiometri"),
          subStrand: text("Angles and constructions", "Pembe na michoro"),
          topic: text("reasoning through geometric constructions and angle relationships", "kufikiri kupitia michoro ya jiometri na uhusiano wa pembe")
        }),
        createUnit({
          strand: text("Trigonometry", "Trigonometria"),
          subStrand: text("Ratios and applications", "Uwiano na matumizi"),
          topic: text("using trigonometric ratios in real problems", "kutumia uwiano wa trigonometria katika matatizo halisi")
        }),
        createUnit({
          strand: text("Statistics", "Takwimu"),
          subStrand: text("Data analysis", "Uchanganuzi wa data"),
          topic: text("interpreting tables, graphs, and averages", "kutafsiri majedwali, grafu, na wastani")
        })
      ];
    default:
      return [
        createUnit({
          strand: text("Numbers", "Nambari"),
          subStrand: text("Number concepts", "Dhana za nambari"),
          topic: text("working with rational numbers and number patterns", "kutumia nambari za kiasi na mifumo ya nambari")
        }),
        createUnit({
          strand: text("Algebra", "Aljebra"),
          subStrand: text("Expressions", "Manyunyu"),
          topic: text("simplifying expressions and substitution", "kurahisisha manyunyu na mbadala")
        }),
        createUnit({
          strand: text("Geometry", "Jiometri"),
          subStrand: text("Shapes and measurement", "Maumbo na vipimo"),
          topic: text("solving tasks on lines, angles, and plane figures", "kutatua kazi za mistari, pembe, na maumbo bapa")
        }),
        createUnit({
          strand: text("Data", "Data"),
          subStrand: text("Statistics and probability", "Takwimu na uwezekano"),
          topic: text("organizing and interpreting data", "kupanga na kutafsiri data")
        })
      ];
  }
}

function getEnglishUnits(band: SchemeBand) {
  if (band === "early-years") {
    return [
      createUnit({
        strand: text("Listening and Speaking", "Kusikiliza na Kuzungumza"),
        subStrand: text("Sound awareness", "Utambuzi wa sauti"),
        topic: text("listening for sounds, words, and simple responses", "kusikiliza sauti, maneno, na majibu rahisi")
      }),
      createUnit({
        strand: text("Reading", "Kusoma"),
        subStrand: text("Picture reading", "Kusoma picha"),
        topic: text("naming pictures and retelling simple ideas", "kutaja picha na kusimulia mawazo rahisi")
      }),
      createUnit({
        strand: text("Writing", "Kuandika"),
        subStrand: text("Early writing", "Kuandika awali"),
        topic: text("forming letters and tracing simple words", "kuunda herufi na kufuatilia maneno rahisi")
      }),
      createUnit({
        strand: text("Language Use", "Matumizi ya Lugha"),
        subStrand: text("Everyday vocabulary", "Msamiati wa kila siku"),
        topic: text("using familiar words in class routines", "kutumia maneno ya kawaida katika ratiba za darasa")
      })
    ];
  }

  return [
    createUnit({
      strand: text("Listening and Speaking", "Kusikiliza na Kuzungumza"),
      subStrand: text("Oral communication", "Mawasiliano ya mdomo"),
      topic: text("listening actively and responding clearly", "kusikiliza kwa makini na kujibu kwa uwazi")
    }),
    createUnit({
      strand: text("Reading", "Kusoma"),
      subStrand: text("Comprehension", "Ufahamu"),
      topic: text("reading and answering comprehension questions", "kusoma na kujibu maswali ya ufahamu")
    }),
    createUnit({
      strand: text("Language Structures", "Miundo ya Lugha"),
      subStrand: text("Grammar and usage", "Sarufi na matumizi"),
      topic: text("using grammar correctly in speech and writing", "kutumia sarufi kwa usahihi katika mazungumzo na maandishi")
    }),
    createUnit({
      strand: text("Writing", "Kuandika"),
      subStrand: text("Functional and creative writing", "Uandishi wa kimatumizi na ubunifu"),
      topic: text("planning and writing clear sentences and short texts", "kupanga na kuandika sentensi na maandishi mafupi kwa uwazi")
    })
  ];
}

function getKiswahiliUnits() {
  return [
    createUnit({
      strand: text("Listening and Speaking", "Kusikiliza na Kuzungumza"),
      subStrand: text("Oral expression", "Usemi wa mdomo"),
      topic: text("kusikiliza maagizo na kujibu kwa usahihi", "kusikiliza maagizo na kujibu kwa usahihi")
    }),
    createUnit({
      strand: text("Reading", "Kusoma"),
      subStrand: text("Ufahamu", "Ufahamu"),
      topic: text("kusoma kifungu na kujibu maswali ya ufahamu", "kusoma kifungu na kujibu maswali ya ufahamu")
    }),
    createUnit({
      strand: text("Language Structures", "Sarufi"),
      subStrand: text("Grammar", "Matumizi ya sarufi"),
      topic: text("kutumia miundo ya sarufi kwa usahihi", "kutumia miundo ya sarufi kwa usahihi")
    }),
    createUnit({
      strand: text("Writing", "Kuandika"),
      subStrand: text("Composition", "Insha na uandishi"),
      topic: text("kuandika sentensi na aya zenye mpangilio mzuri", "kuandika sentensi na aya zenye mpangilio mzuri")
    }),
    createUnit({
      strand: text("Literature", "Fasihi"),
      subStrand: text("Appreciation", "Uchanganuzi wa fasihi"),
      topic: text("kufurahia na kueleza ujumbe katika kifungu au shairi", "kufurahia na kueleza ujumbe katika kifungu au shairi")
    })
  ];
}

function getCreUnits() {
  return [
    createUnit({
      strand: text("The Bible", "Biblia"),
      subStrand: text("Bible stories and teachings", "Hadithi na mafundisho ya Biblia"),
      topic: text("Bible teachings and their meaning in daily life", "mafundisho ya Biblia na maana yake katika maisha ya kila siku")
    }),
    createUnit({
      strand: text("Christian Living", "Maisha ya Kikristo"),
      subStrand: text("Values and behaviour", "Maadili na mwenendo"),
      topic: text("practising Christian values in school and community", "kutekeleza maadili ya Kikristo shuleni na katika jamii")
    }),
    createUnit({
      strand: text("The Church", "Kanisa"),
      subStrand: text("Worship and service", "Ibada na huduma"),
      topic: text("the role of worship, prayer, and service", "nafasi ya ibada, sala, na huduma")
    }),
    createUnit({
      strand: text("African Religious Heritage", "Urithi wa Dini za Kiafrika"),
      subStrand: text("Beliefs and practices", "Imani na desturi"),
      topic: text("respecting African religious heritage and moral values", "kuheshimu urithi wa dini za Kiafrika na maadili")
    })
  ];
}

function getReligionUnits(subject: string) {
  return [
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Sacred teachings", "Mafundisho matakatifu"),
      topic: text("understanding key teachings from sacred texts", "kuelewa mafundisho muhimu kutoka maandiko matakatifu")
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Worship and devotion", "Ibada na ibada ya kila siku"),
      topic: text("applying worship practices with understanding", "kutekeleza ibada kwa uelewa")
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Moral values", "Maadili"),
      topic: text("living out moral values in school and community", "kuishi maadili shuleni na katika jamii")
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Community life", "Maisha ya jamii"),
      topic: text("using faith-based values in relationships and service", "kutumia maadili ya kiimani katika mahusiano na huduma")
    })
  ];
}

function getIntegratedScienceUnits(band: SchemeBand) {
  if (band === "lower-primary" || band === "middle-primary") {
    return [
      createUnit({
        strand: text("Living Things", "Viumbe Hai"),
        subStrand: text("Plants and animals", "Mimea na wanyama"),
        topic: text("observing living things and their needs", "kuangalia viumbe hai na mahitaji yao")
      }),
      createUnit({
        strand: text("Matter", "Maada"),
        subStrand: text("Materials around us", "Vifaa vinavyotuzunguka"),
        topic: text("classifying and using everyday materials", "kuainisha na kutumia vifaa vya kila siku")
      }),
      createUnit({
        strand: text("Energy", "Nishati"),
        subStrand: text("Heat, light, and sound", "Joto, mwanga, na sauti"),
        topic: text("identifying forms and uses of energy", "kutambua aina na matumizi ya nishati")
      }),
      createUnit({
        strand: text("Earth and Space", "Dunia na Anga"),
        subStrand: text("Weather and environment", "Hali ya hewa na mazingira"),
        topic: text("observing weather patterns and caring for the environment", "kuangalia hali ya hewa na kutunza mazingira")
      })
    ];
  }

  return [
    createUnit({
      strand: text("Scientific Investigation", "Uchunguzi wa Kisayansi"),
      subStrand: text("Observation and experimentation", "Uangalizi na majaribio"),
      topic: text("planning and carrying out guided scientific investigations", "kupanga na kufanya uchunguzi elekezi wa kisayansi")
    }),
    createUnit({
      strand: text("Living Systems", "Mifumo Hai"),
      subStrand: text("Life processes", "Mchakato wa maisha"),
      topic: text("explaining structures and processes in living things", "kueleza miundo na michakato ya viumbe hai")
    }),
    createUnit({
      strand: text("Matter and Energy", "Maada na Nishati"),
      subStrand: text("Forces, heat, and electricity", "Nguvu, joto, na umeme"),
      topic: text("explaining interactions of matter, forces, and energy", "kueleza mwingiliano wa maada, nguvu, na nishati")
    }),
    createUnit({
      strand: text("Earth and Space", "Dunia na Anga"),
      subStrand: text("Environmental systems", "Mifumo ya mazingira"),
      topic: text("interpreting earth systems and environmental care", "kutafsiri mifumo ya dunia na utunzaji wa mazingira")
    })
  ];
}

function getSocialStudiesUnits() {
  return [
    createUnit({
      strand: text("Citizenship", "Uraia"),
      subStrand: text("Rights and responsibilities", "Haki na wajibu"),
      topic: text("using civic values responsibly in school and community", "kutumia maadili ya uraia kwa uwajibikaji shuleni na katika jamii")
    }),
    createUnit({
      strand: text("People and Environment", "Watu na Mazingira"),
      subStrand: text("Human activities", "Shughuli za binadamu"),
      topic: text("describing the relationship between people and the environment", "kueleza uhusiano kati ya watu na mazingira")
    }),
    createUnit({
      strand: text("Resources and Development", "Rasilimali na Maendeleo"),
      subStrand: text("Use of resources", "Matumizi ya rasilimali"),
      topic: text("using local resources for development", "kutumia rasilimali za eneo kwa maendeleo")
    }),
    createUnit({
      strand: text("Governance and History", "Utawala na Historia"),
      subStrand: text("Leadership and heritage", "Uongozi na urithi"),
      topic: text("appreciating leadership, heritage, and national identity", "kuthamini uongozi, urithi, na utambulisho wa kitaifa")
    })
  ];
}

function getAgricultureUnits() {
  return [
    createUnit({
      strand: text("Crop Production", "Uzalishaji wa mazao"),
      subStrand: text("Crop establishment", "Kuanzisha mazao"),
      topic: text("planning and caring for crops from planting to growth", "kupanga na kutunza mazao kutoka upandaji hadi ukuaji")
    }),
    createUnit({
      strand: text("Soil Management", "Usimamizi wa udongo"),
      subStrand: text("Soil care", "Utunzaji wa udongo"),
      topic: text("improving soil for healthy crop production", "kuboresha udongo kwa uzalishaji bora wa mazao")
    }),
    createUnit({
      strand: text("Animal Production", "Uzalishaji wa mifugo"),
      subStrand: text("Animal care", "Utunzaji wa mifugo"),
      topic: text("practising safe and responsible animal husbandry", "kutekeleza ufugaji salama na wenye uwajibikaji")
    }),
    createUnit({
      strand: text("Agribusiness", "Biashara ya kilimo"),
      subStrand: text("Farm records and marketing", "Rekodi za shamba na masoko"),
      topic: text("keeping simple farm records and marketing produce", "kuweka rekodi rahisi za shamba na kuuza mazao")
    })
  ];
}

function getCreativeArtsUnits() {
  return [
    createUnit({
      strand: text("Visual Arts", "Sanaa ya kuona"),
      subStrand: text("Drawing and design", "Kuchora na kubuni"),
      topic: text("creating artwork using line, colour, and texture", "kutengeneza kazi za sanaa kwa kutumia mstari, rangi, na umbile")
    }),
    createUnit({
      strand: text("Performing Arts", "Sanaa za maonyesho"),
      subStrand: text("Movement and drama", "Mwendo na drama"),
      topic: text("expressing ideas through movement, role play, and drama", "kuwasilisha mawazo kupitia mwendo, maigizo, na drama"),
      resources: [text("costumes and simple props", "mavazi na vifaa rahisi vya maigizo")]
    }),
    createUnit({
      strand: text("Music", "Muziki"),
      subStrand: text("Rhythm and performance", "Mdundo na uigizaji"),
      topic: text("performing rhythm, melody, and creative expression", "kuigiza mdundo, melodi, na ubunifu"),
      resources: [text("simple percussion instruments", "vyombo rahisi vya muziki")]
    }),
    createUnit({
      strand: text("Creative Projects", "Miradi ya ubunifu"),
      subStrand: text("Presentation and appreciation", "Uwasilishaji na uthamini"),
      topic: text("planning and presenting a simple creative project", "kupanga na kuwasilisha mradi rahisi wa ubunifu")
    })
  ];
}

function getHomeScienceUnits() {
  return [
    createUnit({
      strand: text("Nutrition", "Lishe"),
      subStrand: text("Healthy meals", "Milo bora"),
      topic: text("planning balanced meals and healthy eating habits", "kupanga milo bora na mazoea ya ulaji wenye afya")
    }),
    createUnit({
      strand: text("Home Care", "Utunzaji wa nyumbani"),
      subStrand: text("Household tasks", "Kazi za nyumbani"),
      topic: text("organizing safe and clean home care practices", "kupanga utunzaji salama na usafi wa nyumbani")
    }),
    createUnit({
      strand: text("Clothing and Textiles", "Mavazi na nguo"),
      subStrand: text("Fabric care", "Utunzaji wa vitambaa"),
      topic: text("caring for clothes and textiles correctly", "kutunza mavazi na vitambaa kwa usahihi")
    }),
    createUnit({
      strand: text("Consumer Education", "Elimu ya mlaji"),
      subStrand: text("Wise choices", "Maamuzi bora"),
      topic: text("making informed consumer choices for the home", "kufanya maamuzi sahihi ya ununuzi kwa ajili ya nyumba")
    })
  ];
}

function getComputerStudiesUnits() {
  return [
    createUnit({
      strand: text("Digital Literacy", "Ustadi wa kidijitali"),
      subStrand: text("Computer operations", "Uendeshaji wa kompyuta"),
      topic: text("using computer devices, files, and menus confidently", "kutumia vifaa vya kompyuta, faili, na menyu kwa ujasiri")
    }),
    createUnit({
      strand: text("Applications", "Programu tumizi"),
      subStrand: text("Productivity tools", "Zana za uzalishaji"),
      topic: text("creating work with word processing and presentation tools", "kuunda kazi kwa zana za uandishi na mawasilisho")
    }),
    createUnit({
      strand: text("Online Safety", "Usalama mtandaoni"),
      subStrand: text("Responsible use", "Matumizi yenye uwajibikaji"),
      topic: text("practising safe and responsible digital citizenship", "kutekeleza uraia wa kidijitali salama na wenye uwajibikaji")
    }),
    createUnit({
      strand: text("Problem Solving", "Utatuzi wa matatizo"),
      subStrand: text("Digital tasks", "Kazi za kidijitali"),
      topic: text("using digital tools to solve everyday tasks", "kutumia zana za kidijitali kutatua kazi za kila siku")
    })
  ];
}

function getBusinessStudiesUnits() {
  return [
    createUnit({
      strand: text("Business Environment", "Mazingira ya biashara"),
      subStrand: text("Types of businesses", "Aina za biashara"),
      topic: text("identifying and classifying business activities", "kutambua na kuainisha shughuli za biashara")
    }),
    createUnit({
      strand: text("Entrepreneurship", "Ujasiriamali"),
      subStrand: text("Opportunities and planning", "Fursa na upangaji"),
      topic: text("developing simple business ideas and plans", "kuunda mawazo na mipango rahisi ya biashara")
    }),
    createUnit({
      strand: text("Accounting", "Uhasibu"),
      subStrand: text("Records and books", "Rekodi na vitabu"),
      topic: text("keeping simple business records accurately", "kuweka rekodi rahisi za biashara kwa usahihi")
    }),
    createUnit({
      strand: text("Trade", "Biashara"),
      subStrand: text("Buying and selling", "Ununuzi na uuzaji"),
      topic: text("understanding trade processes and customer service", "kuelewa michakato ya biashara na huduma kwa wateja")
    })
  ];
}

function getPreTechnicalUnits() {
  return [
    createUnit({
      strand: text("Design Process", "Mchakato wa ubunifu"),
      subStrand: text("Planning and sketching", "Kupanga na kuchora"),
      topic: text("using the design process to solve simple challenges", "kutumia mchakato wa ubunifu kutatua changamoto rahisi")
    }),
    createUnit({
      strand: text("Tools and Materials", "Zana na vifaa"),
      subStrand: text("Safe handling", "Matumizi salama"),
      topic: text("handling tools and materials safely and correctly", "kutumia zana na vifaa kwa usalama na usahihi")
    }),
    createUnit({
      strand: text("Making Skills", "Stadi za kutengeneza"),
      subStrand: text("Construction practice", "Mazoezi ya uundaji"),
      topic: text("making simple products from planned designs", "kutengeneza bidhaa rahisi kutoka mipango iliyochorwa")
    }),
    createUnit({
      strand: text("Innovation", "Ubunifu"),
      subStrand: text("Improving products", "Kuboresha bidhaa"),
      topic: text("evaluating and improving finished products", "kutathmini na kuboresha bidhaa zilizokamilika")
    })
  ];
}

function getLifeSkillsUnits() {
  return [
    createUnit({
      strand: text("Self Awareness", "Kujitambua"),
      subStrand: text("Personal identity", "Utambulisho binafsi"),
      topic: text("understanding self, strengths, and personal goals", "kujielewa, uwezo, na malengo binafsi")
    }),
    createUnit({
      strand: text("Relationships", "Mahusiano"),
      subStrand: text("Communication and respect", "Mawasiliano na heshima"),
      topic: text("building healthy relationships through respectful communication", "kujenga mahusiano bora kupitia mawasiliano yenye heshima")
    }),
    createUnit({
      strand: text("Decision Making", "Ufanyaji wa maamuzi"),
      subStrand: text("Choices and consequences", "Maamuzi na matokeo"),
      topic: text("making thoughtful decisions in daily situations", "kufanya maamuzi ya busara katika hali za kila siku")
    }),
    createUnit({
      strand: text("Wellbeing", "Ustawi"),
      subStrand: text("Safety and resilience", "Usalama na uimara"),
      topic: text("maintaining safety, wellbeing, and resilience", "kudumisha usalama, ustawi, na uimara")
    })
  ];
}

function getFallbackUnits(subject: string) {
  return [
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Core concepts", "Dhana kuu"),
      topic: text(`understanding the main ideas in ${subject}`, `kuelewa mawazo makuu katika ${subject}`)
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Guided practice", "Mazoezi elekezi"),
      topic: text(`using ${subject} skills in guided classwork`, `kutumia stadi za ${subject} katika kazi elekezi za darasani`)
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Application", "Matumizi"),
      topic: text(`applying ${subject} knowledge in practical tasks`, `kutumia maarifa ya ${subject} katika kazi za vitendo`)
    }),
    createUnit({
      strand: text(subject, subject),
      subStrand: text("Review and assessment", "Mapitio na tathmini"),
      topic: text(`reviewing and assessing learning in ${subject}`, `kupitia na kutathmini ujifunzaji katika ${subject}`)
    })
  ];
}

function getUnitsForFamily(
  family: SchemeSubjectFamily,
  band: SchemeBand,
  subject: string
) {
  switch (family) {
    case "mathematics":
      return getMathematicsUnits(band);
    case "english":
      return getEnglishUnits(band);
    case "kiswahili":
      return getKiswahiliUnits();
    case "cre":
      return getCreUnits();
    case "religion":
      return getReligionUnits(subject);
    case "integrated-science":
      return getIntegratedScienceUnits(band);
    case "social-studies":
      return getSocialStudiesUnits();
    case "agriculture":
      return getAgricultureUnits();
    case "creative-arts":
      return getCreativeArtsUnits();
    case "home-science":
      return getHomeScienceUnits();
    case "computer-studies":
      return getComputerStudiesUnits();
    case "business-studies":
      return getBusinessStudiesUnits();
    case "pre-technical-studies":
      return getPreTechnicalUnits();
    case "life-skills":
      return getLifeSkillsUnits();
    default:
      return getFallbackUnits(subject);
  }
}

function buildTitle(input: SchemeGenerationInput) {
  return `${input.year} ${input.classLabel.toUpperCase()} ${input.subject.toUpperCase()} SCHEMES OF WORK TERM ${input.term}`;
}

function getPrimaryReference(input: SchemeGenerationInput) {
  return (
    input.textbook.trim() ||
    getSuggestedSchemeTextbook({
      stage: input.stage,
      classLabel: input.classLabel,
      subject: input.subject
    })
  );
}

function getTeacherGuideReference(
  primaryReference: string,
  language: SchemeLanguage
) {
  if (/kitabu cha mwanafunzi/i.test(primaryReference)) {
    return primaryReference.replace(
      /kitabu cha mwanafunzi/i,
      "Mwongozo wa Mwalimu"
    );
  }

  if (/learner'?s book/i.test(primaryReference)) {
    return primaryReference.replace(/learner'?s book/i, "Teacher's Guide");
  }

  return language === "sw"
    ? `${primaryReference} Mwongozo wa Mwalimu`
    : `${primaryReference} Teacher's Guide`;
}

function buildPageRange(
  week: number,
  lessonInWeek: number,
  lessonsPerWeek: number
) {
  const start = 6 + (week - 1) * Math.max(2, lessonsPerWeek) + lessonInWeek * 2;
  return {
    start,
    end: start + 1
  };
}

function buildBookReference(
  reference: string,
  pageRange: { start: number; end: number },
  language: SchemeLanguage
) {
  if (language === "sw") {
    return `${reference} uk. ${pageRange.start}-${pageRange.end}`;
  }

  return `${reference} pp. ${pageRange.start}-${pageRange.end}`;
}

function buildSubtitle(input: SchemeGenerationInput, primaryReference: string) {
  const note = input.notes.trim();

  if (input.language === "sw") {
    return note
      ? `Mpangilio wa muhula unaotumia ${primaryReference} pamoja na rejeleo la mwalimu. Mkazo maalum: ${note}.`
      : `Mpangilio wa muhula unaotumia ${primaryReference} pamoja na rejeleo la mwalimu.`;
  }

  return note
    ? `Term scheme guided by ${primaryReference} and classroom reference materials. Special focus: ${note}.`
    : `Term scheme guided by ${primaryReference} and classroom reference materials.`;
}

function getStepIndex(lessonInWeek: number) {
  return (lessonInWeek - 1) % 3;
}

function buildOutcomes(
  unit: SubjectUnit,
  input: SchemeGenerationInput,
  stepIndex: number
) {
  const topic = localize(unit.topic, input.language);

  if (input.language === "sw") {
    const starter = [
      `Kufikia mwisho wa kipindi, mwanafunzi aweze kutambua na kueleza ${topic}.`,
      `Kufikia mwisho wa kipindi, mwanafunzi aweze kutumia ${topic} katika kazi elekezi.`,
      `Kufikia mwisho wa kipindi, mwanafunzi aweze kukamilisha kazi fupi kuhusu ${topic} kwa usaidizi mdogo.`
    ][stepIndex];

    return [
      starter,
      `Kuonyesha uelewa wa ${topic} katika kazi ya darasani na ya nyumbani.`
    ];
  }

  const starter = [
    `By the end of the lesson, the learner should be able to identify and explain ${topic}.`,
    `By the end of the lesson, the learner should be able to use ${topic} correctly in guided classwork.`,
    `By the end of the lesson, the learner should be able to complete short tasks on ${topic} with minimal support.`
  ][stepIndex];

  return [
    starter,
    `Show understanding of ${topic} in class and home-based follow-up tasks.`
  ];
}

function buildExperiences(
  unit: SubjectUnit,
  input: SchemeGenerationInput,
  primaryReference: string,
  pageRange: { start: number; end: number },
  stepIndex: number
) {
  const topic = localize(unit.topic, input.language);
  const baseExperiences =
    unit.experiences?.map((item) => localize(item, input.language)) ?? [];
  const lessonBookRef = buildBookReference(
    primaryReference,
    pageRange,
    input.language
  );

  if (input.language === "sw") {
    return [
      ...baseExperiences,
      `Mwalimu aongoze majadiliano na shughuli za ${topic} akitumia ${lessonBookRef}.`,
      [
        `Wanafunzi wafanye kazi ya jozi kuhusu ${topic}.`,
        `Wanafunzi wakamilishe mazoezi ya darasani kuhusu ${topic}.`,
        `Wanafunzi wakamilishe kazi ya kujitegemea kuhusu ${topic}.`
      ][stepIndex]
    ];
  }

  return [
    ...baseExperiences,
    `Guide learners through ${topic} using ${lessonBookRef}.`,
    [
      `Learners work in pairs on introductory tasks for ${topic}.`,
      `Learners complete guided written or oral practice on ${topic}.`,
      `Learners complete independent follow-up tasks on ${topic}.`
    ][stepIndex]
  ];
}

function buildInquiry(unit: SubjectUnit, language: SchemeLanguage) {
  const topic = localize(unit.topic, language);
  const base =
    unit.inquiry?.map((item) => localize(item, language)).filter(Boolean) ?? [];

  if (language === "sw") {
    return [
      ...base,
      `Ujuzi wa ${topic} unaweza kumsaidiaje mwanafunzi katika maisha ya kila siku?`
    ];
  }

  return [
    ...base,
    `How can ${topic} support the learner in classwork and everyday life?`
  ];
}

function buildResources(
  unit: SubjectUnit,
  input: SchemeGenerationInput,
  primaryReference: string,
  teacherGuideReference: string,
  pageRange: { start: number; end: number }
) {
  const baseResources =
    unit.resources?.map((item) => localize(item, input.language)) ?? [];

  return [
    buildBookReference(primaryReference, pageRange, input.language),
    buildBookReference(teacherGuideReference, pageRange, input.language),
    ...baseResources,
    input.language === "sw"
      ? "daftari la mwanafunzi na kazi ya ufuatiliaji"
      : "learner exercise books and follow-up tasks"
  ];
}

function buildAssessment(
  unit: SubjectUnit,
  input: SchemeGenerationInput,
  stepIndex: number
) {
  const baseAssessments =
    unit.assessments?.map((item) => localize(item, input.language)) ?? [];
  const topic = localize(unit.topic, input.language);

  if (input.language === "sw") {
    return [
      ...baseAssessments,
      [
        `Maswali ya mdomo kuhusu ${topic}.`,
        `Zoezi la darasani kuhusu ${topic}.`,
        `Kazi fupi ya kujitegemea kuhusu ${topic}.`
      ][stepIndex]
    ];
  }

  return [
    ...baseAssessments,
    [
      `Oral questions on ${topic}.`,
      `Short class exercise on ${topic}.`,
      `Independent written task on ${topic}.`
    ][stepIndex]
  ];
}

function buildRows(input: SchemeGenerationInput): SchemeDocumentRow[] {
  const family = getSchemeSubjectFamily(input.subject);
  const band = resolveSchemeBand(input.stage, input.classLabel);
  const units = getUnitsForFamily(family, band, input.subject);
  const primaryReference = getPrimaryReference(input);
  const teacherGuideReference = getTeacherGuideReference(
    primaryReference,
    input.language
  );
  const rows: SchemeDocumentRow[] = [];

  for (let week = 1; week <= input.weeksInTerm; week += 1) {
    const weeklyUnit = units[(week - 1) % units.length];

    for (let lessonInWeek = 1; lessonInWeek <= input.lessonsPerWeek; lessonInWeek += 1) {
      const stepIndex = getStepIndex(lessonInWeek);
      const pageRange = buildPageRange(week, lessonInWeek, input.lessonsPerWeek);

      rows.push({
        weekLabel: String(week),
        lessonLabel: String(lessonInWeek),
        strand: localize(weeklyUnit.strand, input.language),
        subStrand: localize(weeklyUnit.subStrand, input.language),
        outcomes: buildOutcomes(weeklyUnit, input, stepIndex),
        experiences: buildExperiences(
          weeklyUnit,
          input,
          primaryReference,
          pageRange,
          stepIndex
        ),
        keyInquiryQuestions: buildInquiry(weeklyUnit, input.language),
        resources: buildResources(
          weeklyUnit,
          input,
          primaryReference,
          teacherGuideReference,
          pageRange
        ),
        assessment: buildAssessment(weeklyUnit, input, stepIndex),
        reflection: ""
      });
    }
  }

  return rows;
}

export async function generateSchemeDocumentContent(
  input: SchemeGenerationInput
): Promise<SchemeDocumentContent> {
  const primaryReference = getPrimaryReference(input);

  return {
    title: buildTitle(input),
    subtitle: buildSubtitle(input, primaryReference),
    language: input.language,
    schoolName: input.schoolName.trim(),
    teacherName: input.teacherName.trim(),
    classLabel: input.classLabel.trim(),
    subject: input.subject.trim(),
    term: input.term.trim(),
    year: input.year,
    rows: buildRows(input)
  };
}


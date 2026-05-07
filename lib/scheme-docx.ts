import "server-only";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType
} from "docx";
import type {
  AssessmentDocumentContent,
  LessonNotesDocumentContent,
  LessonPlanDocumentContent,
  MarkingSchemeDocumentContent,
  SchemeDocumentContent,
  SchemeDocumentRow,
  SchemeLanguage
} from "@/lib/types";

type ColumnDefinition = {
  title: string;
  width: number;
};

function createCellParagraphs(value: string | string[]) {
  if (Array.isArray(value)) {
    const normalized = value.filter(Boolean);

    if (normalized.length === 0) {
      return [new Paragraph({ text: "" })];
    }

    return normalized.map(
      (item) =>
        new Paragraph({
          text: item,
          spacing: {
            after: 60
          }
        })
    );
  }

  return [new Paragraph({ text: value || "" })];
}

function tableCell(content: string | string[], width: number, shading = "FFFFFF") {
  return new TableCell({
    width: {
      size: width,
      type: WidthType.DXA
    },
    margins: {
      top: 90,
      bottom: 90,
      left: 90,
      right: 90
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "1F2937" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "1F2937" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "1F2937" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "1F2937" }
    },
    shading: {
      fill: shading
    },
    children: createCellParagraphs(content)
  });
}

function getColumns(language: SchemeLanguage): ColumnDefinition[] {
  if (language === "sw") {
    return [
      { title: "Wiki", width: 700 },
      { title: "Kipindi", width: 780 },
      { title: "Mada Kuu", width: 1300 },
      { title: "Mada Ndogo", width: 1250 },
      { title: "Matokeo Mahususi", width: 2400 },
      { title: "Shughuli Za Ujifunzaji", width: 2600 },
      { title: "Maswali Dadisi", width: 1800 },
      { title: "Nyenzo", width: 1800 },
      { title: "Tathmini", width: 1800 },
      { title: "Maoni", width: 1200 }
    ];
  }

  return [
    { title: "Week", width: 700 },
    { title: "Lesson", width: 780 },
    { title: "Strand", width: 1300 },
    { title: "Sub-Strand", width: 1250 },
    { title: "Learning Outcomes", width: 2400 },
    { title: "Learning Experiences", width: 2600 },
    { title: "KIQ", width: 1800 },
    { title: "Resources", width: 1800 },
    { title: "Assessment", width: 1800 },
    { title: "Reflection", width: 1200 }
  ];
}

function formatHeaderLine(content: SchemeDocumentContent) {
  if (content.language === "sw") {
    return `MWALIMU ${content.teacherName || "........................"}    SHULE ${content.schoolName || "........................"}    MUHULA ${content.term}    MWAKA ${content.year}`;
  }

  return `TEACHER ${content.teacherName || "........................"}    SCHOOL ${content.schoolName || "........................"}    TERM ${content.term}    YEAR ${content.year}`;
}

function createHeaderRow(columns: ColumnDefinition[]) {
  return new TableRow({
    tableHeader: true,
    children: columns.map((column) =>
      new TableCell({
        width: {
          size: column.width,
          type: WidthType.DXA
        },
        margins: {
          top: 90,
          bottom: 90,
          left: 90,
          right: 90
        },
        shading: {
          fill: "E8F5E9"
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "166534" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "166534" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "166534" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "166534" }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: column.title,
                bold: true,
                size: 22
              })
            ]
          })
        ]
      })
    )
  });
}

function createDataRow(row: SchemeDocumentRow, columns: ColumnDefinition[]) {
  const values: Array<string | string[]> = [
    row.weekLabel,
    row.lessonLabel,
    row.strand,
    row.subStrand,
    row.outcomes,
    row.experiences,
    row.keyInquiryQuestions,
    row.resources,
    row.assessment,
    row.reflection
  ];
  const widths = columns.map((column) => column.width);

  return new TableRow({
    children: values.map((value, index) =>
      tableCell(value, widths[index], index % 2 === 0 ? "FFFFFF" : "FAFAFA")
    )
  });
}

export async function buildSchemeDocxBuffer(content: SchemeDocumentContent) {
  const columns = getColumns(content.language);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 540,
              right: 540
            },
            size: {
              orientation: PageOrientation.LANDSCAPE
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prepared with ELimuCore Scheme Bot",
                    italics: true,
                    color: "475569",
                    size: 18
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                underline: {},
                size: 28,
                color: "166534"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 180
            },
            children: [
              new TextRun({
                text: formatHeaderLine(content),
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.subtitle,
                size: 20,
                color: "334155"
              })
            ]
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            layout: TableLayoutType.FIXED,
            rows: [
              createHeaderRow(columns),
              ...content.rows.map((row) => createDataRow(row, columns))
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

function createStandardDocumentHeader(children: Array<Paragraph | Table>) {
  return children;
}

export async function buildLessonPlanDocxBuffer(
  content: LessonPlanDocumentContent
) {
  const language = content.language;
  const columns: ColumnDefinition[] =
    language === "sw"
      ? [
          { title: "Kipindi", width: 1200 },
          { title: "Muda", width: 900 },
          { title: "Lengo", width: 1800 },
          { title: "Matokeo Mahususi", width: 2100 },
          { title: "Utangulizi", width: 1800 },
          { title: "Shughuli za Ujifunzaji", width: 2600 },
          { title: "Nyenzo", width: 1800 },
          { title: "Tathmini", width: 1500 },
          { title: "Kazi ya Nyumbani", width: 1700 },
          { title: "Tofauti za Wanafunzi", width: 1800 }
        ]
      : [
          { title: "Lesson", width: 1200 },
          { title: "Duration", width: 900 },
          { title: "Focus", width: 1800 },
          { title: "Objectives", width: 2100 },
          { title: "Introduction", width: 1800 },
          { title: "Learning Activities", width: 2600 },
          { title: "Resources", width: 1800 },
          { title: "Assessment", width: 1500 },
          { title: "Homework", width: 1700 },
          { title: "Differentiation", width: 1800 }
        ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 540,
              right: 540
            },
            size: {
              orientation: PageOrientation.LANDSCAPE
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prepared with ELimuCore Scheme Bot",
                    italics: true,
                    color: "475569",
                    size: 18
                  })
                ]
              })
            ]
          })
        },
        children: createStandardDocumentHeader([
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                underline: {},
                size: 28,
                color: "166534"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 180
            },
            children: [
              new TextRun({
                text:
                  language === "sw"
                    ? `MWALIMU ${content.teacherName || "........................"}    SHULE ${content.schoolName || "........................"}    MUHULA ${content.term}    MWAKA ${content.year}`
                    : `TEACHER ${content.teacherName || "........................"}    SCHOOL ${content.schoolName || "........................"}    TERM ${content.term}    YEAR ${content.year}`,
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.subtitle,
                size: 20,
                color: "334155"
              })
            ]
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            layout: TableLayoutType.FIXED,
            rows: [
              createHeaderRow(columns),
              ...content.lessons.map(
                (lesson) =>
                  new TableRow({
                    children: [
                      tableCell(lesson.lessonLabel, columns[0].width),
                      tableCell(lesson.duration, columns[1].width, "FAFAFA"),
                      tableCell(lesson.focus, columns[2].width),
                      tableCell(lesson.objectives, columns[3].width, "FAFAFA"),
                      tableCell(lesson.introduction, columns[4].width),
                      tableCell(lesson.activities, columns[5].width, "FAFAFA"),
                      tableCell(lesson.materials, columns[6].width),
                      tableCell(lesson.assessment, columns[7].width, "FAFAFA"),
                      tableCell(lesson.homework, columns[8].width),
                      tableCell(
                        lesson.differentiation,
                        columns[9].width,
                        "FAFAFA"
                      )
                    ]
                  })
              )
            ]
          })
        ])
      }
    ]
  });

  return Packer.toBuffer(doc);
}

export async function buildAssessmentDocxBuffer(
  content: AssessmentDocumentContent
) {
  const isSwahili = content.language === "sw";
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              bottom: 900,
              left: 720,
              right: 720
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prepared with ELimuCore Scheme Bot",
                    italics: true,
                    color: "475569",
                    size: 18
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                underline: {},
                size: 28,
                color: "166534"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text:
                  isSwahili
                    ? `${content.classLabel} - ${content.subject} - Muhula ${content.term} - ${content.year}`
                    : `${content.classLabel} - ${content.subject} - Term ${content.term} - ${content.year}`,
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.subtitle,
                size: 20,
                color: "334155"
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 160
            },
            children: [
              new TextRun({
                text: isSwahili
                  ? `Muda: Dakika ${content.durationMinutes}    Jumla ya Alama: ${content.totalMarks}`
                  : `Duration: ${content.durationMinutes} minutes    Total Marks: ${content.totalMarks}`,
                bold: true,
                size: 22
              })
            ]
          }),
          ...content.instructions.map(
            (instruction) =>
              new Paragraph({
                spacing: {
                  after: 80
                },
                children: [
                  new TextRun({
                    text: `- ${instruction}`,
                    size: 20
                  })
                ]
              })
          ),
          ...content.sections.flatMap((section) => [
            new Paragraph({
              spacing: {
                before: 180,
                after: 80
              },
              children: [
                new TextRun({
                  text: section.title,
                  bold: true,
                  size: 24,
                  color: "166534"
                })
              ]
            }),
            new Paragraph({
              spacing: {
                after: 120
              },
              children: [
                new TextRun({
                  text: section.instructions,
                  italics: true,
                  size: 20,
                  color: "475569"
                })
              ]
            }),
            ...section.items.flatMap((item) => [
              new Paragraph({
                spacing: {
                  after: 80
                },
                children: [
                  new TextRun({
                    text: `${item.numberLabel} ${item.prompt} (${item.marks} ${
                      isSwahili ? "alama" : "marks"
                    })`,
                    bold: true,
                    size: 21
                  })
                ]
              }),
              new Paragraph({
                spacing: {
                  after: 120
                },
                children: [
                  new TextRun({
                    text: isSwahili
                      ? `Mwongozo wa mwalimu: ${item.expectedAnswer}`
                      : `Teacher guide: ${item.expectedAnswer}`,
                    size: 19,
                    color: "334155"
                  })
                ]
              })
            ])
          ])
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

export async function buildMarkingSchemeDocxBuffer(
  content: MarkingSchemeDocumentContent
) {
  const isSwahili = content.language === "sw";
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              bottom: 900,
              left: 720,
              right: 720
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prepared with ELimuCore Scheme Bot",
                    italics: true,
                    color: "475569",
                    size: 18
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                underline: {},
                size: 28,
                color: "166534"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text:
                  isSwahili
                    ? `${content.classLabel} - ${content.subject} - Muhula ${content.term} - ${content.year}`
                    : `${content.classLabel} - ${content.subject} - Term ${content.term} - ${content.year}`,
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.subtitle,
                size: 20,
                color: "334155"
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 160
            },
            children: [
              new TextRun({
                text: isSwahili
                  ? `Jumla ya Alama: ${content.totalMarks}`
                  : `Total Marks: ${content.totalMarks}`,
                bold: true,
                size: 22
              })
            ]
          }),
          ...content.sections.flatMap((section) => [
            new Paragraph({
              spacing: {
                before: 180,
                after: 80
              },
              children: [
                new TextRun({
                  text: section.title,
                  bold: true,
                  size: 24,
                  color: "166534"
                })
              ]
            }),
            new Paragraph({
              spacing: {
                after: 120
              },
              children: [
                new TextRun({
                  text: section.guidance,
                  italics: true,
                  size: 20,
                  color: "475569"
                })
              ]
            }),
            ...section.items.flatMap((item) => [
              new Paragraph({
                spacing: {
                  after: 60
                },
                children: [
                  new TextRun({
                    text: `${item.questionLabel} ${item.prompt} (${item.marks} ${
                      isSwahili ? "alama" : "marks"
                    })`,
                    bold: true,
                    size: 21
                  })
                ]
              }),
              ...item.answerPoints.map(
                (point) =>
                  new Paragraph({
                    spacing: {
                      after: 50
                    },
                    children: [
                      new TextRun({
                        text: `- ${point}`,
                        size: 19,
                        color: "334155"
                      })
                    ]
                  })
              ),
              new Paragraph({
                spacing: {
                  after: 100
                },
                text: ""
              })
            ])
          ])
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

export async function buildLessonNotesDocxBuffer(
  content: LessonNotesDocumentContent
) {
  const isSwahili = content.language === "sw";
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              bottom: 900,
              left: 720,
              right: 720
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prepared with ELimuCore Scheme Bot",
                    italics: true,
                    color: "475569",
                    size: 18
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text: content.title,
                bold: true,
                underline: {},
                size: 28,
                color: "166534"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 120
            },
            children: [
              new TextRun({
                text:
                  isSwahili
                    ? `${content.classLabel} - ${content.subject} - Muhula ${content.term} - ${content.year}`
                    : `${content.classLabel} - ${content.subject} - Term ${content.term} - ${content.year}`,
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: {
              after: 140
            },
            children: [
              new TextRun({
                text: content.subtitle,
                size: 20,
                color: "334155"
              })
            ]
          }),
          ...content.sections.flatMap((section) => [
            new Paragraph({
              spacing: {
                before: 180,
                after: 80
              },
              children: [
                new TextRun({
                  text: section.sectionLabel,
                  bold: true,
                  size: 24,
                  color: "166534"
                })
              ]
            }),
            new Paragraph({
              spacing: {
                after: 100
              },
              children: [
                new TextRun({
                  text: section.focus,
                  size: 20,
                  color: "475569"
                })
              ]
            }),
            new Paragraph({
              spacing: {
                after: 60
              },
              children: [
                new TextRun({
                  text: isSwahili ? "Malengo" : "Objectives",
                  bold: true,
                  size: 21
                })
              ]
            }),
            ...section.objectives.map(
              (item) =>
                new Paragraph({
                  spacing: {
                    after: 50
                  },
                  children: [
                    new TextRun({
                      text: `- ${item}`,
                      size: 19
                    })
                  ]
                })
            ),
            new Paragraph({
              spacing: {
                before: 90,
                after: 60
              },
              children: [
                new TextRun({
                  text: isSwahili ? "Maelezo ya Somo" : "Lesson Notes",
                  bold: true,
                  size: 21
                })
              ]
            }),
            ...section.explanation.map(
              (item) =>
                new Paragraph({
                  spacing: {
                    after: 50
                  },
                  children: [
                    new TextRun({
                      text: `- ${item}`,
                      size: 19
                    })
                  ]
                })
            ),
            new Paragraph({
              spacing: {
                before: 90,
                after: 60
              },
              children: [
                new TextRun({
                  text: isSwahili ? "Mifano" : "Examples",
                  bold: true,
                  size: 21
                })
              ]
            }),
            ...section.examples.map(
              (item) =>
                new Paragraph({
                  spacing: {
                    after: 50
                  },
                  children: [
                    new TextRun({
                      text: `- ${item}`,
                      size: 19
                    })
                  ]
                })
            ),
            new Paragraph({
              spacing: {
                before: 90,
                after: 60
              },
              children: [
                new TextRun({
                  text: isSwahili ? "Kazi ya Wanafunzi" : "Learner Tasks",
                  bold: true,
                  size: 21
                })
              ]
            }),
            ...section.learnerTasks.map(
              (item) =>
                new Paragraph({
                  spacing: {
                    after: 50
                  },
                  children: [
                    new TextRun({
                      text: `- ${item}`,
                      size: 19
                    })
                  ]
                })
            ),
            new Paragraph({
              spacing: {
                before: 90,
                after: 60
              },
              children: [
                new TextRun({
                  text: isSwahili ? "Msaada wa Nyumbani" : "Home Support",
                  bold: true,
                  size: 21
                })
              ]
            }),
            ...section.homeSupport.map(
              (item) =>
                new Paragraph({
                  spacing: {
                    after: 50
                  },
                  children: [
                    new TextRun({
                      text: `- ${item}`,
                      size: 19
                    })
                  ]
                })
            )
          ])
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

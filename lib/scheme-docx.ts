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

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { ReportData } from "../stores/ExportViewModel";
import { ExportOptions } from "../models/ViewModel_Models";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";


export const generateWordDocument = async (reportData: ReportData, exportOptions: ExportOptions, fileName: string): Promise<string> => {
	try {
		// Create document sections based on export options
		const sections: Paragraph[] = [];

		// Title
		sections.push(
			new Paragraph({
				children: [
					new TextRun({
						text: `Monthly Job Report For ${reportData.userName}`,
						bold: true,
						underline: { type: "single" },
						size: 28,
					}),
				],
				heading: HeadingLevel.TITLE,
				alignment: AlignmentType.CENTER,
				spacing: { after: 400 },
			})
		);

		// User Roles (Position)
		if (exportOptions.includeUserRoles && reportData.userRoles) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Position: ",
							bold: true,
						}),
						new TextRun({
							text: reportData.userRoles,
						}),
					],
					spacing: { after: 200 },
				})
			);
		}

		// Reporting Period
		sections.push(
			new Paragraph({
				children: [
					new TextRun({
						text: "Reporting Period: ",
						bold: true,
					}),
					new TextRun({
						text: reportData.reportingPeriod,
					}),
				],
				spacing: { after: 400 },
			})
		);

		// Work Schedule
		if (exportOptions.includeWorkSchedule && reportData.workSchedule) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Work Schedule",
							bold: true,
							size: 24,
						}),
					],
					heading: HeadingLevel.HEADING_1,
					spacing: { before: 400, after: 200 },
				})
			);
			reportData.workSchedule.forEach((schedule) => {
				sections.push(
					new Paragraph({
						children: [
							// Use the new WorkSchedulePeriod properties
							new TextRun({
								text: `From: ${schedule.start} to ${schedule.end}, Time In: ${schedule.expected_time_in}, Time Out: ${schedule.expected_time_out}`,
							}),
						],
						spacing: { after: 100 },
					})
				);
			});
		}

		// Responsibilities Summary
		if (exportOptions.includeResponsibilitiesSummary && reportData.responsibilitiesSummary) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Monthly Summary of Responsibilities",
							bold: true,
							size: 24,
						}),
					],
					heading: HeadingLevel.HEADING_1,
					spacing: { before: 400, after: 200 },
				})
			);
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: reportData.responsibilitiesSummary,
						}),
					],
					spacing: { after: 400 },
					alignment: AlignmentType.JUSTIFIED,
				})
			);
		}

		// Key Contributions
		if (exportOptions.includeKeyContributions && reportData.keyContributions) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Key Contributions",
							bold: true,
							size: 24,
						}),
					],
					heading: HeadingLevel.HEADING_1,
					spacing: { before: 400, after: 200 },
				})
			);
			reportData.keyContributions.forEach((contribution, index) => {
				sections.push(
					new Paragraph({
						children: [
							new TextRun({
								text: `${index + 1}. ${contribution.title}`,
								bold: true,
								size: 22,
							}),
						],
						heading: HeadingLevel.HEADING_2,
						spacing: { before: 300, after: 100 },
					})
				);
				sections.push(
					new Paragraph({
						children: [
							// Use the new KeyContribution property 'content' instead of 'description'
							new TextRun({
								text: contribution.content,
							}),
						],
						spacing: { after: 200 },
						alignment: AlignmentType.JUSTIFIED,
					})
				);
			});
		}

		// Daily Log
		if (exportOptions.includeDailyLog && reportData.detailedDailyLog) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Detailed Daily Log",
							bold: true,
							size: 24,
						}),
					],
					heading: HeadingLevel.HEADING_1,
					spacing: { before: 400, after: 200 },
				})
			);
			reportData.detailedDailyLog.forEach((day) => {
				sections.push(
					new Paragraph({
						children: [
							// Use the new DayDetails property 'day' instead of 'date'
							new TextRun({
								text: day.day?.date ?? undefined,
								bold: true,
								size: 22,
							}),
						],
						heading: HeadingLevel.HEADING_2,
						spacing: { before: 300, after: 100 },
					})
				);

				// Check for special activities and list them
				if (exportOptions.includeSpecialActivities && day.specialActivities && day.specialActivities.length > 0) {
					sections.push(
						new Paragraph({
							children: [
								new TextRun({
									text: "Special Activities:",
									bold: true,
								}),
							],
							spacing: { after: 100 },
						})
					);
					day.specialActivities.forEach((activity) => {
						sections.push(
							new Paragraph({
								children: [
									new TextRun({
										text: `- ${activity}`,
									}),
								],
								spacing: { after: 100 },
								indent: { left: 360 },
							})
						);
					});
				}

				// List regular activities
				if (day.activities && day.activities.length > 0) {
					day.activities.forEach((activity) => {
						sections.push(
							new Paragraph({
								children: [
									new TextRun({
										text: `• ${activity}`,
									}),
								],
								spacing: { after: 100 },
								indent: { left: 720 }, // Indent for bullet points
							})
						);
					});
				}
			});
		}

		// Conclusions
		if (exportOptions.includeConclusions && reportData.conclusions) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Conclusion",
							bold: true,
							size: 24,
						}),
					],
					heading: HeadingLevel.HEADING_1,
					spacing: { before: 400, after: 200 },
				})
			);
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: reportData.conclusions,
						}),
					],
					spacing: { after: 400 },
					alignment: AlignmentType.JUSTIFIED,
				})
			);
		}

		// Create the document
		const doc = new Document({
			sections: [
				{
					properties: {},
					children: sections,
				},
			],
		});

		// Generate the document buffer
		const buffer = await Packer.toBuffer(doc);

		// Convert buffer to base64 for file system
		const base64 = buffer.toString("base64");

		// Create file path
		const fileUri = `${FileSystem.documentDirectory}${fileName}.docx`;

        return fileUri
		
	} catch (error) {
		console.error("Error generating Word document:", error);
		throw new Error("Failed to generate Word document");
	}
};

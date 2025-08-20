import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { ReportData } from "../stores/ExportViewModel";
import { ExportOptions } from "../models/ViewModel_Models";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { formatHumanFriendlyDate } from "./DateFormatUtil";

/**
 * Generates and saves a Word document as a Base64 string for mobile platforms.
 *
 * @param reportData The data to be included in the report.
 * @param exportOptions The options for which sections to include in the report.
 * @param fileName The desired name of the output file.
 * @returns A Promise that resolves when the document is successfully generated and shared.
 */
export const generateWordDocument = async (reportData: ReportData, exportOptions: ExportOptions, fileName: string): Promise<string> => {
	try {
		// Create document sections based on export options
		const sections: Paragraph[] = [];
		let userRoles: string[] = [];

		if (reportData.userRoles) {
			userRoles = JSON.parse(reportData.userRoles);
            console.log("User roles: ", userRoles)
		}

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
		if (exportOptions.includeUserRoles && userRoles.length > 0) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({
							text: "Position(s): ",
							bold: true,
						}),
					],
					spacing: { after: 100 },
				})
			);
			// Iterate over the array of user roles
			userRoles.forEach((role) => {
				sections.push(
					new Paragraph({
						children: [
							new TextRun({
								text: `- ${role}`,
							}),
						],
						spacing: { after: 100 },
						indent: { left: 360 },
					})
				);
			});
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
			reportData.detailedDailyLog.forEach((dayDetails) => {
				if (dayDetails.day) {
					sections.push(
						new Paragraph({
							children: [
								new TextRun({
									// Format the date to be human-friendly
									text: formatHumanFriendlyDate(dayDetails.day.date),
									bold: true,
									size: 22,
								}),
							],
							heading: HeadingLevel.HEADING_2,
							spacing: { before: 300, after: 100 },
						})
					);
				}

				if (exportOptions.includeSpecialActivities && dayDetails.specialActivities && dayDetails.specialActivities.length > 0) {
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
					dayDetails.specialActivities.forEach((activity) => {
						sections.push(
							new Paragraph({
								children: [
									new TextRun({
										// Use the 'content' property from the SpecialActivity object
										text: `- ${activity.content}`,
									}),
								],
								spacing: { after: 100 },
								indent: { left: 360 },
							})
						);
					});
				}

				if (dayDetails.activities && dayDetails.activities.length > 0) {
					dayDetails.activities.forEach((activity) => {
						sections.push(
							new Paragraph({
								children: [
									new TextRun({
										// Use the 'content' property from the Activity object
										text: `• ${activity.content}`,
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

		// Generate the document as a Base64 string, which is platform-agnostic
		const base64 = await Packer.toBase64String(doc);

		// Create file path
		const fileUri = `${FileSystem.documentDirectory}${fileName}.docx`;

		// Write the Base64 string directly to the file
		await FileSystem.writeAsStringAsync(fileUri, base64, {
			encoding: FileSystem.EncodingType.Base64,
		});
		return fileUri;
	} catch (error) {
		console.error("Error generating Word document:", error);
		throw new Error("Failed to generate Word document");
	}
};

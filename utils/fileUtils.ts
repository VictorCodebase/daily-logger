import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { createResponsibilitiesSummary } from "../services/DatabaseCreateService";
import { dayExists, readDay, readUser, responsibilitiesSummaryExists } from "../services/DatabaseReadService";
import { KeyContribution, WorkSchedulePeriod, DayDetails, ExportOptions } from "../models/ViewModel_Models";
import { extractWorkSchedulePeriods, formatDate, getDatesInRange, ReportData } from "../stores/ExportViewModel";
import { generateCreativeHTML, generateMonotoneHTML, generateProfessionalHTML, generateSimpleHTML, savePDFToDevice } from "./ExportPDFUtil";
import { generateWordDocument } from "./ExportWordUtil";

// /**
//  * Save Word document (.docx) to device storage
//  */
// const saveWordToDevice = async (data: ReportData, options: ExportOptions, fileName: string): Promise<string> => {
// 	try {
// 		// Generate DOCX blob
// 		const blob = await generateDocxDocument(data, options);

// 		// Convert blob to base64
// 		const reader = new FileReader();
// 		const base64Promise = new Promise<string>((resolve, reject) => {
// 			reader.onloadend = () => {
// 				const base64 = (reader.result as string).split(",")[1];
// 				resolve(base64);
// 			};
// 			reader.onerror = reject;
// 		});

// 		reader.readAsDataURL(blob);
// 		const base64Data = await base64Promise;

// 		const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

// 		await FileSystem.writeAsStringAsync(destinationUri, base64Data, {
// 			encoding: FileSystem.EncodingType.Base64,
// 		});

// 		return destinationUri;
// 	} catch (error) {
// 		console.error("Error saving Word document:", error);
// 		throw error;
// 	}
// };

/**
 * Enhanced generateReport function with document creation and saving
 */
export async function generateReport(
	startDate: string,
	endDate: string,
	userId: number,
	responsibilitiesSummaryInput: string | null,
	keyContributions: KeyContribution[] = [],
	conclusions: string | null = null,
	exportOptions: ExportOptions
): Promise<{ success: boolean; filePath?: string; fileName?: string; error?: string }> {
	try {
		const user = await readUser(userId);
		if (!user) {
			console.error("Error: User not found.");
			return { success: false, error: "User not found." };
		}

		let responsibilitiesSummaryContent: string | null = null;
		if (exportOptions.includeResponsibilitiesSummary && responsibilitiesSummaryInput && responsibilitiesSummaryInput.length > 0) {
			const summaryId = await responsibilitiesSummaryExists(userId);
			if (!summaryId) {
				try {
					const newId = await createResponsibilitiesSummary(responsibilitiesSummaryInput, userId);
					if (newId) {
						responsibilitiesSummaryContent = responsibilitiesSummaryInput;
					} else {
						console.error("Failed to create new responsibilities summary.");
					}
				} catch (error) {
					console.error("Error creating responsibilities summary:", error);
				}
			}
		}

		const dailyLogs: DayDetails[] = [];
		const dateRange = getDatesInRange(startDate, endDate);

		for (const date of dateRange) {
			const dayId = await dayExists(date);
			if (dayId) {
				const dayDetails = await readDay(dayId);
				if (dayDetails) {
					dailyLogs.push(dayDetails);
				}
			}
		}

		const reportData: ReportData = {
			reportTitle: `Monthly Job Report For ${user.name}`,
			userName: user.name,
			reportingPeriod: `${formatDate(startDate)} – ${formatDate(endDate)}`,
		};

		if (exportOptions.includeUserRoles && user.role) {
			reportData.userRoles = user.role;
		}

		if (exportOptions.includeWorkSchedule && user.work_schedule) {
			const workSchedule = extractWorkSchedulePeriods(user.work_schedule);
			if (workSchedule && workSchedule.length > 0) {
				reportData.workSchedule = workSchedule;
			}
		}

		if (exportOptions.includeResponsibilitiesSummary && responsibilitiesSummaryContent) {
			reportData.responsibilitiesSummary = responsibilitiesSummaryContent;
		}

		if (exportOptions.includeKeyContributions && keyContributions.length > 0) {
			reportData.keyContributions = keyContributions;
		}

		if (exportOptions.includeDailyLog && dailyLogs.length > 0) {
			reportData.detailedDailyLog = dailyLogs;
		}

		if (exportOptions.includeConclusions && conclusions) {
			reportData.conclusions = conclusions;
		}

		const fileName = generateFileName(user.name, startDate, endDate, exportOptions.outputFormat);

		// Save the document
		let filePath: string;
		if (exportOptions.outputFormat === "pdf") {
			// Generate the HTML content
			let htmlContent: string;
			switch (exportOptions.documentFormat) {
				case "professional":
					htmlContent = generateProfessionalHTML(reportData, exportOptions);
					break;
				case "monotone":
					htmlContent = generateMonotoneHTML(reportData, exportOptions);
					break;
				case "simple":
					htmlContent = generateSimpleHTML(reportData, exportOptions);
					break;
				case "creative":
					htmlContent = generateCreativeHTML(reportData, exportOptions);
					break;
                case "word": // default to creative - just a temporary fix
                    htmlContent = generateCreativeHTML(reportData, exportOptions);
					break;
				default:
					// Fallback to a default format if an invalid one is somehow selected
					htmlContent = generateProfessionalHTML(reportData, exportOptions);
					break;
			}

			filePath = await savePDFToDevice(htmlContent, fileName);
		} else {
			filePath = await generateWordDocument(reportData, exportOptions, fileName);
		}

		// if (exportOptions.outputFormat === "pdf") {
		// 	filePath = await savePDFToDevice(htmlContent, fileName);
		// } else {
		// 	filePath = await saveWordToDevice(reportData, exportOptions, fileName);
		// }

		// Generate filename

		console.log(`Report generated successfully: ${filePath}`);

		// Optionally share the file
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(filePath, {
				mimeType: exportOptions.outputFormat === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				dialogTitle: "Share Report",
			});
		}

		return {
			success: true,
			filePath,
			fileName,
		};
	} catch (error) {
		console.error("Error generating report:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}


/**
 * Generate filename based on user name and date range
 */
const generateFileName = (userName: string, startDate: string, endDate: string, format: "pdf" | "word"): string => {
    const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "_");
    const startFormatted = new Date(startDate)
        .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        })
        .replace(/[^a-zA-Z0-9]/g, "_");
    const endFormatted = new Date(endDate)
        .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        })
        .replace(/[^a-zA-Z0-9]/g, "_");

    return `${sanitizedName}_Report_${startFormatted}_to_${endFormatted}.${format}`;
};


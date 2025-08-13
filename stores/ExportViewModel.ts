

import { User, Day, KeyContribution, WorkSchedulePeriod, DayDetails } from "../models/ViewModel_Models";

// Importing real database service methods from a parent directory
import { dayExists, readDay, readUser } from "../services/DatabaseReadService";
import { createResponsibilitiesSummary } from "../services/DatabaseCreateService";

// Define WorkSchedulePeriod interface since it's used here and wasn't in the provided models

// Define the interface for the report's content options.
export interface ExportOptions {
	includeUserRoles: boolean;
	includeWorkSchedule: boolean;
	includeResponsibilitiesSummary: boolean;
	includeKeyContributions: boolean;
	includeSpecialActivities: boolean;
	includeDailyLog: boolean;
	includeConclusions: boolean;
	outputFormat: "pdf" | "word";
}

// Define an interface for the fully structured report data.
export interface ReportData {
	reportTitle: string;
	userName: string;
	userRoles?: string;
	reportingPeriod: string;
	workSchedule?: WorkSchedulePeriod[];
	responsibilitiesSummary?: string;
	keyContributions?: KeyContribution[];
	detailedDailyLog?: DayDetails[];
	conclusions?: string;
}

/**
 * Helper to get all dates between two timestamps.
 * @param startDate The start date (YYYY-MM-DD).
 * @param endDate The end date (YYYY-MM-DD).
 * @returns An array of date strings.
 */
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
	const dates: string[] = [];
	let currentDate = new Date(startDate);
	const lastDate = new Date(endDate);

	while (currentDate <= lastDate) {
		dates.push(currentDate.toISOString().slice(0, 10));
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates;
};

/**
 * Helper to format a date string for display.
 * @param dateString A date string in 'YYYY-MM-DD' format.
 * @returns A formatted date string (e.g., 'June 28 2025').
 */
export const formatDate = (dateString: string): string => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	const date = new Date(dateString + "T00:00:00"); // Add time to avoid timezone issues.
	return date.toLocaleDateString("en-US", options);
};

/**
 * Helper to format the structured report data into a Markdown string.
 * This simulates the final document content.
 * @param data The structured report data.
 * @param options The export options to determine which sections to include.
 * @returns A string in Markdown format.
 */
export const formatReportContent = (data: ReportData, options: ExportOptions): string => {
	let content = `# ${data.reportTitle}\n\n`;

	content += `*Reporting Period:* ${data.reportingPeriod}\n\n`;

	if (options.includeUserRoles && data.userRoles) {
		content += `**Position:** ${data.userRoles}\n\n`;
	}

	if (options.includeWorkSchedule && data.workSchedule) {
		content += `**Work Schedule**\n\n`;
		data.workSchedule.forEach((schedule) => {
			content += `${schedule.start} – ${schedule.end}: ${schedule.expected_time_in} – ${schedule.expected_time_out}\n`;
		});
		content += `\n`;
	}

	if (options.includeResponsibilitiesSummary && data.responsibilitiesSummary) {
		content += `**Monthly Summary of Responsibilities**\n\n`;
		content += `${data.responsibilitiesSummary}\n\n`;
	}

	if (options.includeKeyContributions && data.keyContributions) {
		content += `**Key Contributions**\n\n`;
		data.keyContributions.forEach((contribution, index) => {
			content += `${index + 1}. **${contribution.title}**\n\n`;
			content += `${contribution.content}\n\n`;
		});
	}

	if (options.includeDailyLog && data.detailedDailyLog) {
		content += `**Detailed Daily Log**\n\n`;
		data.detailedDailyLog.forEach((dayDetails) => {
			const day = dayDetails.day;
			if (day) {
				const dayDate = new Date(day.date + "T00:00:00"); // Add time to avoid timezone issues.
				const weekday = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
				content += `### ${formatDate(day.date)}: ${weekday}\n\n`;
				content += `**Time In:** ${day.time_in || "N/A"}\n`;
				content += `**Time Out:** ${day.time_out || "N/A"}\n\n`;

				if (dayDetails.activities) {
					dayDetails.activities.forEach((activity) => {
						const time = activity.time_start && activity.time_end ? `${activity.time_start} - ${activity.time_end}` : "";
						content += `* **${time}**: ${activity.content}\n`;
					});
					content += `\n`;
				}

				if (options.includeSpecialActivities && dayDetails.specialActivities) {
					content += `#### Special Activities\n\n`;
					dayDetails.specialActivities.forEach((spActivity) => {
						content += `* ${spActivity.content}\n`;
					});
					content += `\n`;
				}
			}
		});
	}

	if (options.includeConclusions && data.conclusions) {
		content += `**Conclusion**\n\n`;
		content += `${data.conclusions}\n\n`;
	}

	return content;
};

/**
 * The main exported method to generate the report data.
 * This function orchestrates all the helper functions and database calls.
 * @param startDate The start date of the reporting period (YYYY-MM-DD).
 * @param endDate The end date of the reporting period (YYYY-MM-DD).
 * @param userId The ID of the user.
 * @param responsibilitiesSummaryInput The responsibilities summary content or its ID.
 * @param keyContributions An array of KeyContribution objects.
 * @param conclusions The concluding remarks for the report.
 * @param exportOptions The options for the final report content.
 * @returns A promise that resolves to the formatted report as a Markdown string.
 */
export async function generateReport(
	startDate: string,
	endDate: string,
	userId: number,
	responsibilitiesSummaryInput: string | number | null,
	keyContributions: KeyContribution[] = [],
	conclusions: string | null = null,
	exportOptions: ExportOptions
): Promise<string> {
	const user = await readUser(userId);
	if (!user) {
		console.error("Error: User not found.");
		return "User not found.";
	}

	let responsibilitiesSummaryContent: string | null = null;
	if (typeof responsibilitiesSummaryInput === "string" && responsibilitiesSummaryInput.length > 0) {
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
	} else if (typeof responsibilitiesSummaryInput === "number") {
		// NOTE: The mock service had this logic. In a real-world app, you would
		// have a dedicated read method for responsibilities summaries. For now,
		// we'll assume the string-based input is preferred if a summary is
		// to be included. If an ID is provided, you would call a service like
		// `readResponsibilitiesSummary(responsibilitiesSummaryInput)` here.
		// As a fallback, we'll assume the responsibilities summary content
		// should be provided as a string if it's to be included.
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

	if (exportOptions.includeUserRoles && user.roles_positions) {
		reportData.userRoles = user.roles_positions;
	}

	if (exportOptions.includeWorkSchedule && user.work_schedule) {
		reportData.workSchedule = JSON.parse(user.work_schedule);
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

	return formatReportContent(reportData, exportOptions);
}

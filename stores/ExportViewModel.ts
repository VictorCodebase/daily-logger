
import {ResponsibilitiesSummary, KeyContribution, WorkSchedulePeriod, DayDetails } from "../models/ViewModel_Models";

// Importing real database service methods from a parent directory
import { readDays, responsibilitiesSummaryExists, readResponsibilitySummary } from "../services/DatabaseReadService";

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
 * Fetches a list of all active day IDs and their dates for calendar highlighting.
 * @returns A promise that resolves to an array of objects with day_id and date.
 */
export async function fetchActiveDays(): Promise<
	| {
			day_id: number;
			date: string;
	  }[]
	| null
> {
	try {
		return readDays();
	} catch (error) {
		console.error("Error fetching active days:", error);
		return null;
	}
}

/**
 * Checks if a responsibilities summary exists for the current user and returns its content.
 * @param user_id The foreign key to the User table.
 * @returns A promise that resolves to the ResponsibilitiesSummary object if it exists, otherwise null.
 */
export async function getResponsibilitiesSummary(user_id: number): Promise<ResponsibilitiesSummary | null> {
	try {
		const summaryId = await responsibilitiesSummaryExists(user_id);
		console.log("summary id: ",summaryId);
		if (summaryId) {
			return await readResponsibilitySummary(summaryId);
		}
	} catch (error) {
		console.error("Error fetching responsibilities summary:", error);
	}
	return null;
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


export function extractWorkSchedulePeriods(workScheduleStr: string): WorkSchedulePeriod[] {
	try {
		// Parse the JSON string
		const parsed = JSON.parse(workScheduleStr);

		// Check if periods exists and is an array
		if (parsed && Array.isArray(parsed.periods)) {
			return parsed.periods as WorkSchedulePeriod[];
		}

		// If structure is invalid, return empty array
		return [];
	} catch (error) {
		console.error("Failed to parse work schedule string:", error);
		return [];
	}
}

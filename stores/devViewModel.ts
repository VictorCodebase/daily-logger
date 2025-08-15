import { createDay, createActivity, createSpecialActivity, createLogTemplate } from "../services/DatabaseCreateService";

import { dayExists, logTemplatesExist, readLogTemplate } from "../services/DatabaseReadService";

import { formatDateForSQLite, formatTimeForSQLite, getFormattedDate } from "../utils/DateFormatUtil";

interface RawActivity {
	content: string;
	category: string;
	time_start: string;
	time_end: string;
}

interface RawDate {
	date: string;
	time_in: string;
	time_out: string;
}

export interface TemplateContent {
	dayData: {
		date: string;
		time_in: string;
		time_out: string;
	};
	activities: RawActivity[];
	specialActivities: RawActivity[];
}


/**
 * Saves a list of daily activities and special activities to the database.
 * This function handles the full workflow: checking for the day, creating it if necessary,
 * and then saving all the associated activities.
 *
 * @param rawDate the raw date object.
 * @param activities A list of raw activity objects.
 * @param specialActivities A list of raw special activity objects.
 * @returns A promise that resolves to true on success, or false on failure.
 */
export async function saveActivities(rawDate: RawDate, activities: RawActivity[], specialActivities: RawActivity[]): Promise<boolean> {
	try {
		if (activities.length === 0) {
			console.error("Activities list cannot be empty.");
			return false;
		}

		const formattedDate = formatDateForSQLite(rawDate.date);
		let dayId: number | null = await dayExists(formattedDate);

		// If the day doesn't exist, create it.
		if (dayId === null) {
			const timeIn = rawDate.time_in;
			const timeOut = rawDate.time_out;
			dayId = await createDay(formattedDate, timeIn, timeOut);
		}

		// If we still don't have a day ID, something went wrong.
		if (dayId === null) {
			console.error("Failed to get or create a day ID.");
			return false;
		}

		// --- Save all regular activities ---
		const activityPromises = activities.map(async (activity) => {
			const timeStart = formatTimeForSQLite(activity.time_start);
			const timeEnd = formatTimeForSQLite(activity.time_end);
			return createActivity(activity.content, timeStart, timeEnd, activity.category, dayId!);
		});

		// --- Save all special activities ---
		const specialActivityPromises = specialActivities.map(async (activity) => {
			const timeStart = formatTimeForSQLite(activity.time_start);
			const timeEnd = formatTimeForSQLite(activity.time_end);
			return createSpecialActivity(activity.content, timeStart, timeEnd, activity.category, dayId!);
		});

		// Run all creation promises concurrently
		const results = await Promise.all([...activityPromises, ...specialActivityPromises]);

		// Check for any failures
		if (results.some((result) => result === null)) {
			console.error("One or more activities failed to save.");
			return false;
		}

		console.log(`Successfully saved all activities for day ID: ${dayId}`);
		return true;
	} catch (error) {
		console.error("Error in saveActivities:", error);
		return false;
	}
}

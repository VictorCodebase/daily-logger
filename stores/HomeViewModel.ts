import { createDay, createActivity, createSpecialActivity, createLogTemplate } from "../services/DatabaseCreateService";

import { dayExists, logTemplatesExist, readLogTemplate } from "../services/DatabaseReadService";

import { formatDateForSQLite, formatTimeForSQLite, getFormattedDate } from "../utils/DateFormatUtil";

// Define the shape of your raw activity objects
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

/**
 * Creates a new log template from the provided data.
 * @param name The name of the template.
 * @param description A description for the template.
 * @param colorCode A color code associated with the template.
 * @param contentJson The content of the template as a JSON string.
 * @returns A promise that resolves to true on success, or false on failure.
 */
export async function createTemplate(name: string, description: string, colorCode: string, contentJson: string): Promise<boolean> {
	try {
		const formattedDate = getFormattedDate();
		const templateId = await createLogTemplate(name, description, colorCode, contentJson, formattedDate);

		if (templateId === null) {
			console.error("Failed to create log template.");
			return false;
		}

		console.log(`Log template created successfully with ID: ${templateId}`);
		return true;
	} catch (error) {
		console.error("Error in createTemplate:", error);
		return false;
	}
}


/**
 * Retrieves a list of all existing log templates.
 * @returns A list of templates with their ID and name, or null if none exist.
 */
export async function listTemplates(): Promise<{ log_template_id: number; name: string; color_code: string }[] | null> {
    const templates = await logTemplatesExist();
    return templates;
}


/**
 * Acquires the full data for a specific template.
 * @param templateId The ID of the template to retrieve.
 * @returns An object containing the template's name, color, and parsed content, or null on failure.
 */
export async function acquireTemplate(templateId: number): Promise<{
    name: string;
    color: string;
    content: TemplateContent;
} | null> {
    const template = await readLogTemplate(templateId);
    if (!template) {
        return null;
    }

    try {
        const content: TemplateContent = JSON.parse(template.content_json || '{}');
        return {
            name: template.name,
            color: template.color_code || '#8E8E93', // Default to a gray color
            content,
        };
    } catch (error) {
        console.error('Failed to parse template content JSON:', error);
        return null;
    }
}

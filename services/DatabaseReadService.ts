import setupDatabase from "./DatabaseService";
import { User, Day, Activity, SpecialActivity, ResponsibilitiesSummary, LogTemplate, ExportTemplate } from "../models/models";

// --- EXISTENCE CHECK FUNCTIONS (return IDs or null) ---

/**
 * Checks if a user exists with the given email and returns their ID.
 * @param email The email to check.
 * @returns The user's ID if they exist, otherwise null.
 */
export async function userExists(email: string): Promise<number | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<{ user_id: number }>(`SELECT user_id FROM User WHERE email = ?;`, [email]);
		return result?.user_id || null;
	} catch (error) {
		console.error("Error checking user existence:", error);
		return null;
	}
}

/**
 * Checks if a day log exists for the given date and returns its ID.
 * @param date The date to check (YYYY-MM-DD).
 * @returns The day's ID if it exists, otherwise null.
 */
export async function dayExists(date: string): Promise<number | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<{ day_id: number }>(`SELECT day_id FROM Day WHERE date = ?;`, [date]);
		return result?.day_id || null;
	} catch (error) {
		console.error("Error checking day existence:", error);
		return null;
	}
}

/**
 * Checks if activities exist for a given day ID and returns a list of their IDs.
 * @param day_id The foreign key to the Day table.
 * @returns A list of activity IDs or null if none exist.
 */
export async function dayActivitiesExist(day_id: number): Promise<number[] | null> {
	try {
		const db = await setupDatabase();
		const results = await db.getAllAsync<{ activity_id: number }>(`SELECT activity_id FROM Activity WHERE day_id = ?;`, [day_id]);
		return results.length > 0 ? results.map((r) => r.activity_id) : null;
	} catch (error) {
		console.error("Error checking day activities existence:", error);
		return null;
	}
}

/**
 * Checks if special activities exist for a given day ID and returns a list of their IDs.
 * @param day_id The foreign key to the Day table.
 * @returns A list of special activity IDs or null if none exist.
 */
export async function daySpecialActivitiesExist(day_id: number): Promise<number[] | null> {
	try {
		const db = await setupDatabase();
		const results = await db.getAllAsync<{ sp_activity_id: number }>(`SELECT sp_activity_id FROM Special_Activity WHERE day_id = ?;`, [day_id]);
		return results.length > 0 ? results.map((r) => r.sp_activity_id) : null;
	} catch (error) {
		console.error("Error checking day special activities existence:", error);
		return null;
	}
}

/**
 * Checks if a responsibilities summary exists for the current user and returns its ID.
 * @param user_id The foreign key to the User table.
 * @returns The responsibilities summary ID if it exists, otherwise null.
 */
export async function responsibilitiesSummaryExists(user_id: number): Promise<number | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<{ responsibilities_id: number }>(
			`SELECT responsibilities_id FROM Responsibilities_Summary WHERE user_id = ?;`,
			[user_id]
		);
		return result?.responsibilities_id || null;
	} catch (error) {
		console.error("Error checking responsibilities summary existence:", error);
		return null;
	}
}

/**
 * Checks for existing log templates and returns a list of their IDs and names.
 * @returns A list of template IDs and names or null if none exist.
 */
export async function logTemplatesExist(): Promise<{ log_template_id: number; name: string }[] | null> {
	try {
		const db = await setupDatabase();
		const results = await db.getAllAsync<{ log_template_id: number; name: string }>(`SELECT log_template_id, name FROM Log_Template;`);
		return results.length > 0 ? results : null;
	} catch (error) {
		console.error("Error checking log templates existence:", error);
		return null;
	}
}

/**
 * Checks for existing export templates and returns a list of their IDs and names.
 * @returns A list of template IDs and names or null if none exist.
 */
export async function exportTemplatesExist(): Promise<{ export_template_id: number; name: string }[] | null> {
	try {
		const db = await setupDatabase();
		const results = await db.getAllAsync<{ export_template_id: number; name: string }>(`SELECT export_template_id, name FROM Export_Template;`);
		return results.length > 0 ? results : null;
	} catch (error) {
		console.error("Error checking export templates existence:", error);
		return null;
	}
}

// --- FULL DATA READ FUNCTIONS (return full objects or arrays) ---

/**
 * Reads a user's information by their ID.
 * @param user_id The ID of the user to retrieve.
 * @returns The User object or null if not found.
 */
export async function readUser(user_id: number): Promise<User | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<User>(`SELECT * FROM User WHERE user_id = ?;`, [user_id]);
		return result || null;
	} catch (error) {
		console.error("Error reading user:", error);
		return null;
	}
}

/**
 * Reads a day log's information by its ID, including related activities.
 * @param day_id The ID of the day log to retrieve.
 * @returns An object containing the Day, Activities, and SpecialActivities.
 */
export async function readDay(day_id: number): Promise<{
	day: Day | null;
	activities: Activity[] | null;
	specialActivities: SpecialActivity[] | null;
} | null> {
	try {
		const db = await setupDatabase();
		const dayResult = await db.getFirstAsync<Day>(`SELECT * FROM Day WHERE day_id = ?;`, [day_id]);

		if (!dayResult) {
			return null;
		}

		const activities = await db.getAllAsync<Activity>(`SELECT * FROM Activity WHERE day_id = ?;`, [day_id]);

		const specialActivities = await db.getAllAsync<SpecialActivity>(`SELECT * FROM Special_Activity WHERE day_id = ?;`, [day_id]);

		return {
			day: dayResult,
			activities: activities.length > 0 ? activities : null,
			specialActivities: specialActivities.length > 0 ? specialActivities : null,
		};
	} catch (error) {
		console.error("Error reading day and related activities:", error);
		return null;
	}
}

/**
 * Reads all day date and ID pairs from the Day table.
 * @returns A list of day IDs and dates.
 */
export async function readDays(): Promise<{ day_id: number; date: string }[] | null> {
	try {
		const db = await setupDatabase();
		const results = await db.getAllAsync<{ day_id: number; date: string }>(`SELECT day_id, date FROM Day;`);
		return results.length > 0 ? results : null;
	} catch (error) {
		console.error("Error reading all days:", error);
		return null;
	}
}

/**
 * Reads a specific log template by its ID.
 * @param log_template_id The ID of the template to retrieve.
 * @returns The LogTemplate object or null if not found.
 */
export async function readLogTemplate(log_template_id: number): Promise<LogTemplate | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<LogTemplate>(`SELECT * FROM Log_Template WHERE log_template_id = ?;`, [log_template_id]);
		return result || null;
	} catch (error) {
		console.error("Error reading log template:", error);
		return null;
	}
}

/**
 * Reads a specific export template by its ID.
 * @param export_template_id The ID of the template to retrieve.
 * @returns The ExportTemplate object or null if not found.
 */
export async function readExportTemplate(export_template_id: number): Promise<ExportTemplate | null> {
	try {
		const db = await setupDatabase();
		const result = await db.getFirstAsync<ExportTemplate>(`SELECT * FROM Export_Template WHERE export_template_id = ?;`, [export_template_id]);
		return result || null;
	} catch (error) {
		console.error("Error reading export template:", error);
		return null;
	}
}

export async function readAllTableData(tableName:string) {
    try{
        const db = await setupDatabase();
        const result = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        return result
    } catch (error){
        console.error("Error reading the table: ", tableName, "\n ", error)
        return null
    }
}

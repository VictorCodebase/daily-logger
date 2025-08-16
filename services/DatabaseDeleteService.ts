import setupDatabase from "./DatabaseService"; 


/**
 * Deletes a row from the Activity table by its primary key.
 * @param activity_id The ID of the activity to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export async function deleteActivity(activity_id: number): Promise<boolean> {
	try {
		const db = await setupDatabase();
		const sql = `DELETE FROM Activity WHERE activity_id = ?;`;
		const result = await db.runAsync(sql, [activity_id]);
		// The changes property will be 1 if one row was affected.
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting activity:", error);
		return false;
	}
}

/**
 * Deletes a row from the Special_Activity table by its primary key.
 * @param sp_activity_id The ID of the special activity to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export async function deleteSpecialActivity(sp_activity_id: number): Promise<boolean> {
	try {
		const db = await setupDatabase();
		const sql = `DELETE FROM Special_Activity WHERE sp_activity_id = ?;`;
		const result = await db.runAsync(sql, [sp_activity_id]);
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting special activity:", error);
		return false;
	}
}

/**
 * Deletes a row from the Day table by its primary key.
 * This will also delete all related activities and special activities due to
 * the 'ON DELETE CASCADE' foreign key constraint.
 * @param day_id The ID of the day to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export async function deleteDay(day_id: number): Promise<boolean> {
	try {
		const db = await setupDatabase();
		const sql = `DELETE FROM Day WHERE day_id = ?;`;
		const result = await db.runAsync(sql, [day_id]);
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting day:", error);
		return false;
	}
}


/**
 * Deletes a log template from the database
 */
export async function deleteLogTemplate(templateId: number): Promise<boolean> {
	try {
		const db = await setupDatabase();
		const sql = `DELETE FROM Log_Template WHERE log_template_id = ?;`;
		const result = await db.runAsync(sql, [templateId]);
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting log template:", error);
		return false;
	}
}

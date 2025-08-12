import setupDatabase from "./DatabaseService";

/**
 * Menu:
 * 
 * 1. Create User
 * 2. Create Day
 * 3. Create Activity
 * 4. Create Special_Activity
 * 5. Create Responsibilities_Summary
 * 6. Create Log_template
 * 7. Create Export_Template
 */


/**
 * Creates a new user entry in the User table.
 * @param name The user's name.
 * @param email The user's email (must be unique).
 * @param password_hash A hashed version of the user's password.
 * @param path_to_icon Path to the user's icon image.
 * @param roles_positions User's roles and positions.
 * @param work_schedule User's work schedule as a JSON string.
 * @returns The ID of the newly created user or null on failure.
 */
export async function createUser(
    name: string,
    email: string,
    password_hash: string,
    path_to_icon: string,
    roles_positions: string,
    work_schedule: string
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO User (name, email, password_hash, path_to_icon, roles_positions, work_schedule) VALUES (?, ?, ?, ?, ?, ?);`,
            [name, email, password_hash, path_to_icon, roles_positions, work_schedule]
        );
        console.log(`User created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

/**
 * Creates a new daily log entry in the Day table.
 * @param date The date of the log entry (e.g., 'YYYY-MM-DD').
 * @param time_in The start time of the workday.
 * @param time_out The end time of the workday.
 * @returns The ID of the newly created day or null on failure.
 */
export async function createDay(
    date: string,
    time_in: string | null,
    time_out: string | null
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Day (date, time_in, time_out) VALUES (?, ?, ?);`,
            [date, time_in, time_out]
        );
        console.log(`Day created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating day:", error);
        return null;
    }
}

/**
 * Creates a new regular activity entry in the Activity table.
 * @param content The content/description of the activity.
 * @param time_start The start time of the activity.
 * @param time_end The end time of the activity.
 * @param category The category of the activity.
 * @param day_id The foreign key linking to the Day table.
 * @returns The ID of the newly created activity or null on failure.
 */
export async function createActivity(
    content: string,
    time_start: string,
    time_end: string,
    category: string,
    day_id: number
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Activity (content, time_start, time_end, category, day_id) VALUES (?, ?, ?, ?, ?);`,
            [content, time_start, time_end, category, day_id]
        );
        console.log(`Activity created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating activity:", error);
        return null;
    }
}

/**
 * Creates a new special activity entry in the Special_Activity table.
 * @param content The content/description of the special activity.
 * @param time_start The start time of the activity.
 * @param time_end The end time of the activity.
 * @param category The category of the activity.
 * @param day_id The foreign key linking to the Day table.
 * @returns The ID of the newly created special activity or null on failure.
 */
export async function createSpecialActivity(
    content: string,
    time_start: string,
    time_end: string,
    category: string,
    day_id: number
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Special_Activity (content, time_start, time_end, category, day_id) VALUES (?, ?, ?, ?, ?);`,
            [content, time_start, time_end, category, day_id]
        );
        console.log(`Special Activity created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating special activity:", error);
        return null;
    }
}

/**
 * Creates a new responsibilities summary entry.
 * @param content The content of the responsibilities summary.
 * @param user_id The foreign key linking to the User table.
 * @returns The ID of the newly created summary or null on failure.
 */
export async function createResponsibilitiesSummary(
    content: string,
    user_id: number
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Responsibilities_Summary (content, user_id) VALUES (?, ?);`,
            [content, user_id]
        );
        console.log(`Responsibilities Summary created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating responsibilities summary:", error);
        return null;
    }
}

/**
 * Creates a new log template entry.
 * @param name The name of the template.
 * @param description A description of the template.
 * @param color_code A color code for the template (e.g., a hex code).
 * @param content_json A JSON string representing the template's content.
 * @param date_created The date the template was created.
 * @returns The ID of the newly created template or null on failure.
 */
export async function createLogTemplate(
    name: string,
    description: string,
    color_code: string,
    content_json: string,
    date_created: string
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Log_Template (name, description, color_code, content_json, date_created) VALUES (?, ?, ?, ?, ?);`,
            [name, description, color_code, content_json, date_created]
        );
        console.log(`Log Template created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating log template:", error);
        return null;
    }
}

/**
 * Creates a new export template entry.
 * @param name The name of the template.
 * @param description A description of the template.
 * @param color_code A color code for the template (e.g., a hex code).
 * @param content_json A JSON string representing the template's content.
 * @param date_created The date the template was created.
 * @returns The ID of the newly created template or null on failure.
 */
export async function createExportTemplate(
    name: string,
    description: string,
    color_code: string,
    content_json: string,
    date_created: string
): Promise<number | null> {
    try {
        const db = await setupDatabase();
        const result = await db.runAsync(
            `INSERT INTO Export_Template (name, description, color_code, content_json, date_created) VALUES (?, ?, ?, ?, ?);`,
            [name, description, color_code, content_json, date_created]
        );
        console.log(`Export Template created with ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error creating export template:", error);
        return null;
    }
}

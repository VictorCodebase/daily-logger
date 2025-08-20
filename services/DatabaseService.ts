import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Creates all necessary tables for the Daily Logger app.
 * @param db The SQLite database instance.
 */
async function createTables(db: SQLite.SQLiteDatabase) {
	try {
		await Promise.all([
			// Create the User table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS User (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    path_to_icon TEXT,
                    roles_positions TEXT,
                    work_schedule TEXT
                );
            `),

			// Create the Day table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Day (
                    day_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL UNIQUE,
                    time_in TEXT,
                    time_out TEXT
                );
            `),

			// Create the Activity table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Activity (
                    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    time_start TEXT,
                    time_end TEXT,
                    category TEXT,
                    day_id INTEGER,
                    FOREIGN KEY(day_id) REFERENCES Day(day_id) ON DELETE CASCADE
                );
            `),

			// Create the Special Activity table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Special_Activity (
                    sp_activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    time_start TEXT,
                    time_end TEXT,
                    category TEXT,
                    day_id INTEGER,
                    FOREIGN KEY(day_id) REFERENCES Day(day_id) ON DELETE CASCADE
                );
            `),

			// Create the Responsibilities Summary table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Responsibilities_Summary (
                    responsibilities_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    user_id INTEGER,
                    FOREIGN KEY(user_id) REFERENCES User(user_id) ON DELETE CASCADE
                );
            `),

			// Create the Log Template table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Log_Template (
                    log_template_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    color_code TEXT,
                    content_json TEXT,
                    date_created TEXT
                );
            `),

			// Create the Export Template table
			db.execAsync(`
                CREATE TABLE IF NOT EXISTS Export_Template (
                    export_template_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    color_code TEXT,
                    content_json TEXT,
                    date_created TEXT
                );
            `),

		]);

		console.log("All tables created successfully.");
	} catch (error) {
		console.error("Error creating tables:", error);
	}
}

/**
 * Initializes and returns a singleton instance of the database.
 * If the database doesn't exist, it is created along with all tables.
 * @returns The SQLite database instance.
 */
export default async function setupDatabase(): Promise<SQLite.SQLiteDatabase> {
	// Test existing connection
	if (dbInstance) {
		try {
			await dbInstance.getFirstAsync("SELECT 1");
			return dbInstance;
		} catch (error) {
			console.warn("Database connection lost, reconnecting...", error);
			dbInstance = null;
		}
	}

	if (!dbInstance) {
		dbInstance = await SQLite.openDatabaseAsync("daily-logger.db");
		await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
		console.log("Database opened successfully.");
		await createTables(dbInstance);
	}
	return dbInstance;
}
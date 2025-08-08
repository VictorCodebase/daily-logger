//? Use to build all test db services for dev periodimport setupDatabase from "./databaseService";
import { readAllTableData } from "./DatabaseReadService";
import setupDatabase from "./DatabaseService";

/**
 * A hard-coded list of all table names in the database.
 * This is the easiest way to get all table names without complex database queries.
 */
const ALL_TABLES: string[] = [
    "User",
    "Day",
    "Activity",
    "Special_Activity",
    "Responsibilities_Summary",
    "Log_Template",
    "Export_Template"
];

/**
 * Retrieves a list of all table names defined in the app.
 * @returns An array of strings representing the table names.
 */
export function getAllTables(): string[] {
    return ALL_TABLES;
}

/**
 * Logs all the data from a specified table to the console.
 * @param tableName The name of the table to read.
 */
export async function logTableContents(tableName: string) {
    console.log(`--- Contents of table: ${tableName} ---`);
    const data = await readAllTableData(tableName);
    console.log(JSON.stringify(data, null, 2));
    console.log(`--- End of table: ${tableName} ---`);
}

/**
 * Resets (deletes all data from) a specified table.
 * @param tableName The name of the table to reset.
 * @returns A boolean indicating success or failure.
 */
export async function resetTable(tableName: string): Promise<boolean> {
    try {
        if (!ALL_TABLES.includes(tableName)) {
            console.error(`Error: Table '${tableName}' does not exist.`);
            return false;
        }
        
        const db = await setupDatabase();
        await db.runAsync(`DELETE FROM ${tableName};`);
        console.log(`Successfully reset table: ${tableName}`);
        return true;
    } catch (error) {
        console.error(`Error resetting table '${tableName}':`, error);
        return false;
    }
}
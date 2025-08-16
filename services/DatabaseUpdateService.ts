import setupDatabase from "./DatabaseService";
import { User, Activity, SpecialActivity } from "../models/ViewModel_Models";



/**
 * Updates all fields of a user record except for the primary key.
 * @param user The User object with the updated details.
 * @returns A boolean indicating whether the update was successful.
 */
export async function updateUser({
    user_id,
    name,
    email,
    password_hash,
    avatar,
    role,
    work_schedule
}: User): Promise<boolean> {
    try {
        const db = await setupDatabase();
        const sql = `
            UPDATE User
            SET name = ?, email = ?, password_hash = ?, path_to_icon = ?, roles_positions = ?, work_schedule = ?
            WHERE user_id = ?;
        `;
        const result = await db.runAsync(sql, [
            name,
            email,
            password_hash,
            avatar,
            role,
            work_schedule,
            user_id
        ]);
        // The changes property will be 1 if one row was affected.
        return result.changes > 0;
    } catch (error) {
        console.error("Error updating user:", error);
        return false;
    }
}

/**
 * Updates only the time_in and time_out fields of a day record.
 * @param day_id The ID of the day to update.
 * @param time_in The new time_in value.
 * @param time_out The new time_out value.
 * @returns A boolean indicating whether the update was successful.
 */
export async function updateDay(day_id: number, time_in: string, time_out: string): Promise<boolean> {
    try {
        const db = await setupDatabase();
        const sql = `
            UPDATE Day
            SET time_in = ?, time_out = ?
            WHERE day_id = ?;
        `;
        const result = await db.runAsync(sql, [time_in, time_out, day_id]);
        return result.changes > 0;
    } catch (error) {
        console.error("Error updating day:", error);
        return false;
    }
}

/**
 * Updates all fields of an activity record except for the primary and foreign keys.
 * @param activity The Activity object with the updated details.
 * @returns A boolean indicating whether the update was successful.
 */
export async function updateActivity({
    activity_id,
    content,
    time_start,
    time_end,
    category
}: Activity): Promise<boolean> {
    try {
        const db = await setupDatabase();
        const sql = `
            UPDATE Activity
            SET content = ?, time_start = ?, time_end = ?, category = ?
            WHERE activity_id = ?;
        `;
        const result = await db.runAsync(sql, [
            content,
            time_start,
            time_end,
            category,
            activity_id
        ]);
        return result.changes > 0;
    } catch (error) {
        console.error("Error updating activity:", error);
        return false;
    }
}

/**
 * Updates all fields of a special activity record except for the primary and foreign keys.
 * @param specialActivity The SpecialActivity object with the updated details.
 * @returns A boolean indicating whether the update was successful.
 */
export async function updateSpecialActivity({
    sp_activity_id,
    content,
    time_start,
    time_end,
    category
}: SpecialActivity): Promise<boolean> {
    try {
        const db = await setupDatabase();
        const sql = `
            UPDATE Special_Activity
            SET content = ?, time_start = ?, time_end = ?, category = ?
            WHERE sp_activity_id = ?;
        `;
        const result = await db.runAsync(sql, [
            content,
            time_start,
            time_end,
            category,
            sp_activity_id
        ]);
        return result.changes > 0;
    } catch (error) {
        console.error("Error updating special activity:", error);
        return false;
    }
}

/**
 * Updates only the content of a responsibilities summary record.
 * @param responsibilities_id The ID of the responsibilities summary to update.
 * @param content The new content.
 * @returns A boolean indicating whether the update was successful.
 */
export async function updateResponsibilitiesSummary(
    responsibilities_id: number,
    content: string
): Promise<boolean> {
    try {
        const db = await setupDatabase();
        const sql = `
            UPDATE Responsibilities_Summary
            SET content = ?
            WHERE responsibilities_id = ?;
        `;
        const result = await db.runAsync(sql, [content, responsibilities_id]);
        return result.changes > 0;
    } catch (error) {
        console.error("Error updating responsibilities summary:", error);
        return false;
    }
}

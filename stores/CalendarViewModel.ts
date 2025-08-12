import { readDays, readDay, dayExists } from "../services/DatabaseReadService";
import { updateDay, updateActivity, updateSpecialActivity } from "../services/DatabaseUpdateService";
import { deleteActivity, deleteSpecialActivity, deleteDay } from "../services/DatabaseDeleteService";
import { createDay, createActivity, createSpecialActivity } from "../services/DatabaseCreateService";
import { getFormattedDate } from "../utils/DateFormatUtil";
import { DayDetails, Activity, SpecialActivity, Day } from "../models/ViewModel_Models";

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
	return readDays();
}

/**
 * Fetches all details for a specific day, including its activities.
 * @param dayId The ID of the day to fetch.
 * @returns A promise that resolves to a DayDetails object.
 */
export async function fetchDay(dayId: number | null): Promise<DayDetails | null> {
	// If the dayId is 0 or invalid (e.g., from a greyed-out date),
	// we return an empty DayDetails object.
	if (!dayId) {
		return {
			day: null,
			activities: null,
			specialActivities: null,
		};
	}
	return readDay(dayId);
}

/**
 * Commits all changes for a given day to the database.
 * This method handles updates, deletions, and new additions in a single transaction.
 * @param date The date string of the day being modified.
 * @param dayId The ID of the day being modified (can be null for a new day).
 * @param updatedDay The Day object with updated time_in and time_out.
 * @param allActivities A list of all activities for the day, including new and modified ones.
 * @param allSpecialActivities A list of all special activities for the day.
 * @param deletedActivityIds An array of IDs of activities to be deleted.
 * @param deletedSpecialActivityIds An array of IDs of special activities to be deleted.
 * @returns A boolean indicating if all operations were successful.
 */
export async function saveDayChanges({
	date,
	dayId,
	updatedDay,
	allActivities,
	allSpecialActivities,
	deletedActivityIds,
	deletedSpecialActivityIds,
}: {
	date: string;
	dayId: number | null;
	updatedDay: Day;
	allActivities: Activity[];
	allSpecialActivities: SpecialActivity[];
	deletedActivityIds: number[];
	deletedSpecialActivityIds: number[];
}): Promise<boolean> {
	try {
		let currentDayId: number;

		// 1. Check if the day exists and create it if it doesn't.
		const existingDayId = await dayExists(date);
		if (existingDayId) {
			currentDayId = existingDayId;
		} else {
			// If it's a new day, create the day first.
			const newDayId = await createDay(date, updatedDay.time_in, updatedDay.time_out);
			if (!newDayId) {
				console.error("Failed to create new day entry.");
				return false;
			}
			currentDayId = newDayId;
		}

		// 2. Update the day's time_in and time_out
		await updateDay(currentDayId, updatedDay.time_in!, updatedDay.time_out!);

		// 3. Handle deletions
		for (const activityId of deletedActivityIds) {
			await deleteActivity(activityId);
		}
		for (const spActivityId of deletedSpecialActivityIds) {
			await deleteSpecialActivity(spActivityId);
		}

		// 4. Handle new and updated activities
		for (const activity of allActivities) {
			if (activity.activity_id) {
				// This is an existing activity to update
				await updateActivity(activity as Activity);
			} else {
				// This is a new activity to create
				await createActivity(activity.content, activity.time_start!, activity.time_end!, activity.category!, currentDayId);
			}
		}
		for (const specialActivity of allSpecialActivities) {
			if (specialActivity.sp_activity_id) {
				// This is an existing special activity to update
				await updateSpecialActivity(specialActivity as SpecialActivity);
			} else {
				// This is a new special activity to create
				await createSpecialActivity(
					specialActivity.content,
					specialActivity.time_start!,
					specialActivity.time_end!,
					specialActivity.category!,
					currentDayId
				);
			}
		}

		return true; // All operations were successful
	} catch (error) {
		console.error("Error saving day changes:", error);
		return false;
	}
}

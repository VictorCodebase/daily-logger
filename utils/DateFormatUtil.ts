/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 * @param date The Date object to format. Defaults to the current date.
 * @returns A formatted date string.
 */
export function getFormattedDate(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object into a 'HH:MM:SS' string.
 * @param date The Date object to format. Defaults to the current time.
 * @returns A formatted time string.
 */
export function getFormattedTime(date: Date = new Date()): string {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
}

export const formatHumanFriendlyDate = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

	// Add the ordinal suffix (st, nd, rd, th) to the day
	const day = date.getDate();
	let suffix;
	if (day > 3 && day < 21) suffix = "th";
	else {
		switch (day % 10) {
			case 1:
				suffix = "st";
				break;
			case 2:
				suffix = "nd";
				break;
			case 3:
				suffix = "rd";
				break;
			default:
				suffix = "th";
				break;
		}
	}

	// Find the day part in the formatted string and insert the suffix
	return formattedDate.replace(new RegExp(`\\b${day}\\b`), `${day}${suffix}`);
};

/**
 * Converts a raw date string (e.g., from a date picker) into a SQLite-friendly format.
 * This is useful if your input format is different from the target format.
 * For now, this assumes the input is already in 'YYYY-MM-DD' format but adds a safety check.
 * @param rawDate The raw date string to format.
 * @returns A formatted date string.
 */
export function formatDateForSQLite(rawDate: string): string {
	// This is a simple pass-through for now, assuming rawDate is 'YYYY-MM-DD'
	// You can add more complex parsing logic here if needed.
	return rawDate;
}

/**
 * Converts a raw time string into a SQLite-friendly format.
 * @param rawTime The raw time string to format.
 * @returns A formatted time string.
 */
export function formatTimeForSQLite(rawTime: string): string {
	// This assumes rawTime is already in 'HH:MM:SS' format.
	return rawTime;
}

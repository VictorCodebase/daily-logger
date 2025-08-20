import { Alert } from "react-native";
import { updateUser } from "../services/DatabaseUpdateService";
import { logTemplatesExist, readResponsibilitySummary, responsibilitiesSummaryExists } from "../services/DatabaseReadService";
import { updateResponsibilitiesSummary } from "../services/DatabaseUpdateService";
import { comparePassword, getHash } from "../utils/AuthUtil";
import { deleteLogTemplate } from "../services/DatabaseDeleteService";
import { ImageUploadResult, User, WorkSchedule, ResponsibilitiesSummary } from "../models/ViewModel_Models";

export interface Response {
	status: "success" | "error";
	message: string;
}

export interface AccountFormData {
	name: string;
	email: string;
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
	roles: string[];
	workSchedule: WorkSchedule;
	avatar: string;
	avatarUri: string;
	responsibilitiesContent: string;
}

export interface TemplateItem {
	log_template_id: number;
	name: string;
	color_code: string;
}

async function getResponsibilitiesSummary(user_id: number): Promise<ResponsibilitiesSummary | null> {
	try {
		const summaryId = await responsibilitiesSummaryExists(user_id);
		// console.log("summsummary idary id: ", summaryId);
		if (summaryId) {
			return await readResponsibilitySummary(summaryId);
		}
	} catch (error) {
		console.error("Error fetching responsibilities summary:", error);
	}
	return null;
}

async function listTemplates(): Promise<{ log_template_id: number; name: string; color_code: string }[] | null> {
	const templates = await logTemplatesExist();
	return templates;
}

/**
 * Initializes the account form data with current user information
 */
export async function initializeAccountData(user: User): Promise<{
	formData: AccountFormData;
	responsibilities: ResponsibilitiesSummary | null;
	templates: TemplateItem[];
}> {
	try {
		// Parse user roles and work schedule
		const roles = user.role ? JSON.parse(user.role) : [];
		const workSchedule = user.work_schedule ? JSON.parse(user.work_schedule) : { periods: [] };

		// Get responsibilities summary

		const responsibilities = await getResponsibilitiesSummary(user.user_id);

		// Get all templates
		const templatesResult = await listTemplates();
		const templates = templatesResult || [];

		const formData: AccountFormData = {
			name: user.name,
			email: user.email,
			currentPassword: "",
			newPassword: "",
			confirmNewPassword: "",
			roles: roles,
			workSchedule: workSchedule,
			avatar: user.avatar || "",
			avatarUri: user.avatar || "",
			responsibilitiesContent: responsibilities?.content || "",
		};

		return { formData, responsibilities, templates };
	} catch (error) {
		console.error("Error initializing account data:", error);
		throw new Error("Failed to load account data");
	}
}

/**
 * Validates the account form data before saving
 */
export function validateAccountForm(formData: AccountFormData): Response {
	// Check required fields
	if (!formData.name.trim()) {
		return { status: "error", message: "Name is required." };
	}

	if (!formData.email.trim()) {
		return { status: "error", message: "Email is required." };
	}

	// Email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(formData.email)) {
		return { status: "error", message: "Please enter a valid email address." };
	}

	// Check if roles are provided
	if (formData.roles.length === 0) {
		return { status: "error", message: "At least one role is required." };
	}

	// Password validation (only if new password is provided)
	if (formData.newPassword) {
		if (!formData.currentPassword) {
			return { status: "error", message: "Current password is required to set a new password." };
		}

		if (formData.newPassword.length < 6) {
			return { status: "error", message: "New password must be at least 6 characters long." };
		}

		if (formData.newPassword !== formData.confirmNewPassword) {
			return { status: "error", message: "New passwords do not match." };
		}
	}

	// Work schedule validation
	if (formData.workSchedule.periods.length === 0) {
		return { status: "error", message: "At least one work period is required." };
	}

	for (const period of formData.workSchedule.periods) {
		if (!period.start || !period.end || !period.expected_time_in || !period.expected_time_out) {
			return { status: "error", message: "All work schedule fields must be filled." };
		}
	}

	return { status: "success", message: "Validation passed." };
}

/**
 * Saves all account updates to the database
 */
export async function saveAccountChanges(
	formData: AccountFormData,
	currentUser: User,
	responsibilities: ResponsibilitiesSummary | null,
	userContext: any
): Promise<Response> {
	try {
		// Validate form data
		const validation = validateAccountForm(formData);
		if (validation.status === "error") {
			return validation;
		}

		let updatedPasswordHash = currentUser.password_hash;

		// Handle password change if new password is provided
		if (formData.newPassword) {
			// Verify current password
			const isCurrentPasswordValid = await comparePassword(formData.currentPassword, currentUser.password_hash || "");

			if (!isCurrentPasswordValid) {
				return { status: "error", message: "Current password is incorrect." };
			}

			// Hash new password
			updatedPasswordHash = await getHash(formData.newPassword);
		}

		// Prepare updated user data
		const updatedUser: User = {
			...currentUser,
			name: formData.name,
			email: formData.email,
			password_hash: updatedPasswordHash,
			avatar: formData.avatar,
			role: JSON.stringify(formData.roles),
			work_schedule: JSON.stringify(formData.workSchedule),
		};

		// Update user in database
		const userUpdateSuccess = await updateUser(updatedUser);
		if (!userUpdateSuccess) {
			return { status: "error", message: "Failed to update user information." };
		}

		// Update responsibilities summary if it has content
		if (formData.responsibilitiesContent.trim()) {
			if (responsibilities) {
				// Update existing summary
				const responsibilitiesUpdateSuccess = await updateResponsibilitiesSummary(
					responsibilities.responsibilities_id,
					formData.responsibilitiesContent.trim()
				);
				if (!responsibilitiesUpdateSuccess) {
					return { status: "error", message: "Failed to update responsibilities summary." };
				}
			} else {
				// Create new summary if needed (you might need to add a create function)
				console.log("Creating new responsibilities summary...");
			}
		}

		// Update user context
		userContext.login(updatedUser);

		return { status: "success", message: "Account updated successfully!" };
	} catch (error) {
		console.error("Error saving account changes:", error);
		return { status: "error", message: "An unexpected error occurred while saving changes." };
	}
}

/**
 * Handles profile photo selection/capture
 */
export async function handleImageSelection(
	selectionMethod: () => Promise<ImageUploadResult>
): Promise<{ success: boolean; imagePath?: string; imageUri?: string; message: string }> {
	try {
		const result = await selectionMethod();

		if (result.status === "success") {
			return {
				success: true,
				imagePath: result.imagePath || "",
				imageUri: result.imageUri || "",
				message: result.message,
			};
		} else if (result.status === "error") {
			return {
				success: false,
				message: result.message,
			};
		}

		// Handle cancelled status
		return {
			success: false,
			message: "Image selection was cancelled",
		};
	} catch (error) {
		console.error("Image selection error:", error);
		return {
			success: false,
			message: "An unexpected error occurred during image selection",
		};
	}
}

/**
 * Filters templates based on search query (name or color)
 */
export function filterTemplates(templates: TemplateItem[], searchQuery: string): TemplateItem[] {
	if (!searchQuery.trim()) {
		return templates;
	}

	const query = searchQuery.toLowerCase();
	return templates.filter(
		(template) => template.name.toLowerCase().includes(query) || getColorNameFromCode(template.color_code).toLowerCase().includes(query)
	);
}

/**
 * Gets color name from color code
 */
function getColorNameFromCode(colorCode: string): string {
	const colorMap: { [key: string]: string } = {
		"#4CAF50": "Green",
		"#007AFF": "Blue",
		"#FF9500": "Orange",
		"#FF3B30": "Red",
		"#AF52DE": "Purple",
		"#FF2D92": "Pink",
		"#5AC8FA": "Teal",
		"#8E8E93": "Gray",
	};
	return colorMap[colorCode] || "Unknown";
}

/**
 * Confirms and deletes multiple templates
 */
export async function confirmAndDeleteTemplates(templateIds: number[]): Promise<Response> {
	try {
		const deletePromises = templateIds.map((id) => deleteLogTemplate(id));
		const results = await Promise.all(deletePromises);

		const successCount = results.filter((result) => result).length;
		const failCount = results.length - successCount;

		if (failCount === 0) {
			return {
				status: "success",
				message: `Successfully deleted ${successCount} template(s).`,
			};
		} else if (successCount === 0) {
			return {
				status: "error",
				message: "Failed to delete any templates.",
			};
		} else {
			return {
				status: "success",
				message: `Deleted ${successCount} template(s). ${failCount} deletion(s) failed.`,
			};
		}
	} catch (error) {
		console.error("Error deleting templates:", error);
		return {
			status: "error",
			message: "An unexpected error occurred while deleting templates.",
		};
	}
}

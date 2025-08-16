import { userExists, readUser } from "../services/DatabaseReadService";
import { createUser } from "../services/DatabaseCreateService";
import { useUser } from "../context/UserContext";
import { getHash, comparePassword } from "../utils/AuthUtil"; 
import { User, WorkSchedule, WorkSchedulePeriod, ImageUploadResult } from "../models/ViewModel_Models";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Define the response object shape
interface Response {
	status: "success" | "error";
	message: string;
}




/**
 * Handles the profile photo upload process.
 * Requests permissions, opens image picker, and optionally saves the image locally.
 * @param saveLocally Whether to save the image to local storage (default: true)
 * @returns Promise with the result containing the image path/URI
 */
export async function handleProfilePhotoUpload(saveLocally: boolean = true): Promise<ImageUploadResult> {
	try {
		// --- 1. Request permissions ---
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		
		if (permissionResult.status !== 'granted') {
			return {
				status: 'error',
				message: 'Permission to access media library is required!',
			};
		}

		// --- 2. Launch image picker ---
		const pickerResult = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1], // Square aspect ratio for profile photos
			quality: 0.8, // Reduce file size while maintaining good quality
			base64: false, // We don't need base64 for file operations
		});

		if (pickerResult.canceled) {
			return {
				status: 'cancelled',
				message: 'Image selection was cancelled',
			};
		}

		const selectedImage = pickerResult.assets[0];

		if (!saveLocally) {
			// Return the temporary URI if not saving locally
			return {
				status: 'success',
				message: 'Image selected successfully',
				imageUri: selectedImage.uri,
			};
		}

		// --- 3. Save image locally (if saveLocally is true) ---
		const savedImagePath = await saveImageLocally(selectedImage.uri);
		
		if (!savedImagePath) {
			return {
				status: 'error',
				message: 'Failed to save image locally',
			};
		}

		return {
			status: 'success',
			message: 'Image uploaded and saved successfully',
			imagePath: savedImagePath,
			imageUri: selectedImage.uri,
		};

	} catch (error) {
		console.error('Error in handleProfilePhotoUpload:', error);
		return {
			status: 'error',
			message: 'An unexpected error occurred during image upload',
		};
	}
}

/**
 * Alternative method that opens the camera instead of image library
 */
export async function handleProfilePhotoCameraCapture(): Promise<ImageUploadResult> {
	try {
		// Request camera permissions
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		
		if (permissionResult.status !== 'granted') {
			return {
				status: 'error',
				message: 'Permission to access camera is required!',
			};
		}

		// Launch camera
		const cameraResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (cameraResult.canceled) {
			return {
				status: 'cancelled',
				message: 'Camera capture was cancelled',
			};
		}

		const capturedImage = cameraResult.assets[0];
		const savedImagePath = await saveImageLocally(capturedImage.uri);

		if (!savedImagePath) {
			return {
				status: 'error',
				message: 'Failed to save captured image',
			};
		}

		return {
			status: 'success',
			message: 'Photo captured and saved successfully',
			imagePath: savedImagePath,
			imageUri: capturedImage.uri,
		};

	} catch (error) {
		console.error('Error in handleProfilePhotoCameraCapture:', error);
		return {
			status: 'error',
			message: 'An unexpected error occurred during camera capture',
		};
	}
}

/**
 * Saves an image from a URI to the app's document directory
 * @param imageUri The temporary URI of the selected/captured image
 * @returns The permanent local file path, or null if save failed
 */
async function saveImageLocally(imageUri: string): Promise<string | null> {
	try {
		// Create a unique filename
		const timestamp = Date.now();
		const fileName = `profile_photo_${timestamp}.jpg`;
		
		// Define the permanent file path
		const permanentPath = `${FileSystem.documentDirectory}${fileName}`;
		
		// Copy the image from temporary location to permanent location
		await FileSystem.copyAsync({
			from: imageUri,
			to: permanentPath,
		});

		return permanentPath;
	} catch (error) {
		console.error('Error saving image locally:', error);
		return null;
	}
}

/**
 * Provides options for image selection (Library vs Camera)
 * This can be used with an ActionSheet or Alert
 */
export function getImagePickerOptions() {
	return [
		{
			title: 'Choose from Library',
			handler: () => handleProfilePhotoUpload(),
		},
		{
			title: 'Take Photo',
			handler: () => handleProfilePhotoCameraCapture(),
		},
		{
			title: 'Cancel',
			style: 'cancel' as const,
		},
	];
}



/**
 * Signs up a new user, saves their details to the database, and updates the UserContext.
 * @param name The user's name.
 * @param email The user's email.
 * @param password The user's plain-text password.
 * @param roles An array of strings for the user's roles/positions.
 * @param workSchedule A JavaScript object representing the user's work schedule.
 * @param avatar The path to the user's icon (optional).
 * @returns A promise that resolves to a Response object with status and message.
 */
export async function signUpUser(
	name: string,
	email: string,
	password: string,
	roles: string[],
	work_schedule: WorkSchedule,
	avatar: string = "",
	user_context: any
): Promise<Response> {
	try {
		// --- 1. Basic field validation ---
		if (!name || !email || !password || roles.length === 0) {
			return {
				status: "error",
				message: "Please fill in all required fields.",
			};
		}

		// --- 2. Check if user already exists ---
		const existingUser = await userExists(email);
		if (existingUser) {
			return {
				status: "error",
				message: "A user with this email already exists.",
			};
		}

		// --- 3. Hash the password and serialize complex data ---
		const password_hash = await getHash(password);
		const role = JSON.stringify(roles);
		const workSchedule = JSON.stringify(work_schedule);

		// --- 4. Create the user in the database ---
		const newUserId = await createUser(name, email, password_hash, avatar, role, workSchedule);

		if (newUserId === null) {
			return {
				status: "error",
				message: "Failed to create user. Please try again.",
			};
		}

		// --- 5. Update the application-wide UserContext ---
		const newUser: User = {
			user_id: parseInt(newUserId.toString()),
			name,
			email,
			avatar,
			password_hash,
			role,
			work_schedule: workSchedule,
		};
		user_context.login(newUser);

		return {
			status: "success",
			message: "Account created successfully!",
		};
	} catch (error) {
		console.error("Error in signUpUser:", error);
		return {
			status: "error",
			message: "An unexpected error occurred during sign-up.",
		};
	}
}

/**
 * Handles user login by authenticating with email and password.
 * @param email The user's email.
 * @param password The user's plain-text password.
 * @returns A promise that resolves to a Response object with status and message.
 */
export async function loginUser(email: string, password: string, user_context: any): Promise<Response> {
	try {
		// --- 1. Basic field validation ---
		if (!email || !password) {
			return {
				status: "error",
				message: "Please enter both email and password.",
			};
		}

		// --- 2. Retrieve user data from the database by email ---
		// This function will return the full user object if found,
		// which includes the user_id, name, and other details.
		const userId = await userExists(email);

		if (!userId) {
			return {
				status: "error",
				message: "Invalid email or password.",
			};
		}

		const user = await readUser(userId);

		if (!user) {
			return {
				status: "error",
				message: "Invalid email or password.",
			};
		}

		// --- 3. Compare the provided password with the stored hash ---
		if (!user.password_hash) {
			return {
				status: "error",
				message: "Error occured during login"
			}
		}
		const passwordMatch = comparePassword(password, user.password_hash);
		if (!passwordMatch) {
			return {
				status: "error",
				message: "Invalid email or password.",
			};
		}

		// --- 4. Update the UserContext for a successful login ---
		// const userContext = useUser();
		const loggedInUser: User = {
			user_id: user.user_id,
			name: user.name,
			email: user.email,
			role: user.role,
			work_schedule: user.work_schedule,
			password_hash: null,
			avatar: user.avatar ,
		};
		user_context.login(loggedInUser);

		return {
			status: "success",
			message: "Login successful!",
		};
	} catch (error) {
		console.error("Error in loginUser:", error);
		return {
			status: "error",
			message: "An unexpected error occurred during login.",
		};
	}
}

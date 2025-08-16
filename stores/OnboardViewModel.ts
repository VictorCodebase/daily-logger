import { userExists, readUser } from "../services/DatabaseReadService";
import { createUser } from "../services/DatabaseCreateService";
import { getHash, comparePassword } from "../utils/AuthUtil"; 
import { User, WorkSchedule} from "../models/ViewModel_Models";


// Define the response object shape
interface Response {
	status: "success" | "error";
	message: string;
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
			password_hash: user.password_hash,
			avatar: user.avatar ,
		};
		console.log("Logged in user: ", loggedInUser)
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

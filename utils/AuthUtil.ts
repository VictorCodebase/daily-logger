import * as Crypto from "expo-crypto";

// Define supported hash algorithms as a type
export type HashAlgorithm = "SHA1" | "SHA256" | "SHA384" | "SHA512" | "MD2" | "MD4" | "MD5";

/**
 * Generate a hash for the given input string
 * @param input - The string to hash
 * @param algorithm - The hash algorithm to use
 * @returns The hexadecimal hash string
 */
export const getHash = async (input: string, algorithm: HashAlgorithm = "SHA256"): Promise<string> => {
	try {
		// Validate input
		if (typeof input !== "string") {
			throw new Error("Input must be a string");
		}

		// Validate algorithm (TypeScript ensures this at compile time, but runtime check for safety)
		const supportedAlgorithms: HashAlgorithm[] = ["SHA1", "SHA256", "SHA384", "SHA512", "MD2", "MD4", "MD5"];
		if (!supportedAlgorithms.includes(algorithm)) {
			throw new Error(`Unsupported algorithm. Use one of: ${supportedAlgorithms.join(", ")}`);
		}

		// Generate hash
		const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm[algorithm], input, { encoding: Crypto.CryptoEncoding.HEX });

		return hash;
	} catch (error) {
		console.error("Error generating hash:", error);
		throw error;
	}
};

/**
 * Generate SHA256 hash (convenience function)
 * @param input - The string to hash
 * @returns The SHA256 hash in hexadecimal
 */
export const getSHA256Hash = async (input: string): Promise<string> => {
	return await getHash(input, "SHA256");
};

/**
 * Generate MD5 hash (convenience function)
 * @param input - The string to hash
 * @returns The MD5 hash in hexadecimal
 */
export const getMD5Hash = async (input: string): Promise<string> => {
	return await getHash(input, "MD5");
};

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The stored hash to compare against
 * @param algorithm - The hash algorithm used for the stored hash (default: SHA256)
 * @returns Promise that resolves to true if passwords match, false otherwise
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string, algorithm: HashAlgorithm = "SHA256"): Promise<boolean> => {
	try {
		// Validate inputs
		if (typeof plainPassword !== "string" || typeof hashedPassword !== "string") {
			throw new Error("Both passwords must be strings");
		}

		if (plainPassword.length === 0 || hashedPassword.length === 0) {
			return false;
		}

		// Hash the plain password using the same algorithm
		const hashedPlainPassword = await getHash(plainPassword, algorithm);

		// Compare hashes using a timing-safe comparison
		return timingSafeEqual(hashedPlainPassword, hashedPassword);
	} catch (error) {
		console.error("Error comparing passwords:", error);
		return false;
	}
};

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
const timingSafeEqual = (a: string, b: string): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}

	return result === 0;
};

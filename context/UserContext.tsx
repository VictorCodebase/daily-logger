import React, { createContext, useState, useEffect, useContext } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Constants
const USER_STORAGE_KEY = "@user_data";
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Define the shape of the user data
export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role?: string;
	preferences?: Record<string, any>;
}

// Define authentication tokens
interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

// Define the shape of the context's value
interface UserContextType {
	user: User | null;
	isLoggedIn: boolean;
	isLoading: boolean;
	login: (userData: User, tokens: AuthTokens) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (userData: Partial<User>) => Promise<void>;
	refreshAuthToken: () => Promise<boolean>;
	getAccessToken: () => Promise<string | null>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);

	useEffect(() => {
		initializeAuth();
	}, []);

	const initializeAuth = async () => {
		try {
			setIsLoading(true);

			// Check for stored user data and tokens
			const [storedUser, accessToken, refreshToken] = await Promise.all([
				AsyncStorage.getItem(USER_STORAGE_KEY),
				SecureStore.getItemAsync(AUTH_TOKEN_KEY),
				SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
			]);

			if (storedUser && accessToken && refreshToken) {
				const userData = JSON.parse(storedUser);
				const tokenData = JSON.parse(accessToken);

				// Check if token is still valid
				if (tokenData.expiresAt > Date.now()) {
					setUser(userData);
					setAuthTokens({
						accessToken: tokenData.token,
						refreshToken,
						expiresAt: tokenData.expiresAt,
					});
					setIsLoggedIn(true);
				} else {
					// Try to refresh the token
					const refreshed = await attemptTokenRefresh(refreshToken);
					if (refreshed) {
						setUser(userData);
						setIsLoggedIn(true);
					} else {
						// Clear invalid session
						await clearStoredAuth();
					}
				}
			}
		} catch (error) {
			console.error("Failed to restore session:", error);
			await clearStoredAuth();
		} finally {
			setIsLoading(false);
		}
	};

	const attemptTokenRefresh = async (refreshToken: string): Promise<boolean> => {
		try {
			// Replace with your actual API endpoint
			const response = await fetch("/api/auth/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refreshToken }),
			});

			if (response.ok) {
				const { accessToken, refreshToken: newRefreshToken, expiresIn } = await response.json();
				const expiresAt = Date.now() + expiresIn * 1000;

				const newTokens = {
					accessToken,
					refreshToken: newRefreshToken,
					expiresAt,
				};

				await storeAuthTokens(newTokens);
				setAuthTokens(newTokens);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Token refresh failed:", error);
			return false;
		}
	};

	const storeAuthTokens = async (tokens: AuthTokens) => {
		try {
			await Promise.all([
				SecureStore.setItemAsync(
					AUTH_TOKEN_KEY,
					JSON.stringify({
						token: tokens.accessToken,
						expiresAt: tokens.expiresAt,
					})
				),
				SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
			]);
		} catch (error) {
			console.error("Failed to store auth tokens:", error);
			throw error;
		}
	};

	const clearStoredAuth = async () => {
		try {
			await Promise.all([
				AsyncStorage.removeItem(USER_STORAGE_KEY),
				SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {}), // Ignore errors if item doesn't exist
				SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {}),
			]);
		} catch (error) {
			console.error("Failed to clear stored auth:", error);
		}
	};

	// Backward compatible login - supports both old and new signatures
	const login = async (userData: User, tokens?: AuthTokens) => {
		try {
			// Store user data
			await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

			// Store tokens if provided (new way)
			if (tokens) {
				await storeAuthTokens(tokens);
				setAuthTokens(tokens);
			} else {
				// Legacy mode - create dummy tokens for backward compatibility
				console.warn("Login called without tokens - using legacy mode. Consider updating to include authentication tokens.");
				const dummyTokens = {
					accessToken: "legacy-mode",
					refreshToken: "legacy-mode",
					expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
				};
				setAuthTokens(dummyTokens);
			}

			setUser(userData);
			setIsLoggedIn(true);
		} catch (error) {
			console.error("Login failed:", error);
			throw new Error("Failed to save login data");
		}
	};

	const logout = async () => {
		try {
			// Call logout API if needed
			if (authTokens?.accessToken) {
				try {
					await fetch("/api/auth/logout", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${authTokens.accessToken}`,
							"Content-Type": "application/json",
						},
					});
				} catch (error) {
					console.warn("Logout API call failed:", error);
					// Continue with local logout even if API call fails
				}
			}

			// Clear local state and storage
			await clearStoredAuth();
			setUser(null);
			setAuthTokens(null);
			setIsLoggedIn(false);
		} catch (error) {
			console.error("Logout failed:", error);
			// Force logout even if clearing storage fails
			setUser(null);
			setAuthTokens(null);
			setIsLoggedIn(false);
		}
	};

	const updateUser = async (userData: Partial<User>) => {
		if (!user) {
			throw new Error("No user logged in");
		}

		try {
			const updatedUser = { ...user, ...userData };
			await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
			setUser(updatedUser);
		} catch (error) {
			console.error("Failed to update user:", error);
			throw new Error("Failed to update user data");
		}
	};

	const refreshAuthToken = async (): Promise<boolean> => {
		if (!authTokens?.refreshToken) {
			return false;
		}

		return await attemptTokenRefresh(authTokens.refreshToken);
	};

	const getAccessToken = async (): Promise<string | null> => {
		if (!authTokens) {
			return null;
		}

		// Check if token is expired or will expire in the next 5 minutes
		if (authTokens.expiresAt <= Date.now() + 5 * 60 * 1000) {
			const refreshed = await refreshAuthToken();
			if (!refreshed) {
				await logout();
				return null;
			}
		}

		return authTokens.accessToken;
	};

	// Auto-refresh token when it's about to expire
	useEffect(() => {
		if (!authTokens || !isLoggedIn) return;

		const timeUntilExpiry = authTokens.expiresAt - Date.now();
		const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

		const timer = setTimeout(async () => {
			const refreshed = await refreshAuthToken();
			if (!refreshed) {
				await logout();
			}
		}, refreshTime);

		return () => clearTimeout(timer);
	}, [authTokens, isLoggedIn]);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#f5f5f5",
				}}
			>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text
					style={{
						marginTop: 16,
						fontSize: 16,
						color: "#666",
						fontWeight: "500",
					}}
				>
					Loading...
				</Text>
			</View>
		);
	}

	const contextValue: UserContextType = {
		user,
		isLoggedIn,
		isLoading,
		login,
		logout,
		updateUser,
		refreshAuthToken,
		getAccessToken,
	};

	return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

// Helper hook for API calls with automatic token handling
export const useAuthenticatedFetch = () => {
	const { getAccessToken, logout } = useUser();

	const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
		const token = await getAccessToken();

		if (!token) {
			throw new Error("No valid authentication token");
		}

		const response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		// Handle unauthorized responses
		if (response.status === 401) {
			await logout();
			throw new Error("Authentication expired");
		}

		return response;
	};

	return { authenticatedFetch };
};

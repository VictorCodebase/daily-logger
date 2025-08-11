import React, { createContext, useState, useEffect, useContext } from "react";
import { Text, View, ActivityIndicator } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // You will need to install this library

// Define the shape of the user data
export interface User {
	id: string;
	name: string;
	email: string;
	// Add other user properties here
}

// Define the shape of the context's value
interface UserContextType {
	user: User | null;
	isLoggedIn: boolean;
	login: (userData: User) => void;
	logout: () => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				// In a real app, you would check for a stored token or user data here.
				// For this example, we'll simulate a 1-second check.
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Placeholder: check for a stored session
				// const storedUser = await AsyncStorage.getItem("user");
				// if (storedUser) {
				//     const userData = JSON.parse(storedUser);
				//     setUser(userData);
				//     setIsLoggedIn(true);
				// }
			} catch (error) {
				console.error("Failed to restore session:", error);
			} finally {
				setIsLoading(false);
			}
		};
		checkLoginStatus();
	}, []);

	const login = async (userData: User) => {
		setUser(userData);
		setIsLoggedIn(true);
		// Placeholder: save the user data to a secure store
		// await AsyncStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = async () => {
		setUser(null);
		setIsLoggedIn(false);
		// Placeholder: remove the user data from a secure store
		// await AsyncStorage.removeItem("user");
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 10 }}>Loading...</Text>
			</View>
		);
	}

	return <UserContext.Provider value={{ user, isLoggedIn, login, logout }}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

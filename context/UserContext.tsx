import React, { createContext, useState, useEffect, useContext } from "react";
import { Text } from "react-native";

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

	// Placeholder for checking for a user session on app load
	useEffect(() => {
		const checkLoginStatus = async () => {
			// In a real app, you would check for a stored token or user data here
			// For now, we'll just simulate a loading state
			setIsLoading(false);
		};
		checkLoginStatus();
	}, []);

	const login = (userData: User) => {
		setUser(userData);
		setIsLoggedIn(true);
		// Here you would also save the user data to local storage or a secure store
	};

	const logout = () => {
		setUser(null);
		setIsLoggedIn(false);
		// Here you would also remove the user data from local storage
	};

	if (isLoading) {
		return <Text>Loading...</Text>;
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

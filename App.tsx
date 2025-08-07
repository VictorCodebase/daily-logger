import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { UserProvider } from "./context/UserContext";
import setupDatabase from "./services/DatabaseService";

export default function App() {
	const [isDbReady, setIsDbReady] = useState(false);

	useEffect(() => {
		const initialize = async () => {
			try {
				await setupDatabase();
				setIsDbReady(true);
			} catch (error) {
				console.error("Failed to initialize database:", error);
			}
		};
		initialize();
	}, []);

	if (!isDbReady) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 10 }}>Initializing database...</Text>
			</View>
		);
	}

	return (
		<UserProvider>
			<AppNavigator />
		</UserProvider>
	);
}

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useUser } from "../context/UserContext"; // Import the useUser hook

import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ExportWizardScreen from "../screens/ExportWizardScreen";
import AccountScreen from "../screens/AccountScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginSignupScreen from "../screens/OnboardScreen"; 
import { colors } from "../themes/colors";

// Create the navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// A reusable component for the top-right user icon and settings link
type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UserIcon = () => {
	// Tell useNavigation that it belongs to the RootStack
	const navigation = useNavigation<RootStackNavigationProp>();
	return (
		<Pressable onPress={() => navigation.navigate("SettingsScreen")} style={{ marginRight: 15 }}>
			<Ionicons name="settings" size={24} color="black" />
		</Pressable>
	);
};

// The main tab navigator for the app's bottom bar
const BottomTabNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerRight: () => <UserIcon />,
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap;
					if (route.name === "Home") {
						iconName = focused ? "home" : "home-outline";
					} else if (route.name === "Calendar") {
						iconName = focused ? "calendar" : "calendar-outline";
					} else if (route.name === "Export") {
						iconName = focused ? "document-text" : "document-text-outline";
					} else if (route.name === "Account") {
						iconName = focused ? "person" : "person-outline";
					} else {
						iconName = focused ? "warning" : "warning-outline"; //! Please change to something better
					}
					// Return the icon component
					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: colors.primary.main,
				tabBarInactiveTintColor: "gray",
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Calendar" component={CalendarScreen} />
			<Tab.Screen name="Export" component={ExportWizardScreen} />
			<Tab.Screen name="Account" component={AccountScreen} />
		</Tab.Navigator>
	);
};

// The root navigator which wraps the tab navigator and any other screens (like Settings)
const AppNavigator = () => {
	// Get the login state from the UserContext
	const { isLoggedIn } = useUser();

	return (
		<NavigationContainer>
			<Stack.Navigator>
				{isLoggedIn ? (
					// User is logged in, show the main app
					<>
						<Stack.Screen name="MainApp" component={BottomTabNavigator} options={{ headerShown: false }} />
						<Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: "Settings" }} />
					</>
				) : (
					// User is not logged in, show the login/signup screen
					<Stack.Screen name="Auth" component={LoginSignupScreen} options={{ headerShown: false }} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;

// types.ts
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";

// This is the list of all screens in your root stack navigator.
// The value associated with each key defines the parameters for that screen.
// 'undefined' means the screen has no parameters.
export type RootStackParamList = {
	MainApp: undefined;
	SettingsScreen: undefined;
};

// This is the list of all screens in your bottom tab navigator.
// These are the pages that are part of the 'MainApp' in the root stack.
export type RootTabParamList = {
	Home: undefined;
	Calendar: undefined;
	Export: undefined;
	Account: undefined;
};

// Define the navigation props for each screen.
// This will give you access to the 'navigation' and 'route' objects with correct types.

// This type is for screens inside the Bottom Tab Navigator.
// It combines the BottomTabScreenProps with the RootStack's navigation props.
export type TabScreenProps<T extends keyof RootTabParamList> = CompositeScreenProps<
	BottomTabScreenProps<RootTabParamList, T>,
	NativeStackScreenProps<RootStackParamList>
>;

// This type is for screens inside the Root Stack Navigator, but not the tabs.
export type StackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

import React from "react";
import { View, Text } from "react-native";
import tw from "twrnc";

export default function AccountScreen() {
	return (
		<View style={tw`flex-1 mt-5`}>
			<Text>You are at the accounts page</Text>
		</View>
	);
}

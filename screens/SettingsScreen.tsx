import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import tw from "twrnc";
import { getAllTables, logTableContents, resetTable } from "../services/DatabaseDevService";

// You may need to run this command to install the picker:
// npx expo install @react-native-picker/picker

const SettingsScreen = () => {
	const [tables, setTables] = useState<string[]>([]);
	const [selectedReadTable, setSelectedReadTable] = useState<string>("");
	const [selectedResetTable, setSelectedResetTable] = useState<string>("");

	useEffect(() => {
		// Fetch the list of tables on component mount
		const tableList = getAllTables();
		setTables(tableList);
		if (tableList.length > 0) {
			setSelectedReadTable(tableList[0]);
			setSelectedResetTable(tableList[0]);
		}
	}, []);

	const handleLogTable = () => {
		if (selectedReadTable) {
			logTableContents(selectedReadTable);
		}
	};

	const handleResetTable = async () => {
		if (selectedResetTable) {
			const success = await resetTable(selectedResetTable);
			if (success) {
				alert(`Table '${selectedResetTable}' has been reset.`);
			} else {
				alert(`Failed to reset table '${selectedResetTable}'.`);
			}
		}
	};

	return (
		<View style={tw`flex-1 p-5 bg-gray-100`}>
			<Text style={tw`text-2xl font-bold mb-8 text-center`}>Developer Tools</Text>

			<View style={tw`mb-5 border border-gray-300 rounded-lg p-4 bg-white`}>
				<Text style={tw`text-base font-semibold mb-2`}>Log Table Contents</Text>
				<Picker
					selectedValue={selectedReadTable}
					onValueChange={(itemValue) => setSelectedReadTable(itemValue)}
					style={tw`h-12 mb-2 border border-gray-300 rounded-lg`}
				>
					{tables.map((table) => (
						<Picker.Item key={table} label={table} value={table} />
					))}
				</Picker>
				<Button title={`Log '${selectedReadTable}'`} onPress={handleLogTable} />
			</View>

			<View style={tw`mb-5 border border-gray-300 rounded-lg p-4 bg-white`}>
				<Text style={tw`text-base font-semibold mb-2`}>Reset Table</Text>
				<Picker
					selectedValue={selectedResetTable}
					onValueChange={(itemValue) => setSelectedResetTable(itemValue)}
					style={tw`h-12 mb-2 border border-gray-300 rounded-lg`}
				>
					{tables.map((table) => (
						<Picker.Item key={table} label={table} value={table} />
					))}
				</Picker>
				<Button title={`Reset '${selectedResetTable}'`} onPress={handleResetTable} color="red" />
			</View>
		</View>
	);
};

export default SettingsScreen;

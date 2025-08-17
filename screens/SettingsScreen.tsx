import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import { workLog } from "../utils/demoLog";
import { getFormattedDate, getFormattedTime } from "../utils/DateFormatUtil";
import { getAllTables, logTableContents, resetTable } from "../services/DatabaseDevService";
import { saveActivities } from "../stores/DevViewModel"; // Adjust the import path to your actual service

//! DevViewModel interfaces
interface RawActivity {
	content: string;
	category: string;
	time_start: string;
	time_end: string;
}

interface RawDate {
	date: string;
	time_in: string;
	time_out: string;
}

interface WorkLogEntry {
	RawDate: RawDate;
	Activity: { content: string; time_start?: string; time_end?: string }[];
	SpecialActivity?: { content: string; time_start?: string; time_end?: string }[];
}

type WorkLog = WorkLogEntry[];

const SettingsScreen = () => {
	const [tables, setTables] = useState<string[]>([]);
	const [selectedReadTable, setSelectedReadTable] = useState<string>("");
	const [selectedResetTable, setSelectedResetTable] = useState<string>("");

	useEffect(() => {
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
				Alert.alert("Success", `Table '${selectedResetTable}' has been reset.`);
			} else {
				Alert.alert("Error", `Failed to reset table '${selectedResetTable}'.`);
			}
		}
	};

	const parseCustomDate = (dateStr: string): Date => {
		const [day, month, year] = dateStr.split(".").map(Number);
		return new Date(year, month - 1, day);
	};

	const parseCustomTime = (timeStr: string, baseDateStr?: string): Date => {
		const [hours, minutes] = timeStr.split(".").map(Number);
		let date = baseDateStr ? parseCustomDate(baseDateStr) : new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	};


const handlePopulateDB = async () => {
	try {
		for (const entry of workLog as WorkLog) {
			const rawDate: RawDate = {
				date: getFormattedDate(parseCustomDate(entry.RawDate.date)),
				time_in: getFormattedTime(parseCustomTime(entry.RawDate.time_in, entry.RawDate.date)),
				time_out: getFormattedTime(parseCustomTime(entry.RawDate.time_out, entry.RawDate.date)),
			};

			const activities: RawActivity[] = entry.Activity.map((a) => ({
				content: a.content,
				category: "General",
				time_start: a.time_start ? getFormattedTime(parseCustomTime(a.time_start, entry.RawDate.date)) : "",
				time_end: a.time_end ? getFormattedTime(parseCustomTime(a.time_end, entry.RawDate.date)) : "",
			}));

			const specialActivities: RawActivity[] =
				entry.SpecialActivity?.map((sa) => ({
					content: sa.content,
					category: "Special",
					time_start: sa.time_start ? getFormattedTime(parseCustomTime(sa.time_start, entry.RawDate.date)) : "",
					time_end: sa.time_end ? getFormattedTime(parseCustomTime(sa.time_end, entry.RawDate.date)) : "",
				})) ?? [];

			const success = await saveActivities(rawDate, activities, specialActivities);
			if (!success) {
				console.warn(`Failed to save for date ${rawDate.date}`);
			}
		}

		Alert.alert("Success", "Database populated with demo work log.");
	} catch (error) {
		console.error(error);
		Alert.alert("Error", "Failed to populate database.");
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

			<View style={tw`mb-5 border border-gray-300 rounded-lg p-4 bg-white`}>
				<Text style={tw`text-base font-semibold mb-2`}>Populate DB with Demo Data</Text>
				<Button title="Populate Database" onPress={handlePopulateDB} color="green" />
			</View>
		</View>
	);
};

export default SettingsScreen;

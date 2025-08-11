import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../themes/colors";
import { Picker } from "@react-native-picker/picker";
import { WorkSchedulePeriod } from "../../models/View_Models";





const WorkSchedulePeriodInput = ({
    period,
    index,
    onPeriodChange,
    onRemove,
}: {
    period: WorkSchedulePeriod;
    index: number;
    onPeriodChange: (updatedPeriod: WorkSchedulePeriod) => void;
    onRemove: () => void;
}) => {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "public_holiday"];
	const [showTimeInPicker, setShowTimeInPicker] = useState(false);
	const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);

	// Helper functions -> 

	const dateToTimeString = (date: Date) => {
		return date.toTimeString().slice(0, 5); // Format: "HH:MM"
	};

	// Helper function to convert time string to Date object
	const timeStringToDate = (timeString: string) => {
		if (!timeString) {
			const now = new Date();
			now.setHours(9, 0, 0, 0); // Default to 9:00 AM
			return now;
		}
		const [hours, minutes] = timeString.split(":").map(Number);
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	};

	return (
		<View style={tw`bg-[${colors.surface.elevated}] p-4 rounded-xl mb-4 border border-[${colors.border.primary}]`}>
			<View style={tw`flex-row items-center justify-between mb-2`}>
				<Text style={tw`text-[${colors.text.primary}] font-semibold`}>Period {index + 1}</Text>
				<TouchableOpacity onPress={onRemove}>
					<Feather name="trash" size={18} color={colors.text.secondary} />
				</TouchableOpacity>
			</View>
			<View style={tw`flex-row justify-between mb-3`}>
				<View style={tw`w-1/2 pr-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Start Day</Text>
					<View style={tw`bg-[${colors.background.secondary}] rounded-md `}>
						<Picker
							selectedValue={period.start}
							onValueChange={(itemValue) => onPeriodChange({ ...period, start: itemValue })}
							style={tw`text-[${colors.text.primary}] h-15`}
							dropdownIconColor={colors.text.primary}
							mode="dropdown"
						>
							{days.map((day) => (
								<Picker.Item key={day} label={day} value={day} />
							))}
						</Picker>
					</View>
				</View>
				<View style={tw`w-1/2 pl-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>End Day</Text>
					<View style={tw`bg-[${colors.background.secondary}] rounded-md`}>
						<Picker
							selectedValue={period.end}
							onValueChange={(itemValue) => onPeriodChange({ ...period, end: itemValue })}
							style={tw`text-[${colors.text.primary}] h-15`}
							dropdownIconColor={colors.text.primary}
							mode="dropdown"
						>
							{days.map((day) => (
								<Picker.Item key={day} label={day} value={day} />
							))}
						</Picker>
					</View>
				</View>
			</View>
			<View style={tw`flex-row justify-between`}>
				<View style={tw`w-1/2 pr-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Time In</Text>
					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] rounded-md h-10 px-3 justify-center`}
						onPress={() => setShowTimeInPicker(true)}
					>
						<Text style={tw`text-[${colors.text.primary}]`}>{period.expected_time_in || "HH:MM"}</Text>
					</TouchableOpacity>
					{showTimeInPicker && (
						<DateTimePicker
							value={timeStringToDate(period.expected_time_in)}
							mode="time"
							is24Hour={true}
							onChange={(event, selectedDate) => {
								setShowTimeInPicker(false);
								if (selectedDate) {
									onPeriodChange({
										...period,
										expected_time_in: dateToTimeString(selectedDate),
									});
								}
							}}
						/>
					)}
				</View>

				<View style={tw`w-1/2 pl-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Time Out</Text>
					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] rounded-md h-10 px-3 justify-center`}
						onPress={() => setShowTimeOutPicker(true)}
					>
						<Text style={tw`text-[${colors.text.primary}]`}>{period.expected_time_out || "HH:MM"}</Text>
					</TouchableOpacity>
					{showTimeOutPicker && (
						<DateTimePicker
							value={timeStringToDate(period.expected_time_out)}
							mode="time"
							is24Hour={true}
							textColor={colors.text.primary} 
							accentColor={colors.primary.main} 
							themeVariant="dark"
							onChange={(event, selectedDate) => {
								setShowTimeOutPicker(false);
								if (selectedDate) {
									onPeriodChange({
										...period,
										expected_time_out: dateToTimeString(selectedDate),
									});
								}
							}}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

export default WorkSchedulePeriodInput
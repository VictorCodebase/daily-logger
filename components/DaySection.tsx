// components/DaySection.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../themes/colors";
import { getFormattedTime } from "../utils/DateFormat";

interface RawDate {
	date: string;
	time_in: string;
	time_out: string;
}

interface DaySectionProps {
	dayData: RawDate;
	onDayDataChange: (dayData: RawDate) => void;
}

export const DaySection: React.FC<DaySectionProps> = ({ dayData, onDayDataChange }) => {
	const [showTimeInPicker, setShowTimeInPicker] = useState(false);
	const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);
	const [hoursWorked, setHoursWorked] = useState("");

	const handleTimeInChange = (event: any, selectedTime?: Date) => {
		setShowTimeInPicker(false);
		if (selectedTime) {
			const timeString = getFormattedTime(selectedTime);
			onDayDataChange({
				...dayData,
				time_in: timeString,
			});
		}
	};

	const handleTimeOutChange = (event: any, selectedTime?: Date) => {
		setShowTimeOutPicker(false);
		if (selectedTime) {
			const timeString = getFormattedTime(selectedTime);
			onDayDataChange({
				...dayData,
				time_out: timeString,
			});
		}
	};

	const handleHoursChange = (hours: string) => {
		setHoursWorked(hours);

		if (dayData.time_in && hours && !isNaN(Number(hours))) {
			// Parse the time_in
			const [inHours, inMinutes, inSeconds] = dayData.time_in.split(":").map(Number);
			const timeInDate = new Date();
			timeInDate.setHours(inHours, inMinutes, inSeconds);

			// Add the worked hours
			const timeOutDate = new Date(timeInDate.getTime() + Number(hours) * 60 * 60 * 1000);

			onDayDataChange({
				...dayData,
				time_out: getFormattedTime(timeOutDate),
			});
		}
	};

	const formatDisplayTime = (timeString: string) => {
		if (!timeString) return "";
		return timeString.substring(0, 5); // Show only HH:MM
	};

	return (
		<View style={tw`mx-6 mt-6`}>
			<Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-4`}>Day</Text>

			<View style={tw`bg-[${colors.background.card}] rounded-2xl p-6 shadow-sm border border-[${colors.border.secondary}]`}>
				{/* Time In */}
				<View style={tw`flex-row items-center justify-between mb-4`}>
					<View style={tw`flex-row items-center flex-1`}>
						<View style={tw`w-10 h-10 bg-[${colors.primary.surface}] rounded-xl items-center justify-center mr-3`}>
							<Feather name="clock" size={18} color={colors.primary.main} />
						</View>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>Time in</Text>
					</View>

					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl px-4 py-3 min-w-20 items-center`}
						onPress={() => setShowTimeInPicker(true)}
					>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>
							{formatDisplayTime(dayData.time_in) || "06:14"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Hours Worked */}
				<View style={tw`flex-row items-center justify-between mb-4`}>
					<View style={tw`flex-row items-center flex-1`}>
						<View style={tw`w-10 h-10 bg-[${colors.background.tertiary}] rounded-xl items-center justify-center mr-3`}>
							<Feather name="activity" size={18} color={colors.text.secondary} />
						</View>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>Hours</Text>
					</View>

					<TextInput
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl px-4 py-3 min-w-20 text-center text-base font-medium text-[${colors.text.primary}]`}
						value={hoursWorked}
						onChangeText={handleHoursChange}
						placeholder="8.0"
						placeholderTextColor={colors.text.placeholder}
						keyboardType="numeric"
					/>
				</View>

				{/* Time Out */}
				<View style={tw`flex-row items-center justify-between`}>
					<View style={tw`flex-row items-center flex-1`}>
						<View style={tw`w-10 h-10 bg-[${colors.primary.surface}] rounded-xl items-center justify-center mr-3`}>
							<Feather name="clock" size={18} color={colors.primary.main} />
						</View>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>Time out</Text>
					</View>

					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl px-4 py-3 min-w-20 items-center`}
						onPress={() => setShowTimeOutPicker(true)}
					>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>
							{formatDisplayTime(dayData.time_out) || "18:14"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Time In Picker Modal */}
			{showTimeInPicker && (
				<Modal transparent animationType="slide">
					<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
						<View style={tw`bg-[${colors.background.modal}] rounded-t-3xl p-6`}>
							<View style={tw`flex-row justify-between items-center mb-6`}>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>Select Time In</Text>
								<TouchableOpacity onPress={() => setShowTimeInPicker(false)}>
									<Feather name="x" size={24} color={colors.text.secondary} />
								</TouchableOpacity>
							</View>

							<DateTimePicker
								value={new Date()}
								mode="time"
								is24Hour={true}
								display="spinner"
								onChange={handleTimeInChange}
								textColor={colors.text.primary}
							/>
						</View>
					</View>
				</Modal>
			)}

			{/* Time Out Picker Modal */}
			{showTimeOutPicker && (
				<Modal transparent animationType="slide">
					<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
						<View style={tw`bg-[${colors.background.modal}] rounded-t-3xl p-6`}>
							<View style={tw`flex-row justify-between items-center mb-6`}>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>Select Time Out</Text>
								<TouchableOpacity onPress={() => setShowTimeOutPicker(false)}>
									<Feather name="x" size={24} color={colors.text.secondary} />
								</TouchableOpacity>
							</View>

							<DateTimePicker
								value={new Date()}
								mode="time"
								is24Hour={true}
								display="spinner"
								onChange={handleTimeOutChange}
								textColor={colors.text.primary}
							/>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
};

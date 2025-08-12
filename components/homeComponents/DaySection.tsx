// components/DaySection.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../themes/colors";
import { getFormattedTime } from "../../utils/DateFormatUtil";
import { Day } from "../../models/ViewModel_Models";

interface RawDate {
	date: string;
	time_in: string;
	time_out: string;
}

interface DaySectionProps {
	dayData: Day;
	onDayDataChange: (dayData: Day) => void;
}

export const DaySection: React.FC<DaySectionProps> = ({ dayData, onDayDataChange }) => {
	const [showTimeInPicker, setShowTimeInPicker] = useState(false);
	const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);
	const [hoursWorked, setHoursWorked] = useState("8");
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize default values on component mount
	useEffect(() => {
		if (!isInitialized) {
			const now = new Date();
			const currentTimeString = getFormattedTime(now);

			// Calculate time out (current time + 8 hours)
			const timeOutDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
			const timeOutString = getFormattedTime(timeOutDate);

			// Only set defaults if dayData doesn't have values already
			const updatedDayData = {
				...dayData,
				time_in: dayData.time_in || currentTimeString,
				time_out: dayData.time_out || timeOutString,
			};

			onDayDataChange(updatedDayData);
			setIsInitialized(true);
		}
	}, [dayData, onDayDataChange, isInitialized]);

	// Calculate hours worked when time_in or time_out changes
	useEffect(() => {
		if (dayData.time_in && dayData.time_out && isInitialized) {
			const calculatedHours = calculateHoursDifference(dayData.time_in, dayData.time_out);
			setHoursWorked(calculatedHours.toString());
		}
	}, [dayData.time_in, dayData.time_out, isInitialized]);

	const calculateHoursDifference = (timeIn: string, timeOut: string): number => {
		const [inHours, inMinutes, inSeconds] = timeIn.split(":").map(Number);
		const [outHours, outMinutes, outSeconds] = timeOut.split(":").map(Number);

		const timeInDate = new Date();
		timeInDate.setHours(inHours, inMinutes, inSeconds || 0);

		const timeOutDate = new Date();
		timeOutDate.setHours(outHours, outMinutes, outSeconds || 0);

		// Handle case where time_out is next day
		if (timeOutDate < timeInDate) {
			timeOutDate.setDate(timeOutDate.getDate() + 1);
		}

		const diffInMs = timeOutDate.getTime() - timeInDate.getTime();
		const diffInHours = diffInMs / (1000 * 60 * 60);

		return Math.round(diffInHours * 10) / 10; // Round to 1 decimal place
	};

	const parseTimeToDate = (timeString: string): Date => {
		const [hours, minutes, seconds] = timeString.split(":").map(Number);
		const date = new Date();
		date.setHours(hours, minutes, seconds || 0, 0);
		return date;
	};

	const handleTimeInChange = (event: any, selectedTime?: Date) => {
		setShowTimeInPicker(false);
		if (selectedTime) {
			const timeString = getFormattedTime(selectedTime);

			// Calculate new time_out based on current hours worked
			const hoursToAdd = parseFloat(hoursWorked) || 8;
			const timeOutDate = new Date(selectedTime.getTime() + hoursToAdd * 60 * 60 * 1000);
			const timeOutString = getFormattedTime(timeOutDate);

			onDayDataChange({
				...dayData,
				time_in: timeString,
				time_out: timeOutString,
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
			// Hours will be automatically calculated by useEffect
		}
	};

	const handleHoursChange = (hours: string) => {
		setHoursWorked(hours);

		if (dayData.time_in && hours && !isNaN(Number(hours))) {
			// Parse the time_in
			const timeInDate = parseTimeToDate(dayData.time_in);

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

	// Get current values for DateTimePicker
	const getTimeInPickerValue = (): Date => {
		if (dayData.time_in) {
			return parseTimeToDate(dayData.time_in);
		}
		return new Date();
	};

	const getTimeOutPickerValue = (): Date => {
		if (dayData.time_out) {
			return parseTimeToDate(dayData.time_out);
		}
		return new Date();
	};

	return (
		<View style={tw`mx-4 mt-6`}>
			<Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-4`}>Day</Text>

			<View style={tw`bg-[${colors.background.card}] rounded-2xl p-6 shadow-sm border border-[${colors.border.secondary}]`}>
				{/* Time In */}
				<View style={tw`flex-row items-center justify-between mb-2`}>
					<View style={tw`flex-row items-center flex-1`}>
						<View style={tw`w-10 h-10 bg-[${colors.surface.elevated}] rounded-xl items-center justify-center mr-3`}>
							<Feather name="clock" size={18} color={colors.primary.main} />
						</View>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>Time in</Text>
					</View>

					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl px-4 py-3 min-w-20 items-center`}
						onPress={() => setShowTimeInPicker(true)}
					>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>
							{dayData.time_in ? formatDisplayTime(dayData.time_in) : "HH:MM"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Hours Worked */}
				<View style={tw`flex-row items-center justify-between mb-2`}>
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
						<View style={tw`w-10 h-10 bg-[${colors.surface.elevated}] rounded-xl items-center justify-center mr-3`}>
							<Feather name="clock" size={18} color={colors.primary.main} />
						</View>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>Time out</Text>
					</View>

					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl px-4 py-3 min-w-20 items-center`}
						onPress={() => setShowTimeOutPicker(true)}
					>
						<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>
							{dayData.time_out ? formatDisplayTime(dayData.time_out) : "HH:MM"}
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
								value={getTimeInPickerValue()}
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
								value={getTimeOutPickerValue()}
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

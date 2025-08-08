// components/SpecialActivityBlock.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../themes/colors";
import { getFormattedTime } from "../utils/DateFormat";

interface RawActivity {
	content: string;
	category: string;
	time_start: string;
	time_end: string;
}

interface SpecialActivityBlockProps {
	activity: RawActivity;
	onActivityChange: (activity: RawActivity) => void;
	onRemove: () => void;
}

export const SpecialActivityBlock: React.FC<SpecialActivityBlockProps> = ({ activity, onActivityChange, onRemove }) => {
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	const handleStartTimeChange = (event: any, selectedTime?: Date) => {
		setShowStartTimePicker(false);
		if (selectedTime) {
			const timeString = getFormattedTime(selectedTime);
			onActivityChange({
				...activity,
				time_start: timeString,
			});
		}
	};

	const handleEndTimeChange = (event: any, selectedTime?: Date) => {
		setShowEndTimePicker(false);
		if (selectedTime) {
			const timeString = getFormattedTime(selectedTime);
			onActivityChange({
				...activity,
				time_end: timeString,
			});
		}
	};

	const formatDisplayTime = (timeString: string) => {
		if (!timeString) return "";
		return timeString.substring(0, 5); // Show only HH:MM
	};

	return (
		<View style={tw`bg-[${colors.background.card}] rounded-2xl p-6 mb-4 shadow-sm border-2 border-[${colors.status.warning}20] border-dashed`}>
			{/* Header */}
			<View style={tw`flex-row items-center justify-between mb-4`}>
				<View style={tw`flex-row items-center`}>
					<View style={tw`w-10 h-10 bg-[${colors.status.warning}20] rounded-xl items-center justify-center mr-3`}>
						<Feather name="star" size={18} color={colors.status.warning} />
					</View>
					<Text style={tw`text-base font-semibold text-[${colors.text.primary}]`}>Special Activity</Text>
				</View>

				<TouchableOpacity onPress={onRemove} style={tw`w-8 h-8 items-center justify-center`}>
					<Feather name="trash-2" size={16} color={colors.text.secondary} />
				</TouchableOpacity>
			</View>

			{/* Details Field */}
			<View style={tw`mb-4`}>
				<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>
					Details <Text style={tw`text-[${colors.status.error}]`}>*</Text>
				</Text>
				<TextInput
					style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] min-h-24`}
					value={activity.content}
					onChangeText={(text) => onActivityChange({ ...activity, content: text })}
					placeholder="Enter special activity details..."
					placeholderTextColor={colors.text.placeholder}
					multiline
					textAlignVertical="top"
				/>
			</View>

			{/* Category Field */}
			<View style={tw`mb-4`}>
				<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>Category</Text>
				<TextInput
					style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}]`}
					value={activity.category}
					onChangeText={(text) => onActivityChange({ ...activity, category: text })}
					placeholder="e.g., Meeting"
					placeholderTextColor={colors.text.placeholder}
				/>
			</View>

			{/* Time Fields */}
			<View style={tw`flex-row gap-4`}>
				{/* Time Start */}
				<View style={tw`flex-1`}>
					<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>Time Start</Text>
					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 flex-row items-center justify-between`}
						onPress={() => setShowStartTimePicker(true)}
					>
						<Text style={tw`text-base text-[${activity.time_start ? colors.text.primary : colors.text.placeholder}]`}>
							{formatDisplayTime(activity.time_start) || "Select time"}
						</Text>
						<Feather name="clock" size={16} color={colors.text.secondary} />
					</TouchableOpacity>
				</View>

				{/* Time End */}
				<View style={tw`flex-1`}>
					<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>Time End</Text>
					<TouchableOpacity
						style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 flex-row items-center justify-between`}
						onPress={() => setShowEndTimePicker(true)}
					>
						<Text style={tw`text-base text-[${activity.time_end ? colors.text.primary : colors.text.placeholder}]`}>
							{formatDisplayTime(activity.time_end) || "Select time"}
						</Text>
						<Feather name="clock" size={16} color={colors.text.secondary} />
					</TouchableOpacity>
				</View>
			</View>

			{/* Time Start Picker Modal */}
			{showStartTimePicker && (
				<Modal transparent animationType="slide">
					<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
						<View style={tw`bg-[${colors.background.modal}] rounded-t-3xl p-6`}>
							<View style={tw`flex-row justify-between items-center mb-6`}>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>Select Start Time</Text>
								<TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
									<Feather name="x" size={24} color={colors.text.secondary} />
								</TouchableOpacity>
							</View>

							<DateTimePicker
								value={new Date()}
								mode="time"
								is24Hour={true}
								display="spinner"
								onChange={handleStartTimeChange}
								textColor={colors.text.primary}
							/>
						</View>
					</View>
				</Modal>
			)}

			{/* Time End Picker Modal */}
			{showEndTimePicker && (
				<Modal transparent animationType="slide">
					<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
						<View style={tw`bg-[${colors.background.modal}] rounded-t-3xl p-6`}>
							<View style={tw`flex-row justify-between items-center mb-6`}>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>Select End Time</Text>
								<TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
									<Feather name="x" size={24} color={colors.text.secondary} />
								</TouchableOpacity>
							</View>

							<DateTimePicker
								value={new Date()}
								mode="time"
								is24Hour={true}
								display="spinner"
								onChange={handleEndTimeChange}
								textColor={colors.text.primary}
							/>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
};

// screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../themes/colors";
import { DaySection } from "../components/DaySection";
import { ActivityBlock } from "../components/ActivityBlock";
import { SpecialActivityBlock } from "../components/SpecialActivityBlock";
import { SaveTemplateModal } from "../components/SaveTemplateModal";
import { saveActivities, createTemplate } from "../stores/HomeViewModel"
import {getFormattedDate, getFormattedTime} from "../utils/DateFormat"

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

const HomeScreen: React.FC = () => {
	// Day section state
	const [dayData, setDayData] = useState<RawDate>({
		date: getFormattedDate(),
		time_in: "",
		time_out: "",
	});

	// Activities state
	const [activities, setActivities] = useState<RawActivity[]>([{ content: "", category: "", time_start: "", time_end: "" }]);

	const [specialActivities, setSpecialActivities] = useState<RawActivity[]>([]);

	// Modal state
	const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const addActivity = () => {
		setActivities([...activities, { content: "", category: "", time_start: "", time_end: "" }]);
	};

	const removeActivity = (index: number) => {
		if (activities.length > 1) {
			// Keep at least one activity
			setActivities(activities.filter((_, i) => i !== index));
		}
	};

	const updateActivity = (index: number, updatedActivity: RawActivity) => {
		const newActivities = [...activities];
		newActivities[index] = updatedActivity;
		setActivities(newActivities);
	};

	const addSpecialActivity = () => {
		setSpecialActivities([...specialActivities, { content: "", category: "", time_start: "", time_end: "" }]);
	};

	const removeSpecialActivity = (index: number) => {
		setSpecialActivities(specialActivities.filter((_, i) => i !== index));
	};

	const updateSpecialActivity = (index: number, updatedActivity: RawActivity) => {
		const newSpecialActivities = [...specialActivities];
		newSpecialActivities[index] = updatedActivity;
		setSpecialActivities(newSpecialActivities);
	};

	const validateForm = (): boolean => {
		// Check if at least one activity has content
		const hasValidActivity = activities.some((activity) => activity.content.trim() !== "");

		if (!hasValidActivity) {
			Alert.alert("Validation Error", "At least one activity must have details filled out.");
			return false;
		}

		return true;
	};

	const handleSave = async (): Promise<boolean> => {
		if (!validateForm()) return false;

		setIsSaving(true);
		try {
			const success = await saveActivities(dayData, activities, specialActivities);

			if (success) {
				Alert.alert("Success", "Activities saved successfully!");
			} else {
				Alert.alert("Error", "Failed to save activities. Please try again.");
			}

			return success;
		} catch (error) {
			Alert.alert("Error", "An unexpected error occurred.");
			return false;
		} finally {
			setIsSaving(false);
		}
	};

	const handleSaveTemplate = async () => {
		const saveSuccess = await handleSave();

		if (saveSuccess) {
			setIsTemplateModalVisible(true);
		}
	};

	const handleTemplateSubmit = async (name: string, description: string, colorCode: string) => {
		const contentJson = JSON.stringify({
			dayData,
			activities,
			specialActivities,
		});

		try {
			const success = await createTemplate(name, description, colorCode, contentJson);

			if (success) {
				Alert.alert("Success", "Template saved successfully!");
				setIsTemplateModalVisible(false);
			} else {
				Alert.alert("Error", "Failed to save template. Please try again.");
			}
		} catch (error) {
			Alert.alert("Error", "An unexpected error occurred while saving template.");
		}
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}]`}>


			<ScrollView style={tw`flex-1`} contentContainerStyle={tw``} showsVerticalScrollIndicator={false}>
				{/* Welcome Card */}
				<View style={tw`mx-4 p-6 `}>
					<View style={tw`flex-row items-center mb-4`}>
						
						<View>
							<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>Mbwaa Media Activity Logger</Text>
							<Text style={tw`text-sm text-[${colors.text.secondary}]`}>Welcome back User Name</Text>
						</View>
					</View>

						<Text style={tw`text-3xl font-bold text-[${colors.text.primary}]`}>Thursday</Text>
						<Text style={tw`text-sm text-[${colors.text.secondary}]`}>09.11.2023</Text>
				</View>

				{/* Day Section */}
				<DaySection dayData={dayData} onDayDataChange={setDayData} />

				{/* Activities Section */}
				<View style={tw`mx-6 mt-6`}>
					<Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-4`}>Activities</Text>

					{activities.map((activity, index) => (
						<ActivityBlock
							key={`activity-${index}`}
							activity={activity}
							onActivityChange={(updatedActivity) => updateActivity(index, updatedActivity)}
							onRemove={activities.length > 1 ? () => removeActivity(index) : undefined}
							isRequired={index === 0}
						/>
					))}

					{/* Add Activity Button */}
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-4 px-6 bg-[${colors.surface.elevated}] border-2 border-dashed border-[${colors.primary.main}] rounded-xl mt-4`}
						onPress={addActivity}
					>
						<Feather name="plus" size={20} color={colors.primary.main} />
						<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>Add Activity</Text>
					</TouchableOpacity>

					{/* Special Activities */}
					{specialActivities.length > 0 && (
						<View style={tw`mt-8`}>
							<Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-4`}>Special Activities</Text>

							{specialActivities.map((activity, index) => (
								<SpecialActivityBlock
									key={`special-${index}`}
									activity={activity}
									onActivityChange={(updatedActivity) => updateSpecialActivity(index, updatedActivity)}
									onRemove={() => removeSpecialActivity(index)}
								/>
							))}
						</View>
					)}

					{/* Add Special Activity Button */}
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-4 px-6 bg-[${colors.background.tertiary}] border-2 border-dashed border-[${colors.text.tertiary}] rounded-xl mt-4`}
						onPress={addSpecialActivity}
					>
						<Feather name="star" size={20} color={colors.text.secondary} />
						<Text style={tw`ml-2 text-[${colors.text.secondary}] font-medium`}>Add Special Activity</Text>
					</TouchableOpacity>
				</View>

				{/* Preview Button */}
				<View style={tw`mx-6 mt-8`}>
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-4 px-6 bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl`}
					>
						<Feather name="eye" size={20} color={colors.text.secondary} />
						<Text style={tw`ml-2 text-[${colors.text.secondary}] font-medium`}>Preview</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Bottom Buttons */}
			<View
				style={tw`absolute bottom-0 left-0 right-0 bg-[${colors.background.primary}] border-t border-[${colors.border.secondary}] px-6 py-4`}
			>
				<View style={tw`flex-row gap-4`}>
					<TouchableOpacity
						style={tw`flex-1 py-4 px-6 bg-[${colors.primary.main}] rounded-xl flex-row items-center justify-center`}
						onPress={handleSave}
						disabled={isSaving}
					>
						<Feather name="save" size={20} color={colors.text.inverse} />
						<Text style={tw`ml-2 text-[${colors.text.inverse}] font-semibold`}>{isSaving ? "Saving..." : "Save"}</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={tw`flex-1 py-4 px-6 bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl flex-row items-center justify-center`}
						onPress={handleSaveTemplate}
						disabled={isSaving}
					>
						<Feather name="bookmark" size={20} color={colors.text.primary} />
						<Text style={tw`ml-2 text-[${colors.text.primary}] font-semibold`}>Save Template</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Save Template Modal */}
			<SaveTemplateModal visible={isTemplateModalVisible} onClose={() => setIsTemplateModalVisible(false)} onSubmit={handleTemplateSubmit} />
		</SafeAreaView>
	);
};

export default HomeScreen;

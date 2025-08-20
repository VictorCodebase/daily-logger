import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../themes/colors";
import { useUser } from "../context/UserContext";
import { DaySection } from "../components/homeComponents/DaySection";
import { ActivityBlock } from "../components/homeComponents/ActivityBlock";
import { SpecialActivityBlock } from "../components/homeComponents/SpecialActivityBlock";
import { SaveTemplateModal } from "../components/modals/SaveTemplateModal";
import ApplyTemplateModal from "../components/modals/ApplyTemplateModal";
import { saveActivities, createTemplate, listTemplates, acquireTemplate, TemplateContent } from "../stores/HomeViewModel";
import { getFormattedDate } from "../utils/DateFormatUtil";
import { RawDate, RawActivity } from "../models/View_Models";

// A small interface for the template "glimpse" returned by the DB
interface TemplateGlimpse {
	log_template_id: number;
	name: string;
	color_code: string;
}

const HomeScreen: React.FC = () => {
	const { user, isLoggedIn } = useUser();

	// today details:
	const today = new Date();

	const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
	const dateStr = today.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	// Day section state
	const [dayData, setDayData] = useState<RawDate>({
		date: getFormattedDate(),
		time_in: "",
		time_out: "",
	});

	// Activities state
	const [activities, setActivities] = useState<RawActivity[]>([{ content: "", category: "", time_start: "", time_end: "" }]);
	const [specialActivities, setSpecialActivities] = useState<RawActivity[]>([]);

	// Modal states
	const [isSaveTemplateModalVisible, setIsSaveTemplateModalVisible] = useState(false);
	const [isApplyTemplateModalVisible, setIsApplyTemplateModalVisible] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Template states
	const [availableTemplates, setAvailableTemplates] = useState<TemplateGlimpse[]>([]);
	const [appliedTemplate, setAppliedTemplate] = useState<{ name: string; color: string } | null>(null);

	// Fetch templates on component load
	useEffect(() => {
		const fetchTemplates = async () => {
			const templates = await listTemplates();
			if (templates) {
				setAvailableTemplates(templates);
			}
		};
		fetchTemplates();
	}, []);

	// --- Template Application Logic ---
	const handleApplyTemplate = async (templateId: number) => {
		setIsLoading(true);
		const templateData = await acquireTemplate(templateId);
		setIsLoading(false);
		if (templateData) {
			setDayData(templateData.content.dayData);
			setActivities(
				templateData.content.activities.length > 0
					? templateData.content.activities
					: [{ content: "", category: "", time_start: "", time_end: "" }]
			);
			setSpecialActivities(templateData.content.specialActivities);
			setAppliedTemplate({ name: templateData.name, color: templateData.color });
			setIsApplyTemplateModalVisible(false);
			Alert.alert("Template Applied", `The template '${templateData.name}' has been applied.`);
		} else {
			Alert.alert("Error", "Failed to load template data.");
		}
	};

	const handleUnapplyTemplate = () => {
		setDayData({ date: getFormattedDate(), time_in: "", time_out: "" });
		setActivities([{ content: "", category: "", time_start: "", time_end: "" }]);
		setSpecialActivities([]);
		setAppliedTemplate(null);
	};

	// --- Activity Management Logic ---
	const addActivity = () => {
		setActivities([...activities, { content: "", category: "", time_start: "", time_end: "" }]);
	};

	const removeActivity = (index: number) => {
		if (activities.length > 1) {
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

	// --- Form Submission Logic ---
	const validateForm = (): boolean => {
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
				handleUnapplyTemplate(); // Reset the form after saving
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
		setIsSaveTemplateModalVisible(true);
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
				setIsSaveTemplateModalVisible(false);
				// Refresh the list of available templates
				const updatedTemplates = await listTemplates();
				if (updatedTemplates) {
					setAvailableTemplates(updatedTemplates);
				}
			} else {
				Alert.alert("Error", "Failed to save template. Please try again.");
			}
		} catch (error) {
			Alert.alert("Error", "An unexpected error occurred while saving template.");
		}
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}]`}>
			{isLoading && (
				<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
					<ActivityIndicator size="large" color={colors.primary.main} />
				</View>
			)}
			<ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-28`} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={tw`p-6 `}>
					{isLoggedIn && user && <Text style={tw`text-sm text-[${colors.text.secondary}]`}>Welcome back, {user.name}</Text>}
					<Text style={tw`text-4xl font-bold text-[${colors.text.primary}]`}>{dayName}</Text>
					<Text style={tw`text-sm text-[${colors.text.secondary}]`}>{dateStr}</Text>
				</View>

				{/* Apply Template Button */}
				{availableTemplates.length > 0 && !appliedTemplate && (
					<View style={tw`px-4 mt-5`}>
						<TouchableOpacity
							style={tw`flex-row items-center justify-center py-3 bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl`}
							onPress={() => setIsApplyTemplateModalVisible(true)}
						>
							<Feather name="layers" size={18} color={colors.primary.main} />
							<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>Apply Template</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Applied Template Message */}
				{appliedTemplate && (
					<View
						style={tw`mx-4 mt-3 flex-row items-center justify-between p-3 bg-[${colors.surface.elevated}] rounded-xl border border-[${colors.border.primary}]`}
					>
						<View style={tw`flex-row items-center`}>
							<View style={[tw`w-3 h-3 rounded-full mr-2`, { backgroundColor: appliedTemplate.color }]} />
							<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>
								Applied '{appliedTemplate.name}' template
							</Text>
						</View>
						<TouchableOpacity onPress={handleUnapplyTemplate} style={tw`p-1`}>
							<Feather name="x" size={18} color={colors.text.secondary} />
						</TouchableOpacity>
					</View>
				)}

				{/* Day Section */}
				<View>
					<DaySection dayData={dayData} onDayDataChange={setDayData} />
				</View>

				{/* Activities */}
				<View style={tw`mt-8 px-4`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Activities</Text>
					{activities.map((activity, index) => (
						<ActivityBlock
							key={`activity-${index}`}
							activity={activity}
							onActivityChange={(updated) => updateActivity(index, updated)}
							onRemove={activities.length > 1 ? () => removeActivity(index) : undefined}
							isRequired={index === 0}
						/>
					))}
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-3 bg-[${colors.surface.elevated}] border border-dashed border-[${colors.primary.main}] rounded-xl mt-3`}
						onPress={addActivity}
					>
						<Feather name="plus" size={18} color={colors.primary.main} />
						<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>Add Activity</Text>
					</TouchableOpacity>
				</View>

				{/* Special Activities */}
				{specialActivities.length > 0 && (
					<View style={tw`mt-8 px-4`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Special Activities</Text>
						{specialActivities.map((activity, index) => (
							<SpecialActivityBlock
								key={`special-${index}`}
								activity={activity}
								onActivityChange={(updated) => updateSpecialActivity(index, updated)}
								onRemove={() => removeSpecialActivity(index)}
							/>
						))}
					</View>
				)}
				<TouchableOpacity
					style={tw`flex-row items-center justify-center py-3 bg-[${colors.background.tertiary}] border border-dashed border-[${colors.text.tertiary}] rounded-xl mt-3 mx-4`}
					onPress={addSpecialActivity}
				>
					<Feather name="star" size={18} color={colors.text.secondary} />
					<Text style={tw`ml-2 text-[${colors.text.secondary}] font-medium`}>Add Special Activity</Text>
				</TouchableOpacity>

				{/* Preview Button */}
				<View style={tw`mt-8 px-4`}>
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-3 bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl`}
					>
						<Feather name="eye" size={18} color={colors.text.secondary} />
						<Text style={tw`ml-2 text-[${colors.text.secondary}] font-medium`}>Preview</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Bottom Actions */}
			<View
				style={tw`absolute bottom-0 left-0 right-0 bg-[${colors.background.primary}] border-t border-[${colors.border.secondary}] px-4 py-4`}
			>
				<View style={tw`flex-row gap-4`}>
					<TouchableOpacity
						style={tw`flex-1 py-4 bg-[${colors.primary.main}] rounded-xl flex-row items-center justify-center`}
						onPress={handleSave}
						disabled={isSaving}
					>
						<Feather name="save" size={18} color={colors.text.inverse} />
						<Text style={tw`ml-2 text-[${colors.text.inverse}] font-semibold`}>{isSaving ? "Saving..." : "Save"}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={tw`flex-1 py-4 bg-transparent border border-[${colors.border.primary}] rounded-xl flex-row items-center justify-center`}
						onPress={handleSaveTemplate}
						disabled={isSaving}
					>
						<Feather name="bookmark" size={18} color={colors.text.primary} />
						<Text style={tw`ml-2 text-[${colors.text.primary}] font-semibold`}>Save Template</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Save Template Modal */}
			<SaveTemplateModal
				visible={isSaveTemplateModalVisible}
				onClose={() => setIsSaveTemplateModalVisible(false)}
				onSubmit={handleTemplateSubmit}
			/>

			{/* Apply Template Modal */}
			<ApplyTemplateModal
				visible={isApplyTemplateModalVisible}
				onClose={() => setIsApplyTemplateModalVisible(false)}
				onSelectTemplate={handleApplyTemplate}
				templates={availableTemplates}
			/>
		</SafeAreaView>
	);
};

export default HomeScreen;

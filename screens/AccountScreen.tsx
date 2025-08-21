import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Platform, ActionSheetIOS, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../themes/colors";
import { useUser } from "../context/UserContext";
import {
	initializeAccountData,
	saveAccountChanges,
	handleImageSelection,
	filterTemplates,
	confirmAndDeleteTemplates,
	AccountFormData,
	TemplateItem,
} from "../stores/AccountViewModel";
import { handleProfilePhotoUpload, handleProfilePhotoCameraCapture, getImagePickerOptions } from "../utils/ImageUploadUtils";
import { ResponsibilitiesSummary, WorkSchedulePeriod } from "../models/ViewModel_Models";
import WorkSchedulePeriodInput from "../components/OnboardComponents/WorkSchedulePeriodInput";
import COLOR_OPTIONS from "../utils/ColorOptionsUtil";
import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
	const userContext = useUser();
	const user = userContext.user;

	// State
	const [formData, setFormData] = useState<AccountFormData>({
		name: "",
		email: "",
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
		roles: [],
		workSchedule: { periods: [] },
		avatar: "",
		avatarUri: "",
		responsibilitiesContent: "",
	});

	const [responsibilities, setResponsibilities] = useState<ResponsibilitiesSummary | null>(null);
	const [templates, setTemplates] = useState<TemplateItem[]>([]);
	const [filteredTemplates, setFilteredTemplates] = useState<TemplateItem[]>([]);
	const [templateSearchQuery, setTemplateSearchQuery] = useState("");
	const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
	const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [roleInput, setRoleInput] = useState("");

	// Initialize data
	useEffect(() => {
		loadAccountData();
	}, [user]);

	// Filter templates when search query changes
	useEffect(() => {
		setFilteredTemplates(filterTemplates(templates, templateSearchQuery));
	}, [templates, templateSearchQuery]);

	const loadAccountData = async () => {
		if (!user) return;

		try {
			setIsLoading(true);
			const {
				formData: initialFormData,
				responsibilities: userResponsibilities,
				templates: userTemplates,
			} = await initializeAccountData(user);

			setFormData(initialFormData);
			setResponsibilities(userResponsibilities);
			setTemplates(userTemplates);
			setFilteredTemplates(userTemplates);
		} catch (error) {
			Alert.alert("Error", "Failed to load account data");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle form input changes
	const updateFormData = (field: keyof AccountFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Handle roles management
	const handleAddRole = (text: string) => {
		setRoleInput(text);
		if (text.endsWith(",") || text.endsWith("\n")) {
			const newRole = text.slice(0, -1).trim();
			if (newRole && !formData.roles.includes(newRole)) {
				updateFormData("roles", [...formData.roles, newRole]);
			}
			setRoleInput("");
		}
	};

	const removeRole = (roleToRemove: string) => {
		updateFormData(
			"roles",
			formData.roles.filter((role) => role !== roleToRemove)
		);
	};

	// Handle work schedule management
	const updatePeriod = (index: number, updatedPeriod: WorkSchedulePeriod) => {
		const updatedPeriods = [...formData.workSchedule.periods];
		updatedPeriods[index] = updatedPeriod;
		updateFormData("workSchedule", { periods: updatedPeriods });
	};

	const handleAddPeriod = () => {
		const newPeriod: WorkSchedulePeriod = {
			start: "",
			end: "",
			expected_time_in: "",
			expected_time_out: "",
		};
		updateFormData("workSchedule", {
			periods: [...formData.workSchedule.periods, newPeriod],
		});
	};

	const handleRemovePeriod = (index: number) => {
		const updatedPeriods = formData.workSchedule.periods.filter((_, i) => i !== index);
		updateFormData("workSchedule", { periods: updatedPeriods });
	};

	// Handle image upload
	const handleImageUploadPress = () => {
		if (Platform.OS === "ios") {
			const options = getImagePickerOptions();
			ActionSheetIOS.showActionSheetWithOptions(
				{
					options: options.map((opt) => opt.title),
					cancelButtonIndex: 2,
				},
				(buttonIndex) => {
					const handler = options[buttonIndex].handler;
					if (handler) {
						handleImageSelectionWrapper(handler);
					}
				}
			);
		} else {
			Alert.alert("Select Photo", "Choose how you want to select your profile photo", [
				{
					text: "Choose from Library",
					onPress: () => handleImageSelectionWrapper(handleProfilePhotoUpload),
				},
				{
					text: "Take Photo",
					onPress: () => handleImageSelectionWrapper(handleProfilePhotoCameraCapture),
				},
				{
					text: "Cancel",
					style: "cancel",
				},
			]);
		}
	};

	const handleImageSelectionWrapper = async (selectionMethod: () => Promise<any>) => {
		setIsUploadingImage(true);

		try {
			const result = await handleImageSelection(selectionMethod);

			if (result.success) {
				updateFormData("avatar", result.imagePath || "");
				updateFormData("avatarUri", result.imageUri || "");
				Alert.alert("Success", result.message);
			} else {
				Alert.alert("Error", result.message);
			}
		} catch (error) {
			Alert.alert("Error", "An unexpected error occurred");
			console.error("Image selection error:", error);
		} finally {
			setIsUploadingImage(false);
		}
	};

	// Handle template management
	const toggleTemplateSelection = (templateId: number) => {
		setSelectedTemplates((prev) => (prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]));
	};

	const handleDeleteTemplates = async () => {
		if (selectedTemplates.length === 0) {
			Alert.alert("Error", "Please select templates to delete");
			return;
		}

		Alert.alert("Confirm Deletion", `Are you sure you want to delete ${selectedTemplates.length} template(s)? This action cannot be undone.`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					const result = await confirmAndDeleteTemplates(selectedTemplates);
					Alert.alert(result.status === "success" ? "Success" : "Error", result.message);

					if (result.status === "success") {
						// Refresh templates
						await loadAccountData();
						setSelectedTemplates([]);
					}
				},
			},
		]);
	};

	// Handle save
	const handleSave = async () => {
		if (!user) return;

		Alert.alert("Confirm Changes", "Are you sure you want to save all changes to your account?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Save",
				onPress: async () => {
					setIsSaving(true);
					try {
						console.log("responsibilities: ", responsibilities)
						const result = await saveAccountChanges(formData, user, responsibilities, userContext);
						Alert.alert(result.status === "success" ? "Success" : "Error", result.message);
					} catch (error) {
						Alert.alert("Error", "An unexpected error occurred");
					} finally {
						setIsSaving(false);
					}
				},
			},
		]);
	};

	const getColorNameFromCode = (colorCode: string): string => {
		const colorOption = COLOR_OPTIONS.find((option) => option.value === colorCode);
		return colorOption ? colorOption.label : "Unknown";
	};

	if (isLoading) {
		return (
			<View style={tw`flex-1 justify-center items-center bg-[${colors.background.primary}]`}>
				<Text style={tw`text-[${colors.text.primary}]`}>Loading account data...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}]`}>
			<ScrollView style={tw`flex-1 bg-[${colors.background.primary}]`}>
				<View style={tw`p-6`}>
					{isLoading && (
						<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
							<ActivityIndicator size="large" color={colors.primary.main} />
						</View>
					)}

					{/* Header */}
					<View style={tw`pt-10 pb-5`}>
						<Text style={tw`text-4xl font-bold text-[${colors.text.primary}]`}>Account Settings</Text>
						<Text style={tw`text-sm text-[${colors.text.secondary}]`}>{user?.name}'s Account</Text>
					</View>
					{/* Profile Photo Section */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Profile Photo</Text>
						{formData.avatarUri && (
							<Image
								source={{ uri: formData.avatarUri }}
								style={tw`w-24 h-24 rounded-full mb-4 self-center`}
								resizeMode="cover"
							/>
						)}
						<TouchableOpacity
							style={tw`flex-row items-center justify-center py-3 bg-[${
								colors.surface.elevated
							}] border border-dashed border-[${colors.primary.main}] rounded-xl ${
								isUploadingImage ? "opacity-50" : ""
							}`}
							onPress={handleImageUploadPress}
							disabled={isUploadingImage}
						>
							<Feather name={formData.avatarUri ? "check-circle" : "upload"} size={18} color={colors.primary.main} />
							<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>
								{isUploadingImage
									? "Uploading..."
									: formData.avatarUri
									? "Photo Selected"
									: "Upload Profile Photo"}
							</Text>
						</TouchableOpacity>
					</View>

					{/* Personal Details */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Personal Details</Text>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Full Name"
							placeholderTextColor={colors.text.secondary}
							value={formData.name}
							onChangeText={(text) => updateFormData("name", text)}
						/>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Email"
							placeholderTextColor={colors.text.secondary}
							keyboardType="email-address"
							value={formData.email}
							onChangeText={(text) => updateFormData("email", text)}
						/>
					</View>

					{/* Password Section */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Change Password</Text>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Current Password"
							placeholderTextColor={colors.text.secondary}
							secureTextEntry
							value={formData.currentPassword}
							onChangeText={(text) => updateFormData("currentPassword", text)}
						/>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="New Password"
							placeholderTextColor={colors.text.secondary}
							secureTextEntry
							value={formData.newPassword}
							onChangeText={(text) => updateFormData("newPassword", text)}
						/>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Confirm New Password"
							placeholderTextColor={colors.text.secondary}
							secureTextEntry
							value={formData.confirmNewPassword}
							onChangeText={(text) => updateFormData("confirmNewPassword", text)}
						/>
					</View>

					{/* Job Details */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Job Details</Text>

						{/* Roles */}
						<View style={tw`flex-row flex-wrap mb-2`}>
							{formData.roles.map((role, index) => (
								<View
									key={index}
									style={tw`flex-row items-center bg-[${colors.background.secondary}] rounded-full px-3 py-1 mr-2 mb-2`}
								>
									<Text style={tw`text-[${colors.text.primary}] mr-2`}>{role}</Text>
									<TouchableOpacity onPress={() => removeRole(role)}>
										<Feather name="x" size={14} color={colors.text.secondary} />
									</TouchableOpacity>
								</View>
							))}
						</View>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Enter roles (e.g., Manager, Trainer)"
							placeholderTextColor={colors.text.secondary}
							value={roleInput}
							onChangeText={handleAddRole}
						/>
					</View>

					{/* Work Schedule */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Work Schedule</Text>
						{formData.workSchedule.periods.map((period, index) => (
							<WorkSchedulePeriodInput
								key={index}
								period={period}
								index={index}
								onPeriodChange={(updated) => updatePeriod(index, updated)}
								onRemove={() => handleRemovePeriod(index)}
							/>
						))}
						<TouchableOpacity
							style={tw`flex-row items-center justify-center py-3 bg-[${colors.surface.elevated}] border border-dashed border-[${colors.primary.main}] rounded-xl mt-4`}
							onPress={handleAddPeriod}
						>
							<Feather name="plus" size={18} color={colors.primary.main} />
							<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>Add Work Period</Text>
						</TouchableOpacity>
					</View>

					{/* Responsibilities Summary */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Responsibilities Summary</Text>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl min-h-24 px-4 py-3`}
							placeholder="Describe your key responsibilities..."
							placeholderTextColor={colors.text.secondary}
							multiline
							textAlignVertical="top"
							value={formData.responsibilitiesContent}
							onChangeText={(text) => updateFormData("responsibilitiesContent", text)}
						/>
					</View>

					{/* Template Management */}
					<View style={tw`mb-6`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Manage Templates</Text>

						{/* Search Templates */}
						<TextInput
							style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
							placeholder="Search templates by name or color..."
							placeholderTextColor={colors.text.secondary}
							value={templateSearchQuery}
							onChangeText={setTemplateSearchQuery}
							onFocus={() => setShowTemplateDropdown(true)}
						/>

						{/* Templates List */}
						{showTemplateDropdown && filteredTemplates.length > 0 && (
							<View style={tw`bg-[${colors.background.secondary}] rounded-xl p-4 mb-4 max-h-48`}>
								<ScrollView>
									{filteredTemplates.map((template) => (
										<TouchableOpacity
											key={template.log_template_id}
											style={tw`flex-row items-center justify-between py-2 border-b border-[${colors.border.primary}]`}
											onPress={() => toggleTemplateSelection(template.log_template_id)}
										>
											<View style={tw`flex-row items-center flex-1`}>
												<View
													style={[
														tw`w-4 h-4 rounded-full mr-3`,
														{ backgroundColor: template.color_code },
													]}
												/>
												<Text style={tw`text-[${colors.text.primary}] flex-1`}>
													{template.name}
												</Text>
												<Text style={tw`text-[${colors.text.secondary}] text-sm mr-2`}>
													{getColorNameFromCode(template.color_code)}
												</Text>
											</View>
											<Feather
												name={
													selectedTemplates.includes(template.log_template_id)
														? "check-square"
														: "square"
												}
												size={20}
												color={
													selectedTemplates.includes(template.log_template_id)
														? colors.primary.main
														: colors.text.secondary
												}
											/>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						)}

						{/* Delete Templates Button */}
						{selectedTemplates.length > 0 && (
							<TouchableOpacity
								style={tw`flex-row items-center justify-center py-3 bg-[${colors.status.error}] rounded-xl mb-4`}
								onPress={handleDeleteTemplates}
							>
								<Feather name="trash-2" size={18} color="white" />
								<Text style={tw`ml-2 text-white font-medium`}>
									Delete Selected Templates ({selectedTemplates.length})
								</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity style={tw`py-2`} onPress={() => setShowTemplateDropdown(!showTemplateDropdown)}>
							<Text style={tw`text-[${colors.primary.main}] text-center`}>
								{showTemplateDropdown ? "Hide Templates" : "Show All Templates"}
							</Text>
						</TouchableOpacity>
					</View>

					{/* Save Changes Button */}
					<TouchableOpacity
						style={tw`flex-row items-center justify-center py-4 bg-[${colors.primary.main}] rounded-xl mt-8 ${
							isSaving ? "opacity-50" : ""
						}`}
						onPress={handleSave}
						disabled={isSaving}
					>
						<Feather name={isSaving ? "clock" : "save"} size={18} color="white" />
						<Text style={tw`ml-2 text-white font-medium text-base`}>{isSaving ? "Saving..." : "Save Changes"}</Text>
					</TouchableOpacity>

					{/* Bottom spacing */}
					<View style={tw`h-8`} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

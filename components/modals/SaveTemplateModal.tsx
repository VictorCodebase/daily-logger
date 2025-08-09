// components/SaveTemplateModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../themes/colors";
import COLOR_OPTIONS from "../../utils/colorOptionsUtil";

interface SaveTemplateModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (name: string, description: string, colorCode: string) => void;
}


export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ visible, onClose, onSubmit }) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedColor, setSelectedColor] = useState(colors.primary.main);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!name.trim()) {
			Alert.alert("Validation Error", "Template name is required.");
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(name.trim(), description.trim(), selectedColor);
			// Reset form
			setName("");
			setDescription("");
			setSelectedColor(colors.primary.main);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		// Reset form on close
		setName("");
		setDescription("");
		setSelectedColor(colors.primary.main);
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
			<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
				<View style={tw`bg-white rounded-t-3xl max-h-4/5`}>
					{/* Header */}
					<View style={tw`flex-row items-center justify-between p-6 border-b border-[${colors.border.secondary}]`}>
						<Text style={tw`text-xl font-semibold text-[${colors.text.primary}]`}>Save Template</Text>
						<TouchableOpacity onPress={handleClose}>
							<Feather name="x" size={24} color={colors.text.secondary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={tw``} showsVerticalScrollIndicator={false}>
						<View style={tw`p-6`}>
							{/* Template Name */}
							<View style={tw`mb-6`}>
								<Text style={tw`text-base font-medium text-[${colors.text.primary}] mb-2`}>
									Template Name <Text style={tw`text-[${colors.status.error}]`}>*</Text>
								</Text>
								<TextInput
									style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}]`}
									value={name}
									onChangeText={setName}
									placeholder="Enter template name..."
									placeholderTextColor={colors.text.placeholder}
									maxLength={50}
								/>
								<Text style={tw`text-xs text-[${colors.text.tertiary}] mt-1`}>{name.length}/50 characters</Text>
							</View>

							{/* Description */}
							<View style={tw`mb-6`}>
								<Text style={tw`text-base font-medium text-[${colors.text.primary}] mb-2`}>Description</Text>
								<TextInput
									style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] min-h-24`}
									value={description}
									onChangeText={setDescription}
									placeholder="Optional description for this template..."
									placeholderTextColor={colors.text.placeholder}
									multiline
									textAlignVertical="top"
									maxLength={200}
								/>
								<Text style={tw`text-xs text-[${colors.text.tertiary}] mt-1`}>
									{description.length}/200 characters
								</Text>
							</View>

							{/* Color Selection */}
							<View style={tw`mb-6`}>
								<Text style={tw`text-base font-medium text-[${colors.text.primary}] mb-3`}>Color</Text>
								<View style={tw`flex-row flex-wrap gap-3`}>
									{COLOR_OPTIONS.map((option) => (
										<TouchableOpacity
											key={option.value}
											style={tw`flex-row items-center justify-center p-3 rounded-xl border-2 ${
												selectedColor === option.value
													? `border-[${option.color}] bg-[${option.color}10]`
													: `border-[${colors.border.primary}] bg-[${colors.background.secondary}]`
											}`}
											onPress={() => setSelectedColor(option.value)}
										>
											<View
												style={[
													tw`w-6 h-6 rounded-full mr-2`,
													{ backgroundColor: option.color },
												]}
											/>
											<Text style={tw`text-sm font-medium text-[${colors.text.primary}]`}>
												{option.label}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</View>
					</ScrollView>

					{/* Footer */}
					<View style={tw`p-6 border-t border-[${colors.border.secondary}]`}>
						<View style={tw`flex-row gap-4`}>
							<TouchableOpacity
								style={tw`flex-1 py-4 px-6 bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl items-center`}
								onPress={handleClose}
								disabled={isSubmitting}
							>
								<Text style={tw`text-base font-semibold text-[${colors.text.primary}]`}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={tw`flex-1 py-4 px-6 ${
									name.trim() && !isSubmitting
										? `bg-[${colors.primary.main}]`
										: `bg-[${colors.surface.disabled}]`
								} rounded-xl items-center flex-row justify-center`}
								onPress={handleSubmit}
								disabled={!name.trim() || isSubmitting}
							>
								<Feather
									name="save"
									size={16}
									color={name.trim() && !isSubmitting ? colors.text.inverse : colors.text.placeholder}
								/>
								<Text
									style={tw`ml-2 text-base font-semibold text-[${
										name.trim() && !isSubmitting ? colors.text.inverse : colors.text.placeholder
									}]`}
								>
									{isSubmitting ? "Saving..." : "Save Template"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
};

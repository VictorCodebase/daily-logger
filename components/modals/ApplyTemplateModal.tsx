import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../themes/colors";
import COLOR_OPTIONS from "../../utils/ColorOptionsUtil";

// A small interface for the template "glimpse"
interface TemplateGlimpse {
	log_template_id: number;
	name: string;
	color_code: string;
}

interface ApplyTemplateModalProps {
	visible: boolean;
	onClose: () => void;
	onSelectTemplate: (templateId: number) => void;
	templates: TemplateGlimpse[];
}

const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({ visible, onClose, onSelectTemplate, templates }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<"alphabetical" | "date">("alphabetical");

	// Filter templates based on search and color
	const filteredTemplates = templates.filter((template) => {
		const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesColor = !selectedColor || template.color_code === selectedColor;
		return matchesSearch && matchesColor;
	});

	// Sort templates
	const sortedTemplates = [...filteredTemplates].sort((a, b) => {
		if (sortBy === "alphabetical") {
			return a.name.localeCompare(b.name);
		}
		// Assuming there is a date_created field for sorting by date (we can add it to the TemplateGlimpse interface later if needed)
		// For now, let's just sort by ID as a proxy for creation date
		return a.log_template_id - b.log_template_id;
	});

	const handleSelect = (templateId: number) => {
		onSelectTemplate(templateId);
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
				<View style={tw`bg-white rounded-t-3xl max-h-4/5`}>
					{/* Header */}
					<View style={tw`flex-row items-center justify-between p-6 border-b border-[${colors.border.secondary}]`}>
						<Text style={tw`text-xl font-semibold text-[${colors.text.primary}]`}>Apply Template</Text>
						<TouchableOpacity onPress={onClose}>
							<Feather name="x" size={24} color={colors.text.secondary} />
						</TouchableOpacity>
					</View>

					<View style={tw`p-6`}>
						{/* Search Input */}
						<TextInput
							style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] mb-4`}
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search templates..."
							placeholderTextColor={colors.text.placeholder}
						/>

						{/* Filter & Sort Options */}
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
							{/* Sort by Alphabetical */}
							<TouchableOpacity
								onPress={() => setSortBy("alphabetical")}
								style={tw`flex-row items-center p-2 rounded-full mr-2 ${
									sortBy === "alphabetical"
										? `bg-[${colors.primary.main}]`
										: `bg-[${colors.background.secondary}]`
								}`}
							>
								<Feather
									name="filter" //filter by alpha
									size={16}
									color={sortBy === "alphabetical" ? colors.text.inverse : colors.text.primary}
								/>
								<Text
									style={tw`ml-2 text-sm font-medium ${
										sortBy === "alphabetical"
											? `text-[${colors.text.inverse}]`
											: `text-[${colors.text.primary}]`
									}`}
								>
									Sort by A-Z
								</Text>
							</TouchableOpacity>

							{/* Color Filter Buttons */}
							{COLOR_OPTIONS.map((option) => (
								<TouchableOpacity
									key={option.value}
									onPress={() => setSelectedColor(selectedColor === option.value ? null : option.value)}
									style={tw`flex-row items-center p-2 rounded-full mr-2 ${
										selectedColor === option.value
											? `border border-[${colors.border.secondary}]`
											: ""
									}`}
								>
									<View
										style={[
											tw`w-5 h-5 rounded-full`,
											{
												backgroundColor: option.color,
												borderColor:
													selectedColor === option.value
														? colors.border.secondary
														: "transparent",
												borderWidth: 2,
											},
										]}
									/>
								</TouchableOpacity>
							))}
						</ScrollView>

						{/* Templates List */}
						{sortedTemplates.length > 0 ? (
							<FlatList
								data={sortedTemplates}
								keyExtractor={(item) => item.log_template_id.toString()}
								renderItem={({ item }) => (
									<TouchableOpacity
										onPress={() => handleSelect(item.log_template_id)}
										style={tw`flex-row items-center justify-between p-4 mb-3 bg-[${colors.surface.elevated}] rounded-xl border border-[${colors.border.primary}]`}
									>
										<View style={tw`flex-row items-center`}>
											<View
												style={[
													tw`w-3 h-3 rounded-full`,
													{ backgroundColor: item.color_code },
												]}
											/>
											<Text
												style={tw`ml-3 text-base font-medium text-[${colors.text.primary}]`}
											>
												{item.name}
											</Text>
										</View>
										<Feather name="arrow-right" size={16} color={colors.text.secondary} />
									</TouchableOpacity>
								)}
							/>
						) : (
							<Text style={tw`text-center text-sm text-[${colors.text.secondary}] mt-10`}>No templates found.</Text>
						)}
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default ApplyTemplateModal;

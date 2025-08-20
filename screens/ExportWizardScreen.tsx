import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import tw from "twrnc";

// Import context and types
import { useUser } from "../context/UserContext";
import { colors } from "../themes/colors";
import { ExportOptions, KeyContribution } from "../models/ViewModel_Models";
import { DayInfo } from "../models/View_Models";

// Import view model functions and types
import { fetchActiveDays, getResponsibilitiesSummary, getDatesInRange, formatDate } from "../stores/ExportViewModel";
import { generateReport } from "../utils/fileUtils";
import { useFocusEffect } from "@react-navigation/native";

// Calendar constants
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface ActiveDay {
	day_id: number;
	date: string;
}

// 		Error checking responsibilities summary existence: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
// → Caused by: The 1st argument cannot be cast to type expo.modules.sqlite.NativeDatabase (received class java.lang.Integer)
// → Caused by: Cannot use shared object that was already released]

export default function ExportPage() {
	const { user } = useUser();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Calendar state
	const [currentDate, setCurrentDate] = useState(new Date());
	const [activeDays, setActiveDays] = useState<ActiveDay[]>([]);
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Date range state
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	// Form state
	const [responsibilitiesSummary, setResponsibilitiesSummary] = useState<string>("");
	const [keyContributions, setKeyContributions] = useState<KeyContribution[]>([]);
	const [conclusions, setConclusions] = useState<string>("");

	// Export options state
	const [exportOptions, setExportOptions] = useState<ExportOptions>({
		includeUserRoles: true,
		includeWorkSchedule: true,
		includeResponsibilitiesSummary: false,
		includeKeyContributions: false,
		includeSpecialActivities: true,
		includeDailyLog: true,
		includeConclusions: false,
		outputFormat: "pdf",
		documentFormat: "professional",
	});

	
	useEffect(() => {
		const today = new Date();
		const oneMonthEarlier = new Date();
		oneMonthEarlier.setMonth(today.getMonth() - 1);

	}, []);

	// Load active days and responsibilities summary
	useEffect(() => {
		if (user?.user_id) {
			loadResponsibilitiesSummary();
		}
	}, [user]);
	useFocusEffect(
		useCallback(() => {
			loadActiveDays();
		}, [])
	);

	const loadActiveDays = async () => {

		try {
			setIsLoading(true);
			const days = await fetchActiveDays();
			setActiveDays(days || []);
			console.log("Active days: ", activeDays);

		} catch (error) {
			console.error("Error loading active days:", error);
			setErrorMessage("Failed to load calendar data");
		} finally {
			setIsLoading(false);
		}
	};

	const loadResponsibilitiesSummary = async () => {
		if (!user?.user_id) return;

		try {
			const summary = await getResponsibilitiesSummary(user.user_id);
			if (summary) {
				setResponsibilitiesSummary(summary.content);
				setExportOptions((prev) => ({ ...prev, includeResponsibilitiesSummary: true }));
			}
		} catch (error) {
			console.error("Error loading responsibilities summary:", error);
		}
	};

	// Helper functions
	const getFormattedDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const getDaysInMonth = (date: Date): Date[] => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		const days: Date[] = [];

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < startingDayOfWeek; i++) {
			const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
			days.push(prevDate);
		}

		// Add all days of the current month
		for (let day = 1; day <= daysInMonth; day++) {
			days.push(new Date(year, month, day));
		}

		// Add empty cells to complete the last week
		const remainingCells = 42 - days.length; // 6 rows * 7 days
		for (let day = 1; day <= remainingCells; day++) {
			days.push(new Date(year, month + 1, day));
		}

		return days;
	};

	const isActiveDay = (date: Date): boolean => {
		const dateStr = getFormattedDate(date);
		return activeDays.some((day) => day.date === dateStr);
	};

	const isCurrentMonth = (date: Date): boolean => {
		return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
	};

	const isToday = (date: Date): boolean => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	};``

	const isInSelectedRange = (date: Date): boolean => {
		if (!startDate || !endDate) return false;
		const dateStr = getFormattedDate(date);
		return dateStr >= startDate && dateStr <= endDate;
	};

	const isRangeStart = (date: Date): boolean => {
		const dateStr = getFormattedDate(date);
		return dateStr === startDate;
	};

	const isRangeEnd = (date: Date): boolean => {
		const dateStr = getFormattedDate(date);
		return dateStr === endDate;
	};

	const handleDateSelect = (date: Date): void => {
		const selectedDateStr = getFormattedDate(date);

		// If no dates selected, start new range
		if (!startDate && !endDate) {
			setStartDate(selectedDateStr);
			setEndDate(selectedDateStr);
			return;
		}

		// If only start date exists (shouldn't happen with current logic, but safety check)
		if (startDate && !endDate) {
			if (selectedDateStr >= startDate) {
				setEndDate(selectedDateStr);
			} else {
				setEndDate(startDate);
				setStartDate(selectedDateStr);
			}
			return;
		}

		// If we have a complete range
		if (startDate && endDate) {
			// If clicking on start or end, start fresh range from that point
			if (selectedDateStr === startDate || selectedDateStr === endDate) {
				setStartDate(selectedDateStr);
				setEndDate(selectedDateStr);
				return;
			}

			// If clicking outside current range, determine closest endpoint and extend
			if (selectedDateStr < startDate) {
				setStartDate(selectedDateStr);
			} else if (selectedDateStr > endDate) {
				setEndDate(selectedDateStr);
			} else {
				// Clicking inside range - start new range from clicked date
				setStartDate(selectedDateStr);
				setEndDate(selectedDateStr);
			}
		}
	};

	const navigateMonth = (direction: "prev" | "next") => {
		const newDate = new Date(currentDate);
		if (direction === "prev") {
			newDate.setMonth(currentDate.getMonth() - 1);
		} else {
			newDate.setMonth(currentDate.getMonth() + 1);
		}
		setCurrentDate(newDate);
	};

	const onDatePickerChange = (event: any, date?: Date) => {
		setShowDatePicker(false);
		if (date) {
			setCurrentDate(date);
		}
	};

	// Key contributions functions
	const addKeyContribution = () => {
		setKeyContributions((prev) => [...prev, { title: "", content: "" }]);
		setExportOptions((prev) => ({ ...prev, includeKeyContributions: true }));
	};

	const updateKeyContribution = (index: number, field: "title" | "content", value: string) => {
		setKeyContributions((prev) => prev.map((contrib, i) => (i === index ? { ...contrib, [field]: value } : contrib)));
	};

	const removeKeyContribution = (index: number) => {
		setKeyContributions((prev) => prev.filter((_, i) => i !== index));
		if (keyContributions.length === 1) {
			setExportOptions((prev) => ({ ...prev, includeKeyContributions: false }));
		}
	};

	// Validation
	const validateForm = (): string | null => {
		if (!startDate || !endDate) {
			return "Please select a date range";
		}

		const hasAnyOption = Object.entries(exportOptions)
			.filter(([key]) => key !== "outputFormat")
			.some(([_, value]) => value === true);

		if (!hasAnyOption) {
			return "Please select at least one export option";
		}

		return null;
	};

	// Export function
	const handleExport = async () => {
		const validationError = validateForm();
		if (validationError) {
			Alert.alert("Validation Error", validationError);
			return;
		}

		if (!user?.user_id) {
			Alert.alert("Error", "User not found");
			return;
		}

		// Show confirmation dialog
		const dateRange = getDatesInRange(startDate, endDate);
		const selectedOptions = Object.entries(exportOptions)
			.filter(([key, value]) => key !== "outputFormat" && value === true)
			.map(([key]) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()));

		Alert.alert(
			"Confirm Export",
			`You are about to export:\n\n• Date range: ${formatDate(startDate)} - ${formatDate(endDate)}\n• ${
				dateRange.length
			} days\n• Sections: ${selectedOptions.join(", ")}\n• Format: ${exportOptions.outputFormat.toUpperCase()}\n\nProceed with export?`,
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Export", onPress: performExport },
			]
		);
	};

	const performExport = async () => {
		if (!user?.user_id) return;

		try {
			setIsLoading(true);
			setErrorMessage(null);

			const result = await generateReport(
				startDate,
				endDate,
				user.user_id,
				responsibilitiesSummary || null,
				keyContributions,
				conclusions || null,
				exportOptions
			);

			if (result.success) {
				Alert.alert(
					"Export Successful",
					`Your ${exportOptions.outputFormat.toUpperCase()} report "${
						result.fileName
					}" has been generated and saved successfully!\n\nThe file has been shared for you to save or send.`,
					[{ text: "OK", style: "default" }]
				);
			} else {
				throw new Error(result.error || "Export failed");
			}
		} catch (error) {
			console.error("Export error:", error);
			setErrorMessage("Failed to export report. Please try again.");
			Alert.alert("Export Failed", "There was an error generating your report. Please check your internet connection and try again.", [
				{ text: "OK", style: "default" },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to get all day information
	const getDayInfo = (date: Date): DayInfo => {
		const isActive = isActiveDay(date);
		const isCurrentMonthDay = isCurrentMonth(date);
		const isTodayDate = isToday(date);
		const inRange = isInSelectedRange(date);
		const isStart = isRangeStart(date);
		const isEnd = isRangeEnd(date);

		return {
			isActive,
			isCurrentMonth: isCurrentMonthDay,
			isToday: isTodayDate,
			inRange,
			isStart,
			isEnd,
			backgroundColor: getBackgroundColor(isCurrentMonthDay, isActive, inRange, isStart, isEnd),
			textColor: getTextColor(isCurrentMonthDay, isActive, inRange, isStart, isEnd),
			borderStyle: getBorderStyle(inRange, isStart, isEnd, isTodayDate),
		};
	};

	// Separate color logic for better maintainability
	const getBackgroundColor = (isCurrentMonth: boolean, isActive: boolean, inRange: boolean, isStart: boolean, isEnd: boolean): string => {
		if (!isCurrentMonth) {
			return colors.surface.disabled;
		}

		if (isStart || isEnd) {
			return colors.primary.main;
		}

		if (isActive) {
			return colors.primary[100]; // Light blue for active days
		}

		return colors.surface.elevated; // Default background
	};

	const getTextColor = (isCurrentMonth: boolean, isActive: boolean, inRange: boolean, isStart: boolean, isEnd: boolean): string => {
		if (!isCurrentMonth) {
			return colors.text.tertiary;
		}

		if (isStart || isEnd) {
			return colors.text.white;
		}

		return colors.text.primary;
	};

	const getBorderStyle = (inRange: boolean, isStart: boolean, isEnd: boolean, isToday: boolean) => {
		if (isStart || isEnd) {
			return {}; // No border needed, background color handles it
		}

		if (inRange) {
			return {
				borderWidth: 2,
				borderColor: colors.primary.main,
			};
		}

		if (isToday) {
			return {
				borderWidth: 2,
				borderColor: colors.primary.main,
			};
		}

		return {
			borderWidth: 1,
			borderColor: colors.border.primary,
		};
	};

	const getDayStyle = (dayInfo: DayInfo) => {
		const baseStyle = {
			backgroundColor: dayInfo.backgroundColor,
			...dayInfo.borderStyle,
		};

		return baseStyle;
	};

	const formatDisplayDate = (dateStr: string) => {
		const date = new Date(dateStr + "T00:00:00");
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
		});
	};

	// Render calendar
	const renderCalendar = () => {
		const days = getDaysInMonth(currentDate);

		return (
			<View style={tw`px-4 mb-6`}>
				{/* Calendar Header */}
				<View style={tw`flex-row items-center justify-between mb-4`}>
					<TouchableOpacity onPress={() => navigateMonth("prev")} style={tw`p-2 rounded-lg bg-[${colors.surface.elevated}]`}>
						<Feather name="chevron-left" size={20} color={colors.text.primary} />
					</TouchableOpacity>

					<TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`flex-row items-center`}>
						<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mr-2`}>
							{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
						</Text>
						<Feather name="calendar" size={16} color={colors.text.secondary} />
					</TouchableOpacity>

					<TouchableOpacity onPress={() => navigateMonth("next")} style={tw`p-2 rounded-lg bg-[${colors.surface.elevated}]`}>
						<Feather name="chevron-right" size={20} color={colors.text.primary} />
					</TouchableOpacity>
				</View>

				{/* Range Selection Instructions */}
				{(!startDate || !endDate || startDate === endDate) && (
					<View style={tw`mb-3 p-3 rounded-lg bg-[${colors.primary[50]}] border border-[${colors.primary[200]}]`}>
						<Text style={tw`text-sm text-[${colors.text.secondary}] text-center`}>
							{!startDate
								? "Tap a date to start selecting your range"
								: startDate === endDate
								? "Tap another date to complete your range"
								: "Tap to adjust your date range"}
						</Text>
					</View>
				)}

				{/* Selected Range Display */}
				{startDate && endDate && startDate !== endDate && (
					<View style={tw`mb-3 p-3 rounded-lg bg-[${colors.primary[50]}] border border-[${colors.status.success}]`}>
						<Text style={tw`text-sm text-[${colors.text.primary}] text-center font-medium`}>
							Selected: {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
						</Text>
						<TouchableOpacity
							onPress={() => {
								setStartDate("");
								setEndDate("");
							}}
							style={tw`mt-2 self-center`}
						>
							<Text style={tw`text-xs text-[${colors.primary.main}] underline`}>Clear selection</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Legend */}
				<View style={tw`flex-row justify-center mb-4 flex-wrap`}>
					<View style={tw`flex-row items-center mr-4 mb-2`}>
						<View style={tw`w-4 h-4 rounded bg-[${colors.primary[100]}] mr-2`} />
						<Text style={tw`text-xs text-[${colors.text.secondary}]`}>Active Day</Text>
					</View>
					<View style={tw`flex-row items-center mr-4 mb-2`}>
						<View
							style={tw`w-4 h-4 rounded border-2 border-[${colors.primary.main}] bg-[${colors.background.primary}] mr-2`}
						/>
						<Text style={tw`text-xs text-[${colors.text.secondary}]`}>In Range</Text>
					</View>
					<View style={tw`flex-row items-center mb-2`}>
						<View style={tw`w-4 h-4 rounded bg-[${colors.primary.main}] mr-2`} />
						<Text style={tw`text-xs text-[${colors.text.secondary}]`}>Range Start/End</Text>
					</View>
				</View>

				{/* Days of week header */}
				<View style={tw`flex-row mb-2`}>
					{DAYS_OF_WEEK.map((day: string) => (
						<View key={day} style={tw`flex-1 p-2`}>
							<Text style={tw`text-center text-sm font-medium text-[${colors.text.secondary}]`}>{day}</Text>
						</View>
					))}
				</View>

				{/* Calendar grid */}
				<View>
					{Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex: number) => (
						<View key={weekIndex} style={tw`flex-row`}>
							{days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date: Date, dayIndex: number) => {
								const dayInfo = getDayInfo(date);
								return (
									<TouchableOpacity
										key={dayIndex}
										style={[tw`flex-1 aspect-square p-1 m-0.5 rounded-lg`, getDayStyle(dayInfo)]}
										onPress={() => handleDateSelect(date)}
										disabled={!dayInfo.isCurrentMonth}
									>
										<View style={tw`flex-1 justify-center items-center relative`}>
											{/* Active day indicator dot */}
											{dayInfo.isActive && dayInfo.isCurrentMonth && (
												<View
													style={tw`absolute top-1 right-1 w-2 h-2 rounded-full bg-[${colors.primary.dark}]`}
												/>
											)}

											{/* Today indicator */}
											{dayInfo.isToday && !dayInfo.inRange && (
												<View
													style={tw`absolute inset-0 rounded-lg border-2 border-[${colors.status.warning}]`}
												/>
											)}

											<Text style={[tw`text-sm font-medium`, { color: dayInfo.textColor }]}>
												{date.getDate()}
											</Text>
										</View>
									</TouchableOpacity>
								);
							})}
						</View>
					))}
				</View>
			</View>
		);
	};

	// Render checkbox option
	const renderCheckboxOption = (key: keyof ExportOptions, label: string, description?: string) => {
		if (key === "outputFormat") return null;

		const isChecked = exportOptions[key];

		return (
			<TouchableOpacity
				key={key}
				style={tw`flex-row items-start p-4 bg-[${colors.background.card}] rounded-xl mb-3 border border-[${colors.border.primary}]`}
				onPress={() => setExportOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
			>
				<View
					style={tw`w-5 h-5 rounded border-2 border-[${colors.border.primary}] mr-3 mt-0.5 items-center justify-center ${
						isChecked ? `bg-[${colors.primary.main}] border-[${colors.primary.main}]` : ""
					}`}
				>
					{isChecked && <Feather name="check" size={14} color={colors.text.white} />}
				</View>
				<View style={tw`flex-1`}>
					<Text style={tw`text-base font-medium text-[${colors.text.primary}]`}>{label}</Text>
					{description && <Text style={tw`text-sm text-[${colors.text.secondary}] mt-1`}>{description}</Text>}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}]`}>
			{isLoading && (
				<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
					<ActivityIndicator size="large" color={colors.primary.main} />
				</View>
			)}

			{/* Header */}
			<View style={tw`p-6 pt-15`}>
				<Text style={tw`text-sm text-[${colors.text.secondary}]`}>Export Reports</Text>
				<Text style={tw`text-4xl font-bold text-[${colors.text.primary}]`}>Generate Report</Text>
				<Text style={tw`text-sm text-[${colors.text.secondary}]`}>Create your monthly activity report</Text>
			</View>

			{/* Error Message */}
			{errorMessage ? (
				<View style={tw`mx-4 mb-4 bg-red-500 p-3 rounded-lg`}>
					<Text style={tw`text-white`}>{errorMessage}</Text>
				</View>
			) : null}

			<ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
				{/* Date Range Selection */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-2`}>Date Range</Text>
					<Text style={tw`text-base text-[${colors.text.primary}] mb-4`}>
						You are exporting logs from{" "}
						<Text style={tw`font-semibold text-[${colors.primary.main}]`}>
							{startDate ? formatDate(startDate) : "select start date"}
						</Text>{" "}
						to{" "}
						<Text style={tw`font-semibold text-[${colors.primary.main}]`}>
							{endDate ? formatDate(endDate) : "select end date"}
						</Text>
					</Text>
				</View>
				{/* Calendar */}
				{renderCalendar()}
				{/* Responsibilities Summary */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Responsibilities Summary</Text>
					<View style={tw`bg-[${colors.background.card}] rounded-2xl p-6 border border-[${colors.border.secondary}]`}>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] min-h-32`}
							value={responsibilitiesSummary}
							onChangeText={setResponsibilitiesSummary}
							placeholder="Describe your key responsibilities and duties during this period..."
							placeholderTextColor={colors.text.placeholder}
							multiline
							textAlignVertical="top"
						/>
					</View>
				</View>
				{/* Key Contributions */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Key Contributions</Text>

					{keyContributions.map((contribution, index) => (
						<View
							key={index}
							style={tw`bg-[${colors.background.card}] rounded-2xl p-6 mb-4 border border-[${colors.border.secondary}]`}
						>
							<View style={tw`flex-row items-center justify-between mb-4`}>
								<Text style={tw`text-base font-semibold text-[${colors.text.primary}]`}>
									Contribution {index + 1}
								</Text>
								<TouchableOpacity onPress={() => removeKeyContribution(index)}>
									<Feather name="trash-2" size={16} color={colors.text.secondary} />
								</TouchableOpacity>
							</View>

							<View style={tw`mb-4`}>
								<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>Title</Text>
								<TextInput
									style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}]`}
									value={contribution.title}
									onChangeText={(text) => updateKeyContribution(index, "title", text)}
									placeholder="e.g., Led team project..."
									placeholderTextColor={colors.text.placeholder}
								/>
							</View>

							<View>
								<Text style={tw`text-sm font-medium text-[${colors.text.primary}] mb-2`}>Description</Text>
								<TextInput
									style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] min-h-24`}
									value={contribution.content}
									onChangeText={(text) => updateKeyContribution(index, "content", text)}
									placeholder="Describe this contribution in detail..."
									placeholderTextColor={colors.text.placeholder}
									multiline
									textAlignVertical="top"
								/>
							</View>
						</View>
					))}

					<TouchableOpacity
						style={tw`flex-row items-center justify-center p-4 bg-[${colors.surface.elevated}] rounded-xl border border-dashed border-[${colors.border.primary}]`}
						onPress={addKeyContribution}
					>
						<Feather name="plus" size={20} color={colors.primary.main} />
						<Text style={tw`text-base font-medium text-[${colors.primary.main}] ml-2`}>Add Key Contribution</Text>
					</TouchableOpacity>
				</View>
				{/* Conclusions */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Conclusions</Text>
					<View style={tw`bg-[${colors.background.card}] rounded-2xl p-6 border border-[${colors.border.secondary}]`}>
						<TextInput
							style={tw`bg-[${colors.background.secondary}] border border-[${colors.border.primary}] rounded-xl p-4 text-base text-[${colors.text.primary}] min-h-32`}
							value={conclusions}
							onChangeText={setConclusions}
							placeholder="Add your concluding thoughts, achievements, and reflections for this period..."
							placeholderTextColor={colors.text.placeholder}
							multiline
							textAlignVertical="top"
						/>
					</View>
				</View>

				{/* Export Options */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Export Options</Text>

					{renderCheckboxOption("includeUserRoles", "User Roles", "Include your position and roles")}
					{renderCheckboxOption("includeWorkSchedule", "Work Schedule", "Include your work schedule details")}
					{renderCheckboxOption(
						"includeResponsibilitiesSummary",
						"Responsibilities Summary",
						"Include the responsibilities summary"
					)}
					{renderCheckboxOption("includeKeyContributions", "Key Contributions", "Include your key contributions")}
					{renderCheckboxOption("includeSpecialActivities", "Special Activities", "Include special activities from daily logs")}
					{renderCheckboxOption("includeDailyLog", "Daily Log", "Include detailed daily activity logs")}
					{renderCheckboxOption("includeConclusions", "Conclusions", "Include your concluding remarks")}
				</View>

				{/* !  */}
				<View style={tw`mt-5`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Document Formatting</Text>

					<TouchableOpacity
						style={tw`p-4 border border-gray-300 rounded-lg mb-3 ${
							exportOptions.documentFormat === "professional" ? "border-green-500 bg-green-50" : ""
						}`}
						onPress={() => setExportOptions({ ...exportOptions, documentFormat: "professional" })}
					>
						<Text style={tw`font-bold text-base`}>Professional</Text>
						<Text style={tw`text-xs text-gray-600 mt-1`}>
							Clean, formal report with distinct sections and borders. (Default)
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={tw`p-4 border border-gray-300 rounded-lg mb-3 ${
							exportOptions.documentFormat === "monotone" ? "border-green-500 bg-green-50" : ""
						}`}
						onPress={() => setExportOptions({ ...exportOptions, documentFormat: "monotone" })}
					>
						<Text style={tw`font-bold text-base`}>Monotone</Text>
						<Text style={tw`text-xs text-gray-600 mt-1`}>
							Strict, black-and-white, text-based report for official submissions.
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={tw`p-4 border border-gray-300 rounded-lg mb-3 ${
							exportOptions.documentFormat === "simple" ? "border-green-500 bg-green-50" : ""
						}`}
						onPress={() => setExportOptions({ ...exportOptions, documentFormat: "simple" })}
					>
						<Text style={tw`font-bold text-base`}>Simple</Text>
						<Text style={tw`text-xs text-gray-600 mt-1`}>
							A clean, no-frills design with subtle colors and minimal styling.
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={tw`p-4 border border-gray-300 rounded-lg mb-3 ${
							exportOptions.documentFormat === "creative" ? "border-green-500 bg-green-50" : ""
						}`}
						onPress={() => setExportOptions({ ...exportOptions, documentFormat: "creative" })}
					>
						<Text style={tw`font-bold text-base`}>Creative</Text>
						<Text style={tw`text-xs text-gray-600 mt-1`}>
							Modern, stylish design without bounding boxes, using subtle lines and varied fonts.
						</Text>
					</TouchableOpacity>
				</View>

				{/* Output Format */}
				<View style={tw`mb-6`}>
					<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>Output Format</Text>
					<View style={tw`flex-row gap-3`}>
						<TouchableOpacity
							style={tw`flex-1 p-4 rounded-xl border-2 ${
								exportOptions.outputFormat === "pdf"
									? `border-[${colors.primary.main}] bg-[${colors.primary[50]}]`
									: `border-[${colors.border.primary}] bg-[${colors.background.card}]`
							}`}
							onPress={() => setExportOptions((prev) => ({ ...prev, outputFormat: "pdf" }))}
						>
							<View style={tw`items-center`}>
								<Feather
									name="file-text"
									size={24}
									color={
										exportOptions.outputFormat === "pdf"
											? colors.primary.main
											: colors.text.secondary
									}
								/>
								<Text
									style={tw`text-base font-medium mt-2 text-[${
										exportOptions.outputFormat === "pdf" ? colors.primary.main : colors.text.primary
									}]`}
								>
									PDF
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={tw`flex-1 p-4 rounded-xl border-2 ${
								exportOptions.outputFormat === "word"
									? `border-[${colors.primary.main}] bg-[${colors.primary[50]}]`
									: `border-[${colors.border.primary}] bg-[${colors.background.card}]`
							}`}
							onPress={() => setExportOptions((prev) => ({ ...prev, outputFormat: "word" }))}
						>
							<View style={tw`items-center`}>
								<Feather
									name="file"
									size={24}
									color={
										exportOptions.outputFormat === "word"
											? colors.primary.main
											: colors.text.secondary
									}
								/>
								<Text
									style={tw`text-base font-medium mt-2 text-[${
										exportOptions.outputFormat === "word"
											? colors.primary.main
											: colors.text.primary
									}]`}
								>
									Word
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Export Button */}
				<TouchableOpacity
					style={tw`bg-[${colors.primary.main}] p-4 rounded-xl mb-8 flex-row items-center justify-center`}
					onPress={handleExport}
					disabled={isLoading}
				>
					<Feather name="download" size={20} color={colors.text.white} />
					<Text style={tw`text-lg font-semibold text-[${colors.text.white}] ml-2`}>Generate Report</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* Date Picker */}
			{showDatePicker && <DateTimePicker value={currentDate} mode="date" display="default" onChange={onDatePickerChange} />}
		</SafeAreaView>
	);
}

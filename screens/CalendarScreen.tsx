import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../themes/colors";
import { getFormattedDate, getFormattedTime } from "../utils/DateFormatUtil";
import { DaySection } from "../components/homeComponents/DaySection";
import { ActivityBlock } from "../components/homeComponents/ActivityBlock";
import { SpecialActivityBlock } from "../components/homeComponents/SpecialActivityBlock";
import { fetchActiveDays, fetchDay, saveDayChanges } from "../stores/CalendarViewModel";
import { Day, Activity, SpecialActivity, DayDetails } from "../models/ViewModel_Models";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

interface ActiveDay {
	day_id: number;
	date: string;
}

type ViewMode = "grid" | "list";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [activeDays, setActiveDays] = useState<ActiveDay[]>([]);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Modal state
	const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
	const [modalDayData, setModalDayData] = useState<Day>({
		day_id: 0,
		date: "",
		time_in: null,
		time_out: null,
	});
	const [modalActivities, setModalActivities] = useState<Activity[]>([]);
	const [modalSpecialActivities, setModalSpecialActivities] = useState<SpecialActivity[]>([]);
	const [deletedActivityIds, setDeletedActivityIds] = useState<number[]>([]);
	const [deletedSpecialActivityIds, setDeletedSpecialActivityIds] = useState<number[]>([]);
	const { user, isLoggedIn } = useUser();

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
		} catch (error) {
			console.error("Error loading active days:", error);
			setErrorMessage("Failed to load calendar data");
		} finally {
			setIsLoading(false);
		}
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

	const isActiveDay = (date: Date): number | null => {
		const dateStr = getFormattedDate(date);
		const activeDay = activeDays.find((day) => day.date === dateStr);
		return activeDay ? activeDay.day_id : null;
	};

	const isCurrentMonth = (date: Date): boolean => {
		return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
	};

	const isToday = (date: Date): boolean => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
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

	const openDayModal = async (date: Date) => {
		try {
			setIsLoading(true);
			setSelectedDate(date);
			const dayId = isActiveDay(date);
			const details = await fetchDay(dayId);

			setDayDetails(details);

			if (details) {
				// Set up modal data
				setModalDayData(
					details.day || {
						day_id: 0,
						date: getFormattedDate(date),
						time_in: null,
						time_out: null,
					}
				);

				setModalActivities(
					details.activities || [
						{
							activity_id: 0,
							content: "",
							time_start: null,
							time_end: null,
							category: null,
							day_id: 0,
						},
					]
				);

				setModalSpecialActivities(details.specialActivities || []);
			}

			setDeletedActivityIds([]);
			setDeletedSpecialActivityIds([]);
			setShowModal(true);
		} catch (error) {
			console.error("Error opening day modal:", error);
			setErrorMessage("Failed to load day details");
		} finally {
			setIsLoading(false);
		}
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedDate(null);
		setDayDetails(null);
		setErrorMessage(null);
	};

	const addActivity = () => {
		setModalActivities([
			...modalActivities,
			{
				activity_id: 0,
				content: "",
				time_start: null,
				time_end: null,
				category: null,
				day_id: 0,
			},
		]);
	};

	const updateActivity = (index: number, updated: Activity) => {
		const newActivities = [...modalActivities];
		newActivities[index] = updated;
		setModalActivities(newActivities);
	};

	const removeActivity = (index: number) => {
		const activity = modalActivities[index];
		if (activity.activity_id > 0) {
			setDeletedActivityIds([...deletedActivityIds, activity.activity_id]);
		}
		setModalActivities(modalActivities.filter((_, i) => i !== index));
	};

	const addSpecialActivity = () => {
		setModalSpecialActivities([
			...modalSpecialActivities,
			{
				sp_activity_id: 0,
				content: "",
				time_start: null,
				time_end: null,
				category: null,
				day_id: 0,
			},
		]);
	};

	const updateSpecialActivity = (index: number, updated: SpecialActivity) => {
		const newSpecialActivities = [...modalSpecialActivities];
		newSpecialActivities[index] = updated;
		setModalSpecialActivities(newSpecialActivities);
	};

	const removeSpecialActivity = (index: number) => {
		const specialActivity = modalSpecialActivities[index];
		if (specialActivity.sp_activity_id > 0) {
			setDeletedSpecialActivityIds([...deletedSpecialActivityIds, specialActivity.sp_activity_id]);
		}
		setModalSpecialActivities(modalSpecialActivities.filter((_, i) => i !== index));
	};

	const validateAndSave = async () => {
		setErrorMessage(null);

		// Validate that all activities have content
		for (const activity of modalActivities) {
			if (!activity.content.trim()) {
				setErrorMessage("All activities must have content. Please delete empty activities.");
				return;
			}
		}

		for (const specialActivity of modalSpecialActivities) {
			if (!specialActivity.content.trim()) {
				setErrorMessage("All special activities must have content. Please delete empty special activities.");
				return;
			}
		}

		try {
			setIsSaving(true);
			const success = await saveDayChanges({
				date: getFormattedDate(selectedDate!),
				dayId: modalDayData.day_id > 0 ? modalDayData.day_id : null,
				updatedDay: modalDayData,
				allActivities: modalActivities,
				allSpecialActivities: modalSpecialActivities,
				deletedActivityIds,
				deletedSpecialActivityIds,
			});

			if (success) {
				closeModal();
				await loadActiveDays(); // Refresh calendar
			} else {
				setErrorMessage("Failed to save changes. Please try again.");
			}
		} catch (error) {
			console.error("Error saving changes:", error);
			setErrorMessage("An error occurred while saving. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const renderGridView = () => {
		const days = getDaysInMonth(currentDate);

		return (
			<View style={tw`px-4`}>
				{/* Days of week header */}
				<View style={tw`flex-row mb-2`}>
					{DAYS_OF_WEEK.map((day) => (
						<View key={day} style={tw`flex-1 p-2`}>
							<Text style={tw`text-center text-sm font-medium text-[${colors.text.secondary}]`}>{day}</Text>
						</View>
					))}
				</View>

				{/* Calendar grid */}
				<View>
					{Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
						<View key={weekIndex} style={tw`flex-row`}>
							{days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
								const dayId = isActiveDay(date);
								const isCurrentMonthDay = isCurrentMonth(date);
								const isTodayDate = isToday(date);

								return (
									<TouchableOpacity
										key={dayIndex}
										style={tw`flex-1 aspect-square p-1 m-0.5 rounded-lg ${
											dayId
												? `bg-[${colors.primary.main}]`
												: isCurrentMonthDay
												? `bg-[${colors.surface.elevated}] border border-[${colors.border.primary}]`
												: `bg-[${colors.surface.disabled}]`
										} ${isTodayDate && !dayId ? `border-2 border-[${colors.primary.main}]` : ""}`}
										onPress={() => openDayModal(date)}
									>
										<View style={tw`flex-1 justify-center items-center`}>
											<Text
												style={tw`text-sm font-medium ${
													dayId
														? `text-[${colors.text.white}]`
														: isCurrentMonthDay
														? `text-[${colors.text.primary}]`
														: `text-[${colors.text.tertiary}]`
												}`}
											>
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

	const renderListView = () => {
		const days = getDaysInMonth(currentDate).filter((date) => isCurrentMonth(date));

		return (
			<ScrollView style={tw`px-4`}>
				{days.map((date, index) => {
					const dayId = isActiveDay(date);
					const isTodayDate = isToday(date);

					return (
						<TouchableOpacity
							key={index}
							style={tw`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
								dayId
									? `bg-[${colors.primary}] border border-[${colors.primary.main}]`
									: `bg-[${colors.surface.elevated}] border border-[${colors.border.primary}]`
							} ${isTodayDate && !dayId ? `border-2 border-[${colors.primary.main}]` : ""}`}
							onPress={() => openDayModal(date)}
						>
							<View>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>
									{date.getDate()} {MONTHS[date.getMonth()].slice(0, 3)}
								</Text>
								<Text style={tw`text-sm text-[${colors.text.secondary}]`}>{DAYS_OF_WEEK[date.getDay()]}</Text>
							</View>
							<View style={tw`flex-row items-center`}>
								{dayId && <View style={tw`w-3 h-3 rounded-full bg-[${colors.primary.main}] mr-2`} />}
								<Feather
									name="chevron-right"
									size={20}
									color={dayId ? colors.primary.main : colors.text.secondary}
								/>
							</View>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		);
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}] pb-28`}>
			{isLoading && (
				<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
					<ActivityIndicator size="large" color={colors.primary.main} />
				</View>
			)}

			{/* Header */}
			<View style={tw`p-6 pt-15`}>
				{isLoggedIn && user && <Text style={tw`text-sm text-[${colors.text.secondary}]`}>{user.name}'s</Text>}
				<Text style={tw`text-4xl font-bold text-[${colors.text.primary}]`}>Calendar</Text>
				<Text style={tw`text-sm text-[${colors.text.secondary}]`}>Track your daily activities</Text>
			</View>

			{/* Error Message */}
			{errorMessage ? (
				<View style={tw`mx-4 mb-4 bg-red-500 p-3 rounded-lg`}>
					<Text style={tw`text-white`}>{errorMessage}</Text>
				</View>
			) : null}

			{/* Controls */}
			<View style={tw`flex-row items-center justify-between px-4 mb-4`}>
				<TouchableOpacity
					style={tw`flex-row items-center py-2 px-3 bg-[${colors.surface.elevated}] border border-[${colors.border.primary}] rounded-lg`}
					onPress={() => setShowDatePicker(true)}
				>
					<Feather name="calendar" size={16} color={colors.text.secondary} />
					<Text style={tw`ml-2 text-sm text-[${colors.text.secondary}]`}>Select Date</Text>
				</TouchableOpacity>

				<View style={tw`flex-row items-center`}>
					<TouchableOpacity
						style={tw`p-2 mr-1 rounded-lg ${
							viewMode === "grid" ? `bg-[${colors.primary.main}]` : `bg-[${colors.surface.elevated}]`
						}`}
						onPress={() => setViewMode("grid")}
					>
						<Feather name="grid" size={16} color={viewMode === "grid" ? colors.text.white : colors.text.secondary} />
					</TouchableOpacity>
					<TouchableOpacity
						style={tw`p-2 ml-1 rounded-lg ${
							viewMode === "list" ? `bg-[${colors.primary.main}]` : `bg-[${colors.surface.elevated}]`
						}`}
						onPress={() => setViewMode("list")}
					>
						<Feather name="list" size={16} color={viewMode === "list" ? colors.text.white : colors.text.secondary} />
					</TouchableOpacity>
				</View>
			</View>

			{/* Month Navigation */}
			<View style={tw`flex-row items-center justify-between px-4 mb-6`}>
				<TouchableOpacity
					style={tw`p-2 bg-[${colors.surface.elevated}] border border-[${colors.border.primary}] rounded-lg`}
					onPress={() => navigateMonth("prev")}
				>
					<Feather name="chevron-left" size={20} color={colors.text.secondary} />
				</TouchableOpacity>

				<Text style={tw`text-xl font-semibold text-[${colors.text.primary}]`}>
					{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
				</Text>

				<TouchableOpacity
					style={tw`p-2 bg-[${colors.surface.elevated}] border border-[${colors.border.primary}] rounded-lg`}
					onPress={() => navigateMonth("next")}
				>
					<Feather name="chevron-right" size={20} color={colors.text.secondary} />
				</TouchableOpacity>
			</View>

			{/* Calendar View */}
			{viewMode === "grid" ? renderGridView() : renderListView()}

			{/* Date Picker */}
			{showDatePicker && <DateTimePicker value={currentDate} mode="date" display="default" onChange={onDatePickerChange} />}

			{/* Modal */}
			<Modal visible={showModal} animationType="slide" presentationStyle="fullScreen">
				<SafeAreaView style={tw`flex-1 bg-[${colors.background.modal}]`}>
					{isSaving && (
						<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
							<ActivityIndicator size="large" color={colors.primary.main} />
						</View>
					)}

					{/* Modal Header */}
					<View style={tw`flex-row items-center justify-between p-4 border-b border-[${colors.border.primary}]`}>
						<Text style={tw`text-xl font-semibold text-[${colors.text.primary}]`}>
							{selectedDate ? getFormattedDate(selectedDate) : "Edit Day"}
						</Text>
						<TouchableOpacity onPress={closeModal} style={tw`p-2 rounded-lg bg-[${colors.surface.elevated}]`}>
							<Feather name="x" size={20} color={colors.text.secondary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-28`}>
						{/* Error Message */}
						{errorMessage ? (
							<View style={tw`mx-4 mt-4 bg-red-500 p-3 rounded-lg`}>
								<Text style={tw`text-white`}>{errorMessage}</Text>
							</View>
						) : null}

						{/* Day Section */}
						<View style={tw`p-4`}>
							<DaySection
								dayData={{
									date: modalDayData.date,
									time_in: modalDayData.time_in ?? "",
									time_out: modalDayData.time_out ?? "",
								}}
								onDayDataChange={(updatedRaw) =>
									setModalDayData({
										...modalDayData,
										...updatedRaw, // overwrite date/time values
									})
								}
							/>
						</View>

						{/* Activities */}
						<View style={tw`px-4 mt-4`}>
							<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Activities</Text>
							{modalActivities.map((activity, index) => (
								<ActivityBlock
									key={`modal-activity-${index}`}
									activity={{
										content: activity.content ?? "",
										category: activity.category ?? "",
										time_start: activity.time_start ?? "",
										time_end: activity.time_end ?? "",
									}}
									onActivityChange={(updatedRaw) =>
										updateActivity(index, {
											...activity, // keep id and day_id
											...updatedRaw, // overwrite the editable fields
										})
									}
									onRemove={modalActivities.length > 1 ? () => removeActivity(index) : undefined}
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
						{modalSpecialActivities.length > 0 && (
							<View style={tw`px-4 mt-6`}>
								<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>
									Special Activities
								</Text>
								{modalSpecialActivities.map((activity, index) => (
									<SpecialActivityBlock
										key={`modal-special-${index}`}
										activity={{
											content: activity.content ?? "",
											category: activity.category ?? "",
											time_start: activity.time_start ?? "",
											time_end: activity.time_end ?? "",
										}}
										onActivityChange={(updatedRaw) =>
											updateSpecialActivity(index, {
												...activity,
												...updatedRaw,
											})
										}
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
					</ScrollView>

					{/* Modal Bottom Actions */}
					<View
						style={tw`absolute bottom-0 left-0 right-0 bg-[${colors.background.modal}] border-t border-[${colors.border.secondary}] px-4 py-4`}
					>
						<View style={tw`flex-row gap-4`}>
							<TouchableOpacity
								style={tw`flex-1 py-4 bg-transparent border border-[${colors.border.primary}] rounded-xl flex-row items-center justify-center`}
								onPress={closeModal}
								disabled={isSaving}
							>
								<Feather name="x" size={18} color={colors.text.secondary} />
								<Text style={tw`ml-2 text-[${colors.text.secondary}] font-semibold`}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={tw`flex-1 py-4 bg-[${colors.primary.main}] rounded-xl flex-row items-center justify-center`}
								onPress={validateAndSave}
								disabled={isSaving}
							>
								<Feather name="save" size={18} color={colors.text.white} />
								<Text style={tw`ml-2 text-[${colors.text.white}] font-semibold`}>
									{isSaving ? "Saving..." : "Save"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

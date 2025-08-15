import React, { useState, useEffect } from "react";

// --- START: Simulated Imports ---
// IMPORTANT: Replace these simulated imports with the actual ones from your files.
 //For example, replace this entire section with:
 import {
   User,
   ResponsibilitiesSummary,
   KeyContribution,
   WorkSchedulePeriod,
   DayDetails
 } from "../models/ViewModel_Models";

 import { colors } from "../themes/colors";
 import { getFormattedDate, getFormattedTime } from "../utils/DateFormatUtil";

 import {
   ExportOptions,
   ReportData,
   fetchActiveDays,
   getResponsibilitiesSummary,
   generateReport,
 } from "../stores/ExportViewModel";


// Using inline SVGs for icons to avoid external dependencies.
const Icon = ({ name, size = 24, color = "currentColor", ...props }) => {
	const icons = {
		"chevron-left": (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		),
		"chevron-right": (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M9 18l6-6-6-6" />
			</svg>
		),
		x: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M18 6L6 18M6 6l12 12" />
			</svg>
		),
		plus: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M12 5v14M5 12h14" />
			</svg>
		),
		eye: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M2 12s3 7 10 7 10-7 10-7-3-7-10-7-10 7-10 7z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		),
		download: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
			>
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
			</svg>
		),
	};
	return icons[name] || null;
};

// Colors and constants for the UI.
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


// Main component for the export wizard screen.
const ExportWizardScreen = () => {
	// Component state
	const [user, setUser] = useState<User | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [activeDays, setActiveDays] = useState<{ day_id: number; date: string }[]>([]);
	const [responsibilitiesSummary, setResponsibilitiesSummary] = useState("");
	const [keyContributions, setKeyContributions] = useState<KeyContribution[]>([]);
	const [conclusions, setConclusions] = useState("");
	const [outputFormat, setOutputFormat] = useState<"pdf" | "word">("pdf");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Checkbox states for report options.
	const [includeUserRoles, setIncludeUserRoles] = useState(true);
	const [includeWorkSchedule, setIncludeWorkSchedule] = useState(true);
	const [includeResponsibilitiesSummary, setIncludeResponsibilitiesSummary] = useState(true);
	const [includeKeyContributions, setIncludeKeyContributions] = useState(true);
	const [includeSpecialActivities, setIncludeSpecialActivities] = useState(true);
	const [includeDailyLog, setIncludeDailyLog] = useState(true);
	const [includeConclusions, setIncludeConclusions] = useState(true);

	/**
	 * Effect hook to fetch initial data on component mount.
	 */
	useEffect(() => {
		const loadInitialData = async () => {
			setIsLoading(true);
			setErrorMessage(null);
			try {
				// Assuming a fixed user ID for this example, you'd get this from your auth system.
				const userId = 1;
				const fetchedUser = await readUser(userId);
				setUser(fetchedUser);

				const days = await fetchActiveDays();
				if (days) {
					setActiveDays(days);
				}

				const summary = await getResponsibilitiesSummary(userId);
				if (summary) {
					setResponsibilitiesSummary(summary.content);
				}
			} catch (error) {
				console.error("Error loading initial data:", error);
				setErrorMessage("Failed to load export data. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};
		loadInitialData();
	}, []);

	/**
	 * Calendar logic.
	 */
	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		const days = [];
		for (let i = 0; i < startingDayOfWeek; i++) {
			const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
			days.push(prevDate);
		}
		for (let day = 1; day <= daysInMonth; day++) {
			days.push(new Date(year, month, day));
		}
		const remainingCells = 42 - days.length;
		for (let day = 1; day <= remainingCells; day++) {
			days.push(new Date(year, month + 1, day));
		}
		return days;
	};

	const isActiveDay = (date: Date) => {
		const dateStr = getFormattedDate(date);
		const activeDay = activeDays.find((day) => day.date === dateStr);
		return activeDay ? activeDay.day_id : null;
	};

	const isCurrentMonth = (date: Date) => {
		return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
	};

	const isToday = (date: Date) => {
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

	/**
	 * Date range selection logic.
	 */
	const handleDateSelect = (date: Date) => {
		const selectedTimestamp = date.getTime();
		if (!startDate || (startDate && endDate)) {
			setStartDate(date);
			setEndDate(null);
		} else if (startDate) {
			const startTimestamp = startDate.getTime();
			if (selectedTimestamp < startTimestamp) {
				setEndDate(startDate);
				setStartDate(date);
			} else {
				setEndDate(date);
			}
		}
	};

	const isDateInRange = (date: Date) => {
		if (!startDate || !endDate) return false;
		const start = startDate.getTime();
		const end = endDate.getTime();
		const current = date.getTime();
		return current >= start && current <= end;
	};

	const addKeyContribution = () => {
		setKeyContributions([...keyContributions, { title: "", content: "" }]);
	};

	const updateKeyContribution = (index: number, updatedContribution: KeyContribution) => {
		const newContributions = [...keyContributions];
		newContributions[index] = updatedContribution;
		setKeyContributions(newContributions);
	};

	const removeKeyContribution = (index: number) => {
		setKeyContributions(keyContributions.filter((_, i) => i !== index));
	};

	/**
	 * Handle the export button click.
	 * This orchestrates the call to the view model's generateReport function.
	 */
	const handleExportClick = async () => {
		if (!startDate || !endDate) {
			setErrorMessage("Please select a date range for the report.");
			return;
		}

		if (!user) {
			setErrorMessage("User not found. Please log in.");
			return;
		}

		setIsSaving(true);
		setErrorMessage(null);

		try {
			const exportOptions: ExportOptions = {
				includeUserRoles,
				includeWorkSchedule,
				includeResponsibilitiesSummary,
				includeKeyContributions,
				includeSpecialActivities,
				includeDailyLog,
				includeConclusions,
				outputFormat,
			};

			const reportContent = await generateReport(
				getFormattedDate(startDate),
				getFormattedDate(endDate),
				user.user_id,
				includeResponsibilitiesSummary ? responsibilitiesSummary : null,
				includeKeyContributions ? keyContributions : [],
				includeConclusions ? conclusions : null,
				exportOptions
			);

			console.log("Report Generated:", reportContent);
			setIsSaving(false);
			setErrorMessage("Report generated successfully! Check the console for the content.");

			// In a real application, you would handle the download here.
			// For example:
			// const blob = new Blob([reportContent], { type: 'text/markdown' });
			// const url = URL.createObjectURL(blob);
			// const a = document.createElement('a');
			// a.href = url;
			// a.download = `report-${getFormattedDate(startDate)}-to-${getFormattedDate(endDate)}.md`;
			// a.click();
			// URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Export failed:", error);
			setIsSaving(false);
			setErrorMessage("Failed to generate report. Please try again.");
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-100">
				<svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-800">
			<div className="p-6 md:p-10">
				<h1 className="text-sm text-gray-600 mb-1">Hello {user?.name}, congratulations on your work period!</h1>
				<h2 className="text-4xl font-bold text-gray-900 tracking-tight">Report Export</h2>
			</div>

			<div className="flex-1 overflow-auto p-6 md:p-10 space-y-8">
				{errorMessage && (
					<div className="mx-4 bg-red-100 p-4 rounded-xl mb-4 text-red-700 border border-red-200">
						<p>{errorMessage}</p>
					</div>
				)}

				{/* Date Range Selection */}
				<div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
					<div className="flex flex-row items-center mb-4">
						<span className="text-base text-gray-600">Exporting from </span>
						<input
							type="date"
							className="text-base font-semibold text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-1"
							value={getFormattedDate(startDate || new Date())}
							onChange={(e) => setStartDate(new Date(e.target.value))}
						/>
						<span className="text-base text-gray-600"> to </span>
						<input
							type="date"
							className="text-base font-semibold text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-1"
							value={getFormattedDate(endDate || new Date())}
							onChange={(e) => setEndDate(new Date(e.target.value))}
						/>
					</div>

					{/* Calendar Grid */}
					<div className="flex flex-col">
						<div className="flex justify-between items-center mb-4">
							<button onClick={() => navigateMonth("prev")} className="p-2 rounded-full hover:bg-gray-200 transition">
								<Icon name="chevron-left" color={colors.text.primary} />
							</button>
							<h3 className="text-xl font-bold text-gray-900">
								{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
							</h3>
							<button onClick={() => navigateMonth("next")} className="p-2 rounded-full hover:bg-gray-200 transition">
								<Icon name="chevron-right" color={colors.text.primary} />
							</button>
						</div>

						{/* Days of week header */}
						<div className="grid grid-cols-7 text-center mb-2">
							{DAYS_OF_WEEK.map((day) => (
								<span key={day} className="text-sm font-medium text-gray-500">
									{day}
								</span>
							))}
						</div>

						{/* Calendar grid */}
						<div className="grid grid-cols-7 gap-1">
							{getDaysInMonth(currentDate).map((date, index) => {
								const dayId = isActiveDay(date);
								const isCurrentMonthDay = isCurrentMonth(date);
								const isTodayDate = isToday(date);
								const isDateSelected =
									(startDate && endDate && isDateInRange(date)) ||
									(startDate && date.toDateString() === startDate.toDateString()) ||
									(endDate && date.toDateString() === endDate.toDateString());
								const isStart = startDate && date.toDateString() === startDate.toDateString();
								const isEnd = endDate && date.toDateString() === endDate.toDateString();

								return (
									<button
										key={index}
										className={`relative flex items-center justify-center aspect-square p-2 rounded-lg transition-all duration-200
                                            ${isDateSelected ? "bg-green-600 text-white" : ""}
                                            ${dayId && !isDateSelected ? "bg-green-200 text-green-800" : ""}
                                            ${!isCurrentMonthDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                                            ${isCurrentMonthDay && !isDateSelected && !dayId ? "bg-white border border-gray-300 hover:bg-gray-100" : ""}
                                            ${isTodayDate && !isDateSelected ? "border-2 border-green-500" : ""}
                                        `}
										onClick={() => isCurrentMonthDay && handleDateSelect(date)}
										disabled={!isCurrentMonthDay}
									>
										<span className="text-sm font-medium">{date.getDate()}</span>
										{(isStart || isEnd) && (
											<span className="absolute -bottom-1 text-xs font-bold text-white bg-green-800 px-1 rounded-full">
												{isStart ? "Start" : "End"}
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Extra Information Fields */}
				<div className="p-4 space-y-6 bg-white rounded-xl shadow-md border border-gray-200">
					{/* Responsibilities Summary */}
					<div>
						<div className="flex items-center mb-3">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={includeResponsibilitiesSummary}
									onChange={(e) => setIncludeResponsibilitiesSummary(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
							</label>
							<span className="ml-3 text-lg font-semibold text-gray-900">Include Summary of Responsibilities</span>
						</div>
						{includeResponsibilitiesSummary && (
							<textarea
								className="w-full bg-white border border-gray-300 rounded-xl p-4 text-gray-900 h-32 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
								placeholder="Enter your responsibilities summary..."
								value={responsibilitiesSummary}
								onChange={(e) => setResponsibilitiesSummary(e.target.value)}
							/>
						)}
					</div>

					{/* Key Contributions */}
					<div>
						<div className="flex items-center mb-3">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={includeKeyContributions}
									onChange={(e) => setIncludeKeyContributions(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
							</label>
							<span className="ml-3 text-lg font-semibold text-gray-900">Include Key Contributions</span>
						</div>
						{includeKeyContributions && (
							<>
								{keyContributions.map((contribution, index) => (
									<div
										key={index}
										className="bg-white border border-gray-300 rounded-xl p-4 mb-3 relative"
									>
										<input
											type="text"
											className="w-full text-lg font-semibold text-gray-900 mb-2 p-1 focus:outline-none focus:ring-0"
											placeholder="Contribution Title"
											value={contribution.title}
											onChange={(e) =>
												updateKeyContribution(index, {
													...contribution,
													title: e.target.value,
												})
											}
										/>
										<textarea
											className="w-full text-gray-600 p-1 resize-none focus:outline-none focus:ring-0"
											placeholder="Contribution Details..."
											value={contribution.content}
											onChange={(e) =>
												updateKeyContribution(index, {
													...contribution,
													content: e.target.value,
												})
											}
										/>
										<button
											className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
											onClick={() => removeKeyContribution(index)}
										>
											<Icon name="x" size={18} color={colors.text.tertiary} />
										</button>
									</div>
								))}
								<button
									className="flex items-center justify-center w-full py-3 bg-white border border-dashed border-green-500 text-green-500 rounded-xl mt-3 hover:bg-green-50 transition-colors"
									onClick={addKeyContribution}
								>
									<Icon name="plus" size={18} color={colors.primary.main} />
									<span className="ml-2 font-medium">Add Contribution</span>
								</button>
							</>
						)}
					</div>

					{/* Conclusions */}
					<div>
						<div className="flex items-center mb-3">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={includeConclusions}
									onChange={(e) => setIncludeConclusions(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
							</label>
							<span className="ml-3 text-lg font-semibold text-gray-900">Include Conclusions</span>
						</div>
						{includeConclusions && (
							<textarea
								className="w-full bg-white border border-gray-300 rounded-xl p-4 text-gray-900 h-32 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
								placeholder="Enter your concluding remarks..."
								value={conclusions}
								onChange={(e) => setConclusions(e.target.value)}
							/>
						)}
					</div>
				</div>

				{/* Report Options */}
				<div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
					<h4 className="text-lg font-semibold text-gray-900 mb-3">Output Format</h4>
					<div className="flex gap-4">
						<button
							className={`flex-1 py-4 rounded-xl items-center font-semibold transition-colors duration-200 ${
								outputFormat === "pdf"
									? "bg-green-600 text-white"
									: "bg-gray-100 text-gray-900 hover:bg-gray-200"
							}`}
							onClick={() => setOutputFormat("pdf")}
						>
							PDF
						</button>
						<button
							className={`flex-1 py-4 rounded-xl items-center font-semibold transition-colors duration-200 ${
								outputFormat === "word"
									? "bg-green-600 text-white"
									: "bg-gray-100 text-gray-900 hover:bg-gray-200"
							}`}
							onClick={() => setOutputFormat("word")}
						>
							DOCX
						</button>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="p-4">
					<button className="flex items-center justify-center w-full py-3 bg-gray-100 border border-gray-300 text-gray-600 rounded-xl mb-4 hover:bg-gray-200 transition-colors">
						<Icon name="eye" size={18} color={colors.text.secondary} />
						<span className="ml-2 font-medium">Preview</span>
					</button>
					<button
						className={`flex items-center justify-center w-full py-4 rounded-xl font-semibold transition-colors duration-200 ${
							isSaving ? "bg-green-400 text-white cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
						}`}
						onClick={handleExportClick}
						disabled={isSaving}
					>
						<Icon name="download" size={18} color={colors.text.inverse} />
						<span className="ml-2">{isSaving ? "Exporting..." : "Export"}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExportWizardScreen;

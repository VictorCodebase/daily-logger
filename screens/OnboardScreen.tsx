import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Pressable, Platform, KeyboardAvoidingView } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { Picker } from "@react-native-picker/picker";
import { signUpUser, loginUser } from "../stores/OnboardViewModel";
import { useUser } from "../context/UserContext";
import { colors } from "../themes/colors";



// Define the shape of the work schedule periods
interface WorkSchedulePeriod {
	start: string;
	end: string;
	expected_time_in: string;
	expected_time_out: string;
}

// Helper component for work schedule period input
const WorkSchedulePeriodInput = ({
	period,
	index,
	onPeriodChange,
	onRemove,
}: {
	period: WorkSchedulePeriod;
	index: number;
	onPeriodChange: (updatedPeriod: WorkSchedulePeriod) => void;
	onRemove: () => void;
}) => {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "public_holiday"];

	return (
		<View style={tw`bg-[${colors.surface.elevated}] p-4 rounded-xl mb-4 border border-[${colors.border.primary}]`}>
			<View style={tw`flex-row items-center justify-between mb-2`}>
				<Text style={tw`text-[${colors.text.primary}] font-semibold`}>Period {index + 1}</Text>
				<TouchableOpacity onPress={onRemove}>
					<Feather name="trash" size={18} color={colors.text.secondary} />
				</TouchableOpacity>
			</View>
			<View style={tw`flex-row justify-between mb-3`}>
				<View style={tw`w-1/2 pr-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Start Day</Text>
					<View style={tw`bg-[${colors.background.secondary}] rounded-md `}>
						<Picker
							selectedValue={period.start}
							onValueChange={(itemValue) => onPeriodChange({ ...period, start: itemValue })}
							style={tw`text-[${colors.text.primary}] h-15`}
							dropdownIconColor={colors.text.primary}
							mode="dropdown"
						>
							{days.map((day) => (
								<Picker.Item key={day} label={day} value={day} />
							))}
						</Picker>
					</View>
				</View>
				<View style={tw`w-1/2 pl-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>End Day</Text>
					<View style={tw`bg-[${colors.background.secondary}] rounded-md`}>
						<Picker
							selectedValue={period.end}
							onValueChange={(itemValue) => onPeriodChange({ ...period, end: itemValue })}
							style={tw`text-[${colors.text.primary}] h-15`}
							dropdownIconColor={colors.text.primary}
							mode="dropdown"
						>
							{days.map((day) => (
								<Picker.Item key={day} label={day} value={day} />
							))}
						</Picker>
					</View>
				</View>
			</View>
			<View style={tw`flex-row justify-between`}>
				<View style={tw`w-1/2 pr-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Time In</Text>
					<TextInput
						style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-md h-10 px-3`}
						value={period.expected_time_in}
						onChangeText={(text) => onPeriodChange({ ...period, expected_time_in: text })}
						placeholder="HH:MM"
						placeholderTextColor={colors.text.secondary}
					/>
				</View>
				<View style={tw`w-1/2 pl-2`}>
					<Text style={tw`text-sm text-[${colors.text.secondary}] mb-1`}>Time Out</Text>
					<TextInput
						style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-md h-10 px-3`}
						value={period.expected_time_out}
						onChangeText={(text) => onPeriodChange({ ...period, expected_time_out: text })}
						placeholder="HH:MM"
						placeholderTextColor={colors.text.secondary}
					/>
				</View>
			</View>
		</View>
	);
};

export default function LoginSignupScreen() {
	const [isLogin, setIsLogin] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// State for Login Form
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");

	// State for Signup Form
	const [signupName, setSignupName] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
	const [roles, setRoles] = useState<string[]>([]);
	const [roleInput, setRoleInput] = useState("");
	const [workSchedule, setWorkSchedule] = useState<WorkSchedulePeriod[]>([
		{
			start: "Monday",
			end: "Friday",
			expected_time_in: "09:00",
			expected_time_out: "17:00",
		},
	]);
	const [profilePhotoPath, setProfilePhotoPath] = useState("");

	// Helper to add roles from a comma-separated string
	const handleAddRole = (text: string) => {
		if (text.endsWith(",")) {
			const newRole = text.substring(0, text.length - 1).trim();
			if (newRole && !roles.includes(newRole)) {
				setRoles([...roles, newRole]);
				setRoleInput("");
			}
		} else {
			setRoleInput(text);
		}
	};

	const handleLogin = async () => {
		setIsLoading(true);
		setErrorMessage("");
		const response = await loginUser(loginEmail, loginPassword);
		if (response.status === "error") {
			setErrorMessage(response.message);
		}
		setIsLoading(false);
	};

	const handleSignup = async () => {
		setIsLoading(true);
		setErrorMessage("");

		// Basic client-side validation
		if (signupPassword !== signupPasswordConfirm) {
			setErrorMessage("Passwords do not match.");
			setIsLoading(false);
			return;
		}
		if (signupPassword.length < 8) {
			setErrorMessage("Password must be at least 8 characters long.");
			setIsLoading(false);
			return;
		}

		const workScheduleObject = { periods: workSchedule };
		const response = await signUpUser(signupName, signupEmail, signupPassword, roles, workScheduleObject, profilePhotoPath);
		if (response.status === "error") {
			setErrorMessage(response.message);
		}
		setIsLoading(false);
	};

	const handleAddPeriod = () => {
		setWorkSchedule([
			...workSchedule,
			{
				start: "Monday",
				end: "Friday",
				expected_time_in: "09:00",
				expected_time_out: "17:00",
			},
		]);
	};

	const handleRemovePeriod = (indexToRemove: number) => {
		setWorkSchedule(workSchedule.filter((_, index) => index !== indexToRemove));
	};

	const updatePeriod = (index: number, updatedPeriod: WorkSchedulePeriod) => {
		setWorkSchedule(workSchedule.map((period, i) => (i === index ? updatedPeriod : period)));
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1`}>
			<SafeAreaView style={tw`flex-1 bg-[${colors.background.primary}]`}>
				{isLoading && (
					<View style={tw`absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
						<ActivityIndicator size="large" color={colors.primary.main} />
					</View>
				)}
				<ScrollView contentContainerStyle={tw`flex-grow p-6`}>
					{/* Header with Logos */}
					<View style={tw`flex items-center mt-10 mb-8`}>
						{/* Placeholder for your combined logo image */}
						<View
							style={tw`w-24 h-24 bg-[${colors.surface.elevated}] rounded-full mb-2 border border-[${colors.border.primary}]`}
						></View>
						<Text style={tw`text-3xl font-bold text-[${colors.text.primary}]`}>Welcome</Text>
						<Text style={tw`text-lg text-[${colors.text.secondary}]`}>
							{isLogin ? "Sign in to your account" : "Create a new account"}
						</Text>
					</View>

					{/* Login/Signup Tab Switch */}
					<View style={tw`flex-row bg-[${colors.background.secondary}] rounded-xl p-1 mb-8`}>
						<TouchableOpacity
							onPress={() => setIsLogin(true)}
							style={tw`flex-1 py-3 items-center rounded-lg ${isLogin ? `bg-[${colors.surface.elevated}]` : ""}`}
						>
							<Text
								style={tw`font-medium ${
									isLogin ? `text-[${colors.primary.main}]` : `text-[${colors.text.secondary}]`
								}`}
							>
								Login
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setIsLogin(false)}
							style={tw`flex-1 py-3 items-center rounded-lg ${!isLogin ? `bg-[${colors.surface.elevated}]` : ""}`}
						>
							<Text
								style={tw`font-medium ${
									!isLogin ? `text-[${colors.primary.main}]` : `text-[${colors.text.secondary}]`
								}`}
							>
								Sign Up
							</Text>
						</TouchableOpacity>
					</View>

					{/* Error Message */}
					{errorMessage ? (
						<View style={tw`bg-red-500 p-3 rounded-lg mb-4`}>
							<Text style={tw`text-white`}>{errorMessage}</Text>
						</View>
					) : null}

					{isLogin ? (
						/* Login Form */
						<View>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Email"
								placeholderTextColor={colors.text.secondary}
								keyboardType="email-address"
								value={loginEmail}
								onChangeText={setLoginEmail}
							/>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Password"
								placeholderTextColor={colors.text.secondary}
								secureTextEntry
								value={loginPassword}
								onChangeText={setLoginPassword}
							/>
							<TouchableOpacity
								style={tw`flex-row items-center justify-center py-4 bg-[${colors.primary.main}] rounded-xl mt-4`}
								onPress={handleLogin}
							>
								<Text style={tw`text-white font-medium text-base`}>Log In</Text>
							</TouchableOpacity>
						</View>
					) : (
						/* Signup Form */
						<View>
							{/* Personal Details */}
							<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3`}>Personal Details</Text>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Full Name"
								placeholderTextColor={colors.text.secondary}
								value={signupName}
								onChangeText={setSignupName}
							/>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Email"
								placeholderTextColor={colors.text.secondary}
								keyboardType="email-address"
								value={signupEmail}
								onChangeText={setSignupEmail}
							/>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Password"
								placeholderTextColor={colors.text.secondary}
								secureTextEntry
								value={signupPassword}
								onChangeText={setSignupPassword}
							/>
							<TextInput
								style={tw`bg-[${colors.background.secondary}] text-[${colors.text.primary}] rounded-xl h-12 px-4 mb-4`}
								placeholder="Confirm Password"
								placeholderTextColor={colors.text.secondary}
								secureTextEntry
								value={signupPasswordConfirm}
								onChangeText={setSignupPasswordConfirm}
							/>
							<TouchableOpacity
								style={tw`flex-row items-center justify-center py-3 bg-[${colors.surface.elevated}] border border-dashed border-[${colors.primary.main}] rounded-xl mb-4`}
								onPress={() => alert("Photo upload functionality will be here!")}
							>
								<Feather name="upload" size={18} color={colors.primary.main} />
								<Text style={tw`ml-2 text-[${colors.primary.main}] font-medium`}>Upload Profile Photo</Text>
							</TouchableOpacity>

							{/* Job Details */}
							<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3 mt-4`}>Job Details</Text>
							{/* Roles Section */}
							<View style={tw`flex-row flex-wrap mb-2`}>
								{roles.map((role, index) => (
									<View
										key={index}
										style={tw`flex-row items-center bg-[${colors.background.secondary}] rounded-full px-3 py-1 mr-2 mb-2`}
									>
										<Text style={tw`text-[${colors.text.primary}] mr-2`}>{role}</Text>
										<TouchableOpacity onPress={() => setRoles(roles.filter((r) => r !== role))}>
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

							{/* Work Schedule Section */}
							<Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-3 mt-4`}>Work Schedule</Text>
							{workSchedule.map((period, index) => (
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

							{/* Sign Up Button */}
							<TouchableOpacity
								style={tw`flex-row items-center justify-center py-4 bg-[${colors.primary.main}] rounded-xl mt-8`}
								onPress={handleSignup}
							>
								<Text style={tw`text-white font-medium text-base`}>Sign Up</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}

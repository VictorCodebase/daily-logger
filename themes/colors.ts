// theme.ts
export const colors = {
	primary: {
		main: "#4CAF50", // Green accent
		light: "#81C784",
		dark: "#388E3C",
		50: "#E8F5E8",
		100: "#C8E6C9",
		200: "#A5D6A7",
	},

	background: {
		primary: "#FFFFFF",
		secondary: "#F8F9FA",
		tertiary: "#F1F3F4",
		card: "#FFFFFF",
		modal: "rgba(0, 0, 0, 0.5)",
	},

	text: {
		primary: "#1C1C1E",
		secondary: "#6B7280",
		tertiary: "#9CA3AF",
		placeholder: "#A0A0A0",
		white: "#FFFFFF",
		inverse: "#FFFFFF",
	},

	// border: {
	// 	light: "#E5E7EB",
	// 	medium: "#D1D5DB",
	// 	dark: "#9CA3AF",
	// 	focus: "#4CAF50",
	// },
	border: {
		primary: "#E5E7EB",
		secondary: "#D1D5DB",
		tertiary: "#9CA3AF",
		focus: "#4CAF50",
	},

	surface: {
		elevated: "#FFFFFF",
		pressed: "#F3F4F6",
		disabled: "#F9FAFB",
	},

	status: {
		success: "#10B981",
		error: "#EF4444",
		warning: "#F59E0B",
		info: "#3B82F6",
	},

	// OneUI specific colors
	oneui: {
		cardBackground: "#FFFFFF",
		divider: "#E8EAED",
		ripple: "rgba(76, 175, 80, 0.12)",
		shadow: "rgba(0, 0, 0, 0.1)",
	},
};

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 40,
};

export const borderRadius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
};

export const typography = {
	h1: {
		fontSize: 28,
		fontWeight: "700" as const,
		lineHeight: 34,
	},
	h2: {
		fontSize: 24,
		fontWeight: "600" as const,
		lineHeight: 30,
	},
	h3: {
		fontSize: 20,
		fontWeight: "600" as const,
		lineHeight: 26,
	},
	body1: {
		fontSize: 16,
		fontWeight: "400" as const,
		lineHeight: 22,
	},
	body2: {
		fontSize: 14,
		fontWeight: "400" as const,
		lineHeight: 20,
	},
	caption: {
		fontSize: 12,
		fontWeight: "400" as const,
		lineHeight: 16,
	},
	button: {
		fontSize: 16,
		fontWeight: "500" as const,
		lineHeight: 22,
	},
};

export const shadows = {
	card: {
		shadowColor: colors.oneui.shadow,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},

	button: {
		shadowColor: colors.oneui.shadow,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
};

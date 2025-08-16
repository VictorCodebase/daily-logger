
export interface User {
    user_id: number;
    name: string;
    email: string;
    password_hash: string | null;
    avatar: string | null;
    role: string | null;
    work_schedule: string | null;
}

// export interface User {
// 	id: string;
// 	name: string;
// 	email: string;
// 	avatar?: string;
// 	role?: string;
// 	workSchedule?: string;
// }


export interface Day {
    day_id: number;
    date: string;
    time_in: string | null;
    time_out: string | null;
}

export interface Activity {
    activity_id: number;
    content: string;
    time_start: string | null;
    time_end: string | null;
    category: string | null;
    day_id: number;
}

export interface SpecialActivity {
    sp_activity_id: number;
    content: string;
    time_start: string | null;
    time_end: string | null;
    category: string | null;
    day_id: number;
}

export interface ResponsibilitiesSummary {
    responsibilities_id: number;
    content: string;
    user_id: number;
}

export interface LogTemplate {
    log_template_id: number;
    name: string;
    description: string | null;
    color_code: string | null;
    content_json: string | null;
    date_created: string;
}

export interface ExportTemplate {
    export_template_id: number;
    name: string;
    description: string | null;
    color_code: string | null;
    content_json: string | null;
    date_created: string;
}


export interface DayDetails {
	day: Day | null;
	activities: Activity[] | null;
	specialActivities: SpecialActivity[] | null;
}

export interface WorkSchedulePeriod {
	start: string;
	end: string;
	expected_time_in: string;
	expected_time_out: string;
}

export interface WorkSchedule {
	periods: WorkSchedulePeriod[];
}

export interface ImageUploadResult {
	status: "success" | "error" | "cancelled";
	message: string;
	imagePath?: string;
	imageUri?: string;
}


export interface KeyContribution {
	title: string;
	content: string;
}

export interface ExportOptions {
	includeUserRoles: boolean;
	includeWorkSchedule: boolean;
	includeResponsibilitiesSummary: boolean;
	includeKeyContributions: boolean;
	includeSpecialActivities: boolean;
	includeDailyLog: boolean;
	includeConclusions: boolean;
	outputFormat: "pdf" | "word";
	documentFormat: "professional" | "monotone" | "simple" | "creative";
}
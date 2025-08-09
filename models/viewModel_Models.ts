
export interface User {
    user_id: number;
    name: string;
    email: string;
    password_hash: string;
    path_to_icon: string | null;
    roles_positions: string | null;
    work_schedule: string | null;
}

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

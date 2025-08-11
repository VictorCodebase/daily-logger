export interface RawActivity {
    content: string;
    category: string;
    time_start: string;
    time_end: string;
}

export interface RawDate {
    date: string;
    time_in: string;
    time_out: string;
}

export interface WorkSchedulePeriod {
	start: string;
	end: string;
	expected_time_in: string;
	expected_time_out: string;
}
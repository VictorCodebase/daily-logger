import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { createResponsibilitiesSummary } from "../services/DatabaseCreateService";
import { dayExists, readDay, readUser } from "../services/DatabaseReadService";
import { KeyContribution, WorkSchedulePeriod, DayDetails, ExportOptions } from "../models/ViewModel_Models";
import { extractWorkSchedulePeriods, formatDate, getDatesInRange, ReportData } from "../stores/ExportViewModel";

const formatWorkSchedulePeriod = (period: WorkSchedulePeriod): string => {
	const { start, end, expected_time_in, expected_time_out } = period;

	// If start and end are the same, show only once
	const dateRange = start === end ? start : `${start} to ${end}`;

	// Format time range
	const timeRange = `${expected_time_in} - ${expected_time_out}`;

	return `${dateRange}: ${timeRange}`;
};

/**
 * Format activity with smart time handling
 */
const formatActivity = (activity: any): string => {
	const { time_start, time_end, content, category } = activity;

	let timePrefix = "";
	if (time_start && time_end) {
		timePrefix = `<strong>${time_start} - ${time_end}:</strong> `;
	} else if (time_start) {
		timePrefix = `<strong>From ${time_start}:</strong> `;
	}

	const categoryText = category ? ` <em>(${category})</em>` : "";

	return `${timePrefix}${content}${categoryText}`;
};

/**
 * Generate a professional HTML document with enhanced styling
 */
const generateProfessionalHTML = (data: ReportData, options: ExportOptions): string => {
	const currentDate = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.reportTitle}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.6;
                color: #2c3e50;
                background: #ffffff;
                padding: 40px;
                max-width: 210mm;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #4CAF50;
            }
            
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #1a252f;
                margin-bottom: 10px;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .subtitle {
                font-size: 16px;
                color: #5a6c7d;
                font-style: italic;
                margin-bottom: 5px;
            }
            
            .generated-date {
                font-size: 12px;
                color: #7f8c8d;
                margin-top: 15px;
            }
            
            .section {
                margin-bottom: 35px;
                break-inside: avoid;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #4CAF50;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .subsection-title {
                font-size: 16px;
                font-weight: bold;
                color: #34495e;
                margin: 20px 0 10px 0;
                padding-left: 10px;
                border-left: 4px solid #4CAF50;
                text-transform: capitalize;
            }
            
            .content {
                font-size: 14px;
                line-height: 1.8;
                text-align: justify;
                margin-bottom: 15px;
            }
            
            .info-box {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-left: 4px solid #4CAF50;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            
            .info-label {
                font-weight: bold;
                color: #2c3e50;
                display: inline-block;
                min-width: 120px;
            }
            
            .work-schedule {
                background: #f1f8e9;
                border: 1px solid #c8e6c9;
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
            }
            
            .work-schedule-item {
                padding: 8px 0;
                border-bottom: 1px solid #e8f5e8;
                font-size: 14px;
            }
            
            .work-schedule-item:last-child {
                border-bottom: none;
            }
            
            .contribution {
                background: #fff;
                border: 1px solid #ddd;
                margin: 20px 0;
                padding: 20px;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .contribution-title {
                font-size: 16px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .day-entry {
                margin: 25px 0;
                padding: 20px;
                background: #fafafa;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
            }
            
            .day-header {
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                margin: -20px -20px 20px -20px;
                border-radius: 8px 8px 0 0;
                font-weight: bold;
                font-size: 16px;
            }
            
            .day-times {
                background: #e8f5e8;
                padding: 12px;
                margin-bottom: 15px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                font-size: 14px;
            }
            
            .activity-list {
                margin: 15px 0;
            }
            
            .activity-item {
                padding: 8px 0;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .special-activities {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                margin-top: 15px;
                border-radius: 4px;
            }
            
            .special-activities-title {
                font-weight: bold;
                color: #856404;
                margin-bottom: 10px;
                font-size: 14px;
                text-transform: uppercase;
            }
            
            .special-activity-item {
                padding: 5px 0;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .conclusion {
                background: #f8f9fa;
                border: 2px solid #4CAF50;
                padding: 25px;
                border-radius: 8px;
                font-style: italic;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            .signature-section {
                margin-top: 60px;
                padding-top: 30px;
                border-top: 1px solid #ddd;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                width: 300px;
                margin: 30px 0 10px 0;
            }
            
            @media print {
                body { 
                    padding: 20px;
                }
                .page-break {
                    page-break-before: always;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${data.reportTitle}</div>
            <div class="subtitle">Professional Activity Report</div>
            <div class="subtitle">Reporting Period: ${data.reportingPeriod}</div>
            <div class="generated-date">Generated on ${currentDate}</div>
        </div>

        ${
		options.includeUserRoles && data.userRoles
			? `
        <div class="section">
            <div class="info-box">
                <span class="info-label">Position:</span> ${data.userRoles}
            </div>
        </div>
        `
			: ""
	}

        ${
		options.includeWorkSchedule && data.workSchedule
			? `
        <div class="section">
            <div class="section-title">Work Schedule</div>
            <div class="work-schedule">
                ${data.workSchedule
			.map(
				(schedule) => `
                    <div class="work-schedule-item">
                        ${formatWorkSchedulePeriod(schedule)}
                    </div>
                `
			)
			.join("")}
            </div>
        </div>
        `
			: ""
	}

        ${
		options.includeResponsibilitiesSummary && data.responsibilitiesSummary
			? `
        <div class="section">
            <div class="section-title">Monthly Summary of Responsibilities</div>
            <div class="content">${data.responsibilitiesSummary.replace(/\n/g, "<br>")}</div>
        </div>
        `
			: ""
	}

        ${
		options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0
			? `
        <div class="section">
            <div class="section-title">Key Contributions</div>
            ${data.keyContributions
			.map(
				(contribution, index) => `
                <div class="contribution">
                    <div class="contribution-title">${index + 1}. ${contribution.title}</div>
                    <div class="content">${contribution.content.replace(/\n/g, "<br>")}</div>
                </div>
            `
			)
			.join("")}
        </div>
        `
			: ""
	}

        ${
		options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0
			? `
        <div class="section page-break">
            <div class="section-title">Detailed Daily Log</div>
            ${data.detailedDailyLog
			.map((dayDetails) => {
				if (!dayDetails.day) return "";

				const day = dayDetails.day;
				const dayDate = new Date(day.date + "T00:00:00");
				const weekday = dayDate.toLocaleDateString("en-US", { weekday: "long" });
				const formattedDate = formatDate(day.date);

				return `
                <div class="day-entry">
                    <div class="day-header">
                        ${formattedDate} - ${weekday.toUpperCase()}
                    </div>
                    
                    <div class="day-times">
                        <span><strong>Time In:</strong> ${day.time_in || "Not recorded"}</span>
                        <span><strong>Time Out:</strong> ${day.time_out || "Not recorded"}</span>
                    </div>

                    ${
				dayDetails.activities && dayDetails.activities.length > 0
					? `
                        <div class="activity-list">
                            ${dayDetails.activities
					.map(
						(activity) => `
                                <div class="activity-item">
                                    ${formatActivity(activity)}
                                </div>
                            `
					)
					.join("")}
                        </div>
                    `
					: ""
			}

                    ${
				options.includeSpecialActivities && dayDetails.specialActivities && dayDetails.specialActivities.length > 0
					? `
                        <div class="special-activities">
                            <div class="special-activities-title">Special Activities</div>
                            ${dayDetails.specialActivities
					.map(
						(spActivity) => `
                                <div class="special-activity-item">• ${spActivity.content}</div>
                            `
					)
					.join("")}
                        </div>
                    `
					: ""
			}
                </div>
                `;
			})
			.join("")}
        </div>
        `
			: ""
	}

        ${
		options.includeConclusions && data.conclusions
			? `
        <div class="section">
            <div class="section-title">Conclusion</div>
            <div class="conclusion">
                ${data.conclusions.replace(/\n/g, "<br>")}
            </div>
        </div>
        `
			: ""
	}

        <div class="signature-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                        ${data.userName}<br>
                        Employee Signature
                    </div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                        Supervisor Signature<br>
                        Date: ________________
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate a strict, monotone HTML document
 */
const generateMonotoneHTML = (data: ReportData, options: ExportOptions): string => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.reportTitle}</title>
        <style>
            body {
                font-family: 'Courier New', Courier, monospace;
                line-height: 1.5;
                color: #000000;
                background: #ffffff;
                padding: 30px;
                max-width: 210mm;
                margin: 0 auto;
            }
            h1, h2, h3 {
                font-family: 'Courier New', Courier, monospace;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #000;
                padding-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 14px;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin: 25px 0 10px 0;
                padding-bottom: 5px;
                border-bottom: 1px solid #000;
                text-transform: uppercase;
            }
            .subsection-title {
                font-size: 14px;
                font-weight: bold;
                margin: 15px 0 5px 0;
            }
            .content {
                font-size: 12px;
                margin-bottom: 10px;
            }
            .page-break {
                page-break-before: always;
            }
            .signature-section {
                margin-top: 50px;
                border-top: 1px solid #000;
                padding-top: 20px;
            }
            .signature-line {
                width: 250px;
                border-bottom: 1px solid #000;
                margin: 20px 0 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${data.reportTitle}</div>
            <div class="subtitle">Report for the period: ${data.reportingPeriod}</div>
            <div class="subtitle">Generated on ${currentDate}</div>
        </div>
        
        ${options.includeUserRoles && data.userRoles ? `
        <div class="section-title">User Roles</div>
        <div class="content">Position: ${data.userRoles}</div>
        ` : ""}

        ${options.includeWorkSchedule && data.workSchedule ? `
        <div class="section-title">Work Schedule</div>
        ${data.workSchedule.map(schedule => `
        <div class="content">${formatWorkSchedulePeriod(schedule)}</div>
        `).join("")}
        ` : ""}

        ${options.includeResponsibilitiesSummary && data.responsibilitiesSummary ? `
        <div class="section-title">Monthly Summary of Responsibilities</div>
        <div class="content">${data.responsibilitiesSummary.replace(/\n/g, "<br>")}</div>
        ` : ""}

        ${options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0 ? `
        <div class="section-title">Key Contributions</div>
        ${data.keyContributions.map(contribution => `
        <div class="content">
            <div class="subsection-title">${contribution.title}</div>
            ${contribution.content.replace(/\n/g, "<br>")}
        </div>
        `).join("")}
        ` : ""}

        ${options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0 ? `
        <div class="page-break section-title">Detailed Daily Log</div>
        ${data.detailedDailyLog.map(dayDetails => `
        ${dayDetails.day ? `
        <div class="subsection-title">${formatDate(dayDetails.day.date)} - ${new Date(dayDetails.day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}</div>
        <div class="content">
            Time In: ${dayDetails.day.time_in || "Not recorded"}<br>
            Time Out: ${dayDetails.day.time_out || "Not recorded"}
        </div>
        ${dayDetails.activities && dayDetails.activities.length > 0 ? `
        <div class="content">
            Activities:<br>
            ${dayDetails.activities.map(activity => `&nbsp;&nbsp;&nbsp;&nbsp;• ${formatActivity(activity)}`).join("<br>")}
        </div>
        ` : ""}
        ` : ""}`).join("")}
        ` : ""}
        
        ${options.includeConclusions && data.conclusions ? `
        <div class="section-title">Conclusion</div>
        <div class="content">${data.conclusions.replace(/\n/g, "<br>")}</div>
        ` : ""}

        <div class="signature-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 10px;">${data.userName}<br>Employee Signature</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 10px;">Supervisor Signature<br>Date: ________________</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate a clean, simple HTML document
 */
const generateSimpleHTML = (data: ReportData, options: ExportOptions): string => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.reportTitle}</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                line-height: 1.6;
                color: #333333;
                background: #fdfdfd;
                padding: 30px;
                max-width: 210mm;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 1px solid #cccccc;
            }
            .title {
                font-size: 26px;
                font-weight: bold;
                color: #222;
                margin-bottom: 8px;
            }
            .subtitle {
                font-size: 14px;
                color: #666;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #555;
                margin-bottom: 12px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 5px;
            }
            .subsection-title {
                font-size: 16px;
                font-weight: bold;
                color: #444;
                margin: 15px 0 8px 0;
            }
            .content {
                font-size: 14px;
                margin-bottom: 10px;
            }
            .day-entry {
                margin: 20px 0;
            }
            .day-header {
                font-size: 16px;
                font-weight: bold;
                color: #444;
                margin-bottom: 10px;
            }
            .activity-item {
                padding: 5px 0;
                font-size: 14px;
            }
            .signature-section {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
            }
            .signature-line {
                border-bottom: 1px solid #555;
                width: 250px;
                margin: 20px 0 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${data.reportTitle}</div>
            <div class="subtitle">Report for the period: ${data.reportingPeriod}</div>
            <div class="subtitle">Generated on ${currentDate}</div>
        </div>

        ${options.includeUserRoles && data.userRoles ? `
        <div class="section">
            <div class="section-title">User Roles</div>
            <div class="content">Position: ${data.userRoles}</div>
        </div>
        ` : ""}

        ${options.includeWorkSchedule && data.workSchedule ? `
        <div class="section">
            <div class="section-title">Work Schedule</div>
            ${data.workSchedule.map(schedule => `
            <div class="content">${formatWorkSchedulePeriod(schedule)}</div>
            `).join("")}
        </div>
        ` : ""}

        ${options.includeResponsibilitiesSummary && data.responsibilitiesSummary ? `
        <div class="section">
            <div class="section-title">Monthly Summary of Responsibilities</div>
            <div class="content">${data.responsibilitiesSummary.replace(/\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0 ? `
        <div class="section">
            <div class="section-title">Key Contributions</div>
            ${data.keyContributions.map(contribution => `
            <div class="content">
                <div class="subsection-title">${contribution.title}</div>
                ${contribution.content.replace(/\n/g, "<br>")}
            </div>
            `).join("")}
        </div>
        ` : ""}

        ${options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0 ? `
        <div class="section page-break">
            <div class="section-title">Detailed Daily Log</div>
            ${data.detailedDailyLog.map(dayDetails => `
            ${dayDetails.day ? `
            <div class="day-entry">
                <div class="day-header">${formatDate(dayDetails.day.date)} - ${new Date(dayDetails.day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}</div>
                <div class="content">
                    Time In: ${dayDetails.day.time_in || "Not recorded"} | Time Out: ${dayDetails.day.time_out || "Not recorded"}
                </div>
                ${dayDetails.activities && dayDetails.activities.length > 0 ? `
                <div class="content">
                    <div style="font-weight: bold; margin-bottom: 5px;">Activities:</div>
                    ${dayDetails.activities.map(activity => `<div class="activity-item">${formatActivity(activity)}</div>`).join("")}
                </div>
                ` : ""}
            </div>
            ` : ""}`).join("")}
        </div>
        ` : ""}

        ${options.includeConclusions && data.conclusions ? `
        <div class="section">
            <div class="section-title">Conclusion</div>
            <div class="content">${data.conclusions.replace(/\n/g, "<br>")}</div>
        </div>
        ` : ""}

        <div class="signature-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                        ${data.userName}<br>Employee Signature
                    </div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-size: 12px; color: #666;">
                        Supervisor Signature<br>Date: ________________
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate a creative, box-free HTML document
 */
const generateCreativeHTML = (data: ReportData, options: ExportOptions): string => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.reportTitle}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700&display=swap');
            
            body {
                font-family: 'Roboto', sans-serif;
                line-height: 1.8;
                color: #263238;
                background: #fafafa;
                padding: 40px;
                max-width: 210mm;
                margin: 0 auto;
            }
            .header {
                text-align: left;
                margin-bottom: 40px;
            }
            .title {
                font-family: 'Lora', serif;
                font-size: 36px;
                font-weight: 700;
                color: #37474F;
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 18px;
                font-style: italic;
                color: #78909C;
                margin-bottom: 5px;
            }
            .date-info {
                font-size: 14px;
                color: #90A4AE;
                font-weight: 300;
            }
            .section {
                margin-top: 40px;
            }
            .section-title {
                font-family: 'Lora', serif;
                font-size: 24px;
                font-weight: 700;
                color: #546E7A;
                margin-bottom: 20px;
                position: relative;
            }
            .section-title::after {
                content: '';
                display: block;
                width: 50px;
                height: 3px;
                background-color: #546E7A;
                margin-top: 8px;
            }
            .content {
                font-size: 16px;
                font-weight: 300;
            }
            .day-header {
                font-family: 'Lora', serif;
                font-size: 20px;
                font-weight: 700;
                color: #455A64;
                margin-top: 30px;
                margin-bottom: 10px;
            }
            .activity-item {
                padding: 10px 0;
                border-bottom: 1px dotted #CFD8DC;
            }
            .activity-item:last-child {
                border-bottom: none;
            }
            .signature-section {
                margin-top: 80px;
            }
            .signature-line {
                border-bottom: 1px solid #455A64;
                width: 300px;
                margin: 30px 0 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="subtitle">Report for the period: ${data.reportingPeriod}</div>
            <div class="title">${data.reportTitle}</div>
            <div class="date-info">Generated on ${currentDate}</div>
        </div>

        ${options.includeUserRoles && data.userRoles ? `
        <div class="section">
            <div class="section-title">Position</div>
            <div class="content">${data.userRoles}</div>
        </div>
        ` : ""}

        ${options.includeWorkSchedule && data.workSchedule ? `
        <div class="section">
            <div class="section-title">Work Schedule</div>
            <div class="content">
                ${data.workSchedule.map(schedule => `
                <div style="margin-bottom: 8px;">${formatWorkSchedulePeriod(schedule)}</div>
                `).join("")}
            </div>
        </div>
        ` : ""}
        
        ${options.includeResponsibilitiesSummary && data.responsibilitiesSummary ? `
        <div class="section">
            <div class="section-title">Responsibilities Summary</div>
            <div class="content">${data.responsibilitiesSummary.replace(/\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0 ? `
        <div class="section">
            <div class="section-title">Key Contributions</div>
            <div class="content">
                ${data.keyContributions.map(contribution => `
                <div style="margin-bottom: 15px;">
                    <strong style="display: block; margin-bottom: 5px;">${contribution.title}</strong>
                    ${contribution.content.replace(/\n/g, "<br>")}
                </div>
                `).join("")}
            </div>
        </div>
        ` : ""}

        ${options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0 ? `
        <div class="section page-break">
            <div class="section-title">Detailed Daily Log</div>
            ${data.detailedDailyLog.map(dayDetails => `
            ${dayDetails.day ? `
            <div class="day-entry">
                <div class="day-header">${formatDate(dayDetails.day.date)} - ${new Date(dayDetails.day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })}</div>
                <div style="font-size: 14px; color: #78909C; margin-bottom: 10px;">
                    Time In: ${dayDetails.day.time_in || "Not recorded"} | Time Out: ${dayDetails.day.time_out || "Not recorded"}
                </div>
                ${dayDetails.activities && dayDetails.activities.length > 0 ? `
                <div class="content">
                    ${dayDetails.activities.map(activity => `<div class="activity-item">${formatActivity(activity)}</div>`).join("")}
                </div>
                ` : ""}
            </div>
            ` : ""}`).join("")}
        </div>
        ` : ""}

        ${options.includeConclusions && data.conclusions ? `
        <div class="section">
            <div class="section-title">Conclusion</div>
            <div class="content">${data.conclusions.replace(/\n/g, "<br>")}</div>
        </div>
        ` : ""}

        <div class="signature-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div class="signature-line"></div>
                    <div style="font-size: 12px; color: #666;">${data.userName}<br>Employee Signature</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="font-size: 12px; color: #666;">Supervisor Signature<br>Date: ________________</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate filename based on user name and date range
 */
const generateFileName = (userName: string, startDate: string, endDate: string, format: "pdf" | "word"): string => {
	const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "_");
	const startFormatted = new Date(startDate)
		.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		})
		.replace(/[^a-zA-Z0-9]/g, "_");
	const endFormatted = new Date(endDate)
		.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		})
		.replace(/[^a-zA-Z0-9]/g, "_");

	return `${sanitizedName}_Report_${startFormatted}_to_${endFormatted}.${format}`;
};

/**
 * Save PDF to device storage
 */
const savePDFToDevice = async (html: string, fileName: string): Promise<string> => {
	try {
		// Generate PDF from HTML
		const { uri } = await Print.printToFileAsync({
			html,
			base64: false,
			width: 612, // 8.5 inches * 72 points/inch
			height: 792, // 11 inches * 72 points/inch
			margins: {
				left: 36,
				top: 36,
				right: 36,
				bottom: 36,
			},
		});

		// Create the destination path
		const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

		// Move the file to the documents directory
		await FileSystem.moveAsync({
			from: uri,
			to: destinationUri,
		});

		return destinationUri;
	} catch (error) {
		console.error("Error saving PDF:", error);
		throw error;
	}
};

/**
 * Convert HTML content to Word-compatible content
 */
const htmlToWordContent = (data: ReportData, options: ExportOptions): string => {
	const currentDate = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	let content = `${data.reportTitle}\n\n`;
	content += `Professional Activity Report\n`;
	content += `Reporting Period: ${data.reportingPeriod}\n`;
	content += `Generated on ${currentDate}\n\n`;
	content += `${"=".repeat(60)}\n\n`;

	if (options.includeUserRoles && data.userRoles) {
		content += `Position: ${data.userRoles}\n\n`;
	}

	if (options.includeWorkSchedule && data.workSchedule) {
		content += `WORK SCHEDULE\n`;
		content += `${"-".repeat(20)}\n`;
		data.workSchedule.forEach((schedule) => {
			content += `${formatWorkSchedulePeriod(schedule)}\n`;
		});
		content += `\n`;
	}

	if (options.includeResponsibilitiesSummary && data.responsibilitiesSummary) {
		content += `MONTHLY SUMMARY OF RESPONSIBILITIES\n`;
		content += `${"-".repeat(40)}\n`;
		content += `${data.responsibilitiesSummary}\n\n`;
	}

	if (options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0) {
		content += `KEY CONTRIBUTIONS\n`;
		content += `${"-".repeat(20)}\n`;
		data.keyContributions.forEach((contribution, index) => {
			content += `${index + 1}. ${contribution.title}\n`;
			content += `${contribution.content}\n\n`;
		});
	}

	if (options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0) {
		content += `DETAILED DAILY LOG\n`;
		content += `${"-".repeat(25)}\n\n`;

		data.detailedDailyLog.forEach((dayDetails) => {
			if (!dayDetails.day) return;

			const day = dayDetails.day;
			const dayDate = new Date(day.date + "T00:00:00");
			const weekday = dayDate.toLocaleDateString("en-US", { weekday: "long" });
			const formattedDate = formatDate(day.date);

			content += `${formattedDate} - ${weekday.toUpperCase()}\n`;
			content += `Time In: ${day.time_in || "Not recorded"} | Time Out: ${day.time_out || "Not recorded"}\n\n`;

			if (dayDetails.activities && dayDetails.activities.length > 0) {
				dayDetails.activities.forEach((activity) => {
					const { time_start, time_end, content: activityContent, category } = activity;

					let timePrefix = "";
					if (time_start && time_end) {
						timePrefix = `${time_start} - ${time_end}: `;
					} else if (time_start) {
						timePrefix = `From ${time_start}: `;
					}

					const categoryText = category ? ` (${category})` : "";
					content += `• ${timePrefix}${activityContent}${categoryText}\n`;
				});
				content += `\n`;
			}

			if (options.includeSpecialActivities && dayDetails.specialActivities && dayDetails.specialActivities.length > 0) {
				content += `Special Activities:\n`;
				dayDetails.specialActivities.forEach((spActivity) => {
					content += `• ${spActivity.content}\n`;
				});
				content += `\n`;
			}
		});
	}

	if (options.includeConclusions && data.conclusions) {
		content += `CONCLUSION\n`;
		content += `${"-".repeat(15)}\n`;
		content += `${data.conclusions}\n\n`;
	}

	content += `\n\n${"-".repeat(60)}\n`;
	content += `Employee: ${data.userName}\n`;
	content += `Signature: _____________________________  Date: ___________\n\n`;
	content += `Supervisor Signature: ____________________  Date: ___________\n`;

	return content;
};

/**
 * Generate DOCX document using docx library
 */
const generateDocxDocument = async (data: ReportData, options: ExportOptions): Promise<Blob> => {
	// Import docx library dynamically to avoid bundle issues
	const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");

	const currentDate = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const children: any[] = [];

	// Title and header
	children.push(
		new Paragraph({
			text: data.reportTitle,
			heading: HeadingLevel.TITLE,
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: "Professional Activity Report",
					italics: true,
					size: 24,
				}),
			],
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: `Reporting Period: ${data.reportingPeriod}`,
					size: 22,
				}),
			],
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: `Generated on ${currentDate}`,
					size: 18,
					color: "666666",
				}),
			],
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({ text: "" }) // Empty paragraph for spacing
	);

	// User roles
	if (options.includeUserRoles && data.userRoles) {
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: "Position: ",
						bold: true,
					}),
					new TextRun({
						text: data.userRoles,
					}),
				],
			}),
			new Paragraph({ text: "" })
		);
	}

	// Work Schedule
	if (options.includeWorkSchedule && data.workSchedule) {
		children.push(
			new Paragraph({
				text: "WORK SCHEDULE",
				heading: HeadingLevel.HEADING_1,
			})
		);

		data.workSchedule.forEach((schedule) => {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: formatWorkSchedulePeriod(schedule),
						}),
					],
					bullet: {
						level: 0,
					},
				})
			);
		});

		children.push(new Paragraph({ text: "" }));
	}

	// Responsibilities Summary
	if (options.includeResponsibilitiesSummary && data.responsibilitiesSummary) {
		children.push(
			new Paragraph({
				text: "MONTHLY SUMMARY OF RESPONSIBILITIES",
				heading: HeadingLevel.HEADING_1,
			}),
			new Paragraph({
				text: data.responsibilitiesSummary,
			}),
			new Paragraph({ text: "" })
		);
	}

	// Key Contributions
	if (options.includeKeyContributions && data.keyContributions && data.keyContributions.length > 0) {
		children.push(
			new Paragraph({
				text: "KEY CONTRIBUTIONS",
				heading: HeadingLevel.HEADING_1,
			})
		);

		data.keyContributions.forEach((contribution, index) => {
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: `${index + 1}. ${contribution.title}`,
							bold: true,
						}),
					],
				}),
				new Paragraph({
					text: contribution.content,
				}),
				new Paragraph({ text: "" })
			);
		});
	}

	// Daily Log
	if (options.includeDailyLog && data.detailedDailyLog && data.detailedDailyLog.length > 0) {
		children.push(
			new Paragraph({
				text: "DETAILED DAILY LOG",
				heading: HeadingLevel.HEADING_1,
			})
		);

		data.detailedDailyLog.forEach((dayDetails) => {
			if (!dayDetails.day) return;

			const day = dayDetails.day;
			const dayDate = new Date(day.date + "T00:00:00");
			const weekday = dayDate.toLocaleDateString("en-US", { weekday: "long" });
			const formattedDate = formatDate(day.date);

			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: `${formattedDate} - ${weekday.toUpperCase()}`,
							bold: true,
							size: 24,
						}),
					],
				}),
				new Paragraph({
					children: [
						new TextRun({
							text: `Time In: ${day.time_in || "Not recorded"} | Time Out: ${day.time_out || "Not recorded"}`,
							italics: true,
						}),
					],
				})
			);

			if (dayDetails.activities && dayDetails.activities.length > 0) {
				dayDetails.activities.forEach((activity) => {
					const { time_start, time_end, content: activityContent, category } = activity;

					let timePrefix = "";
					if (time_start && time_end) {
						timePrefix = `${time_start} - ${time_end}: `;
					} else if (time_start) {
						timePrefix = `From ${time_start}: `;
					}

					const categoryText = category ? ` (${category})` : "";
					children.push(
						new Paragraph({
							children: [
								new TextRun({
									text: `${timePrefix}${activityContent}${categoryText}`,
								}),
							],
							bullet: {
								level: 0,
							},
						})
					);
				});
			}

			if (options.includeSpecialActivities && dayDetails.specialActivities && dayDetails.specialActivities.length > 0) {
				children.push(
					new Paragraph({
						children: [
							new TextRun({
								text: "Special Activities:",
								bold: true,
								underline: {},
							}),
						],
					})
				);

				dayDetails.specialActivities.forEach((spActivity) => {
					children.push(
						new Paragraph({
							children: [
								new TextRun({
									text: spActivity.content,
								}),
							],
							bullet: {
								level: 1,
							},
						})
					);
				});
			}

			children.push(new Paragraph({ text: "" }));
		});
	}

	// Conclusions
	if (options.includeConclusions && data.conclusions) {
		children.push(
			new Paragraph({
				text: "CONCLUSION",
				heading: HeadingLevel.HEADING_1,
			}),
			new Paragraph({
				text: data.conclusions,
			}),
			new Paragraph({ text: "" })
		);
	}

	// Signature section
	children.push(
		new Paragraph({ text: "" }),
		new Paragraph({ text: "" }),
		new Paragraph({
			children: [
				new TextRun({
					text: "_".repeat(40),
				}),
			],
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: `${data.userName} - Employee Signature`,
					size: 18,
				}),
			],
		}),
		new Paragraph({ text: "" }),
		new Paragraph({ text: "" }),
		new Paragraph({
			children: [
				new TextRun({
					text: "_".repeat(40),
				}),
			],
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: "Supervisor Signature                    Date: ___________",
					size: 18,
				}),
			],
		})
	);

	const doc = new Document({
		sections: [
			{
				properties: {},
				children: children,
			},
		],
	});

	return await Packer.toBlob(doc);
};

/**
 * Save Word document (.docx) to device storage
 */
const saveWordToDevice = async (data: ReportData, options: ExportOptions, fileName: string): Promise<string> => {
	try {
		// Generate DOCX blob
		const blob = await generateDocxDocument(data, options);

		// Convert blob to base64
		const reader = new FileReader();
		const base64Promise = new Promise<string>((resolve, reject) => {
			reader.onloadend = () => {
				const base64 = (reader.result as string).split(",")[1];
				resolve(base64);
			};
			reader.onerror = reject;
		});

		reader.readAsDataURL(blob);
		const base64Data = await base64Promise;

		const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

		await FileSystem.writeAsStringAsync(destinationUri, base64Data, {
			encoding: FileSystem.EncodingType.Base64,
		});

		return destinationUri;
	} catch (error) {
		console.error("Error saving Word document:", error);
		throw error;
	}
};

/**
 * Enhanced generateReport function with document creation and saving
 */
export async function generateReport(
	startDate: string,
	endDate: string,
	userId: number,
	responsibilitiesSummaryInput: string | null,
	keyContributions: KeyContribution[] = [],
	conclusions: string | null = null,
	exportOptions: ExportOptions
): Promise<{ success: boolean; filePath?: string; fileName?: string; error?: string }> {
	try {
		const user = await readUser(userId);
		if (!user) {
			console.error("Error: User not found.");
			return { success: false, error: "User not found." };
		}

		let responsibilitiesSummaryContent: string | null = null;
		if (exportOptions.includeResponsibilitiesSummary && responsibilitiesSummaryInput && responsibilitiesSummaryInput.length > 0) {
			try {
				const newId = await createResponsibilitiesSummary(responsibilitiesSummaryInput, userId);
				if (newId) {
					responsibilitiesSummaryContent = responsibilitiesSummaryInput;
				} else {
					console.error("Failed to create new responsibilities summary.");
				}
			} catch (error) {
				console.error("Error creating responsibilities summary:", error);
			}
		}

		const dailyLogs: DayDetails[] = [];
		const dateRange = getDatesInRange(startDate, endDate);

		for (const date of dateRange) {
			const dayId = await dayExists(date);
			if (dayId) {
				const dayDetails = await readDay(dayId);
				if (dayDetails) {
					dailyLogs.push(dayDetails);
				}
			}
		}

		const reportData: ReportData = {
			reportTitle: `Monthly Job Report For ${user.name}`,
			userName: user.name,
			reportingPeriod: `${formatDate(startDate)} – ${formatDate(endDate)}`,
		};

		if (exportOptions.includeUserRoles && user.roles_positions) {
			reportData.userRoles = user.roles_positions;
		}

		if (exportOptions.includeWorkSchedule && user.work_schedule) {
			const workSchedule = extractWorkSchedulePeriods(user.work_schedule);
			if (workSchedule && workSchedule.length > 0) {
				reportData.workSchedule = workSchedule;
			}
		}

		if (exportOptions.includeResponsibilitiesSummary && responsibilitiesSummaryContent) {
			reportData.responsibilitiesSummary = responsibilitiesSummaryContent;
		}

		if (exportOptions.includeKeyContributions && keyContributions.length > 0) {
			reportData.keyContributions = keyContributions;
		}

		if (exportOptions.includeDailyLog && dailyLogs.length > 0) {
			reportData.detailedDailyLog = dailyLogs;
		}

		if (exportOptions.includeConclusions && conclusions) {
			reportData.conclusions = conclusions;
		}

		// Generate the HTML content
		let htmlContent: string;
		switch (exportOptions.documentFormat) {
			case "professional":
				htmlContent = generateProfessionalHTML(reportData, exportOptions);
				break;
			case "monotone":
				htmlContent = generateMonotoneHTML(reportData, exportOptions);
				break;
			case "simple":
				htmlContent = generateSimpleHTML(reportData, exportOptions);
				break;
			case "creative":
				htmlContent = generateCreativeHTML(reportData, exportOptions);
				break;
			default:
				// Fallback to a default format if an invalid one is somehow selected
				htmlContent = generateProfessionalHTML(reportData, exportOptions);
				break;
		}

		// Generate filename
		const fileName = generateFileName(user.name, startDate, endDate, exportOptions.outputFormat);

		// Save the document
		let filePath: string;
		if (exportOptions.outputFormat === "pdf") {
			filePath = await savePDFToDevice(htmlContent, fileName);
		} else {
			filePath = await saveWordToDevice(reportData, exportOptions, fileName);
		}

		console.log(`Report generated successfully: ${filePath}`);

		// Optionally share the file
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(filePath, {
				mimeType: exportOptions.outputFormat === "pdf" ? "application/pdf" : "application/msword",
				dialogTitle: "Share Report",
			});
		}

		return {
			success: true,
			filePath,
			fileName,
		};
	} catch (error) {
		console.error("Error generating report:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

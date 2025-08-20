export const workLog = [
	{
		RawDate: {
			date: "07.07.2025", // Mon
			time_in: "06.30",
			time_out: "14.30",
		},
		Activity: [
			{
				content: "Reported to station, orientation and team instructions",
				time_start: "07.00",
				time_end: "14.30",
			},
		],
	},
	{
		RawDate: {
			date: "08.07.2025", // Tue
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "Reported to studio control room", time_start: "07.00" },
			{ content: "Got initial exposure to control room software like Black magic ATEM and Vmix" },
		],
	},
	{
		RawDate: {
			date: "09.07.2025", // Wed
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [{ content: "Assisated in setting up editing software on a new computer" }],
	},
	{
		RawDate: {
			date: "10.07.2025", // Thu
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "learnt how to use insta playout to set up program lineups", time_start: "07.00", time_end: "10:30" },
			{ content: "Assisted in switching between programs" },
		],
	},
	{
		RawDate: {
			date: "11.07.2025", // Fri
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [
			{ content: "interacted with the editing software Adobe Premiere pro and Adobe Photoshop" },
			{ content: "Assisted edditors to create a news banner" },
		],
	},
	{
		RawDate: {
			date: "14.07.2025", // Mon
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "Assited in setting up Davinci Resolve on computers", time_start: "07.00", time_end: "10:30" },
			{ content: "Assisted in switching between programs" },
		],
	},
	{
		RawDate: {
			date: "15.07.2025", // Tue
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "Diagnosed ethernet connection issues in the editing room" },
			{ content: "Checked internet connection to various computers" },
		],
	},
	{
		RawDate: {
			date: "16.07.2025", // Wed
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [
			{ content: "rewired ethernet connecctions tp the common switcher" },
			{ content: "Did cable management to reduce the ethernet cable" },
		],
	},
	{
		RawDate: {
			date: "17.07.2025", // Thu
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "Assisted in upgrading computers in the editorial room" },
			{ content: "Assisted with RAM and GPU updates to slower computers in the editorial room" },
		],
	},
	{
		RawDate: {
			date: "18.07.2025", // Fri
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [
			{ content: "participated in finding and replacing faulty hard disks un unused computers to have them back operational" },
			{ content: "learnt how to handle inner components of computers" },
		],
	},
	{
		RawDate: {
			date: "21.07.2025", // Mon
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "Tested upgraded computers and set them up for use by the editing teams" },
			{ content: "Assisted with RAM and GPU updates to slower computers in the editorial room" },
		],
	},
	{
		RawDate: {
			date: "22.07.2025", // Tue
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [{ content: "Swapped problematic monitors in the editing room" }, { content: "Replaced problematic VGA cables" }],
	},
	{
		RawDate: {
			date: "23.07.2025", // Wed
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [
			{ content: "Installed and configured fortware on upgraded machines" },
			{ content: "Worked on ad hock IT support tasks" },
			{ content: "Fixed minor ethernet issues" },
		],
	},
	{
		RawDate: {
			date: "24.07.2025", // Thu
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [{ content: "Performed ad hock IT support tasks" }, { content: "Observed programmed and show editing in the editors' room" }],
	},
	{
		RawDate: {
			date: "25.07.2025", // Fri
			time_in: "07.30",
			time_out: "14.30",
		},
		Activity: [{ content: "Ibegan assessing an unsupported graphics issue on one of the restored computers" }],
	},
	{
		RawDate: {
			date: "28.07.2025", // Mon
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{
				content: "Installed a supported OS on the computer as its drivers were not supporting its older hardware for newer operating systems",
			},
			{ content: "Observed programmed and show editing in the editors' room" },
		],
	},
	{
		RawDate: {
			date: "29.07.2025", // Tue
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [{ content: "Set up editing software on the fixed computer for use" }],
	},
	{
		RawDate: {
			date: "30.07.2025", // Wed
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "The radio's streaming PC bootup kept failing, I began assessment" },
			{ content: "I attempted a safeboot and using the terminal to get it to start before a show. However, the bootup files were corrupt" },
		],
	},
	{
		RawDate: {
			date: "31.07.2025", // Thu
			time_in: "14.30",
			time_out: "18.30",
		},
		Activity: [
			{ content: "I identified the problem to be very corrupt windows bootup files, probably caused by its loose hard disk issue" },
			{ content: "I backed up key program recordings for disk C wipe" },
		],
		SpecialActivity: [{ content: "visited the TV room to learn about light placements and how to set up cameras" }],
	},
	{
		RawDate: {
			date: "01.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Completed implementation of the Export VM to handle data formatting for different export types.",
			},
			{
				content: "Wrote unit tests for Export VM to ensure data is correctly prepared for CSV and PDF output.",
			},
		],
		SpecialActivity: [
			{
				content: "Participated in a brief team code review session to get feedback on the data export logic.",
			},
		],
	},
	{
		RawDate: {
			date: "02.08.2025",
			time_in: "09.00",
			time_out: "15.00",
		},
		Activity: [
			{
				content: "Worked on the 'Export Wizard Screen', building the user interface to allow users to select export formats (e.g., PDF, CSV, Word).",
			},
			{
				content: "Integrated the UI with the Export VM to trigger the export function.",
			},
		],
	},
	{
		RawDate: {
			date: "03.08.2025",
			time_in: "09.00",
			time_out: "12.00",
		},
		Activity: [
			{
				content: "Continued work on the 'Export Wizard Screen', adding progress indicators and success/error messages.",
			},
		],
	},
	{
		RawDate: {
			date: "04.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Finished the 'Export Wizard Screen' and performed initial manual testing.",
			},
			{
				content: "Began creating the Account Screen and its corresponding 'Account VM' to manage user profile data.",
			},
		],
	},
	{
		RawDate: {
			date: "05.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Developed UI components for the Settings Screen, including toggles for notifications, theme preferences, and data privacy options.",
			},
		],
	},
	{
		RawDate: {
			date: "06.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Connected the 'Settings Screen' components to the 'User Context' and 'Theming' system to make preferences persistent.",
			},
		],
	},
	{
		RawDate: {
			date: "07.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Built the UI for the 'Account Screen', including fields for user name, email, and password changes.",
			},
			{
				content: "Integrated the screen with the 'User Onboard VM' to allow for profile updates.",
			},
		],
	},
	{
		RawDate: {
			date: "08.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Finalized the 'Account Screen' and its functionalities.",
			},
			{
				content: "Conducted a full-feature test run of the application, from onboarding to daily logging and exporting.",
			},
		],
	},
	{
		RawDate: {
			date: "09.08.2025",
			time_in: "09.00",
			time_out: "14.00",
		},
		Activity: [
			{
				content: "Reviewed the entire codebase for consistency and removed unused dependencies.",
			},
			{
				content: "Prepared the application for a preliminary beta test.",
			},
		],
	},
	{
		RawDate: {
			date: "10.08.2025",
			time_in: "10.00",
			time_out: "14.00",
		},
		Activity: [
			{
				content: "Began investigation into the issue of deleting a recorded day. Identified that the UI deletes the activities but the data remains, leading to a 'ghost' day.",
			},
		],
	},
	{
		RawDate: {
			date: "11.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Implemented a new function within the 'DB Delete Service' to explicitly remove a day entry when all activities are deleted.",
			},
			{
				content: "Wrote a new 'Delete Day' method in the 'Home VM' and connected it to the 'Home Screen' UI.",
			},
		],
	},
	{
		RawDate: {
			date: "12.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Resolved the unsafe area view issue on the Account page. Wrapped the main view in 'SafeAreaView' to prevent content from overlapping with the phone's notification drawer.",
			},
		],
	},
	{
		RawDate: {
			date: "13.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Debugged the 'frozen application on second export' bug. Identified a state management issue where the export flag was not being reset properly.",
			},
			{
				content: "Fixed the bug by resetting the export state in the 'Export VM' after the export process is complete.",
			},
		],
	},
	{
		RawDate: {
			date: "14.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Addressed the export formatting issue where excluded sections caused large gaps in the final document.",
			},
			{
				content: "Refactored the export logic to dynamically adjust the document structure based on the user's exclusion settings.",
			},
		],
	},
	{
		RawDate: {
			date: "15.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Investigated the 'exporting as Word breaks the application' bug. Found an incompatibility with the third-party library used for Word export.",
			},
		],
	},
	{
		RawDate: {
			date: "16.08.2025",
			time_in: "09.00",
			time_out: "15.00",
		},
		Activity: [
			{
				content: "Switched from the faulty Word export library to a new one. Integrated the new library and tested the Word export feature.",
			},
		],
	},
	{
		RawDate: {
			date: "17.08.2025",
			time_in: "10.00",
			time_out: "14.00",
		},
		Activity: [
			{
				content: "Implemented a user feedback system where users can submit bug reports or feature requests directly from the app.",
			},
		],
	},
	{
		RawDate: {
			date: "18.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Improved the UI of the Calendar Screen to provide better visual feedback for days with recorded activities. Added a dot indicator under the date.",
			},
		],
	},
	{
		RawDate: {
			date: "19.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Optimized the performance of the Home Screen by lazy-loading activity blocks to reduce initial render time for users with many entries.",
			},
		],
	},
	{
		RawDate: {
			date: "20.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Wrote and updated documentation for all new features and bug fixes.",
			},
		],
	},
	{
		RawDate: {
			date: "21.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Performed final end-to-end testing on both iOS and Android devices to ensure cross-platform compatibility.",
			},
			{
				content: "Resolved minor styling inconsistencies found during testing.",
			},
		],
	},
	{
		RawDate: {
			date: "22.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Prepared the app for public release on app stores, including generating app icons and splash screens.",
			},
			{
				content: "Created a final changelog summarizing all the updates and fixes.",
			},
		],
	},
	{
		RawDate: {
			date: "23.08.2025",
			time_in: "09.00",
			time_out: "13.00",
		},
		Activity: [
			{
				content: "Submitted the application to the App Store and Google Play Store for review.",
			},
			{
				content: "Celebrated a successful project completion!",
			},
		],
	},
	{
		RawDate: {
			date: "24.08.2025",
			time_in: "10.00",
			time_out: "14.00",
		},
		Activity: [
			{
				content: "Began monitoring app store analytics and crash reports to identify any immediate post-launch issues.",
			},
		],
	},
	{
		RawDate: {
			date: "25.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Responded to early user feedback and bug reports.",
			},
			{
				content: "Planned the features for the next major version (v1.1) of the application, focusing on user-requested improvements.",
			},
		],
	},
	{
		RawDate: {
			date: "26.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Started wireframing and prototyping the new features for v1.1, such as adding tags to activities and more robust search functionality.",
			},
		],
	},
	{
		RawDate: {
			date: "27.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Began designing the database schema changes required for the upcoming features.",
			},
			{
				content: "Set up a new branch in the codebase for v1.1 development.",
			},
		],
	},
	{
		RawDate: {
			date: "28.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Researched third-party services for in-app purchases and subscriptions, as a potential monetization strategy for future versions.",
			},
		],
	},
	{
		RawDate: {
			date: "29.08.2025",
			time_in: "08.00",
			time_out: "17.00",
		},
		Activity: [
			{
				content: "Continued work on the initial codebase for the new tagging feature, starting with the 'Data Models' and 'DB Create Service'.",
			},
		],
	},
	{
		RawDate: {
			date: "30.08.2025",
			time_in: "09.00",
			time_out: "15.00",
		},
		Activity: [
			{
				content: "Continued development on the v1.1 features, focusing on the backend logic and data management.",
			},
		],
	},
	{
		RawDate: {
			date: "31.08.2025",
			time_in: "10.00",
			time_out: "14.00",
		},
		Activity: [
			{
				content: "Reviewed the week's progress and created a to-do list for September's development sprint.",
			},
		],
	},
];

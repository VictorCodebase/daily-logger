# Daily Logger: A Comprehensive Project Plan (Revised)

### 1. Project Overview

The Daily Logger app is designed to streamline the monthly reporting process for employees. By providing an intuitive interface for logging daily activities, the application aims to simplify the creation of detailed and organized work reports. The core functionality revolves around a structured workflow: logging daily activities on a home screen, reviewing and editing them via a calendar, and finally, compiling and exporting a professional report.

The app's design will be guided by the **OneUI design pattern** to ensure a clean and consistent user experience, as depicted in your sketches.

***

### 2. Technical Stack and Architecture

The application will be built using **React Native** and **TypeScript**, a popular framework for creating cross-platform mobile apps. This choice ensures the app can be deployed on both Android and iOS from a single codebase while providing the benefits of static typing for improved code quality and maintainability.

* **Database**: The local data storage will be handled by **Expo-SQLite**. This database is ideal for a single-user application that requires data persistence without an internet connection.
* **Architecture**: The app will follow the **MVVM (Model-View-ViewModel)** architectural pattern. This separation of concerns will make the code more organized, maintainable, and easier to test.
* **State Management**: The application will maintain a user-independent state. All data will be stored locally in the SQLite database, meaning the application's functionality and content are self-contained and do not rely on a user's ID as a foreign key for most daily operations.

***

### 3. Database Design

Based on your refined analysis, the database will now use a multi-table approach. This design provides stronger data integrity by dedicating a table to each distinct content type.

* **User Table**: Stores user profile information.
    * `user_id`: Primary key.
    * `name`: TEXT (required).
    * `email`: TEXT (required, unique).
    * `password_hash`: TEXT (required) - *Passwords will be hashed for security.*
    * `path_to_icon`: TEXT.
    * `roles_positions`: TEXT.
    * `work_schedule`: TEXT (stored as a JSON string for flexibility).

* **Day Table**: Serves as the central hub for each day's log.
    * `day_id`: Primary key.
    * `date`: TEXT (required, unique, e.g., 'YYYY-MM-DD').
    * `time_in`: TEXT (e.g., 'HH:MM:SS').
    * `time_out`: TEXT (e.g., 'HH:MM:SS').

* **Activity Table**: Stores regular daily activities.
    * `activity_id`: Primary key.
    * `content`: TEXT (required).
    * `time_start`: TEXT.
    * `time_end`: TEXT.
    * `category`: TEXT.
    * `day_id`: FOREIGN KEY linking to the `Day` table.

* **Special Activity Table**: Stores special, one-off activities.
    * `sp_activity_id`: Primary key.
    * `content`: TEXT (required).
    * `time_start`: TEXT.
    * `time_end`: TEXT.
    * `category`: TEXT.
    * `day_id`: FOREIGN KEY linking to the `Day` table.

* **Responsibilities Summary Table**: Stores the summary of responsibilities, which are tied to a user rather than a specific day.
    * `responsibilities_id`: Primary key.
    * `content`: TEXT (required).
    * `user_id`: FOREIGN KEY linking to the `User` table.

* **Log Template Table**: Stores reusable templates for daily logs.
    * `log_template_id`: Primary key.
    * `name`: TEXT (required).
    * `description`: TEXT.
    * `color_code`: TEXT (e.g., a hex code).
    * `content_json`: TEXT (stored as a JSON string representing the activities).
    * `date_created`: TEXT (e.g., 'YYYY-MM-DD').

* **Export Template Table**: Stores templates for generating reports.
    * `export_template_id`: Primary key.
    * `name`: TEXT (required).
    * `description`: TEXT.
    * `color_code`: TEXT (e.g., a hex code).
    * `content_json`: TEXT (stored as a JSON string).
    * `date_created`: TEXT (e.g., 'YYYY-MM-DD').

***

### 4. User Flow and Application Features

#### Onboarding
The onboarding wizard is the first screen a new user sees. Its purpose is to gather essential information and create the initial **User** object. After this one-time process, the user will be directed to the home page on subsequent launches. This screen ensures the application context has all the necessary user details from the beginning.

#### Home Page
This is the main entry point for daily logging. The user will:
1. Enter the start and end times for their workday.
2. Add individual activities (which are saved to the `Activity` table) and special activities (which are saved to the `Special_Activity` table).
3. Use a **Preview** button to see how the day's log will look when exported.
4. Choose to **Save** the log, which creates a new `Day` object and associated activity objects.
5. Alternatively, they can select **"Save as Template"**. This saves the log and then opens a modal for creating a new reusable `log_template` based on the day's entries. The `content_json` field of the template will capture all the details of the day's activities.

#### Calendar
After saving a log, the user is taken to the calendar. This screen provides a visual overview of all days.
* **Color-Coding**: Days with an associated log will be highlighted (e.g., a green blob), while days with no entry will be marked differently (e.g., a grey blob). This provides a quick visual status of the user's progress.
* **Day Details**: Tapping on a specific day will open a modal that displays the existing log. This allows the user to easily modify or add new activities for past days.

#### Export Wizard
The final stage of the workflow. The user will:
1. Select a date range for their report using a calendar view with checkboxes.
2. Proceed to a new screen where they can add optional information, such as a **summary of responsibilities** (which will be saved to the `Responsibilities_Summary` table).
3. The final report can then be exported in a professional format, such as `.docx` or `.pdf`.

***

### 5. Folder Structure

Here is a suggested folder structure for your Daily Logger app, designed to align with the **MVVM (Model-View-ViewModel)** architecture and best practices for React Native and Expo.

#### Project Structure Overview
daily-logger/  
├── assets/  
├── components/  
├── navigation/  
├── screens/  
├── services/  
├── stores/  
├── utils/  
├── App.tsx  
├── app.json  
├── package.json  
└── ...  
  
#### Directory Breakdown

**`assets/`**
This directory holds all static assets for the application, such as images, fonts, and icons.
* `assets/images/`
* `assets/fonts/`
* `assets/icons/`

**`components/`**
This is for all reusable UI components. These are "dumb" components that don't contain business logic and receive data and functions via props. This helps you build a consistent and scalable UI.
* `components/common/` (for small, generic components like `Button.tsx`, `Header.tsx`)
* `components/templates/` (for larger, more complex components like `DayCard.tsx`, `ActivityForm.tsx`)

**`navigation/`**
This directory contains all the code related to your app's navigation stacks and routing.
* `navigation/AppNavigator.tsx` (the main navigator)
* `navigation/HomeStack.tsx` (if you have a separate stack for the home screen)

**`screens/`**
These are the main pages of your app. They are the **Views** in the MVVM pattern. They are responsible for rendering the UI and binding data from the **ViewModel** (the `stores`).
* `screens/HomeScreen.tsx`
* `screens/CalendarScreen.tsx`
* `screens/ExportWizardScreen.tsx`
* `screens/OnboardingScreen.tsx`

**`services/`**
This is the **Model** layer of your MVVM architecture. It handles data access, business logic, and communication with external systems (like the SQLite database).
* `services/databaseService.ts` (Core logic for interacting with SQLite)
* `services/authService.ts` (For user authentication and storage)

**`stores/`**
This is the **ViewModel** layer. Each screen will have a corresponding store that manages its state and business logic. The stores fetch data from the `services` and expose state and methods that the `screens` can use.
* `stores/HomeScreenStore.ts` (or `HomeViewModel.ts`)
* `stores/CalendarScreenStore.ts`
* `stores/ExportWizardStore.ts`

**`utils/`**
This directory is for miscellaneous helper functions that are used throughout the application.
* `utils/dateUtils.ts` (for date formatting and parsing)
* `utils/validationUtils.ts` (for validating forms)

**`App.tsx`**
This is the entry point of your application. It usually sets up the app-wide context, initializes the database, and renders the main navigation stack.

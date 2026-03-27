# Unified Registration Form (Wolt, Bolt, Foodora)

This project is a unified registration form built with **Svelte 5** and **Vite**. It is designed to be embedded into Webflow websites for multiple platforms: **Wolt**, **Bolt**, and **Foodora**.

## Architecture & Integration

This is a **client-side application** that compiles into a single JavaScript file.

1.  **Build**: Vite compiles the Svelte application into a single JS bundle.
2.  **Hosting**: The build artifacts are hosted on **GitHub Pages**.
3.  **Integration**: The hosted JavaScript file is imported into various Webflow websites via a `<script>` tag.
4.  **Mounting**: The script automatically mounts the application to a `div` with the ID `app` (`<div id="app"></div>`).

### GitHub Actions
A workflow (`.github/workflows/static.yml`) handles the deployment:
-   Installs dependencies (`pnpm`).
-   Builds the project (`pnpm build`).
-   Deploys the `dist` folder to GitHub Pages.

## Design Pattern

The application logic is centralized in the **State** using Svelte 5's runes.

-   **State Management**: `RegistrationState.svelte.ts` holds the entire form state, validation logic, and submission handlers.
-   **Components**: Purely presentational, they consume the state and render the UI.
-   **No Backend**: There is no dedicated backend service in this repository; it communicates directly with external endpoints defined in `endpoints.ts`.

## Form Structure

The registration process is divided into two distinct phases:

### Phase 1: Initial Registration
This phase collects the primary user information across 4 steps:
-   **Step 1**: Personal Information (Name, Contact, etc.)
-   **Step 2**: Address (Integrated with Foxentry for validation)
-   **Step 3**: Citizenship & Documents
-   **Step 4**: Payment Details

Upon completion, the data is submitted to the `PHASE1_ENDPOINT`.

### Phase 2: Final Details
This phase is for collecting additional details after the initial registration is processed. It is a single-step form that submits to `PHASE2_ENDPOINT`.

## Internationalization (i18n)

The project uses a lightweight, custom i18n solution located in `src/lib/i18n/i18n.svelte.ts`.

-   **Dictionary**: Translations are stored in a `dict` object (currently `cs` and `en`).
-   **Usage**: `t('key')` retrieves translations, falling back to Czech (`cs`).

## Usage & Configuration

The application adapts its behavior and branding based on the context in which it runs.

### Platform Detection
The form detects which platform (Wolt, Bolt, Foodora) it is running for based on the **domain** or **URL parameters**.

### Phase 2 Activation
Phase 2 is activated via URL parameters, allowing pre-filling of user data.

**Required URL Pattern:**
`/?phase=2&country=[countryCode]&userId=[userId]`

-   **`phase=2`**: Activates Phase 2 mode.
-   **`country=[countryCode]`**: Pre-selects the country (e.g., `CZ`). If missing, the user is prompted to select it.
-   **`userId=[userId]`**: Unique identifier linking the submission to the user's record. **Required** for traceability.

**Example:**
`https://your-webflow-site.com/?phase=2&country=CZ&userId=12345-abcde`

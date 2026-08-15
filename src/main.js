// ============================================================
// MY LIMITS - MAIN APP
// ============================================================
//
// Includes:
//
// 1. Calendar
// 2. Monthly / weekly limits
// 3. Records
// 4. Violations
// 5. Next-period deductions
// 6. Punishments
// 7. History
// 8. Smart notifications
// 9. PWA service worker
// 10. App Lock
// 11. PIN security
// 12. Biometric availability detection
//
// ============================================================


import {
    openDatabase,
    putData,
    getAllData,
    getData,
    deleteData
} from "./db/database.js";


import {
    createCalendar,
    changeCalendarMonth
} from "./calendar/calendar.js";


import {
    initializeLimitManagement
} from "./limits/limits.js";


import {
    checkRecord,
    getUsage,
    recordViolation,
    applyDeduction,
    assignPunishment,
    completePunishment,
    getPendingPunishments
} from "./rules/rules.js";


// ============================================================
// OPTIONAL SMART NOTIFICATIONS
// ============================================================
//
// If the notifications module exists, use it.
// Otherwise the rest of the application continues normally.
//

let checkSmartNotifications = null;

try {

    const notificationModule =
        await import("./notifications/notifications.js");

    if (
        typeof notificationModule.checkSmartNotifications ===
        "function"
    ) {

        checkSmartNotifications =
            notificationModule.checkSmartNotifications;

    }

}
catch (error) {

    console.warn(
        "Smart notifications module not available.",
        error
    );

}


// ============================================================
// APP STATE
// ============================================================

let currentMonth =
    new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );


let referenceDate =
    new Date(
        currentMonth
    );


let selectedDate =
    null;


// ============================================================
// SECURITY STATE
// ============================================================

let securitySettings = {
    enabled: false,
    method: "pin",
    pinHash: null,
    biometricCredential: null
};

let securitySettingsLoaded = false;
let appIsLocked = false;


// ============================================================
// START APP
// ============================================================

async function startApp() {

    try {

        await openDatabase();

        // Personal greeting / identity.
        await setupPersonalGreeting();


        // ----------------------------------------------------
        // SECURITY MUST BE CHECKED EARLY
        // ----------------------------------------------------

        await loadSecuritySettings();


        // ----------------------------------------------------
        // SERVICE WORKER
        // ----------------------------------------------------

        await registerServiceWorker();


        // ----------------------------------------------------
        // NORMAL APP SETUP
        // ----------------------------------------------------

        setupNavigation();


        initializeLimitManagement(
            refreshApp
        );


        setupDateModal();


        setupHistory();


        setupSecurity();


        // ----------------------------------------------------
        // SETTINGS FEATURES
        // ----------------------------------------------------

        setupSettingsMenu();
        await loadAppearanceSettings();


        // Setup the PIN unlock button / Enter-key handler.
        // This must be registered before the lock screen is shown.
        setupAppLockUnlock();


        // Show App Lock before rendering interactive app data.
        if (securitySettings.enabled) {
            showAppLock();
        }


        await refreshApp();


        // ----------------------------------------------------
        // SMART NOTIFICATIONS
        // ----------------------------------------------------

        if (
            checkSmartNotifications &&
            await notificationsAreEnabled()
        ) {

            try {

                await checkSmartNotifications(
                    getUsage
                );

            }

            catch (error) {

                console.warn(
                    "Smart notification check failed:",
                    error
                );

            }

        }


        console.log(
            "✅ My Limits started successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ App startup error:",
            error
        );


        document.body.innerHTML = `

            <div style="
                padding:30px;
                font-family:Arial,sans-serif;
            ">

                <h2>
                    ❌ My Limits Error
                </h2>

                <pre style="
                    white-space:pre-wrap;
                ">${escapeHtml(
                    error?.stack ||
                    error?.message ||
                    String(error)
                )}</pre>

            </div>

        `;

    }

}


// ============================================================
// PERSONAL GREETING / IDENTITY
// ============================================================

async function setupPersonalGreeting() {

    const greeting = document.getElementById("appGreeting");

    if (!greeting) {
        return;
    }

    let name = "";

    try {
        const saved = await getSettingValue(
            SETTINGS_KEYS.personal,
            { name: "" }
        );

        name = saved?.name?.trim() || "Bramhani";
    }
    catch {
        name = "Bramhani";
    }

    const hour = new Date().getHours();

    let partOfDay = "Welcome back";

    if (hour >= 5 && hour < 12) {
        partOfDay = "Good morning";
    }
    else if (hour >= 12 && hour < 17) {
        partOfDay = "Good afternoon";
    }
    else if (hour >= 17 && hour < 22) {
        partOfDay = "Good evening";
    }
    else {
        partOfDay = "Good night";
    }

    greeting.textContent = name
        ? `${partOfDay}, ${name}`
        : "Stay within your rules.";
}


// ============================================================
// SERVICE WORKER
// ============================================================

async function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        console.warn(
            "Service workers are not supported."
        );

        return;

    }


    try {

        const registration =
            await navigator.serviceWorker.register(
                "/sw.js",
            );


        console.log(
            "✅ Service worker registered:",
            registration.scope
        );

    }

    catch (error) {

        console.warn(
            "Service worker registration failed:",
            error
        );

    }

}



// ============================================================
// SETTINGS MENU
// ============================================================
//
// The top-right gear opens the main Settings menu.
// Limit management does not own settingsButton anymore.
//
// ============================================================

// ============================================================
// SETTINGS MENU
// ============================================================
//
// Main Settings screen.
// Each setting is kept separate so every feature can later
// have its own dedicated screen/modal.
//
// ============================================================

function setupSettingsMenu() {

    const settingsButton = document.getElementById("settingsButton");
    const settingsModal = document.getElementById("settingsModal");

    if (!settingsButton || !settingsModal) {
        console.warn("Settings UI not found.");
        return;
    }

    const closeButton = document.getElementById("closeSettingsButton");

    const openSettings = () => {
        if (appIsLocked) return;
        settingsModal.classList.remove("hidden");
    };

    const closeSettings = () => {
        settingsModal.classList.add("hidden");
    };

    settingsButton.addEventListener("click", openSettings);
    closeButton?.addEventListener("click", closeSettings);

    settingsModal.addEventListener("click", event => {
        if (event.target === settingsModal) {
            closeSettings();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            !settingsModal.classList.contains("hidden")
        ) {
            closeSettings();
        }
    });

    document
        .getElementById("personalSettingsButton")
        ?.addEventListener("click", openPersonalSettings);

    document
        .getElementById("appearanceSettingsButton")
        ?.addEventListener("click", openAppearanceSettings);

    document
        .getElementById("notificationSettingsButton")
        ?.addEventListener("click", openNotificationSettings);

    document
        .getElementById("dataSettingsButton")
        ?.addEventListener("click", openDataSettings);

    document
        .getElementById("aboutSettingsButton")
        ?.addEventListener("click", openAboutSettings);

}


// ============================================================
// SETTINGS FEATURE SCREENS
// ============================================================

const SETTINGS_KEYS = {
    personal: "personal",
    appearance: "appearance",
    notifications: "notifications"
};


async function getSettingValue(key, fallback = null) {

    try {
        const saved = await getData("settings", key);
        return saved?.value ?? fallback;
    }
    catch {
        return fallback;
    }

}


async function saveSettingValue(key, value) {

    await putData("settings", {
        key,
        value
    });

}


function closeMainSettings() {
    document
        .getElementById("settingsModal")
        ?.classList.add("hidden");
}


function createSettingsFeatureModal(id, title, subtitle, bodyHTML) {

    let modal = document.getElementById(id);

    if (!modal) {

        modal = document.createElement("div");
        modal.id = id;
        modal.className = "modal settings-feature-modal hidden";

        modal.innerHTML = `
            <div class="modal-card feature-modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">SETTINGS</span>
                        <h2>${escapeHtml(title)}</h2>
                    </div>

                    <button
                        class="close-button settings-feature-close"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    ${escapeHtml(subtitle)}
                </p>

                <div class="settings-feature-body"></div>

            </div>
        `;

        document.body.appendChild(modal);

        modal
            .querySelector(".settings-feature-close")
            ?.addEventListener("click", () => {
                modal.classList.add("hidden");
            });

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.add("hidden");
            }
        });
    }

    modal.querySelector(".settings-feature-body").innerHTML = bodyHTML;
    return modal;

}


// ============================================================
// PERSONAL
// ============================================================

async function openPersonalSettings() {

    if (appIsLocked) return;

    closeMainSettings();

    const saved = await getSettingValue(
        SETTINGS_KEYS.personal,
        { name: "", goal: "" }
    );

    const modal = createSettingsFeatureModal(
        "personalSettingsFeatureModal",
        "👤 Personal",
        "Your personal preferences for My Limits.",
        `
            <label class="form-label" for="personalNameInput">
                Your name
            </label>

            <input
                id="personalNameInput"
                class="form-input"
                type="text"
                maxlength="60"
                placeholder="Your name"
                autocomplete="name"
                value="${escapeHtml(saved?.name || "")}"
            >

            <label class="form-label" for="personalGoalInput">
                Personal goal
            </label>

            <textarea
                id="personalGoalInput"
                class="form-input settings-textarea"
                maxlength="300"
                placeholder="What do you want to stay consistent with?"
            >${escapeHtml(saved?.goal || "")}</textarea>

            <div class="settings-info-card">
                <span>🔒</span>
                <div>
                    <strong>Stored privately</strong>
                    <small>Your preferences are stored locally in this browser.</small>
                </div>
            </div>

            <button
                id="savePersonalSettingsButton"
                class="primary-button"
                type="button"
            >
                Save Personal Settings
            </button>
        `
    );

    modal.classList.remove("hidden");

    modal.querySelector("#savePersonalSettingsButton").onclick = async () => {

        const name = document
            .getElementById("personalNameInput")
            ?.value.trim() || "";

        const goal = document
            .getElementById("personalGoalInput")
            ?.value.trim() || "";

        await saveSettingValue(
            SETTINGS_KEYS.personal,
            { name, goal }
        );

        modal.classList.add("hidden");
        alert("✅ Personal settings saved.");

    };

}


// ============================================================
// APPEARANCE
// ============================================================

async function loadAppearanceSettings() {

    const saved = await getSettingValue(
        SETTINGS_KEYS.appearance,
        { theme: "light" }
    );

    applyTheme(saved?.theme || "light");

}


function applyTheme(theme) {

    const safeTheme = ["light", "warm", "dark"].includes(theme)
        ? theme
        : "light";

    if (safeTheme === "light") {
        document.documentElement.removeAttribute("data-theme");
    }
    else {
        document.documentElement.setAttribute(
            "data-theme",
            safeTheme
        );
    }

}


async function openAppearanceSettings() {

    if (appIsLocked) return;

    closeMainSettings();

    const saved = await getSettingValue(
        SETTINGS_KEYS.appearance,
        { theme: "light" }
    );

    let selectedTheme = saved?.theme || "light";

    const modal = createSettingsFeatureModal(
        "appearanceSettingsFeatureModal",
        "🎨 Appearance",
        "Choose the theme you want to use.",
        `
            <div class="theme-choice-grid">

                <button class="theme-choice" data-theme-choice="light" type="button">
                    <span class="theme-preview light-preview">☀️</span>
                    <strong>Light</strong>
                    <small>Clean & bright</small>
                </button>

                <button class="theme-choice" data-theme-choice="warm" type="button">
                    <span class="theme-preview warm-preview">🌤️</span>
                    <strong>Warm</strong>
                    <small>Soft & calm</small>
                </button>

                <button class="theme-choice" data-theme-choice="dark" type="button">
                    <span class="theme-preview dark-preview">🌙</span>
                    <strong>Dark</strong>
                    <small>Low light</small>
                </button>

            </div>

            <div class="settings-info-card">
                <span>💾</span>
                <div>
                    <strong>Saved automatically</strong>
                    <small>Your theme remains selected after reopening the app.</small>
                </div>
            </div>
        `
    );

    const updateThemeUI = () => {
        modal.querySelectorAll("[data-theme-choice]").forEach(button => {
            button.classList.toggle(
                "selected",
                button.dataset.themeChoice === selectedTheme
            );
        });
    };

    modal.querySelectorAll("[data-theme-choice]").forEach(button => {
        button.onclick = async () => {
            selectedTheme = button.dataset.themeChoice || "light";
            applyTheme(selectedTheme);
            await saveSettingValue(
                SETTINGS_KEYS.appearance,
                { theme: selectedTheme }
            );
            updateThemeUI();
        };
    });

    updateThemeUI();
    modal.classList.remove("hidden");

}


// ============================================================
// NOTIFICATIONS
// ============================================================

async function openNotificationSettings() {

    if (appIsLocked) return;

    closeMainSettings();

    const saved = await getSettingValue(
        SETTINGS_KEYS.notifications,
        { enabled: false }
    );

    let enabled = saved?.enabled === true;

    const modal = createSettingsFeatureModal(
        "notificationSettingsFeatureModal",
        "🔔 Notifications",
        "Choose whether My Limits can show reminder notifications.",
        `
            <div class="settings-toggle-row">
                <div>
                    <strong>Reminder notifications</strong>
                    <small>Enable smart reminder checks when the app starts.</small>
                </div>

                <label class="switch">
                    <input id="globalNotificationToggle" type="checkbox" ${enabled ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </div>

            <div class="settings-info-card">
                <span>🔔</span>
                <div>
                    <strong>Browser permission</strong>
                    <small id="notificationPermissionText"></small>
                </div>
            </div>

            <button
                id="requestNotificationPermissionButton"
                class="secondary-button"
                type="button"
            >
                Allow Browser Notifications
            </button>

            <button
                id="saveNotificationSettingsButton"
                class="primary-button"
                type="button"
            >
                Save Notification Settings
            </button>
        `
    );

    const toggle = modal.querySelector("#globalNotificationToggle");
    const permissionText = modal.querySelector("#notificationPermissionText");
    const permissionButton = modal.querySelector(
        "#requestNotificationPermissionButton"
    );

    const renderPermission = () => {

        const state = "Notification" in window
            ? Notification.permission
            : "unsupported";

        if (permissionText) {
            permissionText.textContent =
                state === "granted"
                    ? "Granted — browser notifications are allowed."
                    : state === "denied"
                        ? "Blocked — allow notifications in browser settings."
                        : state === "default"
                            ? "Not decided yet."
                            : "Notifications are not supported by this browser.";
        }

        if (permissionButton) {
            permissionButton.disabled =
                state === "granted" || state === "unsupported";
        }

    };

    permissionButton.onclick = async () => {

        if (!("Notification" in window)) {
            alert("This browser does not support notifications.");
            return;
        }

        try {
            const result = await Notification.requestPermission();

            renderPermission();

            if (result === "granted") {
                enabled = true;
                toggle.checked = true;
            }
        }
        catch (error) {
            console.warn("Notification permission request failed:", error);
        }

    };

    toggle.onchange = () => {
        enabled = toggle.checked;
    };

    modal.querySelector("#saveNotificationSettingsButton").onclick = async () => {

        await saveSettingValue(
            SETTINGS_KEYS.notifications,
            { enabled }
        );

        modal.classList.add("hidden");
        alert("✅ Notification settings saved.");

    };

    renderPermission();
    modal.classList.remove("hidden");

}


async function notificationsAreEnabled() {

    const saved = await getSettingValue(
        SETTINGS_KEYS.notifications,
        { enabled: false }
    );

    return saved?.enabled === true;

}


// ============================================================
// DATA & PRIVACY
// ============================================================

const APP_DATA_STORES = [
    "limits",
    "records",
    "violations",
    "punishments",
    "settings"
];


async function collectAppData() {

    const backup = {
        app: "My Limits",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        data: {}
    };

    for (const store of APP_DATA_STORES) {
        try {
            backup.data[store] = await getAllData(store);
        }
        catch {
            backup.data[store] = [];
        }
    }

    return backup;

}


async function clearAllAppData() {

    for (const store of APP_DATA_STORES) {

        let items;

        try {
            items = await getAllData(store);
        }
        catch {
            continue;
        }

        for (const item of items) {

            const key = item?.id ?? item?.key;

            if (key == null) continue;

            try {
                await deleteData(store, key);
            }
            catch (error) {
                console.warn(`Could not delete ${store} item`, error);
            }
        }
    }

}


async function exportAppData() {

    try {

        const backup = await collectAppData();

        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `my-limits-backup-${formatDate(new Date())}.json`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);

    }
    catch (error) {
        console.error("Export failed:", error);
        alert("❌ Could not export your data.");
    }

}


async function restoreAppData(file) {

    try {

        const backup = JSON.parse(
            await file.text()
        );

        if (
            !backup ||
            backup.app !== "My Limits" ||
            !backup.data ||
            typeof backup.data !== "object"
        ) {
            throw new Error("Invalid My Limits backup file.");
        }

        const confirmed = window.confirm(
            "Restore this backup?\n\nYour current app data will be replaced."
        );

        if (!confirmed) return;

        await clearAllAppData();

        for (const store of APP_DATA_STORES) {

            const items = Array.isArray(backup.data[store])
                ? backup.data[store]
                : [];

            for (const item of items) {

                if (item?.id != null || item?.key != null) {
                    await putData(store, item);
                }

            }
        }

        await loadSecuritySettings();
        await loadAppearanceSettings();
        await refreshApp();

        alert("✅ Backup restored successfully.");

    }
    catch (error) {
        console.error("Restore failed:", error);
        alert(
            `❌ Restore failed.\n\n${error?.message || String(error)}`
        );
    }

}


async function openDataSettings() {

    if (appIsLocked) return;

    closeMainSettings();

    const modal = createSettingsFeatureModal(
        "dataSettingsFeatureModal",
        "💾 Data & Privacy",
        "Export, restore or clear your local My Limits data.",
        `
            <div class="data-action-card">
                <span class="data-action-icon">📤</span>
                <div class="data-action-copy">
                    <strong>Export backup</strong>
                    <small>Download limits, records, violations, punishments and settings as JSON.</small>
                </div>
                <button id="exportDataButton" class="secondary-button compact-button" type="button">Export</button>
            </div>

            <div class="data-action-card">
                <span class="data-action-icon">📥</span>
                <div class="data-action-copy">
                    <strong>Restore backup</strong>
                    <small>Restore a JSON backup created by My Limits.</small>
                </div>
                <button id="restoreDataButton" class="secondary-button compact-button" type="button">Restore</button>
            </div>

            <div class="settings-danger-card">
                <span class="data-action-icon">🗑️</span>
                <div>
                    <strong>Clear all app data</strong>
                    <small>Removes limits, records, consequences and saved settings from this browser.</small>
                </div>
                <button id="clearDataButton" class="danger-button compact-button" type="button">Clear</button>
            </div>

            <input
                id="restoreDataFileInput"
                type="file"
                accept="application/json,.json"
                hidden
            >
        `
    );

    modal.classList.remove("hidden");

    modal.querySelector("#exportDataButton").onclick = exportAppData;

    const fileInput = modal.querySelector("#restoreDataFileInput");

    modal.querySelector("#restoreDataButton").onclick = () => {
        fileInput?.click();
    };

    fileInput.onchange = async () => {

        const file = fileInput.files?.[0];

        if (!file) return;

        await restoreAppData(file);
        fileInput.value = "";

    };

    modal.querySelector("#clearDataButton").onclick = async () => {

        const first = window.confirm(
            "⚠️ Clear ALL My Limits data?\n\nThis includes limits, records, violations, punishments and settings."
        );

        if (!first) return;

        const second = window.confirm(
            "FINAL CONFIRMATION\n\nThis cannot be undone unless you have an exported backup.\n\nContinue?"
        );

        if (!second) return;

        await clearAllAppData();

        securitySettings = {
            enabled: false,
            method: "pin",
            pinHash: null,
            biometricCredential: null
        };

        applyTheme("light");
        modal.classList.add("hidden");

        await refreshApp();

        alert("✅ All My Limits data has been cleared.");

    };

}


// ============================================================
// ABOUT
// ============================================================

async function openAboutSettings() {

    if (appIsLocked) return;

    closeMainSettings();

    const modal = createSettingsFeatureModal(
        "aboutSettingsFeatureModal",
        "ℹ️ About My Limits",
        "Information about this app and how it handles your data.",
        `
            <div class="about-feature-card">

                <div class="about-logo">
                    <img
                        src="/icon-192.png"
                        alt="My Limits"
                    >
                </div>

                <h3 class="about-app-name">My Limits</h3>

                <p class="about-tagline">Your personal rules, made easier to follow.</p>

                <p class="about-personal-note">
                    Personalized for Bramhani.
                </p>

                <div class="about-info-list">
                    <div>
                        <span>Version</span>
                        <strong>1.0.0</strong>
                    </div>

                    <div>
                        <span>Storage</span>
                        <strong>Browser local storage</strong>
                    </div>

                    <div>
                        <span>Tracking</span>
                        <strong>Limits & history</strong>
                    </div>

                    <div>
                        <span>Security</span>
                        <strong>PIN / biometric App Lock</strong>
                    </div>
                </div>

                <p class="about-note">
                    My Limits is designed as a local-first personal tracking app. Use Data & Privacy whenever you want to export or restore a backup.
                </p>

            </div>
        `
    );

    modal.classList.remove("hidden");

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const previousButton =
        document.getElementById(
            "previousMonth"
        );


    const nextButton =
        document.getElementById(
            "nextMonth"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            async () => {

                if (appIsLocked) {
                    return;
                }


                currentMonth =
                    changeCalendarMonth(
                        currentMonth,
                        -1
                    );


                currentMonth =
                    new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1
                    );


                referenceDate =
                    new Date(
                        currentMonth
                    );


                selectedDate =
                    null;


                await refreshApp();

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            async () => {

                if (appIsLocked) {
                    return;
                }


                currentMonth =
                    changeCalendarMonth(
                        currentMonth,
                        1
                    );


                currentMonth =
                    new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1
                    );


                referenceDate =
                    new Date(
                        currentMonth
                    );


                selectedDate =
                    null;


                await refreshApp();

            }
        );

    }

}


// ============================================================
// REFRESH EVERYTHING
// ============================================================

async function refreshApp() {

    if (appIsLocked) {
        return;
    }


    const limits =
        await getAllData(
            "limits"
        );


    const records =
        await getAllData(
            "records"
        );


    // --------------------------------------------------------
    // CALENDAR
    // --------------------------------------------------------

    createCalendar({

        month:
            currentMonth,

        records,

        onDateClick:
            openDate

    });


    // --------------------------------------------------------
    // LIMIT SUMMARY
    // --------------------------------------------------------

    await renderSummary(
        limits
    );


    // --------------------------------------------------------
    // PENDING PUNISHMENTS
    // --------------------------------------------------------

    await renderPendingPunishments();


    // --------------------------------------------------------
    // SECURITY STATUS
    // --------------------------------------------------------

    updateSecurityStatusUI();

}


// ============================================================
// RENDER SUMMARY
// ============================================================

async function renderSummary(
    limits
) {

    const container =
        document.getElementById(
            "limitsSummary"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const activeLimits =
        limits.filter(
            limit =>
                limit.active === true
        );


    const monthName =
        currentMonth.toLocaleString(
            "en-IN",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "summary-period-title";


    heading.textContent =
        monthName;


    container.appendChild(
        heading
    );


    if (
        activeLimits.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-message";


        empty.innerHTML = `

            <p>
                No active limits yet.
            </p>

            <small>
                Add your first limit below.
            </small>

        `;


        container.appendChild(
            empty
        );


        return;

    }


    for (
        const limit
        of activeLimits
    ) {

        let usageDate;


        if (
            limit.period ===
            "weekly"
        ) {

            usageDate =
                referenceDate;

        }

        else {

            usageDate =
                currentMonth;

        }


        const usage =
            await getUsage(
                limit.id,
                usageDate
            );


        const used =
            Number(
                usage.used
            );


        const baseAllowed =
            Number(
                usage.baseAllowed
            );


        const deduction =
            Number(
                usage.deduction
            );


        const allowed =
            Number(
                usage.allowed
            );


        const remaining =
            Number(
                usage.remaining
            );


        const percentage =
            allowed > 0

                ? Math.min(
                    100,
                    (
                        used /
                        allowed
                    ) * 100
                )

                : 0;


        let periodLabel;


        if (
            limit.period ===
            "weekly"
        ) {

            periodLabel =
                `Week: ${formatShortDate(
                    usage.start
                )} – ${formatShortDate(
                    usage.end
                )}`;

        }

        else {

            periodLabel =
                monthName;

        }


        let limitInfo = "";


        if (
            deduction > 0
        ) {

            limitInfo = `

                <div class="deduction-info">

                    Base limit:
                    ${baseAllowed}

                    <br>

                    ⬇️ Previous violation:
                    -${deduction}

                    <br>

                    <strong>
                        Effective limit:
                        ${allowed}
                    </strong>

                </div>

            `;

        }


        let remainingText;


        if (
            remaining > 0
        ) {

            remainingText =
                `${remaining} remaining`;

        }

        else if (
            remaining === 0
        ) {

            remainingText =
                "Limit reached";

        }

        else {

            remainingText =
                `${Math.abs(
                    remaining
                )} over limit`;

        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "limit-card";


        card.innerHTML = `

            <div class="limit-row">

                <span class="limit-name">

                    ${escapeHtml(
                        limit.name
                    )}

                </span>


                <strong>

                    ${used} / ${allowed}

                </strong>

            </div>


            <div class="limit-period">

                ${periodLabel}

            </div>


            ${limitInfo}


            <div class="progress-background">

                <div
                    class="progress-fill"
                    style="
                        width:${percentage}%;
                    "
                ></div>

            </div>


            <div
                class="
                    remaining
                    ${
                        remaining < 0
                            ? "exceeded"
                            : ""
                    }
                "
            >

                ${remainingText}

            </div>

        `;


        container.appendChild(
            card
        );

    }

}


// ============================================================
// OPEN CALENDAR DATE
// ============================================================

async function openDate(
    date
) {

    if (appIsLocked) {
        return;
    }


    selectedDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    referenceDate =
        new Date(
            selectedDate
        );


    currentMonth =
        new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
        );


    const dateKey =
        formatDate(
            selectedDate
        );


    const limits =
        await getAllData(
            "limits"
        );


    const records =
        await getAllData(
            "records"
        );


    const dayRecords =
        records.filter(
            record =>
                record.date ===
                dateKey
        );


    const title =
        document.getElementById(
            "selectedDateTitle"
        );


    if (title) {

        title.textContent =
            formatReadableDate(
                selectedDate
            );

    }


    const container =
        document.getElementById(
            "dateItems"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // ========================================================
    // EXISTING RECORDS
    // ========================================================

    if (
        dayRecords.length > 0
    ) {

        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =
            "Recorded";


        heading.className =
            "modal-section-heading";


        container.appendChild(
            heading
        );


        for (
            const record
            of dayRecords
        ) {

            const limit =
                limits.find(
                    item =>
                        item.id ===
                        record.limitId
                );


            if (!limit) {
                continue;
            }


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "record-row";


            row.innerHTML = `

                <span>
                    ${escapeHtml(
                        limit.name
                    )}
                </span>

                <button
                    class="small-delete"
                    type="button"
                >
                    Remove
                </button>

            `;


            row
                .querySelector(
                    ".small-delete"
                )
                .addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            window.confirm(
                                `Remove ${limit.name} from this day?`
                            );


                        if (!confirmed) {
                            return;
                        }


                        await deleteData(
                            "records",
                            record.id
                        );


                        // -------------------------------------
                        // IMPORTANT:
                        //
                        // If this record created a violation,
                        // remove that violation too.
                        //
                        // This prevents deleted records from
                        // continuing to affect future
                        // deductions.
                        // -------------------------------------

                        let violations = [];


                        try {

                            violations =
                                await getAllData(
                                    "violations"
                                );

                        }

                        catch {

                            violations = [];

                        }


                        const relatedViolations =
                            violations.filter(
                                violation =>

                                    violation.limitId ===
                                        record.limitId &&

                                    violation.date ===
                                        record.date
                            );


                        for (
                            const violation
                            of relatedViolations
                        ) {

                            await deleteData(
                                "violations",
                                violation.id
                            );

                        }


                        await openDate(
                            selectedDate
                        );


                        await refreshApp();

                    }
                );


            container.appendChild(
                row
            );

        }

    }


    // ========================================================
    // ADD SOMETHING
    // ========================================================

    const addHeading =
        document.createElement(
            "h3"
        );


    addHeading.textContent =
        "Add something";


    addHeading.className =
        "modal-section-heading";


    container.appendChild(
        addHeading
    );


    const activeLimits =
        limits.filter(
            limit =>
                limit.active === true
        );


    if (
        activeLimits.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "history-empty";


        empty.textContent =
            "No active limits.";


        container.appendChild(
            empty
        );

    }


    for (
        const limit
        of activeLimits
    ) {

        const usage =
            await getUsage(
                limit.id,
                selectedDate
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "food-button";


        if (
            usage.used >=
            usage.allowed
        ) {

            button.innerHTML = `

                <span>
                    ${escapeHtml(
                        limit.name
                    )}
                </span>

                <small>
                    ${usage.used}/${usage.allowed}
                    · Limit reached
                </small>

            `;


            button.classList.add(
                "limit-reached-button"
            );

        }

        else {

            button.innerHTML = `

                <span>
                    ${escapeHtml(
                        limit.name
                    )}
                </span>

                <small>
                    ${usage.remaining}
                    remaining
                </small>

            `;

        }


        button.addEventListener(
            "click",
            async () => {

                await attemptAddRecord(
                    limit,
                    selectedDate
                );

            }
        );


        container.appendChild(
            button
        );

    }


    const modal =
        document.getElementById(
            "dateModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }


    await refreshApp();

}


// ============================================================
// ATTEMPT ADD RECORD
// ============================================================

async function attemptAddRecord(
    limit,
    date
) {

    if (appIsLocked) {
        return;
    }


    const result =
        await checkRecord(
            limit.id,
            date
        );


    // ========================================================
    // WITHIN LIMIT
    // ========================================================

    if (
        result.allowed
    ) {

        await saveRecord(
            limit,
            date
        );

        return;

    }


    // ========================================================
    // LIMIT REACHED
    // ========================================================

    if (
        result.needsConfirmation
    ) {

        const usage =
            result.usage;


        const continueAnyway =
            window.confirm(

                `⚠️ ${limit.name}\n\n` +

                `${usage.period} limit reached.\n\n` +

                `Used: ${
                    usage.used
                } / ${
                    usage.allowed
                }\n\n` +

                `Do you still want to record this?`

            );


        if (!continueAnyway) {
            return;
        }


        await saveRecord(
            limit,
            date
        );


        const violation =
            await recordViolation(
                limit.id,
                date
            );


        if (!violation) {
            return;
        }


        const chooseDeduction =
            window.confirm(

                `⚠️ Limit violation recorded.\n\n` +

                `Choose your consequence:\n\n` +

                `OK = Deduct 1 from your next ${
                    limit.period === "weekly"
                        ? "week"
                        : "month"
                }\n\n` +

                `Cancel = Give me a punishment`

            );


        if (
            chooseDeduction
        ) {

            await applyDeduction(
                violation.id
            );


            const nextPeriod =
                limit.period === "weekly"
                    ? "week"
                    : "month";


            alert(

                `⚠️ Consequence applied.\n\n` +

                `1 will be deducted from your next ${nextPeriod}.\n\n` +

                `Your current period remains unchanged.`

            );

        }

        else {

            const punishment =
                await assignPunishment(
                    violation.id
                );


            if (punishment) {

                alert(

                    `⚠️ Punishment assigned\n\n` +

                    `${punishment.punishmentTitle}\n\n` +

                    `${punishment.punishmentDescription}\n\n` +

                    `It will remain pending until you complete it.`

                );

            }

        }


        await openDate(
            date
        );


        await refreshApp();

    }

}


// ============================================================
// SAVE RECORD
// ============================================================

async function saveRecord(
    limit,
    date
) {

    const record = {

        id:
            "record-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2),

        limitId:
            limit.id,

        date:
            formatDate(
                date
            ),

        createdAt:
            new Date().toISOString()

    };


    await putData(
        "records",
        record
    );


    return record;

}


// ============================================================
// PENDING PUNISHMENTS
// ============================================================

async function renderPendingPunishments() {

    const section =
        document.getElementById(
            "consequenceSection"
        );


    const container =
        document.getElementById(
            "consequenceSummary"
        );


    if (
        !section ||
        !container
    ) {

        return;

    }


    const punishments =
        await getPendingPunishments();


    container.innerHTML = "";


    if (
        punishments.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        return;

    }


    section.classList.remove(
        "hidden"
    );


    const limits =
        await getAllData(
            "limits"
        );


    for (
        const punishment
        of punishments
    ) {

        const limit =
            limits.find(
                item =>
                    item.id ===
                    punishment.limitId
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "punishment-card";


        card.innerHTML = `

            <div class="punishment-title">

                ⚠️

                ${escapeHtml(
                    punishment.punishmentTitle
                )}

            </div>


            <div class="punishment-item">

                ${
                    limit
                        ? escapeHtml(
                            limit.name
                        )
                        : "Item"
                }

            </div>


            <div class="punishment-description">

                ${escapeHtml(
                    punishment.punishmentDescription
                )}

            </div>


            <div class="punishment-date">

                Violation:
                ${formatHistoryDate(
                    punishment.date
                )}

            </div>


            <button
                class="primary-button"
                type="button"
            >

                ✓ I completed it

            </button>

        `;


        const button =
            card.querySelector(
                "button"
            );


        button.addEventListener(
            "click",
            async () => {

                const confirmed =
                    window.confirm(

                        `Did you really complete this punishment?\n\n` +

                        `${punishment.punishmentTitle}`

                    );


                if (!confirmed) {
                    return;
                }


                await completePunishment(
                    punishment.id
                );


                await renderPendingPunishments();

            }
        );


        container.appendChild(
            card
        );

    }

}


// ============================================================
// DATE MODAL
// ============================================================

function setupDateModal() {

    const closeButton =
        document.getElementById(
            "closeDateModal"
        );


    const modal =
        document.getElementById(
            "dateModal"
        );


    if (
        closeButton &&
        modal
    ) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.add(
                    "hidden"
                );

            }
        );


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }

}


// ============================================================
// HISTORY
// ============================================================

function setupHistory() {

    const historyButton =
        document.getElementById(
            "historyButton"
        );


    const closeButton =
        document.getElementById(
            "closeHistoryModal"
        );


    const modal =
        document.getElementById(
            "historyModal"
        );


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            openHistory
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeHistory
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeHistory();

                }

            }
        );

    }

}


// ============================================================
// OPEN HISTORY
// ============================================================

async function openHistory() {

    if (appIsLocked) {
        return;
    }


    const limits =
        await getAllData(
            "limits"
        );


    const records =
        await getAllData(
            "records"
        );


    let violations = [];


    try {

        violations =
            await getAllData(
                "violations"
            );

    }

    catch {

        violations = [];

    }


    const container =
        document.getElementById(
            "historyContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        limits.length === 0
    ) {

        container.innerHTML = `

            <p class="history-empty">
                No history yet.
            </p>

        `;

    }


    for (
        const limit
        of limits
    ) {

        const limitRecords =
            records
                .filter(
                    record =>
                        record.limitId ===
                        limit.id
                )
                .sort(
                    (a, b) =>
                        b.date.localeCompare(
                            a.date
                        )
                );


        const limitViolations =
            violations.filter(
                violation =>
                    violation.limitId ===
                    limit.id
            );


        const section =
            document.createElement(
                "div"
            );


        section.className =
            "history-limit";


        const status =
            limit.active === true
                ? "Active"
                : "Stopped";


        section.innerHTML = `

            <div class="history-limit-title">

                <strong>
                    ${escapeHtml(
                        limit.name
                    )}
                </strong>

                <span>
                    ${status}
                </span>

            </div>


            <div class="history-stats">

                <span>
                    ${limitRecords.length}
                    records
                </span>

                <span>
                    ${limitViolations.length}
                    violations
                </span>

            </div>

        `;


        for (
            const record
            of limitRecords
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-record";


            row.textContent =
                formatHistoryDate(
                    record.date
                );


            section.appendChild(
                row
            );

        }


        for (
            const violation
            of limitViolations
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-violation";


            let consequenceText;


            if (
                violation.consequenceType ===
                "deduct"
            ) {

                consequenceText =
                    "⬇️ 1 deducted from next period";

            }

            else if (
                violation.consequenceType ===
                "punishment"
            ) {

                consequenceText =
                    violation.consequenceStatus ===
                    "completed"

                        ? "✓ Punishment completed"

                        : "⚠️ Punishment pending";

            }

            else {

                consequenceText =
                    "Consequence pending";

            }


            row.innerHTML = `

                <strong>
                    ⚠️ Violation
                </strong>

                <span>
                    ${formatHistoryDate(
                        violation.date
                    )}
                </span>

                <small>
                    ${consequenceText}
                </small>

            `;


            section.appendChild(
                row
            );

        }


        if (
            limitRecords.length === 0 &&
            limitViolations.length === 0
        ) {

            const empty =
                document.createElement(
                    "p"
                );


            empty.className =
                "history-empty";


            empty.textContent =
                "No records yet.";


            section.appendChild(
                empty
            );

        }


        container.appendChild(
            section
        );

    }


    const modal =
        document.getElementById(
            "historyModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// CLOSE HISTORY
// ============================================================

function closeHistory() {

    const modal =
        document.getElementById(
            "historyModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// ============================================================
// SECURITY SYSTEM
// ============================================================
//
// App Lock supports:
// - PIN protection
// - Device biometric / platform authentication via WebAuthn
// - Persistent settings in IndexedDB
// - Hashed PIN storage (never stores the PIN itself)
//
// The security UI is created here when it is not already present in
// index.html. This prevents the app from depending on missing modal
// elements and keeps the security feature functional.
//
// ============================================================

// ============================================================
// PIN HASH
// ============================================================

async function hashPin(pin) {

    const data = new TextEncoder().encode(pin);

    const buffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    return Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

}


// ============================================================
// LOAD SECURITY SETTINGS
// ============================================================

async function loadSecuritySettings() {

    try {

        const saved = await getData(
            "settings",
            "security"
        );

        if (saved?.value) {

            const value = saved.value;

            // ----------------------------------------------------
            // Migration from the older version which stored the PIN
            // directly in IndexedDB.
            // ----------------------------------------------------

            let pinHash = value.pinHash || null;

            if (!pinHash && value.pin) {

                try {
                    pinHash = await hashPin(value.pin);
                }
                catch {
                    pinHash = null;
                }

            }

            securitySettings = {
                enabled: value.enabled === true,
                method: value.method || "pin",
                pinHash,
                biometricCredential:
                    value.biometricCredential || null
            };

            // Remove the old plaintext PIN from storage.
            if (value.pin) {
                await saveSecuritySettings();
            }

        }

    }
    catch (error) {

        console.warn(
            "Could not load security settings:",
            error
        );

    }

    securitySettingsLoaded = true;

}


// ============================================================
// SAVE SECURITY SETTINGS
// ============================================================

async function saveSecuritySettings() {

    await putData(
        "settings",
        {
            key: "security",
            value: securitySettings
        }
    );

}


// ============================================================
// CREATE SECURITY MODALS IF MISSING
// ============================================================

function ensureSecurityModals() {

    if (!document.getElementById("securitySettingsModal")) {

        const modal = document.createElement("div");

        modal.id = "securitySettingsModal";
        modal.className = "modal hidden";

        modal.innerHTML = `
            <div class="modal-card security-modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">PRIVACY</span>
                        <h2>🔐 App Security</h2>
                    </div>

                    <button
                        id="closeSecuritySettingsButton"
                        class="close-button"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    Protect My Limits when you open it.
                </p>

                <div class="notification-option">
                    <div class="notification-copy">
                        <div class="notification-title">
                            App Lock
                        </div>
                        <p>
                            Ask for authentication when My Limits opens.
                        </p>
                    </div>

                    <label class="switch">
                        <input
                            id="appLockEnabledInput"
                            type="checkbox"
                        >
                        <span class="slider"></span>
                    </label>
                </div>

                <div id="securityMethodSection">

                    <label class="form-label">
                        Unlock method
                    </label>

                    <div class="security-method-options">

                        <button
                            id="pinMethodButton"
                            class="secondary-button security-method-button"
                            type="button"
                        >
                            🔢 PIN
                            <span id="pinMethodCheck">✓</span>
                        </button>

                        <button
                            id="biometricMethodButton"
                            class="secondary-button security-method-button"
                            type="button"
                        >
                            👆 Biometric
                            <span id="biometricMethodCheck" class="hidden">✓</span>
                        </button>

                    </div>

                    <p
                        id="biometricAvailabilityText"
                        class="form-hint"
                    ></p>

                    <p
                        id="biometricUnavailableText"
                        class="form-hint hidden"
                    >
                        Device biometric authentication is not available here.
                    </p>

                </div>

                <p
                    id="securitySetupMessage"
                    class="security-setup-message hidden"
                ></p>

                <button
                    id="saveSecurityButton"
                    class="primary-button"
                    type="button"
                >
                    Save Security Settings
                </button>

                <button
                    id="cancelSecurityButton"
                    class="secondary-button"
                    type="button"
                >
                    Cancel
                </button>

            </div>
        `;

        document.body.appendChild(modal);

    }


    if (!document.getElementById("pinSetupModal")) {

        const modal = document.createElement("div");

        modal.id = "pinSetupModal";
        modal.className = "modal hidden";

        modal.innerHTML = `
            <div class="modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">APP SECURITY</span>
                        <h2>🔢 Create your PIN</h2>
                    </div>

                    <button
                        id="closePinSetupButton"
                        class="close-button"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    Create a 4–6 digit PIN. You will need it whenever App Lock is active.
                </p>

                <label class="form-label" for="newPinInput">
                    New PIN
                </label>

                <input
                    id="newPinInput"
                    class="form-input"
                    type="password"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    autocomplete="new-password"
                    placeholder="Enter PIN"
                >

                <label class="form-label" for="confirmPinInput">
                    Confirm PIN
                </label>

                <input
                    id="confirmPinInput"
                    class="form-input"
                    type="password"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    autocomplete="new-password"
                    placeholder="Enter PIN again"
                >

                <p
                    id="pinSetupError"
                    class="app-lock-error"
                ></p>

                <button
                    id="savePinButton"
                    class="primary-button"
                    type="button"
                >
                    Save PIN & Enable Lock
                </button>

                <button
                    id="cancelPinSetupButton"
                    class="secondary-button"
                    type="button"
                >
                    Cancel
                </button>

            </div>
        `;

        document.body.appendChild(modal);

    }

}


// ============================================================
// SETUP SECURITY
// ============================================================

function setupSecurity() {

    ensureSecurityModals();

    const openButton = document.getElementById(
        "openSecuritySettingsButton"
    );

    const closeButton = document.getElementById(
        "closeSecuritySettingsButton"
    );

    const cancelButton = document.getElementById(
        "cancelSecurityButton"
    );

    const modal = document.getElementById(
        "securitySettingsModal"
    );

    const enabledInput = document.getElementById(
        "appLockEnabledInput"
    );

    const pinMethodButton = document.getElementById(
        "pinMethodButton"
    );

    const biometricMethodButton = document.getElementById(
        "biometricMethodButton"
    );

    const saveButton = document.getElementById(
        "saveSecurityButton"
    );

    const closePinButton = document.getElementById(
        "closePinSetupButton"
    );

    const cancelPinButton = document.getElementById(
        "cancelPinSetupButton"
    );

    const savePinButton = document.getElementById(
        "savePinButton"
    );

    if (openButton) {
        openButton.addEventListener("click", openSecuritySettings);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeSecuritySettings);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeSecuritySettings);
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeSecuritySettings();
            }
        });
    }

    if (enabledInput) {
        enabledInput.addEventListener(
            "change",
            updateSecurityMethodVisibility
        );
    }

    if (pinMethodButton) {
        pinMethodButton.addEventListener(
            "click",
            () => selectSecurityMethod("pin")
        );
    }

    if (biometricMethodButton) {
        biometricMethodButton.addEventListener(
            "click",
            async () => {
                if (!await isBiometricAvailable()) {
                    showSecurityMessage(
                        "Biometric authentication is not available on this device or browser.",
                        "warning"
                    );
                    return;
                }

                selectSecurityMethod("biometric");
            }
        );
    }

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            saveSecurityConfiguration
        );
    }

    if (closePinButton) {
        closePinButton.addEventListener("click", closePinSetup);
    }

    if (cancelPinButton) {
        cancelPinButton.addEventListener("click", closePinSetup);
    }

    if (savePinButton) {
        savePinButton.addEventListener("click", saveNewPin);
    }

    updateSecurityStatusUI();

}


// ============================================================
// OPEN SECURITY SETTINGS
// ============================================================

async function openSecuritySettings() {

    await loadSecuritySettings();

    const enabledInput = document.getElementById(
        "appLockEnabledInput"
    );

    if (enabledInput) {
        enabledInput.checked = securitySettings.enabled;
    }

    selectSecurityMethod(
        securitySettings.method || "pin"
    );

    updateSecurityMethodVisibility();
    await updateBiometricAvailability();
    clearSecurityMessage();

    const modal = document.getElementById(
        "securitySettingsModal"
    );

    if (modal) {
        modal.classList.remove("hidden");
    }

}


// ============================================================
// CLOSE SECURITY SETTINGS
// ============================================================

function closeSecuritySettings() {

    const modal = document.getElementById(
        "securitySettingsModal"
    );

    if (modal) {
        modal.classList.add("hidden");
    }

    clearSecurityMessage();

}


// ============================================================
// SECURITY METHOD VISIBILITY
// ============================================================

function updateSecurityMethodVisibility() {

    const enabledInput = document.getElementById(
        "appLockEnabledInput"
    );

    const section = document.getElementById(
        "securityMethodSection"
    );

    if (!enabledInput || !section) {
        return;
    }

    section.classList.toggle(
        "hidden",
        !enabledInput.checked
    );

}


// ============================================================
// SELECT SECURITY METHOD
// ============================================================

function selectSecurityMethod(method) {

    securitySettings.method = method;

    const pinCheck = document.getElementById(
        "pinMethodCheck"
    );

    const biometricCheck = document.getElementById(
        "biometricMethodCheck"
    );

    if (pinCheck) {
        pinCheck.classList.toggle(
            "hidden",
            method !== "pin"
        );
    }

    if (biometricCheck) {
        biometricCheck.classList.toggle(
            "hidden",
            method !== "biometric"
        );
    }

}


// ============================================================
// SAVE SECURITY CONFIGURATION
// ============================================================

async function saveSecurityConfiguration() {

    const enabledInput = document.getElementById(
        "appLockEnabledInput"
    );

    if (!enabledInput) {
        return;
    }

    const enabled = enabledInput.checked;

    // --------------------------------------------------------
    // TURN OFF
    // --------------------------------------------------------

    if (!enabled) {

        securitySettings.enabled = false;

        await saveSecuritySettings();

        updateSecurityStatusUI();
        closeSecuritySettings();

        alert("🔓 App Lock is now OFF.");

        return;

    }

    const method = securitySettings.method || "pin";

    // --------------------------------------------------------
    // PIN
    // --------------------------------------------------------

    if (method === "pin") {

        if (!securitySettings.pinHash) {
            closeSecuritySettings();
            openPinSetup();
            return;
        }

        securitySettings.enabled = true;

        await saveSecuritySettings();

        updateSecurityStatusUI();
        closeSecuritySettings();

        alert(
            "🔐 App Lock enabled.\n\nYou will be asked for your PIN the next time you open My Limits."
        );

        return;

    }

    // --------------------------------------------------------
    // BIOMETRIC
    // --------------------------------------------------------

    if (method === "biometric") {

        const available = await isBiometricAvailable();

        if (!available) {
            showSecurityMessage(
                "Biometric authentication is not available on this device or browser.",
                "warning"
            );
            return;
        }

        const credential = await registerBiometricCredential();

        if (!credential) {
            return;
        }

        securitySettings.enabled = true;
        securitySettings.method = "biometric";
        securitySettings.biometricCredential = credential;

        await saveSecuritySettings();

        updateSecurityStatusUI();
        closeSecuritySettings();

        alert(
            "👆 Biometric App Lock enabled.\n\nYour device will ask for authentication the next time you open My Limits."
        );

    }

}


// ============================================================
// OPEN PIN SETUP
// ============================================================

function openPinSetup() {

    const newPin = document.getElementById("newPinInput");
    const confirmPin = document.getElementById("confirmPinInput");
    const error = document.getElementById("pinSetupError");

    if (newPin) newPin.value = "";
    if (confirmPin) confirmPin.value = "";
    if (error) error.textContent = "";

    const modal = document.getElementById("pinSetupModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

    setTimeout(() => {
        newPin?.focus();
    }, 100);

}


// ============================================================
// CLOSE PIN SETUP
// ============================================================

function closePinSetup() {

    const modal = document.getElementById("pinSetupModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


// ============================================================
// SAVE NEW PIN
// ============================================================

async function saveNewPin() {

    const newPin = document.getElementById(
        "newPinInput"
    )?.value.trim();

    const confirmPin = document.getElementById(
        "confirmPinInput"
    )?.value.trim();

    const error = document.getElementById(
        "pinSetupError"
    );

    if (!/^\d{4,6}$/.test(newPin || "")) {

        if (error) {
            error.textContent =
                "PIN must contain 4 to 6 digits.";
        }

        return;

    }

    if (newPin !== confirmPin) {

        if (error) {
            error.textContent = "PINs do not match.";
        }

        return;

    }

    try {

        securitySettings.pinHash =
            await hashPin(newPin);

        securitySettings.method = "pin";
        securitySettings.enabled = true;

        await saveSecuritySettings();

        closePinSetup();
        updateSecurityStatusUI();

        alert(
            "🔐 PIN saved successfully.\n\nApp Lock is now enabled."
        );

    }
    catch (err) {

        console.error(
            "Could not save PIN:",
            err
        );

        if (error) {
            error.textContent =
                "Could not save the PIN. Please try again.";
        }

    }

}


// ============================================================
// SETUP APP LOCK UNLOCK
// ============================================================

function setupAppLockUnlock() {

    const button = document.getElementById(
        "unlockAppButton"
    );

    const input = document.getElementById(
        "appLockPin"
    );

    if (button) {
        button.addEventListener(
            "click",
            unlockWithPin
        );
    }

    if (input) {
        input.addEventListener(
            "keydown",
            async event => {
                if (event.key === "Enter") {
                    await unlockWithPin();
                }
            }
        );
    }

}


// ============================================================
// SHOW APP LOCK
// ============================================================

function showAppLock() {

    if (!securitySettings.enabled) {
        return;
    }

    appIsLocked = true;

    const app = document.getElementById("app");

    if (app) {
        app.classList.add("app-content-locked");
    }

    const lockScreen = document.getElementById(
        "appLockScreen"
    );

    if (lockScreen) {
        lockScreen.classList.remove("hidden");
    }

    setupLockScreenForMethod();

    setTimeout(() => {

        if (securitySettings.method === "biometric") {
            unlockWithBiometric();
        }
        else {
            const input = document.getElementById("appLockPin");
            input?.focus();
        }

    }, 250);

}


// ============================================================
// SETUP LOCK SCREEN METHOD
// ============================================================

function setupLockScreenForMethod() {

    const lockScreen = document.getElementById(
        "appLockScreen"
    );

    if (!lockScreen) {
        return;
    }

    let biometricButton = document.getElementById(
        "biometricUnlockButton"
    );

    const pinInput = document.getElementById("appLockPin");
    const unlockButton = document.getElementById("unlockAppButton");

    if (securitySettings.method === "biometric") {

        pinInput?.classList.add("hidden");
        unlockButton?.classList.add("hidden");

        if (!biometricButton) {

            biometricButton = document.createElement("button");

            biometricButton.id = "biometricUnlockButton";
            biometricButton.className = "primary-button";
            biometricButton.type = "button";
            biometricButton.textContent = "👆 Unlock with biometric";

            biometricButton.addEventListener(
                "click",
                unlockWithBiometric
            );

            const card = lockScreen.querySelector(
                ".app-lock-card"
            );

            card?.appendChild(biometricButton);

        }

        biometricButton.classList.remove("hidden");

    }
    else {

        pinInput?.classList.remove("hidden");
        unlockButton?.classList.remove("hidden");

        biometricButton?.classList.add("hidden");

    }

}


// ============================================================
// UNLOCK WITH PIN
// ============================================================

async function unlockWithPin() {

    if (!securitySettings.enabled) {
        unlockApp();
        return;
    }

    if (securitySettings.method !== "pin") {
        return;
    }

    const input = document.getElementById("appLockPin");
    const error = document.getElementById("appLockError");
    const button = document.getElementById("unlockAppButton");

    const enteredPin = input?.value.trim();

    if (!/^\d{4,6}$/.test(enteredPin || "")) {

        if (error) {
            error.textContent = "Enter your 4–6 digit PIN.";
        }

        return;

    }

    if (!securitySettings.pinHash) {

        if (error) {
            error.textContent =
                "PIN security is not configured correctly. Open Security Settings.";
        }

        return;

    }

    if (button) {
        button.disabled = true;
        button.textContent = "Checking...";
    }

    try {

        const enteredHash = await hashPin(enteredPin);

        if (enteredHash === securitySettings.pinHash) {

            if (error) error.textContent = "";
            if (input) input.value = "";

            await unlockApp();

        }
        else {

            if (error) {
                error.textContent = "Incorrect PIN. Try again.";
            }

            if (input) {
                input.value = "";
                input.focus();
                input.classList.remove("app-lock-shake");
                void input.offsetWidth;
                input.classList.add("app-lock-shake");
            }

        }

    }
    catch (errorObject) {

        console.error(
            "PIN unlock error:",
            errorObject
        );

        if (error) {
            error.textContent =
                "Unable to verify PIN. Please try again.";
        }

    }
    finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Unlock";
        }

    }

}


// ============================================================
// UNLOCK APP
// ============================================================

async function unlockApp() {

    appIsLocked = false;

    const lockScreen = document.getElementById(
        "appLockScreen"
    );

    if (lockScreen) {
        lockScreen.classList.add("hidden");
    }

    const app = document.getElementById("app");

    if (app) {
        app.classList.remove("app-content-locked");
    }

    await refreshApp();

}


// ============================================================
// BIOMETRIC SUPPORT
// ============================================================

async function isBiometricAvailable() {

    try {

        if (!window.PublicKeyCredential) {
            return false;
        }

        if (
            typeof PublicKeyCredential
                .isUserVerifyingPlatformAuthenticatorAvailable
            !== "function"
        ) {
            return false;
        }

        return await PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable();

    }
    catch {
        return false;
    }

}


// ============================================================
// UPDATE BIOMETRIC UI
// ============================================================

async function updateBiometricAvailability() {

    const button = document.getElementById(
        "biometricMethodButton"
    );

    const text = document.getElementById(
        "biometricAvailabilityText"
    );

    const unavailable = document.getElementById(
        "biometricUnavailableText"
    );

    const available = await isBiometricAvailable();

    if (button) {
        button.disabled = !available;
    }

    if (text) {
        text.textContent = available
            ? "Use your device authentication"
            : "Not available on this device";
    }

    unavailable?.classList.toggle(
        "hidden",
        available
    );

    if (!available && securitySettings.method === "biometric") {
        selectSecurityMethod("pin");
    }

}


// ============================================================
// REGISTER BIOMETRIC CREDENTIAL
// ============================================================

async function registerBiometricCredential() {

    if (!await isBiometricAvailable()) {

        showSecurityMessage(
            "Biometric authentication is not available.",
            "warning"
        );

        return null;

    }

    try {

        const challenge = randomBytes(32);
        const userId = randomBytes(16);

        const credential = await navigator.credentials.create({

            publicKey: {

                challenge,

                rp: {
                    name: "My Limits",
                    id: location.hostname === "localhost"
                        ? "localhost"
                        : location.hostname
                },

                user: {
                    id: userId,
                    name: "my-limits-user",
                    displayName: "My Limits User"
                },

                pubKeyCredParams: [
                    {
                        type: "public-key",
                        alg: -7
                    },
                    {
                        type: "public-key",
                        alg: -257
                    }
                ],

                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "preferred"
                },

                timeout: 60000,
                attestation: "none"

            }

        });

        if (!credential) {
            return null;
        }

        const response = credential.response;

        let publicKeyBase64 = null;

        if (typeof response.getPublicKey === "function") {

            const publicKey = response.getPublicKey();

            if (publicKey) {
                publicKeyBase64 = arrayBufferToBase64(publicKey);
            }

        }

        if (!publicKeyBase64) {

            showSecurityMessage(
                "This browser cannot securely store the biometric credential required by My Limits. Please use PIN.",
                "warning"
            );

            return null;

        }

        let algorithm = -7;

        if (typeof response.getPublicKeyAlgorithm === "function") {
            try {
                algorithm = response.getPublicKeyAlgorithm();
            }
            catch {
                algorithm = -7;
            }
        }

        return {
            id: arrayBufferToBase64Url(credential.rawId),
            publicKey: publicKeyBase64,
            algorithm,
            createdAt: new Date().toISOString()
        };

    }
    catch (error) {

        console.warn(
            "Biometric registration failed:",
            error
        );

        showSecurityMessage(
            biometricErrorMessage(error),
            "warning"
        );

        return null;

    }

}


// ============================================================
// BIOMETRIC UNLOCK
// ============================================================

async function unlockWithBiometric() {

    if (securitySettings.method !== "biometric") {
        return;
    }

    const credential = securitySettings.biometricCredential;

    if (!credential) {
        showLockError(
            "Biometric setup is incomplete. Please use PIN from Security Settings."
        );
        return;
    }

    try {

        const challenge = randomBytes(32);

        const assertion = await navigator.credentials.get({

            publicKey: {
                challenge,
                rpId: location.hostname === "localhost"
                    ? "localhost"
                    : location.hostname,
                allowCredentials: [
                    {
                        type: "public-key",
                        id: base64UrlToArrayBuffer(credential.id)
                    }
                ],
                userVerification: "required",
                timeout: 60000
            }

        });

        if (!assertion) {
            showLockError(
                "Biometric authentication was cancelled."
            );
            return;
        }

        const verified = await verifyBiometricAssertion(
            assertion,
            challenge,
            credential
        );

        if (verified) {
            await unlockApp();
        }
        else {
            showLockError(
                "Biometric verification failed."
            );
        }

    }
    catch (error) {

        console.warn(
            "Biometric unlock failed:",
            error
        );

        showLockError(
            biometricErrorMessage(error)
        );

    }

}


// ============================================================
// VERIFY BIOMETRIC ASSERTION
// ============================================================

async function verifyBiometricAssertion(
    assertion,
    challenge,
    credential
) {

    try {

        const response = assertion.response;

        const clientDataJSON = new Uint8Array(
            response.clientDataJSON
        );

        const authenticatorData = new Uint8Array(
            response.authenticatorData
        );

        const signature = new Uint8Array(
            response.signature
        );

        const clientData = JSON.parse(
            new TextDecoder().decode(clientDataJSON)
        );

        if (clientData.type !== "webauthn.get") {
            return false;
        }

        const expectedChallenge =
            arrayBufferToBase64Url(challenge);

        if (clientData.challenge !== expectedChallenge) {
            return false;
        }

        if (clientData.origin !== window.location.origin) {
            return false;
        }

        if (authenticatorData.length < 37) {
            return false;
        }

        const rpIdHash = authenticatorData.slice(0, 32);

        const expectedRpIdHash = new Uint8Array(
            await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(
                    location.hostname === "localhost"
                        ? "localhost"
                        : location.hostname
                )
            )
        );

        if (!arraysEqual(rpIdHash, expectedRpIdHash)) {
            return false;
        }

        const flags = authenticatorData[32];

        if ((flags & 0x01) === 0) {
            return false;
        }

        if ((flags & 0x04) === 0) {
            return false;
        }

        const clientDataHash = new Uint8Array(
            await crypto.subtle.digest(
                "SHA-256",
                clientDataJSON
            )
        );

        const signedData = concatUint8Arrays(
            authenticatorData,
            clientDataHash
        );

        const publicKey = base64ToArrayBuffer(
            credential.publicKey
        );

        const algorithm = credential.algorithm === -257
            ? {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            }
            : {
                name: "ECDSA",
                namedCurve: "P-256"
            };

        const importedKey = await crypto.subtle.importKey(
            "spki",
            publicKey,
            algorithm,
            false,
            ["verify"]
        );

        if (credential.algorithm === -257) {
            return await crypto.subtle.verify(
                {
                    name: "RSASSA-PKCS1-v1_5"
                },
                importedKey,
                signature,
                signedData
            );
        }

        return await crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: "SHA-256"
            },
            importedKey,
            signature,
            signedData
        );

    }
    catch (error) {

        console.warn(
            "Biometric assertion verification error:",
            error
        );

        return false;

    }

}


// ============================================================
// SECURITY STATUS UI
// ============================================================

function updateSecurityStatusUI() {

    const statusText = document.getElementById(
        "securityStatusText"
    );

    const badge = document.getElementById(
        "securityStatusBadge"
    );

    if (!statusText || !badge) {
        return;
    }

    if (securitySettings.enabled) {

        statusText.textContent =
            securitySettings.method === "biometric"
                ? "Biometric App Lock is ON"
                : "PIN App Lock is ON";

        badge.textContent = "ON";
        badge.classList.remove("off");
        badge.classList.add("on");

    }
    else {

        statusText.textContent = "App Lock is OFF";
        badge.textContent = "OFF";
        badge.classList.remove("on");
        badge.classList.add("off");

    }

}


// ============================================================
// SECURITY MESSAGE
// ============================================================

function showSecurityMessage(
    message,
    type = "info"
) {

    const element = document.getElementById(
        "securitySetupMessage"
    );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className =
        `security-setup-message ${type}`;
    element.classList.remove("hidden");

}


// ============================================================
// CLEAR SECURITY MESSAGE
// ============================================================

function clearSecurityMessage() {

    const element = document.getElementById(
        "securitySetupMessage"
    );

    if (!element) {
        return;
    }

    element.textContent = "";
    element.classList.add("hidden");

}


// ============================================================
// LOCK ERROR
// ============================================================

function showLockError(message) {

    const error = document.getElementById(
        "appLockError"
    );

    if (error) {
        error.textContent = message;
    }

}


// ============================================================
// BIOMETRIC ERROR MESSAGE
// ============================================================

function biometricErrorMessage(error) {

    if (error?.name === "NotAllowedError") {
        return "Biometric authentication was cancelled or not accepted.";
    }

    if (error?.name === "InvalidStateError") {
        return "This biometric credential is already in use.";
    }

    if (error?.name === "NotSupportedError") {
        return "Biometric authentication is not supported here.";
    }

    return "Biometric authentication could not be completed.";

}


// ============================================================
// RANDOM BYTES
// ============================================================

function randomBytes(length) {

    const bytes = new Uint8Array(length);

    crypto.getRandomValues(bytes);

    return bytes;

}


// ============================================================
// ARRAY BUFFER → BASE64
// ============================================================

function arrayBufferToBase64(buffer) {

    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);

}


// ============================================================
// ARRAY BUFFER → BASE64URL
// ============================================================

function arrayBufferToBase64Url(buffer) {

    return arrayBufferToBase64(buffer)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

}


// ============================================================
// BASE64 → ARRAY BUFFER
// ============================================================

function base64ToArrayBuffer(base64) {

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;

}


// ============================================================
// BASE64URL → ARRAY BUFFER
// ============================================================

function base64UrlToArrayBuffer(value) {

    let base64 = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (base64.length % 4) {
        base64 += "=";
    }

    return base64ToArrayBuffer(base64);

}


// ============================================================
// ARRAY EQUALITY
// ============================================================

function arraysEqual(a, b) {

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;

}


// ============================================================
// CONCAT UINT8 ARRAYS
// ============================================================

function concatUint8Arrays(first, second) {

    const result = new Uint8Array(
        first.length + second.length
    );

    result.set(first, 0);
    result.set(second, first.length);

    return result;

}

// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// ============================================================
// READABLE DATE
// ============================================================

function formatReadableDate(
    date
) {

    return date.toLocaleDateString(
        "en-IN",
        {

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


// ============================================================
// SHORT DATE
// ============================================================

function formatShortDate(
    dateString
) {

    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

    }


    const date =
        new Date(

            Number(parts[0]),

            Number(parts[1]) - 1,

            Number(parts[2])

        );


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "numeric",

            month:
                "short"

        }
    );

}


// ============================================================
// HISTORY DATE
// ============================================================

function formatHistoryDate(
    dateString
) {

    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

    }


    const date =
        new Date(

            Number(parts[0]),

            Number(parts[1]) - 1,

            Number(parts[2])

        );


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// START
// ============================================================

startApp();
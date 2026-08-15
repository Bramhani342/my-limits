// ============================================================
// MY LIMITS - APP LOCK
// ============================================================
//
// Handles:
//
// - Enable / disable App Lock
// - Create PIN
// - Change PIN
// - Verify PIN
// - Lock screen
// - Secure PIN storage using SHA-256
// - Authentication method selection
// - Future biometric support
//
// IMPORTANT:
//
// The actual PIN is NEVER stored.
//
// Only a SHA-256 hash is stored in IndexedDB.
//
// ============================================================

import {
    getData,
    putData
} from "../db/database.js";


// ============================================================
// SETTINGS KEY
// ============================================================

const APP_LOCK_KEY =
    "appLock";


// ============================================================
// DEFAULT SETTINGS
// ============================================================

function getDefaultSettings() {

    return {

        key:
            APP_LOCK_KEY,

        enabled:
            false,

        method:
            "pin",

        pinHash:
            null

    };

}


// ============================================================
// GET APP LOCK SETTINGS
// ============================================================

export async function getAppLockSettings() {

    const settings =
        await getData(
            "settings",
            APP_LOCK_KEY
        );


    // --------------------------------------------------------
    // First-time user
    // --------------------------------------------------------

    if (!settings) {

        return getDefaultSettings();

    }


    // --------------------------------------------------------
    // Backward compatibility
    //
    // Older version may not have "method".
    // --------------------------------------------------------

    return {

        ...getDefaultSettings(),

        ...settings

    };

}


// ============================================================
// HASH PIN
// ============================================================
//
// SHA-256 is used so the actual PIN is never stored.
//
// Example:
//
// 1234
// ↓
// SHA-256
// ↓
// hash string
//
// ============================================================

async function hashPin(
    pin
) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            pin
        );


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );


    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


// ============================================================
// VALIDATE PIN
// ============================================================

function isValidPin(
    pin
) {

    return (
        /^\d{4,6}$/.test(
            pin
        )
    );

}


// ============================================================
// ENABLE APP LOCK WITH PIN
// ============================================================
//
// Used when:
//
// 1. User enables App Lock
// 2. User creates a PIN
// 3. User changes their PIN
//
// ============================================================

export async function enableAppLock(
    pin
) {

    if (
        !isValidPin(
            pin
        )
    ) {

        throw new Error(
            "PIN must contain 4 to 6 digits."
        );

    }


    const pinHash =
        await hashPin(
            pin
        );


    const existingSettings =
        await getAppLockSettings();


    const settings = {

        key:
            APP_LOCK_KEY,

        enabled:
            true,

        method:
            existingSettings.method ||
            "pin",

        pinHash

    };


    await putData(
        "settings",
        settings
    );


    return true;

}


// ============================================================
// ENABLE PIN LOCK EXPLICITLY
// ============================================================
//
// Useful when the user selects PIN from the
// Security Settings screen.
//
// ============================================================

export async function enablePinLock(
    pin
) {

    if (
        !isValidPin(
            pin
        )
    ) {

        throw new Error(
            "PIN must contain 4 to 6 digits."
        );

    }


    const pinHash =
        await hashPin(
            pin
        );


    await putData(
        "settings",
        {

            key:
                APP_LOCK_KEY,

            enabled:
                true,

            method:
                "pin",

            pinHash

        }
    );


    return true;

}


// ============================================================
// DISABLE APP LOCK
// ============================================================
//
// Important:
//
// We keep the PIN hash in the database.
//
// Why?
//
// If the user turns App Lock off and later turns
// it back on, the settings can still exist.
//
// However, for stronger privacy we can clear it.
// Here we clear it because disabled means the
// authentication credential is no longer needed.
//
// ============================================================

export async function disableAppLock() {

    await putData(
        "settings",
        {

            key:
                APP_LOCK_KEY,

            enabled:
                false,

            method:
                "pin",

            pinHash:
                null

        }
    );


    return true;

}


// ============================================================
// CHANGE PIN
// ============================================================

export async function changePin(
    newPin
) {

    if (
        !isValidPin(
            newPin
        )
    ) {

        throw new Error(
            "PIN must contain 4 to 6 digits."
        );

    }


    const settings =
        await getAppLockSettings();


    const pinHash =
        await hashPin(
            newPin
        );


    settings.enabled =
        true;


    settings.method =
        "pin";


    settings.pinHash =
        pinHash;


    await putData(
        "settings",
        settings
    );


    return true;

}


// ============================================================
// VERIFY PIN
// ============================================================

export async function verifyPin(
    pin
) {

    if (
        !isValidPin(
            pin
        )
    ) {

        return false;

    }


    const settings =
        await getAppLockSettings();


    // --------------------------------------------------------
    // App Lock is disabled
    // --------------------------------------------------------

    if (
        settings.enabled !== true
    ) {

        return true;

    }


    // --------------------------------------------------------
    // No PIN exists
    // --------------------------------------------------------

    if (
        !settings.pinHash
    ) {

        return false;

    }


    // --------------------------------------------------------
    // PIN authentication
    // --------------------------------------------------------

    if (
        settings.method ===
        "pin"
    ) {

        const enteredHash =
            await hashPin(
                pin
            );


        return (
            enteredHash ===
            settings.pinHash
        );

    }


    // --------------------------------------------------------
    // Unknown method
    // --------------------------------------------------------
    //
    // Never silently unlock if an unsupported method
    // is stored.
    //

    return false;

}


// ============================================================
// CHECK WHETHER APP SHOULD LOCK
// ============================================================

export async function shouldLockApp() {

    const settings =
        await getAppLockSettings();


    return (

        settings.enabled ===
        true

        &&

        settings.method ===
        "pin"

        &&

        !!settings.pinHash

    );

}


// ============================================================
// SET AUTHENTICATION METHOD
// ============================================================
//
// Currently:
//
// pin
//
// Future:
//
// biometric
//
// We don't enable biometric here until its
// WebAuthn/passkey implementation is added.
//
// ============================================================

export async function setAuthenticationMethod(
    method
) {

    if (
        method !== "pin" &&
        method !== "biometric"
    ) {

        throw new Error(
            "Unsupported authentication method."
        );

    }


    const settings =
        await getAppLockSettings();


    settings.method =
        method;


    await putData(
        "settings",
        settings
    );


    return settings;

}


// ============================================================
// GET AUTHENTICATION METHOD
// ============================================================

export async function getAuthenticationMethod() {

    const settings =
        await getAppLockSettings();


    return (
        settings.method ||
        "pin"
    );

}


// ============================================================
// SETUP LOCK SCREEN
// ============================================================

export function setupAppLockUI() {

    const lockScreen =
        document.getElementById(
            "appLockScreen"
        );


    const pinInput =
        document.getElementById(
            "appLockPin"
        );


    const unlockButton =
        document.getElementById(
            "unlockAppButton"
        );


    const errorMessage =
        document.getElementById(
            "appLockError"
        );


    if (
        !lockScreen ||
        !pinInput ||
        !unlockButton
    ) {

        console.warn(
            "App Lock UI elements are missing."
        );

        return;

    }


    // ========================================================
    // ATTEMPT UNLOCK
    // ========================================================

    async function attemptUnlock() {

        const pin =
            pinInput.value.trim();


        if (errorMessage) {

            errorMessage.textContent =
                "";

        }


        // ----------------------------------------------------
        // Validate
        // ----------------------------------------------------

        if (
            !isValidPin(
                pin
            )
        ) {

            if (errorMessage) {

                errorMessage.textContent =
                    "Enter your 4–6 digit PIN.";

            }


            return;

        }


        unlockButton.disabled =
            true;


        unlockButton.textContent =
            "Checking...";


        try {

            const valid =
                await verifyPin(
                    pin
                );


            if (valid) {

                // --------------------------------------------
                // Unlock
                // --------------------------------------------

                lockScreen.classList.add(
                    "hidden"
                );


                pinInput.value =
                    "";


                if (errorMessage) {

                    errorMessage.textContent =
                        "";

                }

            }

            else {

                // --------------------------------------------
                // Incorrect PIN
                // --------------------------------------------

                if (errorMessage) {

                    errorMessage.textContent =
                        "Incorrect PIN.";

                }


                pinInput.value =
                    "";


                pinInput.focus();

            }

        }

        catch (error) {

            console.error(
                "App unlock error:",
                error
            );


            if (errorMessage) {

                errorMessage.textContent =
                    "Unable to unlock the app.";

            }

        }


        unlockButton.disabled =
            false;


        unlockButton.textContent =
            "Unlock";

    }


    // ========================================================
    // BUTTON
    // ========================================================

    unlockButton.addEventListener(
        "click",
        attemptUnlock
    );


    // ========================================================
    // ENTER KEY
    // ========================================================

    pinInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                attemptUnlock();

            }

        }
    );

}


// ============================================================
// SHOW LOCK SCREEN IF REQUIRED
// ============================================================

export async function lockAppIfRequired() {

    const lockScreen =
        document.getElementById(
            "appLockScreen"
        );


    if (!lockScreen) {

        return;

    }


    const shouldLock =
        await shouldLockApp();


    if (
        shouldLock
    ) {

        lockScreen.classList.remove(
            "hidden"
        );


        const pinInput =
            document.getElementById(
                "appLockPin"
            );


        if (pinInput) {

            pinInput.value =
                "";


            setTimeout(
                () => {

                    pinInput.focus();

                },
                100
            );

        }

    }

    else {

        lockScreen.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// LOCK APP MANUALLY
// ============================================================

export async function lockApp() {

    const enabled =
        await shouldLockApp();


    if (!enabled) {

        return;

    }


    const lockScreen =
        document.getElementById(
            "appLockScreen"
        );


    if (!lockScreen) {

        return;

    }


    lockScreen.classList.remove(
        "hidden"
    );


    const pinInput =
        document.getElementById(
            "appLockPin"
        );


    const errorMessage =
        document.getElementById(
            "appLockError"
        );


    if (pinInput) {

        pinInput.value =
            "";

    }


    if (errorMessage) {

        errorMessage.textContent =
            "";

    }


    if (pinInput) {

        setTimeout(
            () => {

                pinInput.focus();

            },
            100
        );

    }

}


// ============================================================
// CLEAR APP LOCK DATA
// ============================================================
//
// Useful if the user wants to completely remove
// App Lock credentials.
//
// ============================================================

export async function clearAppLockData() {

    await putData(
        "settings",
        {

            key:
                APP_LOCK_KEY,

            enabled:
                false,

            method:
                "pin",

            pinHash:
                null

        }
    );


    return true;

}
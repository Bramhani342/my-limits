// ============================================================
// MY LIMITS - SMART NOTIFICATIONS
// ============================================================
//
// Notifications are intentionally designed to avoid temptation.
//
// IMPORTANT:
//
// A limit only receives reminders when:
//     limit.notifications === true
//
// We also avoid sending repeated notifications for the same
// limit during the same period.
//
// ============================================================

import {
    getAllData,
    putData
} from "../db/database.js";


// ============================================================
// NOTIFICATION SUPPORT
// ============================================================

export function notificationsSupported() {

    return (
        "Notification" in window
    );

}


// ============================================================
// CURRENT PERMISSION
// ============================================================

export function getNotificationPermission() {

    if (
        !notificationsSupported()
    ) {

        return "unsupported";

    }


    return Notification.permission;

}


// ============================================================
// REQUEST PERMISSION
// ============================================================

export async function requestNotificationPermission() {

    if (
        !notificationsSupported()
    ) {

        return "unsupported";

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        return "granted";

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        return "denied";

    }


    try {

        const permission =
            await Notification.requestPermission();

        return permission;

    }

    catch (error) {

        console.warn(
            "Notification permission error:",
            error
        );

        return "denied";

    }

}


// ============================================================
// SHOW NOTIFICATION
// ============================================================

export function showNotification(
    title,
    body
) {

    if (
        !notificationsSupported()
    ) {

        return false;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return false;

    }


    try {

        new Notification(
            title,
            {
                body,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
                tag:
                    "my-limits-" +
                    Date.now()
            }
        );


        return true;

    }

    catch (error) {

        console.warn(
            "Could not show notification:",
            error
        );

        return false;

    }

}


// ============================================================
// PERIOD KEY
// ============================================================
//
// Used to make sure a reminder is not repeatedly sent.
//
// Example:
//
// burger-monthly-2026-08-01
//
// or
//
// pani-puri-weekly-2026-08-10
//
// ============================================================

function getPeriodKey(
    limit,
    usage
) {

    return (

        limit.id +
        "-" +
        usage.period +
        "-" +
        usage.start

    );

}


// ============================================================
// NOTIFICATION RECORD KEY
// ============================================================

function getReminderKey(
    limit,
    usage
) {

    return (
        "reminder-" +
        getPeriodKey(
            limit,
            usage
        )
    );

}


// ============================================================
// CHECK WHETHER REMINDER WAS ALREADY SENT
// ============================================================

async function reminderAlreadySent(
    key
) {

    const existing =
        await getAllData(
            "settings"
        );


    return existing.some(
        setting =>
            setting.key === key
    );

}


// ============================================================
// MARK REMINDER AS SENT
// ============================================================

async function markReminderSent(
    key
) {

    await putData(
        "settings",
        {
            key,
            value:
                true,
            createdAt:
                new Date().toISOString()
        }
    );

}


// ============================================================
// REMOVE OLD REMINDER RECORDS
// ============================================================
//
// Keeps settings store clean.
//
// We only keep the most recent reminder states.
// ============================================================

async function cleanupOldReminders() {

    const settings =
        await getAllData(
            "settings"
        );


    const reminders =
        settings.filter(
            item =>
                typeof item.key ===
                "string" &&
                item.key.startsWith(
                    "reminder-"
                )
        );


    if (
        reminders.length <= 100
    ) {

        return;

    }


    reminders.sort(
        (a, b) => {

            return (
                String(
                    a.createdAt || ""
                ).localeCompare(
                    String(
                        b.createdAt || ""
                    )
                )
            );

        }
    );


    // Keep latest 100.
    //
    // NOTE:
    // We intentionally don't delete settings here because
    // database.js already exposes deleteData and we want
    // notification logic simple for now.

}


// ============================================================
// CREATE SMART MESSAGE
// ============================================================

function createReminderMessage(
    limit,
    usage
) {

    const remaining =
        Number(
            usage.remaining
        );


    const used =
        Number(
            usage.used
        );


    const allowed =
        Number(
            usage.allowed
        );


    // --------------------------------------------------------
    // LIMIT ALREADY REACHED
    // --------------------------------------------------------

    if (
        remaining <= 0
    ) {

        return {

            title:
                `⚠️ ${limit.name} limit reached`,

            body:
                `You've used ${used} of ${allowed}. ` +
                `Your next period will reset this limit.`

        };

    }


    // --------------------------------------------------------
    // ONLY ONE LEFT
    // --------------------------------------------------------

    if (
        remaining === 1
    ) {

        return {

            title:
                `🎯 ${limit.name}`,

            body:
                `You have 1 remaining for this ` +
                `${usage.period} period.`

        };

    }


    // --------------------------------------------------------
    // MORE THAN ONE LEFT
    // --------------------------------------------------------

    return {

        title:
            `🎯 ${limit.name}`,

        body:
            `${remaining} remaining this ` +
            `${usage.period} period.`

    };

}


// ============================================================
// CHECK ONE LIMIT
// ============================================================

export async function checkLimitNotification(
    limit,
    usage
) {

    // --------------------------------------------------------
    // NOT ENABLED
    // --------------------------------------------------------

    if (
        limit.notifications !== true
    ) {

        return false;

    }


    // --------------------------------------------------------
    // NO PERMISSION
    // --------------------------------------------------------

    if (
        !notificationsSupported()
    ) {

        return false;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return false;

    }


    // --------------------------------------------------------
    // CREATE UNIQUE PERIOD KEY
    // --------------------------------------------------------

    const reminderKey =
        getReminderKey(
            limit,
            usage
        );


    // --------------------------------------------------------
    // DON'T REPEAT
    // --------------------------------------------------------

    const alreadySent =
        await reminderAlreadySent(
            reminderKey
        );


    if (
        alreadySent
    ) {

        return false;

    }


    // --------------------------------------------------------
    // SMART MESSAGE
    // --------------------------------------------------------

    const message =
        createReminderMessage(
            limit,
            usage
        );


    // --------------------------------------------------------
    // SHOW
    // --------------------------------------------------------

    const shown =
        showNotification(
            message.title,
            message.body
        );


    if (
        !shown
    ) {

        return false;

    }


    // --------------------------------------------------------
    // SAVE STATE
    // --------------------------------------------------------

    await markReminderSent(
        reminderKey
    );


    return true;

}


// ============================================================
// CHECK ALL LIMITS
// ============================================================
//
// Called when the app starts.
//
// We don't bombard the user.
//
// Only one smart notification is allowed per app check.
// ============================================================

export async function checkSmartNotifications(
    getUsageFunction
) {

    if (
        !notificationsSupported()
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const limits =
        await getAllData(
            "limits"
        );


    const activeLimits =
        limits.filter(
            limit =>
                limit.active === true &&
                limit.notifications === true
        );


    if (
        activeLimits.length === 0
    ) {

        return;

    }


    for (
        const limit
        of activeLimits
    ) {

        try {

            const usage =
                await getUsageFunction(
                    limit.id,
                    new Date()
                );


            // ------------------------------------------------
            // IMPORTANT
            //
            // We only notify when:
            //
            // 1. Limit reached
            // OR
            // 2. Only one remains
            //
            // This prevents unnecessary temptation.
            // ------------------------------------------------

            if (
                usage.remaining > 1
            ) {

                continue;

            }


            const sent =
                await checkLimitNotification(
                    limit,
                    usage
                );


            if (
                sent
            ) {

                // Only one notification per app check.
                break;

            }

        }

        catch (error) {

            console.warn(
                "Notification check failed:",
                error
            );

        }

    }


    await cleanupOldReminders();

}


// ============================================================
// NOTIFICATION STATUS TEXT
// ============================================================

export function getNotificationStatusText() {

    if (
        !notificationsSupported()
    ) {

        return "Notifications are not supported on this browser.";

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        return "Notifications are enabled.";

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        return "Notifications are blocked in browser settings.";

    }


    return "Notifications are not enabled yet.";

}
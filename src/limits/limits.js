// ============================================================
// MY LIMITS - LIMIT MANAGEMENT
// ============================================================

import {
    getAllData,
    putData
} from "../db/database.js";

import {
    requestNotificationPermission
} from "../notifications/notifications.js";

// ============================================================
// STATE
// ============================================================

let editingLimitId = null;
let deleteTargetId = null;


// ============================================================
// INITIALIZE
// ============================================================

export function initializeLimitManagement(onDataChanged) {

    const settingsButton =
        document.getElementById("settingsButton");

    const addLimitButton =
        document.getElementById("addLimitButton");

    const manageAddButton =
        document.getElementById("manageAddButton");

    const closeManageModal =
        document.getElementById("closeManageModal");

    const closeLimitForm =
        document.getElementById("closeLimitForm");

    const cancelLimitForm =
        document.getElementById("cancelLimitForm");

    const saveLimitButton =
        document.getElementById("saveLimitButton");

    const stopLimitButton =
        document.getElementById("stopLimitButton");

    const startDeleteButton =
        document.getElementById("startDeleteButton");

    const cancelDeleteButton =
        document.getElementById("cancelDeleteButton");

    const finishDeleteButton =
        document.getElementById("finishDeleteButton");

    const keepLimitButton =
        document.getElementById("keepLimitButton");


    // Open Manage Limits
    settingsButton.addEventListener("click", async () => {
        await openManageModal();
    });


    // Add from main page
    addLimitButton.addEventListener("click", () => {
        openAddLimitModal();
    });


    // Add from Manage Limits
    manageAddButton.addEventListener("click", () => {

        closeModal("manageModal");

        openAddLimitModal();

    });


    // Close Manage Limits
    closeManageModal.addEventListener("click", () => {
        closeModal("manageModal");
    });


    // Close Add/Edit form
    closeLimitForm.addEventListener("click", () => {
        closeModal("limitFormModal");
    });


    // Cancel Add/Edit
    cancelLimitForm.addEventListener("click", () => {
        closeModal("limitFormModal");
    });


    // Save limit
    saveLimitButton.addEventListener("click", async () => {

        await saveLimit(onDataChanged);

    });


    // Stop limit
    stopLimitButton.addEventListener("click", () => {

        openDeleteRequest();

    });


    // Start 24-hour waiting period
    startDeleteButton.addEventListener("click", async () => {

        await startDeletion(onDataChanged);

    });


    // Cancel initial delete confirmation
    cancelDeleteButton.addEventListener("click", () => {

        deleteTargetId = null;

        closeModal("deleteRequestModal");

    });


    // Complete deletion after 24 hours
    finishDeleteButton.addEventListener("click", async () => {

        await finishDeletion(onDataChanged);

    });


    // Keep the limit after 24 hours
    keepLimitButton.addEventListener("click", async () => {

        await cancelDeletion(onDataChanged);

    });


    // Check whether any 24-hour request has completed
    checkPendingDeletions();

}


// ============================================================
// OPEN MANAGE LIMITS
// ============================================================

async function openManageModal() {

    await renderManageLimits();

    document
        .getElementById("manageModal")
        .classList.remove("hidden");

}


// ============================================================
// RENDER MANAGE LIMITS
// ============================================================

async function renderManageLimits() {

    const container =
        document.getElementById("manageLimitsList");

    container.innerHTML = "";


    const limits =
        await getAllData("limits");


    const activeLimits =
        limits.filter(
            limit => limit.active === true
        );


    if (activeLimits.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No active limits.
            </p>
        `;

        return;
    }


    activeLimits.forEach(limit => {

        const row =
            document.createElement("div");

        row.className =
            "manage-limit-row";


        const notificationText =
            limit.notifications
                ? "🔔 ON"
                : "🔕 OFF";


        row.innerHTML = `
            <div class="manage-limit-info">

                <strong>
                    ${limit.name}
                </strong>

                <span>
                    ${limit.limit} / ${limit.period}
                </span>

                <span>
                    ${notificationText}
                </span>

            </div>

            <button
                class="edit-limit-button"
                type="button"
            >
                ✏️
            </button>
        `;


        row
            .querySelector(".edit-limit-button")
            .addEventListener("click", () => {

                openEditLimitModal(limit);

            });


        container.appendChild(row);

    });

}


// ============================================================
// OPEN ADD LIMIT
// ============================================================

function openAddLimitModal() {

    editingLimitId = null;


    document
        .getElementById("limitFormTitle")
        .textContent =
            "Add New Limit";


    document
        .getElementById("limitNameInput")
        .value = "";


    document
        .getElementById("limitValueInput")
        .value = "";


    document
        .getElementById("limitPeriodInput")
        .value =
            "monthly";


    document
        .getElementById("notificationInput")
        .checked = false;


    document
        .getElementById("stopLimitButton")
        .classList.add("hidden");


    document
        .getElementById("limitFormModal")
        .classList.remove("hidden");

}


// ============================================================
// OPEN EDIT LIMIT
// ============================================================

function openEditLimitModal(limit) {

    editingLimitId =
        limit.id;


    document
        .getElementById("limitFormTitle")
        .textContent =
            "Edit Limit";


    document
        .getElementById("limitNameInput")
        .value =
            limit.name;


    document
        .getElementById("limitValueInput")
        .value =
            limit.limit;


    document
        .getElementById("limitPeriodInput")
        .value =
            limit.period;


    document
        .getElementById("notificationInput")
        .checked =
            limit.notifications === true;


    document
        .getElementById("stopLimitButton")
        .classList.remove("hidden");


    closeModal("manageModal");


    document
        .getElementById("limitFormModal")
        .classList.remove("hidden");

}


// ============================================================
// SAVE LIMIT
// ============================================================

async function saveLimit(onDataChanged) {

    const name =
        document
            .getElementById("limitNameInput")
            .value
            .trim();


    const limitValue =
        Number(
            document
                .getElementById("limitValueInput")
                .value
        );


    const period =
        document
            .getElementById("limitPeriodInput")
            .value;


    const notifications =
        document
            .getElementById("notificationInput")
            .checked;

    // ========================================================
    // NOTIFICATION PERMISSION
    // ========================================================
    //
    // Ask only when the user explicitly turned reminders ON.
    //
    // If permission is denied, the limit can still be saved.
    // It simply won't send browser notifications.
    //

    if (
        notifications
    ) {

        const permission =
            await requestNotificationPermission();


        if (
            permission !== "granted"
        ) {

            const continueSaving =
                window.confirm(

                    "Browser notifications are not enabled.\n\n" +

                    "You can still save this limit without reminders.\n\n" +

                    "Save without notifications?"

                );


            if (!continueSaving) {

                return;

            }

        }

    }
    // Validate name
    if (!name) {

        alert(
            "Please enter an item name."
        );

        return;
    }


    // Validate number
    if (
        !Number.isInteger(limitValue) ||
        limitValue < 1
    ) {

        alert(
            "Please enter a valid limit."
        );

        return;
    }


    const limits =
        await getAllData("limits");


    // ========================================================
    // ADD NEW LIMIT
    // ========================================================

    if (!editingLimitId) {

        const duplicate =
            limits.some(
                item =>
                    item.active === true &&
                    item.name
                        .toLowerCase() ===
                    name.toLowerCase()
            );


        if (duplicate) {

            alert(
                "An active limit with this name already exists."
            );

            return;
        }


        const newLimit = {

            id:
                "limit-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2),

            name:

                name,

            limit:

                limitValue,

            period:

                period,

            notifications:

                notifications,

            active:

                true,

            createdAt:

                new Date().toISOString()

        };


        await putData(
            "limits",
            newLimit
        );

    }


    // ========================================================
    // EDIT EXISTING LIMIT
    // ========================================================

    else {

        const existing =
            limits.find(
                item =>
                    item.id ===
                    editingLimitId
            );


        if (!existing) {

            alert(
                "Limit could not be found."
            );

            return;
        }


        existing.name =
            name;


        existing.limit =
            limitValue;


        existing.period =
            period;


        existing.notifications =
            notifications;


        await putData(
            "limits",
            existing
        );

    }


    editingLimitId = null;


    closeModal("limitFormModal");


    await onDataChanged();

}


// ============================================================
// OPEN STOP / DELETE REQUEST
// ============================================================

async function openDeleteRequest() {

    if (!editingLimitId) {
        return;
    }


    const limits =
        await getAllData("limits");


    const limit =
        limits.find(
            item =>
                item.id ===
                editingLimitId
        );


    if (!limit) {
        return;
    }


    if (limit.active !== true) {

        alert(
            "This limit is already stopped."
        );

        return;
    }


    // Check if a pending request already exists
    const requests =
        await getAllData(
            "deletionRequests"
        );


    const existingPending =
        requests.find(
            request =>
                request.limitId === limit.id &&
                request.status === "pending"
        );


    if (existingPending) {

        alert(
            "A 24-hour stop request is already active for this limit."
        );

        return;
    }


    deleteTargetId =
        limit.id;


    document
        .getElementById("deleteRequestName")
        .textContent =
            `${limit.name} will enter a 24-hour waiting period.`;


    closeModal("limitFormModal");


    document
        .getElementById("deleteRequestModal")
        .classList.remove("hidden");

}


// ============================================================
// START 24-HOUR WAITING PERIOD
// ============================================================

async function startDeletion(onDataChanged) {

    if (!deleteTargetId) {
        return;
    }


    const limits =
        await getAllData("limits");


    const limit =
        limits.find(
            item =>
                item.id ===
                deleteTargetId
        );


    if (!limit || limit.active !== true) {

        deleteTargetId = null;

        closeModal("deleteRequestModal");

        return;
    }


    const request = {

        limitId:

            deleteTargetId,

        requestedAt:

            Date.now(),

        status:

            "pending"

    };


    await putData(
        "deletionRequests",
        request
    );


    closeModal(
        "deleteRequestModal"
    );


    alert(
        "Deletion waiting period started.\n\n" +
        "You have 24 hours to reconsider."
    );


    deleteTargetId = null;


    await onDataChanged();

}


// ============================================================
// CHECK 24-HOUR REQUESTS
// ============================================================

async function checkPendingDeletions() {

    const requests =
        await getAllData(
            "deletionRequests"
        );


    if (!requests.length) {
        return;
    }


    const limits =
        await getAllData("limits");


    const now =
        Date.now();


    const twentyFourHours =
        24 * 60 * 60 * 1000;


    for (
        const request of requests
    ) {

        // Only pending requests are checked
        if (
            request.status !==
            "pending"
        ) {
            continue;
        }


        // 24 hours not completed yet
        if (
            now -
            request.requestedAt <
            twentyFourHours
        ) {
            continue;
        }


        const limit =
            limits.find(
                item =>
                    item.id ===
                    request.limitId
            );


        // Limit doesn't exist
        if (!limit) {
            continue;
        }


        // Already stopped
        if (limit.active !== true) {
            continue;
        }


        deleteTargetId =
            limit.id;


        document
            .getElementById("finalDeleteName")
            .textContent =
                `${limit.name} is ready to be stopped.`;


        document
            .getElementById("finalDeleteModal")
            .classList.remove("hidden");


        // Only one confirmation at a time
        break;
    }

}


// ============================================================
// FINISH DELETION AFTER 24 HOURS
// ============================================================

async function finishDeletion(onDataChanged) {

    if (!deleteTargetId) {
        return;
    }


    const limits =
        await getAllData("limits");


    const limit =
        limits.find(
            item =>
                item.id ===
                deleteTargetId
        );


    if (!limit) {

        deleteTargetId = null;

        closeModal(
            "finalDeleteModal"
        );

        return;
    }


    // ========================================================
    // IMPORTANT
    //
    // We DO NOT delete:
    // - limit history
    // - records
    // - dates
    //
    // We only stop tracking this limit.
    // ========================================================

    limit.active =
        false;


    limit.stoppedAt =
        new Date().toISOString();


    await putData(
        "limits",
        limit
    );


    // Mark the request as completed
    await putData(
        "deletionRequests",
        {
            limitId:
                deleteTargetId,

            requestedAt:
                0,

            completedAt:
                new Date().toISOString(),

            status:
                "completed"
        }
    );


    closeModal(
        "finalDeleteModal"
    );


    alert(
        `${limit.name} has been stopped.\n\n` +
        "Its old history is still preserved."
    );


    deleteTargetId = null;


    await onDataChanged();

}


// ============================================================
// KEEP LIMIT AFTER 24 HOURS
// ============================================================

async function cancelDeletion(onDataChanged) {

    if (!deleteTargetId) {
        return;
    }


    const limits =
        await getAllData("limits");


    const limit =
        limits.find(
            item =>
                item.id ===
                deleteTargetId
        );


    if (!limit) {

        deleteTargetId = null;

        closeModal(
            "finalDeleteModal"
        );

        return;
    }


    // Keep the limit active.
    // Mark the deletion request as cancelled.

    await putData(
        "deletionRequests",
        {
            limitId:
                deleteTargetId,

            requestedAt:
                0,

            cancelledAt:
                new Date().toISOString(),

            status:
                "cancelled"
        }
    );


    closeModal(
        "finalDeleteModal"
    );


    alert(
        `${limit.name} will continue to be tracked.`
    );


    deleteTargetId = null;


    await onDataChanged();

}


// ============================================================
// CLOSE MODAL HELPER
// ============================================================

function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}
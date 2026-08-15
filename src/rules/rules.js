// ============================================================
// MY LIMITS - RULE ENGINE
// ============================================================
//
// Handles:
//
// 1. Monthly limits
// 2. Weekly limits
// 3. Usage calculation
// 4. Limit violations
// 5. Next-period deductions
// 6. Punishments
// 7. Punishment completion
//
// IMPORTANT:
//
// Every violation is linked to the EXACT record that caused it.
//
// Record
//    ↓
// recordId
//    ↓
// Violation
//
// This prevents deleting one record from accidentally deleting
// another violation from the same date.
//
// ============================================================

import {
    getAllData,
    putData
} from "../db/database.js";


// ============================================================
// SAFE CONSTRUCTIVE PUNISHMENTS
// ============================================================

const PUNISHMENTS = [

    {
        title:
            "20-minute focused study",

        description:
            "Spend 20 minutes learning or improving a useful skill."
    },

    {
        title:
            "15-minute room or desk cleanup",

        description:
            "Clean and organize your room, desk, or personal space for 15 minutes."
    },

    {
        title:
            "20-minute reading session",

        description:
            "Read a book or useful educational material for 20 minutes."
    },

    {
        title:
            "20-minute walk",

        description:
            "Take a normal 20-minute walk at a comfortable pace."
    },

    {
        title:
            "15-minute personal organization",

        description:
            "Organize your files, clothes, study materials, or another personal area for 15 minutes."
    }

];


// ============================================================
// FORMAT DATE
// ============================================================

export function formatDate(date) {

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
// NORMALIZE DATE
// ============================================================

function normalizeDate(date) {

    if (
        !(date instanceof Date)
    ) {

        date =
            new Date(
                date
            );

    }


    return new Date(

        date.getFullYear(),

        date.getMonth(),

        date.getDate(),

        12,
        0,
        0,
        0

    );

}


// ============================================================
// MONTH RANGE
// ============================================================

function getMonthRange(date) {

    const d =
        normalizeDate(
            date
        );


    return {

        start:
            new Date(
                d.getFullYear(),
                d.getMonth(),
                1,
                0,
                0,
                0,
                0
            ),

        end:
            new Date(
                d.getFullYear(),
                d.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            )

    };

}


// ============================================================
// WEEK RANGE
//
// Monday → Sunday
// ============================================================

function getWeekRange(date) {

    const d =
        normalizeDate(
            date
        );


    const day =
        d.getDay();


    const daysFromMonday =
        day === 0
            ? 6
            : day - 1;


    const start =
        new Date(
            d
        );


    start.setDate(
        start.getDate() -
        daysFromMonday
    );


    start.setHours(
        0,
        0,
        0,
        0
    );


    const end =
        new Date(
            start
        );


    end.setDate(
        end.getDate() +
        6
    );


    end.setHours(
        23,
        59,
        59,
        999
    );


    return {

        start,

        end

    };

}


// ============================================================
// GET PERIOD RANGE
// ============================================================

export function getPeriodRange(
    period,
    date
) {

    const referenceDate =
        normalizeDate(
            date ||
            new Date()
        );


    if (
        period ===
        "weekly"
    ) {

        return getWeekRange(
            referenceDate
        );

    }


    return getMonthRange(
        referenceDate
    );

}


// ============================================================
// GET NEXT PERIOD START
// ============================================================

export function getNextPeriodStart(
    period,
    date
) {

    const range =
        getPeriodRange(
            period,
            date
        );


    const next =
        new Date(
            range.start
        );


    if (
        period ===
        "weekly"
    ) {

        next.setDate(
            next.getDate() +
            7
        );

    }

    else {

        next.setMonth(
            next.getMonth() +
            1
        );

    }


    return next;

}


// ============================================================
// GET PERIOD KEY
// ============================================================

export function getPeriodKey(
    period,
    date
) {

    const range =
        getPeriodRange(
            period,
            date
        );


    return formatDate(
        range.start
    );

}


// ============================================================
// GET CARRYOVER DEDUCTION
// ============================================================
//
// Example:
//
// August Burger limit = 4
//
// User exceeds August.
//
// Chooses deduction.
//
// September:
//
// Base limit = 4
// Deduction = 1
// Effective limit = 3
//
// IMPORTANT:
//
// The deduction exists only while the violation exists.
//
// If the exact violating record is removed and its violation
// is removed, this deduction automatically disappears.
//
// ============================================================

export async function getCarryoverDeduction(
    limitId,
    referenceDate
) {

    const limits =
        await getAllData(
            "limits"
        );


    const limit =
        limits.find(
            item =>
                item.id ===
                limitId
        );


    if (!limit) {

        return 0;

    }


    const violations =
        await getAllData(
            "violations"
        );


    const currentPeriod =
        getPeriodRange(
            limit.period,
            referenceDate
        );


    const currentPeriodStart =
        formatDate(
            currentPeriod.start
        );


    const deductions =
        violations.filter(
            violation => {

                return (

                    violation.limitId ===
                    limitId

                    &&

                    violation.consequenceType ===
                    "deduct"

                    &&

                    violation.deductionTargetPeriodStart ===
                    currentPeriodStart

                );

            }
        ).length;


    return deductions;

}


// ============================================================
// GET USAGE
// ============================================================

export async function getUsage(
    limitId,
    referenceDate
) {

    const date =
        normalizeDate(
            referenceDate ||
            new Date()
        );


    const limits =
        await getAllData(
            "limits"
        );


    const limit =
        limits.find(
            item =>
                item.id ===
                limitId
        );


    if (!limit) {

        return {

            used:
                0,

            baseAllowed:
                0,

            deduction:
                0,

            allowed:
                0,

            remaining:
                0,

            exceeded:
                false,

            overBy:
                0,

            period:
                "monthly",

            start:
                formatDate(
                    date
                ),

            end:
                formatDate(
                    date
                )

        };

    }


    const records =
        await getAllData(
            "records"
        );


    const range =
        getPeriodRange(
            limit.period,
            date
        );


    const startDate =
        formatDate(
            range.start
        );


    const endDate =
        formatDate(
            range.end
        );


    // --------------------------------------------------------
    // COUNT RECORDS
    // --------------------------------------------------------

    const used =
        records.filter(
            record => {

                return (

                    record.limitId ===
                    limitId

                    &&

                    record.date >=
                    startDate

                    &&

                    record.date <=
                    endDate

                );

            }
        ).length;


    // --------------------------------------------------------
    // BASE LIMIT
    // --------------------------------------------------------

    const baseAllowed =
        Number(
            limit.limit
        );


    // --------------------------------------------------------
    // PREVIOUS VIOLATION DEDUCTIONS
    // --------------------------------------------------------

    const deduction =
        await getCarryoverDeduction(
            limitId,
            date
        );


    // --------------------------------------------------------
    // EFFECTIVE LIMIT
    // --------------------------------------------------------

    const allowed =
        Math.max(
            0,
            baseAllowed -
            deduction
        );


    const remaining =
        allowed -
        used;


    return {

        used,

        baseAllowed,

        deduction,

        allowed,

        remaining,

        exceeded:
            used >=
            allowed,

        overBy:
            Math.max(
                0,
                used -
                allowed
            ),

        period:
            limit.period,

        start:
            startDate,

        end:
            endDate

    };

}


// ============================================================
// CHECK RECORD
// ============================================================

export async function checkRecord(
    limitId,
    date
) {

    const limits =
        await getAllData(
            "limits"
        );


    const limit =
        limits.find(
            item =>
                item.id ===
                limitId
        );


    if (!limit) {

        return {

            allowed:
                false,

            needsConfirmation:
                false,

            reason:
                "Limit not found."

        };

    }


    if (
        limit.active !==
        true
    ) {

        return {

            allowed:
                false,

            needsConfirmation:
                false,

            reason:
                "This limit is inactive."

        };

    }


    const usage =
        await getUsage(
            limitId,
            date
        );


    if (
        usage.used <
        usage.allowed
    ) {

        return {

            allowed:
                true,

            needsConfirmation:
                false,

            usage

        };

    }


    return {

        allowed:
            false,

        needsConfirmation:
            true,

        usage

    };

}


// ============================================================
// CREATE VIOLATION
// ============================================================
//
// IMPORTANT:
//
// recordId is now REQUIRED for new violations.
//
// This connects:
//
// exact record
//      ↓
// exact violation
//
// ============================================================

export async function recordViolation(
    limitId,
    date,
    recordId
) {

    const limits =
        await getAllData(
            "limits"
        );


    const limit =
        limits.find(
            item =>
                item.id ===
                limitId
        );


    if (!limit) {

        return null;

    }


    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (!recordId) {

        console.error(
            "❌ Cannot create violation without recordId."
        );


        return null;

    }


    // --------------------------------------------------------
    // VERIFY RECORD EXISTS
    // --------------------------------------------------------

    const records =
        await getAllData(
            "records"
        );


    const record =
        records.find(
            item =>
                item.id ===
                recordId
        );


    if (!record) {

        console.error(
            "❌ Cannot create violation. Record not found."
        );


        return null;

    }


    // --------------------------------------------------------
    // MAKE SURE RECORD BELONGS TO THIS LIMIT
    // --------------------------------------------------------

    if (
        record.limitId !==
        limitId
    ) {

        console.error(
            "❌ Record does not belong to this limit."
        );


        return null;

    }


    const usage =
        await getUsage(
            limitId,
            date
        );


    const nextPeriodStart =
        getNextPeriodStart(
            limit.period,
            date
        );


    const violation = {

        id:
            "violation-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2),

        // ----------------------------------------------------
        // EXACT RECORD LINK
        // ----------------------------------------------------

        recordId:
            recordId,

        limitId:

            limitId,

        date:

            formatDate(
                normalizeDate(
                    date
                )
            ),

        period:

            usage.period,

        periodStart:

            usage.start,

        periodEnd:

            usage.end,

        allowedAtViolation:

            usage.allowed,

        usedAtViolation:

            usage.used,

        createdAt:

            new Date().toISOString(),

        // ----------------------------------------------------
        // CONSEQUENCE
        // ----------------------------------------------------

        consequenceType:

            "pending",

        consequenceStatus:

            "pending",

        deductionTargetPeriodStart:

            formatDate(
                nextPeriodStart
            ),

        punishmentTitle:

            null,

        punishmentDescription:

            null,

        punishmentCompletedAt:

            null

    };


    await putData(
        "violations",
        violation
    );


    return violation;

}


// ============================================================
// APPLY NEXT PERIOD DEDUCTION
// ============================================================

export async function applyDeduction(
    violationId
) {

    const violations =
        await getAllData(
            "violations"
        );


    const violation =
        violations.find(
            item =>
                item.id ===
                violationId
        );


    if (!violation) {

        return null;

    }


    violation.consequenceType =
        "deduct";


    violation.consequenceStatus =
        "applied";


    violation.consequenceUpdatedAt =
        new Date().toISOString();


    await putData(
        "violations",
        violation
    );


    return violation;

}


// ============================================================
// ASSIGN PUNISHMENT
// ============================================================

export async function assignPunishment(
    violationId
) {

    const violations =
        await getAllData(
            "violations"
        );


    const violation =
        violations.find(
            item =>
                item.id ===
                violationId
        );


    if (!violation) {

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            PUNISHMENTS.length
        );


    const punishment =
        PUNISHMENTS[index];


    violation.consequenceType =
        "punishment";


    violation.consequenceStatus =
        "pending";


    violation.punishmentTitle =
        punishment.title;


    violation.punishmentDescription =
        punishment.description;


    violation.punishmentCompletedAt =
        null;


    violation.consequenceUpdatedAt =
        new Date().toISOString();


    await putData(
        "violations",
        violation
    );


    return violation;

}


// ============================================================
// COMPLETE PUNISHMENT
// ============================================================

export async function completePunishment(
    violationId
) {

    const violations =
        await getAllData(
            "violations"
        );


    const violation =
        violations.find(
            item =>
                item.id ===
                violationId
        );


    if (!violation) {

        return null;

    }


    if (
        violation.consequenceType !==
        "punishment"
    ) {

        return null;

    }


    violation.consequenceStatus =
        "completed";


    violation.punishmentCompletedAt =
        new Date().toISOString();


    await putData(
        "violations",
        violation
    );


    return violation;

}


// ============================================================
// GET PENDING PUNISHMENTS
// ============================================================

export async function getPendingPunishments() {

    const violations =
        await getAllData(
            "violations"
        );


    return violations.filter(
        violation => {

            return (

                violation.consequenceType ===
                "punishment"

                &&

                violation.consequenceStatus ===
                "pending"

            );

        }
    );

}
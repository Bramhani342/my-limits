// ============================================================
// MY LIMITS - LOCAL DATABASE
// ============================================================
//
// This file is responsible for storing all app data locally.
//
// We use IndexedDB because:
// - It works offline
// - It can store much more data than localStorage
// - It survives closing/reopening the app
// - It works well for calendar history
//
// ============================================================

const DB_NAME = "MyLimitsDB";
const DB_VERSION = 1;


// ------------------------------------------------------------
// Open database
// ------------------------------------------------------------

export function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(DB_NAME, DB_VERSION);


        // ----------------------------------------------------
        // First time database is created
        // ----------------------------------------------------

        request.onupgradeneeded = (event) => {

            const db = event.target.result;


            // -----------------------------------------------
            // LIMITS
            //
            // Stores things like:
            //
            // Cool Drink → 1/month
            // Burger     → 4/month
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("limits")) {

                const limitsStore =
                    db.createObjectStore(
                        "limits",
                        { keyPath: "id" }
                    );

                limitsStore.createIndex(
                    "active",
                    "active",
                    { unique: false }
                );

            }


            // -----------------------------------------------
            // RECORDS
            //
            // Stores what the user consumed on each date.
            //
            // Example:
            //
            // 2026-08-15
            // Burger
            //
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("records")) {

                const recordsStore =
                    db.createObjectStore(
                        "records",
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                recordsStore.createIndex(
                    "date",
                    "date",
                    { unique: false }
                );

                recordsStore.createIndex(
                    "limitId",
                    "limitId",
                    { unique: false }
                );

            }


            // -----------------------------------------------
            // SETTINGS
            //
            // General app settings.
            //
            // Example:
            // PIN enabled
            // notification settings
            // app preferences
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("settings")) {

                db.createObjectStore(
                    "settings",
                    { keyPath: "key" }
                );

            }


            // -----------------------------------------------
            // DELETION REQUESTS
            //
            // Used for your 24-hour deletion system.
            //
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("deletionRequests")) {

                db.createObjectStore(
                    "deletionRequests",
                    { keyPath: "limitId" }
                );

            }


            // -----------------------------------------------
            // VIOLATIONS
            //
            // Stores cases where you went beyond your limit.
            //
            // This will be used later for:
            //
            // - punishment
            // - next month deduction
            // - statistics
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("violations")) {

                const violationsStore =
                    db.createObjectStore(
                        "violations",
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                violationsStore.createIndex(
                    "limitId",
                    "limitId",
                    { unique: false }
                );

                violationsStore.createIndex(
                    "date",
                    "date",
                    { unique: false }
                );

            }


            // -----------------------------------------------
            // CONSEQUENCES
            //
            // Stores future punishment / deduction rules.
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("consequences")) {

                db.createObjectStore(
                    "consequences",
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }


            // -----------------------------------------------
            // ARCHIVED LIMITS
            //
            // When you stop tracking something, we DON'T
            // erase it.
            //
            // Its old information can be moved here later.
            // -----------------------------------------------

            if (!db.objectStoreNames.contains("archivedLimits")) {

                db.createObjectStore(
                    "archivedLimits",
                    { keyPath: "id" }
                );

            }

        };


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(
                new Error(
                    "Could not open My Limits database."
                )
            );

        };

    });

}


// ------------------------------------------------------------
// ADD / UPDATE DATA
// ------------------------------------------------------------

export async function putData(
    storeName,
    data
) {

    const db =
        await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                storeName
            );


        const request =
            store.put(data);


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


// ------------------------------------------------------------
// GET ONE ITEM
// ------------------------------------------------------------

export async function getData(
    storeName,
    key
) {

    const db =
        await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readonly"
            );


        const store =
            transaction.objectStore(
                storeName
            );


        const request =
            store.get(key);


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


// ------------------------------------------------------------
// GET ALL ITEMS
// ------------------------------------------------------------

export async function getAllData(
    storeName
) {

    const db =
        await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readonly"
            );


        const store =
            transaction.objectStore(
                storeName
            );


        const request =
            store.getAll();


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


// ------------------------------------------------------------
// DELETE ONE ITEM
// ------------------------------------------------------------

export async function deleteData(
    storeName,
    key
) {

    const db =
        await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                storeName
            );


        const request =
            store.delete(key);


        request.onsuccess = () => {

            resolve();

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


// ------------------------------------------------------------
// CLEAR A STORE
//
// We probably won't use this in normal app operation.
// It is useful for development/testing.
// ------------------------------------------------------------

export async function clearStore(
    storeName
) {

    const db =
        await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                storeName,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                storeName
            );


        const request =
            store.clear();


        request.onsuccess = () => {

            resolve();

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}
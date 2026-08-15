// ============================================================
// CALENDAR
// ============================================================

export function createCalendar({
    month,
    records,
    onDateClick
}) {

    const year =
        month.getFullYear();

    const monthNumber =
        month.getMonth();


    const monthName =
        month.toLocaleString(
            "en-IN",
            {
                month: "long"
            }
        );


    document
        .getElementById(
            "monthYear"
        )
        .textContent =
            `${monthName} ${year}`;


    const container =
        document.getElementById(
            "calendarDays"
        );


    container.innerHTML = "";


    // First day of month
    const firstDay =
        new Date(
            year,
            monthNumber,
            1
        ).getDay();


    // Number of days
    const totalDays =
        new Date(
            year,
            monthNumber + 1,
            0
        ).getDate();


    // Empty spaces
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-empty";


        container.appendChild(
            empty
        );

    }


    const today =
        formatDate(
            new Date()
        );


    // Create days
    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                year,
                monthNumber,
                day
            );


        const key =
            formatDate(date);


        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.className =
            "calendar-day";


        button.textContent =
            day;


        // Today
        if (key === today) {

            button.classList.add(
                "today"
            );

        }


        // Records on this day
        const dayRecords =
            records.filter(
                record =>
                    record.date === key
            );


        if (dayRecords.length > 0) {

            button.classList.add(
                "has-record"
            );


            const dot =
                document.createElement(
                    "span"
                );


            dot.className =
                "record-dot";


            button.appendChild(
                dot
            );

        }


        button.addEventListener(
            "click",
            () => {

                onDateClick(date);

            }
        );


        container.appendChild(
            button
        );

    }

}


// ============================================================
// CHANGE MONTH
// ============================================================

export function changeCalendarMonth(
    currentMonth,
    amount
) {

    const newMonth =
        new Date(
            currentMonth
        );


    newMonth.setMonth(
        newMonth.getMonth() +
        amount
    );


    return newMonth;

}


// ============================================================
// SET MONTH
// ============================================================

export function setCalendarMonth(
    date
) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );

}


// ============================================================
// DATE KEY
// ============================================================

function formatDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
);

const L = (str) =>
    ({
        Saturday: "Shabbos - " + getCurrentParsha(),
    }[str] || str);

const getCurrentParsha = () =>
    toTitleCase(
        KosherZmanim.Parsha[
            new KosherZmanim.JewishCalendar(
                moment().startOf("week").add(6, "days").toDate()
            ).getParsha()
        ]
    );

const toTitleCase = (str) =>
    str
        .split(" ")
        .map((word) =>
            word
                .split("")
                .map((c, i) => (i === 0 ? c.toUpperCase() : c.toLowerCase()))
                .join("")
        )
        .join("");

const today = new Date().toISOString();
const options = {
    date: today,
    timeZoneId: "America/New_York",
    locationName: "Monsey",
    latitude: 41.137804,
    longitude: -74.044059,
    elevation: 169, //  meters
    complexZmanim: true,
};
json = KosherZmanim.getZmanimJson(options);
console.log(JSON.stringify(json, null, 2));
const round = (m) => {
    const DOW = m.day();
    if (DOW === 5) {
        // Friday
    } else if (DOW === 6) {
        // Shabbos
    } else {
    }
};
const isFriday = (m) => 5 === m.day();
const isShabbos = (m) => 6 === m.day();
const isFridayShabbos = (m) => isFriday(m) && isShabbos(m);

const roundDown = (m, lechumra = false) => {
    let ret = m.startOf("minute");
    if (lechumra) {
        ret = ret.subtract(isFridayShabbos(m) ? 1 : 0, "minute");
    }
    return ret;
};
const roundUp = (m, lechumra = false) => {
    let ret = m.add(1, "minute").startOf("minute");
    if (lechumra) {
        ret = ret.add(isFridayShabbos(m) ? 1 : 0, "minute");
    }
    return ret;
};
const getZmanim = (m) => {
    const options = {
        date: m.toDate(),
        timeZoneId: "America/New_York",
        locationName: "Monsey",
        latitude: 41.137804,
        longitude: -74.044059,
        elevation: 169,
        complexZmanim: true,
    };
    const { Zmanim } = KosherZmanim.getZmanimJson(options);

    // Handle Zmanim Lechumra
    ["SofZmanShmaGRA", "SofZmanShmaMGA", "SofZmanTfilaGRA"].map(
        (key) => (Zmanim[key] = roundDown(moment(Zmanim[key]), false))
    );

    ["SeaLevelSunset", "CandleLighting", "Tzais72"].map(
        (key) =>
            (Zmanim[key] = isFriday(m)
                ? roundDown(moment(Zmanim[key]), true)
                : isShabbos(m)
                ? roundUp(moment(Zmanim[key]), true)
                : roundDown(moment(Zmanim[key]), false))
    );

    ["SeaLevelSunrise"].map(
        (key) => (Zmanim[key] = roundUp(moment(Zmanim[key]), false))
    );
    return Zmanim;
};
const friday = moment().startOf("week").add(6, "days");
const shabbos = moment().startOf("week").add(7, "days");

const renderZmanTable = () => {
    const today = moment();
    let todaysZmanim = getZmanim(today);
    const keys = [
        "SeaLevelSunrise",
        "SofZmanShmaMGA",
        "SofZmanShmaGRA",
        "SofZmanTfilaGRA",
        "Chatzos",
        "CandleLighting",
        "SeaLevelSunset",
        "Tzais72",
    ];
    return `<table>
        <thead>
        <tr>
        <th>Date</th>
        ${keys.map((key) => `<th>${key}</th>`).join("")}
        </tr>
        </thead>
        <tbody>
        ${[...new Array(30)]
            .map((_, i) => {
                let date = today.add(1, "days");
                let zmanim = getZmanim(date);
                return `
                    <tr>
                    <td>${date.format("LL")}</td>
                    ${keys
                        .map(
                            (key) => `
                            <td style="text-align:center;">${moment(
                                zmanim[key]
                            ).format("LT")}</td>`
                        )
                        .join("")}</tr>`;
            })
            .join("")}
        </tbody>
    </table>`;
};

// document.body.innerHTML = renderZmanTable();

const getSchedule = (m) => {
    const EVENTS = {
        sundayShacharis: {
            label: "Shacharis",
            value: "8:15 AM",
        },
        yorucha: {
            label: "Yorucha",
            value: "9:30 AM",
        },
        minchaMariv: {
            label: "Mincha/Mariv",
            value: moment(getZmanim(m).Sunset).subtract(12, "minutes"),
        },
        oraissa: {
            label: "Oraissa",
            value: "6:00 AM",
        },
        shacharis: {
            label: "Shacharis",
            value: "7:00 AM",
        },
        dafMorning: {
            label: "Daf Yomi",
            value: "Following Shacharis",
        },
        dafEvening: {
            label: "Daf Yomi",
            value: "9:00 PM",
        },
        mariv: {
            label: "Mariv",
            value: "8:15 PM",
        },
        parshaShiur: {
            label: "Parsha Shiur",
            value: "8:30 - 9:00 PM",
        },
        shabbosShacharis: {
            label: "Shacharis",
            value: "8:45 AM",
        },
        shabbosEarlyMincha: {
            label: "Early Mincha",
            value: "1:45 PM",
        },
        tehillim: {
            label: "Tehillim",
            value: "2:30 PM",
        },
        shabbosOraissa: {
            label: "Oraissa",
            value: moment(getZmanim(m).SeaLevelSunset)
                .subtract(35, "minutes")
                .subtract(1, "hours"),
        },
        shabbosMincha: {
            label: "Mincha",
            value: moment(getZmanim(m).SeaLevelSunset).subtract(35, "minutes"),
        },
        likrasShabbos: {
            label: "Likras Shabbos",
            value: moment(getZmanim(m).CandleLighting)
                .add(8, "minutes")
                .subtract(20, "minutes"),
        },
        shabbosMariv: {
            label: "Mariv Motzei Shabbos",
            value: moment(getZmanim(m).SeaLevelSunset).add(50, "minutes"),
        },
        shabbosHavdala: {
            label: "Havdalah",
            value: moment(getZmanim(m).Tzais),
        },
        shabbosDayDaf: {
            label: "Daf Yomi",
            value: moment(getZmanim(m).SeaLevelSunset)
                .subtract(35, "minutes")
                .subtract(1, "hours"),
        },
        dafYomiFridayNight: {
            label: "Daf Yomi",
            value: "8:15 PM",
        },
        shabbosAvosUbanim: {
            label: "Avos Ubanim",
            value: "7:10 PM",
            // m.isSame(moment("2021-01-16"), "day") ||
            // m.isSame(moment("2021-01-23"), "day")
            //     ? m.hour(6).minutes(40)
            //     : m.isSame(moment("2021-02-6"), "day") ||
            //       m.isSame(
            //           moment(
            //               "2021-February 12, 2021	6:55 AM	8:56 AM	9:32 AM	10:25 AM	12:10 PM	5:09 PM	5:27 PM	6:39 PM01-30"
            //           ),
            //           "day"
            //       )
            //     ? m.hour(6).minutes(45)
            //     : m.isSame(moment("2021-02-13"), "day") ||
            //       m.isSame(moment("2021-02-20"), "day")
            //     ? m.hour(7).minutes(0)
            //     : "TBD",
        },
        minchaErevShabbos: {
            label: "Mincha Erev Shabbos",
            value: moment(getZmanim(m).CandleLighting).add(5, "minutes"),
        },
        candleLighting: {
            label: "Candle Lighting",
            value: roundDown(moment(getZmanim(m).CandleLighting)),
        },
    };
    let schedule = [];

    switch (m.weekday()) {
        case 0: // sunday
            schedule = [
                EVENTS.sundayShacharis,
                EVENTS.yorucha,
                EVENTS.minchaMariv,
            ];
            break;
        case 1: // mon
        case 2: // tue
        case 3: // wed
            schedule = [
                EVENTS.oraissa,
                EVENTS.shacharis,
                EVENTS.dafMorning,
                EVENTS.mariv,
                EVENTS.dafEvening,
            ];
            break;
        case 4: // thu
            schedule = [
                EVENTS.oraissa,
                EVENTS.shacharis,
                EVENTS.dafMorning,
                EVENTS.mariv,
                EVENTS.parshaShiur,
                EVENTS.dafEvening,
            ];
            break;
        case 5: // friday
            schedule = [
                EVENTS.shacharis,
                EVENTS.dafMorning,
                EVENTS.candleLighting,
                EVENTS.minchaErevShabbos,
                EVENTS.dafYomiFridayNight,
            ];
            break;
        case 6: // shabbos
            schedule = [
                EVENTS.shabbosShacharis,
                EVENTS.shabbosEarlyMincha,
                EVENTS.tehillim,
                EVENTS.shabbosOraissa,
                EVENTS.shabbosDayDaf,
                EVENTS.shabbosMincha,
                EVENTS.shabbosMariv,
                // EVENTS.shabbosHavdala,
                EVENTS.shabbosAvosUbanim,
            ];
            break;

        default:
    }
    return schedule;
};
const getNDaySchedule = (n) =>
    [...new Array(n)].reduce((prev, cur, i) => {
        const formatString = "dddd -- M/D";
        const today = moment();
        const dayN = moment().add(i, "day");
        const key = today.isSame(dayN, "day")
            ? `Today (${dayN
                  .format(formatString)
                  .replace("Saturday", "Shabbos")})`
            : dayN.format(formatString).replace("Saturday", "Shabbos");
        prev[key] = getSchedule(dayN);
        return prev;
    }, {});

const todaysZmanim = getZmanim(moment());
const schedules = {
    ...getNDaySchedule(isMobile ? 7 : 2),
    zmanim: [
        {
            label: "Neitz",
            value: moment(todaysZmanim.SeaLevelSunrise),
        },
        {
            label: 'Sof Krias Shema (MG"A)',
            value: moment(todaysZmanim.SofZmanShmaMGA),
        },
        {
            label: 'Sof Krias Shema (GR"A)',
            value: moment(todaysZmanim.SofZmanShmaGRA),
        },
        {
            label: 'Sof Zman Tefilla (GR"A)',
            value: moment(todaysZmanim.SofZmanTfilaGRA),
        },
        {
            label: "Chatzos",
            value: moment(todaysZmanim.Chatzos),
        },
        {
            label: "Shkia",
            value: moment(todaysZmanim.SeaLevelSunset),
        },
        {
            label: "Tzais (50)",
            value: moment(todaysZmanim.SeaLevelSunset).add(50, "minutes"),
        },
        {
            label: "Tzais (72)",
            value: moment(todaysZmanim.Tzais72),
        },
    ],
};

const renderSchedule = (schedule) =>
    schedule &&
    schedule
        .map(
            ({ label, value }) => `
              <div class="row">
                <div class="label">${label}</div>
                <div class="dots"></div>
        <div class="value">${
            typeof value === "string" ? value : value.format("LT")
        }</div>
              </div>
    `
        )
        .join("");

Object.keys(schedules).map((schedule) => {
    console.log(`Rendering ${schedule}`);
    let elem;
    try {
        elem = document.querySelector("." + schedule);
    } catch {}

    if (!elem) {
        elem = document.querySelector(".schedule");
        elem.innerHTML += `<h2>${schedule}</h2>`;
        elem.innerHTML += renderSchedule(schedules[schedule]);
    } else {
        elem.innerHTML = renderSchedule(schedules[schedule]);
    }
});

[...document.querySelectorAll(".parsha")].map(
    (elem) => (elem.innerHTML = getCurrentParsha())
);

const timeElements = [...document.querySelectorAll(".time")];
setInterval(() =>
    timeElements.map((elem) => (elem.innerHTML = moment().format("LTS")), 1000)
);
const hebrewDateElements = [...document.querySelectorAll(".hebrew-date")];
hebrewDateElements.map(
    (elem) =>
        (elem.innerHTML = new KosherZmanim.JewishCalendar(moment().toDate()))
);
const englishDateElements = [...document.querySelectorAll(".english-date")];
englishDateElements.map((elem) => (elem.innerHTML = moment().format("LL")));

if (!isMobile) setTimeout(() => window.location.reload(), 1000 * 60 * 60);

const mapElements = (cssSelector, callback) =>
    [...document.querySelectorAll(cssSelector)].map(
        (elem) => (elem.innerHTML = callback())
    );

const pageLoad = moment();
setInterval(
    () =>
        mapElements(
            ".refresh-time",
            () => "<small><i>Refreshed " + pageLoad.fromNow()
        ) + "...</i></small>",
    1000
);

let styles = `
    <style>
        .bg-white {
    background-color: white;
    }

    .up-arrow {
        border: solid black;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
    }

    .text-green {
        color: darkgreen;
    }

    .text-red {
        color: darkred;
    }

    .available-size {
        font-size: xx-large;
        text-align: center;
    }

    .text-center {
        text-align: center;
    }

    .scroll3{
        width: 100%;
        position: relative;
        overflow: visible;
    }
    </style>
`

$("body").append(styles);

let courseInformation = [];
let daysOfWeek = {
    "L": "LUNES",
    "K": "MARTES",
    "M": "MIÉRCOLES",
    "J": "JUEVES",
    "V": "VIERNES",
    "S": "SÁBADO",
    "D": "DOMINGO"
};
const MAX_HEIGHT_ALLOWED = 422;

$("tr[name ^= 'trOferta'] td input[name ^= 'chk']").on("change", e => {
    checkVisibility();
})

function checkVisibility() {
    let idInterval = setInterval(() => {
        if (!$("#ImgLoading").is(":visible")) {
            $("#divOfertaAcademica").removeClass("scroll2").addClass("scroll3");
            if ($("#divOfertaAcademica").height() > MAX_HEIGHT_ALLOWED) {
                $("#divOfertaAcademica").attr("style", "overflow:overlay")
            }
            clearInterval(idInterval);
            courseInformation = [];
            init();
        }
    }, 1000);
}

function init() {
    $("tr[name ^= 'TRHorario'] input[name ^= 'chk']").each((index, element) => {
        let url = $(element).attr("onclick");
        if (!url) return;
        let splitedUrl = url.split("&")
        parseUrl(splitedUrl);
    })

    $("tr[name ^= 'TRHorario']").mouseenter(e => {
        let index = $("tr[name ^= 'TRHorario']").index(e.currentTarget);
        $("#tableOferta").append(createTableInfo(index, e))
    }).mouseleave(e => {
        $("#table-details").remove();
        $(".up-arrow").remove();
    });
}

function parseUrl(splitedUrl) {
    let data = extractData(splitedUrl);
    courseInformation.push(data)
}

function extractData(splitedUrl) {
    let keyList = ["disponibles", "hrarel", "hraaul", "hrakey"];
    let data = splitedUrl.map((item, index) => {
        item = item.split("=");
        if (keyList.includes(item[0])) {
            return {
                [item[0]]: item[1]
            }
        }
        return false;
    });

    // Remove falsy values
    let filtedData = data.filter(Boolean);
    return mergeArrayOfObject(filtedData);
}

function mergeArrayOfObject(data) {
    return data.reduce((result, currentObject) => {
        for (const key in currentObject) {
            if (currentObject.hasOwnProperty(key)) {
                result[key] = currentObject[key];
            }
        }
        return result;
    }, {});
}

function createTableInfo(index, event) {
    let data = courseInformation[index];
    if (!data) return;
    let position = $(event.currentTarget).position()
    const day = getDayOfWeek(data['hrarel'], event.currentTarget, index);
    let secundRow = "";
    if (data["hrarel"].includes("-")) {
        secundRow = generateSecundRow(data);
    }

    let availableTextColor = +data['disponibles'] ? "text-green" : "text-red";

    let table = `
        <table border="2px black solid" id="table-details" style="position: absolute; top: ${position.top + 50}px; left: 80px; z-index: 9000;">
            <i class="up-arrow" style="position: absolute; top: ${position.top + 40}px; left: 260px"></i>
            <thead>
                <tr class="text-center">
                    <th>Cupos</th>
                    <th>Día(s)</th>
                    <th>H. Entrada</th>
                    <th>H. Salida</th>
                    <th>Aula</th>
                    <th>Grupo</th>
                </tr>
            </thead>
            <tbody>
                <tr class='bg-white text-center'>
                    <td rowspan="2" class='${availableTextColor} available-size'>${data['disponibles']}</td>
                    <td>${data['dayOne']}</td>
                    <td>${data['startHourOne']}</td>
                    <td>${data['endHourOne']}</td>
                    <td rowspan="2">${data['hraaul']}</td>
                    <td rowspan="2">${data['hrakey']}</td>
                </tr>
                ${secundRow}
            </tbody>
        </table>
    `;

    return table;
}

function generateSecundRow(data) {
    return `<tr class='bg-white text-center'>
                <td>${data['dayTwo']}</td>
                <td>${data['startHourTwo']}</td>
                <td>${data['endHourTwo']}</td>
            </tr>`
}

function getDayOfWeek(day, element, index) {
    let firstDay = "";
    let secundDay = "";
    if (day.includes("-")) {
        let days = day.split("-");
        firstDay = daysOfWeek[days[0]] + index;
        secundDay = daysOfWeek[days[1]] + index;
        courseInformation[index]["dayOne"] = daysOfWeek[days[0]];
        courseInformation[index]["dayTwo"] = daysOfWeek[days[1]];
    } else {
        firstDay = daysOfWeek[day] + index;
        courseInformation[index]["dayOne"] = daysOfWeek[day];
    }

    if (firstDay) {
        let hours = extractDate(firstDay, element)
        courseInformation[index]["startHourOne"] = hours.startHour;
        courseInformation[index]["endHourOne"] = hours.endHour;
    }

    if (secundDay) {
        let hours = extractDate(secundDay, element)
        courseInformation[index]["startHourTwo"] = hours.startHour;
        courseInformation[index]["endHourTwo"] = hours.endHour;
    }
}

function extractDate(selector, element) {
    selector = `#${selector.replace("Á", "A").replace("É", "E")}`;
    let hours = $(element).find(selector).text().replace(/[^\d:/\s]/g, "");
    hours = hours.split(" / ");
    return {
        startHour: extractHours(hours[0]),
        endHour: extractHours(hours[1]),
    }
}

function extractHours(hour) {
    let splitedHour = hour.split(":");
    hour = Number(splitedHour[0]);
    let meridiem = " AM";

    if (hour >= 12) {
        meridiem = " PM";
    }

    if (hour > 12) {
        hour -= 12;
    }

    splitedHour[0] = hour;
    return splitedHour.join(":") + meridiem;
}
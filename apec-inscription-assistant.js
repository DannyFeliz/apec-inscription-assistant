console.log("Hello");
// Remove the span with the bad property
$("#TableOfertaMatricula").find("div + span").remove();
Vue.config.productionTip = false;

new Vue({
    el: "#contentTwoColumn",
    data: {
        test: "some",
        courseInformation: [],
        daysOfWeek: {
            "L": "LUNES",
            "K": "MARTES",
            "M": "MIÉRCOLES",
            "J": "JUEVES",
            "V": "VIERNES",
            "S": "SÁBADO",
            "D": "DOMINGO"
        },
        coordinates: {
            x: 0,
            y: 0
        },
        secondDay: ""
    },
    mounted() {
        $(document).on("mousemove", event => {
            this.coordinates = {
                x: event.screenX,
                y: event.screenY
            }
        });

        this.run();


    },
    methods: {
        run() {
            // $("tr[name ^= 'TRHorario']")
            $("tr[name ^= 'TRHorario'] input[name ^= 'chk']").each((index, element) => {
                let splitedUrl = $(element).attr("onclick").split("&")
                this.parseUrl(splitedUrl);
                // console.log(element);
            })

            $("tr[name ^= 'TRHorario']").mouseenter(e => {
                let index = $("tr[name ^= 'TRHorario']").index(e.currentTarget);
                $("#tableOferta").append(this.createTableInfo(index, e))
                    // this.createTableInfo(index, e)
                    // console.log(e);
            }).mouseleave(e => {
                $("#table-details").remove();
                $(".up-arrow").remove();
            });

        },
        parseUrl(splitedUrl) {
            let data = this.extractData(splitedUrl);

            this.courseInformation.push(data)
        },
        extractData(splitedUrl) {
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
            return this.mergeArrayOfObject(filtedData);
        },
        mergeArrayOfObject(data) {
            return data.reduce((result, currentObject) => {
                for (const key in currentObject) {
                    if (currentObject.hasOwnProperty(key)) {
                        result[key] = currentObject[key];
                    }
                }
                return result;
            }, {});
        },
        createTableInfo(index, event) {
            let data = this.courseInformation[index];
            let position = $(event.currentTarget).position()
                // const day = this.getDayOfWeek(data['hrarel']);
            const day = this.getDayOfWeek2(data['hrarel'], event.currentTarget, index);
            let secundRow = "";
            if (data["hrarel"].includes("-")) {
                secundRow = this.generateSecundRow(data);
            }

            let availableTextColor = +data['disponibles'] ? "text-green" : "text-red";

            let table = `
                <table border="2px black solid" id="table-details" style="position: absolute; top: ${position.top + 50}px; left: 80px">
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
        },
        generateSecundRow(data) {
            return `<tr class='bg-white text-center'>
                        <td>${data['dayTwo']}</td>
                        <td>${data['startHourTwo']}</td>
                        <td>${data['endHourTwo']}</td>
                    </tr>`
        },
        getDayOfWeek(day) {
            if (day.includes("-")) {
                let days = day.split("-");
                this.secundDay = this.daysOfWeek[days[1]];
                return `${this.daysOfWeek[days[0]]} Y ${this.secundDay}`
            }
            this.secundDay = "";
            return this.daysOfWeek[day];
        },
        getDayOfWeek2(day, element, index) {
            let firstDay = "";
            let secundDay = "";
            if (day.includes("-")) {
                let days = day.split("-");
                firstDay = this.daysOfWeek[days[0]] + index;
                secundDay = this.daysOfWeek[days[1]] + index;
                this.courseInformation[index]["dayOne"] = this.daysOfWeek[days[0]];
                this.courseInformation[index]["dayTwo"] = this.daysOfWeek[days[1]];
            } else {
                firstDay = this.daysOfWeek[day] + index;
                this.courseInformation[index]["dayOne"] = this.daysOfWeek[day];
                this.secundDay = "";
            }

            if (firstDay) {
                let hours = this.extractDate(firstDay, element)
                this.courseInformation[index]["startHourOne"] = hours.startHour;
                this.courseInformation[index]["endHourOne"] = hours.endHour;
            }

            if (secundDay) {
                let hours = this.extractDate(secundDay, element)
                this.courseInformation[index]["startHourTwo"] = hours.startHour;
                this.courseInformation[index]["endHourTwo"] = hours.endHour;
            }
        },
        extractDate(selector, element) {
            selector = `#${selector.replace("Á", "A").replace("É", "E")}`;
            let hours = $(element).find(selector).text().replace(/[^\d:/\s]/g, "");
            hours = hours.split(" / ");
            return {
                startHour: this.extractHours(hours[0]),
                endHour: this.extractHours(hours[1]),
            }
        },
        extractHours(hour) {
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
    }
})
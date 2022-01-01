Vue.component("booking", {
    props: ["id"],
    // Tässä on html sivulle vietävä tieto <booking> elementtiin
    template: `<div :class="'component booking ' + id">
                    <h2 v-if="afterSubmit">Olemme vastaanottaneet ajanvarauksesi onnistuneesti!</h2>
                    <span class="notifications first-noti animated shake">Valitse päivämäärä ennen ajan valitsemista</span>
                    <span class="notifications second-noti animated shake">Valitse päivämäärä ennen lähettämistä</span>
                    <span class="notifications third-noti animated shake">Ole hyvä ja valitse päivämäärä ennen lähettämistä</span>
                    <span class="notifications last-noti animated shake">Ole hyvä ja kirjoita nimesi ennen lähettämistä</span>

                    <div v-if="!afterSubmit">
                    <h1 class="h1resize">Varaa hiustenleikkuu</h1>
                        <form v-on:submit.prevent>
                            <div class="input-field">
                                <input id="name" type="text" class="validate" v-model="customerName">
                                <label for="name" class="customerinfo">Nimesi</label>
                            </div>
                            <div class="input-field">
                                <input id="phone" type="text" class="validate" v-model="customerNumber">
                                <label for="phone" class="customerinfo">Puhelin numero</label>
                            </div>

                            <input type="text" class="datepicker" placeholder="Valitse päivämäärä">

                            <div class="select-time" @click="checkDate"><p>Katso vapaat ajat</p></div>
                            <select class="browser-default time selecttyyli" v-show="dateSelected == 'selected'">
                                <option value="">Valitse aika</option>
                                <option v-check v-for="time in allTime" :value="time">{{ time }}</option>
                            </select>
                            <hr>

                            <button @click="post" class="btn waves-effect waves-light" type="submit" name="action">
                            <i class="material-icons right">send</i>
                            Lähetä
                            </button>
                        </form>
                    </div>
                </div>`,

    data() {
        // 
        return {
            afterSubmit : false,
            customerName : "",
            customerNumber : "",
            dateSelected : "notselected",
            date : '',
            bookedTime : [],
            allTime : [8, 9, 10, 11, 12, 13, 14, 15, 16],
            validationName : false,
            validationDate : false,
            validationTime : false
        }
    },

    methods: {
        // checkDate tarkistaa onko kyseisen päivän varattu aika firebase tietokannassa
        checkDate() {
            let date = document.getElementsByClassName("datepicker")[0].value;
            this.date = date;
            if (this.date) {
                this.dateSelected = "selected";
                // Haetaan kaikki olemassa olevat varaukset käytettävissä olevan ajan tarkistamiseksi
                this.$http.get("https://digiprojekti-b1699-default-rtdb.firebaseio.com/appointments.json").then(function (data) {
                    let savedData = Object.values(data.body);
                    for (let x = 0; x < savedData.length; x++) {
                        //Jos päivämäärä on sama nykyisissä varauksissa, tallenna sitten kaikki kyseisen päivän varatut tunnit BookedTime-ryhmään
                        if (savedData[x].date == this.date) {
                            this.bookedTime.push(parseInt(savedData[x].time));
                        }
                    }
                });
            } else {
                this.notification("first-noti");
            }
        },
        // Post tarkistaa onko nimi, aika, ja päivämäärä kentät täytettynä ja vie tiedot firebase tietokantaan
        post() {
            let time = document.getElementsByClassName("time")[0].value;
            this.checkDate();

            // Tekee ilmoituksen näytölle kentään ei ole tietoa syötetty tai päivämäärää ei ole valittuna
            (!this.date) ? this.notification("second-noti") : this.validationDate = true;
            (!time) ? this.notification("third-noti") : this.validationTime = true;
            (!this.customerName) ? this.notification("last-noti") : this.validationName = true;
            console.log(this.validationName + " Name status2");

            //If lauseke tarkistaa onko kentissä tekstiä/tietoa ja siirtää ne firebase tietokantaan
            if (this.validationDate == true & this.validationTime == true & this.validationName == true) {
                this.$http.post("https://digiprojekti-b1699-default-rtdb.firebaseio.com/appointments.json", {
                    "customerName": this.customerName,
                    "customerNumber": this.customerNumber,
                    "date": this.date,
                    "time": time,
                    "status": "pending"


                }).then(function (data) {
                    this.afterSubmit = true;
                });
            }
        },
        // Tämä piilottaa ilmoituksen kun sellainen tulee näytölle
        notification(element) {
            document.getElementsByClassName(element)[0].style.display = "block";
            setTimeout(function () {
                document.getElementsByClassName(element)[0].style.display = "none";
            }, 5000)
        }
    }
});

//Mukautettu direktiivi tuntien suodattamiseksi
Vue.directive("check",
{
    update(el, binding, vnode)
    {
        let time = parseInt(el.innerHTML);
        let check = vnode.context.bookedTime.includes(time); //Tämä palauttaa Boolen arvon tosi tai väärä

        if (check)
        {
            // Jos aika on varattu firebase tietokannassa se osoittaa sen värillä ja käytöstä poistolla
            el.disabled = true;
            el.style.color = "red";
            el.innerHTML = el.innerHTML + " Varattu";
        }
        else
        {
            // Muuten ajat ovat varattavissa
            el.disabled = false;
            el.style.color = "green";
            el.style.fontSize = "1.2rem";
        }
    }

});

//Tämä on alustus datepicker/valitse päivämäärä toiminnolle
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.datepicker');
    // Rajoittaa päivämäärää, joten asiakkaat eivät voi valita edellistä päivää
    var instances = M.Datepicker.init(elems, {
        minDate: new Date()
    });
});
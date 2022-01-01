Vue.component('admin', {

  template: `<div>
             <table class="pending">
                 <thead>
                     <tr>
                       <th>Päivämäärät</th>
                       <th>Ajoitus</th>
                       <th>Nimet</th>
                       <th>Yhteystiedot</th>
                       <th>Status</th>
                       <th>Päivitä</th>
                     </tr>
                 </thead>
                 <tbody>
                  <tr v-for="booking in bookings" v-show="booking.status == 'pending'">
                     <td>{{ booking.date }}</td>
                     <td>{{ booking.time }}</td>
                     <td>{{ booking.customerName }}</td>
                     <td>{{ booking.customerNumber }}</td>
                     <td>{{ booking.status }}</td>
                     <td>
                      <a href="javascript:;">
                         <i @click="update" :data-key=booking.unique :id=booking.status class="material-icons">autorenew</i>
                      </a>
                     </td>
                 </tr>
             </tbody>
             </table>
             <table class="approved">
             <thead>
             <tr>
               <th>Päivämäärät</th>
               <th>Ajoitus</th>
               <th>Nimet</th>
               <th>Yhteystiedot</th>
               <th>Status</th>
               <th>Päivitä</th>
             </tr>
         </thead>
         <tbody>
          <tr v-for="booking in bookings" v-show="booking.status == 'approved'">
             <td>{{ booking.date }}</td>
             <td>{{ booking.time }}</td>
             <td>{{ booking.customerName }}</td>
             <td>{{ booking.customerNumber }}</td>
             <td>{{ booking.status }}</td>
             <td>
              <a href="javascript:;">
                 <i @click="update" :data-key=booking.unique :id=booking.status class="material-icons">autorenew</i>
              </a>
             </td>
             </tr>
             </tbody>
             </table>
             </div>`,

  data() {
    return {

      bookings: [],
      statusUpdate: ""
    }

  },
  methods: {
    update(event) {
      let key = event.srcElement.dataset.key;
      let status = event.srcElement.id;

      (status == 'pending') ? this.statusUpdate = 'approved': this.statusUpdate = 'pending';

      let reload = () => {
        this.fetcher();
      }

      firebase.database().ref('appointments').child(key).update({
        status: this.statusUpdate
      }, function (error) {
        if (!error) {
          reload();
        }
      });


    },

    fetcher() {

      // Haetaan tietoja FireBasesta
      this.$http.get('https://digiprojekti-b1699-default-rtdb.firebaseio.com/appointments.json').then(function (data) {
        return data.json();
      }).then(function (data) {
        let requests = [];
        for (let key in data) {
          data[key].unique = key; // Ominaisuuden (yksilöllinen) lisääminen jokaiseen objektiin ja kohteiden arvon määrittäminen, avain

          requests.push(data[key]);
        }
        this.bookings = requests;
      });
    }
  },
  created() {
    this.fetcher();
  }

});
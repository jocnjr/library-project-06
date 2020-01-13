console.log('Yo!');

const geocoder = new google.maps.Geocoder();
const mapDiv = document.getElementById('map');
const addressInput = document.getElementById('address');

if (mapDiv) {
  const ironhackBCN = {
    lat: -23.5465084,
    lng: -46.6445317
  };

  const markers = []

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: ironhackBCN
  });

  axios.get('http://localhost:3000/api/books')
    .then(({
      data
    }) => {
      data.forEach(book => {
        if (book.location) {
          const center = {
            lat: book.location.coordinates[1],
            lng: book.location.coordinates[0]
          };
          const pin = new google.maps.Marker({
            position: center,
            map: map,
            title: book.title
          });
          markers.push(pin);

        }
      });
    })
    .catch(error => console.log(error))

}

const geocodeAddress = () => {
  let address = document.getElementById('address').value;

  geocoder.geocode({
    address
  }, (results, status) => {

    if (status === 'OK') {
      const latitude = results[0].geometry.location.lat();
      const longitude = results[0].geometry.location.lng();

      document.getElementById('latitude').value = latitude;
      document.getElementById('longitude').value = longitude;
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

if (addressInput) {
  addressInput.addEventListener('focusout', () => {
    geocodeAddress();
  });

}
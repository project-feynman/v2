<template>
  <div>
    <!-- HTML code here -->
    <h2 class="white-text center">Map of Students</h2>
    <div id="map"></div>
    <!-- import script moved to index.html -->
  </div>
</template>

<script>
export default {
  created () {
    // server key 
    const serverKey = 'AIzaSyCyYSsivU5361OMWU5eNDiuiLCt3jPfapI'
    const browserKey = 'AIzaSyB_06WA9vr4mqlukdjN591xyHPJ_SOgyds'
    // JS code here will be executed when the component is "created", but not yet drawn 
    var map, infoWindow;
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 6
      });
      infoWindow = new google.maps.InfoWindow;

      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent('Location found.');
          infoWindow.open(map);
          map.setCenter(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);
    }
  }
}
</script>

<style lang="scss" scope>
/* Always set the map height explicitly to define the size of the div
  * element that contains the map. */
#map {
  height: 100%;
}
/* Optional: Makes the sample page fill the window. */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>

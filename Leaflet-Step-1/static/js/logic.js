// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data);
  });

  function markerSize(magnitude) {
    return magnitude*15000;
  }

  function getColor(d) {
    return d < 1  ? '#458b00':
           d < 2  ? '#7fff00':
           d < 3  ? '#bf153d':
           d < 4  ? '#ffa500':
           d < 5  ? '#ff4500':
                    '#47478f';
}

function createFeatures(earthquakeData) {
    console.log(earthquakeData)
    var locations = [];
    var markers = [];

    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    // // An array containing all of the information needed to create city and state markers
    var locations = [];
    for (var i = 0; i < earthquakeData.features.length; i++){
      temp_dict = {}
      temp_dict.coordinates = [earthquakeData.features[i].geometry.coordinates[1], earthquakeData.features[i].geometry.coordinates[0]]
      temp_dict.info = {name: earthquakeData.features[i].properties.place, 
                        magnitude: earthquakeData.features[i].properties.mag, 
                        time: earthquakeData.features[i].properties.time}

      locations.push(temp_dict)
      }


    // Define arrays to hold created markers

    var markers = [];

    // Loop through locations and create city and state markers
    for (var i = 0; i < locations.length; i++) {
      // Setting the marker radius for the state by passing population into the markerSize function
      markers.push(
        L.circle(locations[i].coordinates, {
          stroke: false,
          fillOpacity: 0.75,
          color: getColor(locations[i].info.magnitude),
          fillColor: getColor(locations[i].info.magnitude),
          radius: markerSize(locations[i].info.magnitude)
        }).bindPopup("<h3>" + locations[i].info.name +
        "</h3><hr><p>" + new Date(locations[i].info.time) + "</p>")
  
      );
      }

// Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  /*
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });
  */

  // Sending our earthquakes layer to the createMap function
  createMap(markers);
}

function createMap(markers) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };

    var quakes = L.layerGroup(markers);
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": quakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, quakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var labels = ['<strong>Strength of Earthquake</strong>'],
      categories = ['0-1','1-2','2-3','3-4','4-5','5+'];

      for (var i = 0; i < categories.length; i++) {

              div.HTML += 
              labels.push(
                  '<div id="circle" "style=background:' + getColor(i) + '"></div> ' +
                  (categories[i] ? categories[i] : '+'));

          }
          div.innerHTML = labels.join('<br>');
      return div;
    };
    
    legend.addTo(myMap);
  }
  

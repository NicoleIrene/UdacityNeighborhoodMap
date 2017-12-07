var initialLocations = [{
	name: 'Flushing Meadow Park',
	lat: 40.7397,
	long: 73.8408
},
{
	name: 'Queens Zoo',
	lat: 40.7440, 
	long: 73.8492

},
{
	name: 'Billie Jean King National Tennis Center',
	lat: 40.7504, 
	long: 73.8456
},
{
	name: 'New York Hall of Science',
	lat: 40.7472, 
	long: 73.8517
},
{
	name: 'World Ice Arena',
	lat: 40.7517,  
	long: 73.8375
}
];

// Global variables for the strict mode
var map;
var clientID;
var clientSecret;


var Location = function (data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.street = "";
	this.city = "";

	this.visible = ko.observable(true);

//Verify the use of the foursquare api with using the clientid and also the key that is provided when signing up
var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170101 ' + '&query=' + this.name;

$.getJSON(foursquareURL).done(function (data) {
    var results = data.response.venues[0];
    self.street = results.location.formattedAddress[0];
    self.city = results.location.formattedAddress[1];

}).fail(function () {
    alert("There was an error with the Foursquare API call. Please refresh the page and try again later.");
});
// Infowindow with street and city information
this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
    '<div class="content">' + self.street + "</div>" +
    '<div class="content">' + self.city + "</div>";


this.infoWindow = new google.maps.InfoWindow({
    content: self.contentString
});
// Placing Markers on Map
this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.long),
    map: map,
    title: data.name
});

this.showMarker = ko.computed(function () {
    if (this.visible() === true) {
        this.marker.setMap(map);
    } else {
        this.marker.setMap(null);
    }
    return true;
}, this);

this.marker.addListener('click', function () {
    self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";


    self.infoWindow.setContent(self.contentString);

    self.infoWindow.open(map, this);
    // this gives the bouncing affect of the pointer on the map. 
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        self.marker.setAnimation(null);
    }, 2100);
});

this.bounce = function (place) {
    google.maps.event.trigger(self.marker, 'click');
	};
};
function AppViewModel() {
var self = this;

this.searchTerm = ko.observable("");

this.locationList = ko.observableArray([]);
//This is where the map will originate
map = new google.maps.Map(document.getElementById('map'), {
  zoom: 14,
  center: {
      lat: 40.7571,
      lng: 73.8458
  }
});

// foursquare api settings used to access the page. 
    clientID = "QTD2QJFLKPDYXIDU1IPWWEL32GXYHZVR4355SDIOSAYAWDH3";
    clientSecret = "QTD2QJFLKPDYXIDU1IPWWEL32GXYHZVR4355SDIOSAYAWDH3";

    initialLocations.forEach(function (locationItem) {
        self.locationList.push(new Location(locationItem));
    });
    // Filtering for search list 
    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}
// This will alert the user if there is an error loading the map
function errorHandling() {
    alert("Google Maps failed to load the requested page. Please refresh the page or try again later.");
}
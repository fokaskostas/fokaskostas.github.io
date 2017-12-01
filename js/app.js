var map;

var initialLocations = [
	{
		name: 'Acropolis Museum',
		lat: 37.968729,
		lng: 23.728491
	},
	{
		name: 'War Museum of Athens',
		lat: 37.975670,
		lng: 23.745340
	},
	{
		name: 'Temple of Olympian Zeus',
		lat: 37.969596,
		lng: 23.733100
	},
	{
		name: 'Panathenaic Stadium',
		lat: 37.968613,
		lng: 23.741112
	},
	{
		name: 'Parthenon',
		lat: 37.971791,
		lng: 23.726738
	},
	{
		name: 'Hellenic Parliament',
		lat: 37.975565,
		lng: 23.736976
	},
	{
		name: 'Roman Agora',
		lat: 37.974637,
		lng: 23.725543
	}
];




var Location = function(data) {
	var self = this;

	this.name = data.name;
	this.lat = data.lat;
	this.long = data.lng;

	this.visible = ko.observable(true);

	this.wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name + '&format=json&callback=wikiCallback';

	jQuery.ajax({
		url: this.wikiUrl,
		dataType: "jsonp",
		jsonp: "callback",
	})
	.done(function( response ) {
		var articleList = response[1];
		var content = '';

		for (var i = 0; i < 1; i++) {
			articleStr = articleList[i];
			var url = 'http://en.wikipedia.org/wiki/' + articleStr;
			content +='<li><a href="' + url + '">' + articleStr + '</a></li>';
			self.wikiContent = content
		}
	})
	.fail(function() {
		self.wikiContent = 'There was a problem loading the Wikipedia page'
	})

	this.content = data.name + ' <br> ' + 'Relevant Wikipedia link:' + self.wikiContent;

	this.infoWindow = new google.maps.InfoWindow({
		content: self.content
	});

	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.lat, data.lng),
		map: map,
		title: data.name,
		animation: google.maps.Animation.DROP
	});

	this.marker.addListener('click', function() {

		self.content = data.name + ' <br> ' + 'Relevant Wikipedia links:' + self.wikiContent

		self.infoWindow.setContent(self.content);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 700);
	});

	this.openInfoWindow = function () {
		google.maps.event.trigger(self.marker, 'click');
	};

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);
};


var ViewModel = function() {
	var self = this;

	this.query = ko.observable("");

	map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.9716435, lng: 23.736501},
          zoom: 15
        });

	this.locationList = ko.observableArray([]);

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem) );
	});

	this.filteredList = ko.computed( function() {
		var search = self.query().toLowerCase();
		if (!search) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(search) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

};


function initMap() {
	ko.applyBindings(new ViewModel());
}

function googleError() {
	alert("Google Maps did not load. Please try again.");
}
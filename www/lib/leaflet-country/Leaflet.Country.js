
L.CountryFlag = L.FeatureGroup.extend({
	options: {
		icon: {
			iconSize: [40, 30]
		}
	},

	initialize: function (items, options) {
		L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, items);
	},

	addLayers: function (items) {
		if (items) {
			for (var i = 0, len = items.length; i < len; i++) {
				this.addLayer(items[i]);
			}
		}
		return this;
	},

	addLayer: function (item) {
		L.FeatureGroup.prototype.addLayer.call(this, this.createMarker(item));
	},

	createMarker: function (item) {
		var marker = L.marker(item, {
      icon: L.divIcon(L.extend({
        html: '<div class="flag-icon-background flag-icon-' + this.options.countryCode + '"></div>​',
        className: 'leaflet-marker-country'
      }, item, this.options.icon)),
  		title: item.caption || ''
  		});
		marker.item = item;
		return marker;
	}
});

L.countryFlag = function (items, options) {
	return new L.CountryFlag(items, options);
};

if (L.MarkerClusterGroup) {

	L.CountryFlag.Cluster = L.MarkerClusterGroup.extend({
		options: {
			featureGroup: L.countryFlag,
			maxClusterRadius: 100,
			showCoverageOnHover: false,
			iconCreateFunction: function(cluster) {
				return new L.DivIcon(L.extend({
					className: 'leaflet-marker-country',
					html: '<div class="flag-icon-background flag-icon-' + this.countryCode + '"></div>​<b>' + cluster.getChildCount() + '</b>'
				}, this.icon));
		  },
      icon: {
  			iconSize: [40, 30]
  		}
		},

		initialize: function (options) {
			options = L.Util.setOptions(this, options);
			L.MarkerClusterGroup.prototype.initialize.call(this);
			this._items = options.featureGroup(null, options);
		},

		add: function (items) {
			this.addLayer(this._items.addLayers(items));
			return this;
		},

		clear: function () {
			this._items.clearLayers();
			this.clearLayers();
		},
	});

	L.countryFlag.cluster = function (options) {
		return new L.CountryFlag.Cluster(options);
	};

}

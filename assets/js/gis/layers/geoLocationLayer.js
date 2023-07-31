import { map } from '/assets/js/gis/map.js';



let geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true
    },
    projection: 'EPSG:4326'
});

geolocation.setTracking(true);

geolocation.on('error', function(error) {
    console.log('geolocation error: ' + error.message);
});

geolocation.on('change:position', function() {           
    let coordinates = geolocation.getPosition();
    console.log(coordinates);
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
});

let positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
        })
    })
}));

export let geoLocationLayer = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: [ positionFeature ]
    })
});
let geolocation = new ol.Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: "EPSG:5186",
});

geolocation.setTracking(true);

geolocation.on("error", function (error) {
  console.log("geolocation error: " + error.message);
});

geolocation.on("change:position", function () {
  let coordinates = geolocation.getPosition()
  positionFeature.setGeometry(
    coordinates ? new ol.geom.Point(coordinates) : null
  );
});

let positionFeature = new ol.Feature();
positionFeature.setStyle(
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: "#3399CC",
      }),
      stroke: new ol.style.Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  })
);

let geoLocationLayer = new ol.layer.Vector({
//   map: map,
  source: new ol.source.Vector({
    features: [positionFeature],
  }),
});

setTimeout(function () {
    map.addLayer(geoLocationLayer);
    map.getView().setZoom(15);
    console.log(geoLocationLayer.getSource().getFeatures()[0].getGeometry().getCoordinates())
    map.getView().setCenter(geoLocationLayer.getSource().getFeatures()[0].getGeometry().getCoordinates());
}, 3000);
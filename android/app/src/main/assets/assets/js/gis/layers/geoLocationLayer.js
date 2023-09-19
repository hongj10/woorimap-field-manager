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
          color: "blue", // 동그라미의 색상
        }),
        stroke: new ol.style.Stroke({
          color: "white", // 동그라미 테두리 색상
          width: 2,
        }),
      }),
    })
);

let geoLocationLayer = new ol.layer.Vector({
  id: 'geoLocationLayer',
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
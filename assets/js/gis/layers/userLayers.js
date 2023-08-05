const vectorSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: function (extent) {
    let strUrl =
      "http://127.0.0.1:8888/geoserver/wfs?service=WFS&" +
      "version=1.1.0&request=GetFeature&typename=map:userlayer&" +
      "outputFormat=application/json&srsname=EPSG:4326&" +
      "bbox=" +
      extent.join(",") +
      ",EPSG:4326";

    return strUrl;
  },
  strategy: ol.loadingstrategy.bbox,
});

// vectorLayer 선언
export const vectorLayer = new ol.layer.Vector({
  id: "vectorLayer",
  source: vectorSource,
});

// GeoJSON 파일 경로
const geojsonFilePath = "geojson\\N3P_H0020000.geojson";

// GeoJSON 형식의 데이터를 OpenLayers.Feature로 변환하는 함수
function createFeaturesFromGeoJSON(geojsonData) {
  var features = new ol.format.GeoJSON().readFeatures(geojsonData);
  return features;
}

// GeoJSON 파일을 불러와서 맵에 레이어로 추가하는 함수
function addGeoJSONLayerToMap(filePath) {
  fetch(filePath)
    .then((response) => response.json())
    .then((geojsonData) => {
      var vectorSource = new ol.source.Vector({
        features: createFeaturesFromGeoJSON(geojsonData), // GeoJSON 데이터를 레이어에 추가
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: "red" }),
            stroke: new ol.style.Stroke({ color: "white", width: 2 }),
          }),
        }),
      });

      map.addLayer(vectorLayer);
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));
}

// GeoJSON 레이어 추가
addGeoJSONLayerToMap(geojsonFilePath);

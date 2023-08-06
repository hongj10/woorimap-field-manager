export let vectorLayer = new ol.layer.Vector({
  id: "vectorLayer",
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON(),
  })
})

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
      const vectorSource = new ol.source.Vector({
        features: createFeaturesFromGeoJSON(geojsonData), // GeoJSON 데이터를 레이어에 추가
      });

      vectorLayer = new ol.layer.Vector({
        id: geojsonData.name,
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
      $("#layer1ListCheck").attr("value", geojsonData.name);
      $("#layer1List").text(geojsonData.name)
      console.log(vectorLayer)
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));
}

// GeoJSON 레이어 추가
addGeoJSONLayerToMap(geojsonFilePath);

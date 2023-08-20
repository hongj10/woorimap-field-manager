const defaultView = new ol.View({
  projection: "EPSG:5186",
  center: [950788.9055305821, 1951939.113108684],
  zoom: 13,
  minZoom: 6,
  maxZoom: 19,
});

const insertOverlay = new ol.Overlay({
  element: document.getElementById("insert-overlay"),
  offset: [10, -10],
  positioning: "top-left",
});

const updateOverlay = new ol.Overlay({
  element: document.getElementById("update-overlay"),
  offset: [10, -10],
  positioning: "top-left",
});

const map = new ol.Map({
  layers: [baseLayer],
  target: "map",
  overlays: [insertOverlay, updateOverlay],
  view: defaultView,
});

// 클릭 이벤트 리스너 함수
function updateEventHandler(event) {
  showUpdateTooltip(event);
}

$("#drawSwitch").click(function () {
  $(this).toggleClass("active");
  if ($("#drawSwitch").hasClass("active")) {
    map.addInteraction(insertInteraction);
    map.addInteraction(modifyInteraction);
    map.addInteraction(snapInteraction);
    map.on("click", updateEventHandler);

  } else {
    map.removeInteraction(insertInteraction);
    map.removeInteraction(modifyInteraction);
    map.removeInteraction(snapInteraction);
    map.un("click", updateEventHandler);
  }
});

function createFeaturesFromGeoJSON(geojsonData) {
  var features = new ol.format.GeoJSON().readFeatures(geojsonData);
  return features;
}

let insertInteraction;
let modifyInteraction;
let snapInteraction;
let vectorLayer;

const filePath = "/android_asset/geojson/N3P_H0020000.geojson";
fetch(filePath)
  .then((response) => response.json())
  .then((geojsonData) => {
    const vectorSource = new ol.source.Vector({
      features: createFeaturesFromGeoJSON(geojsonData),
    });

     vectorLayer = new ol.layer.Vector({
      // id: geojsonData.name,
      id: 'suveyLayer',
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
    // $("#layer1ListCheck").attr("value", geojsonData.name);

    insertInteraction = new ol.interaction.Draw({
      source: vectorLayer.getSource(),
      type: "Point",
    });

    modifyInteraction = new ol.interaction.Modify({
      source: vectorLayer?.getSource(),
    });

    snapInteraction = new ol.interaction.Snap({
      source: vectorLayer?.getSource(),
    });

    insertInteraction.on("drawend", function (event) {
      showInsertTooltip(event);
    });
  })
  .catch((error) => console.error("Error loading GeoJSON:", error));



  function loadGeoJSONFromAndroid(geoJSONData) {
    // 받은 GeoJSON 데이터를 처리
    console.log('드디어 성공')
    console.log(geoJSONData)
    // var features = new ol.format.GeoJSON().readFeatures(JSON.parse(geoJSONData));
    // ... 지도에 기능 추가 및 레이어에 추가하는 등의 코드
  }


window.map = map;
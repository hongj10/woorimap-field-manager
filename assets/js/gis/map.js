import { baseLayer } from "/assets/js/gis/layers/baseLayer.js";
import { geoLocationLayer } from "/assets/js/gis/layers/geoLocationLayer.js";
import { showInsertTooltip } from "/assets/js/gis/overlay/insertOverlay.js";
import { showUpdateTooltip } from "/assets/js/gis/overlay/updateOverlay.js";
import { saveFeature } from "/assets/js/gis/save/geojsonSave.js";

export const defaultView = new ol.View({
  projection: "EPSG:5186",
  center: [950788.9055305821, 1951939.113108684],
  zoom: 13,
  minZoom: 6,
  maxZoom: 19,
});

export const insertOverlay = new ol.Overlay({
  element: document.getElementById("insert-overlay"),
  offset: [10, -10],
  positioning: "top-left",
});

export const updateOverlay = new ol.Overlay({
  element: document.getElementById("update-overlay"),
  offset: [10, -10],
  positioning: "top-left",
});

export const map = new ol.Map({
  layers: [baseLayer],
  target: "map",
  overlays: [insertOverlay, updateOverlay],
  view: defaultView,
});

// 클릭 이벤트 리스너 함수
// function insertEventHandler(event) {
//   showinsertTooltip(event);
// }

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

const filePath = "geojson\\N3P_H0020000.geojson";
fetch(filePath)
  .then((response) => response.json())
  .then((geojsonData) => {
    const vectorSource = new ol.source.Vector({
      features: createFeaturesFromGeoJSON(geojsonData),
    });

    const vectorLayer = new ol.layer.Vector({
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
    $("#layer1List").text(geojsonData.name);

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
    // modifyInteraction.on("modifying", function (event) {
      // map.getTargetElement().style.cursor = ""; // 마우스 포인터 스타일 변경
      // map.getTargetElement().style.cursor = "pointer"; // 마우스 포인터 스타일 변경
    // });
  })
  .catch((error) => console.error("Error loading GeoJSON:", error));

// function onConfirmClick() {
//   hideOverlay();
// }

window.map = map;
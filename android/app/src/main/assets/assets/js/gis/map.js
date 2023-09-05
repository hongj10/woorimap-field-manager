const defaultView = new ol.View({
  projection: 'EPSG:5186',
  center: [950788.9055305821, 1951939.113108684],
  zoom: 13,
  minZoom: 6,
  maxZoom: 19,
});

const insertOverlay = new ol.Overlay({
  element: document.getElementById('insert-overlay'),
  offset: [10, -10],
  positioning: 'top-left',
});

const updateOverlay = new ol.Overlay({
  element: document.getElementById('update-overlay'),
  offset: [10, -10],
  positioning: 'top-left',
});

const map = new ol.Map({
  layers: [baseLayer],
  target: 'map',
  overlays: [insertOverlay, updateOverlay],
  view: defaultView,
});

// 클릭 이벤트 리스너 함수
function updateEventHandler(event) {
  showUpdateTooltip(event);
}

$('#drawSwitch').click(function () {
  $(this).toggleClass('active');
  if ($('#drawSwitch').hasClass('active')) {
    map.addInteraction(insertInteraction);
    map.addInteraction(modifyInteraction);
    map.addInteraction(snapInteraction);
    map.on('click', updateEventHandler);
  } else {
    map.removeInteraction(insertInteraction);
    map.removeInteraction(modifyInteraction);
    map.removeInteraction(snapInteraction);
    map.un('click', updateEventHandler);
  }
});

function createFeaturesFromGeoJSON(geojsonData) {
  var features = new ol.format.GeoJSON().readFeatures(geojsonData);
  console.log(features);
  return features;
}

let insertInteraction;
let modifyInteraction;
let snapInteraction;
let vectorLayer;

function displayGeoJSONOnMap(geojsonData) {
  const vectorSource = new ol.source.Vector({
    features: createFeaturesFromGeoJSON(geojsonData),
  });

  vectorLayer = new ol.layer.Vector({
    id: 'suveyLayer',
    source: vectorSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({color: 'red'}),
        stroke: new ol.style.Stroke({color: 'white', width: 2}),
      }),
    }),
  });

  map.addLayer(vectorLayer);

  insertInteraction = new ol.interaction.Draw({
    source: vectorLayer.getSource(),
    type: 'Point',
  });

  modifyInteraction = new ol.interaction.Modify({
    source: vectorLayer?.getSource(),
  });

  snapInteraction = new ol.interaction.Snap({
    source: vectorLayer?.getSource(),
  });

  insertInteraction.on('drawend', function (event) {
    showInsertTooltip(event);
  });
}

document.addEventListener('message', function (event) {
  const messageData = JSON.parse(event.data);
  switch (messageData.type) {
    case 'LOCATION_DATA':
      const {latitude, longitude} = data;
      // 위치 업데이트
      map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));

      // 위치에 레이어 표출 (원 또는 마커 등)
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude])),
      });
      const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [feature],
        }),
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: 'rgba(255, 0, 0, 0.5)',
            }),
          }),
        }),
      });
      map.addLayer(vectorLayer);

      break;
    case 'LOAD_GEOJSON':
      if (!map.getAllLayers().find(layer => layer.values_.id == 'suveyLayer')) {
        displayGeoJSONOnMap(messageData.data);
      }
      console.log('LOAD_GEOJSON');
      break;
    case 'LOAD_SHAPEFILE':
      const shapefileData = messageData.shapefileData;
      try {
        console.log(shapefileData);
        const shapefileBuffer = new Uint8Array(shapefileData, 'base64');

        // shpjs 라이브러리를 사용하여 shapefile 데이터를 파싱하여 GeoJSON으로 변환
        const geojson = shp.parseShp(shapefileBuffer);

        // 이제 shapefile의 GeoJSON 표현을 얻었습니다
        console.log('GeoJSON:', geojson);

        // JSON으로 변환하려면 간단하게 문자열화합니다
        const jsonString = JSON.stringify(geojson);
        console.log('JSON:', jsonString);

        // // Shapefile 파싱
        // const shapefile = shp(shapefileData);
        // console.log(shapefile);

        // // Shapefile 데이터를 GeoJSON으로 변환
        // const geojsonFeatures = shpToGeoJSON(shapefile);
        // console.log(geojsonFeatures);

        // // GeoJSON을 지도에 표시
        // displayGeoJSONOnMap(geojsonFeatures);
      } catch (error) {
        console.error('Error parsing shapefile:', error);
      }
      break;
    default:
      console.log('Unknown message type');
  }
});

function shpToGeoJSON(shapefile) {
  const geojsonFeatures = [];

  // shapefile 객체 내부의 속성을 순회하며 처리
  for (const shape of shapefile.features) {
    const geometryType = shape.type;
    let geometry;

    switch (geometryType) {
      case shp.Types.POINT:
        geometry = {
          type: 'Point',
          coordinates: [shape.coordinates[0], shape.coordinates[1]],
        };
        break;
      // 다른 지오메트리 유형도 추가 가능
      default:
        console.log('Unsupported geometry type:', geometryType);
        continue;
    }

    const feature = {
      type: 'Feature',
      geometry,
      properties: {},
    };

    geojsonFeatures.push(feature);
  }

  return geojsonFeatures;
}

window.map = map;

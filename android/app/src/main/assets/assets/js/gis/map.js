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
        document.getElementById('loading-screen').style.display = 'none';
      }
      console.log('LOAD_GEOJSON');

      break;
    case 'LOAD_SHAPEFILE':
      const shapefileData = messageData.shapefileData;
      let shpFileName = messageData.shpFileName;
      shpFileName = shpFileName.replace(/\.shp$/, '');
      try {
        // GeoJSON 데이터를 파싱하고 Feature로 변환
        const geoJsonFormat = new ol.format.GeoJSON();
        const features = geoJsonFormat.readFeatures({
          type: 'FeatureCollection',
          features: shapefileData,
        });

        // Point 스타일 설정
        const pointStyle = new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: 'red', // Point 색상
            }),
            stroke: new ol.style.Stroke({
              color: 'black', // Point 테두리 색상
              width: 2,
            }),
          }),
        });

        // VectorLayer 생성 및 Feature 추가
        const vectorLayer = new ol.layer.Vector({
          id: shpFileName,
          source: new ol.source.Vector({
            features: features,
          }),
          style: pointStyle, // Point 스타일 적용
        });

        map.addLayer(vectorLayer); // 위에서 생성한 지도에 레이어 추가
        // SHP 레이어를 목록에 추가
        addLayerToLayerList(shpFileName, shpFileName);
      } catch (error) {
        console.error('Error parsing shapefile:', error);
      }
      break;
    default:
      console.log('Unknown message type');
  }
});

// SHP 레이어를 목록에 추가
function addLayerToLayerList(layerName, layerId) {
  const layerList = layerListData.querySelector('ol');
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <input type="checkbox" onchange="layerVisible('${layerId}')" value="${layerId}" checked/>
    <a>${layerName}</a>
  `;
  layerList.appendChild(listItem);
}


window.map = map;

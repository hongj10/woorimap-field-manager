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

$('#drawSwitch').click(function () {
  $(this).toggleClass('active');
  if ($('#drawSwitch').hasClass('active')) {
    map.addInteraction(insertInteraction);
    map.addInteraction(modifyInteraction);
    map.removeInteraction(selectInteraction);
    map.on('click', showUpdateTooltip);
  } else {
    map.removeInteraction(insertInteraction);
    map.removeInteraction(modifyInteraction);
    map.addInteraction(selectInteraction);
    map.un('click', showUpdateTooltip);
  }
});

function createFeaturesFromGeoJSON(geojsonData) {
  var features = new ol.format.GeoJSON().readFeatures(geojsonData);
  console.log(features);
  return features;
}

let insertInteraction;
let modifyInteraction;
let selectInteraction;
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
        radius: 8,
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

  selectInteraction = new ol.interaction.Select({
    source: vectorLayer?.getSource(),
  });

  map.addInteraction(selectInteraction);

  selectInteraction.on('select', function (event) {
    if (event.selected.length > 0) {
      showSelectTooltip(event);
    } else {
      updateOverlay.getElement().style.display = 'none';
    }
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
        // document.getElementById('loading-screen').style.display = 'none';
        // document.getElementById('loadingOverlay').style.display = 'none';
      }
      console.log('LOAD_GEOJSON');
      break;
      case 'LOAD_SHAPEFILELIST':
        let _shpFileName = messageData.shpFileName;
        let _folderName = messageData.folderName;
        _shpFileName = _shpFileName.replace(/\.shp$/, '');
        // if (map.getAllLayers().find(layer => layer.values_.id == _shpFileName)) {
        //   return;
        // }
        try {
          // SHP 레이어를 목록에 추가
          addLayerToLayerList(_shpFileName, _shpFileName+_folderName, _folderName);
        } catch (error) {
          console.error('Error parsing shapefile:', error);
        }
        break;
    case 'LOAD_SHAPEFILE':
      const shapefileData = messageData.shapefileData;
      let shpFileName = messageData.shpFileName;
      let folderName = messageData.folderName;
      shpFileName = shpFileName.replace(/\.shp$/, '');
      if (map.getAllLayers().find(layer => layer.values_.id == shpFileName)) {
        return;
      }
      try {
        // GeoJSON 데이터를 파싱하고 Feature로 변환
        const geoJsonFormat = new ol.format.GeoJSON();
        const features = geoJsonFormat.readFeatures({
          type: 'FeatureCollection',
          features: shapefileData,
        });

        // VectorLayer 생성 및 Feature 추가
        const vectorLayer = new ol.layer.Vector({
          id: shpFileName+folderName,
          source: new ol.source.Vector({
            features: features,
          }),
          visible : false,
          // style: pointStyle, // Point 스타일 적용
        });

        map.addLayer(vectorLayer); // 위에서 생성한 지도에 레이어 추가
      } catch (error) {
        console.error('Error parsing shapefile:', error);
      }
      break;
      case 'HIDE_LOADING':
        document.getElementById('loading-screen').style.display = 'none';
      break;
      case 'HIDE_LAYER_LOADING':
        document.getElementById('loadingOverlay').style.display = 'none';
      break;
    default:
      console.log('Unknown message type');
  }
});

const addedLayers = {}; // 이미 추가한 레이어를 저장할 객체
function addLayerToLayerList(layerName, layerId, folderName) {
  const layerList = layerListData.querySelector('ol');
  // 중복을 확인하는 고유한 키 생성
  const uniqueKey = `${layerName} (${folderName})`;
  // 이미 추가된 레이어인지 확인
  if (addedLayers[uniqueKey]) {
    return;
  }
  // 객체에 고유한 키 추가
  addedLayers[uniqueKey] = true;
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <input type="checkbox" onchange="layerVisible('${layerId}')" value="${layerId}"/>
    <a>${uniqueKey}</a>
  `;
  layerList.appendChild(listItem);
}

// 내위치로 이동함수
function moveMyLocation() {
  map
    .getView()
    .setCenter(
      geoLocationLayer
        .getSource()
        .getFeatures()[0]
        .getGeometry()
        .getCoordinates(),
    );
  map.getView().setZoom(16);
}

const showSelectTooltip = event => {
  const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature;
  });

  if (feature?.values_.features == undefined) {
    return;
  }

  if (insertOverlay.getElement().style.display == 'block') {
    toastAlert('저장 후 수정 가능합니다.');
    return;
  }

  if (feature) {
    const properties = feature.values_.features[0].values_;
    let content =
      '<h5>현장 정보</h5><div class="overlayClose close2" onclick="onInsertCancel()"></div>';

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'geometry') {
          continue;
        }

        let value = properties[key];

        if (key === '현장사진1') {
          content += `<strong class="surveyKey">${key}</strong>`;
          content += `<input id="photo-text1" style="display: none;" class="surveyValue" type="text" value="${value}" readonly/>`;
          if (value) {
            content += `<img id="photo-display1" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
          } else {
            content += `<img id="photo-display1" style="width : 100%; height : auto;"/>`;
          }
          continue;
        }
        if (key === '현장사진2') {
          content += `<br/><strong class="surveyKey">${key}</strong>`;
          content += `<input id="photo-text2" style="display: none;" class="surveyValue" type="text" value="${value}" readonly/>`;
          if (value) {
            content += `<img id="photo-display2" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
          } else {
            content += `<img id="photo-display2" style="width : 100%; height : auto;"/>`;
          }
          continue;
        }
        if (value == null) {
          value = '';
        }
        content += `<strong class="surveyKey">${key}</strong>`;
        content += `<span class="surveyValue"/>${value}</span><br/>`;
      }
    }

    const updateOverlayElement = document.getElementById('update-overlay');
    updateOverlayElement.innerHTML = content;
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};

const toastAlert = message => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'SUCCESS_ALERT',
      data: message,
    }),
  );
};

window.map = map;
window.toastAlert = toastAlert;

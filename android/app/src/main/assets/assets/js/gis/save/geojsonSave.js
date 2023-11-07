const saveFeature = () => {
  for(let i=0; i<document.getElementsByClassName("surveyKey").length; i++){
        if(document.getElementsByClassName("surveyKey")[i].innerText=='geometry'){
          continue;
        }
        if(document.getElementsByClassName("surveyKey")[i].innerText=='지형지물'){
          updateFeature.values_.features[0].values_[document.getElementsByClassName("surveyKey")[i].innerText] = document.getElementsByClassName("surveyValue")[i].value;
          continue;
        }
        if(document.getElementsByClassName("surveyKey")[i].innerText=='주소'){
          updateFeature.values_.features[0].values_[document.getElementsByClassName("surveyKey")[i].innerText] = document.getElementsByClassName("surveyValue")[i].innerText;
          continue;
        }
        updateFeature.values_.features[0].values_[document.getElementsByClassName("surveyKey")[i].innerText] = document.getElementsByClassName("surveyValue")[i].value;
  }
  updateGeojson();
  toastAlert('저장되었습니다.');
  updateOverlay.getElement().style.display = 'none';
};

const updateGeojson = () => {
          // GeoJSON 문자열로 변환
          const geoJSONFormat = new ol.format.GeoJSON();
  
          const geoJSONString = geoJSONFormat.writeFeatures(
            map.getAllLayers().find(layer => layer.values_.id == 'suveyLayer').getSource().getFeatures()
          );
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SAVE_GEOJSON',
            data: geoJSONString
        }));
  };
  
  window.saveFeature = saveFeature;
  window.updateGeojson = updateGeojson;
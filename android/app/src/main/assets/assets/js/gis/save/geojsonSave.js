const saveFeature = () => {
  console.log()
  for(let i=0; i<document.getElementsByClassName("surveyKey").length; i++){
        if(document.getElementsByClassName("surveyKey")[i].innerText=='geometry'){
          continue;
        }
        updateFeature.values_.features[0].values_[document.getElementsByClassName("surveyKey")[i].innerText] = document.getElementsByClassName("surveyValue")[i].value;
  }
  // document.getElementById("loading-screen").style.display = "block";
  // document.getElementById("loading-message").text = "현장조사 정보 하는 중...";
  updateGeojson();
  // document.getElementById("loading-screen").style.display = "none";
  alert('저장되었습니다.');
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
const saveFeature = () => {
  console.log()
  for(let i=0; i<document.getElementsByClassName("surveyKey").length; i++){
        if(document.getElementsByClassName("surveyKey")[i].innerText=='geometry'){
          continue;
        }
        updateFeature.values_.features[0].values_[document.getElementsByClassName("surveyKey")[i].innerText] = document.getElementsByClassName("surveyValue")[i].value;
  }
  updateGeojson()
  alert('저장되었습니다.');
};

const updateGeojson = () => {
          // GeoJSON 문자열로 변환
          const geoJSONFormat = new ol.format.GeoJSON();
  
          const geoJSONString = geoJSONFormat.writeFeatures(
            map.getAllLayers()[1].getSource().getFeatures()
          );
    
          // 내보낼 파일 이름
          const fileName = 'N3P_H0020000.geojson';
    
          // GeoJSON 문자열을 Blob 객체로 변환
          const blob = new Blob([geoJSONString], { type: 'application/json' });
    
          // Blob을 다운로드할 링크를 생성
          const url = URL.createObjectURL(blob);
          console.log(url)
          // 다운로드 링크 생성 및 클릭
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
    
          // 생성한 URL 객체 해제
          URL.revokeObjectURL(url);
  };
  
  window.saveFeature = saveFeature;
  window.updateGeojson = updateGeojson;
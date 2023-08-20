// import { insertOverlay, updateOverlay } from "../map.js";

let updateFeature

const showUpdateTooltip = (event) => {
    const feature = map.forEachFeatureAtPixel(
      event.pixel,
      function (feature) {
        return feature;
      }
    );
    if(feature?.values_.features==undefined){
        return;
    }
    
    if(insertOverlay.getElement().style.display=='block'){
      alert('저장 후 수정 가능합니다.')
      return
    }
    if (feature) {
      // 선택한 피처가 있을 경우 툴팁을 업데이트하여 표시합니다.
      const properties = feature.values_.features[0].values_;
      updateFeature = feature
      
      let content = "<h5>속성 정보</h5>";
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          if(key=='geometry'){
            continue;
          }
          let value = properties[key];
          if(value==null){
            value='';
          }
          content += `<strong class="surveyKey">${key}</strong><input class="surveyValue" type="text" value="${value}" /><br/>`;
        }
      }
      content += `<button onclick="saveFeature()">저장</button>`;
      content += `<button onclick="onInsertCancel()">취소</button>`;
      document.getElementById("update-overlay").innerHTML = content;
      updateOverlay.setPosition(event.coordinate); // 툴팁 위치를 마우스 위치로 업데이트합니다.
      updateOverlay.getElement().style.display = "block"; // 툴팁을 표시합니다.
      insertOverlay.getElement().style.display = "none"; // 툴팁을 표시합니다.
    } else {
        updateOverlay.getElement().style.display = "none"; // 피처 위에 마우스가 없으면 툴팁을 숨깁니다.
    }
  };

  
  function onInsertCancel() {
    updateOverlay.getElement().style.display = "none"; 
  }

  window.onInsertCancel = onInsertCancel;
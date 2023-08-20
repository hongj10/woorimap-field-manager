let lastInsertedFeature = null; 

const showInsertTooltip = (event) => {
    if(insertOverlay.getElement().style.display=='block'){
        onUpdateCancel();
      }
    const feature = event.feature;
    lastInsertedFeature = feature;
      let content = '' // = "<h5>속성 정보</h5>";
      content += '<span>현장조사 정보를 추가하겠습니까?</span>'
      content += `<button onclick="onConfirmClick()">확인</button>`;
      content += `<button onclick="onUpdateCancel()">취소</button>`;
      
      feature.values_['도엽명'] = '';
      feature.values_['조사내용'] = '';
      feature.values_['주소'] = '';

      document.getElementById("insert-overlay").innerHTML = content;
      insertOverlay.setPosition(event.target.sketchCoords_); // 툴팁 위치를 마우스 위치로 업데이트합니다.
      insertOverlay.getElement().style.display = "block"; // 툴팁을 표시합니다.
      updateOverlay.getElement().style.display = "none";
  };

function onConfirmClick() {
    insertOverlay.getElement().style.display = "none";
    alert('추가되었습니다.')
    updateGeojson()
}

function onUpdateCancel() {
    if (lastInsertedFeature) {
        console.log(map.getAllLayers()[1])
        map.getAllLayers()[1].getSource().removeFeature(lastInsertedFeature);
        lastInsertedFeature = null; // 삭제된 feature 초기화
    }
insertOverlay.getElement().style.display = "none"; 
}

window.onConfirmClick = onConfirmClick;
window.onUpdateCancel = onUpdateCancel;
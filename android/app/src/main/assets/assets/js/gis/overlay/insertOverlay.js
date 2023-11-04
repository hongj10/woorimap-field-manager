let lastInsertedFeature = null;

const showInsertTooltip = async event => {
  if (insertOverlay.getElement().style.display == 'block') {
    onInsertCancel();
  }
  const feature = event.feature;
  lastInsertedFeature = feature;
  let content = ''; // = "<h5>속성 정보</h5>";
  content += '<div style="text-align: center; width: 150px;">';
  content += '<span>현장조사 정보를 추가하겠습니까?</span>';
  content +=
    '<button class="custom-button" onclick="onConfirmClick()">확인</button>';
  content +=
    '<button class="custom-button cancel" onclick="onInsertCancel()">취소</button>';
  content += '</div>';
  const coordAddress = await searchCoord(feature.values_?.geometry.flatCoordinates);
  feature.values_['도엽명'] = '';
  feature.values_['조사내용'] = '';
  feature.values_['주소'] = coordAddress;
  feature.values_['현장사진1'] = '';
  feature.values_['현장사진2'] = '';
  
  document.getElementById('insert-overlay').innerHTML = content;
  insertOverlay.setPosition(event.target.sketchCoords_); // 툴팁 위치를 마우스 위치로 업데이트합니다.
  insertOverlay.getElement().style.display = 'block'; // 툴팁을 표시합니다.
  updateOverlay.getElement().style.display = 'none';
};

function onConfirmClick() {
  insertOverlay.getElement().style.display = 'none';
  const loadingScreen = document.getElementById('loading-screen');
  const loadingMessage = document.getElementById('loading-message');

  loadingMessage.textContent = '현장조사 정보 추가하는 중...';
  loadingScreen.style.display = 'flex';
  updateGeojson();

  toastAlert('추가되었습니다.');
  loadingScreen.style.display = 'none';
  console.log('lastInsertedFeature',lastInsertedFeature);
  if (modifyInteraction) {
    // feature modifyInteraction에 선택될 수 있도록 변경
    // showUpdateTooltip();
    modifyInteraction.vertexFeature_ = lastInsertedFeature;
    console.log(lastInsertedFeature);
    
    
    if (lastInsertedFeature) {
      tempFeature = lastInsertedFeature
      const properties = lastInsertedFeature.values_;
      updateFeature = {
        values_:{
          features:[{
            values_:properties
          }]
        }
      }
  
      let content = '<h5>현장 정보</h5><div class="overlayClose close2" onclick="onUpdateCancel()"></div>';
      
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          if (key == 'geometry') {
            continue;
          }
  
          let value = properties[key];
  
          if (key === '현장사진1') {
            content += `<strong class="surveyKey">${key}</strong>`;
            content += `<input id="photo-update-text1" style="display: none;" class="surveyValue" type="text" value="${value}" />`;
            if (value) {
              content += `<img id="photo-update-display1" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
            } else {
              content += `<img id="photo-update-display1" style="width : 100%; height : auto;"/>`;
            }
            content += `<button onclick="takePhoto1()">사진 찍기</button>`;
            continue;
          }
          if (key === '현장사진2') {
            content += `<br/><strong class="surveyKey">${key}</strong>`;
            content += `<input id="photo-update-text2" style="display: none;" class="surveyValue" type="text" value="${value}" />`;
            if (value) {
              content += `<img id="photo-update-display2" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
            } else {
              content += `<img id="photo-update-display2" style="width : 100%; height : auto;"/>`;
            }
            content += `<button onclick="takePhoto2()">사진 찍기</button>`;
            continue;
          }
          if (value == null) {
            value = '';
          }
          if (key === '주소') {
            content += `<strong class="surveyKey">${key}</strong><br/>`;
            content += `<span class="surveyValue">${value}</span><br/>`;
          } else{
            content += `<strong class="surveyKey">${key}</strong><br/>`;
            content += `<input class="surveyValue" type="text" value="${value}"/><br/>`;
          }
        }
      }
  
      content += `<div class="button-container">
      <button class="custom-button" onclick="saveFeature()">저장</button>
      <button class="custom-button cancel" onclick="deleteFeature()">삭제</button>
    </div>`;
      const updateOverlayElement = document.getElementById('update-overlay');
      updateOverlayElement.innerHTML = content; // Update overlay content
      updateOverlay.setPosition(lastInsertedFeature.values_.geometry.flatCoordinates);
      updateOverlay.getElement().style.display = 'block';
      insertOverlay.getElement().style.display = 'none';
    }

    console.log(modifyInteraction)


  }
  
}

function onInsertCancel() {
  if (lastInsertedFeature) {
    map
      .getAllLayers()
      .find(layer => layer.values_.id == 'suveyLayer')
      .getSource()
      .removeFeature(lastInsertedFeature);
    lastInsertedFeature = null; // 삭제된 feature 초기화
  }
  insertOverlay.getElement().style.display = 'none';
}

window.onConfirmClick = onConfirmClick;
window.onInsertCancel = onInsertCancel;

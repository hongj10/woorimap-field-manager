let lastInsertedFeature = null;

const showInsertTooltip = event => {
  if (insertOverlay.getElement().style.display == 'block') {
    onUpdateCancel();
  }
  const feature = event.feature;
  lastInsertedFeature = feature;
  let content = ''; // = "<h5>속성 정보</h5>";
  content += '<div style="text-align: center; width: 150px;">';
  content += '<span>현장조사 정보를 추가하겠습니까?</span>';
  content +=
    '<button class="custom-button" onclick="onConfirmClick()">확인</button>';
  content +=
    '<button class="custom-button cancel" onclick="onUpdateCancel()">취소</button>';
  content += '</div>';

  feature.values_['도엽명'] = '';
  feature.values_['조사내용'] = '';
  feature.values_['주소'] = '';
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
}

function onUpdateCancel() {
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
window.onUpdateCancel = onUpdateCancel;

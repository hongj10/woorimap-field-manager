// import { insertOverlay, updateOverlay } from "../map.js";

let updateFeature;
const showUpdateTooltip = event => {
  const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature;
  });

  if (feature?.values_.features == undefined) {
    return;
  }

  if (insertOverlay.getElement().style.display == 'block') {
    alert('저장 후 수정 가능합니다.');
    return;
  }

  if (feature) {
    const properties = feature.values_.features[0].values_;
    updateFeature = feature;

    let content = '<h5>속성 정보</h5>';

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'geometry') {
          continue;
        }

        let value = properties[key];

        if (key === '사진경로') {
          if (value) {
            content += `<img src="${value}" alt="사진" /><br/>`;
          }
          content += `<strong class="surveyKey">${key}</strong>`;
          content += `<input class="surveyValue" type="text" value="${value}" onchange="updateAttributeValue('${key}', this.value)" /><br/>`;
          content += `<button onclick="takePhoto()">사진 찍기</button>`;
          content += '<br/>';
          continue;
        }

        content += `<strong class="surveyKey">${key}</strong>`;
        content += `<input class="surveyValue" type="text" value="${value}" onchange="updateAttributeValue('${key}', this.value)" /><br/>`;
      }
    }

    content += `<button onclick="saveFeature()">저장</button>`;
    content += `<button onclick="onInsertCancel()">취소</button>`;
    document.getElementById('update-overlay').innerHTML = content;
    updateOverlay.setPosition(event.coordinate);
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};

function updateAttributeValue(key, value) {
  // Update the attribute value in the feature's properties
  const properties = updateFeature.values_.features[0].values_;
  properties[key] = value;
}
window.updateAttributeValue = updateAttributeValue;

function onInsertCancel() {
  updateOverlay.getElement().style.display = 'none';
}

function takePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = true;

  input.onchange = async function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
      const base64Image = e.target.result;
  
      // 이미지 데이터 URI를 앱으로 보냄
      window.postMessage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  input.click();
}
window.onInsertCancel = onInsertCancel;
window.updateAttributeValue = updateAttributeValue;
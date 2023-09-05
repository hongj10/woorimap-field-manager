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

    let content = '<h5>현장 정보</h5>';

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'geometry') {
          continue;
        }

        let value = properties[key];
        if(value == null) {
          value = '';
        }
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
    // content += `<button class="btn btn-primary btn-lg" onclick="saveFeature()">저장</button>`;
    // content += `<button class="btn btn-primary btn-lg" onclick="onInsertCancel()">취소</button>`;
    document.getElementById('update-overlay').innerHTML = content;
    updateOverlay.setPosition(event.coordinate);
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};


const photoDisplayElementId = 'photo-display';
function updateAttributeValue(key, value) {
  const properties = updateFeature.values_.features[0].values_;

  if (key === '사진경로') {
    properties[key] = value; // 이미지 데이터 URI를 설정
    // 이미지를 표시할 <img> 엘리먼트를 생성하여 추가
    const imgElement = document.createElement('img');
    imgElement.src = value;
    imgElement.alt = '사진';
    const photoDisplayElement = document.getElementById('photo-display');
    photoDisplayElement.innerHTML = ''; // 이미지 업데이트를 위해 이전 내용 삭제
    photoDisplayElement.appendChild(imgElement);
  } else {
    properties[key] = value;
  }
}

function onInsertCancel() {
  updateOverlay.getElement().style.display = 'none';
}

function displayPhoto(imageDataURI) {
  const imgElement = document.createElement('img');
  imgElement.src = imageDataURI;
  imgElement.alt = '사진';
  alert(imgElement.src)
  // 이미지를 보여주는 엘리먼트에 추가
  const photoDisplayElement = document.getElementById('${photoDisplayElementId}');
  photoDisplayElement.innerHTML = ''; // 이미지 업데이트를 위해 이전 내용 삭제
  photoDisplayElement.appendChild(imgElement);
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
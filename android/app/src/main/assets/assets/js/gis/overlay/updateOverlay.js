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
        if (key === '현장사진') {
          content += `<strong class="surveyKey">${key}</strong>`;
          content += `<input id="photo-display" style="display: none;" class="surveyValue" type="text" value="${value}" onchange="updateAttributeValue('${key}', this.value)" /><br/>`;
          if (value) {
            content += `<div>`; // 이미지를 표시할 엘리먼트에 id 추가
            content += `<img src="${value}" style="width = '100%'; alt="사진" /><br/>`;
            content += '</div>';
          }
          content += `<button onclick="takePhoto()">사진 찍기</button>`;
          continue;
        }

        content += `<strong class="surveyKey">${key}</strong>`;
        content += `<input class="surveyValue" type="text" value="${value}" onchange="updateAttributeValue('${key}', this.value)" /><br/>`;
      }
    }

    content += `<div class="button-container">
    <button class="custom-button" onclick="saveFeature()">저장</button>
    <button class="custom-button cancel" onclick="onInsertCancel()">취소</button>
  </div>`;
    document.getElementById('update-overlay').innerHTML = content;
    updateOverlay.setPosition(event.coordinate);
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};


function updateAttributeValue(key, value) {
  const properties = updateFeature.values_.features[0].values_;

  if (key === '현장사진') {
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
  imgElement.style.width = '100%';
  imgElement.style.height = 'auto';

  imgElement.src = imageDataURI;
  imgElement.alt = '사진';
  
  // 이미지를 보여줄 엘리먼트를 가져옴
  const photoDisplayElement = document.getElementById('photo-display');
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

      // 이미지 데이터 URI를 올바르게 처리하여 보냄
      displayPhoto(base64Image); // 이미지를 표시하는 함수 호출
      updateAttributeValue('현장사진', base64Image); // 현장사진 업데이트

      // 파일명을 추출하여 텍스트 입력란에 넣어주기
      const fileName = file.name;
      const photoPathInput = document.getElementById('photo-display');
      if (photoPathInput) {
        photoPathInput.value = fileName;
      }

      // 이미지 데이터 URI를 앱으로 보내는 코드 (필요한 경우 추가)
      // window.postMessage(base64Image);
      console.log(file);
    };
    reader.readAsDataURL(file);
  };

  input.click();
}

window.onInsertCancel = onInsertCancel;
window.updateAttributeValue = updateAttributeValue;
// import { insertOverlay, updateOverlay } from "../map.js";

let updateFeature;
let tempFeature;
const showUpdateTooltip = event => {
  const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature;
  });
  if (feature?.values_.features == undefined) {
    return;
  }
  if (insertOverlay.getElement().style.display == 'block') {
    toastAlert('저장 후 수정 가능합니다.');
    return;
  }
  if (feature) {
    tempFeature = feature.values_.features[0]
    const properties = feature.values_.features[0].values_;
    updateFeature = feature;

    let content = '<h5>현장 정보</h5><div class="overlayClose close2" onclick="onInsertCancel()"></div>';

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'geometry') {
          continue;
        }

        let value = properties[key];

        if (key === '현장사진1') {
          content += `<strong class="surveyKey">${key}</strong>`;
          content += `<input id="photo-text1" style="display: none;" class="surveyValue" type="text" value="${value}" />`;
          if (value) {
            content += `<img id="photo-display1" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
          } else {
            content += `<img id="photo-display1" style="width : 100%; height : auto;"/>`;
          }
          content += `<button onclick="takePhoto1()">사진 찍기</button>`;
          continue;
        }
        if (key === '현장사진2') {
          content += `<br/><strong class="surveyKey">${key}</strong>`;
          content += `<input id="photo-text2" style="display: none;" class="surveyValue" type="text" value="${value}" />`;
          if (value) {
            content += `<img id="photo-display2" src="${value}" style="width : 100%; height : auto;" alt="사진" />`;
          } else {
            content += `<img id="photo-display2" style="width : 100%; height : auto;"/>`;
          }
          content += `<button onclick="takePhoto2()">사진 찍기</button>`;
          continue;
        }
        if (value == null) {
          value = '';
        }
        content += `<strong class="surveyKey">${key}</strong>`;
        content += `<input class="surveyValue" type="text" value="${value}"/><br/>`;
      }
    }

    content += `<div class="button-container">
    <button class="custom-button" onclick="saveFeature()">저장</button>
    <button class="custom-button cancel" onclick="deleteFeature()">삭제</button>
  </div>`;
    const updateOverlayElement = document.getElementById('update-overlay');
    updateOverlayElement.innerHTML = content; // Update overlay content
    updateOverlay.setPosition(event.coordinate);
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};

function onInsertCancel() {
  updateOverlay.getElement().style.display = 'none';
}

function deleteFeature() {
  // if(window.confirm('정말 삭제하시겠습니까?')){
  const layer = map.getAllLayers().find(layer => layer.values_.id == 'suveyLayer')
  console.log(layer)
  console.log(tempFeature)
  layer.getSource().removeFeature(tempFeature)
  updateOverlay.getElement().style.display = 'none';
  console.log(modifyInteraction)
  modifyInteraction.setActive(false)
  modifyInteraction.setActive(true)
  toastAlert('삭제되었습니다')
  updateGeojson()
// }
}

function displayPhoto1(imageDataURI) {
  // 이미지를 보여줄 엘리먼트를 가져옴
  const photoDisplayElement = document.getElementById('photo-display1');
  photoDisplayElement.src = imageDataURI;
}

function displayPhoto2(imageDataURI) {
  // 이미지를 보여줄 엘리먼트를 가져옴
  const photoDisplayElement = document.getElementById('photo-display2');
  photoDisplayElement.src = imageDataURI;
}

function takePhoto1() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = true;

  input.onchange = async function () {
    const file = this.files[0];
    try {
      const compressedBase64Image = await compressImage(file);
      displayPhoto1(compressedBase64Image);
      const photoTextElement = document.getElementById('photo-text1');
      photoTextElement.value = compressedBase64Image;
      console.log(file);
    } catch (error) {
      console.error('Failed to compress image:', error);
    }
  };
  input.click();
}

function takePhoto2() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = true;

  input.onchange = async function () {
    const file = this.files[0];
    try {
      const compressedBase64Image = await compressImage(file);
      displayPhoto2(compressedBase64Image);
      const photoTextElement = document.getElementById('photo-text2');
      photoTextElement.value = compressedBase64Image;
      console.log(file);
    } catch (error) {
      console.error('Failed to compress image:', error);
    }
  };

  input.click();
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 원하는 이미지 크기로 조정
        const maxWidth = 800; // 원하는 최대 너비
        const maxHeight = 800; // 원하는 최대 높이
        let newWidth = img.width;
        let newHeight = img.height;

        if (img.width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (img.height * maxWidth) / img.width;
        }

        if (newHeight > maxHeight) {
          newWidth = (newWidth * maxHeight) / newHeight;
          newHeight = maxHeight;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // 이미지를 Base64로 압축
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7은 이미지 품질 (0.0 ~ 1.0)

        resolve(compressedBase64);
      };
      img.onerror = error => {
        reject(error);
      };
    };
    reader.onerror = error => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

window.onInsertCancel = onInsertCancel;

let updateFeature;
let tempFeature;
const showUpdateTooltip = async event => {
  console.log(modifyInteraction.vertexFeature_);
  
  const feature = modifyInteraction.vertexFeature_;
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

    let content = '<h5>현장 정보</h5><div class="overlayClose close2" onclick="onUpdateCancel()"></div>';
    
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (key == 'geometry') {
          continue;
        }
        if (key == 'geometries') {
          continue;
        }
        if (key == 'features') {
          continue;
        }
        
        let value = properties[key];
        if (key === '지형지물') {
          content += `<strong class="surveyKey">${key}</strong>`;
          content += `<select class="surveyValue">`;
          if (value == '도로') {
            content += `<option value="도로" selected>도로</option>`
          } else {
            content += `<option value="도로">도로</option>`;
          }
          if (value == '다리(교량)') {
            content += `<option value="다리(교량)" selected>다리(교량)</option>`
          } else {
            content += `<option value="다리(교량)">다리(교량)</option>`;
          }
          if (value == '성ㆍ절토 및 옹벽') {
            content += `<option value="성ㆍ절토 및 옹벽" selected>성ㆍ절토 및 옹벽</option>`
          } else {
            content += `<option value="성ㆍ절토 및 옹벽">성ㆍ절토 및 옹벽</option>`;
          }
          if (value == '횡단 지하도입구') {
            content += `<option value="횡단 지하도입구" selected>횡단 지하도입구</option>`
          } else {
            content += `<option value="횡단 지하도입구">횡단 지하도입구</option>`;
          }
          if (value == '보도') {
            content += `<option value="보도" selected>보도</option>`
          } else {
            content += `<option value="보도">보도</option>`;
          }
          if (value == '방파제') {
            content += `<option value="방파제" selected>방파제</option>`
          } else {
            content += `<option value="방파제">방파제</option>`;
          }
          if (value == '보') {
            content += `<option value="보" selected>보</option>`
          } else {
            content += `<option value="보">보</option>`;
          }
          if (value == '건물') {
            content += `<option value="건물" selected>건물</option>`
          } else {
            content += `<option value="건물">건물</option>`;
          }
          if (value == '도로시설물') {
            content += `<option value="도로시설물" selected>도로시설물</option>`
          } else {
            content += `<option value="도로시설물">도로시설물</option>`;
          }
          if (value == '방파제') {
            content += `<option value="방파제" selected>방파제</option>`
          } else {
            content += `<option value="방파제">방파제</option>`;
          }
          if (value == '표지') {
            content += `<option value="표지" selected>표지</option>`
          } else {
            content += `<option value="표지">표지</option>`;
          }
          if (value == '구조물') {
            content += `<option value="구조물" selected>구조물</option>`
          } else {
            content += `<option value="구조물">구조물</option>`;
          }
          if (value == '전주') {
            content += `<option value="전주" selected>전주</option>`
          } else {
            content += `<option value="전주">전주</option>`;
          }
          if (value == '맨홀') {
            content += `<option value="맨홀" selected>맨홀</option>`
          } else {
            content += `<option value="맨홀">맨홀</option>`;
          }
          if (value == 'CCTV') {
            content += `<option value="CCTV" selected>CCTV</option>`
          } else {
            content += `<option value="CCTV">CCTV</option>`;
          }
          if (value == '담장') {
            content += `<option value="담장" selected>담장</option>`
          } else {
            content += `<option value="담장">담장</option>`;
          }

            content += `</select><br/>`;
          continue;
        }

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
    updateOverlay.setPosition(event.coordinate);
    updateOverlay.getElement().style.display = 'block';
    insertOverlay.getElement().style.display = 'none';
  } else {
    updateOverlay.getElement().style.display = 'none';
  }
};

function onUpdateCancel() {
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
  const photoDisplayElement = document.getElementById('photo-update-display1');
  photoDisplayElement.src = imageDataURI;
}

function displayPhoto2(imageDataURI) {
  // 이미지를 보여줄 엘리먼트를 가져옴
  const photoDisplayElement = document.getElementById('photo-update-display2');
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
      const photoTextElement = document.getElementById('photo-update-text1');
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
      const photoTextElement = document.getElementById('photo-update-text2');
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

window.onUpdateCancel = onUpdateCancel;

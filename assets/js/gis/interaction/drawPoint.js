import { vectorLayer } from "/assets/js/gis/layers/userLayers.js";

// 오버레이 표시 함수
export function showOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";
}

// 오버레이 숨김 함수
export function hideOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
}

// 그리기 인터렉션 생성
//1초 후 작동

export let drawInteraction = new ol.interaction.Draw({
  // source: map.getLayerById("vectorLayer").getSource(),
  type: "Point",
});

let insertFeature;
// 그리기 인터렉션 이벤트 리스너 등록
drawInteraction.on("drawend", function (event) {
  // 그려진 feature를 Vector Source에 추가합니다.
  insertFeature = event.feature;
  vectorLayer.getSource().addFeature(event.feature);

  showOverlay();
});

// 확인 버튼 클릭 시 이벤트 처리 함수
function onConfirmClick() {
  hideOverlay();
}

// 취소 버튼 클릭 시 이벤트 처리 함수
function onCancelClick() {
  map.getAllLayers()[1].getSource().removeFeature(insertFeature);
  hideOverlay();
}

// 확인 버튼과 취소 버튼에 클릭 이벤트를 등록합니다.
document
  .getElementById("confirm-btn")
  .addEventListener("click", onConfirmClick);
document.getElementById("cancel-btn").addEventListener("click", onCancelClick);

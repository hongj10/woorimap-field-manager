// 지도 호출
export const baseLayer = new ol.layer.Tile({
  title: "VWorld Gray Map",
  visible: true,
  type: "base",
  source: new ol.source.XYZ({
    url: "http://mt0.google.com/vt/lyrs=m&hl=ko&x={x}&y={y}&z={z}",
    // url: "https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png",
  }),
});


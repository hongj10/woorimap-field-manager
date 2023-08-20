// 지도 호출
const baseLayer = new ol.layer.Tile({
  title: "VWorld Gray Map",
  visible: true,
  type: "base",
  source: new ol.source.XYZ({
    url: `http://api.vworld.kr/req/wmts/1.1.1/616470D8-8671-3CC5-94EF-70A776DB2216/Base/{z}/{y}/{x}.png`,
    tileSize: 512,
  }),
});

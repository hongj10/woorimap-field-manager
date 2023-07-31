import { baseLayer } from '/assets/js/gis/layers/baseLayer.js';
import { geoLocationLayer } from '/assets/js/gis/layers/geoLocationLayer.js';
// import { vectorLayer } from '/assets/js/gis/layers/userLayers.js';

export const defaultView = new ol.View({
    projection: 'EPSG:4326',
    center: [126.8809728, 37.4734848],            // 카메라 중심 좌표
    zoom: 13,                                                          // 줌레벨 초기화
    minZoom: 6,                                                        // 최소 줌레벨
    maxZoom: 19
})
  
export var map = new ol.Map({
    // layers: [baseLayer, vectorLayer, geoLocationLayer],
    layers: [baseLayer, geoLocationLayer],
    target: 'map',
    view: defaultView
});
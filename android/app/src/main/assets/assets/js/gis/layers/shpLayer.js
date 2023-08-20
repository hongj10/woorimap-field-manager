// Shapefile을 GeoJSON으로 변환하고 지도에 표시하는 함수
// async function shpToGeoJSONAndDisplay(shpUrl, targetCrs) {
//     const response = await fetch(shpUrl);
//     const arrayBuffer = await response.arrayBuffer();
//     const geojson = await shp(arrayBuffer);

//     // 좌표계 변환
//     if (targetCrs) {
//         const sourceProjCode = 'EPSG:4326'; // 원본 좌표계 (4326)
//         const targetProjCode = targetCrs;   // 목표 좌표계 (예: 'EPSG:5186')

//         // 좌표계 객체 생성
//         const sourceProj = ol.proj.get(sourceProjCode);
//         const targetProj = ol.proj.get(targetProjCode);

//         // 좌표 변환
//         geojson.features.forEach((feature) => {
//             feature.geometry.coordinates = ol.proj.transform(
//                 feature.geometry.coordinates,
//                 sourceProj,
//                 targetProj
//             );
//         });
//     }

//     // Vector 레이어 생성
//     const vectorSource = new ol.source.Vector({
//         features: new ol.format.GeoJSON().readFeatures(geojson),
//     });

//     const vectorLayer = new ol.layer.Vector({
//         id: 'N3P_F0020000',
//         source: vectorSource,
//     });

//     // 지도에 레이어 추가
//     map.addLayer(vectorLayer);
// }

// // Shapefile URL
// const shpPointUrl = 'shp\\N3P_F0020000.zip';

// // Shapefile을 GeoJSON으로 변환하고 5186 좌표계로 지도에 표시
// shpToGeoJSONAndDisplay(shpPointUrl, 'EPSG:5186')
//     .catch((error) => {
//         console.error('Error loading Shapefile:', error);
//     });
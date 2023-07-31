const vectorSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
        let strUrl = 'http://127.0.0.1:8888/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=map:userlayer&' +
            'outputFormat=application/json&srsname=EPSG:4326&' +
            'bbox=' + extent.join(',') + ',EPSG:4326';

        return strUrl;
    },
    strategy: ol.loadingstrategy.bbox
});

// vectorLayer 선언
export const vectorLayer = new ol.layer.Vector({
    source: vectorSource
});
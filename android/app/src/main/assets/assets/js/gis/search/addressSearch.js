// vworld 주소 검색
const searchAddress = async (address) => {
    const vworldKey = 'B62CE736-324C-3944-80CE-9D66EED70464';
    const url = `https://api.vworld.kr/req/search?key=${vworldKey}&type=ADDRESS&category=ROAD&request=search&crs=EPSG:5179&query=${address}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.response.result.items;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

// 검색 버튼 클릭 시 동작
document.getElementById('searchAddressButton').addEventListener('click', async () => {
    const searchText = document.getElementById('searchText').value;
    const resultList = document.getElementById('resultList');
    
    if (searchText) {
        resultList.innerHTML = ''; // 이전 검색 결과 초기화
        
        try {
            const items = await searchAddress(searchText);
            
            if (items.length > 0) {
                items.forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item.address.road;
                    resultList.appendChild(li);
                });
            } else {
                const noResults = document.getElementById('noResults');
                noResults.classList.remove('none');
            }
        } catch (error) {
            console.error('Error searching address:', error);
        }
    }
});

// 주소 검색 결과 항목 클릭 시 동작
document.getElementById('resultList').addEventListener('click', async (event) => {
    const target = event.target;
    if (target.tagName === 'LI') {
        const address = target.textContent;
        const items = await searchAddress(address);
        
        if (items.length > 0) {
            const selectedItem = items[0];
            const x = parseFloat(selectedItem.point.x);
            const y = parseFloat(selectedItem.point.y);
            // OpenLayers 카메라 위치 변경
            map.getView().animate({ center: [x, y], zoom: 15 });
            
            // 기존 마커 제거
            // vectorLayer.getSource().clear();
            
            // 새로운 마커 추가
            items.forEach((item) => {
                const markerFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(item.point.x), parseFloat(item.point.y)])),
                });
                // vectorLayer.getSource().addFeature(markerFeature);
            });
        }
    }
});
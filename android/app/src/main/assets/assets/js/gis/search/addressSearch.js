// vworld 주소 검색
const searchAddress = async address => {
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

// vworld 좌표 검색
const searchCoord = async coord => {
  const vworldKey = 'B62CE736-324C-3944-80CE-9D66EED70464';
  const url = `https://api.vworld.kr/req/address?service=address&request=getAddress&crs=EPSG:5179&point=${coord}&type=ROAD&zipcode=true&simple=false&key=${vworldKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.response.result[0].text;
  } catch (error) {
    console.error('Error fetching data:', error);
    return '';
  }
};

// 검색 버튼 클릭 시 동작
document
  .getElementById('searchAddressButton')
  .addEventListener('click', async () => {
    const searchText = document.getElementById('searchText').value;
    const resultList = document.getElementById('resultList');

    if (searchText) {
      resultList.innerHTML = ''; // 이전 검색 결과 초기화

      try {
        const items = await searchAddress(searchText);

        // 중복을 제거하기 위한 배열
        const uniqueItems = [];

        // 주소를 기준으로 중복을 제거
        items.forEach(item => {
          const road = item.address.road;
          if (!uniqueItems.includes(road)) {
            uniqueItems.push(road);
          }
        });

        if (uniqueItems.length > 0) {
          uniqueItems.forEach(road => {
            const li = document.createElement('li');
            li.textContent = road;
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

const addressLayer = new ol.layer.Vector({
  source: new ol.source.Vector(), // 마커 등의 데이터를 포함하는 벡터 데이터 소스
  // style: new ol.style.Style({
  // image: new ol.style.Icon({
  //   src: 'https://openlayers.org/en/latest/examples/data/icon.png',
  // }),
  // }),
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: 'assets/images/marker_address.png',
      scale: 0.5,
    }),
  }),
});

// 주소 검색 결과 항목 클릭 시 동작
document.getElementById('resultList').addEventListener('click', async event => {
  //addressLayer 가 없으면 생성
  if (!map.getLayers().getArray().includes(addressLayer)) {
    map.addLayer(addressLayer);
  }

  const target = event.target;
  if (target.tagName === 'LI') {
    const address = target.textContent;
    const items = await searchAddress(address);

    if (items.length > 0) {
      const selectedItem = items[0];
      const x = parseFloat(selectedItem.point.x);
      const y = parseFloat(selectedItem.point.y);
      // OpenLayers 카메라 위치 변경
      map.getView().animate({center: [x, y], zoom: 15});

      // 기존 마커 제거
      addressLayer?.getSource().clear();

      // 새로운 마커 추가
      // items.forEach(item => {
      const markerFeature = new ol.Feature({
        //좌표계가 다른지 다른 위치에 찍혀
        geometry: new ol.geom.Point([x, y]),
        //geometry 넣기        
      });
      addressLayer.getSource().addFeature(markerFeature);
      // });
    }
  }
});

// flatCoordinates
// :
// Array(2)
// 0
// :
// 950554.6848554155
// 1
// :
// 1951114.052453982

// 1108766.395150376 1655797.68743924'

window.searchCoord = searchCoord;
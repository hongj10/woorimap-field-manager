import React, { useEffect, useRef } from 'react';
import { View, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import shp from 'shpjs';

const requestFilePermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('You can read/write files');
      return true;
    } else {
      console.log('File read/write permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const displayShapefileOnMap = async (filePath: string) => {
  try {
    // 파일의 바이너리 데이터로 읽어오기
    const shpFileData = await RNFS.readFileAssets(filePath, 'base64');
    console.log(shpFileData)
    const shpData = shp.parseZip(shpFileData);
    const vectorSource = new ol.source.Vector({
      features: new ol.format.GeoJSON().readFeatures(shpData),
    });

    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      // 이하 스타일 및 설정
    });

    map.addLayer(vectorLayer);
  } catch (error) {
    console.error('Error displaying Shapefile on map:', error);
  }
};

const displayShapefilesInFolder = async (folderPath: string) => {
  try {
    const folderContent = await RNFS.readDir(`${RNFS.DownloadDirectoryPath}/wg-survey/shp`);
    console.log(folderContent);
    for (const item of folderContent) {
      if (item.isFile() && item.name.endsWith('.shp')) {
        const shpFilePath = item.path;
        await displayShapefileOnMap(shpFilePath);
      }
    }
  } catch (error) {
    console.error('Error displaying Shapefiles in folde:', error);
  }
};

const checkFirstLaunch = async () => {
  try {
    const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
    if (isFirstLaunch === null) {
      const hasPermissions = await requestFilePermissions();
      if (hasPermissions) {
        // const sourcePath = Platform.OS === 'android'
          // ? `${RNFS.ExternalDirectoryPath}/survey.geojson` // 앱의 외부 저장소 경로를 사용
          // : `${RNFS.MainBundlePath}/geojson/survey.geojson`;

        const sourcePath = `assets/geojson/survey.geojson`;
        const destinationPath = `${RNFS.DownloadDirectoryPath}/wg-survey/geojson/survey.geojson`;

        const folderWgExists = await RNFS.exists(`${RNFS.DownloadDirectoryPath}/wg-survey`);
        if (!folderWgExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey`);
        }
        // 폴더가 없으면 생성합니다.
        const folderGeoExists = await RNFS.exists(`${RNFS.DownloadDirectoryPath}/wg-survey/geojson`);
        if (!folderGeoExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey/geojson`);
        }
        const folderShpExists = await RNFS.exists(`${RNFS.DownloadDirectoryPath}/wg-survey/shp`);
        if (!folderShpExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey/shp`);
        }

        // 파일 복사 부분 주석 처리

        // const fileExists = await RNFS.exists(sourcePath);
        // if (fileExists) {
        //   await RNFS.copyFile(sourcePath, destinationPath);
        //   console.log('File copied successfully!');
        // } else {
        //   console.error('Source file does not exist:', sourcePath);
        // }

        await AsyncStorage.setItem('isFirstLaunch', 'false'); // 최초 실행 상태 저장
      }
    }
  } catch (error) {
    console.error("Failed to check app's first launch: ", error);
  }
};

const readGeoJSONFile = async (filePath: string) => {
  if (await requestFilePermissions()) {
    try {
      const geojsonData = await RNFS.readFile(filePath, 'utf8');
      return geojsonData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};

const App = () => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = async (event: { nativeEvent: { data: string; }; }) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'SAVE_GEOJSON' && message.data) {
        await saveGeoJSONToFile(message.data);
      }
      
      if (message.type === 'LOAD_SHAPEFILE' && message.filePath) {
        await displayShapefileOnMap(message.filePath);
      } else if (message.type === 'LOAD_SHAPEFILES_FOLDER') {
        await displayShapefilesInFolder(message.folderPath);
      }
    
  };
  
  const saveGeoJSONToFile = async (geoJSONString: string) => {
    if (await requestFilePermissions()) {
        try {
            const filePath = `${RNFS.DownloadDirectoryPath}/wg-survey/geojson/survey.geojson`; 
            await RNFS.writeFile(filePath, geoJSONString, 'utf8');
            console.log('GeoJSON 성공적으로 저장되었습니다!');
        } catch (error) {
            console.error('GeoJSON 저장 실패: ', error);
        }
    }
  };
  
  const sendGeoJSONToWebView = async () => {
    const data = await readGeoJSONFile(`${RNFS.DownloadDirectoryPath}/wg-survey/geojson/survey.geojson`); // 앱의 외부 저장소 경로를 사용
    console.log("LOAD_GEOJSON");
    if (typeof data === 'string') {
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'LOAD_GEOJSON',
        data,
      }));
    } else {
      console.error('Failed to read GeoJSON data or permission denied.');
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
        await checkFirstLaunch();
        await sendGeoJSONToWebView();
        await handleMessage({ nativeEvent: { data: '{"type":"LOAD_SHAPEFILES_FOLDER"}' } });
    };
    
    initializeApp();
}, []);
return (
  <View style={{ flex: 1 }}>
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ uri: 'file:///android_asset/index.html' }}
      onMessage={handleMessage}
      onLoadEnd={sendGeoJSONToWebView}
    />
  </View>
);
};

export default App;

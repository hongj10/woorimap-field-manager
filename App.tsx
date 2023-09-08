import React, {useEffect, useRef } from 'react';
import DeviceInfo from 'react-native-device-info';
import {View, PermissionsAndroid} from 'react-native';
import {WebView} from 'react-native-webview';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {RNCamera} from 'react-native-camera';
import shp from 'shpjs';
import axios from 'axios';
import { Geometry } from 'geojson';
import { decode } from 'base-64'; // Import the decode function from base-64
import IntentLauncher from 'react-native-intent-launcher'; // Import IntentLauncher

const requestFilePermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (
      granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED
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

const checkAndRequestPermissions = async () => {
  const hasPermissions = await requestFilePermissions();
  if (hasPermissions) {
    await checkFirstLaunch();
    await sendGeoJSONToWebView();
  }
};

const packageName = DeviceInfo.getBundleId();

const requestManageExternalStoragePermission = () => {
  IntentLauncher.startActivity({
    action: 'android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',
    data: `package:${packageName}`,
  });
};

const checkFirstLaunch = async () => {
  try {
    const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
    if (isFirstLaunch === null) {
      await requestManageExternalStoragePermission();
      const hasPermissions = await requestFilePermissions();
      if (hasPermissions) {
        // const sourcePath = Platform.OS === 'android'
        // ? `${RNFS.ExternalDirectoryPath}/survey.geojson` // 앱의 외부 저장소 경로를 사용
        // : `${RNFS.MainBundlePath}/geojson/survey.geojson`;
        const geoJsonContent = `{
          "type":"FeatureCollection",
          "features":[
            {
              "type":"Feature",
              "geometry":{
                "type":"Point",
                "coordinates":[950788.9055305821, 1951939.113108684]
              },
              "properties":{
                "도엽명":null,
                "조사내용":null,
                "주소":null,
                "현장사진":null
              }
            }
          ]
        }`;

        const filePath = `${RNFS.DownloadDirectoryPath}/wg-survey/geojson/survey.geojson`;

        // GeoJSON 파일을 생성하고 내용을 쓰기 위해 writeFile 메서드를 사용합니다.
        await RNFS.writeFile(filePath, geoJsonContent, 'utf8');
        const folderWgExists = await RNFS.exists(
          `${RNFS.DownloadDirectoryPath}/wg-survey`,
        );
        if (!folderWgExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey`);
        }
        // 폴더가 없으면 생성합니다.
        const folderGeoExists = await RNFS.exists(
          `${RNFS.DownloadDirectoryPath}/wg-survey/geojson`,
        );
        if (!folderGeoExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey/geojson`);
        }
        const folderShpExists = await RNFS.exists(
          `${RNFS.DownloadDirectoryPath}/wg-survey/shp`,
        );
        if (!folderShpExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg-survey/shp`);
        }
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
  const handleMessage = async (event: {nativeEvent: {data: string}}) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'SAVE_GEOJSON' && message.data) {
      await saveGeoJSONToFile(message.data);
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
    const data = await readGeoJSONFile(
      `${RNFS.DownloadDirectoryPath}/wg-survey/geojson/survey.geojson`,
    ); // 앱의 외부 저장소 경로를 사용
    console.log('LOAD_GEOJSON');
    if (typeof data === 'string') {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'LOAD_GEOJSON',
          data,
        }),
      );
    } else {
      console.error('Failed to read GeoJSON data or permission denied.');
    }

    readShapefiles()
  };

  const readShapefiles = async () => {
    const shpDirectoryPath = `${RNFS.DownloadDirectoryPath}/wg-survey/shp`;
    try {
      const shpFileNames = await RNFS.readdir(shpDirectoryPath);

      // 각 SHP 파일을 GeoJSON으로 변환하여 지도에 표출
      for (const shpFileName of shpFileNames) {
        if (shpFileName.endsWith('.shp')) {
          const shpFilePath = `${shpDirectoryPath}/${shpFileName}`;
          // SHP 파일을 GeoJSON으로 변환
          const geojsonData = await convertShpToGeoJSON(shpFilePath);

          // 지도에 표출하는 함수 호출
          displayGeoJSONOnMap(geojsonData, shpFileName);
        }
      }
    } catch (error) {
      console.error('Error reading SHP files:', error);
    }
  };

  const convertBase64ToUint8Array = (base64: string) => {
    const binaryString = decode(base64); // Use decode from base-64 to decode the base64 string
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
  
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
  
    return uint8Array;
  };

  const convertShpToGeoJSON = async (shpFilePath: string) => {
    try {
      const shpBase64String = await RNFS.readFile(shpFilePath, 'base64');
      const shpUint8Array = convertBase64ToUint8Array(shpBase64String);
      const geojsonData = shp.parseShp(shpUint8Array);
  
      return geojsonData;
    } catch (error) {
      console.error('Error converting SHP to GeoJSON:', error);
      return null;
    }
  };
  
  const displayGeoJSONOnMap = (geojsonData: Geometry[] | null, _shpFileName: string) => {
    if (geojsonData) {
      const messageData = {
        type: 'LOAD_SHAPEFILE',
        shapefileData: geojsonData,
        shpFileName: _shpFileName,
      };

      // WebView로 메시지를 전송하여 지도에 표출
      webViewRef.current?.postMessage(JSON.stringify(messageData));
    }
  };
  
  useEffect(() => {
    const initializeApp = async () => {
      await checkFirstLaunch();
      await sendGeoJSONToWebView();
    };

    initializeApp();
    checkAndRequestPermissions();
  }, []);
  return (
    <View style={{flex: 1}}>
      <WebView
        ref={webViewRef}
        allowFileAccess={true}
        originWhitelist={["*"]}
        source={{uri: 'file:///android_asset/index.html'}}
        onMessage={handleMessage}
        onLoad={sendGeoJSONToWebView}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
      />
    </View>
  );
};

export default App;

function sendGeoJSONToWebView() {
  throw new Error('Function not implemented.');
}

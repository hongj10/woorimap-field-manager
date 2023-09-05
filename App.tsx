import React, {useEffect, useRef} from 'react';
import {View, PermissionsAndroid} from 'react-native';
import {WebView} from 'react-native-webview';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {RNCamera} from 'react-native-camera';
import shp from 'shpjs';
import axios from 'axios';

const requestFilePermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
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
  // const cameraRef = useRef<RNCamera | null>(null); // RNCamera 참조를 위한 useRef 추가
  const originWhitelist = ['https://api.vworld.kr'];

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

    const shapefilePath = `${RNFS.DownloadDirectoryPath}/wg-survey/shp/N3P_F0020000.shp`;

    // Shapefile 데이터를 이진 버퍼로 읽어옴
    const shapefileData = await RNFS.readFile(shapefilePath, 'base64');

    if (shapefileData) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'LOAD_SHAPEFILE',
          shapefileData,
        }),
      );
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await checkFirstLaunch();
      await sendGeoJSONToWebView();
    };

    initializeApp();
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

import React, { useEffect, useRef } from 'react';
import { View, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const requestFilePermissions = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
        {
          title: "External Storage Write Permission",
          message:
            "App needs access to storage to save and retrieve files.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return (granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      return (
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};


const checkFirstLaunch = async () => {
  try {
    const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
    console.log(isFirstLaunch,"isFirstLaunch")
    if (isFirstLaunch === null) {
      const hasPermissions = await requestFilePermissions();
      if (hasPermissions) {
        const sourcePath = `${RNFS.DownloadDirectoryPath}/wg_survey/geojson/survey.geojson`;
        const destinationPath = `${RNFS.DocumentDirectoryPath}/wg_survey/geojson/survey.geojson`;

        // 폴더가 없으면 생성합니다.
        const folderExists = await RNFS.exists(`${RNFS.DownloadDirectoryPath}/wg_survey/geojson`);
        console.log(folderExists,"folderExists");
        if (!folderExists) {
          await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/wg_survey/geojson`);
        }

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
  };
  
  const saveGeoJSONToFile = async (geoJSONString: string) => {
    if (await requestFilePermissions()) {
        try {
          const filePath = `${RNFS.DownloadDirectoryPath}/wg_survey/geojson/survey.geojson`;
            await RNFS.writeFile(filePath, geoJSONString, 'utf8');
            console.log('GeoJSON 성공적으로 저장되었습니다!');
        } catch (error) {
            console.error('GeoJSON 저장 실패: ', error);
        }
    }
  };
  
  const sendGeoJSONToWebView = async () => {
    const data = await readGeoJSONFile(`${RNFS.DownloadDirectoryPath}/wg_survey/geojson/survey.geojson`);
    console.log(data,"이거이거");
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
    checkFirstLaunch();
    sendGeoJSONToWebView();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: 'file:///android_asset/index.html' }}
        onMessage={handleMessage}
      />
    </View>
  );
};

export default App;

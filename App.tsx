import React, { useRef } from 'react';
import { View, Button, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {

  const webViewRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: 'file:///android_asset/index.html' }}
      />
    </View>
  );
};

export default App;
import React, { CSSProperties } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
export const NativeWebView = (props) => {
    if (Platform.OS === 'web') {
        return <iframe src={props.target} style={styles} />;
    }
    return <WebView source={{ uri: props.target }} />;
};

const styles = {
    height: 600,
    width: 800,
    overflow: 'hidden'
};
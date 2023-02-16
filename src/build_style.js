import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import NativeTachyons from 'react-native-style-tachyons';
const { height, width } = Dimensions.get('window');
export function buildStyle() {
    NativeTachyons.build({
        fonts: {
            fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'HelveticaNeue'
        },
        rem: width > 340 ? 18 : 16
    }, StyleSheet);
}

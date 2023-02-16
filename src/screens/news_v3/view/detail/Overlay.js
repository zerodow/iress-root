import * as React from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';

const DEFAULT_ANIMATE_TIME = 300;
const styles = StyleSheet.create({
    fullOverlay: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        position: 'absolute'
    },
    emptyOverlay: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        position: 'absolute'
    }
});

class Overlay extends React.Component {
    state = {
        fadeAnim: new Animated.Value(0),
        overlayStyle: styles.emptyOverlay
    };

    onAnimatedEnd() {
        if (!this.props.visible) {
            this.setState({ overlayStyle: styles.emptyOverlay });
        }
    }
    componentWillReceiveProps(newProps) {
        if (newProps.visible) {
            this.setState({ overlayStyle: styles.fullOverlay });
        }
        if (newProps.visible && Platform.OS === 'android') {
            return this.state.fadeAnim.setValue(1) // Tren android: Khi dialog open thi app inactive -> bien fadeAnim khong bang 1. Khi ẩn dialog sẽ bị chớp
        }
        return Animated.timing(this.state.fadeAnim, {
            toValue: newProps.visible ? 1 : 0,
            duration: DEFAULT_ANIMATE_TIME,
            useNativeDriver: true
        }).start(this.onAnimatedEnd.bind(this));
    }
    render() {
        return (
            <Animated.View style={[this.state.overlayStyle, { opacity: this.state.fadeAnim }]}>
                {this.props.children}
            </Animated.View>
        );
    }
}

export default Overlay;

import React, { Component } from 'react';
import {
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';
import Animated from 'react-native-reanimated';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import Interactable from './Interactable';
import Animations from './Animations';

const { width: deviceWidth } = Dimensions.get('window');

const DELETE_WIDTH = 100;

export default class DeleteAnimator extends Component {
    constructor(props) {
        super(props);
        this._deltaX = new Animated.Value(0);
        this._deleteX = new Animated.Value(0);
        this._deleteY = new Animated.Value(0);
        this._heightChild = new Animated.Value(0);
    }

    onDelete = this.onDelete.bind(this);
    onDelete() {
        this._aniX && this._aniX.start();
    }

    renderDeleteComp() {
        return (
            <TouchableOpacity onPress={this.onDelete}>
                <View
                    style={[styles.deleteContainer, this.props.deleteStyles2]}
                >
                    <View
                        style={[styles.deleteContent, this.props.deleteStyles]}
                    >
                        <Text style={styles.deleteTitle}>
                            {this.props.title}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    show = this.show.bind(this);
    show() {
        this._interactable && this._interactable.snapTo({ index: 1 });
    }

    hide = this.hide.bind(this);
    hide() {
        this._interactable && this._interactable.snapTo({ index: 0 });
    }

    onEndX = this.onEndX.bind(this);
    onEndX() {
        this.props.onDelete && this.props.onDelete();
    }

    setRefAniX = this.setRefAniX.bind(this);
    setRefAniX(sef) {
        this._aniX = sef;
    }

    setRefInteractable = this.setRefInteractable.bind(this);
    setRefInteractable(sef) {
        this._interactable = sef;
    }

    onLayout = this.onLayout.bind(this);
    onLayout(e) {
        const { height } = e.nativeEvent.layout;
        this._heightChild.setValue(height);
    }

    onSnap = this.onSnap.bind(this);
    onSnap({ nativeEvent: { x } }) {
        if (x !== 0 && this.props.onSnapToPoint) {
            this.props.onSnapToPoint();
        }
    }

    render() {
        const { damping, tension, children, interactableStyles } = this.props;

        const heightInteractable = this._deleteX.interpolate({
            inputRange: [0, DELETE_WIDTH],
            outputRange: [this._heightChild, 0]
        });

        const transformInteractable = [
            {
                translateX: this._deleteX.interpolate({
                    inputRange: [0, DELETE_WIDTH],
                    outputRange: [0, -deviceWidth]
                })
            }
        ];

        return (
            <React.Fragment>
                <Animations
                    ref={this.setRefAniX}
                    value={this._deleteX}
                    duration={DELETE_WIDTH}
                    onEnd={this.onEndX}
                />
                <Interactable.View
                    dragEnabled={this.props.dragEnabled}
                    ref={this.setRefInteractable}
                    horizontalOnly
                    onSnap={this.onSnap}
                    snapPoints={[
                        {
                            x: 0,
                            damping: 1 - damping,
                            tension: tension
                        },
                        {
                            x: -DELETE_WIDTH,
                            damping: 1 - damping,
                            tension: tension
                        }
                    ]}
                    animatedValueX={this._deltaX}
                    style={{
                        ...interactableStyles,
                        height: heightInteractable,
                        width: 2 * deviceWidth,
                        transform: transformInteractable
                    }}
                >
                    <View
                        onLayout={this.onLayout}
                        style={[
                            this.props.style,
                            {
                                position: 'absolute',
                                width: deviceWidth
                            }
                        ]}
                    >
                        {children}
                    </View>

                    <View
                        style={styles.panDelContainer}
                        pointerEvents="box-none"
                    >
                        <View style={styles.panDelContent}>
                            {this.renderDeleteComp()}
                        </View>
                    </View>
                </Interactable.View>
            </React.Fragment>
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    deleteContainer: {
        width: '150%',
        // height: '100%',
        borderRadius: 8,
        backgroundColor: CommonStyle.btnClosePositionBgColor
    },
    deleteContent: {
        height: '100%',
        width: DELETE_WIDTH,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteTitle: {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeM,
        color: CommonStyle.fontWhite
    },
    panDelContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '100%'
    },
    panDelContent: {
        position: 'absolute',
        top: 0,
        left: deviceWidth - DELETE_WIDTH,
        width: deviceWidth,
        height: '100%',
        justifyContent: 'center',
        transform: [{ translateX: DELETE_WIDTH }]
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

DeleteAnimator.defaultProps = {
    damping: 1 - 0.7,
    tension: 300
};

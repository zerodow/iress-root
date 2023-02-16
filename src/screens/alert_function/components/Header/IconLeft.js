import React, { Component, PureComponent } from 'react';
// Component
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import CustomIcon from '~/component/Icon'
import TransitionView from '~/component/animation_component/transition_view'
import * as Animatable from 'react-native-animatable';
// Redux
import { connect } from 'react-redux'
import { changeScreenActive } from '~/screens/alert_function/redux/actions'
// ENUM
import ENUM from '~/enum'
const ALERT_SCREEN = ENUM.ALERT_SCREEN
class IconLeft extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    handleShowNewAlert = () => {
        this.props.handleShowNew && this.props.handleShowNew()
    }
    handleShowListModifyAlert = () => {
        this.refViewAni && this.refViewAni.fadeOutRight(1000).then(() => {
            this.refViewAni && this.refViewAni.fadeIn(1)
        })
        this.props.handleShowListModify && this.props.handleShowListModify()
    }
    setRef = (ref) => {
        this.refViewAni = ref
    }
    render() {
        const isDisable = this.props.isDisable || false
        return (
            <Animatable.View ref={this.setRef} style={{ flexDirection: 'row' }}>
                <TouchableOpacityOpt hitSlop={{
                    top: 16,
                    left: 16,
                    right: 16,
                    bottom: 16
                }} timeDelay={ENUM.TIME_DELAY} disabled={this.props.isDisableEdit} onPress={this.handleShowListModifyAlert} style={[styles.buttonWrapper]}>
                    <CustomIcon allowFontScaling={false} name={'equix_edit_around'} size={20} color={this.props.isDisableEdit ? CommonStyle.fontNearLight6 : CommonStyle.fontColor} />
                </TouchableOpacityOpt>
                <TouchableOpacityOpt hitSlop={{
                    top: 16,
                    left: 0,
                    right: 16,
                    bottom: 16
                }} timeDelay={ENUM.TIME_DELAY} onPress={this.handleShowNewAlert} style={[styles.buttonWrapper]}>
                    <CustomIcon allowFontScaling={false} name={'equix_new'} size={20} color={CommonStyle.fontColor} />
                </TouchableOpacityOpt>
            </Animatable.View>
        );
    }
}
const styles = StyleSheet.create({
    buttonWrapper: {
        justifyContent: 'center',
        paddingHorizontal: 16
    }
})

export default IconLeft

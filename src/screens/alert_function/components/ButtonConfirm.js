import React, { Component, PureComponent } from 'react';
// Redux
import { connect } from 'react-redux'
import Animated from 'react-native-reanimated'
// Components
import { Keyboard, View, Text, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform, Dimensions } from 'react-native';
import TransitionView from '~/component/animation_component/transition_view'
// Common
import { dataStorage, func } from '~/storage'
import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '~/streaming/channel'
import { checkRoleByKey } from '~/roleUser';
import ENUM from '~/enum'
export const TYPE = {
    SHOW: 'SHOW', // Hien Button va enable no
    HIDDEN: 'HIDDEN', // An button
    DISABLE: 'DISABLE' // Disable Button
}
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
const { width, height: heightDevices } = Dimensions.get('window')
const {
    add,
    cond,
    diff,
    divide,
    eq,
    lessThan,
    and,
    block,
    set,
    abs,
    clockRunning,
    greaterThan,
    sub,
    Value,
    or,
    not, interpolate
} = Animated;
const { ROLE_USER, ROLE_DETAIL } = ENUM;
class ButtonConfirm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.status || false,
            isLoading: false,
            isShow: true
        };
        this.subUpdateButtonConfirm()
        this.subLoading()
        dataStorage.hideButtonConfirm = this.hiden
        this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
        this.handleKeyboardHide = this.handleKeyboardHide.bind(this);
    }
    componentDidMount() {
        const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(showListener, this.handleKeyboardShow),
            Keyboard.addListener(hideListener, this.handleKeyboardHide)
        ];
    }
    handleKeyboardShow(event) {
        this.isShowKeyBoard = true
        this.hiden()
    }
    handleKeyboardHide(event) {
        this.isShowKeyBoard = false
        this.show()
    }
    subLoading = () => {
        this.subLoadingButtonConfirm = Emitter.addListener(Channel.getChannelLoadingConfirmAlert(), this.id, ({ isLoading }) => {
            if (this.state.isLoading !== isLoading) {
                this.setState({
                    isLoading
                })
            }
        })
    }
    unSubLoading = () => {
        this.subLoadingButtonConfirm && Emitter.deleteByIdEvent(this.subLoadingButtonConfirm);
    }
    subUpdateButtonConfirm = () => {
        const seft = this
        this.subUpdateButtonConfirm = Emitter.addListener(Channel.getChannelUpdateStatusButtonConfirmAlert(), this.id, ({ status }) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            switch (status) {
                case TYPE.SHOW:
                    seft.setState({
                        status: TYPE.SHOW
                    })
                    break;
                case TYPE.HIDDEN:
                    seft.setState({
                        status: TYPE.HIDDEN
                    })
                    break;
                case TYPE.DISABLE:
                    seft.setState({
                        status: TYPE.DISABLE
                    })
                    break;
                default:
                    break;
            }
        })
    }
    componentWillUnmount() {
        this.unSubUpdateButtonConfirm()
        this.unSubLoading()
        this.setState({
            isLoading
        })
        this._listeners && this._listeners.forEach(listener => listener.remove());
        dataStorage.hideButtonConfirm = null
    }
    unSubUpdateButtonConfirm = () => {
        this.subUpdateButtonConfirm && Emitter.deleteByIdEvent(this.subUpdateButtonConfirm);
    }
    onPress = () => {
        dataStorage.onConfirmAlert && dataStorage.onConfirmAlert()
        // Emitter.emit(Channel.getChannelOnPressConfirmAlert(), {})
    }
    show = () => {
        this.setState({
            isShow: true
        })
    }
    hiden = () => {
        this.setState({
            isShow: false
        })
    }
    withShowHide = () => {

    }
    renderContent = () => {
        const { status, isShow } = this.state
        if (!isShow) return
        let translateYAni = 0
        let isDisable = status === TYPE.DISABLE;
        if (this.checkDisabled()) {
            isDisable = this.checkDisabled()
        }
        if (!this.props.isModify) {
            translateYAni = interpolate(this.props._scrollValue, {
                inputRange: [heightDevices - 101, heightDevices - 100, heightDevices - 50, heightDevices, heightDevices + 1],
                outputRange: [0, 0, 400, 400, 400]
            })
        }
        return (
            <Animated.View style={{
                paddingTop: 16,
                paddingBottom: 24,
                paddingHorizontal: 16,
                backgroundColor: CommonStyle.ColorTabNews,
                borderTopWidth: 0.5,
                borderTopColor: CommonStyle.borderColorTopButtonConfrim,
                transform: [{
                    translateY: translateYAni
                }]
            }}>
                <TouchableOpacity
                    disabled={isDisable}
                    onPress={this.onPress}
                    style={{
                        width: '100%',
                        backgroundColor: isDisable ? CommonStyle.btnOrderDisableBg : CommonStyle.colorbtnConfirm,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 30,
                        height: 48
                    }}>
                    {
                        this.state.isLoading
                            ? <ActivityIndicator style={{ width: 30, height: 30 }} color={CommonStyle.fontBlack} />
                            : null
                    }
                    <Text style={{ fontFamily: CommonStyle.fontPoppinsBold, color: CommonStyle.fontBlack, fontSize: CommonStyle.fontSizeStandard }}>{I18n.t('confirm')}</Text>
                </TouchableOpacity>
            </Animated.View>
        )
    }
    checkDisabled() {
        const { isModify } = this.props;
        const checkRole = isModify
            ? checkRoleByKey(ROLE_DETAIL.ROLE_PERFORM_MODIFY_ALERT_CONFIRM_BUTTON)
            : checkRoleByKey(ROLE_DETAIL.ROLE_PERFORM_CONFIRM_BUTTON)
        return !this.props.isConnected ||
            this.state.isLoading ||
            !checkRole
    }
    render() {
        return (
            <React.Fragment>
                {this.renderContent()}
            </React.Fragment>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        isConnected: state.app.isConnected
    }
}
export default connect(mapStateToProps)(ButtonConfirm)

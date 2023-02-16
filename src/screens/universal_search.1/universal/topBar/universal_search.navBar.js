import React, { Component } from 'react'
import { View, Text, Platform, Dimensions, TouchableOpacity, DeviceEventEmitter, NativeAppEventEmitter, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { iconsMap as IconsMap } from '~/utils/AppIcons';
import { isIphoneXorAbove } from '~/lib/base/functionUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Util from '~/util';
import * as Emitter from '@lib/vietnam-emitter';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '~/memory/controller'
import * as PureFunc from '~/utils/pure_func'
import Config from '~/config';
import I18n from '~/modules/language/';
import CustomButton from '~/component/custom_button/custom_button_watchlist'
import { connect } from 'react-redux';

const ICON_NAME = Enum.ICON_NAME;
const { width, height } = Dimensions.get('window');

const IconRefreshAnim = Animated.createAnimatedComponent(Icon)

export class UnisNavBar extends Component {
    //  #region DEFINE PROPERTY
    static propTypes = {
        title: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;

        this.onRefresh = this.onRefresh.bind(this)

        this.id = Util.getRandomKey()

        this.animation = new Animated.Value(0);
    }

    componentWillUnmount() {
        Emitter.deleteByIdEvent(this.id)
    }

    renderNavbarContent() {
        return (
            <View
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        position: 'absolute',
                        top: this.props.style ? 0 : (Platform.OS === 'ios' ? isIphoneXorAbove() ? 38 : 16 : 0),
                        right: 0,
                        bottom: 0,
                        left: 0
                    }]}>
                {this.renderBackButton()}
                {this.renderTitle()}
                {this.renderRightIcon()}
            </View>
        );
    }

    renderBackButton() {
        return (
            <TouchableOpacity
                style={{ flex: 1, height: 40, display: 'flex', paddingLeft: 16, justifyContent: 'center' }}
                onPress={this.backBtnFunc.bind(this)}
            >
                <Icon color={CommonStyle.arrowBackColor} size={30} name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'} />
            </TouchableOpacity>
        );
    }

    backBtnFunc() {
        this.props.backToSearch();
    }
    runAnimation = () => {
        Animated.loop(
            Animated.timing(this.animation, { toValue: 1, duration: 2000 })
        ).start();
    }
    onRefresh() {
        const { navigatorEventID: eventID } = this.props.navigator;
        // this.runAnimation()
        this.emitter.emit(eventID, {
            id: 'search_refresh'
        });
    }

    renderTitle() {
        return (
            <View style={{ flex: 4 }}>
                <Text
                    style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: CommonStyle.fontSizeM,
                        fontFamily: CommonStyle.fontMedium,
                        color: CommonStyle.fontColor
                    }}>
                    {this.props.title}
                </Text>
            </View>
        );
    }
    componentDidMount() {
        // Emitter.addListener(this.dic.channelResReload, this.id, () => {
        // 	this.setState({
        // 		isRefresh: false
        // 	})
        // });
    }
    renderRightIcon() {
        const rotation = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const isStreaming = Controller.isPriceStreaming()
        return isStreaming
            ? <View style={{ flex: 1 }} />
            : <Animated.View
                style={[
                    { width: 48, marginRight: 16, alignItems: 'flex-end' }
                ]}
            >
                {
                    this.props.isLoading
                        ? <CustomButton
                            style={{ paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}
                            iconStyle={{ height: 32, width: 32, right: -14 }} />
                        : <TouchableOpacity
                            style={{}}
                            testID="UniversalSearchC2R"
                            onPress={this.onRefresh}
                        >
                            <IconRefreshAnim
                                // style={[
                                //     { transform: [{ rotate: rotation }] }
                                // ]}
                                color={CommonStyle.btnColor}
                                size={30}
                                name={'ios-refresh'} />
                        </TouchableOpacity>
                }
            </Animated.View>
    }

    render() {
        return (
            <View style={[
                CommonStyle.navBarCustom,
                {
                    paddingTop: Platform.OS === 'ios'
                        ? isIphoneXorAbove()
                            ? 38
                            : 16
                        : 0,
                    height: isIphoneXorAbove()
                        ? 48 + 38
                        : 48 + 16,
                    marginTop: 0,
                    ...this.props.style
                }]}>
                {this.renderNavbarContent()}
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        isLoading: state.searchDetail.isLoading
    };
}

export default connect(
    mapStateToProps
)(UnisNavBar);

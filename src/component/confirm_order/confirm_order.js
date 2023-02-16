import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Platform,
    BackHandler,
    Dimensions
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Styles from './style/confirm_style';
import * as Util from '../../util';
import NotifyOrder from '../notify_order';
import CancelButton from '../../component/cancel_button/cancel_button';
import ConfirmButton from '../../component/confirm_button/confirm_button';
import NetworkWarning from '../../component/network_warning/network_warning';
import XComponent from '../../component/xComponent/xComponent';
import I18n from '../../../src/modules/language/';
import * as RoleUser from '../../roleUser';
import Enum from '../../enum';
import Header from '~/component/headerNavBar';
import { func, dataStorage } from '~/storage';
import Icon from './icon';
import TouchableOpacityOpt from '../touchableOpacityOpt';
import pinBackground from '~/img/background_mobile/group7.png';
import ErrorHeader from '~/component/error_header';
import {
    Text as TextLoad,
    View as ViewLoad
} from '~/component/loading_component';
import TimeUpdated from '../../component/time_updated/time_updated';
import CustomIcon from '~/component/Icon';
import * as Animatable from 'react-native-animatable';
import { getNumberOfLines } from '~/business';
import FallHeader from '~/component/fall_header';
import ENUM from '~/enum'
import CONFIG from '~/config'

const { ENVIRONMENT } = ENUM

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');

export default class ConfirmOrder extends XComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: ''
        };
    }
    init() {
        this.showError = this.showError.bind(this);
        this.xSubConnectionChange();
    }

    componentDidMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButton
        );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackButton
        );
    }

    handleBackButton = () => {
        console.log('ABC');
        if (CONFIG.environment === ENVIRONMENT.IRESS_DEV2) {
            return false;
        } else {
            return true
        }
    };
    onConnectionChange() {
        this.setState();
    }

    renderLeftComp = () => {
        const content = (
            <Icon name="ios-arrow-back" onPress={this.handleCancel} />
        );
        return <View style={{ width: 36 }}>{content}</View>;
    };

    showError({ error, type, cb }) {
        this.isMount = true;
        this.setState(
            {
                error: error
            },
            () => {
                setTimeout(() => {
                    this.headerRef &&
                        this.headerRef.showError &&
                        this.headerRef.showError({
                            error,
                            type,
                            isShowIcon: type === 'error'
                        });
                    if (type === 'success') {
                        // Show error xong thì mới fadeout
                        setTimeout(() => {
                            this.refHeaderAnim &&
                                this.refHeaderAnim
                                    .fadeOut(500)
                                    .then(() => cb && cb());
                        }, 500);
                    }
                }, 100);
            }
        );
    }

    renderCompannyName = () => {
        return (
            <View
                style={{
                    position: 'relative',
                    width: '100%',
                    justifyContent: 'flex-start',
                    flexDirection: 'row',
                    borderBottomRightRadius:
                        CommonStyle.borderBottomRightRadius,
                    backgroundColor: CommonStyle.ColorTabNews,
                    paddingVertical: 15,
                    paddingHorizontal: 16
                }}
            >
                <Text
                    style={{
                        ...CommonStyle.textMain,
                        alignItems: 'flex-start'
                    }}
                >
                    {this.props.companyName}
                </Text>
            </View>
        );
    };
    renderElementContent = (str, isBuy) => {
        str = this.props.content;
        isBuy = this.props.is_buy;
        const lstNoneColor = (str + '').split(/#{([^}]*)}/);
        const lstElement = [];
        for (let i = 0; i < lstNoneColor.length; i++) {
            i % 2 === 0
                ? lstElement.push(
                    <Text style={{ color: CommonStyle.fontColor }} key={i}>
                        {lstNoneColor[i]}
                    </Text>
                )
                : lstElement.push(
                    <Text
                        key={i}
                        style={{ color: isBuy ? '#00b800' : 'red' }}
                    >
                        {lstNoneColor[i]}
                    </Text>
                );
        }
        return (
            <View style={{ backgroundColor: CommonStyle.bgCircleDrawer }}>
                <View
                    style={{
                        paddingBottom: 4,
                        borderBottomRightRadius:
                            CommonStyle.borderBottomRightRadius,
                        backgroundColor: CommonStyle.bgCircleDrawer,
                        width: '100%'
                    }}
                >
                    <ImageBackground
                        source={pinBackground}
                        resizeMode={'cover'}
                        backfaceVisibility={'visible'}
                        style={{
                            width: '100%',
                            borderBottomRightRadius:
                                CommonStyle.borderBottomRightRadius,
                            overflow: 'hidden'
                        }}
                        imageStyle={{
                            borderBottomRightRadius:
                                CommonStyle.borderBottomRightRadius
                        }}
                    >
                        {this.renderCompannyName()}
                        <View
                            style={{
                                borderBottomRightRadius:
                                    CommonStyle.borderBottomRightRadius,
                                padding: 16
                            }}
                        >
                            <Text
                                style={CommonStyle.textMainNormalNoColorOpacity}
                            >
                                {lstElement}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
            </View>
        );
    };

    handleCancel = () => {
        this.refHeaderAnim &&
            this.refHeaderAnim.fadeOut(500).then(() => {
                this.props.eventCancel();
            });
    };

    renderButton = () => {
        return (
            <View
                style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 24,
                    flexDirection: 'row',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: CommonStyle.bgCircleDrawer,
                    borderTopWidth: 1,
                    borderTopColor: CommonStyle.borderColorTopButtonConfrim
                }}
            >
                <CancelButton
                    disabled={this.props.isLoading || this.props.disabledCancel}
                    onPress={this.handleCancel}
                />
                <View style={{ width: '4%' }}></View>
                <ConfirmButton
                    disabled={
                        this.props.isLoading || this.props.disabledConfirm
                    }
                    onPress={() => {
                        this.props.eventConfirm && this.props.eventConfirm();
                    }}
                    activity={this.props.activityConfirm}
                />
            </View>
        );
    };
    renderElementBody = () => {
        listField = this.props.listField;
        console.log('listField', listField);
        if (!Util.arrayHasItem(listField)) return [];
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.bgCircleDrawer,
                    borderRadius: 8,
                    marginTop: 16
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16
                    }}
                >
                    {listField.map((item, index) => {
                        return (
                            <View
                                key={`view_${index}`}
                                style={{
                                    marginTop: 14,
                                    marginBottom: 14,
                                    flexDirection: 'column',
                                    width: '48%'
                                }}
                            >
                                <Text
                                    key={`text_1_${index}`}
                                    style={{
                                        fontFamily:
                                            CommonStyle.fontPoppinsRegular,
                                        fontSize: CommonStyle.fontSizeS - 3,
                                        opacity: 0.4,
                                        color: CommonStyle.fontColor
                                    }}
                                >
                                    {item.key}
                                </Text>
                                <TextLoad
                                    key={`text_2_${index}`}
                                    isLoading={this.props.isLoading}
                                    ellipsizeMode={Platform.select({
                                        android: 'tail',
                                        ios: 'middle'
                                    })}
                                    numberOfLines={2}
                                    style={{
                                        lineHeight: 18,
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        fontSize: CommonStyle.fontSizeS,
                                        color: CommonStyle.fontColor
                                    }}
                                >
                                    {`${item.value}`}
                                </TextLoad>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    renderTimeComp = () => {
        return (
            <View style={{ paddingLeft: 16, overflow: 'visible' }}>
                <Text style={CommonStyle.timeUpdatedTitleHeaderNavBar}>{ }</Text>
            </View>
        );
    };

    render() {
        console.log('listField', this.props.listField);
        console.log('title', this.props.title);
        console.log('DCM loi la gi', this.state.error);
        return (
            <FallHeader
                ref={(ref) => ref && (this.headerRef = ref)}
                animation="slideInUp"
                setRef={(ref) => (this.refHeaderAnim = ref)}
                style={{ backgroundColor: CommonStyle.backgroundColor }}
                header={
                    <Header
                        titleStyle={{ width: 0.8 * WIDTH_DEVICE }}
                        title={this.props.title}
                        renderLeftComp={this.renderLeftComp}
                        containerStyle={{
                            borderBottomRightRadius:
                                CommonStyle.borderBottomRightRadius,
                            overflow: 'hidden'
                        }}
                        firstChildStyles={{ minHeight: 18 }}
                        style={{ marginLeft: 0, paddingTop: 16 }}
                    >
                        <View />
                    </Header>
                }
            >
                <ScrollView
                    scrollEnabled={true}
                    scrollEventThrottle={16}
                    style={{ backgroundColor: CommonStyle.bgCircleDrawer }}
                    showsVerticalScrollIndicator={false}
                >
                    {this.renderElementContent()}
                    {this.renderElementBody()}
                    <View style={{ height: 120 }} />
                </ScrollView>
                {this.renderButton()}
            </FallHeader>
        );
    }
}

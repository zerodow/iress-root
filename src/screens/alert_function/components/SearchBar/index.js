import React, { Component, PureComponent } from 'react';
// Component
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScrollBarUndeline from '~/component/scrollbar_underline/scrollbar_underline';
import ScrollBarUndelineCustom from '~/component/scrollbar_underline';
import Header from '~/component/headerNavBar';
import ContentHeader from '../Header/Content';
import Icon from '~/component/headerNavBar/icon';
import CustomIcon from '~/component/Icon';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import NetworkWarning from '~/component/network_warning/network_warning';
import DebonceButton from '~/component/debounce_button';
// ENUM
import { dataStorage } from '~/storage';
import ENUM from '~/enum';
// Store
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import I18n from '~/modules/language/';
import * as FunctionUtil from '~/lib/base/functionUtil';
const NewTouchableOpacity = DebonceButton(TouchableOpacity);

const { width, height: heightDevice } = Dimensions.get('screen');
const HeaderDefault = (props) => {
    return (
        <Header
            {...props}
            renderLeftComp={props.renderLeftComp}
            rootStyles={{ flex: 1, justifyContent: 'center' }}
            title={I18n.t('newAlert')}
        >
            <View />
            <View style={{ height: 10 }} />
        </Header>
    );
};
const BG = {
    ERROR: CommonStyle.color.sell,
    WARNING: CommonStyle.color.warning
};
const TYPE = {
    ERROR: 'ERROR',
    WARNING: 'WARNING'
};
export class ScrollBarUndelineCustomV2 extends ScrollBarUndelineCustom {
    setAnimationDirection = (from, to) => {
        if (from < to) {
            dataStorage.animationDirection = 'fadeInRight';
        } else if (from > to) {
            dataStorage.animationDirection = 'fadeInLeft';
        } else {
            dataStorage.animationDirection = 'fadeIn';
        }
    };
    onTabPress(index, isReset) {
        const { activeTab } = this.state;
        this.setAnimationDirection(activeTab, index);
        const toValue = this.getTranslateAnimValue(index);
        if (index === this.state.activeTab || this.isPressing) return;
        this.isPressing = true;
        Animated.timing(this.translateAnim, {
            duration: isReset ? 0 : 350,
            toValue,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            this.isPressing = false;
            this.handlerAutoScroll(this.pageX, index);
        });
        const { action, id } = this.tabs[index];
        action && action(id);
        this.setState({ activeTab: index });
    }
}
const heightSearchBarDefault = Platform.OS === 'android' ? 120 : 160;
export default class SearchBar extends PureComponent {
    constructor(props) {
        super(props);
        // this.translateYAni = new Animated.Value(-800)
        this.translateYAni = new Animated.Value(-800);
        this.heightAniHeader = new Animated.Value(heightSearchBarDefault);
        this.statusMessage = new Animated.Value(0);
        this.opacityAnim = new Animated.Value(0);
    }
    state = {
        isShowHeaderDetail: false,
        type: ENUM.TYPE_MESSAGE.ERROR
    };
    componentDidMount() {
        // this.showClass()
    }
    componentWillUnmount() {
        this.timeoutShowClass && clearTimeout(this.timeoutShowClass);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected && !this.props.isConnected) {
            // this.hideMessage()
        } else if (!nextProps.isConnected && this.props.isConnected) {
        }
    }

    showClass = this.showClass.bind(this);
    showClass() {
        this.timeoutShowClass && clearTimeout(this.timeoutShowClass);
        this.timeoutShowClass = setTimeout(() => {
            this.forceUpdate();
            this.opacityAnim.setValue(1);
        }, 500);
    }

    handleCancel = () => {
        this.timeOutCancel && clearTimeout(this.timeOutCancel);
        this.timeOutCancel = setTimeout(() => {
            this.props.onCancel && this.props.onCancel();
        }, 200);
    };
    handleReset = () => {
        this.props.onReset && this.props.onReset();
    };
    handleOnChangeText = (text) => {
        this.props.onChangeText && this.props.onChangeText(text);
    };
    updateSearchBar = (isShowHeaderDetail) => {
        Animated.timing(this.translateYAni, {
            toValue: isShowHeaderDetail ? 0 : -800,
            duration: 500
        }).start();
    };
    renderClass() {
        if (!this.props.listItem) return null;
        return (
            <Animated.View
                style={{
                    opacity: 1,
                    // backgroundColor: CommonStyle.backgroundColor,
                    height: 47
                }}
            >
                <ScrollBarUndelineCustomV2
                    styleLineBottmFake={{
                        backgroundColor: CommonStyle.backgroundColor1
                    }}
                    ref={(ref) => (this.refScrollTabbar = ref)}
                    tabs={this.props.listItem}
                />
            </Animated.View>
        );
    }
    renderLeftComp = () => {
        return (
            <View
                style={{
                    marginLeft: 16,
                    width: 32,
                    alignItems: 'flex-start'
                }}
            >
                <Icon name={'ios-arrow-back'} onPress={this.handleCancel} />
            </View>
        );
    };
    renderHeaderDefault = () => {
        return <View></View>;
    };
    renderTitle = () => {
        return <Text style={styles.title}>{I18n.t('newAlert')}</Text>;
    };
    renderSearchBar = () => {
        const {
            onChangeText,
            value,
            placeholderTextColor,
            placeholder,
            setRefInput,
            textSearch,
            onReset,
            isShowCancel,
            onCancel,
            searchWrapperStyles,
            buttonCancelStyles
        } = this.props;
        return (
            <View
                renderToHardwareTextureAndroid={true}
                ref={(ref) => (this.refSearch = ref)}
                style={{ backgroundColor: CommonStyle.ColorTabNews }}
            >
                <View>
                    <View style={styles.wrapper}>
                        <View
                            style={[styles.searchWrapper, searchWrapperStyles]}
                        >
                            <CustomIcon
                                name="equix_search"
                                style={styles.iconLeft}
                            />
                            <TextInput
                                style={styles.textInput}
                                ref={setRefInput}
                                placeholder={
                                    placeholder || I18n.t('findSymbol')
                                }
                                placeholderTextColor={
                                    CommonStyle.searchPlaceHolderColor
                                }
                                onChangeText={this.handleOnChangeText}
                                value={textSearch || ''}
                                underlineColorAndroid="transparent"
                                autoFocus={false}
                                // selectionColor={CommonStyle.fontColor}
                            />
                            <TouchableOpacityOpt
                                timeDelay={ENUM.TIME_DELAY}
                                activeOpacity={1}
                                onPress={this.handleReset}
                                style={{
                                    flex: 1,
                                    alignSelf: 'center',
                                    alignItems: 'flex-end',
                                    paddingRight: 8
                                }}
                            >
                                <Ionicons
                                    testID="iconCancelSearchCode"
                                    name="ios-close-circle"
                                    style={CommonStyle.iconCloseLight}
                                />
                            </TouchableOpacityOpt>
                        </View>
                        <TouchableOpacityOpt
                            timeDelay={ENUM.TIME_DELAY}
                            onPress={this.handleCancel}
                            style={[styles.buttonCancel, buttonCancelStyles]}
                        >
                            <Text style={styles.textCancel}>
                                {I18n.t('done')}
                            </Text>
                        </TouchableOpacityOpt>
                    </View>
                    <View style={{ paddingLeft: 16 }}>
                        <View
                            style={{
                                height: 2,
                                position: 'absolute',
                                bottom: 0,
                                backgroundColor: CommonStyle.backgroundColor1,
                                left: 0,
                                right: 0
                            }}
                        />
                        {this.renderClass()}
                    </View>
                    {this.props.isConnected ? (
                        <View />
                    ) : (
                        <NetworkWarning styles={{ zIndex: 2 }} />
                    )}
                </View>
            </View>
        );
    };
    getColorTextMessage = () => {
        switch (this.state.type) {
            case 'ERROR':
                return CommonStyle.fontColor;
                break;
            case 'WARNING':
                return CommonStyle.color.sell;
                break;

            default:
                return CommonStyle.fontColor;
                break;
        }
    };
    render() {
        return <View>{this.renderSearchBar()}</View>;
    }
}
const styles = {};

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        wrapper: {
            flexDirection: 'row',
            paddingTop:
                Platform.OS === 'ios'
                    ? FunctionUtil.isIphoneXorAbove()
                        ? 38
                        : 16
                    : 0,
            marginTop: 16,
            height:
                Platform.OS === 'ios'
                    ? FunctionUtil.isIphoneXorAbove()
                        ? 48 + 38
                        : 64
                    : 48,
            marginLeft: 32,
            marginRight: 16,
            marginBottom: 8
        },
        title: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXXL,
            color: CommonStyle.navigatorSpecial.navBarSubtitleColor
            // width: width * 0.7
        },
        searchWrapper: {
            flexDirection: 'row',
            backgroundColor: CommonStyle.backgroundNewSearchBar,
            borderRadius: 8,
            alignItems: 'center',
            height: 42,
            width: width * 0.65
        },
        textInput: {
            width: '70%',
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeXS
        },
        buttonCancel: {
            justifyContent: 'center',
            flex: 1,
            marginLeft: 16
        },
        textCancel: {
            textAlign: 'center',
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeS
        },
        iconLeft: {
            color: CommonStyle.fontColor,
            marginLeft: 8,
            marginRight: 16,
            fontSize: CommonStyle.iconSizeS
        },
        iconRight: {}
    });

    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

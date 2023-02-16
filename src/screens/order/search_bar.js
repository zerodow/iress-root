import React, { Component } from 'react'
import { View, Text, Platform, Dimensions, PixelRatio, TouchableOpacity, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import * as Util from '../../util';
import { isIphoneXorAbove, changeAnimationSearch } from './../../lib/base/functionUtil';
import ScrollBarUndelineCustom from '~/component/scrollbar_underline'
import CustomIcon from '~/component/Icon'
import Enum from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Config from '../../config';
import * as Controller from '../../memory/controller'
import I18n from '../../modules/language/';
// Components
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import PickerCustom from './new_picker';
import ModalPicker from './../modal_picker/modal_picker';
import userType from '~/constants/user_type';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenId from '../../constants/screen_id'
import XComponent from '../../component/xComponent/xComponent'
import ScrollBarUndeline from '~/component/scrollbar_underline/scrollbar_underline'

import { func, dataStorage } from '../../storage';
import DebonceButton from '~/component/debounce_button'
// ENUM
const ICON_NAME = Enum.ICON_NAME;
const { width, height } = Dimensions.get('window');
const NewTouchableOpacity = DebonceButton(TouchableOpacity)
class ScrollBarUndelineCustomV2 extends ScrollBarUndelineCustom {
    forceUpdate() {
        super.forceUpdate()
    }

    setAnimationDirection = (from, to) => {
        if (from < to) {
            dataStorage.animationDirection = 'fadeInRight'
        } else if (from > to) {
            dataStorage.animationDirection = 'fadeInLeft'
        } else {
            dataStorage.animationDirection = 'fadeIn'
        }
    }
    onTabPress(index, isReset) {
        const { activeTab } = this.state;
        this.setAnimationDirection(activeTab, index)
        const toValue = this.getTranslateAnimValue(index)
        if (index === this.state.activeTab || this.isPressing) return
        this.isPressing = true
        Animated.timing(this.translateAnim, {
            duration: isReset ? 0 : 350,
            toValue,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            this.isPressing = false
            this.handlerAutoScroll(this.pageX, index)
        })
        const { action, id } = this.tabs[index];
        action && action(id);
        this.setState({ activeTab: index });
    }
}
export default class SearchBar extends XComponent {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.init();
        this.doFocus = this.doFocus.bind(this);
        this.doBlur = this.doBlur.bind(this);
        this.opacityAnim = new Animated.Value(0)
    }

    init() {
        this.dic = {
            timeout: null,
            dicHistoryByClass: {}
        }
        this.state = {
            textSearch: this.props.textSearch || '',
            listSymbolClass: this.props.listClassSymbol || []
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.props.onRef && this.props.onRef(this)
        // this.showClass()
        this.props.autoFocus && setTimeout(() => {
            this.dic.refTextSearch && this.dic.refTextSearch.focus()
        }, 500)
    }
    showClass = this.showClass.bind(this)
    showClass() {
        this.timeoutShowClass && clearTimeout(this.timeoutShowClass)
        this.opacityAnim.setValue(1)
        this.timeoutShowClass = setTimeout(() => {
            this.refScrollTabbar && this.refScrollTabbar.forceUpdate()
        }, 800)
    }
    componentWillMount() {
        // this.props.onRef && this.props.onRef(null)
        this.timeoutShowClass && clearTimeout(this.timeoutShowClass)
        super.componentWillUnmount()
    }

    doFocus() {
        this.dic.refTextSearch && this.dic.refTextSearch.focus()
    }

    doBlur() {
        this.dic.refTextSearch && this.dic.refTextSearch.blur()
    }

    getWidthCancel() {
        const isStreaming = Controller.isPriceStreaming();
        const fontScale = PixelRatio.getFontScale();

        if (isStreaming) return '25%';
        if (this.dic.isHistory) {
            return fontScale > 1 ? '30%' : '25%';
        }

        return fontScale > 1 ? '36%' : '31%';
    }

    getWidthTextCancel() {
        const isStreaming = Controller.isPriceStreaming();

        if (isStreaming) return '100%';
        return '75%';
    }

    renderRightOption() {
        const widthCancel = this.getWidthCancel();
        const widthTextCancel = this.getWidthTextCancel();
        return (
            <View
                style={[
                    CommonStyle.buttonCancel,
                    { width: widthCancel, paddingHorizontal: 16 }
                ]}
            >
                <TouchableOpacity
                    style={{ width: widthTextCancel, paddingVertical: 12 }}
                    onPress={this.onCancel}
                >
                    <Text
                        style={CommonStyle.rightTextBold}
                    >
                        {I18n.t('cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    onCancel = () => {
        this.props.onCancel && this.props.onCancel()
    }

    getWidthSearch() {
        const isStreaming = Controller.isPriceStreaming();
        const fontScale = PixelRatio.getFontScale();

        if (isStreaming) return '76%';
        if (isStreaming === userType.Streaming) {
            return fontScale > 1 ? '70%' : '76%';
        }

        return fontScale > 1 ? '65%' : '70%';
    }

    onChangeText(text) {
        this.setState({ textSearch: text })
        this.onSearch(text);
    }

    onSearch(text) {
        this.props.onSearch && this.props.onSearch(text)
    }

    renderDrawerIcon() {
        return <View
            testID="cancelAlertSearch"
            style={[{ marginHorizontal: 16 }]}
        >
            <TouchableOpacity
                style={{}}
                testID="AlertSearchDrawer"
                onPress={this.onClickDrawer}
            >
                <Ionicons color={CommonStyle.btnColor} size={30} name={'md-menu'} />
            </TouchableOpacity>
        </View>
    }

    onClickDrawer = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true
        });
    }
    updateListClassSymbol = (listSymbolClass) => {
        this.setState({
            listSymbolClass
        })
    }
    renderClass = () => {
        if (!this.state.listSymbolClass) return null
        return <Animated.View
            style={{
                opacity: 1,
                height: 47
            }}>
            <ScrollBarUndelineCustomV2
                ref={ref => this.refScrollTabbar = ref}
                tabs={this.state.listSymbolClass} />
        </Animated.View>
    }
    renderSearchBar = () => {
        return (
            <View style={{ overflow: 'visible' }}>
                <View style={styles.wrapper}>
                    <View style={styles.searchWrapper}>
                        <CustomIcon name='equix_search' style={styles.iconLeft} />
                        <TextInput
                            style={styles.textInput}
                            ref={(ref) => {
                                if (ref) {
                                    this.dic.refTextSearch = ref
                                }
                            }}
                            placeholder={I18n.t('findSymbol')}
                            placeholderTextColor={CommonStyle.searchPlaceHolderColor}
                            onChangeText={this.onChangeText}
                            value={this.state.textSearch}
                            underlineColorAndroid='transparent'
                            autoFocus={false}
                            // selectionColor={CommonStyle.fontColor}
                        />
                        <TouchableOpacityOpt
                            timeDelay={Enum.TIME_DELAY}
                            activeOpacity={1}
                            onPress={() => this.onChangeText('')}
                            style={{ flex: 1, alignSelf: 'center', alignItems: 'flex-end', paddingRight: 8 }}
                        >
                            <Ionicons
                                testID="iconCancelSearchCode"
                                name="ios-close-circle"
                                style={CommonStyle.iconCloseLight}
                            />
                        </TouchableOpacityOpt>
                    </View>
                    <TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} onPress={this.onCancel} style={styles.buttonCancel}>
                        <Text style={styles.textCancel}>{I18n.t('cancel')}</Text>
                    </TouchableOpacityOpt>
                </View>
                <View style={{ paddingLeft: 16 }}>
                    <View style={{ height: 2, position: 'absolute', bottom: 0, backgroundColor: CommonStyle.backgroundColor1, left: 0, right: 0 }} />
                    {this.renderClass()}
                </View>
            </View>
        )
    }
    render() {
        return (
            this.renderSearchBar()
        );
    }
}
const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        wrapper: {
            flexDirection: 'row',
            paddingTop: Platform.OS === 'ios'
                ? isIphoneXorAbove()
                    ? 38
                    : 16
                : 0,
            marginTop: 16,
            height: Platform.OS === 'ios'
                ? isIphoneXorAbove()
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
        iconRight: {

        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

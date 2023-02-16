import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useContext, useMemo } from 'react';
import { Text, View, TouchableOpacity, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, RadialGradient, Path, G, Image, Use, Circle, Text as TextSVG } from 'react-native-svg'
import * as Controller from '~/memory/controller'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import CustomIcon from '~/component/Icon'
import Entypo from 'react-native-vector-icons/Entypo';
import Header from '~/component/headerNavBar'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import DatePicker from './components/DatePicker'
import SearchBarWithoutModal from './components/SearchWithoutModal'
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { useShadow } from '~/component/shadow/SvgShadow'
// Controller
import * as HeaderController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_header_controller.js'
class TouchableOpacityOptCustom extends TouchableOpacityOpt {
    render() {
        const { activeOpacity } = this.state
        return (
            <TouchableOpacity
                ref={this.props.setRef}
                hitSlop={{
                    top: 8,
                    left: 8,
                    bottom: 8,
                    right: 8
                }}
                {...this.props}
                activeOpacity={activeOpacity}
                onPress={this.delayOnPress}>
                {this.props.children}
            </TouchableOpacity>
        )
    }
}

const TouchableWrapper = ({ onPress, name,
    renderIcon }) => {
    const refTouch = useRef(null)
    const refTmp = useRef()
    let timeout = useMemo(() => {
        return null
    }, [])
    useEffect(() => {
        if (!refTouch) return
        timeout = setTimeout(() => {
            refTouch.current && refTouch.current.measure && refTouch.current.measure((x, y, w, h, pX, pY) => {
                refTmp.current = { x, y, w, h, pX, pY }
            })
        }, 500);
        return function clear() {
            timeout && clearTimeout(timeout)
        };
    }, [name])
    return (
        <TouchableOpacityOptCustom
            setRef={refTouch}
            onPress={() => {
                Keyboard.dismiss()
                setTimeout(() => {
                    onPress(refTmp.current)
                }, 0);
            }}
            style={{
                paddingHorizontal: 16
            }}
        >
            {renderIcon ? renderIcon() : <CustomIcon name={name} size={20} color={CommonStyle.fontColor} />}
        </TouchableOpacityOptCustom>
    )
}
const IconSource = () => <CommonStyle.icons.newssource />
const HeaderLeft = React.memo(({ setDuration }) => {
    const { search } = useContext(NewsWrapperContext)
    return (
        <View style={{ flexDirection: 'row', paddingRight: 8 }}>
            <TouchableWrapper
                onPress={
                    (size) => {
                        HeaderController.showVendor({ size, search, renderIcon: () => <IconSource /> })
                    }
                }
                renderIcon={() => <IconSource />}
            />
            <TouchableWrapper
                onPress={
                    (size) => {
                        HeaderController.showCategory({ size, search, renderIcon: () => <CommonStyle.icons.filter name={'equix_filter'} size={20} color={CommonStyle.fontColor} /> })
                    }
                }
                renderIcon= {() => <CommonStyle.icons.filter name={'equix_filter'} size={20} color={CommonStyle.fontColor} /> }

            />
            <TouchableWrapper
                onPress={
                    (size) => {
                        HeaderController.showDuration({ size, setDuration, search, renderIcon: () => <CommonStyle.icons.time name={'equix_time'} size={20} color={CommonStyle.fontColor} /> })
                    }
                }
                renderIcon ={() => <CommonStyle.icons.time name={'equix_time'} size={20} color={CommonStyle.fontColor} /> }
            />
        </View>
    )
}, () => true)
export const SubHeader = () => {
    const [Shadow, onLayout] = useShadow()
    return <View>
        <Shadow />
        <View
            onLayout={onLayout}
            style={{ flexDirection: 'row' }}>
            <Animated.View style={{
                width: '100%'
            }}
            >
                {
                    duration === 'CUSTOM'
                        ? <DatePicker />
                        : null
                }
                <View style={{ height: 12 }} />
                <NewsWrapperContext.Consumer>
                    {({ search }) => <SearchBarWithoutModal search={search} style={{ width: '100%', paddingHorizontal: 8 }} />}
                </NewsWrapperContext.Consumer>
                <View style={{ height: 8 }} />
            </Animated.View>
        </View>
    </View>
}
class WrapperHeader extends PureComponent {
    render() {
        const { setDuration, style } = this.props
        if (!Controller.getLoginStatus()) {
            return (
                <Header
                    firstChildStyles={
                        { overflow: 'visible' }
                    }
                    mainStyle={{
                        width: 'auto',
                        flex: 1
                    }}
                    rightStyles={{
                        flex: 0
                    }}
                    style={[{ marginLeft: 0, paddingTop: 16 }, style]}
                    leftIcon='ios-menu'
                    title={I18n.t('News')}
                    navigator={this.props.navigator}
                />
            )
        }
        return (
            <Header
                firstChildStyles={
                    {
                        overflow: 'visible',
                        paddingRight: 0
                    }
                }
                mainStyle={{
                    width: 'auto',
                    flex: 1
                }}
                rightStyles={{
                    flex: 0
                }}
                containerStyle={{
                    zIndex: 9999
                }}
                style={[{ marginLeft: 0, paddingTop: 16 }, style]}
                leftIcon='ios-menu'
                title={I18n.t('News')}
                navigator={this.props.navigator}
                renderRightComp={() => <HeaderLeft setDuration={setDuration} />}
            >
                {/* <TouchableWithoutFeedback style={{
                    paddingRight: 35
                }} onPress={Keyboard.dismiss}>
                    <SubHeader />
                </TouchableWithoutFeedback> */}
            </Header>
        )
    }
}
export default WrapperHeader;

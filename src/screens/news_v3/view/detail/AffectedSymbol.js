import React, { Component } from 'react'
import { View, ScrollView, Text, ImageBackground, Dimensions, Platform } from 'react-native'
import pinBackground from '~/img/background_mobile/playBGNews1.png'
import CommonStyle from '~/theme/theme_controller'
import TagAffectedSymbol from './TagAffectedSymbol'
import Animated, { Easing } from 'react-native-reanimated'
import InfiniteScroll from '~s/watchlist/Component/InfinitScroll';
import * as NewDetailController from '~s/news_v3/controller/NewDetailController'
import ENUM from '~/enum'
import { useShadow } from '~/component/shadow/SvgShadow'

const { TIMEOUT_HIDE_ERROR } = ENUM
const DURATION = 1000

const {
    Value,
    timing
} = Animated
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')
const NUMBER_LOOP = 4;

const RelativeSymbol = ({ setRefInfi, affectedSymbol, renderRow }) => {
    const [Shadow, onLayout] = useShadow()
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <View>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, justifyContent: 'center' }}>
                <InfiniteScroll
                    ref={setRefInfi}
                    numberLoop={NUMBER_LOOP}
                    data={affectedSymbol}
                    renderItem={renderRow}
                    wrapperStyle={{
                        overflow: 'hidden',
                        width: WIDTH_DEVICE - 16 - 16
                    }}
                />
            </View>
        </View>
    </View>
}

const Title = ({ title = '' }) => {
    const [Shadow, onLayout] = useShadow()
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <View>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16
                }}>
                <Text style={[{
                    fontSize: CommonStyle.font13,
                    fontFamily: CommonStyle.fontPoppinsBold,
                    color: CommonStyle.fontColor
                }, Platform.OS === 'android'
                    ? { lineHeight: CommonStyle.font13 + 5 }
                    : {}]}>
                    {title}
                </Text>
            </View>
        </View>
    </View>
}

export default class AffectedSymbol extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: 'News story unavailable'
        }
        this.relatedExchanges = []
        this.layout = {}
        this.heightError = new Value(0)
        this.timeoutHideError = null
    }

    componentDidMount() {
        this.infi && this.infi.snapToTop();
        this.infi && this.infi.autoScroll(2000);
        const { data = {} } = this.props
        const { error } = data
        const showUnavailableNew = NewDetailController.checkUnavailableNew(this.props.data)
        if (showUnavailableNew) {
            this.showThenHideError(error)
        }
    }

    componentWillUnmount() {
        this.clearTimeoutError()
    }

    clearTimeoutError = this.clearTimeoutError.bind(this)
    clearTimeoutError() {
        this.timeoutHideError && clearTimeout(this.timeoutHideError)
    }

    setRefInfi = this.setRefInfi.bind(this)
    setRefInfi(ref) {
        if (ref) {
            this.infi = ref
        }
    }

    renderTitle = this.renderTitle.bind(this)
    renderTitle() {
        const { title } = this.props.data
        return <Title title={title} />
    }

    renderRow = this.renderRow.bind(this)
    renderRow({ item: symbolWithEchange, index }) {
        const { onPressAffectedSymbol } = this.props
        symbolWithEchange = symbolWithEchange.split('.')
        const symbol = symbolWithEchange[0]
        const exchange = symbolWithEchange[1]
        return <TagAffectedSymbol
            exchange={exchange}
            onPressAffectedSymbol={onPressAffectedSymbol}
            symbol={symbol} />
    }

    renderAffectedSymbol = this.renderAffectedSymbol.bind(this)
    renderAffectedSymbol() {
        const { data = {} } = this.props
        const { related_symbols: affectedSymbol = [] } = data
        if (affectedSymbol.length === 0) {
            return <View />
        }

        return <RelativeSymbol
            setRefInfi={this.setRefInfi}
            affectedSymbol={affectedSymbol}
            renderRow={this.renderRow}
        />
    }

    renderBorderRadiusView = this.renderBorderRadiusView.bind(this)
    renderBorderRadiusView() {
        return <View style={{
            position: 'absolute',
            minHeight: 35,
            borderBottomRightRadius: 35,
            backgroundColor: CommonStyle.color.dark
        }} />
    }

    renderError = this.renderError.bind(this)
    renderError() {
        return <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                backgroundColor: CommonStyle.color.error,
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: this.heightError,
                borderBottomRightRadius: 0,
                zIndex: -100
            }}>
            <Text style={{
                marginBottom: 4,
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeXS1,
                color: CommonStyle.fontWhite
            }}>{this.state.error}</Text>
        </Animated.View >
    }

    onLayoutAffectedSymbol = this.onLayoutAffectedSymbol.bind(this)
    onLayoutAffectedSymbol(event) {
        this.props.onLayoutAffectedSymbol && this.props.onLayoutAffectedSymbol(event)
        this.layout = event.nativeEvent.layout
    }

    showThenHideError = this.showThenHideError.bind(this)
    showThenHideError(error) {
        const { data } = this.props
        const symbolHasStar = NewDetailController.checkTitleHasStar(data)
        if (symbolHasStar) return false // Title news co ky tu "*" o dau khong hien thi error
        setTimeout(() => {
            this.showError(error)
            this.clearTimeoutError()
            this.timeoutHideError = setTimeout(this.hideError, TIMEOUT_HIDE_ERROR)
        }, 500)
    }

    showError = this.showError.bind(this)
    showError(error) {
        this.setState({
            error
        }, () => {
            setTimeout(() => {
                timing(this.heightError, {
                    toValue: this.layout.height + 25,
                    duration: DURATION,
                    easing: Easing.inOut(Easing.ease)
                }).start()
            }, 100)
        })
    }

    hideError = this.hideError.bind(this)
    hideError(duration = DURATION) {
        timing(this.heightError, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease)
        }).start()
    }

    render() {
        const { heightHeader } = this.props
        return <View
            onLayout={this.onLayoutAffectedSymbol}
            style={{
                width: WIDTH_DEVICE + 2, // TRICK UNKNOWN ERROR
                backgroundColor: CommonStyle.color.dark
            }}
        >
            <Animated.View style={{ height: heightHeader }} />
            {this.renderAffectedSymbol()}
            {this.renderTitle()}
            {this.renderError()}
        </View>
    }
}

import React, { Component } from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import Content from './Content'
import HeaderNav from './HeaderNav'
import DetailScreen from '~s/watchlist/Navigation/DetailScreen.2';
import AuthenPin from '~s/watchlist/authen_pin'
import Overlay from './Overlay'

import Animated, { Easing } from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller'
import { connect } from 'react-redux';

import AddToWLScreen from '~/screens/news_v3/view/detail/AddToWl.js'

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');

const { Value, timing } = Animated;

const affectedSymbol = {
    THC: {
        symbol: 'THC',
        exchange: 'ASX',
        displayName: 'THC.ASX',
        changePercent: 95
    },
    BHP: {
        symbol: 'BHP',
        exchange: 'ASX',
        displayName: 'BHP.ASX',
        changePercent: -12
    },
    MQG: {
        symbol: 'MQG',
        exchange: 'ASX',
        displayName: 'MQG.ASX',
        changePercent: 112
    },
    AAA: {
        symbol: 'AAA',
        exchange: 'ASX',
        displayName: 'AAA.ASX',
        changePercent: 86
    },
    NAB: {
        symbol: 'NAB',
        exchange: 'ASX',
        displayName: 'NAB.ASX',
        changePercent: -68
    },
    A2M: {
        symbol: 'A2M',
        exchange: 'ASX',
        displayName: 'A2M.ASX',
        changePercent: 120
    },
    SIY: {
        symbol: 'SIY',
        exchange: 'ASX',
        displayName: 'SIY.ASX',
        changePercent: 2
    },
    SCG: {
        symbol: 'SCG',
        exchange: 'ASX',
        displayName: 'SCG.ASX',
        changePercent: 12
    },
    RIO: {
        symbol: 'RIO',
        exchange: 'ASX',
        displayName: 'RIO.ASX',
        changePercent: -95
    },
    CBA: {
        symbol: 'CBA',
        exchange: 'ASX',
        displayName: 'CBA.ASX',
        changePercent: 95
    }
};

class Detail extends Component {
    constructor(props) {
        super(props);
        this._scrollValue = new Value(0);
        this.heightHeader = new Value(0);
        this.transY = new Value(HEIGHT_DEVICE + 200)
        this.opacity = new Value(1)
        this.refAddWl = React.createRef()
        this.state = {
            visible: false
        }
    }

    componentDidMount() {
        this.showDetail();
    }

    updateDisableShareNew = this.updateDisableShareNew.bind(this);
    updateDisableShareNew(isDisableShareNew) {
        this.refHeader &&
            this.refHeader.updateDisableShareNew(isDisableShareNew);
    }

    fadeOutDetail = this.fadeOutDetail.bind(this);
    fadeOutDetail() {
        timing(this.opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear
        }).start();
    }

    showDetail = this.showDetail.bind(this);
    showDetail() {
        timing(this.transY, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear
        }).start();
    }

    hideDetail = this.hideDetail.bind(this);
    hideDetail() {
        timing(this.transY, {
            toValue: HEIGHT_DEVICE + 200,
            duration: 200,
            easing: Easing.linear
        }).start();
    }

    onLayout = this.onLayout.bind(this);
    onLayout(event) {
        const { layout } = event.nativeEvent;
        const { height } = layout;
        this.refContent && this.refContent.updateLayoutHeaderNav(layout);
        this.heightHeader.setValue(height);
    }

    setRefContent = this.setRefContent.bind(this);
    setRefContent(ref) {
        if (ref) {
            this.refContent = ref;
        }
    }

    setRefHeader = this.setRefHeader.bind(this);
    setRefHeader(ref) {
        if (ref) {
            this.refHeader = ref;
        }
    }

    setRefPdf = this.setRefPdf.bind(this);
    setRefPdf(ref) {
        if (ref) {
            this.refPdf = ref;
        }
    }

    setAuthRef = this.setAuthRef.bind(this);
    setAuthRef(sef) {
        this._auth = sef;
    }

    setSecDetailRef = this.setSecDetailRef.bind(this);
    setSecDetailRef(sef) {
        this._detail = sef;
    }

    onAuth = this.onAuth.bind(this);
    onAuth(...p) {
        this._auth && this._auth.onAuth(...p);
    }

    onPressAffectedSymbol = this.onPressAffectedSymbol.bind(this);
    onPressAffectedSymbol(symbol, exchange) {
        this._detail && this._detail.changeSymbol(symbol, exchange);
    }

    sharePdf = this.sharePdf.bind(this);
    sharePdf() {
        this.setState({
            visible: true
        })
        this.refPdf && this.refPdf.saveSchedule()
    }
    onHideShare = () => {
        this.setState({
            visible: false
        })
    }
    hideError = this.hideError.bind(this)
    hideError(duration) {
        this.refContent &&
            this.refContent.refAffectedSymbol &&
            this.refContent.refAffectedSymbol.hideError &&
            this.refContent.refAffectedSymbol.hideError(duration);
    }

    backToListNew = this.backToListNew.bind(this);
    backToListNew() {
        // Hide Error
        const durationHideError = 100;
        this.hideError(durationHideError);
        setTimeout(() => {
            this.fadeOutDetail();
            setTimeout(() => {
                this.props.navigator.pop({
                    animated: false,
                    animationType: 'none'
                });
            }, 300);
        }, 100);
    }
    handleShowAddWl = this.handleShowAddWl.bind(this)
    handleShowAddWl({ symbol, exchange }) {
        this.refAddWl.current && this.refAddWl.current.showAddToWl && this.refAddWl.current.showAddToWl({ symbol, exchange })
    }
    renderSecDetail = this.renderSecDetail.bind(this);
    renderSecDetail() {
        const { navigator } = this.props;
        return (
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 99
                }}
            >
                <DetailScreen
                    showAddToWl={this.handleShowAddWl}
                    heightHeader={this.heightHeader}
                    ref={this.setSecDetailRef}
                    onAuth={this.onAuth}
                    navigator={navigator}
                    isDisableShowNewDetail
                />
                <AddToWLScreen ref={this.refAddWl} />
            </View>
        );
    }

    renderAuth = this.renderAuth.bind(this);
    renderAuth() {
        const { navigator } = this.props;
        return <AuthenPin ref={this.setAuthRef} navigator={navigator} />;
    }

    render() {
        const { navigator, isConnected, data, available, timeToAvailable } = this.props
        return <Animated.View style={{
            backgroundColor: CommonStyle.color.dark,
            flex: 1,
            opacity: this.opacity,
            transform: [{
                translateY: this.transY
            }]
        }}>
            <HeaderNav
                ref={this.setRefHeader}
                backToListNew={this.backToListNew}
                sharePdf={this.sharePdf}
                onLayout={this.onLayout}
                _scrollValue={this._scrollValue}
                navigator={navigator}
                isConnected={isConnected}
            />
            <Content
                onHideShare={this.onHideShare}
                available={available}
                timeToAvailable={timeToAvailable}
                data={data}
                updateDisableShareNew={this.updateDisableShareNew}
                heightHeader={this.heightHeader}
                ref={this.setRefContent}
                setRefPdf={this.setRefPdf}
                navigator={navigator}
                onPressAffectedSymbol={this.onPressAffectedSymbol}
            />
            {this.renderSecDetail()}
            {this.renderAuth()}
            <Overlay visible={this.state.visible} >
                <View style={{
                    flex: 1,
                    zIndex: 9999999,
                    backgroundColor: 'rgba(23, 27, 41,0.5)'
                }} />
            </Overlay>
        </Animated.View>
    }
}
const mapStateToProps = (state) => {
    return {
        isConnected: state.app.isConnected
    };
};

export default connect(mapStateToProps)(Detail);

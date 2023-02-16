import React, { Component } from 'react';
import { View, Text, FlatList, Keyboard, TouchableOpacity } from 'react-native';
import Row, {
    Row as RowBase
} from '~/component/result_search/rowSearchByMasterCode.1'
import ItemSeparator from './ItemSeparator'
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import TextLoading from '~/component/loading_component/text.1'
import * as Animatable from 'react-native-animatable';
import Styles from '../styles'
import CommonStyle, { register } from '~/theme/theme_controller'
import { dataStorage, func } from '~/storage'
import { checkParent } from '~/lib/base/functionUtil'
const DURATION = 600
const DURATION_DEFAULT = 500
class AnimatableCustom extends Animatable.View {
    stopAnimation() {
        this.setState({
            scheduledAnimation: false
        });
        this.state.animationValue.stopAnimation();
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    }
}
class TransitionViewCustom extends TransitionView {
    render() {
        const { animation, duration, index, delay, ...rest } = this.props;
        if (delay >= 0) {
            return (
                <AnimatableCustom
                    ref={this.setRef}
                    animation={animation || dataStorage.animationHoldings || 'fadeIn'}
                    duration={duration || DURATION_DEFAULT}
                    delay={delay}
                    useNativeDriver
                    {...rest}
                />
            )
        }
        return (
            <AnimatableCustom
                ref={this.setRef}
                animation={animation || dataStorage.animationHoldings || 'fadeIn'}
                duration={duration || DURATION_DEFAULT}
                delay={index !== null && index !== undefined && typeof index === 'number' && index < 12 ? (index === 0 ? 0 : ((index + 1) * DURATION) / 5) : 0}
                useNativeDriver
                {...rest}
            />
        );
    }
}
export class RowBaseCustom extends RowBase {
    renderLeftComp(symbol, securityName) {
        const isLoading = this.props.isLoading
        return (
            // <ViewLoad isLoading={isLoading} >
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor
                    }}
                    numberOfLines={1}
                >
                    {symbol}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontCompany
                    }}
                >
                    {securityName}
                </Text>
            </View>
            // </ViewLoad>
        );
    }
}
export class RowSearchByMasterCodeV2 extends Row {
    _renderRowContent = ({ item }) => {
        return <View style={{ marginLeft: 32 }}>{this._header(item)}</View>;
    };

    _header(data) {
        const section = func.getSymbolObj(data.symbol) || data;
        const { textSearch } = this.props;
        return (
            <TransitionView
                ref={this.props.setRefPerRowLoading}
                animation={dataStorage.animationDirection}
                index={this.props.index}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%'
                }}
            >
                {this.renderLeftIcon(section)}
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            if (checkParent(section)) return
                            this.props.onPressFn({ symbolInfo: section });
                        }}
                    >
                        <RowBaseCustom data={data} textSearch={textSearch} />
                    </TouchableOpacity>
                </View>
            </TransitionView>
        );
    }

    renderLeftIcon(section) {
        const isParent = checkParent(section);
        const { isExpand: isActive } = this.state;

        if (isParent) {
            return (
                <View
                    style={{
                        paddingRight: 16,
                        justifyContent: 'center'
                    }}
                >
                    {this.renderArrowButton(isActive)}
                </View>
            );
        }
        return null;
    }
}
export default class RowLoading extends Component {
    constructor(props) {
        super(props);
        this.refPReRowLoading = []
        this.state = {
        };
        this.typeAnimation = null
        this.preTypeAnimation = null
        this.isRunningAnimation = false
        this.listRef = []
        this.listTimeOut = {}
        this.listRefStatus = {

        }
        this.init = true
        this.show = this.props.isShow !== null && this.props.isShow !== undefined ? !!this.props.isShow : true
    }
    componentDidMount() {
        console.log('DCM list ref', this.refPReRowLoading)
    }
    runAnimation = ({ type, reverse = false }, cb) => {
        if (this.init) {
            this.stopAnimation()
        }
        this.init = false
        switch (type) {
            case 'fadeIn':
                if (this.show) {
                    cb && cb()
                    break
                }
                this.show = true
                this.fadeIn({ type, reverse }, cb)
                break;
            case 'fadeOut':
                let timeOuts = Object.values(this.listTimeOut)
                timeOuts.map(el => el && clearTimeout(el))
                this.listTimeOut = {}
                if (!this.show) {
                    cb && cb()
                    break
                }
                this.show = false
                this.fadeOut({ type, reverse }, cb)
                break;
            case 'fadeInLeft':
                // if (this.show) {
                //     cb()
                //     break
                // }
                this.show = true
                this.fadeInLeft({ type, reverse }, cb)
                break;
            case 'fadeInRight':
                // if (this.show) {
                //     cb()
                //     break
                // }
                this.show = true
                this.fadeInRight({ type, reverse }, cb)
                break;
            case 'fadeInDown':
                if (this.show) {
                    cb && cb()
                    break
                }
                this.show = true
                this.fadeInDown({ type, reverse }, cb)
                break;
            case 'fadeOutUp':
                if (!this.show) {
                    cb && cb()
                    break
                }
                this.show = false
                this.fadeOutUp({ type, reverse }, cb)
                break;
            default:
                break;
        }
    }
    setRefPerRowLoading = (ref, symbol) => {
        this.refPReRowLoading[symbol] = ref
    }
    setRef = (ref, index) => {
        this.listRef[index] = ref
    }
    fadeIn = ({ reverse = false, duration = 500 }, cb) => {
        this.typeAnimation = 'fadeIn'
        console.log('DCM start ', 'fadeIn', new Date().getTime())
        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                this.listRefStatus[index] = true
                el.fadeIn(duration).then(() => {
                    resolve()
                })
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish ', 'fadeIn', new Date().getTime())
            cb && cb()
        })
    }
    getDelay = ({
        index, reverse = false, length
    }) => {
        if (reverse) {
            return ((length - index + 1) * DURATION) / 5
        }
        // const timeDelay = ((index + 1) * DURATION) / 5
        const timeDelay = DURATION + (index) * (DURATION / 5)
        return timeDelay
    }
    getDelayWithTotalTimeRunning = ({
        index, reverse = false, length
    }) => {
        const totalDurationRunning = 1000 - DURATION
        const deltal = totalDurationRunning / length
        if (reverse) {
            return (length - index + 1) * deltal + deltal
        }
        return index * deltal + deltal
    }
    fadeOut = ({ reverse = false, duration = 1 }, cb) => {
        this.typeAnimation = 'fadeOut'
        console.log('DCM start', 'fadeOut', new Date().getTime())
        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                if (!this.listRefStatus[index]) {
                    return
                }
                this.listRefStatus[index] = false
                el.fadeOut(duration).then(() => {
                    resolve()
                })
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish', 'fadeOut', new Date().getTime())
            cb && cb()
        })
    }
    fadeInLeft = ({ reverse = false }, cb) => {
        let timeOuts = Object.values(this.listTimeOut)
        timeOuts.map(el => el && clearTimeout(el))
        this.listTimeOut = {}
        this.typeAnimation = 'fadeInLeft'
        let listPromiseStopAni = []
        // if (this.isRunningAnimation) {
        //     console.log('DCM stop', this.typeAnimation, new Date().getTime())
        //     listPromiseStopAni = this.listRef && this.listRef.map((el, index) => {
        //         return el.stopAnimation()
        //     })
        // }
        console.log('DCM start', 'fadeInLeft', new Date().getTime())
        this.isRunningAnimation = true

        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                timeOut = setTimeout(() => {
                    this.listRefStatus[index] = true
                    el.fadeInLeft(500).then(() => {
                        resolve()
                    })
                }, this.getDelayWithTotalTimeRunning({
                    index,
                    reverse,
                    length: 10
                }));
                this.listTimeOut[timeOut] = timeOut
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            this.isRunningAnimation = false
            console.log('DCM Finish', 'fadeInLeft', new Date().getTime())
            cb && cb()
        })
    }
    fadeInRight = ({ reverse = false }, cb) => {
        let timeOuts = Object.values(this.listTimeOut)
        timeOuts.map(el => el && clearTimeout(el))
        this.listTimeOut = {}
        this.typeAnimation = 'fadeInRight'
        // if (this.isRunningAnimation) {
        //     this.listRef && this.listRef.map((el, index) => {
        //         return new Promise(resolve => {
        //             el.stopAnimation().then(() => {
        //                 resolve()
        //             })
        //         })
        //     })
        // }
        this.isRunningAnimation = true
        console.log('DCM start', 'fadeInRight', new Date().getTime())
        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                let timeOut = setTimeout(() => {
                    this.listRefStatus[index] = true
                    el.fadeInRight(500).then(() => {
                        resolve()
                    })
                }, this.getDelayWithTotalTimeRunning({
                    index,
                    reverse,
                    length: 10
                }));
                this.listTimeOut[timeOut] = timeOut
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            this.isRunningAnimation = false
            console.log('DCM Finish', 'fadeInRight', new Date().getTime())
            cb && cb()
        })
    }
    getTotalTimeRunAnimation = (length = 10, reverse = false) => {
        return 500 + this.getDelay({
            index: reverse ? 0 : length - 1,
            reverse,
            length
        })
    }
    fadeOutUp = ({ reverse = false, duration = 500 }, cb) => {
        this.typeAnimation = 'fadeOutUp'

        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                setTimeout(() => {
                    if (el) {
                        this.listRefStatus[index] = false
                        el.fadeOut(500).then(() => {
                            resolve()
                        })
                    } else {
                        resolve()
                    }
                }, this.getDelayWithTotalTimeRunning({
                    index,
                    reverse: true,
                    length: 10
                }));
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish', new Date().getTime())
            cb && cb()
        })
    }
    stopAnimation = () => {
        this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                el && el.stopAnimation().then(() => {
                    resolve()
                })
            })
        })
    }
    fadeInDown = ({ reverse = false }, cb) => {
        this.typeAnimation = 'fadeInDown'
        if (this.isRunningAnimation) {
            this.listRef && this.listRef.map((el, index) => {
                return new Promise(resolve => {
                    el.stopAnimation().then(() => {
                        resolve()
                    })
                })
            })
        }
        this.isRunningAnimation = true
        console.log('DCM start', this.typeAnimation, new Date().getTime())
        const listPromiseFadeOut = this.listRef && this.listRef.map((el, index) => {
            return new Promise(resolve => {
                if (!el) {
                    resolve()
                }
                let timeOut = setTimeout(() => {
                    this.listRefStatus[index] = true
                    el.fadeIn(500).then(() => {
                        resolve()
                    })
                }, this.getDelayWithTotalTimeRunning({
                    index,
                    reverse,
                    length: 10
                }));
                this.listTimeOut[timeOut] = timeOut
            })
        })
        Promise.all(listPromiseFadeOut).then(() => {
            this.isRunningAnimation = false
            console.log('DCM Finish', this.typeAnimation, new Date().getTime())
            cb && cb()
        })
    }
    _renderRow(rowData, index) {
        const symbol = rowData.symbol
        if (symbol) {
            if (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].class) {
                rowData.class = dataStorage.symbolEquity[symbol].class
            }
            // return <RowSearchByMasterCode
            //     selectedClass={this.dic.selectedClass}
            //     data={rowData}
            //     onPressFn={this.onPressResultSearch}
            //     textSearch={this.dic.textSearch} />
            return (
                <RowSearchByMasterCodeV2
                    setRefPerRowLoading={this.setRefPerRowLoading}
                    key={symbol}
                    index={index}
                    // selectedClass={this.dic.selectedClass}
                    data={rowData}
                // onPressFn={this.onPressResultSearch}
                // isSelected={item.isSelected}
                // textSearch={this.state.textSearch}
                // nameScreen={SEARCH_CODE}
                // addAndRemoveSymbol={this.props.onRowPress}
                />
            )
        }
        return null
    }
    renderSeparator = () => (
        <ItemSeparator />
    )
    checkAnimationDone = (index) => {
        if (this.props.isShow !== null && this.props.isShow !== undefined) {
            this.show = this.props.isShow
            this.listRefStatus[index] = this.props.isShow
        } else {
            this.show = true
            this.listRefStatus[index] = true
        }
        if (index === [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].length - 1) {
            if (!this.init) return
            if (this.props.isShow !== null && this.props.isShow !== undefined) {
                this.show = this.props.isShow
            } else {
                this.show = true
            }
            this.props.onDone && this.props.onDone()
        }
    }
    renderRowLoadingNews = ({
        el, key, type
    }) => {
        return (
            <TransitionViewCustom
                onAnimationEnd={() => this.checkAnimationDone(key)}
                setRef={(ref) => this.setRef(ref, key)}
                // key={`${data.symbol}_alertRow`}
                // testID={`${data.symbol}_alertRow`}

                animation={this.props.animation || 'fadeIn'}
                index={key}
                style={[
                    Styles.itemWrapper,
                    {
                        marginTop: key === 0 ? 0 : 8,
                        // height: 85,
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                        flexDirection: 'column'

                    }
                ]}>
                <View style={{
                    flexDirection: 'row', paddingTop: 16, paddingBottom: 8, paddingRight: 8
                }}>
                    <View style={{ width: '7%' }} />
                    <View style={{ width: '25%' }}>
                        <TextLoad style={[Styles.textSymbol]} isLoading={true}>BHP</TextLoad>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextLoad style={{
                            fontFamily: CommonStyle.fontPoppinsBold,
                            fontSize: CommonStyle.fontSizeXS
                        }} isLoading={true}>Intitial Director’s Interest Notice</TextLoad>
                    </View>
                </View>

                <View style={{
                    flexDirection: 'row', paddingRight: 8, paddingBottom: 16
                }}>
                    <View style={{ width: '7%' }} />
                    <View style={{ width: '25%' }}>
                        <TextLoad isLoading={true}>M</TextLoad>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextLoad style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS
                        }} isLoading={true}>9 pages | 10 minutes ago</TextLoad>
                    </View>
                </View>
            </TransitionViewCustom>
        )
    }
    renderRowLoadingListAlert = ({
        el, key, type
    }) => {
        return (
            <TransitionViewCustom
                onAnimationEnd={() => this.checkAnimationDone(key)}
                setRef={(ref) => this.setRef(ref, key)}
                // key={`${data.symbol}_alertRow`}
                // testID={`${data.symbol}_alertRow`}

                animation={this.props.animation || 'fadeIn'}
                index={key}
                style={[
                    Styles.itemWrapper, {
                        marginTop: key === 0 ? 0 : 8
                    }
                ]}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                            <View style={{ width: '40%', flexDirection: 'row' }}>
                                <TextLoad style={[Styles.textSymbol]} isLoading={true} >AMC</TextLoad>
                                {/* <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text> */}
                                {/* <Text style={[Styles.textSymbol]} numberOfLines={1}>{displayName || ''}</Text> */}
                            </View>
                            <View style={{ width: '30%', justifyContent: 'center' }}>
                                <TextLoad isLoading={true}>AM</TextLoad>
                            </View>
                        </View>
                        <TextLoad style={Styles.textTimeInsights} isLoading={true}>Last Price At Or Above 0.0000</TextLoad>
                        {/* <Text numberOfLines={1} style={Styles.textTimeInsights}>{description}</Text> */}
                    </View>
                </View>
                <View style={{ width: 60, height: 30, backgroundColor: '#ffffff30', borderRadius: 4 }}>

                </View>
            </TransitionViewCustom>
        )
    }
    renderRowLoadingEditAlert = ({
        el, key, type
    }) => {
        return (
            <TransitionView
                pointerEvents={'box-none'}
                onAnimationEnd={() => this.checkAnimationDone(key)}
                setRef={(ref) => this.setRef(ref, key)}
                animation={this.props.animation || 'fadeIn'}
                index={key}
                style={{
                    marginTop: key === 0 ? 0 : 8,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    height: 70
                }}
            >
                <View>
                    <Text style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL - 1,
                        color: CommonStyle.fontColor,
                        opacity: 0
                    }}>
                        A
                    </Text>
                </View>
                <View pointerEvents={'box-none'} style={{
                    flex: 1,
                    backgroundColor:
                        CommonStyle.navigatorSpecial.navBarBackgroundColor2,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginLeft: 8

                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }} pointerEvents={'box-none'}>
                        <View style={{ width: '40%', flexDirection: 'row' }}>
                            <TextLoad style={{
                                fontFamily: CommonStyle.fontPoppinsBold,
                                fontSize: CommonStyle.fontSizeL - 1,
                                color: CommonStyle.fontColor
                            }} isLoading={true} >AMC</TextLoad>
                            {/* <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text> */}
                            {/* <Text style={[Styles.textSymbol]} numberOfLines={1}>{displayName || ''}</Text> */}
                        </View>
                        <View style={{ width: '30%', justifyContent: 'center' }}>
                            <TextLoad isLoading={true}>AM</TextLoad>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }} pointerEvents={'box-none'}>
                        <TextLoad style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS - 1,
                            color: CommonStyle.fontCompany,
                            textAlign: 'right'
                        }} isLoading={true}>Last Price At Or Above 0.000</TextLoad>
                    </View>
                </View>
            </TransitionView>
        )
    }
    renderRowLoadingSymbol = ({
        el, key, type
    }) => {
        return (
            <TransitionViewCustom
                delay={this.getDelayWithTotalTimeRunning({
                    index: key, length: 10
                })}
                onAnimationEnd={() => this.checkAnimationDone(key)}
                setRef={(ref) => this.setRef(ref, key)}
                animation={this.props.animation || 'fadeIn'}
                index={key}
                style={{
                    marginTop: key === 0 ? 0 : 8,
                    padding: 16,
                    flexDirection: 'row',
                    backgroundColor:
                        CommonStyle.navigatorSpecial.navBarBackgroundColor2,
                    borderRadius: 8
                }}
            >
                <View style={{
                    flex: 1
                }}>
                    <TextLoad style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL - 1,
                        color: CommonStyle.fontColor
                    }} isLoading={true} >AMC</TextLoad>
                    <View style={{ height: 4 }} />
                    <TextLoad style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS - 1,
                        color: CommonStyle.fontCompany
                    }} isLoading={true}>AMCOR PLC CD</TextLoad>
                </View>
                <View style={{
                    flex: 1
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <View style={{ justifyContent: 'center', marginRight: 8 }}>
                            <TextLoad isLoading={true}>AM</TextLoad>
                        </View>
                        <TextLoad style={{
                            fontFamily: CommonStyle.fontPoppinsBold,
                            fontSize: CommonStyle.fontSizeL - 1,
                            color: CommonStyle.fontColor,
                            paddingLeft: 8
                        }} isLoading={true}>AMC</TextLoad>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                        <TextLoad style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS - 1,
                            color: CommonStyle.fontCompany,
                            textAlign: 'right'
                        }} isLoading={true}>Equity</TextLoad>
                    </View>
                </View>
            </TransitionViewCustom>
        )
    }
    renderRowLoading = ({
        el, key, type
    }) => {
        if (type === 'symbol') {
            return this.renderRowLoadingSymbol({
                el, key, type
            })
        }
        if (type === 'edit_alert') {
            return this.renderRowLoadingEditAlert({
                el, key, type
            })
        }
        if (type === 'news') {
            return this.renderRowLoadingNews({
                el, key, type
            })
        }
        return this.renderRowLoadingListAlert({
            el, key, type
        })
    }
    renderContent(type) {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        return (
            <View style={[this.props.containerStyle || {}]}>
                {
                    data.map((el, key) => (
                        this.renderRowLoading({
                            el, key, type
                        })
                    ))
                }
            </View>
        )
    }
    render() {
        return (
            <View style={[this.props.styleWrapper || {}]}>
                {/* <FlatList
                    // ItemSeparatorComponent={() => <ItemSeparator />}
                    // ListFooterComponent={() => (
                    //     <View style={CommonStyle.separateLine} />
                    // )}
                    extraData={this.state.dataSource}
                    onScrollBeginDrag={Keyboard.dismiss}
                    // keyExtractor={(item) => item.symbol}
                    keyboardShouldPersistTaps={'always'}
                    showsVerticalScrollIndicator={false}
                    indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                    data={dataFake}
                    ItemSeparatorComponent={this.renderSeparator}
                    renderItem={({ item, index }) => (
                        this._renderRow(item, index)
                    )} /> */}
                {this.renderContent(this.props.type || 'symbol')}
            </View>
        );
    }
}

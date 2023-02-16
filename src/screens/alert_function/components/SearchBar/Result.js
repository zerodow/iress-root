import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    Keyboard,
    TouchableOpacity,
    Animated
} from 'react-native';
import Row from '~/component/result_search/rowSearchByMasterCode.1';
import RowBase from './RowBase';
import ItemSeparator from '../ItemSeparator';
import TransitionView from '~/component/animation_component/transition_view';
import {
    Text as TextLoad,
    View as ViewLoad
} from '~/component/loading_component';
import TextLoading from '~/component/loading_component/text.1';
import RowLoading from '../RowLoading';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
// Storage
import { dataStorage, func } from '~/storage';
import ENUM from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import RowComp from '~s/watchlist/EditWatchList/RowComponent';
import { checkParent } from '~/lib/base/functionUtil';

export class RowSearchByMasterCodeV2 extends Row {
    constructor(props) {
        super(props);
        this.props = { props, ...this.props };
        this.refLoading = null;
        this.listRefRowResult = [];
        this.init = true;
        this.heightAnimated = new Animated.Value(800);
    }
    getDelay = ({ index, reverse = false, length }) => {
        if (reverse) {
            return (length - index) * 100;
        }
        return index * 100;
    };
    handleMoveUpRowResult = ({ reverse = false, duration = 500 }, cb) => {
        // this.typeAnimation = 'fadeOut'
        console.log('DCM start', new Date().getTime());
        const listPromiseRowMoveUp =
            this.listRefRowResult &&
            this.listRefRowResult.slice(0, 9).map((el, index) => {
                return new Promise((resolve) => {
                    setTimeout(
                        () => {
                            if (el) {
                                el.fadeOut(500).then(() => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        },
                        this.getDelay({
                            index,
                            reverse: true,
                            length: 10
                        })
                    );
                });
            });
        Promise.all(listPromiseRowMoveUp).then(() => {
            console.log('DCM Finish', new Date().getTime());
            cb && cb();
        });
    };
    setRefLoading = (ref) => {
        this.refLoading = ref;
    };
    setRefResult = (ref, key) => {
        this.listRefRowResult[key] = ref;
    };
    _renderRowContent = ({ item }) => {
        return <View style={{ marginLeft: 32 }}>{this._header(item)}</View>;
    };
    renderHaveData = () => {
        const { listData, isLoading } = this.state;
        if (!Array.isArray(listData)) return null;
        // if (listData.length === 0) return null;
        return (
            <FlatList
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                data={listData}
                style={{ paddingLeft: 16, paddingTop: 8 }}
                extraData={this.state}
                renderItem={this._renderRowContentChildren}
                keyExtractor={(item) => item.symbol}
                keyboardShouldPersistTaps="always"
                // ListEmptyComponent={this._renderEmpty}
            />
        );
    };
    onDoneLoading = () => {
        const { isExpand } = this.state;
        // const cb = () => this.handleLoadData(isExpand)
        // console.log('DCM Done')
        this.loadData(isExpand);
    };
    _renderContent() {
        return (
            <Animated.View style={{ flex: 1, minHeight: this.heightAnimated }}>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingLeft: 40,
                        paddingTop: 8
                    }}
                    pointerEvents="box-none"
                >
                    <RowLoading
                        onDone={this.onDoneLoading}
                        styleWrapper={{ marginLeft: 16 }}
                        ref={this.setRefLoading}
                    />
                </View>
                <View
                    style={{
                        flex: 1
                    }}
                >
                    {this.renderHaveData()}
                </View>
            </Animated.View>
        );
    }
    _renderRowContentChildren = ({ item, index, separators }) => {
        return (
            <View style={{ marginLeft: 40 }}>
                {this._headerChildren(item, index)}
            </View>
        );
    };
    _renderRowContent = ({ item }) => {
        return (
            <View style={{ marginLeft: 32 }}>{this._headerChildren(item)}</View>
        );
    };
    _headerChildren(data, index) {
        const section = func.getSymbolObj(data.symbol) || data;
        const { textSearch } = this.props;
        return (
            <TransitionView
                setRef={(ref) => this.setRefResult(ref, index)}
                index={-1}
                duration={300}
                animation={'fadeIn'}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%'
                }}
            >
                {this.renderLeftIcon(section)}
                <View style={{ flex: 1 }}>
                    <TouchableOpacityOpt
                        timeDelay={ENUM.TIME_DELAY}
                        onPress={() => {
                            Keyboard.dismiss();
                            if (checkParent(section)) return;
                            this.props.onPressFn({ symbolInfo: section });
                        }}
                    >
                        <RowBase
                            style={{ marginBottom: 0, paddingHorizontal: 0 }}
                            data={data}
                            textSearch={textSearch}
                        />
                    </TouchableOpacityOpt>
                </View>
            </TransitionView>
        );
    }
    _header(data) {
        const detail = func.getSymbolObj(data.symbol) || {};
        let section = data;
        section = { ...data, ...detail };
        const { textSearch } = this.props;
        const { isExpand: isActive } = this.state;
        return (
            <TransitionView
                setRef={(ref) => this.props.setRef(ref, this.props.index)}
                index={-1}
                duration={300}
                animation={'fadeIn'}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%'
                }}
            >
                {this.renderLeftIcon(section)}
                <View style={{ flex: 1 }}>
                    <TouchableOpacityOpt
                        timeDelay={ENUM.TIME_DELAY}
                        onPress={() => {
                            Keyboard.dismiss();
                            if (checkParent(section)) {
                                return this.handleOnPressArrowButton(isActive);
                            }
                            this.props.onPressFn({ symbolInfo: section });
                        }}
                    >
                        <RowBase
                            style={{ marginBottom: 0, paddingHorizontal: 0 }}
                            data={data}
                            textSearch={textSearch}
                        />
                    </TouchableOpacityOpt>
                </View>
            </TransitionView>
        );
    }
    callbackSearch(listData) {
        if (!listData) {
            // Case no data
            Animated.timing(this.heightAnimated, {
                toValue: 0,
                duration:
                    (this.refLoading &&
                        this.refLoading.getTotalTimeRunAnimation(10, true)) ||
                    500
            }).start();
            this.refLoading &&
                this.refLoading.runAnimation(
                    {
                        type: 'fadeOutUp'
                    },
                    () => {}
                );

            this.setState({
                isNoData: true
            });
        } else {
            this.isExpand &&
                listData &&
                this.setState({ listData: listData, isNoData: false }, () => {
                    this.refLoading &&
                        this.refLoading.runAnimation(
                            {
                                type: 'fadeOut'
                            },
                            () => {}
                        );
                });
        }
    }
    handleOnPressArrowButton = (isActive) => {
        const { isExpand } = this.state;
        this.isExpand = !isActive;
        if (!isActive) {
            Animated.timing(this.heightAnimated, {
                toValue: 800
            }).start();
        }
        if (!isExpand) {
            this.init = false;
            this.setState({ isExpand: !isActive });
            console.log('DCM isExpand', isExpand);
        } else {
            // Thu len
            if (this.state.listData.length === 0) {
                console.log('DCM nom data', isExpand);
                this.init = true;
                this.refLoading &&
                    this.refLoading.runAnimation(
                        {
                            type: 'fadeOutUp'
                        },
                        () => {
                            this.setState({
                                isExpand: !isActive,
                                listData: []
                            });
                        }
                    );
            } else {
                console.log('DCM have data', isExpand);
                this.handleMoveUpRowResult({}, () => {
                    this.init = true;
                    // set data = []
                    this.setState({ isExpand: !isActive, listData: [] });
                });
            }
        }
    };
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
export default class ResultSearch extends Component {
    constructor(props) {
        super(props);
        this.listRefRowData = [];
    }

    renderItem = this.renderItem.bind(this);
    renderItem({ item, index }) {
        const symbol = item.symbol;
        if (symbol) {
            if (
                dataStorage.symbolEquity[symbol] &&
                dataStorage.symbolEquity[symbol].class
            ) {
                item.class = dataStorage.symbolEquity[symbol].class;
            }
            return (
                <RowSearchByMasterCodeV2
                    setRef={this.setRef}
                    key={symbol}
                    index={index}
                    selectedClass={this.props.selectedClass}
                    data={item}
                    onPressFn={this.props.onPressResultSearch}
                    textSearch={this.props.textSearch}
                />
            );
        }
        return null;
    }
    runAnimation = ({ type, reverse = false }, cb) => {
        switch (type) {
            case 'fadeIn':
                // this.fadeIn({ type, reverse }, cb)
                break;
            case 'fadeOut':
                // this.fadeOut({ type, reverse }, cb)
                break;
            case 'fadeOutUp':
                this.fadeOutUp({ type, reverse }, cb);
                break;
            default:
                break;
        }
    };
    fadeOutUp = ({ reverse = false, duration = 500 }, cb) => {
        this.typeAnimation = 'fadeOutUp';

        const listPromiseFadeOut =
            this.listRefRowData &&
            this.listRefRowData.slice(0, 9).map((el, index) => {
                return new Promise((resolve) => {
                    setTimeout(
                        () => {
                            if (el) {
                                el.fadeOut(500).then(() => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        },
                        this.getDelay({
                            index,
                            reverse: true,
                            length: 10
                        })
                    );
                });
            });
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish', new Date().getTime());
            cb && cb();
        });
    };
    setRef = (ref, key) => {
        this.listRefRowData[key] = ref;
    };
    fadeIn = ({ reverse = false, duration = 500 }, cb) => {
        this.typeAnimation = 'fadeIn';

        const listPromiseFadeOut =
            this.listRefRowData &&
            this.listRefRowData.map((el, index) => {
                return new Promise((resolve) => {
                    el.fadeIn(duration).then(() => {
                        resolve();
                    });
                });
            });
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish', new Date().getTime());
            cb && cb();
        });
    };
    getDelay = ({ index, reverse = false, length }) => {
        if (reverse) {
            return (length - index) * 100;
        }
        return index * 100;
    };
    fadeOut = ({ reverse = false, duration = 500 }, cb) => {
        this.typeAnimation = 'fadeOut';
        console.log('DCM start', new Date().getTime());
        const listPromiseFadeOut =
            this.listRefRowData &&
            this.listRefRowData.map((el, index) => {
                return new Promise((resolve) => {
                    el.fadeOut(duration).then(() => {
                        resolve();
                    });
                });
            });
        Promise.all(listPromiseFadeOut).then(() => {
            console.log('DCM Finish', new Date().getTime());
            cb && cb();
        });
    };
    renderSeparator = ({ leadingItem }) => {
        if (!leadingItem || !leadingItem.symbol) return null;
        const section = func.getSymbolObj(leadingItem.symbol);
        if (!section || !section.code) return null; // fix not data symbol still show seperator
        return <ItemSeparator />;
    };

    render() {
        return (
            <View style={[{ marginHorizontal: 16 }, this.props.style || {}]}>
                <FlatList
                    extraData={this.props.data}
                    onScrollBeginDrag={Keyboard.dismiss}
                    keyboardShouldPersistTaps={'always'}
                    showsVerticalScrollIndicator={false}
                    indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                    data={this.props.data}
                    ListFooterComponent={() => <View style={{ height: 16 }} />}
                    ItemSeparatorComponent={({ leadingItem }) =>
                        this.renderSeparator({ leadingItem })
                    }
                    renderItem={this.renderItem}
                />
            </View>
        );
    }
}

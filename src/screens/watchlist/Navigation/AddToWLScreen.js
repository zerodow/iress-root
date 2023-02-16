import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, Text, Keyboard } from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import BackDropView from '../Component/BackDropView2';
import NestedScrollView from '../Component/NestedScroll/WatchlistNested';
import I18n from '@module/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import SerchHeader from './SerchHeader';
import AddToWatchListDetail from '~s/watchlist/AddToWatchListDetail';

const TRADELIST_PADDING = 12;

const { add, interpolate, Value } = Animated;

const { height: heightDevice } = Dimensions.get('window');

export default class AddToWLScreen extends Component {
    constructor(props) {
        super(props);
        this._scrollValue = new Value(0);
        this._scrollContainer = new Value(heightDevice * 1.3);

        this._isScrollContent = new Value(0);
        this._spaceTop = 50 + TRADELIST_PADDING;

        this.state = {
            symbol: '',
            exchange: '',
            isFirstLoad: true
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isFirstLoad: false
            });
        }, 1000);
    }

    // #region bind ref

    setRefNested = this.setRefNested.bind(this);
    setRefNested(sef) {
        this._nested = sef;
    }
    setRefDetail = this.setRefDetail.bind(this);
    setRefDetail(sef) {
        this._detail = sef && sef;
    }

    onChangeText = this.onChangeText.bind(this);
    onChangeText(t) {
        this._detail && this._detail.onChangeText(t);
    }

    addSymbol = this.addSymbol.bind(this);
    addSymbol(params) {
        this._detail && this._detail.onAddSymbol(params);
        this._nested && this._nested.show();
    }

    onRefresh = this.onRefresh.bind(this);
    onRefresh() {
        this._detail && this._detail.getSnapshot();
    }

    onDone = this.onDone.bind(this);
    onDone() {
        // Reset text
        this._nested && this._nested.hide();
    }

    hideCallback = this.hideCallback.bind(this);
    hideCallback() {
        // Reset text
        this._detail && this._detail.onChangeText('');
        Keyboard.dismiss();
        this.refSearchHeader &&
            this.refSearchHeader.clearText &&
            this.refSearchHeader.clearText();
    }

    setRefSearchHeader = this.setRefSearchHeader.bind(this);
    setRefSearchHeader(ref) {
        if (ref) {
            this.refSearchHeader = ref;
        }
    }

    // #endregion

    renderHeaderPanner = this.renderHeaderPanner.bind(this);
    renderHeaderPanner() {
        return (
            // Tren con mi. Noi giua 2 view ma co mot gach trong suot lam cho khi vuot hien bi chop chop
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22
                }}
            >
                <View style={{ height: 1 }} />
                <SerchHeader
                    ref={this.setRefSearchHeader}
                    onDone={this.onDone}
                    onChangeText={this.onChangeText}
                />
            </View>
        );
    }

    renderFooter = this.renderFooter.bind(this);
    renderFooter() {
        return (
            <View
                style={{
                    paddingTop: 2,
                    backgroundColor: CommonStyle.color.dusk,
                    borderRadius: 8
                }}
            >
                <View
                    style={{
                        backgroundColor: CommonStyle.backgroundColor,
                        borderRadius: 8,
                        overflow: 'hidden'
                    }}
                >
                    <View
                        style={{
                            width: '100%',
                            height: 67 + this._spaceTop,
                            paddingBottom: this._spaceTop,
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0.5
                        }}
                    >
                        <Icon
                            name="ios-add-circle"
                            size={24}
                            color="#fdfdfd70"
                        />
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.fontSizeS,
                                color: CommonStyle.fontColor
                            }}
                            numberOfLines={1}
                        >
                            {I18n.t('createNewWL')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        const { isFirstLoad } = this.state;
        if (isFirstLoad) return null;
        return (
            <React.Fragment>
                <BackDropView
                    spaceTop={this._spaceTop}
                    _scrollValue={this._scrollContainer}
                    _isScrollContent={this._isScrollContent}
                    opacityInterpolate={(translateY) =>
                        interpolate(translateY, {
                            inputRange: [-1, 0, heightDevice, heightDevice + 1],
                            outputRange: [1, 1, 0, 0]
                        })
                    }
                />
                <NestedScrollView
                    _isScrollContent={this._isScrollContent}
                    _scrollValue={this._scrollValue}
                    _scrollContainer={this._scrollContainer}
                    ref={this.setRefNested}
                    renderHeaderPanner={this.renderHeaderPanner}
                    spaceTop={this._spaceTop}
                    renderFooter={this.renderFooter}
                    hideCallback={this.hideCallback}
                >
                    <View style={styles.bg} />
                    <AddToWatchListDetail ref={this.setRefDetail} />
                </NestedScrollView>
            </React.Fragment>
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

    bg: {
        position: 'absolute',
        height: '150%',
        width: '100%',
        paddingTop: 33,
        backgroundColor: CommonStyle.backgroundColor
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

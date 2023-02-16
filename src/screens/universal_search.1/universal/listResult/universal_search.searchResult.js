import React, { Component } from 'react';
import {
    Platform,
    View,
    Text,
    FlatList,
    Dimensions,
    Keyboard,
    UIManager,
    LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import ProgressBar from '~/modules/_global/ProgressBar';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as PureFunc from '~/utils/pure_func';
import ResultSearch from '~/component/result_search/result_search.1';
import RowSearchByMasterCode from '~/component/result_search/rowSearchByMasterCode';
import { func, dataStorage } from '~/storage';
import * as searchActions from '@unis/universal_search.actions';
import universalSearchActions from './../search_universal.reducer';
import ENUM from '../../../../enum';
import { showSearchDetailScreen } from '~/navigation/controller';
import searchDetailActions from '@unis/detail/search_detail.reducer';

const { width, height } = Dimensions.get('window');
const {
    SCREEN: { SEARCH_ODER }
} = ENUM;

const isAndroid = Platform.OS !== 'ios';
if (isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HideView = (props) =>
    props.isRender ? (
        <View
            style={{
                height: props.keyboardHeight,
                backgroundColor: 'transparent'
            }}
        />
    ) : null;
HideView.defaultProps = {
    isRender: !isAndroid
};

const Loading = (props) => (
    <View
        style={{
            width,
            height,
            backgroundColor: CommonStyle.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center'
        }}
    >
        <ProgressBar />
        <HideView keyboardHeight={props.keyboardHeight} />
    </View>
);

const EmptyData = (props) => (
    <View
        style={{
            flex: 1,
            backgroundColor: CommonStyle.backgroundColor,
            height,
            justifyContent: 'center',
            alignItems: 'center'
        }}
    >
        <Text style={{ color: CommonStyle.fontColor }}>
            {I18n.t('noData', { locale: props.lang })}
        </Text>
        <HideView keyboardHeight={props.keyboardHeight} />
    </View>
);

const Title = (props) =>
    props.isHistory ? (
        <View
            style={{
                height: 30,
                alignItems: 'center',
                backgroundColor: CommonStyle.fontBorderGray,
                paddingLeft: 16,
                flexDirection: 'row'
            }}
        >
            <MaterialIcon
                name="history"
                size={24}
                style={{ color: CommonStyle.fontColor, paddingRight: 8 }}
            />
            <Text style={CommonStyle.textSub}>
                {I18n.t('History', {
                    locale: props.lang
                })}
            </Text>
        </View>
    ) : null;

const Footer = () => (
    <View
        style={{
            borderTopWidth: 1,
            borderColor: CommonStyle.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center'
        }}
    />
);

export class SearchResult extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this.showDetail = this.showDetail.bind(this);
        // this.onLayout = this.onLayout.bind(this);
        // this.heightForFive = Platform.OS === 'ios' ? 240 : 235;
        // this.hide = this.hide.bind(this);

        this.state = {
            // curHeight: undefined,
            keyboardHeight: 0
        };
    }

    componentWillReceiveProps = (nextProps) => {
        if (!_.isEqual(this.props.listData, nextProps.listData)) {
            // this.state.curHeight = undefined;
            // this.resultHeight = undefined;
        }
    };

    componentDidMount = () => {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );
    };

    componentWillUnmount = () => {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    };

    _keyboardDidShow(e) {
        const keyboardHeight =
            Platform.OS === 'ios' ? e.endCoordinates.height || 0 : 16;
        this.setState({ keyboardHeight });
    }

    _keyboardDidHide() {
        const keyboardHeight = 0;
        this.setState({ keyboardHeight });
    }

    showDetail({ symbolInfo }) {
        Keyboard.dismiss();
        const { symbol } = symbolInfo;
        const company =
            symbolInfo.security_name ||
            symbolInfo.company_name ||
            symbolInfo.company;
        const subSymbol = func.getSymbolObj(symbol) || data;
        if (subSymbol.master_code) {
 this.props.saveHistory({ symbol: subSymbol.master_code, company });
} else this.props.saveHistory({ symbol, company });
        this.props.updateHistory({ symbol, company });
        this.props.showSearchPreview({ data: symbolInfo });
        this.props.setSymbolSearchDetail(symbol);
    }

    _renderRow({ item, index }) {
        if (!item.symbol) return null;
        const { textSearch } = this.props;
        return (
            <RowSearchByMasterCode
                isHistory={this.props.isHistory}
                data={item}
                textSearch={textSearch}
                onPressFn={this.showDetail}
                key={`${index}added`}
                nameScreen={SEARCH_ODER}
                selectedClass={this.props.selectedClass}
            />
        );
    }
    renderListContent() {
        const { isHistory, lang, listData } = this.props;
        const { keyboardHeight } = this.state;
        return (
            <View
                style={[
                    {
                        backgroundColor: CommonStyle.backgroundColor,
                        shadowColor: 'rgba(0,0,0,0.2)',
                        flex: 1
                    }
                ]}
            >
                <Title isHistory={isHistory} lang={lang} />
                <FlatList
                    ItemSeparatorComponent={() => (
                        <View style={CommonStyle.separateLine} />
                    )}
                    ListFooterComponent={() => (
                        <View style={CommonStyle.separateLine} />
                    )}
                    data={listData}
                    removeClippedSubviews={false}
                    keyboardShouldPersistTaps="always"
                    renderItem={this._renderRow}
                    indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                    ListFooterComponent={Footer}
                />
                <HideView
                    isRender={isHistory}
                    keyboardHeight={keyboardHeight}
                />
            </View>
        );
    }

    render() {
        const { isLoading, listData, lang } = this.props;
        const { keyboardHeight } = this.state;
        if (isLoading) {
            return <Loading keyboardHeight={keyboardHeight} />;
        }
        if (_.isEmpty(listData)) {
            return <EmptyData lang={lang} keyboardHeight={keyboardHeight} />;
        }

        return this.renderListContent();
    }
}

const mapStateToProps = (state) => ({
    lang: state.setting.lang,
    isLoading: state.uniSearch.isLoading,
    listData: state.uniSearch.listData
});

const mapDispatchToProps = (dispatch) => ({
    saveHistory: (...params) => dispatch(searchActions.saveHistory(...params)),
    updateHistory: (...params) =>
        dispatch(universalSearchActions.uniSearchUpdateHistory(...params)),
    setSymbolSearchDetail: (...p) =>
        dispatch(searchDetailActions.setSymbolSearchDetail(...p))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(SearchResult);

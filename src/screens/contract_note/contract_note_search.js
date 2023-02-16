import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Platform
} from 'react-native';
import {
    resetAnimationSearch,
    getMarginTopDevice,
    getClassQuery,
    searchResponse,
    getSymbolInfoApi
} from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import FallHeader from '~/component/fall_header';
import SearchBar from './search_bar';
import ScrollBarUndelineCustom from '~/component/scrollbar_underline';
import Enum from '~/enum';
import I18n from '~/modules/language';
import SearchResult from './search_result';
import * as Channel from '~/streaming/channel';
import * as Emitter from '~/lib/base/vietnam-emitter';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import * as Business from '~/business';
import * as Util from '~/util';

const MARGIN_TOP = getMarginTopDevice(30);
const { SYMBOL_CLASS } = Enum;

export default class CnoteSearch extends Component {
    constructor(props) {
        super(props);
        this.textSearch = props.textSearch;
        this.textSearchPressed = props.textSearch;
        this.classSymbol = SYMBOL_CLASS.ALL_TYPES;
        this.listHistory = [];
        this.dicHistoryByClass = {};
        this.id = Util.getRandomKey();
        this.state = {
            isHistory: !props.textSearch,
            data: [],
            isLoading: !!props.textSearch
        };
        this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this);
        this.listSymbolClass = [
            {
                id: SYMBOL_CLASS.ALL_TYPES,
                label: I18n.t(SYMBOL_CLASS.ALL_TYPES),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.EQUITY,
                label: I18n.t(SYMBOL_CLASS.EQUITY),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.ETFS,
                label: I18n.t(SYMBOL_CLASS.ETFS),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.MF,
                label: I18n.t(SYMBOL_CLASS.MF),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.WARRANT,
                label: I18n.t(SYMBOL_CLASS.WARRANT),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.FUTURE,
                label: I18n.t(SYMBOL_CLASS.FUTURE),
                action: this.onSelectSymbolClass
            },
            {
                id: SYMBOL_CLASS.OPTION,
                label: I18n.t(SYMBOL_CLASS.OPTION),
                action: this.onSelectSymbolClass
            }
        ];
    }

    componentDidMount() {
        if (this.state.isHistory) this.loadDataHistory();
        else this.loadNewData({ isInit: true });
        this.subSyncHistorySearchSymbol();
    }

    componentWillUnmount() {
        this.unsubSyncHistorySearchSymbol();
    }

    subSyncHistorySearchSymbol = this.subSyncHistorySearchSymbol.bind(this);
    subSyncHistorySearchSymbol() {
        const channel = Channel.getChannelSyncHistorySearchSymbol();
        Emitter.addListener(channel, this.id, this.loadDataHistory);
    }

    unsubSyncHistorySearchSymbol = this.unsubSyncHistorySearchSymbol.bind(this);
    unsubSyncHistorySearchSymbol() {
        Emitter.deleteByIdEvent(this.id);
    }

    filterHistoryByClass = this.filterHistoryByClass.bind(this);
    filterHistoryByClass() {
        this.dicHistoryByClass = Business.filterSymbolByClass(this.listHistory);
    }

    loadDataHistory = this.loadDataHistory.bind(this);
    loadDataHistory() {
        if (this.props.isConnected) {
            this.listHistory = ManageHistorySearch.getHistorySearchSymbol(30);
        }
        const getDataHistoryByClass = () => {
            const dicDataHistoryByClass =
                (this.dicHistoryByClass &&
                    this.dicHistoryByClass[this.classSymbol]) ||
                [];
            this.setState({
                text: '',
                isLoading: false,
                isHistory: true,
                data: dicDataHistoryByClass
            });
        };
        if (this.listHistory.length) {
            this.filterHistoryByClass();
            let stringQuery = ``;
            for (let i = 0; i < this.listHistory.length; i++) {
                const element = this.listHistory[i];
                stringQuery += `${element.symbol},`;
            }
            if (stringQuery !== '') {
                return getSymbolInfoApi(stringQuery, () => {
                    getDataHistoryByClass();
                });
            }
            getDataHistoryByClass();
        }
        getDataHistoryByClass();
    }

    loadNewData({ text = this.textSearch, isReset = false, isInit = false }) {
        // Khi không có kết nối mạng thì chỉ ghi nhận text search thay đổi mà không call API
        const { isConnected } = this.props;
        if (!isConnected) {
            return this.setState({
                textSearch: text,
                data: [],
                isHistory: !text
            });
        }
        const cb = () => {
            const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
            const cbSearch = (data, classQuery) => {
                this.classQuery = classQuery || this.classSymbol;
                this.setState({
                    data: data || [],
                    isLoading: false
                });
            };
            const classQuery = getClassQuery(this.classSymbol);
            searchResponse({ textSearch, cb: cbSearch, classQuery });
        };
        if (isInit) cb();
        else {
            this.setState(
                {
                    isHistory: !text,
                    isLoading: true,
                    ...(isReset ? { data: [] } : {})
                },
                cb
            );
        }
    }

    onSelectSymbolClass(classSymbol) {
        this.classSymbol = classSymbol;
        if (this.state.isHistory) {
            this.loadDataHistory();
        } else {
            this.loadNewData({ isReset: true });
        }
    }

    onChangeText(text = '') {
        this.textSearch = text;
        this.timeout && clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (text && text.length > 0) {
                resetAnimationSearch();
                this.loadNewData({ isReset: true });
            } else {
                this.loadDataHistory();
            }
        }, 600);
    }

    onReset() {
        this.textSearch = '';
        this.textSearchPressed = '';
        this.loadDataHistory();
    }

    onClose(isRefresh = false) {
        this.props.dismissModal &&
            this.props.dismissModal({
                textSearch: this.textSearchPressed,
                isRefresh
            });
    }

    renderSearchBar(isReal) {
        return (
            <View style={styles.searchBarContainer}>
                <SearchBar
                    isReal={isReal}
                    textSearch={this.textSearch}
                    testID="ContractNoteSearchBar"
                    style={{ flex: 1 }}
                    onChangeText={this.onChangeText.bind(this)}
                    onReset={this.onReset.bind(this)}
                />
                <TouchableOpacity
                    onPress={() => this.onClose((isRefresh = true))}
                    style={{ paddingLeft: 16 }}
                >
                    <Text
                        style={{
                            ...CommonStyle.rightTextBold
                        }}
                    >
                        {I18n.t('cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderListClass() {
        return (
            <View style={{ height: 32 }}>
                <ScrollBarUndelineCustom
                    ref={(ref) => (this.refScrollTabbar = ref)}
                    tabStyle={{ paddingBottom: 8 }}
                    style={{ borderBottomRightRadius: 0 }}
                    tabs={this.listSymbolClass}
                />
            </View>
        );
    }

    renderHeader = this.renderHeader.bind(this);
    renderHeader(isReal = false) {
        return (
            <View style={styles.headerContainer}>
                {this.renderSearchBar(isReal)}
                {this.renderListClass()}
            </View>
        );
    }

    onPressSearchResult = this.onPressSearchResult.bind(this);
    onPressSearchResult({ symbolInfo = {}, isRefresh }) {
        const { symbol = this.textSearch } = symbolInfo;
        const symbolName = Business.getSymbolName({ symbol });
        this.textSearch = symbolName;
        this.textSearchPressed = symbolName;
        if (!this.state.isHistory) {
            this.listHistory = ManageHistorySearch.saveHistorySearchSymbol({
                data: this.listHistory,
                symbolInfo
            });
        }
        this.onClose();
    }

    render() {
        return (
            <FallHeader
                ref={(ref) => ref && (this.headerRef = ref)}
                // isPullToRefresh={true}
                isNotBottomLine={true}
                style={{ backgroundColor: CommonStyle.color.bg }}
                containerStyle={{
                    borderBottomRightRadius: 0,
                    overflow: 'hidden'
                }}
                renderHeader={this.renderHeader}
            >
                <View
                    style={{ flex: 1, backgroundColor: CommonStyle.color.bg }}
                >
                    <SearchResult
                        ref={(ref) => (this.searchResult = ref)}
                        isHistory={this.state.isHistory}
                        data={this.state.data}
                        textSearch={this.textSearch}
                        isLoading={this.state.isLoading}
                        cbSearch={this.onPressSearchResult}
                    />
                </View>
            </FallHeader>
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? MARGIN_TOP : 16,
        backgroundColor: CommonStyle.backgroundColor,
        borderBottomRightRadius: 0
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

import React, { PureComponent } from 'react';
import {
    View,
    Text,
    Platform,
    PixelRatio,
    Keyboard,
    StatusBar
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import ENUM from '~/enum';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Business from '~/business';
// import * as PureFunc from '~/utils/pure_func';
import NetworkWarning from '~/component/network_warning/network_warning.1';
import ScreenId from '~/constants/screen_id';
import ScrollBarUndeline from '~/component/scrollbar_underline/scrollbar_underline';
import analyticsEnum from '~/constants/analytics';
import config from '~/config';
import searchActions from './search_universal.reducer';
import { dataStorage, func } from '~/storage';
import { setCurrentScreen } from '~/lib/base/analytics';

import SearchBar from './topBar/universal_search.searchBar';
import SearchPreView from './preview/universal_search.searchPreView';
import SearchResult from './listResult/universal_search.searchResult';

const { ALL_TYPES, EQUITY, ETFS, MF, WARRANT, FUTURE } = ENUM.SYMBOL_CLASS;

arrSymbolClass = [ALL_TYPES, EQUITY, ETFS, MF, WARRANT, FUTURE];

export class UniversalSearch extends PureComponent {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.searchSymbol = this.searchSymbol.bind(this);
        this.listSymbolClass = this.getListSymClass();
        this.props.navigator.addOnNavigatorEvent((e) =>
            this.onNavigatorEvent(e)
        );
        this.selectedClass = ALL_TYPES;
    }

    getListSymClass() {
        const result = [];
        _.map(arrSymbolClass, (value) => {
            result.push({
                id: value,
                label: I18n.t(value),
                action: (...params) => {
                    this.selectedClass = value;
                    this.props.onSelectSymbolClass(...params);
                }
            });
        });
        return result;
    }

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'willAppear':
                setCurrentScreen(analyticsEnum.universalSearch);

                const {
                    displayName,
                    typeNews,
                    getSearchHistory,
                    textSearch
                } = this.props;
                let text = textSearch || '';
                if (displayName && typeNews) {
                    text = displayName;
                }
                getSearchHistory(text);
                break;
            case 'didAppear':
                setTimeout(() => {
                    Business.setStatusBarBackgroundColor();
                }, 2000);
                if (dataStorage.backNewsDetail) {
                    dataStorage.backNewsDetail = false;
                }
                func.setCurrentScreenId(ScreenId.UNIVERSAL_SEARCH);

                setTimeout(() => {
                    this.focusSearchText && this.focusSearchText();
                }, 500);
                break;
            default:
                break;
        }
    }

    closeModal() {
        Business.setStatusBarBackgroundColor({
            backgroundColor: CommonStyle.statusBarBgColor
        });
        Keyboard.dismiss();

        // reset reducer
        this.props.resetAll();

        this.props.navigator.dismissModal({
            animated: true,
            animationType: 'slide-down'
        });
    }

    searchSymbol(text) {
        if (text === '') {
            this.props.getResult(text);
            return;
        }

        if (this.waitSearch) {
            clearTimeout(this.waitSearch);
        }

        if (text.length === 1) return;

        this.waitSearch = setTimeout(() => {
            this.props.getResult(text);
        }, 700);
    }

    render() {
        const { textSearch, navigator } = this.props;
        const isHistory = textSearch === '' || _.isNil(textSearch);
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor
                }}
                testID="universalSearch"
            >
                <SearchBar
                    ref={(sef) => {
                        if (sef) {
                            this.focusSearchText = sef.focus;
                        }
                    }}
                    navigator={navigator}
                    onSearch={this.searchSymbol}
                    onCancel={this.closeModal}
                    isHistory={isHistory}
                />
                <NetworkWarning />
                <View style={{ backgroundColor: CommonStyle.backgroundColor }}>
                    <ScrollBarUndeline listItem={this.listSymbolClass} />
                </View>

                <SearchResult
                    textSearch={textSearch}
                    isHistory={isHistory}
                    navigator={this.props.navigator}
                    selectedClass={this.selectedClass}
                />
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        listData: state.uniSearch.listData,
        textSearch: state.uniSearch.textSearch
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getSearchHistory: (...params) =>
            dispatch(searchActions.uniSearchGetHistory(...params)),
        getResult: (...params) =>
            dispatch(searchActions.uniSearchGetResult(...params)),
        onSelectSymbolClass: (...params) =>
            dispatch(searchActions.uniSearchSetSymbolClass(...params)),
        resetAll: (...params) =>
            dispatch(searchActions.uniSearchReset(...params))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversalSearch);

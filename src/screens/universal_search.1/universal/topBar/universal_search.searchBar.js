import React, { PureComponent } from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    NativeAppEventEmitter,
    PixelRatio,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from '@unis/style/universal_search';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import * as Controller from '~/memory/controller';
import userType from '~/constants/user_type';
import I18n from '~/modules/language';
import * as FunctionUtil from '~/lib/base/functionUtil';

export class SearchBar extends PureComponent {
    constructor(props) {
        super(props);
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;

        this.focus = this.focus.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            value: props.textSearch || ''
        };
    }
    focus() {
        if (this.refs.textInput) {
            this.refs.textInput.focus();
        }
    }

    getWidthCancel() {
        const isStreaming = Controller.isPriceStreaming();
        const fontScale = PixelRatio.getFontScale();

        if (isStreaming) return '24%';
        if (this.props.isHistory) {
            return fontScale > 1 ? '29%' : '24%';
        }

        return fontScale > 1 ? '35%' : '30%';
    }

    getWidthTextCancel() {
        const isStreaming = Controller.isPriceStreaming();

        if (isStreaming || this.props.isHistory) return '100%';
        return '75%';
    }

    getWidthSearch() {
        const isStreaming = Controller.isPriceStreaming();
        const fontScale = PixelRatio.getFontScale();

        if (isStreaming) return '76%';
        if (isStreaming === userType.Streaming || this.props.isHistory) {
            return fontScale > 1 ? '70%' : '76%';
        }

        return fontScale > 1 ? '65%' : '70%';
    }

    onSearch(txt) {
        if (this.props.onSearch) {
            this.props.onSearch(txt);
        }

        this.setState({ value: txt });
    }

    renderBar() {
        const widthSearch = this.getWidthSearch();
        const widthInputSearch = '79%';
        return (
            <View
                style={[
                    styles.searchBar2,
                    {
                        flex: 1,
                        marginLeft: 8,
                        borderRadius: 4,
                        backgroundColor: CommonStyle.searchInputBgColor
                    }
                ]}
            >
                <Icon
                    name="ios-search"
                    style={[
                        styles.iconSearch2,
                        { color: CommonStyle.fontColor }
                    ]}
                />
                <TextInput
                    ref="textInput"
                    testID="universalSearchInput"
                    // selectionColor={CommonStyle.fontColor}
                    style={[
                        {
                            backgroundColor: 'transparent',
                            color: CommonStyle.fontColor,
                            fontSize: CommonStyle.fontSizeS,
                            fontFamily: CommonStyle.fontFamily,
                            width: widthInputSearch,
                            paddingTop: 0,
                            paddingBottom: 0
                        }
                    ]}
                    underlineColorAndroid="transparent"
                    blurOnSubmit={true}
                    placeholder={I18n.t('search', {
                        locale: this.props.lang
                    })}
                    placeholderTextColor={CommonStyle.searchPlaceHolderColor}
                    onChangeText={this.onSearch}
                    value={this.state.value}
                />
                <Icon
                    testID="iconCancelSearchCode"
                    name="ios-close-circle"
                    style={[
                        CommonStyle.iconCloseLight,
                        { position: 'absolute', right: 5 }
                    ]}
                    onPress={() => this.onSearch('')}
                />
            </View>
        );
    }

    onRefresh() {
        const { navigatorEventID: eventID } = this.props.navigator;
        this.emitter.emit(eventID, {
            id: 'search_refresh'
        });
    }

    renderReloadIcon() {
        if (Controller.isPriceStreaming()) return <View />;
        if (this.props.isHistory) return null;
        if (this.props.isRefresh) {
            return (
                <View style={{ width: '25%' }}>
                    <ActivityIndicator
                        style={{ width: 24, height: 24 }}
                        color="white"
                    />
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={{ width: '25%', marginRight: 8 }}
                onPress={this.onRefresh}
            >
                <Icon
                    name="ios-refresh"
                    size={28}
                    color="#FFF"
                    style={{ textAlign: 'right', top: 2 }}
                />
            </TouchableOpacity>
        );
    }

    renderOption() {
        const { onCancel } = this.props;
        const widthCancel = this.getWidthCancel();
        const widthTextCancel = this.getWidthTextCancel();
        return (
            <View
                testID="cancelUniversalSearch"
                style={[styles.buttonCancel, { paddingHorizontal: 16 }]}
            >
                <TouchableOpacity
                    style={{ paddingVertical: 12 }}
                    testID="universalSearchCancel"
                    onPress={onCancel}
                >
                    <Text
                        style={[
                            CommonStyle.whiteText,
                            {
                                backgroundColor: 'transparent',
                                color: CommonStyle.fontColor
                            }
                        ]}
                    >
                        {I18n.t('cancel', { locale: this.props.lang })}
                    </Text>
                </TouchableOpacity>
                {/* {this.renderReloadIcon()} */}
            </View>
        );
    }

    render() {
        return (
            <View
                style={[
                    CommonStyle.colorHeaderFindWatchlist,
                    {
                        paddingTop:
                            Platform.OS === 'ios'
                                ? FunctionUtil.isIphoneXorAbove()
                                    ? 38
                                    : 16
                                : 0,
                        height: FunctionUtil.isIphoneXorAbove()
                            ? 48 + 38
                            : 48 + 16,
                        marginTop: 0
                    }
                ]}
            >
                {this.renderBar()}
                {this.renderOption()}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    isRefresh: state.searchDetail.isLoading,
    lang: state.setting.lang
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(
    SearchBar
);

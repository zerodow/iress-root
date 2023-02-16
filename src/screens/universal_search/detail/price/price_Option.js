import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';

import I18n from '~/modules/language/';
import styles from '~s/trade/style/trade';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ModalPicker from '~s/modal_picker/modal_picker';
import * as Util from '~/util';
import Enum from '~/enum';
import * as InvertTranslate from '~/invert_translate';
import PriceChartActions from './price_chart.reducer';
import PriceActions from './price.reducer';
import AppState from '~/lib/base/helper/appState2';

import config from '~/config';
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

class Option extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false
        };
        this.id = Uuid.v4();

        this.selectedItem = I18n.t(this.props.filterType);
        this.listDisplay = this.getListDisplay();

        this.onSelectedTime = this.onSelectedTime.bind(this);
        this.onShowModalPicker = this.onShowModalPicker.bind(this);
        this.onClose = this.onClose.bind(this);
        this.setWatchListTitle();
        this.props.subFavorites();
        this.appState = new AppState(() => {
            this.props.listenHalt(`${this.id}_halt`);
            this.props.listenPrice(this.id);

            this.props.getHaltSnapshot();
            this.props.checkUserWatchList();
        });
    }

    componentWillReceiveProps = (nextProps) => {
        const { isConnected, symbol } = nextProps;
        const changeNerworkState =
            this.props.isConnected === false && isConnected === true;
        const changeSymbol = this.props.symbol !== symbol;
        if (changeNerworkState || changeSymbol) {
            this.props.listenHalt(`${this.id}_halt`);
            this.props.listenPrice(this.id);

            this.props.getHaltSnapshot();
            this.props.checkUserWatchList();
        }
    };

    componentDidMount() {
        this.props.listenHalt(`${this.id}_halt`);
        this.props.listenPrice(this.id);

        this.props.getHaltSnapshot();
        this.props.checkUserWatchList();
    }

    componentWillUnmount = () => {
        // remove event subFavorites
        Emitter.deleteByIdEvent('priceOptID');
    };

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'search_refresh':
                this.props.getHaltSnapshot();
                this.props.checkUserWatchList();
                break;
            case 'willAppear':
                this.props.listenHalt(`${this.id}_halt`);
                this.props.listenPrice(this.id);
                break;
            case 'didAppear':
                this.appState.addListenerAppState();
                break;
            case 'didDisappear':
                // remove tam
                Emitter.deleteByIdEvent(`${this.id}_halt`);
                Emitter.deleteByIdEvent(this.id);
                this.appState.removeListenerAppState();
                break;
            default:
                break;
        }
    }

    setWatchListTitle() {
        const strFavories = this.getText('favorites');
        let title = `+ ${strFavories}`;
        if (this.props.typePrice) {
            title = `- ${strFavories}`;
        }
        this.props.changePlusTitle(title);
    }

    async onSelectedTime(value) {
        // Dịch ngược về EN với key
        this.state.modalVisible = false;
        const enValue = InvertTranslate.translateCustomLang(value);
        this.selectedItem = I18n.t(enValue);
        this.props.changeFilterType(enValue);
    }

    getListDisplay() {
        const listItem = Util.getValueObject(PRICE_FILL_TYPE);
        return InvertTranslate.getListInvertTranslate(listItem);
    }
    onShowModalPicker() {
        this.setState({ modalVisible: true });
    }

    onClose() {
        this.setState({ modalVisible: false });
    }

    getText(text) {
        const { language } = this.props;
        return I18n.t(text, { locale: language });
    }

    renderSelectTime() {
        const { symbol } = this.props;
        return (
            <View style={{ width: '20%', flexDirection: 'row' }}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={this.onShowModalPicker}
                >
                    <Text
                        testID={`${symbol}wlFilter`}
                        style={CommonStyle.textSubMediumWhite}
                    >
                        {this.selectedItem}
                    </Text>
                    <IonIcons
                        name="md-arrow-dropdown"
                        size={20}
                        style={CommonStyle.iconModal1}
                    />
                </TouchableOpacity>
                <ModalPicker
                    listItem={this.listDisplay}
                    onSelected={this.onSelectedTime}
                    selectedItem={this.selectedItem}
                    visible={this.state.modalVisible}
                    title={I18n.t('selectTime')}
                    onClose={this.onClose}
                />
            </View>
        );
    }

    renderPriceWatchList() {
        const { login, plusButton } = this.props;
        if (!login.isLogin) return null;
        return (
            <View
                style={{
                    width: '50%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <TouchableOpacity
                    style={styles.priceWatchListButton}
                    onPress={this.props.onPressWatchList}
                >
                    <Text style={CommonStyle.textSubMediumWhite}>
                        {plusButton}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderDolaButton() {
        const { changeChartType, chartType, symbol } = this.props;
        return (
            <TouchableOpacity
                onPress={() => changeChartType('$', true)}
                style={[
                    styles.tabButton1,
                    {
                        backgroundColor:
                            chartType === '$'
                                ? config.colorVersion
                                : CommonStyle.backgroundColor
                    }
                ]}
            >
                <Text
                    testID={`${symbol}$Button`}
                    style={[
                        chartType === '$'
                            ? CommonStyle.textSubMediumWhite
                            : CommonStyle.textSubGreen,
                        {
                            fontWeight: chartType === '$' ? 'bold' : 'normal'
                        }
                    ]}
                >
                    {this.getText('moneySymbol')}
                </Text>
            </TouchableOpacity>
        );
    }

    renderPercentButton() {
        const { changeChartType, chartType, symbol } = this.props;

        return (
            <TouchableOpacity
                onPress={() => changeChartType('%', true)}
                style={[
                    styles.tabButton2,
                    {
                        backgroundColor:
                            chartType === '%'
                                ? config.colorVersion
                                : CommonStyle.backgroundColor
                    }
                ]}
            >
                <Text
                    testID={`${symbol}%Button`}
                    style={[
                        chartType === '%'
                            ? CommonStyle.textSubMediumWhite
                            : CommonStyle.textSubGreen,
                        {
                            fontWeight: chartType === '%' ? 'bold' : 'normal'
                        }
                    ]}
                >
                    {this.getText('percentSymbol')}
                </Text>
            </TouchableOpacity>
        );
    }
    render() {
        const { login } = this.props;
        return (
            <View style={[styles.filterContainer, { paddingBottom: 8 }]}>
                {this.renderSelectTime()}

                {this.renderPriceWatchList()}

                <View
                    style={{
                        width: login.isLogin ? '30%' : '80%',
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}
                >
                    {this.renderDolaButton()}
                    {this.renderPercentButton()}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    filterType: state.priceChart.filterType,
    chartType: state.priceChart.chartType,
    plusButton: state.price.plusButton,
    isSelect: state.price.isSelect,
    language: state.setting.lang,
    symbol: state.searchDetail.symbol,
    login: state.login
});

function mapDispatchToProps(dispatch) {
    return {
        changeFilterType: (...p) =>
            dispatch(PriceChartActions.priceChartChangeFilterType(...p)),
        changeChartType: (...p) =>
            dispatch(PriceChartActions.priceChartChangeChartType(...p)),
        subFavorites: (...p) =>
            dispatch(PriceActions.priceUniSubFavorites(...p)),
        changePlusTitle: (...p) => dispatch(PriceActions.changePlusTitle(...p)),
        onPressWatchList: (...p) =>
            dispatch(PriceActions.priceUniOnPressWatchList(...p)),
        listenHalt: (...p) => dispatch(PriceActions.priceUniListenHalt(...p)),
        listenPrice: (...p) => dispatch(PriceActions.priceUniListenPrice(...p)),

        getHaltSnapshot: (...p) =>
            dispatch(PriceActions.priceUniUpdateHalt(...p)),
        checkUserWatchList: (...p) =>
            dispatch(PriceActions.checkUserWatchList(...p))
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(Option);

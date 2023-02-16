import React from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
// Emitter
import * as Emitter from '@lib/vietnam-emitter';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
// Storage
import ENUM from '../../enum';
// Util
import * as FunctionUtil from '../../lib/base/functionUtil';
// Component
import XComponent from '../../component/xComponent/xComponent';
import I18n from '../../modules/language/';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PricePiece from '../../component/price_child/price_piece';
import TextLoading from '~/component/loading_component/text.1';
import ViewLoadingReAni from '~/component/loading_component/view1';
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY, PRICE_DECIMAL } = ENUM;

const { width, height } = Dimensions.get('window');
const per3Screen = (width - 16) / 3;
const per4Screen = (width - 16) / 4;
const per2Dot5Screen = (width - 16) / 2.5;

export default class SecurityDetails extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            isLoading: this.props.isLoading || false
        };
        this.state = {};

        this.subChangePriceObject();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    subChangePriceObject() {
        const channel = this.props.channelAllPrice;
        Emitter.addListener(channel, this.id, (priceObject) => {
            this.dic.priceObject = priceObject;
            this.setState({});
        });
    }

    isPriceChange(oldData, newData, keyObj) {
        return (
            (oldData === undefined ||
                oldData === null ||
                oldData[keyObj] === undefined ||
                oldData[keyObj] === null ||
                oldData[keyObj] !== newData[keyObj]) &&
            newData[keyObj] !== undefined &&
            newData[keyObj] !== null
        );
    }

    formatPrice({ value, isLoading, keyObj, label, isLargeValue = false, decimal = 4 }) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4
                }}
            >
                <Text style={CommonStyle.textAlert}>{label}</Text>
                {/* // Khi ap dung thang nay. Trong truong hop dung lap de render ra cac view bi anh huong perform. Tam thoi revert de tim hieu them */}
                {/* <ViewLoadingReAni isLoading={isLoading} styleContainer={{ alignSelf: 'flex-start' }}>
                    <Text style={[CommonStyle.textnumberNewAlert, {
                        fontSize: CommonStyle.fontSizeXS,
                        fontWeight: '500'
                    }]}>
                        {
                            isLoading
                                ? value[keyObj] === undefined || value[keyObj] === null ? '--' : isLargeValue
                                    ? `${FunctionUtil.largeValue(value[keyObj])}`
                                    : `${FunctionUtil.formatNumberNew2(value[keyObj], 4)}`
                                : value[keyObj] === undefined || value[keyObj] === null
                                    ? '--'
                                    : isLargeValue
                                        ? `${FunctionUtil.largeValue(value[keyObj])}`
                                        : `${FunctionUtil.formatNumberNew2(value[keyObj], 4)}`
                        }
                    </Text>
                </ViewLoadingReAni> */}
                <TextLoading
                    isLoading={isLoading}
                    styleViewLoading={{
                        alignSelf: 'flex-start'
                    }}
                    formatTextAbs={'00.0000'}
                    style={[
                        CommonStyle.textnumberNewAlert,
                        {
                            fontSize: CommonStyle.fontSizeXS,
                            fontWeight: '500'
                        }
                    ]}
                >
                    {isLoading
                        ? ''
                        : value[keyObj] === undefined || value[keyObj] === null
                            ? '--'
                            : isLargeValue
                                ? `${FunctionUtil.largeValue(value[keyObj])}`
                                : `${FunctionUtil.formatNumberNew2(value[keyObj], decimal)}`}
                </TextLoading>
            </View>
        );
    }

    formatText({ value, isLoading, keyObj, label }) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Text style={CommonStyle.textAlert}>{label}</Text>
                <Text
                    style={[
                        CommonStyle.textSubDark,
                        {
                            fontSize: CommonStyle.fontSizeXS,
                            fontWeight: '500'
                        }
                    ]}
                >
                    {isLoading
                        ? '--'
                        : value === undefined || value === null
                            ? '--'
                            : value}
                </Text>
            </View>
        );
    }

    /* #region Equity/ETF/MF */
    renderEquityEtfMfPart1() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingRight: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailBidPrice')}
                    keyObj={'bid_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailBidSize')}
                    keyObj={'bid_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferPrice')}
                    keyObj={'ask_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferSize')}
                    keyObj={'ask_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderEquityEtfMfPart2() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailOpen')}
                    keyObj={'open'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailHigh')}
                    keyObj={'high'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailLow')}
                    keyObj={'low'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                {/* <PricePiece
                label={I18n.t('securityDetailPClose')}
                keyObj={'previous_close'}
                value={this.dic.priceObject}
                channelLoading={this.props.channelLoading}
                channelPrice={this.props.channelPrice}
                isLoading={this.props.isLoading}
                isValueChange={this.isPriceChange}
                formatFunc={this.formatPrice} /> */}
                <PricePiece
                    label={I18n.t('securityDetailClose')}
                    keyObj={'close'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderEquityEtfMfPart3() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                {/* <PricePiece
                label={I18n.t('securityDetailClose')}
                keyObj={'close'}
                value={this.dic.priceObject}
                channelLoading={this.props.channelLoading}
                channelPrice={this.props.channelPrice}
                isLoading={this.props.isLoading}
                isValueChange={this.isPriceChange}
                formatFunc={this.formatPrice} /> */}

                <PricePiece
                    label={I18n.t('securityDetailTodayVolume')}
                    keyObj={'volume'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailMktVwap')}
                    keyObj={'market_vwap'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailTotalVwap')}
                    keyObj={'total_vwap'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
                <PricePiece
                    label={I18n.t('securityDetailTotalValue')}
                    keyObj={'total_value'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }

    renderEquityEtfMfPart4() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                {/* <PricePiece
                label={I18n.t('securityDetailTotalValue')}
                keyObj={'total_value'}
                isLargeValue={true}
                value={this.dic.priceObject}
                channelLoading={this.props.channelLoading}
                channelPrice={this.props.channelPrice}
                isLoading={this.props.isLoading}
                isValueChange={this.isPriceChange}
                formatFunc={this.formatPrice} /> */}

                <PricePiece
                    label={I18n.t('securityDetailTotalVolume')}
                    keyObj={'total_volume'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                {this.formatText({
                    value: this.dic.priceObject.security_status,
                    isLoading: false,
                    label: I18n.t('securityDetailStatus')
                })}

                {this.formatText({
                    value: this.dic.priceObject.quotation_basis_code,
                    isLoading: false,
                    label: I18n.t('securityDetailQuotation')
                })}
                <PricePiece
                    label={I18n.t('securityDetailIndicativePrice')}
                    keyObj={'indicative_price'}
                    value={this.dic.priceObject}
                    decimal={PRICE_DECIMAL.VALUE}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }

    renderEquityEtfMfPart5() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen + 60,
                        paddingHorizontal: 8,
                        borderRightWidth: 0,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                {/* <PricePiece
                label={I18n.t('securityDetailIndicativePrice')}
                keyObj={'indicative_price'}
                value={this.dic.priceObject}
                channelLoading={this.props.channelLoading}
                channelPrice={this.props.channelPrice}
                isLoading={this.props.isLoading}
                isValueChange={this.isPriceChange}
                formatFunc={this.formatPrice} /> */}

                <PricePiece
                    label={I18n.t('securityDetailSurplusVolume')}
                    keyObj={'surplus_volume'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailMatchPctMovement')}
                    keyObj={'match_pct_movement'}
                    value={this.dic.priceObject}
                    decimal={PRICE_DECIMAL.VALUE}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailMatchMovement')}
                    keyObj={'match_movement'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    /* #endregion */

    /* #region Futures */
    renderFuturesPart1() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingRight: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailBidPrice')}
                    keyObj={'bid_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailBidSize')}
                    keyObj={'bid_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferPrice')}
                    keyObj={'ask_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferSize')}
                    keyObj={'ask_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderFuturesPart2() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailOpen')}
                    keyObj={'open'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailHigh')}
                    keyObj={'high'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailLow')}
                    keyObj={'low'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailPClose')}
                    keyObj={'previous_close'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderFuturesPart3() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailClose')}
                    keyObj={'close'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailTodayVolume')}
                    keyObj={'volume'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailSettlementPrice')}
                    keyObj={'settlement_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                {this.formatText({
                    value: '--',
                    isLoading: false,
                    label: I18n.t('securityDetailExpire')
                })}
            </View>
        );
    }
    /* #endregion */

    /* #region  Warrant/Option */
    renderWarrantOptionPart1() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingRight: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                {this.formatText({
                    value: this.dic.priceObject.displayName,
                    isLoading: false,
                    label: I18n.t('securityDetailUAsset')
                })}
                {this.formatText({
                    value: '--',
                    isLoading: false,
                    label: I18n.t('securityDetailPC')
                })}
                {this.formatText({
                    value: '--',
                    isLoading: false,
                    label: I18n.t('securityDetailStrike')
                })}
                {this.formatText({
                    value: '--',
                    isLoading: false,
                    label: I18n.t('securityDetailExpire')
                })}
            </View>
        );
    }
    renderWarrantOptionPart2() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailBidPrice')}
                    keyObj={'bid_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailBidSize')}
                    keyObj={'bid_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferPrice')}
                    keyObj={'ask_price'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailOfferSize')}
                    keyObj={'ask_size'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderWarrantOptionPart3() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailOpen')}
                    keyObj={'open'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailHigh')}
                    keyObj={'high'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailLow')}
                    keyObj={'low'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailPClose')}
                    keyObj={'previous_close'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    renderWarrantOptionPart4() {
        return (
            <View
                style={[
                    {
                        minWidth: per2Dot5Screen,
                        paddingHorizontal: 8,
                        borderRightWidth: 1,
                        borderRightColor: CommonStyle.fontBorderGray
                    }
                ]}
            >
                <PricePiece
                    label={I18n.t('securityDetailClose')}
                    keyObj={'close'}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />

                <PricePiece
                    label={I18n.t('securityDetailTodayVolume')}
                    keyObj={'volume'}
                    isLargeValue={true}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading}
                    isValueChange={this.isPriceChange}
                    formatFunc={this.formatPrice}
                />
            </View>
        );
    }
    /* #endregion */

    renderPart1() {
        return this.renderEquityEtfMfPart1();
        // const { symbolClass } = this.dic.priceObject
        // switch (symbolClass) {
        //     case SYMBOL_CLASS.EQUITY:
        //     case SYMBOL_CLASS.ETFS:
        //     case SYMBOL_CLASS.MF:
        //         return this.renderEquityEtfMfPart1()
        //     case SYMBOL_CLASS.FUTURE:
        //         return this.renderFuturesPart1()
        //     default:
        //         return this.renderWarrantOptionPart1()
        // }
    }

    renderPart2() {
        return this.renderEquityEtfMfPart2();
        // const { symbolClass } = this.dic.priceObject
        // switch (symbolClass) {
        //     case SYMBOL_CLASS.EQUITY:
        //     case SYMBOL_CLASS.ETFS:
        //     case SYMBOL_CLASS.MF:
        //         return this.renderEquityEtfMfPart2()
        //     case SYMBOL_CLASS.FUTURE:
        //         return this.renderFuturesPart2()
        //     default:
        //         return this.renderWarrantOptionPart2()
        // }
    }

    renderPart3() {
        return this.renderEquityEtfMfPart3();
        // const { symbolClass } = this.dic.priceObject
        // switch (symbolClass) {
        //     case SYMBOL_CLASS.EQUITY:
        //     case SYMBOL_CLASS.ETFS:
        //     case SYMBOL_CLASS.MF:
        //         return this.renderEquityEtfMfPart3()
        //     case SYMBOL_CLASS.FUTURE:
        //         return this.renderFuturesPart3()
        //     default:
        //         return this.renderWarrantOptionPart3()
        // }
    }

    renderPart4() {
        return this.renderEquityEtfMfPart4();
        // const { symbolClass } = this.dic.priceObject
        // switch (symbolClass) {
        //     case SYMBOL_CLASS.EQUITY:
        //     case SYMBOL_CLASS.ETFS:
        //     case SYMBOL_CLASS.MF:
        //         return null
        //     case SYMBOL_CLASS.FUTURE:
        //         return null
        //     default:
        //         return this.renderWarrantOptionPart4()
        // }
    }

    renderPart5() {
        return this.renderEquityEtfMfPart5();
        // const { symbolClass } = this.dic.priceObject
        // switch (symbolClass) {
        //     case SYMBOL_CLASS.EQUITY:
        //     case SYMBOL_CLASS.ETFS:
        //     case SYMBOL_CLASS.MF:
        //         return null
        //     case SYMBOL_CLASS.FUTURE:
        //         return null
        //     default:
        //         return this.renderWarrantOptionPart4()
        // }
    }

    setScrollRef = this.setScrollRef.bind(this);
    setScrollRef(sef) {
        if (sef) {
            this._scrollView = sef;
        }
    }

    scrollToTop = this.scrollToTop.bind(this);
    scrollToTop() {
        if (this._scrollView) {
            this._scrollView.scrollTo({ x: 0, y: 0, animated: false });
        }
    }

    render() {
        return (
            <ScrollView
                ref={this.setScrollRef}
                showsHorizontalScrollIndicator={false}
                horizontal
                style={{ width: width - 16, marginLeft: 16, marginVertical: 8 }}
            >
                <View style={{ flexDirection: 'row' }}>
                    {this.renderPart1()}
                    {this.renderPart2()}
                    {this.renderPart3()}
                    {this.renderPart4()}
                    {this.renderPart5()}
                    <View style={{ width: 8 }} />
                </View>
            </ScrollView>
        );
    }
}

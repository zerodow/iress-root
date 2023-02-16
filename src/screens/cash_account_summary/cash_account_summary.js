import React, { Component } from 'react';
import { View, Text, Picker, Item, ScrollView, PixelRatio } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import styles from './style/cash_account_summary.style';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as cashAccountSummary from './cash_account_summary.actions';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import ProgressBar from '../../modules/_global/ProgressBar';
import {
    MKTextField,
    MKColor
} from 'react-native-material-kit';
import I18n from '../../modules/language/';
import { formatNumber, formatNumberNew2, renderTime } from '../../lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from './../../config';
import { ReportHeader } from './../financial/financial';
import RowData from '../../component/row_data/row_data'
import { getDateStringWithFormat, convertToDate, addDaysToTime } from '../../lib/base/dateTime';
import Perf from '../../lib/base/performance_monitor';
import RetryConnect from '../../component/retry_connect/retry_connect';
import loginUserType from '../../constants/login_user_type'
import { dataStorage } from '../../storage';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import * as Util from '../../util';
import Enum from '../../enum';

const envConfig = config.environment
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
export class CashAccountSummary extends Component {
    constructor(props) {
        super(props);
                this.perf = new Perf(performanceEnum.cash_account_summary);
        this.loading = true;
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.getData = this.getData.bind(this);
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'back_button':
                    this.props.navigator.pop({
                        animated: true,
                        animationType: 'slide-horizontal'
                    });
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    break;
                case 'didAppear':
                    setCurrentScreen(analyticsEnum.reportCashSummary);
                    this.perf && this.perf.incrementCounter(performanceEnum.cash_account_summary);
                    this.getData();
                    break;
                case 'willDisappear':
                    this.loading = true;
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }

    getData() {
        const now = new Date().getTime();
        const fromDate = convertToDate(this.props.fromDate).getTime();
        const toDate = convertToDate(this.props.toDate).getTime();

        const from = convertToDate(this.props.fromDate);
        const to = convertToDate(this.props.toDate);
        const addToDate = addDaysToTime(to, 1);
        this.fromDate = this.props.fromDate
        this.toDate = this.props.toDate

        this.loading = true;
        this.props.actions.loadDataFrom(this.fromDate, this.toDate, now);
    }

    componentWillReceiveProps() {
        this.loading = this.props.cashAccountSummary.is_loading;
    }

    render() {
        let objRightText = {
            color: CommonStyle.fontColor,
            opacity: 1
        };
        if (this.props.cashAccountSummary.dataAccount.netTradeFlow < 0) {
            objRightText = {
                color: CommonStyle.fontRed,
                opacity: 1
            };
        }
        if (this.props.cashAccountSummary.dataAccount.netTradeFlow > 0) {
            objRightText = {
                color: CommonStyle.fontGreen,
                opacity: 1
            };
        }
        if (this.loading) {
            this.perf.stop();
        }
        const loading = (
            <View style={{
                backgroundColor: CommonStyle.backgroundColor,
                width: '100%',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <ProgressBar />
            </View>);
        if (this.loading) {
            if (!this.props.isConnected) {
                return (
                    <RetryConnect onPress={() => this.getData()} />
                );
            }
            return loading;
        }
        return (
            <View testID='cashAccountReport' style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                <ScrollView testID='cashReportScrollView' showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    <ReportHeader reportName={I18n.t('cashAccountSummary', { locale: this.props.setting.lang })} fromDate={this.props.fromDate} toDate={this.props.toDate} />
                    {
                        dataStorage.loginUserType === loginUserType.REVIEW ? null : (
                            <View style={{ paddingBottom: 100 }}>
                                <RowData leftText={I18n.t('cashInfoSop', { locale: this.props.setting.lang })}
                                    height={48}
                                    testID='cashAccountReportSOP'
                                    widthLeft={'65%'}
                                    widthRight={'35%'}
                                    rightText={formatNumberNew2(this.props.cashAccountSummary.dataAccount.cashSOP, PRICE_DECIMAL.VALUE)}
                                    styleLeft={[CommonStyle.text, { opacity: 1 }]}
                                    styleRight={[CommonStyle.text, { opacity: 1 }]}
                                    backgroundColor={CommonStyle.colorHeader} />
                                {
                                    this.props.cashAccountSummary.dataDetail.map((e, i) =>
                                        <RowData
                                            key={e.updated}
                                            leftText={renderTime(e.updated, 'DD MMM YYYY', false)}
                                            widthLeft={'50%'}
                                            widthRight={'50%'}
                                            hasBorder={i < this.props.cashAccountSummary.dataDetail.length - 1}
                                            rightText={formatNumberNew2(e.value, PRICE_DECIMAL.VALUE)} />)
                                }

                                {
                                    <RowData leftText={I18n.t('netTradeFlows', { locale: this.props.setting.lang })}
                                        height={48}
                                        testID='cashAccountReportNTF'
                                        widthLeft={'50%'}
                                        widthRight={'50%'}
                                        styleRight={objRightText}
                                        rightText={formatNumberNew2(this.props.cashAccountSummary.dataAccount.netTradeFlow, PRICE_DECIMAL.VALUE)}
                                        backgroundColor={CommonStyle.backgroundColor} />
                                }

                                {
                                    <View style={CommonStyle.borderBelow}></View>
                                }

                                {
                                    <RowData leftText={I18n.t('totalFees', { locale: this.props.setting.lang })}
                                        height={48}
                                        widthLeft={'50%'}
                                        widthRight={'50%'}
                                        styleRight={{ color: CommonStyle.fontColor, opacity: 1 }}
                                        rightText={formatNumberNew2(this.props.cashAccountSummary.dataAccount.totalFees, PRICE_DECIMAL.VALUE)}
                                        backgroundColor={CommonStyle.backgroundColor} />
                                }

                                <RowData leftText={I18n.t('cashInfoEop', { locale: this.props.setting.lang })}
                                    height={48}
                                    testID='cashAccountReportEOP'
                                    widthLeft={'65%'}
                                    widthRight={'35%'}
                                    rightText={formatNumberNew2(this.props.cashAccountSummary.dataAccount.cashEOP, PRICE_DECIMAL.VALUE)}
                                    styleLeft={[CommonStyle.text, { opacity: 1 }]}
                                    styleRight={[CommonStyle.text, { opacity: 1 }]}
                                    backgroundColor={CommonStyle.colorHeader} />
                            </View>
                        )
                    }
                </ScrollView>
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        cashAccountSummary: state.cashAccountSummary,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(cashAccountSummary, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CashAccountSummary);

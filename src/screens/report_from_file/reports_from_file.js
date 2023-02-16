import React, { Component } from 'react';
import {
    View,
    Platform,
    Text,
    PermissionsAndroid,
    StatusBar,
    UIManager,
    LayoutAnimation,
    TouchableOpacity,
    Animated
} from 'react-native';
import ENUM from '../../enum';
import ScreenId from '../../constants/screen_id';
import I18n from '../../modules/language/';
import config from '../../config';
import { iconsMap } from '../../utils/AppIcons';
import { dataStorage, func } from '../../storage';
import * as FuncUtil from '../../lib/base/functionUtil';
import * as InvertTranslate from '../../invert_translate';

// Component
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import DatePicker from '~/component/date_picker/date_picker';
import FinancialTransactionsReport from './financial_transaction_report';
import TradeActivityReport from './trade_activity_report';
import PortfolioValuationReport from './portfolio_valuation_report';
import ModalPicker from '~s/modal_picker';
import XComponent from '../../component/xComponent/xComponent';
import CommonStyle, { register } from '~/theme/theme_controller';
import BottomTabBar from '~/component/tabbar';
import TransitionView from '~/component/animation_component/transition_view';
import FallHeader from '~/component/fall_header';
import Header from '~/component/headerNavBar';
import CustomIcon from '~/component/Icon';
import Icons from '~/component/headerNavBar/icon';
import CustomDate from '~/component/customDate';
import * as timeUtils from '~/lib/base/dateTime';
import DebonceButton from '~/component/debounce_button';
const { REPORT_FROM_FILE_TYPE } = ENUM;
const NewTouchableOpacity = DebonceButton(TouchableOpacity);
export default class ReportFromFile extends XComponent {
    constructor(props) {
        super(props);

        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.init = this.init.bind(this);
        this.bindAllFunc();
        this.init();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental &&
                UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    bindAllFunc() {
        this.updateDuration = this.updateDuration.bind(this);
        this.onLayoutModal = this.onLayoutModal.bind(this);
        // this.sharePdf = this.sharePdf.bind(this)
        this.renderLoading = this.renderLoading.bind(this);
        this.onPressMenu = this.onPressMenu.bind(this);
        this.renderNoData = this.renderNoData.bind(this);
        this.onDidAppear = this.onDidAppear.bind(this);
        this.onShowReportType = this.onShowReportType.bind(this);
        this.onCloseReportType = this.onCloseReportType.bind(this);
        this.onSelectedReport = this.onSelectedReport.bind(this);
        this.enableSharePdf = this.enableSharePdf.bind(this);
        this.disableSharePdf = this.disableSharePdf.bind(this);
        this.requestReadPermission = this.requestReadPermission.bind(this);
        this.allowSharePdf = this.allowSharePdf.bind(this);
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.updateSharePermission = this.updateSharePermission.bind(this);
        this.updateWriteData = this.updateWriteData.bind(this);
        this.reloadDataAfterChangeAccount = this.reloadDataAfterChangeAccount.bind(
            this
        );
        dataStorage.loadData = this.reloadDataAfterChangeAccount;
    }

    init() {
        const date = new Date().getDate();
        this.dic = {
            duration: {
                [ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY]: {
                    value: ENUM.REPORT_DURATION1.Day,
                    fromDate: FuncUtil.getStartDay(-1),
                    toDate: FuncUtil.getEndDay(-1)
                },
                [ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS]: {
                    value: ENUM.REPORT_DURATION1.Day,
                    fromDate: FuncUtil.getStartDay(-1),
                    toDate: FuncUtil.getEndDay(-1)
                },
                // eslint-disable-next-line standard/computed-property-even-spacing
                [ENUM.REPORT_FROM_FILE_TYPE
                    .PORTFOLIO_VALUATION]: FuncUtil.getEndDay(-1)
            },
            listDuration: [
                ENUM.REPORT_DURATION1.Day,
                ENUM.REPORT_DURATION1.Week,
                ENUM.REPORT_DURATION1.Month,
                ENUM.REPORT_DURATION1.Quarter1,
                ENUM.REPORT_DURATION1.Month6,
                ENUM.REPORT_DURATION1.Year
            ],
            writeDataSuccess: false,
            isFullPermission: false,
            listReportType: Object.keys(REPORT_FROM_FILE_TYPE).map((key) =>
                I18n.t(REPORT_FROM_FILE_TYPE[key])
            )
        };
        this.state = {
            visible: false,
            reportType: ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
        };
    }

    updateDuration(duration, type) {
        this.dic.duration[type] = duration;
        this.setState({});
    }

    reloadDataAfterChangeAccount() {
        let ref = this.dic.financialRef;
        if (
            this.state.reportType === ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
        ) {
            ref = this.dic.tradeRef;
        } else if (
            this.state.reportType ===
            ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
        ) {
            ref = this.dic.portfolioRef;
        }
        ref && ref.reloadData && ref.reloadData();
    }

    async requestReadPermission() {
        try {
            let isFullPermission = true;
            if (Platform.OS === 'ios') {
                return this.updateSharePermission(isFullPermission);
                // return this.enableSharePdf()
            }
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ]);
            for (const key in granted) {
                const val = granted[key];
                if (val !== 'granted') {
                    isFullPermission = false;
                    break;
                }
            }
            this.updateSharePermission(isFullPermission);
            // return this.enableSharePdf()
        } catch (err) {
            console.log(err);
        }
    }

    updateSharePermission(status) {
        this.dic.isFullPermission = status;
    }

    updateWriteData(status) {
        this.dic.writeDataSuccess = status;
    }

    allowSharePdf(isFullPermission) {
        this.dic.canSharePDF = isFullPermission;
        this.enableSharePdf();
    }

    sharePdf = () => {
        let ref = this.dic.financialRef;
        if (
            this.state.reportType === ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
        ) {
            ref = this.dic.tradeRef;
        } else if (
            this.state.reportType ===
            ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
        ) {
            ref = this.dic.portfolioRef;
        }
        console.log('hoang', ref);
        ref && ref.sharePdf();
    };

    enableSharePdf() {
        if (this.dic.writeDataSuccess && this.dic.isFullPermission) {
            this.props.navigator.setButtons({
                rightButtons: [
                    {
                        testID: 'ReportFromFileFilterIcon',
                        id: 'report_from_file_filter',
                        icon: iconsMap['ios-funnel-outline']
                    },
                    {
                        testID: 'ReportFromFileShareIcon',
                        id: 'report_from_file_share',
                        icon: iconsMap['ios-share-outline']
                    }
                ]
            });
        }
    }

    disableSharePdf() {
        this.props.navigator.setButtons({
            rightButtons: [
                {
                    testID: 'ReportFromFileFilterIcon',
                    id: 'report_from_file_filter',
                    icon: iconsMap['ios-funnel-outline']
                },
                {
                    testID: 'ReportFromFileShareIcon',
                    id: 'report_from_file_share',
                    icon: iconsMap['ios-share-outline'],
                    disabled: true,
                    disabledColor: '#bbb'
                }
            ]
        });
    }

    onShowReportType() {
        this.setState({
            visible: true
        });
    }

    onCloseReportType() {
        this.setState({
            visible: false
        });
    }
    getCurrentRefReport = () => {
        let ref = this.dic.financialRef;
        if (
            this.state.reportType === ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
        ) {
            ref = this.dic.tradeRef;
        } else if (
            this.state.reportType ===
            ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
        ) {
            ref = this.dic.portfolioRef;
        }
        return ref;
    };
    onSelectedReport(selected) {
        const reportType = InvertTranslate.getKeyTranslate(selected);
        let ref = this.dic.financialRef;
        if (
            this.state.reportType === ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
        ) {
            ref = this.dic.tradeRef;
        } else if (
            this.state.reportType ===
            ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
        ) {
            ref = this.dic.portfolioRef;
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        this.setState({
            reportType,
            visible: false
        });
    }

    renderNoData() {
        return (
            <TransitionView
                animation={'fadeIn'}
                index={2}
                style={{
                    backgroundColor: CommonStyle.backgroundColor1,
                    flex: 1,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: CommonStyle.heightTabbar
                }}
            >
                <Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>
            </TransitionView>
        );
    }

    renderLoading() {
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor1,
                    flex: 1,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: CommonStyle.heightTabbar
                }}
            >
                <Text style={CommonStyle.textNoData}>
                    {I18n.t('notAvailabel')}
                </Text>
            </View>
        );
    }

    renderFinancialReport() {
        return (
            <FinancialTransactionsReport
                updateWriteData={this.updateWriteData}
                renderNoData={this.renderNoData}
                renderLoading={this.renderLoading}
                enableSharePdf={this.enableSharePdf}
                disableSharePdf={this.disableSharePdf}
                updateDuration={this.updateDuration}
                duration={
                    // eslint-disable-next-line standard/computed-property-even-spacing
                    this.dic.duration[
                        ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS
                    ]
                }
                ref={(ref) => (this.dic.financialRef = ref)}
                onPressMenu={this.onPressMenu}
                onLayoutModal={this.onLayoutModal}
                showModal={this.onShowReportType}
                sharePdf={this.sharePdf}
            />
        );
    }

    renderTradeReport() {
        return (
            <TradeActivityReport
                updateWriteData={this.updateWriteData}
                enableSharePdf={this.enableSharePdf}
                renderNoData={this.renderNoData}
                renderLoading={this.renderLoading}
                disableSharePdf={this.disableSharePdf}
                updateDuration={this.updateDuration}
                duration={
                    this.dic.duration[ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY]
                }
                ref={(ref) => {
                    this.dic.tradeRef = ref && ref;
                }}
                onLayoutModal={this.onLayoutModal}
                onPressMenu={this.onPressMenu}
                showModal={this.onShowReportType}
                sharePdf={this.sharePdf}
            />
        );
    }

    renderPortfolioReport() {
        return (
            <PortfolioValuationReport
                updateWriteData={this.updateWriteData}
                renderNoData={this.renderNoData}
                renderLoading={this.renderLoading}
                enableSharePdf={this.enableSharePdf}
                duration={
                    // eslint-disable-next-line standard/computed-property-even-spacing
                    this.dic.duration[
                        ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
                    ]
                }
                disableSharePdf={this.disableSharePdf}
                updateDuration={this.updateDuration}
                onLayoutModal={this.onLayoutModal}
                ref={(ref) => (this.dic.portfolioRef = ref)}
                onPressMenu={this.onPressMenu}
                showModal={this.onShowReportType}
                sharePdf={this.sharePdf}
            />
        );
    }

    onLayoutModal({ nativeEvent: { layout } }, component) {
        component &&
            component.measure((fx, fy, width, height, px, py) => {
                this.modalPosition = { fx, fy, width, height, px, py };
            });
    }

    onPressMenu() {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true
        });
    }

    onDidAppear() {
        func.setCurrentScreenId(ScreenId.REPORT_FROM_FILE);
        this.props.navigator.setButtons({
            rightButtons: [
                {
                    testID: 'ReportFromFileFilterIcon',
                    id: 'report_from_file_filter',
                    icon: iconsMap['ios-funnel-outline']
                },
                {
                    testID: 'ReportFromFileShareIcon',
                    id: 'report_from_file_share',
                    icon: iconsMap['ios-share-outline'],
                    disabledColor: '#bbb'
                }
            ],
            leftButtons:
                Platform.OS === 'ios'
                    ? [
                          {
                              title: 'menu',
                              id: 'menu_ios',
                              icon: iconsMap['md-menu'],
                              testID: 'menu_ios'
                          }
                      ]
                    : [
                          {
                              id: 'sideMenu'
                          }
                      ]
        });
        this.requestReadPermission();
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            FuncUtil.switchForm(this.props.navigator, event);
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'report_from_file_share':
                    return this.sharePdf();
                case 'report_from_file_filter':
                    return this.onShowReportType();
                case 'menu_ios':
                    return this.onPressMenu();
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    break;
                case 'didAppear':
                    FuncUtil.setRefTabbar(this.tabbar);
                    if (dataStorage.isChangeAccount) {
                        dataStorage.isChangeAccount = false;
                    }
                    return this.onDidAppear();
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }
    openMenu = () => {
        this.onPressMenu && this.onPressMenu();
    };
    sharePdf = () => {
        const refReport = this.getCurrentRefReport();
        refReport && refReport.sharePdf && refReport.sharePdf();
    };
    renderRightComp = () => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    backgroundColor: 'transparent'
                }}
            >
                <TouchableOpacity onPress={this.onShowReportType}>
                    <CustomIcon
                        name="equix_file"
                        onPress={this.onShowReportType}
                        style={{ paddingHorizontal: 16 }}
                        size={20}
                        color={CommonStyle.fontWhite}
                    />
                </TouchableOpacity>
                {/* <Icons styles={{ paddingRight: 16 }} name="md-download" onPress={this.sharePdf} /> */}
                <CustomIcon
                    name="equix_download"
                    onPress={this.sharePdf}
                    style={{ paddingHorizontal: 16 }}
                    size={20}
                    color={CommonStyle.fontWhite}
                />
            </View>
        );
    };
    renderLeftComp = () => {
        return (
            <View style={{ left: -14 }}>
                <Icons
                    styles={{ paddingRight: 6 }}
                    name="ios-menu"
                    onPress={this.openMenu}
                    size={34}
                />
            </View>
        );
    };
    getDurationByTypeReportPortfolioValuation = () => {
        // eslint-disable-next-line standard/computed-property-even-spacing
        return this.dic.duration[
            ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
        ];
    };
    handleDatePicked = (date, callback) => {
        this.dic.portfolioRef &&
            this.dic.portfolioRef.handleDatePicked &&
            this.dic.portfolioRef.handleDatePicked(date, callback);
    };
    getFromToDateByTypeReport = () => {
        switch (this.state.reportType) {
            case ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
                // eslint-disable-next-line standard/computed-property-even-spacing
                return this.dic.duration[
                    ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
                ];
                break;
            case ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
                // eslint-disable-next-line standard/computed-property-even-spacing
                return this.dic.duration[
                    ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS
                ];
                break;
            default:
                return {};
        }
    };
    applyDate = (fromDate, toDate) => {
        const ref = this.getCurrentRefReport();
        ref && ref.applyDate && ref.applyDate(fromDate, toDate);
    };
    renderDate = () => {
        const { fromDate, toDate } = this.getFromToDateByTypeReport();
        return (
            <CustomDate
                maximumDate={new Date(FuncUtil.getEndDay(-1))}
                fromDate={fromDate}
                toDate={toDate}
                applyDate={this.applyDate}
            />
        );
    };
    showDatePicker = () => {
        this.dic.datePickerRef && this.dic.datePickerRef.showDatePicker();
    };
    renderDatePortfolio = () => {
        return (
            <View>
                <Text
                    style={{
                        opacity: 0.25,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font10,
                        color: CommonStyle.fontWhite
                    }}
                >
                    {I18n.t('date')}
                </Text>
                <View>
                    <DatePicker
                        check={true}
                        date={this.getDurationByTypeReportPortfolioValuation()}
                        ref={(ref) => (this.dic.datePickerRef = ref)}
                        handleDatePicked={this.handleDatePicked}
                        maximumDate={timeUtils.addDaysToTime(Date.now(), -1)}
                        wrapperTextStyle={{
                            flex: 1,
                            alignItems: 'flex-start'
                        }}
                    />
                </View>
            </View>
        );
    };
    getTitleHeader = () => {
        switch (this.state.reportType) {
            case ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
                return I18n.t('tradeActivity');
                break;
            case ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
                return I18n.t('financialTransactions');
                break;
            default:
                return I18n.t('portfolioValuation');
                break;
        }
    };
    checkActiveDuration = (item) => {
        const ref = this.getCurrentRefReport();
        switch (this.state.reportType) {
            case ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
                return (
                    // eslint-disable-next-line standard/computed-property-even-spacing
                    this.dic.duration[
                        ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
                    ]['value'] === item
                );
                break;
            case ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
                return (
                    // eslint-disable-next-line standard/computed-property-even-spacing
                    this.dic.duration[
                        ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS
                    ]['value'] === item
                );
                break;
            default:
                return false;
                break;
        }
    };
    setDuration = (item) => {
        const ref = this.getCurrentRefReport();
        ref && ref.setDuration && ref.setDuration(item);
    };
    renderLineActive = (item) => {
        if (this.checkActiveDuration(item, true)) {
            return (
                <View
                    style={{
                        transform: [{ translateY: -24 }],
                        width: 20,
                        position: 'absolute',
                        height: 4,
                        borderRadius: 4,
                        backgroundColor: CommonStyle.color.modify
                    }}
                ></View>
            );
        }
        return <View />;
    };
    getLabelDuration = (item) => {
        let result = I18n.t(item === 'day' ? 'day' : item);
        return result;
    };
    renderDuration = () => {
        return (
            <View
                style={[
                    CommonStyle.chartOption,
                    { paddingLeft: 16, marginTop: 8, marginBottom: 0 }
                ]}
                testID="durationRepostsFromFile"
            >
                {this.dic.listDuration.map((item, i) => {
                    return (
                        <View
                            style={{
                                height: 30,
                                flex: 1,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {this.renderLineActive(item)}
                            <NewTouchableOpacity
                                testID={`duration${i}`}
                                key={item}
                                onPress={() => this.setDuration(item)}
                            >
                                <Text
                                    style={[
                                        this.checkActiveDuration(item)
                                            ? CommonStyle.textFilterSelected
                                            : CommonStyle.textFilter,
                                        {
                                            color: this.checkActiveDuration(
                                                item
                                            )
                                                ? CommonStyle.colorProduct
                                                : CommonStyle.fontWhite,
                                            opacity: this.checkActiveDuration(
                                                item
                                            )
                                                ? 1
                                                : 0.5
                                        }
                                    ]}
                                >
                                    {this.getLabelDuration(item)}
                                </Text>
                            </NewTouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };
    getContentHeader = () => {
        switch (this.state.reportType) {
            case ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
                return (
                    <React.Fragment>
                        {this.renderDuration()}
                        <View
                            style={{
                                width: '100%',
                                height: 66,
                                paddingHorizontal: 32,
                                paddingVertical: 12,
                                justifyContent: 'center',
                                borderBottomRightRadius: 35
                            }}
                        >
                            {this.renderDate()}
                        </View>
                    </React.Fragment>
                );
                break;
            case ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
                return (
                    <React.Fragment>
                        {this.renderDuration()}
                        <View
                            style={{
                                height: 66,
                                width: '100%',
                                paddingHorizontal: 32,
                                paddingVertical: 12,
                                justifyContent: 'center'
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    position: 'absolute',
                                    left: 32,
                                    right: 50,
                                    zIndex: 999
                                }}
                            >
                                {this.renderDate()}
                            </View>
                        </View>
                    </React.Fragment>
                );
            default:
                return (
                    <React.Fragment>
                        <View
                            style={{
                                width: '100%',
                                paddingLeft: 32,
                                paddingVertical: 8,
                                justifyContent: 'center'
                            }}
                        >
                            {this.renderDatePortfolio()}
                        </View>
                    </React.Fragment>
                );
                break;
        }
    };
    render() {
        const { reportType } = this.state;
        let report = this.renderPortfolioReport();
        switch (reportType) {
            case ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
                report = this.renderTradeReport();
                break;
            case ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
                report = this.renderFinancialReport();
                break;
        }
        return (
            <FallHeader
                animation="fadeIn"
                setRef={(ref) => (this.refHeader = ref)}
                style={{ backgroundColor: CommonStyle.backgroundColor1 }}
                header={
                    <Header
                        leftIcon={'ios-menu'}
                        mainStyle={{
                            flex: 1,
                            lineHeight: CommonStyle.fontSizeXXL * 2
                        }}
                        title={this.getTitleHeader()}
                        style={{ paddingTop: 16 }}
                        renderRightComp={this.renderRightComp}
                        renderLeftComp={this.renderLeftComp}
                        rightStyles={{
                            backgroundColor: 'transparent',
                            flex: 0
                        }}
                    >
                        {this.getContentHeader()}
                    </Header>
                }
            >
                {this.state.reportType ===
                ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
                    ? this.renderTradeReport()
                    : this.state.reportType ===
                      ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS
                    ? this.renderFinancialReport()
                    : this.renderPortfolioReport()}
                <ModalPicker
                    testID="NewsModalPicker"
                    position={this.modalPosition}
                    listItem={this.dic.listReportType}
                    onSelected={this.onSelectedReport}
                    selectedItem={I18n.t(this.state.reportType)}
                    visible={this.state.visible}
                    animationType="fade"
                    title={I18n.t('selectReportType')}
                    onClose={this.onCloseReportType}
                />
                <BottomTabBar
                    navigator={this.props.navigator}
                    ref={(ref) => {
                        this.tabbar = ref;
                        FuncUtil.setRefTabbar(ref);
                    }}
                />
            </FallHeader>
        );
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor
                }}
            >
                {this.state.reportType ===
                ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
                    ? this.renderTradeReport()
                    : this.state.reportType ===
                      ENUM.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS
                    ? this.renderFinancialReport()
                    : this.renderPortfolioReport()}
                <ModalPicker
                    testID="NewsModalPicker"
                    position={this.modalPosition}
                    listItem={this.dic.listReportType}
                    onSelected={this.onSelectedReport}
                    selectedItem={I18n.t(this.state.reportType)}
                    visible={this.state.visible}
                    animationType="fade"
                    title={I18n.t('selectReportType')}
                    onClose={this.onCloseReportType}
                />
                <BottomTabBar
                    navigator={this.props.navigator}
                    ref={(ref) => {
                        this.tabbar = ref;
                        FuncUtil.setRefTabbar(ref);
                    }}
                />
            </View>
        );
    }
}

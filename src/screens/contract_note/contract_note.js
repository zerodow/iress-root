import React, { Component } from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    Keyboard,
    LayoutAnimation,
    UIManager,
    Dimensions
} from 'react-native';
import { dataStorage, func } from '../../storage';
import * as contractActions from './contract_note.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import I18n from '../../modules/language';
import {
    deleteAllNotiNews,
    logDevice,
    checkPropsStateShouldUpdate,
    switchForm,
    setRefTabbar
} from '../../lib/base/functionUtil';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import ScreenId from '../../constants/screen_id';
import ModalPicker from '../modal_picker';
import CommonStyle from '~/theme/theme_controller';
import Enum from '../../../src/enum.js';
import * as translate from '../../../src/invert_translate';
import * as Controller from '../../../src/memory/controller';
import * as Util from '../../../src/util';
import SearchBar from './search_bar';
import Icons from '../../../src/component/headerNavBar/icon';
import BottomTabBar from '~/component/tabbar';
import ContractNoteContent from './contract_note.content';
import StateApp from '~/lib/base/helper/appState';
import FallHeader from '~/component/fall_header';
import Header from '~/component/headerNavBar';
import CustomDate from '~/component/customDate';
import PullToRefresh from '~/component/pull_to_refresh';

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);

const { height: HEIGHT_DEVICE } = Dimensions.get('window');

const {
    CNOTE_FILTER_TYPE,
    CNOTE_PAGE_SIZE,
    SYMBOL_CLASS,
    SYMBOL_CLASS_QUERY
} = Enum;
const duration = {
    fromDate: +new Date(),
    toDate: +new Date()
};

export class ContractNote extends Component {
    constructor(props) {
        super(props);
        this.isready = Platform.OS === 'ios';
        this.listFilter = translate.getListInvertTranslate(
            Object.keys(CNOTE_FILTER_TYPE)
        );
        this.pageId = 1;
        this.textSearch = '';
        this.pageSize = CNOTE_PAGE_SIZE;
        this.menuSelected = dataStorage.menuSelected;
        this.customDuration = this.props.cnotes.customDuration || duration;
        this.classSymbol = SYMBOL_CLASS.ALL_TYPES;
        this.initAnimation();
        this.dic = {};
        this.state = {
            modalVisible: false,
            isShowDate: this.props.cnotes.duration === 'Custom',
            listData: []
        };
        this.location = Controller.getLocation().location;
        this.isLoadContractData = false;
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.applyDate = this.applyDate.bind(this);
        this.searchContractNote = this.searchContractNote.bind(this);
        this.getContractData = this.getContractData.bind(this);
        this.getDataComplete = this.getDataComplete.bind(this);
        this.resetFlatList = this.resetFlatList.bind(this);
        this.updateDuration = this.updateDuration.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.perf = new Perf(performanceEnum.show_form_contract_note);
        this.id = Util.getRandomKey();
        this.stateApp = new StateApp(
            () => {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.getContractData({ isLoadMore: null, isRefresh: true });
                }, 1000);
            },
            null,
            ScreenId.CNOTE,
            false
        );
    }

    initAnimation() {}

    onShowModalPicker = () => {
        this.setState({ modalVisible: true });
    };

    onClose = () => {
        this.setState({ modalVisible: false });
    };

    resetContractNote() {
        this.props.actions.resetContractNote();
    }

    resetFlatList = () => {
        // if (this.props.cnotes.listData.length >= 0) {
        this.pageId = 1;
        // }
    };

    onLayoutModal({ nativeEvent: { layout } }) {
        this.myComponent.measure((fx, fy, width, height, px, py) => {
            this.modalPosition = { fx, fy, width, height, px, py };
        });
    }

    renderRightComp = () => {
        return (
            <TouchableOpacity
                style={{
                    width: 32,
                    alignItems: 'flex-end',
                    right: 16
                }}
                onPress={this.onShowModalPicker}
                ref={(view) => view && (this.myComponent = view)}
                onLayout={(e) => this.onLayoutModal(e)}
            >
                <Icons name="md-time" onPress={this.onShowModalPicker} />
            </TouchableOpacity>
        );
    };

    toggleDrawer() {
        const { isLoading } = this.props.cnotes;
        if (isLoading) return;
        const { navigator } = this.props;
        if (navigator) {
            navigator.toggleDrawer({
                side: 'left',
                animated: true
            });
        }
    }

    updateDuration(data) {
        this.props.actions.updateDuration(data);
    }

    resetDataAfterChangeDuration(duration, customDuration) {
        this.props.actions.resetDataAfterChangeDuration({
            duration,
            customDuration
        });
    }

    onSelected(data) {
        try {
            this.resetFlatList();
            this.resetDataAfterChangeDuration(data);
            const isCustom = data === 'Custom';
            if (this.state.isShowDate !== isCustom) {
                LayoutAnimation.easeInEaseOut();
            }
            this.setState(
                {
                    isShowDate: isCustom,
                    modalVisible: false
                },
                () => {
                    this.getContractData({});
                }
            );
        } catch (error) {
            logDevice('info', `save type filter Contract Note failed ${error}`);
        }
    }

    getContractData({ isLoadMore = false, isRefresh = false, timeout = 0 }) {
        if (this.textSearch && this.textSearch.length) {
            this.searchContractNote(isRefresh);
        } else {
            !this.isLoadContractData &&
                this.props.actions.loadCnotesData(
                    this.props.cnotes.duration,
                    this.pageSize,
                    this.pageId,
                    isLoadMore,
                    this.getDataComplete,
                    this.customDuration,
                    null,
                    isRefresh,
                    timeout
                );
        }
    }

    getDataComplete(isComplete = false) {
        this.isLoadContractData = isComplete;
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            if (
                dataStorage.notifyObj &&
                dataStorage.notifyObj.cnotes_id &&
                dataStorage.switchScreen === 'ContractNote'
            ) {
                this.openNoti();
                dataStorage.switchScreen = null;
            } else {
                switchForm(this.props.navigator, event);
            }
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'cnote_filter':
                    this.onShowModalPicker();
                    break;
                case 'menu_ios':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    this.perf &&
                        this.perf.incrementCounter(
                            performanceEnum.show_form_contract_note
                        );
                    setCurrentScreen(analyticsEnum.cnotes);
                    break;
                case 'didAppear':
                    setRefTabbar(this.tabbar);
                    if (
                        dataStorage.backContractNoteDetail ||
                        dataStorage.isChangeAccount
                    ) {
                        dataStorage.backContractNoteDetail = false;
                        dataStorage.isChangeAccount = false;
                    } else {
                        this.getContractData({
                            isLoadMore: false,
                            isRefresh: true
                        });
                    }
                    func.setCurrentScreenId(ScreenId.CNOTE);
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    this.getDataComplete(false);
                    this.sendRequest();
                    break;
                default:
                    break;
            }
        }
    }

    sendRequest() {
        deleteAllNotiNews();
    }

    openNoti() {
        const data = dataStorage.notifyObj.data;
        if (data && data.updated) {
            const curTime = new Date().getTime();
            const enabledTime = data.updated + 1200000;
            if (enabledTime <= curTime) {
                this.contractRef &&
                    this.contractRef.renderToLink &&
                    this.contractRef.renderToLink(data);
            }
        }
        dataStorage.notifyObj = null;
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps &&
            nextProps.isConnected &&
            nextProps.isConnected !== this.props.isConnected
        ) {
            this.getContractData({ isLoadMore: false, isRefresh: true });
        } else {
            let listData = [];
            if (nextProps.cnotes.listData) {
                listData = nextProps.cnotes.listData;
                listData.length &&
                    listData.sort(function (a, b) {
                        return b.updated - a.updated;
                    });
                this.setState({
                    listData
                });
            }
        }
    }

    loadNewData(timeout = 0) {
        this.resetContractNote();
        this.resetFlatList();
        this.getContractData({ isLoadMore: false, isRefresh: false, timeout });
    }

    componentDidMount() {
        dataStorage.loadData = this.loadNewData;
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide
        );
    }

    _keyboardDidShow = () => {
        this.isShowKeyboard = true;
    };

    _keyboardDidHide = () => {
        this.isShowKeyboard = false;
    };

    componentWillUnmount() {
        this.resetContractNote();
        this.resetFlatList();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    loadMore() {
        const currentDataLength = this.props.cnotes.listData.length || 0;
        if (currentDataLength < CNOTE_PAGE_SIZE * this.pageId) {
            return;
        }
        this.pageId += 1;
        this.getContractData({ isLoadMore: true, isRefresh: false });
    }

    showModalCnoteSearch() {
        this.props.navigator.showModal({
            animated: false,
            animationType: 'none',
            screen: 'equix.ContractSearch',
            passProps: {
                dismissModal: this.dismissModal,
                isConnected: this.props.isConnected,
                textSearch: this.textSearch
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }

    dismissModal = this.dismissModal.bind(this);
    dismissModal({ textSearch, isRefresh }) {
        this.textSearch = textSearch;
        this.props.navigator.dismissModal({
            animated: false,
            animationType: 'none'
        });
        this.refSearchBar &&
            this.refSearchBar.setText &&
            this.refSearchBar.setText(this.textSearch);
        this.getContractData({ isRefresh });
    }

    onReset() {
        if (this.textSearch === '') return;
        this.textSearch = '';
        this.refSearchBar &&
            this.refSearchBar.clear &&
            this.refSearchBar.clear();
        this.loadNewData();
    }

    renderSearchBar(isReal) {
        return (
            <View
                style={{
                    paddingBottom: 10,
                    paddingLeft: 32,
                    paddingRight: 35,
                    paddingTop: 6
                }}
            >
                <SearchBar
                    placeholder={I18n.t('findSymbol')}
                    onPress={this.showModalCnoteSearch.bind(this)}
                    ref={(ref) => isReal && (this.refSearchBar = ref)}
                    editable={false}
                    onReset={this.onReset.bind(this)}
                    testID="ContractNoteSearchBar"
                />
            </View>
        );
    }

    applyDate(fromDate, toDate) {
        this.customDuration = { fromDate, toDate };
        this.resetFlatList();
        this.resetDataAfterChangeDuration(
            this.props.cnotes.duration,
            this.customDuration
        );
        this.getContractData({});
    }

    openMenu = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.toggleDrawer({
                side: 'left',
                animated: true
            });
        }
    };

    renderLeftComp = () => {
        return (
            <View style={{ left: -14 }}>
                <Icons
                    style={{ paddingRight: 6 }}
                    name="ios-menu"
                    onPress={this.openMenu}
                    size={34}
                />
            </View>
        );
    };

    renderCustomDate() {
        return (
            <View
                style={{
                    paddingBottom: 2,
                    paddingLeft: 32,
                    paddingRight: 35,
                    height: 50
                }}
            >
                <CustomDate
                    fromDate={this.customDuration.fromDate}
                    toDate={this.customDuration.toDate}
                    applyDate={this.applyDate}
                />
            </View>
        );
    }

    renderHeader = this.renderHeader.bind(this);
    renderHeader(isReal = false) {
        return (
            <Header
                leftIcon="ios-menu"
                navigator={this.props.navigator}
                renderLeftComp={this.renderLeftComp}
                renderRightComp={this.renderRightComp}
                title={I18n.t('contractNote')}
                style={{ marginLeft: 0, paddingTop: 16 }}
            >
                <View style={{ paddingBottom: 6 }}>
                    {this.renderSearchBar(isReal)}
                    {this.state.isShowDate ? this.renderCustomDate() : null}
                </View>
            </Header>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        const listProps = [
            { cnotes: ['isLoading', 'duration', 'isConnected', 'isLoadMore'] },
            { setting: ['lang', 'textFontSize'] }
        ];
        const listState = ['modalVisible', 'listData'];
        const check = checkPropsStateShouldUpdate(
            nextProps,
            nextState,
            listProps,
            listState,
            this.props,
            this.state
        );
        return check;
    }

    getContractDataAfterBack = this.getContractDataAfterBack.bind(this);
    getContractDataAfterBack() {
        this.resetContractNote();
        this.resetFlatList();
        this.setState({ listData: [] }, () => {
            this.getContractData({});
        });
    }

    renderContent() {
        const { isLoading, isLoadMore, isRefresh } = this.props.cnotes;
        const { listData } = this.state;
        return (
            <ContractNoteContent
                ref={(ref) => (this.contractRef = ref)}
                isLoading={isLoading}
                getContractDataAfterBack={this.getContractDataAfterBack}
                isRefresh={isRefresh}
                listData={listData}
                isConnected={this.props.isConnected}
                getContractData={this.getContractData}
                navigator={this.props.navigator}
                setting={this.props.setting}
                loadMore={this.loadMore}
                isLoadMore={isLoadMore}
            />
        );
    }

    renderModal() {
        return (
            <ModalPicker
                style={{ width: 172 }}
                testID="CnoteModalPicker"
                listItem={this.listFilter}
                customDate={true}
                onSelected={this.onSelected.bind(this)}
                selectedItem={translate.getInvertTranslate(
                    this.props.cnotes.duration
                )}
                visible={this.state.modalVisible}
                title={I18n.t('selectCnoteType', {
                    locale: this.props.setting.lang
                })}
                onClose={this.onClose.bind(this)}
                position={this.modalPosition}
            />
        );
    }

    searchContractNote(isRefresh) {
        if (!isRefresh) {
            this.resetContractNote();
        }
        this.resetFlatList();
        const symbol = this.textSearch;
        this.refSearchBar &&
            this.refSearchBar.setText &&
            this.refSearchBar.setText(symbol);
        const accountId = dataStorage.accountId;
        this.props.actions.searchCnotes(
            accountId,
            this.props.cnotes.duration,
            symbol,
            isRefresh
        );
    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    height: HEIGHT_DEVICE,
                    backgroundColor: CommonStyle.color.bg
                }}
            >
                <FallHeader
                    ref={(ref) => ref && (this.headerRef = ref)}
                    style={{ backgroundColor: CommonStyle.color.bg }}
                    renderHeader={this.renderHeader}
                >
                    {this.renderContent()}
                    {this.renderModal()}
                    <BottomTabBar
                        navigator={this.props.navigator}
                        ref={(ref) => {
                            this.tabbar = ref;
                            setRefTabbar(ref);
                        }}
                    />
                </FallHeader>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        cnotes: state.cnotes,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(contractActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContractNote);

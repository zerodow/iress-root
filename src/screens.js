/* eslint-disable import/prefer-default-export */
import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import _ from 'lodash';

// import DrawerAndroid from './modules/_global/Drawer.android.js';
import DrawerAndroid from './modules/_global/Drawer_new.js'; // eslint-disable-line
// import DrawerIOS from './modules/_global/Drawer.ios.js';
import DrawerIOS from './modules/_global/Drawer_new.js'; // eslint-disable-line
// import DrawerManagementIOS from './modules/_global/DrawerManagement.ios.js';
import DrawerManagementIOS from './modules/_global/DrawerManagement.js'; // eslint-disable-line
import DrawerManagementAndroid from './modules/_global/DrawerManagement.js'; // eslint-disable-line
// import DrawerManagementAndroid from './modules/_global/DrawerManagement.android.js';
import ThirdPartyTerms from '~s/third_party_terms/'
import Home from './screens/home/';
import StackDrawer from './screens/drawer_stack';
import Login from './screens/login/login';
import More from './screens/more/more';
import AddCode from './screens/addcode/addcode.1';
import SearchCode from './screens/addcode/addcode.search.1';
import SearchCode2 from './screens/addcode/addcode.search.2';

import NewsDetail from './screens/news_detail/news_detail';
import Everything from './screens/news_ver2/everything';
import News from './screens/news_ver2/news_parent';
import NewsSearch from './screens/news_ver2/news_search';
import NewsV3 from './screens/news_v3/view/list_news_wrapper/NewsWrapper.js';
import NewDetail from './screens/news_v3/view/detail/';
// import Everything from './screens/news/everything';
// import News from './screens/news/news_parent';
// import NewsSearch from './screens/news/news_search';
import User from './screens/user/user';
import Order from './screens/order/order_wrapper';
import OrderHistory from './screens/order_history/order_history';
import ModifyOrder from './screens/modify_order/new_modify_order';
import Orders from './screens/orders/';
import Portfolio from './screens/portfolio/';
import AboutUs from './screens/about_us/about_us';
import Setting from './screens/setting/setting';
import Report from './screens/report/report';
import ReportFromFile from './screens/report_from_file/reports_from_file';
import CashAccountSummary from './screens/cash_account_summary/cash_account_summary';
import FinancialSummary from './screens/financial/financial';
import EstimatedSummary from './screens/estimated/estimated';
import TransactionSummary from './screens/transaction/transaction';
import BrokerageSummary from './screens/brokerage/brokerage';
import HoldingsValuation from './screens/holding/holding';
import UserManagement from './screens/user_management/user_management';
import Individual from './screens/individual/individual';
import Trust from './screens/trust/trust';
import ConfirmPlaceOrder from './screens/order/confirm_place_order';
import ConfirmModifyOrder from './screens/order/confirm_modify_order';
import ConfirmCancelOrder from './screens/order/confirm_cancel_order';
import Company from './screens/company/company';
import BusyBox from './screens/busybox/busybox';
import Logs from './screens/logs/logs';
import Connecting from './screens/connecting/connecting';
import CustomerGroupManagement from './screens/group_management/group_management';
import CustomerGroupDetail from './screens/group_detail/group_detail';
import CompanyDetail from './screens/company/company_detail';
import TrustDetail from './screens/trust/trust_detail';
import IndividualDetail from './screens/individual/individual_detail';
import CreateCompanyAccount from './screens/create_company_account/create_company_account';
import MarketDepth from './screens/market_depth/market_depth';
import SearchOrder from './screens/order/order_search';
import ModalPicker from './screens/modal_picker/modal_picker';
import Search from '@unis/universal/universal_search';
import SearchAccount from './screens/search_account/search_account';
import SearchDetail from '@unis/detail/search_detail.screen';
import NewsSetting from './screens/setting/news_setting/news_setting';
import OrderSetting from './screens/setting/order_setting/order_setting';
import ScheduledModal from './screens/setting/news_setting/scheduled_modal';
// import AuthSetting from './screens/setting/auth_setting/auth_setting';
import AuthSetting from './screens/setting/auth_setting/auth_setting2';
import ModalTimeZoneSetting from '~/screens/modal_picker/modal_timezone';
import ChangePin from './screens/setting/auth_setting/change_pin/change_pin';
import ChangePinNew from './screens/setting/auth_setting/change_pin/change_pin_new';
import ChangePinVerify from './screens/setting/auth_setting/change_pin/change_pin_verify';
import SetPin from './screens/setting/auth_setting/set_pin/set_pin';
import SetPinVerify from './screens/setting/auth_setting/set_pin/set_pin_verify';
import NewOverview4 from './screens/overview/overview';
import AuthenByPin from './component/authen_by_pin/authen_by_pin';
import NewAuthenByPin from './component/authen_by_pin/authen_by_pin.2';
import TouchAlert from '~s/setting/auth_setting/TouchAlert.2';
import PopupForgotPin from '~/component/popup/forgot_pin';
import PromptNew from './component/new_prompt/prompt_new';
import PopUpWarning from './component/new_prompt/pop_up_warning';
import NewOrderNavigator from './screens/order/new_order_navigator';
import NewOrderNavigatorManagementGroup from './screens/order/new_order_navigator_management_group';
import Disclaimer from './screens/disclaimer/disclaimer_iress';
import UpdateMe from './screens/update_me/update_me';
import AutoLogin from './screens/auto_login/auto_login';
import NetworkAlert from './component/network_alert/network_alert';
import WhatsNew from './component/whatsnew/whats_new';
import TokenWasChanged from './component/token_was_changed/token_was_changed';
import ShowAlert from './component/show_alert/show_alert';
import ResetAlert from './component/reset_alert/reset_alert';
import HomePage from './screens/homepage/home_page.js';
import SignIn from './screens/homepage/signin.js';
import CustomButton from './component/custom_button/custom_button';
import CustomBackButton from './component/custom_button/custom_back_button';
import CustomButtonWatchlist from './component/custom_button/custom_button_watchlist';
import CustomButtonCategories from './component/custom_button/custom_button_categories';
import ContractNote from './screens/contract_note/contract_note';
import ContractNoteDetail from './screens/contract_note_detail/contract_note_detail';
import ContractSearch from './screens/contract_note/contract_note_search';
import BusinessLog from './screens/business_log/business_log';
import BusinessLogSearch from './screens/business_log/business_log_search';
import BusinessLogFilter from './screens/business_log/business_log_filter';
import CategoriesWL from '~s/watchlist/Categories/';
import ListSymbol from '~s/watchlist/Categories/View/ListSymbol';
// import TabScroll from './screens/watchlist/Detail/TabScroll'

import Trade from './screens/watchlist';
import WatchlistDetail from './screens/watchlist/WatchlistDetail';

// import Trade from './screens/watchlist/Categories/';
// import FindWatchlist from './screens/find_watchlist/find_watchlist';

import Activities from './screens/marketActivity';
import FindWatchlist from './screens/find_watchlist/find_watchlist.1';

import ManagePriceboardPersonal from './screens/manage_priceboard_personal/manage_priceboard_personal';
import ManagePriceboard from './screens/manage_priceboard/manage_priceboard';
import ManagePriceboardStatic from './screens/manage_priceboard_static/manage_priceboard_static';
import CreatePriceboard from '~s/watchlist/Categories/View/CreatePriceBoard';
import VerifyYourMail from './screens/verify_mail/verify_your_mail';
import VerifyEmailCode from './screens/verify_mail/verify_email_code';
import PromptExpireToken from './component/new_prompt/prompt_expire_token';
import Themes from './screens/themes';
import LanguageOptions from './screens/languages';
import ModalLanguage from './screens/languages/modalLanguage';
import ListAlerts from './screens/alert_function/list_alert_wrapper';
import NewAlert from './screens/alert_function/new_alert';
import ModifyAlert from './screens/alert_function/modify_alert';
import AddAlert from './screens/alert_function/add_alert';
import PickerBottom from './component/picker_bottom';
import RowTagNew from './screens/alert_function/alert_target_news';
import UserInfo from './screens/user_info';
import AlertModal from './screens/user_info/alertModal';
import FakeC2R from './component/fakeC2R/fakeC2R';
import SearchBar from './screens/order/search_bar';
import TextSizeSetting from './screens/text_size/index';
import AlertCommon from '~/component/alert_common/index';
import NewModal from '../src/NewModal';
import NewPopup from '../src/newpopup';
import PickerBottomV2 from '~/screens/alert_function/components/Picker/index';
import ReanimatedPicker from '~/screens/alert_function/components/Picker/custom_picker';
import TargetNewModal from '~/screens/alert_function/components/TagNews/index';
import AuthRequireModal from '~/screens/setting/auth_setting/auth_require';
import NewsSettingScheduleModal from '~/screens/setting/news_setting/news_setting_schedule_modal';
import PasswordPrompt from '@component/change_password/password_prompt';
import PickerNews from './component/picker_news/PickerNews';
// import SelectionModal from '~/screens/new_order/components/Selection/SelectionModal.js';
import SingleBottomSheet from '~/component/bottom_sheet_reanimated/SinglePanel.js';
import SelectionModal from '~/component/Selection/SelectionModal.js';
import EditWatchList from '~/screens/watchlist/EditWatchList/EditWatchlist.js';
import ConfirmOrder from '~/screens/confirm_order/ConfirmOrder';
import ConfirmAmendOrder from '~/screens/confirm_order/ConfirmAmendOrder/ConfirmAmend'
import ConfirmCancel from '~/screens/confirm_order/ConfirmCancelOrder/ConfirmCancel'
import NewOrder from '~/screens/new_order/NewOrderWrapper'
import ShowErorrPopUp from '~/component/show_alert/error_pop_up'
import ShowDelayedMarketDataPopUp from '~/component/show_alert/delayed_market_data_pop_up'
import SearchSymbol from '~s/search_symbol'
import PopUpBiometric from '~/component/pop_up_biometric'
import PopUpErrorLogin from '~/screens/login/popupError'
import AlertLog from '~s/alertLog'
import SearchSymbolAlerts from '~s/alertLog/View/SearchSymbol/SinglePanel';
import CreateNewAlerts from '~/screens/alertLog/View/CreateNewAlerts'
import ShowModalAlertLog from '~s/alertLog/Components/Selection/SelectionModal'
import ErrorHandlingOrder from './screens/confirm_order/Components/Error/pop_up_error_handling.js';
import PopUpError from '~/component/popup/pop_up_error.js';
const scrObjWithProvider = {
    PopUpBiometric,
    CategoriesWL,
    SingleBottomSheet,
    EditWatchList,
    PasswordPrompt,
    NewsSettingScheduleModal,
    AuthRequireModal,
    NewPopup,
    NewModal,
    FakeC2R,
    SearchBar,
    ManagePriceboard,
    Trade,
    TradeDrawer: Trade,
    FindWatchlist,
    CreatePriceboard,
    ManagePriceboardPersonal,
    ManagePriceboardStatic,
    AutoLogin,
    HomePage,
    SignIn,
    Alerts: ListAlerts,
    NewAlert,
    ModifyAlert,
    AddAlert,
    AboutUs,
    Orders,
    Home,
    Login,
    User,
    NewOrderNavigator,
    NewOrderNavigatorManagementGroup,
    Order,
    ModifyOrder,
    Portfolio,
    More,
    AddCode,
    SearchCode,
    SearchCode2,
    NewsSearch,
    ContractSearch,
    Everything,
    News,
    SwitchTab: News,
    OrderHistory,
    DrawerAndroid,
    DrawerIOS,
    ThirdPartyTerms,
    NewsDetail,
    Setting,
    CashAccountSummary,
    FinancialSummary,
    ConfirmPlaceOrder,
    ConfirmModifyOrder,
    ConfirmCancelOrder,
    EstimatedSummary,
    TransactionSummary,
    BrokerageSummary,
    HoldingsValuation,
    Report,
    ReportFromFile,
    UserManagement,
    Individual,
    Trust,
    Company,
    CustomerGroupManagement,
    CustomerGroupDetail,
    CompanyDetail,
    TrustDetail,
    IndividualDetail,
    CreateCompanyAccount,
    MarketDepth,
    SearchOrder,
    ModalPicker,
    ModalLanguage,
    Search,
    SearchDetail,
    NewsSetting,
    OrderSetting,
    ScheduledModal,
    AuthSetting,
    AuthenByPin,
    NewAuthenByPin,
    TouchAlert,
    PopupForgotPin,
    ChangePin,
    ChangePinNew,
    ChangePinVerify,
    SetPin,
    SetPinVerify,
    NewOverview: NewOverview4,
    PromptNew,
    PopUpWarning,
    TokenWasChanged,
    ShowAlert,
    ResetAlert,
    WhatsNew,
    Disclaimer,
    UpdateMe,
    CustomButton,
    CustomButtonWatchlist,
    CustomButtonCategories,
    CustomBackButton,
    ContractNote,
    ContractNoteDetail,
    BusinessLog,
    BusinessLogSearch,
    BusinessLogFilter,
    VerifyYourMail,
    VerifyEmailCode,
    DrawerManagementIOS,
    DrawerManagementAndroid,
    SearchAccount,
    PromptExpireToken,
    Themes,
    LanguageOptions,
    PickerBottom,
    UserInfo,
    RowTagNew,
    AlertModal,
    TextSizeSetting,
    AlertCommon,
    ModalTimeZoneSetting,
    StackDrawer,
    PickerBottomV2,
    ReanimatedPicker,
    TargetNewModal,
    NewsV3,
    NewDetail,
    PickerNews,
    // WatchListMtPanel,
    SelectionModal,
    Activities,
    ConfirmOrder,
    WatchlistDetail,
    ConfirmAmendOrder,
    ConfirmCancel,
    NewOrder,
    ShowErorrPopUp,
    ShowDelayedMarketDataPopUp,
    SearchSymbol,
    PopUpErrorLogin,
    AlertLog,
    SearchSymbolAlerts,
    CreateNewAlerts,
    ShowModalAlertLog,
    ErrorHandlingOrder,
    PopUpError

};
const scrObjWithoutProvider = {
    BusyBox,
    Connecting,
    Logs,
    NetworkAlert
};

export function registerScreens(store, Provider) {
    _.forEach(scrObjWithProvider, (Comp, scrName) => {
        let curComp = Comp;
        const listPanComp = [
            'TradeDrawer',
            'Trade',
            'WatchlistDetail',
            'Orders',
            'Portfolio',
            'NewAlert',
            'Order',
            'NewDetail',
            'WatchListMtPanel',
            'Activities',
            'EditWatchList',
            'CreatePriceboard',
            'ConfirmOrder',
            'NewOrder',
            'ShowErorrPopUp',
            'ShowDelayedMarketDataPopUp',
            'AlertLog'

        ];
        if (listPanComp.includes(scrName)) {
            curComp = gestureHandlerRootHOC(Comp);
        }
        Navigation.registerComponent(
            'equix.' + scrName,
            () => curComp,
            store,
            Provider
        );
    });
    _.forEach(scrObjWithoutProvider, (Comp, scrName) => {
        Navigation.registerComponent('equix.' + scrName, () => Comp);
    });
}

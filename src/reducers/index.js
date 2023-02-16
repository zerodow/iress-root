import { combineReducers } from 'redux';
import { login } from '../screens/login/login.reducer';
import { trade } from '../screens/trade/trade.reducer';
import { reducer as watchlist } from '../screens/trade.1/trade.reducer';
import { reducer as watchlist2 } from '../screens/trade.2/trade.reducer';
import { user } from '../screens/user/user.reducer';
import { order } from '../screens/order/order.reducer';
import { orders } from '../screens/orders/Redux/reducer';
import { loadingList } from '../component/loading_component/Redux/reducer';
import { picker } from '../screens/order/picker.reducer';
import { modifyOrder } from '../screens/modify_order/modify_order.reducer';
import { tab } from '../modules/_global/switchTab/switchTab.reducer';
import { orderHistory } from '../screens/order_history/order_history.reducer';
import { news } from '../screens/news/news.reducer';
import { newsIress } from '../screens/news_v3/redux/news.reducer';
import { setting } from '../screens/setting/setting.reducer';
import { overview } from '../screens/overview/overview.reducer';
import { company } from '../screens/company/company_detail.reducer';
import { trust } from '../screens/trust/trust_detail.reducer';
import { individual } from '../screens/individual/individual_detail.reducer';
import { overviewRowEvent } from '../screens/overview/indexItem.reducer';
import { report } from '../screens/report/report.reducer';
import { cashAccountSummary } from '../screens/cash_account_summary/cash_account_summary.reducer';
import { search } from '@unis/universal_search.reducer';
import { app } from '../app.reducer';
import { authSetting } from '../screens/setting/auth_setting/auth_setting.reducer';
import { cnotes } from '../screens/contract_note/contract_note.reducer';
import { bLog } from '../screens/business_log/business_log.reducer';
import { reducer as price } from '@unis/detail/price/price.reducer';
import { reducer as priceChart } from '@unis/detail/price/price_chart.reducer';
import { reducer as searchNews } from '@unis/detail/new/search_new.reducer';
// import { reducer as searchDetail } from 'universal_search/search_detail.reducer';
import { reducer as searchOrder } from '@unis/detail/order/search_order.reducer';
import { reducer as searchPortfolio } from '@unis/detail/portfolio/search_portfolio.reducer';
import { reducer as searchDetail } from '@unis/detail/search_detail.reducer';
import { reducer as marketDepth } from '../screens/market_depth/swiper_market_depth.reducer';
import { reducer as swiperTenTrade } from '../screens/market_depth/swiper_10_trades.reducer';
import { reducer as topOrderTransaction } from '../screens/open_price/new_open_price.reducer';
import { reducer as scrollView } from '../component/scrollCustom/scrollview.reducer';
import { reducer as uniSearch } from '@unis/universal/search_universal.reducer';
import { reducer as streamMarket } from '../streaming/StreamComp/reducer';
import { reducer as watchlist3 } from '../screens/watchlist/reducers';
import newOrder from '~/screens/new_order/Redux/reducer.js';
import searchAccount from '~/component/search_account/redux/reducer.js';
import searchSymbol from '~/component/search_symbol/redux/reducer';
import addSymbol from '~/component/add_symbol/Redux/reducer.js';
import confirmPlaceOrder from '~/screens/confirm_order/Redux/reducer.js';
import { portfolio, reducerNews } from '~/screens/portfolio/Redux/reducer';
import alert from '~/screens/alert_function/redux/reducer';
import { categoriesWL } from '~s/watchlist/Categories/Redux/reducer';
import { reducer as animator } from '~/screens/watchlist/Animator/reducer';
import { reducer as modal } from '~/component/Modal';
import { reducer as marketActivity } from '~/screens/marketActivity/reducer';
import editWatchlist from '~/screens/watchlist/EditWatchList/Redux/reducer.js';
import errorSystem from '~/component/error_system/Redux/reducers.js'
const rootReducer = {
    errorSystem,
    categoriesWL,
    app,
    login,
    tab,
    trade,
    user,
    order,
    orders,
    loadingList,
    modifyOrder,
    news,
    picker,
    orderHistory,
    setting,
    overview,
    overviewRowEvent,
    cashAccountSummary,
    report,
    company,
    trust,
    individual,
    search,
    authSetting,
    cnotes,
    bLog,
    price,
    priceChart,
    searchNews,
    searchOrder,
    searchPortfolio,
    searchDetail,
    marketDepth,
    swiperTenTrade,
    watchlist,
    topOrderTransaction,
    scrollView,
    uniSearch,
    streamMarket,
    watchlist2,
    watchlist3,
    portfolio,
    alert,
    animator,
    newsIress,
    newOrder,
    confirmPlaceOrder,
    searchSymbol,
    searchAccount,
    addSymbol,
    modal,
    marketActivity,
    editWatchlist,
    reducerNews
};
export default rootReducer;

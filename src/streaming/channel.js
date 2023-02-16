export function getChannelSyncTimeEnableReadNews(newID) {
	return `channel_sync_enable_read_new_${newID}`;
}

export function getChannelRealtimeSubOrders() {
	return `channel_sync_sub_order_list`;
}
export function getChannelRealtimeOrders() {
	return `channel_sync_order_list`;
}

export function getChannelWatchlistChanged(priceBoardId) {
	return `watchlist_changed##${priceBoardId}`;
}

export function getChannelSelectedPriceboard() {
	return `channel_selected_priceboard`;
}

export function getChannelAddNewPriceboard() {
	return `channel_add_new_priceboard`;
}

export function getChannelDeleteOldPriceboard() {
	return `channel_delete_old_priceboard`;
}

export function getChannelUpdatePriceboard() {
	return `channel_update_priceboard`;
}

export function getChannelRequestCheckAuthen(id) {
	return `channel_request_check_authen##${id}`;
}

export function getChannelAccountIdChange() {
	return `channel_account_id_change`;
}

export function getChannelPortfolioChange() {
	return `channel_portfolio_change`;
}

export function getChannelGotAccessTokenFirst() {
	return `channel_access_token_change`;
}

export function getChannelAccountSummaryChange() {
	return `channel_account_summary_change`;
}

export function getChannelAccountSummaryChangeComponent(id) {
	return `channel_account_summary_change_component##${id}`;
}

export function getChannelPositionChange() {
	return `channel_position_change`;
}

export function getChannelPositionChangeComponent(id) {
	return `channel_position_change_component##${id}`;
}

export function getChannelShowWarningUser(id) {
	return `channel_show_warning_user##${id}`;
}

export function getChannelLoadingChild(id) {
	return `channel_loading_child##${id}`;
}

export function getChannelLoadingPortfolio(id) {
	return `channel_loading_portfolio##${id}`;
}

export function getChannelChangeTradingHalt(code) {
	return `channel_change_trading_halt##${code}`;
}

export function getChannelForceReload() {
	return `channel_force_reload`;
}

export function getChannelChangeTheme() {
	return `channel_channel_theme`;
}

export function getChannelAccountChange() {
	return `channel_account_change`;
}

export function getChannelTransactionChange(symbol) {
	return `channel_transaction_change#${symbol}`;
}

export function getChannelConnectionChange() {
	return `channel_connection_change`;
}

export function getChannelButtonGroupStagnant(id) {
	return `channel_button_group_stagnant_${id}`;
}

export function getChannelTransactionOfSymbol(symbol) {
	return `channel_transaction_of_symbol_${symbol}`;
}

export function getChannelPositionChildChange(id, symbol) {
	return `channel_position_child_change_${id}_${symbol}`;
}

export function getChannelAllowRender(id) {
	return `channel_allow_render_${id}`;
}

export function getChannelExpandChange(id) {
	return `channel_expand_change_${id}`;
}

export function getChannelPlaceOrder(id) {
	return `channel_place_order_${id}`;
}

export function getChannelCurrentAccountChange() {
	return `channel_current_account_change`;
}

/* #region Order */
export function getChannelOrderSymbol() {
	return `alert#symbol`;
}

export function getChannelOrderCompany() {
	return `alert#company`;
}
/* #endregion */

/* #region Auth */
export function getChannelAuthSensorAndroidFail() {
	return `auth#sensor_android_fail`;
}
/* #endregion */

/* #region Alert */
export function getChannelAlertLoading() {
	return `alert#loading_state`;
}

export function getChannelAlertPrice() {
	return `alert#price`;
}

export function getChannellAlertAllPrice() {
	return `alert#all_price`;
}

export function getChannelAlertSymbol() {
	return `alert#symbol`;
}

export function getChannelAlertDeliveryMethod() {
	return `alert#delivery_method`;
}

export function getChannelRealtimeListAlerts() {
	return `alert#realtime`;
}

export function getChannelChangeEmailNotification() {
	return `alert#email_notification`;
}

export function getChannelAlertNewsToday() {
	return `alert#news_today`;
}

export function getChannelBlurWithPan() {
	return `alert#blur_with_pan`;
}

export function getChannelLoadingSearch() {
	return `search#loading`;
}
export function getChangeScrollPrice() {
	return `scroll#marketPrice`;
}
export function getChangeFilterPositionPortfolio() {
	return `portfolio#holding_filter`;
}
export function getChannelUpdateStatusButtonConfirmAlert() {
	return `alert#updateStatusButtonConfirm`;
}
export function getChannelOnPressConfirmAlert() {
	return `alert#onPressButtonConfirm`;
}
export function getChannelLoadingConfirmAlert() {
	return `alert#onLoadingButtonConfirm`;
}
export function getChannelChangeTabMarketDepth() {
	return `newOrder#onChangeTabMarketDepth`;
}
export function getChannelInfiniteScroll() {
	return `watchlist_infinite_scroll`;
}

export function getChannelSyncHistorySearchAccount() {
	return `sync_history_search_account`;
}

export function getChannelSyncHistorySearchWLPriceboard() {
	return `sync_history_search_WL`;
}

export function getChannelSyncHistorySearchSymbol() {
	return `sync_history_search_symbol`;
}

export function getChannelRealtimeHolding() {
	return `realtime_holding_positions`
}

export function getChannelRealtimeSummary() {
	return `realtime_account_summary`
}
export function getChannelClearRecentAccount() {
	return `clear_recent_account`
}
export function getChannelClearRecentSymbol() {
	return `clear_recent_symbol`
}
/* #endregion */

export function getChannelChangeOrderError() {
	return `change_fake_order_error`
}

export function getChannelChangeRealOrderError() {
	return `change_real_order_error`
}
export function getChannelHideOrderError() {
	return `new_order_hide_order_error`
}
export function getChannelShowConfirmPlaceButton() {
	return `confirm#place#show#button`
}
export function getChannelHideConfirmPlaceButton() {
	return `confirm#place#hide#button`
}
export function getChannelShowMessageNewOrder() {
	return `new_order#show#message`
}
export function getChannelShowMessageNews() {
	return `news#show#message`
}
export function getChannelUpdateOrderDetail() {
	return `update_data_order_detail`
}
export function getChangeHideErrorNews() {
	return `change_hide_error_news`
}
export function getChangeShowErrorNews() {
	return `change_show_error_news`
}
export function getChannelShowErrorSystem() {
	return `show#error#system`
}
export function getChannelHideErrorSystem() {
	return `hide#error#system`
}
export function getChannelForceRenderDrawer() {
	return `force_render_drawer`
}
export function getChannelOrderTriggerBorderError() {
	return `new_order_quantity_trigger_border_error`
}
export function getChangeHideError() {
	return `change_hide_error`
}
export function getChangeShowErrorSuccess() {
	return `change_show_error_success`
}
export function getChangeShowErrorFailed() {
	return `change_show_error_failed`
}
export function getLoginChannelShowMessage() {
	return `login#channel#message`
}

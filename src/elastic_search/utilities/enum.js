/**
 * Order of sorting in ElasticSearch query object
 */
export const SORTING_ORDER = {
	ASC: 'asc',
	DESC: 'desc'
};

/**
 * All fields of order detail's data that can be get from backend
 */
export const ORDER = {
	ACCOUNT_ID: 'account_id',
	ACCOUNT_NAME: 'account_name',
	ACTOR_CHANGED: 'actor_changed',
	ADVISOR_CODE: 'advisor_code',
	AVG_PRICE: 'avg_price',
	BROKER_ORDER_ID: 'broker_order_id',
	CHILD_FIELD: 'child_field',
	CLIENT_ORDER_ID: 'client_order_id',
	COMPANY_NAME: 'company_name',
	CONDITION_NAME: 'condition_name',
	CURRENT_BROKERAGE: 'current_brokerage',
	CURRENT_TAX: 'current_tax',
	CURRENT_VALUE: 'current_value',
	DESTINATION: 'destination',
	DEVICE_INFO: 'device_info',
	DISPLAY_ORDER_ID: 'display_order_id',
	DURATION: 'duration',
	ESTIMATED_BROKERAGE: 'estimated_brokerage',
	ESTIMATED_TAX: 'estimated_tax',
	ESTIMATED_VALUE: 'estimated_value',
	EXCHANGE: 'exchange',
	EXCHANGE_UPDATED: 'exchange_updated',
	EXPIRE_DATE: 'expire_date',
	FILLED_QUANTITY: 'filled_quantity',
	INIT_TIME: 'init_time',
	IS_BUY: 'is_buy',
	IS_NOT_INSERT_DETAIL: 'is_not_insert_detail',
	IS_STOPLOSS: 'is_stoploss',
	LEAVE_QUANTITY: 'leave_quantity',
	LIMIT_PRICE: 'limit_price',
	MARKET_PRICE: 'market_price',
	MODIFY_ORDER_ID: 'modify_order_id',
	ORDER_ACTION: 'order_action',
	ORDER_STATE: 'order_state',
	ORDER_STATUS: 'order_status',
	ORDER_TAG: 'order_tag',
	ORDER_TYPE: 'order_type',
	ORDER_TYPE_ORIGIN: 'order_type_origin',
	ORDER_VALUE: 'order_value',
	ORIGINATION: 'origination',
	ORIGIN_BROKER_ORDER_ID: 'origin_broker_order_id',
	PASSED_STATE: 'passed_state',
	REJECT_REASON: 'reject_reason',
	SORT_FIELD: 'sort_field',
	STOP_PRICE: 'stop_price',
	SYMBOL: 'symbol',
	TRADING_MARKET: 'trading_market',
	TRAIL_AMOUNT: 'trail_amount',
	TRAIL_PERCENT: 'trail_percent',
	UPDATED: 'updated',
	VOLUME: 'volume'
};

export const USER = {
	ACCESS_METHOD: 'access_method',
	ACTOR: 'actor',
	ADDON: 'addon',
	ADVISOR_CODE: 'advisor_code',
	BRANCH_CODE: 'branch_code',
	CHANGE_PASSWORD: 'change_password',
	COMPLETE_SIGNUP: 'complete_signup',
	EMAIL: 'email',
	EMAIL_ALERT: 'email_alert',
	EMAIL_TEMPLATE: 'email_template',
	FULL_NAME: 'full_name',
	LIST_MAPPING: 'list_mapping',
	LIVE_NEWS: 'live_news',
	MARKET_DATA_AU: 'market_data_au',
	MARKET_DATA_FU: 'market_data_fu',
	MARKET_DATA_TYPE: 'market_data_type',
	MARKET_DATA_US: 'market_data_us',
	NEW_EMAIL: 'new_email',
	NOTE: 'note',
	ORGANISATION_CODE: 'organisation_code',
	PHONE: 'phone',
	ROLE_GROUP: 'role_group',
	STATUS: 'status',
	UPDATED: 'updated',
	USER_GROUP: 'user_group',
	USER_ID: 'user_id',
	USER_LOGIN_ID: 'user_login_id',
	USER_TYPE: 'user_type',
	VERIFY: 'verify'
};

export const NEWS = {
	LINK: 'link',
	LINK_PARITECH: 'link_paritech',
	NEWS_ID: 'news_id',
	PAGE_COUNT: 'page_count',
	SOURCE: 'source',
	STATUS: 'status',
	SYMBOL: 'symbol',
	TITLE: 'title',
	TRADING_HALT: 'trading_halt',
	TYPE_NEWS: 'type_news',
	UPDATED: 'updated',
	USER_READED: 'user_readed'
};

export const CNOTE = {
	ACCOUNT_ID: 'account_id',
	C_NAME: 'c_name',
	DAY: 'day',
	IS_BUY: 'is_buy',
	LINK: 'link',
	MTIME: 'mtime',
	NUM: 'num',
	SYMBOL: 'symbol',
	UPDATED: 'updated'
};

export const PORTFOLIO = {
	ACCOUNT_ID: 'account_id',
	ACCOUNT_NAME: 'account_name',
	AVERAGE_PRICE: 'average_price',
	BOOK_COST: 'book_cost',
	BOOK_COST_CONVERT: 'book_cost_convert',
	BOOK_VALUE: 'book_value',
	BOOK_VALUE_CONVERT: 'book_value_convert',
	COMPANY: 'company',
	COST: 'cost',
	CURRENCY: 'currency',
	DISPLAY_NAME: 'display_name',
	EXCHANGE: 'exchange',
	GROUP_CODE: 'group_code',
	MARKET_PRICE: 'market_price',
	PRE_CLOSE: 'pre_close',
	PROFIT_PERCENT: 'profit_percent',
	SIDE: 'side',
	STYLE: 'style',
	SYMBOL: 'symbol',
	TODAY_CHANGE_PERCENT: 'today_change_percent',
	TODAY_CHANGE_VAL: 'today_change_val',
	TREND: 'trend',
	UPDATED: 'updated',
	UPNL: 'upnl',
	VALUE: 'value',
	VALUE_CONVERT: 'value_convert',
	VOLUME: 'volume'
};

export const ACCOUNT = {
	ACCOUNT_DESIGNATION: 'account_designation',
	ACCOUNT_GROUP: 'account_group',
	ACCOUNT_ID: 'account_id',
	ACCOUNT_NAME: 'account_name',
	ACCOUNT_TYPE: 'account_type',
	ACTOR: 'actor',
	ADDRESS_LINE_1: 'address_line_1',
	ADDRESS_LINE_2: 'address_line_2',
	ADDRESS_LINE_3: 'address_line_3',
	ADDRESS_LINE_4: 'address_line_4',
	ADVISOR_CODE: 'advisor_code',
	ADVISOR_NAME: 'advisor_name',
	AU_MARKET: 'au_market',
	AUTO_ID: 'auto_id',
	BANK_ACCOUNT_NAME: 'bank_account_name',
	BANK_ACCOUNT_NUMBER: 'bank_account_number',
	BANK_INSTITUTION_CODE: 'bank_institution_code',
	BANK_TRANSACTION_TYPE: 'bank_transaction_type',
	BRANCH: 'branch',
	BRANCH_CODE: 'branch_code',
	BSB: 'bsb',
	CLIENT_TYPE: 'client_type',
	CONTRACTNOTE_EMAIL_ADDRESS: 'contractnote_email_address',
	COUNTRY_CODE: 'country_code',
	CQG_ACCOUNT_ID: 'cqg_account_id',
	CQG_ACCOUNT_NAME: 'cqg_account_name',
	CQG_ACCOUNT_NUMBER: 'cqg_account_number',
	CROSS_REFERENCE: 'cross_reference',
	CURRENCY: 'currency',
	DATE_CREATED: 'date_created',
	DOMESTIC_PARTNER_STATUS: 'domestic_partner_status',
	EMAIL: 'email',
	EQUITIES_BROKERAGE_SCHEDULE: 'equities_brokerage_schedule',
	HIN: 'hin',
	HOME_PHONE: 'home_phone',
	INTERNAL_PARTNER_STATUS: 'internal_partner_status',
	INTERNATIONAL_TRADING: 'international_trading',
	LAST_UPDATE: 'last_update',
	MOBILE_PHONE: 'mobile_phone',
	OM_EQUIX_STATUS: 'om_equix_status',
	OPTIONS_BROKERAGE_SCHEDULE: 'options_brokerage_schedule',
	OPTIONS_TRADING: 'options_trading',
	ORGANISATION_CODE: 'organisation_code',
	PID: 'pid',
	POST_CODE: 'post_code',
	SAXO_ACCOUNT_ID: 'saxo_account_id',
	SAXO_ACCOUNT_NUMBER: 'saxo_account_number',
	SAXO_CLIENT_NAME: 'saxo_client_name',
	STATUS: 'status',
	US_MARKET: 'us_market',
	WARRANTS_TRADING: 'warrants_trading',
	WORK_PHONE: 'work_phone',
	EQUITY_TRADING: 'equity_trading',
	FUTURE_TRADING: 'future_trading'
};

export const BRANCH = {
	CONDITIONAL_RULE: 'conditional_rule',
	DESCRIPTION: 'description',
	ENUM: 'enum',
	MARKET_TYPE: 'market_type',
	RULE: 'rule',
	VALIDATE: 'validate'
};

export const MARKET_DATA = {
	ACCESS_METHOD: 'access_method',
	ACTOR: 'actor',
	ADDON: 'addon',
	ADVISOR_CODE: 'advisor_code',
	BRANCH_CODE: 'branch_code',
	CHANGE_PASSWORD: 'change_password',
	COMPLETE_SIGNUP: 'complete_signup',
	EMAIL: 'email',
	EMAIL_ALERT: 'email_alert',
	EMAIL_TEMPLATE: 'email_template',
	FULL_NAME: 'full_name',
	LIST_MAPPING: 'list_mapping',
	LIVE_NEWS: 'live_news',
	MARKET_DATA_AU: 'market_data_au',
	MARKET_DATA_FU: 'market_data_fu',
	MARKET_DATA_TYPE: 'market_data_type',
	MARKET_DATA_US: 'market_data_us',
	NEW_EMAIL: 'new_email',
	NOTE: 'note',
	ORGANISATION_CODE: 'organisation_code',
	PHONE: 'phone',
	ROLE_GROUP: 'role_group',
	STATUS: 'status',
	UPDATED: 'updated',
	USER_GROUP: 'user_group',
	USER_ID: 'user_id',
	USER_LOGIN_ID: 'user_login_id',
	USER_TYPE: 'user_type',
	VERIFY: 'verify'
};

export const ORDER_WEB_SERVICES = {
	ACCOUNT_ID: 'account_id',
	ACCOUNT_NAME: 'account_name',
	ACTION_STATE: 'action_state',
	ACTOR_CHANGED: 'actor_changed',
	ADVISOR_CODE: 'advisor_code',
	AVG_PRICE: 'avg_price',
	COMPANY_NAME: 'company_name',
	DESTINATION: 'destination',
	DONE_VALUE_TODAY: 'done_value_today',
	DONE_VALUE_TOTAL: 'done_value_total',
	DONE_VOLUME_TODAY: 'done_volume_today',
	DURATION: 'duration',
	ESTIMATED_VALUE: 'estimated_value',
	EXCHANGE: 'exchange',
	EXPIRE_DATE: 'expire_date',
	FILLED_QUANTITY: 'filled_quantity',
	INIT_TIME: 'init_time',
	IS_BUY: 'is_buy',
	LAST_ACTION: 'last_action',
	LEAVE_QUANTITY: 'leave_quantity',
	LIMIT_PRICE: 'limit_price',
	MARKET_DETAIL: 'market_detail',
	ORDER_NUMBER: 'order_number',
	ORDER_STATE: 'order_state',
	ORDER_STATUS: 'order_status',
	ORDER_TAG: 'order_tag',
	ORDER_TYPE: 'order_type',
	PARENT_ORDER_NUMBER: 'parent_order_number',
	PRICE_MULTIPLIER: 'price_multiplier',
	REJECT_REASON: 'reject_reason',
	ROOT_PARENT_ORDER_NUMBER: 'root_parent_order_number',
	STOP_PRICE: 'stop_price',
	SYMBOL: 'symbol',
	UNCOMMITTED_QUANTITY: 'uncommitted_quantity',
	UPDATED: 'updated',
	VOLUME: 'volume'
};

import ORDER_STATE_ENUM from './constants/order_state_enum';

const TIME_FLASHING = 250;

const OPEN_SESSION_US_TIME = {
	HOUR: 9,
	MINUTE: 30
};

const OPEN_SESSION_AU_TIME = {
	HOUR: 10,
	MINUTE: 0
};

const CLOSE_SESSION_US_TIME = {
	HOUR: 16,
	MINUTE: 0
};

const CLOSE_SESSION_AU_TIME = {
	HOUR: 16,
	MINUTE: 10
};

const ACTION_ORD = {
	PLACE: 'PLACE',
	MODIFY: 'MODIFY',
	CANCEL: 'CANCEL'
};

const STATUS_ORD = {
	NONE: 0,
	PROCESS: 1,
	ERROR: 2,
	SUCCESS: 3,
	TIMEOUT: 4
};

const TITLE_NOTI = {
	CHAR_SPLIT: '#',
	SUCCESS: 'SUCCESS',
	TIMEOUT: 'TIMEOUT',
	REJECT: 'REJECT'
};
const ORDERS_TYPE_FILTER = {
	open: 'open',
	stoploss: 'stoploss',
	filled: 'filled',
	cancelled: 'cancelled'
};

const ORDER_TYPE_ORIGIN_UPPER = {
	STOP: 'STOP',
	LIMIT: 'LIMIT',
	MARKET: 'MARKET',
	MARKETTOLIMIT: 'MARKETTOLIMIT',
	TRAILINGSTOP: 'TRAILINGSTOP',
	TRAILINGSTOPLIMIT: 'TRAILINGSTOPLIMIT',
	TRAILINGSTOPLOSS: 'TRAILINGSTOPLOSS',
	STOPLIMIT: 'STOPLIMIT',
	STOPLOSS: 'STOPLOSS',
	BEST: 'BEST'
};

const NOTE_STATE = {
	USER_PLACE: 'UserPlace',
	USER_AMEND: 'UserAmend'
};

const ORDER_TYPE_SYSTEM = {
	STOP_ORDER: 'STOP_ORDER',
	LIMIT_ORDER: 'LIMIT_ORDER',
	MARKET_ORDER: 'MARKET_ORDER',
	MARKETTOLIMIT_ORDER: 'MARKETTOLIMIT_ORDER',
	TRAILINGSTOPLIMIT_ORDER: 'TRAILINGSTOPLIMIT_ORDER',
	TRAILINGSTOPLOSS_ORDER: 'TRAILINGSTOPLOSS_ORDER',
	STOPLIMIT_ORDER: 'STOPLIMIT_ORDER',
	STOPLOSS_ORDER: 'STOPLOSS_ORDER',
	BEST_ORDER: 'BEST_ORDER'
};

const FLAG = {
	US: 'US',
	AU: 'AU',
	GB: 'GB',
	EU: 'EU',
	VI: 'VI',
	CN: 'CN'
};

const TYPE_PRICEBOARD = {
	US: 'US',
	AU: 'AU',
	PERSONAL: 'PERSONAL',
	FAVORITES: 'FAVORITES',
	FAVOURITES: 'FAVOURITES',
	IRESS: 'IRESS'
};

const CONFIRM_ORD = {
	[ACTION_ORD.PLACE]: {
		[STATUS_ORD.PROCESS]: {
			type: 'process',
			txt: 'placingOrder'
		},
		[STATUS_ORD.SUCCESS]: {
			type: 'success',
			txt: 'placeOrderSuccess'
		},
		[STATUS_ORD.ERROR]: {
			type: 'error',
			txt: ''
		},
		[STATUS_ORD.TIMEOUT]: {
			type: 'error',
			txt: ''
		}
	},
	[ACTION_ORD.MODIFY]: {
		[STATUS_ORD.PROCESS]: {
			type: 'process',
			txt: 'modifingOrder'
		},
		[STATUS_ORD.SUCCESS]: {
			type: 'success',
			txt: 'modifyOrderSuccess'
		},
		[STATUS_ORD.ERROR]: {
			type: 'error',
			txt: ''
		},
		[STATUS_ORD.TIMEOUT]: {
			type: 'error',
			txt: ''
		}
	},
	[ACTION_ORD.CANCEL]: {
		[STATUS_ORD.PROCESS]: {
			type: 'process',
			txt: 'cancellingOrder'
		},
		[STATUS_ORD.SUCCESS]: {
			type: 'success',
			txt: 'cancelOrderSuccess'
		},
		[STATUS_ORD.ERROR]: {
			type: 'error',
			txt: ''
		},
		[STATUS_ORD.TIMEOUT]: {
			type: 'error',
			txt: ''
		}
	}
};

const DURATION_STRING = {
	DAY: 'Day Only',
	GTC: 'Good Till Cancelled',
	IOC: 'Immediate Or Cancel',
	FOK: 'Fill Or Kill',
	FAK: 'Fill And Kill',
	GTD: 'Good Till Date',
	'Day Only': 'DAY',
	'Good Till Cancelled': 'GTC',
	'Immediate Or Cancel': 'IOC',
	'Fill Or Kill': 'FOK',
	'Fill And Kill': 'FAK',
	'Good Till Date': 'GTD'
};

const DURATION_CODE = {
	DAY: 'DAY',
	IOC: 'IOC',
	FOK: 'FOK',
	FAK: 'FAK',
	GTC: 'GTC',
	GTD: 'GTD',
	'3DAY': '3DAY',
	ATO: 'ATO',
	NA: 'NA',
	GTM: 'GTM',
	PAK: 'PAK',
	POK: 'POK',
	GTT: 'GTT',
	GTF: 'GTF',
	DATE: 'DATE',
	EOD: 'EOD'
};

const DURATION_MAPPING_STRING_CODE = {
	[DURATION_STRING.DAY]: DURATION_CODE.DAY,
	[DURATION_STRING.IOC]: DURATION_CODE.IOC,
	[DURATION_STRING.FOK]: DURATION_CODE.FOK,
	[DURATION_STRING.FAK]: DURATION_CODE.FAK,
	[DURATION_STRING.GTC]: DURATION_CODE.GTC,
	[DURATION_STRING.GTD]: DURATION_CODE.GTD
};

const ERROR_CODE = {
	SUCCESS: 'SUCCESS',
	ERR_INTERNAL_CLI: 'Error',
	TIMEOUT: '["Server.Timeout"]',
	TIMEOUT_NOTI: 'TIMEOUT_NOTI',
	RESPONSE_NULL: 'RESPONSE_NULL',
	CANCEL_REQUEST: 'CANCEL_REQUEST',
	INVALID_ORDER: 'INVALID_ORDER',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

const MENU_SELECTED = {
	search: 'search',
	newAlert: 'newAlert',
	alert: 'alert',
	marketOverview: 'marketOverview',
	order: 'order',
	orders: 'orders',
	portfolio: 'portfolio',
	watchlist: 'watchlist',
	watchlist_drawer: 'watchlist_drawer',
	news: 'news',
	reports: 'reports',
	reportsFromFile: 'reportsFromFile',
	settings: 'settings',
	account: 'account',
	theme: 'themes',
	appInfo: 'appInfo',
	termOfUse: 'termOfUse',
	contractNote: 'ContractNote',
	businessLog: 'Business Log',
	helpCenter: 'Help Center',
	languageOptions: 'LanguageOptions',
	userInfo: 'UserInfo',
	textSizeSetting: 'TextSizeSetting',
	news_v3: 'news_v3',
	watchlist_mt_panel: 'watchlist_mt_panel',
	activities: 'activities',
	alertLog: 'alertLog'
};

const ROLE_USER = {
	ROLE_MARKET_OVERVIEW: 'MAINMENU_2',
	ROLE_NEW_ORDER: 'MAINMENU_0',
	ROLE_ORDERS: 'MAINMENU_4',
	ROLE_PORTFOLIO_HOLDING_PERFORMANCE: 'MAINMENU_7',
	ROLE_PORTFOLIO_SUMMARY: 'MAINMENU_8',
	ROLE_PORTFOLIO_SUMMARY_EQUITY: 'MAINMENU_37',
	ROLE_PORTFOLIO_SUMMARY_DERIVATIVES: 'MAINMENU_38',
	ROLE_WATCHLIST: 'MAINMENU_6',
	ROLE_NEWS: 'MAINMENU_3',
	ROLE_CONTRACT_NOTES: 'MAINMENU_10',
	ROLE_REPORTS: 'MAINMENU_11',
	ROLE_REPORTS_FROM_FILE: 'MAINMENU_28',
	ROLE_ACTIVITIES: 'MAINMENU_12',
	ROLE_SETTINGS: 'MAINMENU_13',
	ROLE_ACCOUNT: 'MAINMENU_9',
	// ROLE_APP_INFO: 'MAINMENU_25',
	ROLE_WHATS_NEW: 'MAINMENU_26',
	ROLE_TERM_OF_USER: 'MAINMENU_27',
	ROLE_VIEW_NEW_ALERT: 'MAINMENU_29',
	ROLE_VIEW_SECURITY_DETAIL: 'MAINMENU_31',
	ROLE_VIEW_ALERT: 'MAINMENU_30',
	ROLE_PORTFOLIO_SUMMARY2: 'MAINMENU_34',
	ROLE_ALERT_LOG: 'MAINMENU_24'
};

const ROLE_DETAIL = {
	PLACE_BUY_SELL_NEW_ORDER: 'NEWORDER_0',
	VIEW_MARKET_DEPTH_NEW_ORDER: 'NEWORDER_1',
	VIEW_COURSE_OF_SALES_NEW_ORDER: 'NEWORDER_2',
	CONFIRM_PLACE_BUY_SELL_NEW_ORDER: 'NEWORDER_3',
	MODIFY_BUY_SELL_ORDER: 'MODIFYORDER_0',
	VIEW_MARKET_DEPTH_MODIFY_ORDER: 'MODIFYORDER_1',
	VIEW_COURSE_OF_SALES_MODIFY_ORDER: 'MODIFYORDER_2',
	CONFIRM_MODIFY_BUY_OR_SELL_ORDER: 'MODIFYORDER_3',
	CONFIRM_CANCEL_BUY_OR_SELL_ORDER: 'CANCELORDER_0',
	VIEW_CHART_OF_INDICES: 'MARKETOVERVIEW_0',
	C_E_R_WATCHLIST: 'WATCHLIST_0',
	PERFORM_BUY_SELL_BUTTON: 'WATCHLIST_1',
	VIEW_CHART_OF_SYMBOL: 'WATCHLIST_2',
	VIEW_NEWS_OF_SYMBOL: 'WATCHLIST_3',
	PERFORM_MORE_BUTTON: 'WATCHLIST_4',
	//
	PERFORM_MODIFY_ORDER_BUTTON: 'ORDERS_0',
	PERFORM_CANCEL_ORDER_BUTTON: 'ORDERS_1',
	PERFORM_NEW_ORDER_BUTTON_PORTFOLIO: 'PORTFOLIO_0',
	PERFORM_CLOSE_ORDER_BUTTON: 'PORTFOLIO_1',
	QUICK_SEARCH_BUTTON: 'QUICKBUTTON_0',
	PERFORM_NEW_ORDER_QUICK_BUTTON: 'QUICKBUTTON_1',
	PERFORM_SEARCH_QUICK_BUTTON: 'QUICKBUTTON_2',
	PERFORM_NEW_ALERT_QUICK_BUTTON: 'QUICKBUTTON_3',
	PERFORM_BUY_SELL_UNIVERSALSEARCH_BUTTON: 'UNIVERSALSEARCH_0',
	VIEW_MARKET_DEPTH_UNIVERSALSEARCH: 'UNIVERSALSEARCH_1',
	VIEW_COURSE_OF_SALS_UNIVERSALSEARCH: 'UNIVERSALSEARCH_2',
	VIEW_NEWS_OF_SYMBOL_UNIVERSALSEARCH: 'UNIVERSALSEARCH_3',
	VIEW_ORDERS_UNIVERSALSEARCH: 'UNIVERSALSEARCH_4',
	PERFORM_MODIFY_ORDER_UNIVERSALSEARCH_BUTTON: 'UNIVERSALSEARCH_5',
	PERFROM_CANCEL_UNIVERSALSEARCH_BUTTON: 'UNIVERSALSEARCH_6',
	VIEW_HOLDING_UNIVERSALSEARCH: 'UNIVERSALSEARCH_7',
	PERFORM_NEW_ORDER_UNIVERSALSEARCH_BUTTON: 'UNIVERSALSEARCH_8',
	PERFORM_CLOSE_ORDER_UNIVERSALSEARCH_BUTTONL: 'UNIVERSALSEARCH_9',
	//
	PERFORM_MODIFY_ORDER_BUTTON_DETAIL: 'ORDERDETAIL_0',
	PERFORM_CANCEL_ORDER_BUTTON_DETAIL: 'ORDERDETAIL_1',
	PERFORM_NEW_ORDER_BUTTON_DETAIL: 'ORDERDETAIL_2',
	PERFORM_BUY_SELL_BUTTON_DEPTH: 'DEPTH_0',
	ROLE_PERFORM_CONFIRM_BUTTON: 'NEWALERT_0',
	ROLE_PERFORM_EDIT_BUTTON: 'ALERTS_0',
	ROLE_PERFORM_REMOVE_BUTTON: 'ALERTS_1',
	ROLE_PERFORM_MODIFY_BUTTON: 'ALERTS_2',
	ROLE_PERFORM_MODIFY_ALERT_CONFIRM_BUTTON: 'MODIFYALERT_0'
};

const PRIORITY_SCREEN = {
	[ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE]: {
		id: 0,
		text: 'portfolio',
		menuSelected: MENU_SELECTED.portfolio
	},
	[ROLE_USER.ROLE_MARKET_OVERVIEW]: {
		id: 2,
		text: 'marketOverview1',
		menuSelected: MENU_SELECTED.marketOverview
	},
	[ROLE_USER.ROLE_WATCHLIST]: {
		id: 3,
		text: 'WatchList1',
		menuSelected: MENU_SELECTED.watchlist
	},
	[ROLE_USER.ROLE_ORDERS]: {
		id: 4,
		text: 'Orders',
		menuSelected: MENU_SELECTED.orders
	},
	[ROLE_USER.ROLE_PORTFOLIO_SUMMARY]: {
		id: 5,
		text: 'portfolio',
		menuSelected: MENU_SELECTED.portfolio
	},
	[ROLE_USER.ROLE_NEW_ORDER]: {
		id: 6,
		text: 'newOrder1',
		menuSelected: MENU_SELECTED.order
	},
	[ROLE_USER.ROLE_NEWS]: {
		id: 7,
		text: 'News',
		menuSelected: MENU_SELECTED.news
	},
	[ROLE_USER.ROLE_REPORTS]: {
		id: 8,
		text: 'reports',
		menuSelected: MENU_SELECTED.reports
	},
	[ROLE_USER.ROLE_REPORTS_FROM_FILE]: {
		id: 13,
		text: 'reports',
		menuSelected: MENU_SELECTED.reportsFromFile
	},
	[ROLE_USER.ROLE_ACCOUNT]: {
		id: 9,
		text: 'userInfo',
		menuSelected: MENU_SELECTED.account
	},
	[ROLE_USER.ROLE_CONTRACT_NOTES]: {
		id: 10,
		text: 'contractNoteNoSpace',
		menuSelected: MENU_SELECTED.contractNote
	},
	[ROLE_USER.ROLE_ACTIVITIES]: {
		id: 11,
		text: 'activities',
		menuSelected: MENU_SELECTED.businessLog
	},
	[ROLE_USER.ROLE_SETTINGS]: {
		id: 12,
		text: 'settings',
		menuSelected: MENU_SELECTED.settings
	},
	[ROLE_USER.ROLE_TERM_OF_USER]: {
		id: 14,
		text: 'Disclaimer',
		menuSelected: MENU_SELECTED.termOfUse
	}
};

const RESPONSE_STATUS = {
	PASS: 'PASS',
	FAIL: 'FAIL',
	EXCEPTION: 'EXCEPTION'
};

const ORDER_ACTION = {
	PLACE: 'PLACE',
	AMEND: 'AMEND',
	CANCEL: 'CANCEL'
};

const CURRENCY = {
	AUD: 'AUD',
	USD: 'USD',
	VND: 'VND'
};

const EXCHANGE = {
	ASX: 'ASX',
	LME: 'XLME'
};

const TRAILING_TYPE = {
	AMOUNT: 'Amount',
	PERCENT: 'Percent'
};

const TIMEZONE = {
	AU: 10,
	US: -4,
	AU_WINTER: 11,
	US_WINTER: -5
};

const LOCATION = {
	AU: 'Australia/Sydney',
	US: 'America/New_York',
	VI: 'Asia/Bangkok'
};

const ENVIRONMENT = {
	NEXT: 'NEXT',
	STAGING: 'STAGING',
	PRODUCTION: 'PRODUCTION',
	DEMO: 'DEMO',
	BETA: 'BETA',
	IRESS: 'IRESS',
	IRESS_DEV2: 'IRESS_DEV2',
	IRESS_UAT: 'IRESS_UAT',
	IRESS_PROD: 'IRESS_PROD',
	IRESS_DEV4: 'IRESS_DEV4',
	IRESS_DEV5: 'IRESS_DEV5',
	IRESS_ABSA: 'IRESS_ABSA',
	CIMB_DEV: 'CIMB_DEV',
	CIMB_UAT: 'CIMB_UAT',
	CIMB_PROD: 'CIMB_PROD',
	HL_DEV: 'HL_DEV',
	HL_UAT: 'HL_UAT'
};

const SUB_ENVIRONMENT = {
	NEXT: 'NEXT',
	IRESS_V4: 'IRESS V4',
	EQUIX_DEMO: 'EQUIX DEMO',
	PRODUCT_DEMO: 'PRODUCT DEMO',
	PRODUCT: 'PRODUCT',
	BETA: 'BETA',
	IRESS: 'IRESS'
};

const NAVIGATOR_EVENT = {
	NAVBAR_BUTTON_PRESS: 'NavBarButtonPress',
	BACK_BUTTON_PRESS: 'backPress'
};

const SIDE = {
	BUY: 'BUY',
	SELL: 'SELL',
	BUYING: 'BUYING',
	SELLING: 'SELLING'
};

const STREAMING_MARKET_TYPE = {
	QUOTE: 'QUOTE',
	DEPTH: 'DEPTH',
	TRADES: 'TRADES'
};

const SCREEN = {
	TRADE: 'equix.Trade',
	ADDCODE: 'equix.AddCode',
	SEARCH_ODER: 'equix.SearchOrder',
	SEARCH_CODE: 'equix.SearchCode',
	PORTFOLIO_WRAPPER: 'equix.Portfolio',
	FIND_WATCHLIST: 'equix.FindWatchlist',
	CREATE_PRICEBOARD: 'equix.CreatePriceboard',
	HOLDING_PORTFOLIO: 'equix.HoldingPortfolio',
	MANAGE_PRICEBOARD: 'equix.ManagePriceboard',
	CONFIRM_PLACE_ORDER: 'equix.ConfirmPlaceOrder',
	CONFIRM_MODIFY_ORDER: 'equix.ConfirmModifyOrder',
	CONFIRM_CANCEL_ORDER: 'equix.ConfirmCancelOrder',
	MANAGE_PRICEBOARD_STATIC: 'equix.ManagePriceboardStatic',
	CUSTOM_BUTTON_CATEGORIES: 'equix.CustomButtonCategories',
	CUSTOM_BACK_BUTTON: 'equix.CustomBackButton',
	MANAGE_PRICEBOARD_PERSONAL: 'equix.ManagePriceboardPersonal',
	ADD_ALERT: 'equix.AddAlert',
	MODIFY_ALERT: 'equix.ModifyAlert',
	NEW_ALERT: 'equix.NewAlert'
};

const NAVIGATION_TYPE = {
	SCREEN: 'SCREEN',
	MODAL: 'MODAL'
};

const ANIMATED_TYPE = {
	NONE: 'none',
	SLIDE_UP: 'slide-up',
	SLIDE_DOWN: 'slide-down',
	SLIDE_HORIZONTAL: 'slide-horizontal'
};

const TITLE_FORM = {
	CONFIRM_ORDER: 'Confirm Order',
	CONFIRM_CANCELLING_ORDER: 'Confirm Cancelling Order'
};

const ID_ELEMENT = {
	BTN_BACK_CONFIRM_ORDER: 'btnBackConfirmOrder',
	BTN_BACK_NEW_ORDER: 'btnBackNewOrder',
	BTN_BACK_NEW_ALERT: 'btnBackNewAlert'
};

const ICON_NAME = {
	ARROW_BACK: {
		IOS: 'ios-arrow-back',
		ANDROID: 'md-arrow-back'
	},
	MD_ARROW_DROPDOWN: {
		IOS: 'ios-arrow-forward',
		ANDROID: 'md-arrow-forward'
	},
	SEARCH: {
		IOS: 'ios-arrow-forward',
		ANDROID: 'md-arrow-forward'
	}
};

const FEE = {
	PARITECH_VAL: 13.948,
	PARITECH_LIMITED: 20000,
	PARITECH_PERCENT: 0.0007
};

const ORDER_TYPE_STRING = {
	STOP_ORDER: 'STOP',
	LIMIT_ORDER: 'LIMIT',
	MARKET_ORDER: 'MARKET',
	MARKETTOLIMIT_ORDER: 'MARKET TO LIMIT',
	TRAILINGSTOP_ORDER: 'TRAILING STOP',
	TRAILINGSTOPLIMIT_ORDER: 'TRAILING STOP LIMIT',
	STOPLIMIT_ORDER: 'STOP LIMIT',
	STOPLOSS_ORDER: 'STOP LOSS',
	BEST_ORDER: 'BEST ORDER'
};

const ORDER_STATE_SAXO_CODE = {
	NEW: 'NEW',
	PARTIALLY_FILLED: 'PARTIALLY_FILLED',
	FILLED: 'FILLED',
	DONE_FOR_DAY: 'DONE_FOR_DAY',
	CANCELED: 'CANCELED',
	REPLACED: 'REPLACED',
	PENDING_CANCEL: 'PENDING_CANCEL',
	STOPPED: 'STOPPED',
	REJECTED: 'REJECTED',
	SUSPENDED: 'SUSPENDED',
	PENDING_NEW: 'PENDING_NEW',
	CALCULATED: 'CALCULATED',
	EXPIRED: 'EXPIRED',
	ACCEPTED_FOR_BIDDING: 'ACCEPTED_FOR_BIDDING',
	PENDING_REPLACE: 'PENDING_REPLACE'
};

const ORDER_STATE_STRING = {
	//  saxo
	NEW: 'New',
	PARTIALLY_FILLED: 'Partially Filled',
	FILLED: 'Filled',
	DONE_FOR_DAY: 'Done For Day',
	CANCELED: 'Canceled',
	REPLACED: 'Replaced',
	PENDING_CANCEL: 'Pending Cancel',
	STOPPED: 'Stopped',
	REJECTED: 'Rejected',
	SUSPENDED: 'Suspended',
	PENDING_NEW: 'Pending New',
	CALCULATED: 'Calculated',
	EXPIRED: 'Expired',
	ACCEPTED_FOR_BIDDING: 'Accepted For Bidding',
	PENDING_REPLACE: 'Pending Replace',
	//  paritech
	AcceptedForBidding: 'Accepted For Bidding',
	Amended: 'Amended',
	Amending: 'Amending',
	Calculated: 'Calculated',
	Cancelled: 'Cancelled',
	Cancelling: 'Cancelling',
	DoneForDay: 'Done For Day',
	Expired: 'Expired',
	Filled: 'Filled',
	OnMarket: 'On Market',
	PartialFill: 'Partially Filled',
	Pending: 'Pending',
	Rejected: 'Rejected',
	Stopped: 'Stopped',
	Suspended: 'Suspended',
	Unknown: 'Unknown',
	Triggered: 'Triggered',
	UserAmend: 'Amend',
	UserCancel: 'Cancel',
	UserPlace: 'Place',
	RejectAmend: 'Reject Amend',
	RejectCancel: 'Reject Cancel',
	Done: 'Done'
};

const ORDER_STATE_SYSTEM = {
	ACCEPTEDFORBIDDING: 'AcceptedForBidding',
	AMENDED: 'Amended',
	AMENDING: 'Amending',
	CALCULATED: 'Calculated',
	CANCELLED: 'Cancelled',
	CANCELLING: 'Cancelling',
	DONEFORDAY: 'DoneForDay',
	EXPIRED: 'Expired',
	FILLED: 'Filled',
	ONMARKET: 'OnMarket',
	PARTIALFILL: 'PartialFill',
	PENDING: 'Pending',
	REJECTED: 'Rejected',
	STOPPED: 'Stopped',
	SUSPENDED: 'Suspended',
	UNKNOWN: 'Unknown',
	TRIGGERED: 'Triggered',
	USERAMEND: 'UserAmend',
	USERCANCEL: 'UserCancel',
	USERPLACE: 'UserPlace',
	REJECTAMEND: 'RejectAmend',
	REJECTCANCEL: 'RejectCancel',
	DONE: 'Done'
};

const ACCOUNT_STATE = {
	ACTIVE: 'active',
	INACTIVE: 'inactive'
};

const CHANNEL = {
	ALL: 'ALL',
	ORDER_DETAIL: 'ORDER_DETAIL',
	ORDER_DETAIL_ORIGIN: 'ORDER_DETAIL_ORIGIN',
	ORDER_ORIGIN_CLIENT: 'ORDER_ORIGIN_CLIENT',
	ORDER_ORIGIN_BROKER: 'ORDER_ORIGIN_BROKER',
	ACCOUNT: 'ACCOUNT',
	STREAMING: 'STREAMING'
};

const EVENT = {
	FINISH_UPDATE_LIST_ACCOUNT: 'FINISH_UPDATE_LIST_ACCOUNT',
	UPDATE_SELECTED_ACCOUNT: 'UPDATE_SELECTED_ACCOUNT'
};

const SPECIAL_STRING = {
	NULL_VALUE: '--'
};

const PRICE_FILL_TYPE = {
	_1D: '1D',
	_1W: '1W',
	_1M: '1M',
	_3M: '3M',
	_6M: '6M',
	_YTD: 'YTD',
	_1Y: '1Y',
	_3Y: '3Y',
	_5Y: '5Y',
	_10Y: '10Y',
	_ALL: 'ALL'
};

const LIST_FILTER_TIME = {
	all: 'All',
	day: 'Day',
	week: 'Week',
	month: 'Month',
	quarter: 'Quarter',
	year: 'Year',
	custom: 'Custom'
};

const LIST_FILTER_ACTION_OPERATOR = {
	all: 'All',
	signInSignOut: 'Sign In / Sign Out',
	// enterPin: 'Enter PIN',
	updateWatchList: 'Update Watchlist',
	placeOrder: 'Place Order',
	modifyOrder: 'Modify Order',
	cancelOrder: 'Cancel Order',
	queryReport: 'Request Report',
	updateSetting: 'Update Setting',
	updateSCM: 'Update SCM',
	changeNewsSource: 'Change News Source',
	changeStatus: 'Change Status',
	changeao: 'Change Add-ons',
	resetPasswordLower: 'Reset Password',
	forgotPasswordLower: 'Forgot Password',
	createUser: 'Create User',
	updateUser: 'Update User',
	createRoleGroup: 'Create Role',
	updateRoleGroup: 'Update Role',
	deleteRoleGroup: 'Delete Role',
	changeMarketData: 'Change Market Data',
	updateVettingRule: 'Update Vetting Rule'
};

const LIST_FILTER_ACTION = {
	all: 'All',
	signInSignOut: 'Sign In / Sign Out',
	// enterPin: 'Enter PIN',
	updateWatchList: 'Update Watchlist',
	placeOrder: 'Place Order',
	modifyOrder: 'Modify Order',
	cancelOrder: 'Cancel Order',
	queryReport: 'Request Report',
	updateSetting: 'Update Setting',
	changeNewsSource: 'Change News Source',
	changeStatus: 'Change Status',
	changeao: 'Change Add-ons',
	resetPasswordLower: 'Reset Password',
	forgotPasswordLower: 'Forgot Password',
	createUser: 'Create User',
	updateUser: 'Update User',
	createRoleGroup: 'Create Role',
	updateRoleGroup: 'Update Role',
	deleteRoleGroup: 'Delete Role',
	changeMarketData: 'Change Market Data',
	updateVettingRule: 'Update Vetting Rule'
	// updateSCM: 'Update SCM'
};

const BAR_BY_PRICE_TYPE = {
	'1D': '5m',
	'1W': '1h',
	'1M': '1h',
	'3M': 'day',
	'6M': 'day',
	YTD: 'day',
	'1Y': 'day',
	'3Y': 'week',
	'5Y': 'week',
	'10Y': 'month',
	ALL: 'month'
};

const XAO_SUMMARY_FILTER = {
	'1D': '5m',
	'1W': '1h',
	'1M': 'day',
	'3M': 'day',
	YTD: 'day',
	ALL: 'day'
};

const SUMMARY_PERFORMANCE_FILTER = {
	'1D': 'day',
	'1W': 'week',
	'1M': 'month',
	'3M': '3months',
	YTD: 'ytd',
	ALL: 'all'
};

const DEFAULT_VAL = {
	FUNC: () => {},
	MAX_INT: 999999999999999
};

const MAX_LENGTH_COS = 50;

const EXCHANGE_CODE = {
	TRADE_MATCH: 'ASX:TM',
	CENTRE_POINT: 'ASX:CP',
	ASX: 'ASX:ASX',
	ASXCP: 'ASX:ASXCP',
	CXA: 'N:CXA',
	CXACP: 'CXA:CXACP',
	qCXA: 'N:qCXA',
	BESTMKT: 'N:BESTMKT',
	FIXED_CO: 'N:FIXED CO',
	AXW: 'AXW:ASX',
	WARRANT_CXA: 'CXA:CXA',
	ETF_MF_CXA: 'AXW:CXA',
	NSX_NSX: 'NSX:NSX'
};

const EXCHANGE_CODE_MAPPING = {
	[EXCHANGE_CODE.BESTMKT]: 'ASX:BESTMKT',
	[EXCHANGE_CODE.ASX]: 'ASX',
	[EXCHANGE_CODE.ASXCP]: 'ASX:ASXCP',
	[EXCHANGE_CODE.CXA]: 'CXA:CXA',
	[EXCHANGE_CODE.CXACP]: 'CXA:CXACP',
	[EXCHANGE_CODE.qCXA]: 'CXA:qCXA',
	[EXCHANGE_CODE.AXW]: 'AXW:ASX',
	[EXCHANGE_CODE.FIXED_CO]: 'N:FIXED CO',
	[EXCHANGE_CODE.NSX_NSX]: 'NSX:NSX'
};

const EXCHANGE_STRING = {
	TRADE_MATCH: 'ASX TradeMatch Market',
	CENTRE_POINT: 'ASX Centre Point',
	ASX: 'ASX',
	ASXCP: 'ASXCP',
	CXA: 'CXA',
	CXACP: 'CXACP',
	qCXA: 'qCXA',
	BESTMKT: 'BESTMKT',
	AXW: 'AXW',
	FIXED_CO: 'FIXED CO',
	WARRANT_CXA: 'CXA',
	ETF_MF_ASX: 'AXW',
	ETF_MF_CXA: 'CXA',
	NSX_NSX: 'NSX'
};

const EXCHANGE_CODE_STRING = {
	[EXCHANGE_CODE.TRADE_MATCH]: EXCHANGE_STRING.TRADE_MATCH,
	[EXCHANGE_CODE.CENTRE_POINT]: EXCHANGE_STRING.CENTRE_POINT,
	[EXCHANGE_CODE.ASX]: EXCHANGE_STRING.ASX,
	[EXCHANGE_CODE.ASXCP]: EXCHANGE_STRING.ASXCP,
	[EXCHANGE_CODE.CXA]: EXCHANGE_STRING.CXA,
	[EXCHANGE_CODE.CXACP]: EXCHANGE_STRING.CXACP,
	[EXCHANGE_CODE.CXACP]: EXCHANGE_STRING.CXACP,
	[EXCHANGE_CODE.qCXA]: EXCHANGE_STRING.qCXA,
	[EXCHANGE_CODE.BESTMKT]: EXCHANGE_STRING.BESTMKT,
	[EXCHANGE_CODE.AXW]: EXCHANGE_STRING.AXW,
	[EXCHANGE_CODE.WARRANT_CXA]: EXCHANGE_STRING.WARRANT_CXA,
	[EXCHANGE_CODE.ETF_MF_ASX]: EXCHANGE_STRING.ETF_MF_ASX,
	[EXCHANGE_CODE.ETF_MF_CXA]: EXCHANGE_STRING.ETF_MF_CXA,
	[EXCHANGE_CODE.FIXED_CO]: EXCHANGE_STRING.FIXED_CO,
	[EXCHANGE_CODE.NSX_NSX]: EXCHANGE_STRING.NSX_NSX
};

const EXCHANGE_STRING_CODE = {
	[EXCHANGE_STRING.TRADE_MATCH]: EXCHANGE_CODE.TRADE_MATCH,
	[EXCHANGE_STRING.CENTRE_POINT]: EXCHANGE_CODE.CENTRE_POINT,
	[EXCHANGE_STRING.ASX]: EXCHANGE_CODE.ASX,
	[EXCHANGE_STRING.ASXCP]: EXCHANGE_CODE.ASXCP,
	[EXCHANGE_STRING.CXA]: EXCHANGE_CODE.CXA,
	[EXCHANGE_STRING.CXACP]: EXCHANGE_CODE.CXACP,
	[EXCHANGE_STRING.qCXA]: EXCHANGE_CODE.qCXA,
	[EXCHANGE_STRING.BESTMKT]: EXCHANGE_CODE.BESTMKT,
	[EXCHANGE_STRING.AXW]: EXCHANGE_CODE.AXW,
	[EXCHANGE_STRING.WARRANT_CXA]: EXCHANGE_CODE.WARRANT_CXA,
	[EXCHANGE_STRING.ETF_MF_ASX]: EXCHANGE_CODE.ETF_MF_ASX,
	[EXCHANGE_STRING.ETF_MF_CXA]: EXCHANGE_CODE.ETF_MF_CXA,
	[EXCHANGE_STRING.NSX_NSX]: EXCHANGE_CODE.NSX_NSX
};

const EXCHANGE_BY_VETTING_CODE = {
	21006: EXCHANGE_STRING.ASX,
	21007: EXCHANGE_STRING.ASXCP,
	21008: EXCHANGE_STRING.CXA,
	21009: EXCHANGE_STRING.CXACP,
	21010: EXCHANGE_STRING.qCXA,
	21011: EXCHANGE_STRING.BESTMKT
};

const VETTING_CODE_BY_EXCHANGE = {
	[EXCHANGE_STRING.ASX]: 21006,
	[EXCHANGE_STRING.ASXCP]: 21007,
	[EXCHANGE_STRING.CXA]: 21008,
	[EXCHANGE_STRING.CXACP]: 21009,
	[EXCHANGE_STRING.qCXA]: 21010,
	[EXCHANGE_STRING.BESTMKT]: 21011
};

const VETTING_ORDER_TYPE_DURATION_BY_EXCHANGE = {
	21006: {
		// ASX EXCHANGE
		orderType: {
			23008: {
				orderType: 'market',
				condition: '--'
			},
			23009: {
				orderType: 'limit',
				condition: '--'
			},
			23010: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23011: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22020: {
				duration: DURATION_STRING.DAY
			},
			22021: {
				duration: DURATION_STRING.IOC
			},
			22022: {
				duration: DURATION_STRING.FOK
			},
			22023: {
				duration: DURATION_STRING.GTC
			},
			22024: {
				duration: DURATION_STRING.GTD
			}
		}
	},
	21007: {
		orderType: {
			23012: {
				orderType: 'market',
				condition: '--'
			},
			23013: {
				orderType: 'limit',
				condition: '--'
			},
			23014: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23015: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22025: {
				duration: DURATION_STRING.DAY
			},
			22026: {
				duration: DURATION_STRING.IOC
			},
			22027: {
				duration: DURATION_STRING.FOK
			},
			22028: {
				duration: DURATION_STRING.GTC
			},
			22029: {
				duration: DURATION_STRING.GTD
			}
		}
	},
	21008: {
		orderType: {
			23016: {
				orderType: 'market',
				condition: '--'
			},
			23017: {
				orderType: 'limit',
				condition: '--'
			},
			23018: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23019: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22030: {
				duration: DURATION_STRING.DAY
			},
			22031: {
				duration: DURATION_STRING.IOC
			},
			22032: {
				duration: DURATION_STRING.FOK
			},
			22033: {
				duration: DURATION_STRING.GTC
			},
			22034: {
				duration: DURATION_STRING.GTD
			}
		}
	},
	21009: {
		orderType: {
			23020: {
				orderType: 'market',
				condition: '--'
			},
			23021: {
				orderType: 'limit',
				condition: '--'
			},
			23022: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23023: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22035: {
				duration: DURATION_STRING.DAY
			},
			22036: {
				duration: DURATION_STRING.IOC
			},
			22037: {
				duration: DURATION_STRING.FOK
			},
			22038: {
				duration: DURATION_STRING.GTC
			},
			22039: {
				duration: DURATION_STRING.GTD
			}
		}
	},
	21010: {
		orderType: {
			23024: {
				orderType: 'market',
				condition: '--'
			},
			23025: {
				orderType: 'limit',
				condition: '--'
			},
			23026: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23027: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22040: {
				duration: DURATION_STRING.DAY
			},
			22041: {
				duration: DURATION_STRING.IOC
			},
			22042: {
				duration: DURATION_STRING.FOK
			},
			22043: {
				duration: DURATION_STRING.GTC
			},
			22044: {
				duration: DURATION_STRING.GTD
			}
		}
	},
	21011: {
		orderType: {
			23028: {
				orderType: 'market',
				condition: '--'
			},
			23029: {
				orderType: 'limit',
				condition: '--'
			},
			23030: {
				orderType: 'market',
				condition: 'stopLoss'
			},
			23031: {
				orderType: 'limit',
				condition: 'stopLoss'
			}
		},
		duration: {
			22045: {
				duration: DURATION_STRING.DAY
			},
			22046: {
				duration: DURATION_STRING.IOC
			},
			22047: {
				duration: DURATION_STRING.FOK
			},
			22048: {
				duration: DURATION_STRING.GTC
			},
			22049: {
				duration: DURATION_STRING.GTD
			}
		}
	}
};

const TYPE_VALID_CUSTOM_INPUT = {
	INTEGER: 'integer',
	PRICE: 'price'
};

const DISPLAY_TYPE = {
	INTEGER: 'integer',
	PRICE: 'price'
};

const KEYBOARD_TYPE = {
	DEFAULT: 'default',
	EMAIL_ADDRESS: 'email-address',
	NUMERIC: 'numeric',
	PHONE_PAD: 'phone-pad',
	ASCII_CAPABLE: 'ascii-capable',
	NUMBERS_AND_PUNCTUATION: 'numbers-and-punctuation',
	URL: 'url',
	NUMBER_PAD: 'number-pad',
	NAME_PHONE_PAD: 'name-phone-pad',
	DECIMAL_PAD: 'decimal-pad',
	TWITTER: 'twitter',
	WEB_SEARCH: 'web-search',
	Trading_Strategy_Numeric_Board: 'Trading_Strategy_Numeric_Board',
	Order_Volume_Numeric_Board: 'Order_Volume_Numeric_Board',
	Limit_Price_Numeric_Board: 'Limit_Price_Numeric_Board'
};

const PRICE_MAP_KEY = {
	personal: 'Personal',
	indices: 'Indices',
	top20: 'S&P 20',
	top50: 'S&P 50',
	top100: 'S&P 100',
	top200: 'S&P 200',
	nasdaq1: 'Tradable NASDAQ Stocks #1',
	nasdaq2: 'Tradable NASDAQ Stocks #2',
	nyse1: 'Tradable NYSE Stocks #1',
	nyse2: 'Tradable NYSE Stocks #2',
	nyse3: 'Tradable NYSE Stocks #3',
	nyse4: 'Tradable NYSE Stocks #4',
	nyse5: 'Tradable NYSE Stocks #5',
	xase: 'Tradable AMEX Stocks'
	// arcx: 'Tradable NYSE Arca Stocks'
};

const PRICE_LIST_AU = [
	'Indices',
	'S&P 20',
	'S&P 50',
	'S&P 100',
	'S&P 200',
	'Top Gainers',
	'Top Losers',
	'Top Value'
];

const PRICE_LIST_US = [
	'Tradable NASDAQ Stocks #1',
	'Tradable NASDAQ Stocks #2',
	'Tradable NYSE Stocks #1',
	'Tradable NYSE Stocks #2',
	'Tradable NYSE Stocks #3',
	'Tradable NYSE Stocks #4',
	'Tradable NYSE Stocks #5',
	'Tradable AMEX Stocks'
];

const PRICE_LIST = ['Personal', ...PRICE_LIST_AU, ...PRICE_LIST_US];

const LIST_PRICE_OBJECT_AU = [
	{
		watchlist: 'top-asx-index',
		watchlist_name: 'ASX Indices',
		path: 'top-asx-index/0'
	},
	{
		watchlist: 'top-asx-20',
		watchlist_name: 'ASX S&P 20',
		path: 'top-asx-20/0'
	},
	{
		watchlist: 'top-asx-50',
		watchlist_name: 'ASX S&P 50',
		path: 'top-asx-50/0'
	},
	{
		watchlist: 'top-asx-100',
		watchlist_name: 'ASX S&P 100',
		path: 'top-asx-100/0'
	},
	{
		watchlist: 'top-asx-200',
		watchlist_name: 'ASX S&P 200',
		path: 'top-asx-200/0'
	},
	{
		watchlist: 'top-price-gainer',
		watchlist_name: 'ASX Top Gainers',
		path: 'top-price-gainer/0'
	},
	{
		watchlist: 'top-price-loser',
		watchlist_name: 'ASX Top Losers',
		path: 'top-price-loser/0'
	},
	{
		watchlist: 'top-price-market-value',
		watchlist_name: 'ASX Top Value',
		path: 'top-price-market-value/0'
	},
	{
		watchlist: 'NSX',
		watchlist_name: 'NSX',
		path: 'NSX/0'
	}
];

const PRICEBOARD_STATIC_ID = {
	SP_20: 'top-asx-20',
	SP_50: 'top-asx-50'
};

const LIST_PRICE_OBJECT_US = [
	{
		watchlist: 'tradable-NASDAQ-01',
		watchlist_name: 'Tradable NASDAQ Stocks #1',
		path: 'tradable-NASDAQ-01/0',
		title: 'NASDAQ #1'
	},
	{
		watchlist: 'tradable-NASDAQ-02',
		watchlist_name: 'Tradable NASDAQ Stocks #2',
		path: 'tradable-NASDAQ-02/0',
		title: 'NASDAQ #2'
	},
	{
		watchlist: 'tradable-NYSE-01',
		watchlist_name: 'Tradable NYSE Stocks #1',
		path: 'tradable-NYSE-01/0',
		title: 'NYSE #1'
	},
	{
		watchlist: 'tradable-NYSE-02',
		watchlist_name: 'Tradable NYSE Stocks #2',
		path: 'tradable-NYSE-02/0',
		title: 'NYSE #2'
	},
	{
		watchlist: 'tradable-NYSE-03',
		watchlist_name: 'Tradable NYSE Stocks #3',
		path: 'tradable-NYSE-03/0',
		title: 'NYSE #3'
	},
	{
		watchlist: 'tradable-NYSE-04',
		watchlist_name: 'Tradable NYSE Stocks #4',
		path: 'tradable-NYSE-04/0',
		title: 'NYSE #4'
	},
	{
		watchlist: 'tradable-NYSE-05',
		watchlist_name: 'Tradable NYSE Stocks #5',
		path: 'tradable-NYSE-05/0',
		title: 'NYSE #5'
	},
	{
		watchlist: 'tradable-XASE',
		watchlist_name: 'Tradable AMEX Stocks',
		path: 'tradable-XASE/0',
		title: 'AMEX'
	}
];

const LIST_PRICE_OBJECT = [...LIST_PRICE_OBJECT_AU, ...LIST_PRICE_OBJECT_US];

const PRICE_LIST_GUEST = [
	'Indices',
	'S&P 20',
	'S&P 50',
	'S&P 100',
	'S&P 200',
	'Tradable NASDAQ Stocks #1',
	'Tradable NASDAQ Stocks #2',
	'Tradable NYSE Stocks #1',
	'Tradable NYSE Stocks #2',
	'Tradable NYSE Stocks #3',
	'Tradable NYSE Stocks #4',
	'Tradable NYSE Stocks #5',
	'Tradable AMEX Stocks'
	// 'Tradable NYSE Arca Stocks'
];

const PRICE_LIST_TAB_LABEL = {
	personal: 'Personal',
	indices: 'Indices',
	top20: 'S&P 20',
	top50: 'S&P 50',
	top100: 'S&P 100',
	top200: 'S&P 200',
	nasdaq1: 'NASDAQ #1',
	nasdaq2: 'NASDAQ #2',
	nyse1: 'NYSE #1',
	nyse2: 'NYSE #2',
	nyse3: 'NYSE #3',
	nyse4: 'NYSE #4',
	nyse5: 'NYSE #5',
	xase: 'AMEX',
	arcx: 'NYSE Arca',
	FAVORITES: 'FAVORITES'
};

const FORMAT_TIME = {
	'DD/MM/YY': 'DD/MM/YY',
	'DD/MM/yy': 'DD/MM/yy',
	'DD/MM/YY hh:mm:ss.ms': 'DD/MM/YY hh:mm:ss.ms',
	'DD/MM/yy hh:mm:ss.ms': 'DD/MM/yy hh:mm:ss.ms',
	'DD/MM/yy hh:mm': 'DD/MM/yy hh:mm'
};

const USER_PRICE_SOURCE = {
	STREAMING: 'STREAMING',
	CLICK2F5: 'CLICK2F5',
	DELAY: 'DELAY'
};

const PRICE_SOURCE = {
	noAccess: 0,
	delayed: 1,
	clicktorefresh: 2,
	streaming: 3
};

const CACHE_TYPE = {
	SYMBOL_SEARCH: 'SYMBOL_SEARCH',
	ORDERS_OPEN: 'ORDERS_OPEN',
	ORDERS_DETAIL: 'ORDERS_DETAIL',
	ORDERS_STOPLOSS: 'ORDERS_STOPLOSS',
	ORDERS_FILLED: 'ORDERS_FILLED',
	ORDERS_CANCELLED: 'ORDERS_CANCELLED',
	SYMBOL_SEARCH_BY_COMPANY: 'SYMBOL_SEARCH_BY_COMPANY',
	SYMBOL_INFO: 'SYMBOL_INFO',
	PERSONAL: 'PERSONAL',
	SP20: 'SP20',
	SP50: 'SP50',
	SP100: 'SP100',
	SP200: 'SP200',
	NYSE1: 'NYSE1',
	NYSE2: 'NYSE2',
	NYSE3: 'NYSE3',
	NYSE4: 'NYSE4',
	NYSE5: 'NYSE5',
	NASDAQ1: 'NASDAQ1',
	NASDAQ2: 'NASDAQ2',
	XASE: 'XASE',
	ARCX: 'ARCX',
	TOPGAINERS: 'TOPGAINERS',
	TOPLOSERS: 'TOPLOSERS',
	TOPVALUE: 'TOPVALUE',
	TOTAL_PORTFOLIO: 'TOTAL_PORTFOLIO',
	ORDER_TRANSACTIONS: 'ORDER_TRANSACTIONS'
};

const TABLE_NAME = {
	open_order: 'open_order',
	orders_detail: 'orders_detail',
	filled_order: 'filled_order',
	filled_order_intraday: 'filled_order_intraday',
	cancelled_order: 'cancelled_order',
	cancelled_order_intraday: 'cancelled_order_intraday',
	open_stoploss_order: 'open_stoploss_order',
	symbol_search: 'symbol_search',
	symbol: 'symbol',
	personal: 'user-watchlist',
	top: 'top',
	nyse: 'nyse',
	nasdaq: 'nasdaq',
	xase: 'xase',
	arcx: 'arcx',
	topGainer: 'top-price-gainer',
	topLoser: 'top-price-loser',
	topValue: 'top-price-market-value'
};
const MONGO_METHOD = {
	findOne: 'findOne',
	find: 'find',
	findAll: 'findAll'
};
const CNOTE_FILTER_TYPE = {
	All: 'All',
	Day: 'Day',
	Week: 'Week',
	Month: 'Month',
	Quarter: 'Quarter',
	Year: 'Year',
	Custom: 'Custom'
};

const BUSINESS_LOG_FILTER_TYPE = {
	All: 'All',
	Day: 'Day',
	Week: 'Week',
	Month: 'Month',
	Quarter: 'Quarter',
	Year: 'Year'
};

const REPORT_DURATION = {
	Day: 'day',
	Week: 'week',
	Month: 'month',
	Quarter: 'quarter',
	Year: 'year'
};

const REPORT_DURATION1 = {
	Day: '1D',
	Week: '1W',
	Month: '1M',
	Month3: '3M',
	Month6: '6M',
	Quarter1: '1Q',
	Year: '1Y'
};

const REPORT_FROM_FILE_TYPE = {
	FINANCIAL_TRANSACTIONS: 'financialTransactions',
	PORTFOLIO_VALUATION: 'portfolioValuation',
	TRADE_ACTIVITY: 'tradeActivity'
};

const LANG = {
	EN: 'en',
	VI: 'vi',
	CN: 'cn'
};

const FONT_SIZES = [
	{ title: 'Small', value: 16 },
	{ title: 'Medium', value: 17 },
	{ title: 'Large', value: 18 }
];
const FONT_SIZE_LIST = ['Small', 'Medium', 'Large'];
const FONT_SIZE_INT = {
	Small: 16,
	Medium: 17,
	Large: 18
};

const LIST_DEVICE_APP = ['ANDROID', 'IOS'];

const CNOTE_PAGE_SIZE = 20;
const BUSINESS_LOG_PAGE_SIZE = 20;

const ID_FORM = {
	PRICE_UNIVERSAL: 'PRICE_UNIVERSAL',
	MARKET_DEPTH: 'MARKET_DEPTH',
	TRADES: 'TRADES',
	INTERNAL_FORM: 'INTERNAL_FORM'
};

const TIME_AGO_INTERVAL = {
	SECOND: 1 * 1000,
	MINUTE: 1 * 60 * 1000,
	HOUR: 1 * 60 * 60 * 1000,
	DAY: 1 * 24 * 60 * 60 * 1000
};

const TYPE_STREAMING_ALL = {
	ALL: 'all',
	ACCOUNT: 'account',
	USER: 'user',
	OPERATION: 'operation'
};

const PTC_CHANNEL = {
	ALLOW_RENDER: 'ALLOW_RENDER',
	TRADE_PRICE: 'TRADE_PRICE',
	BID_PRICE: 'BID_PRICE',
	ASK_PRICE: 'ASK_PRICE',
	RESET_FLASHING: 'RESET_FLASHING',
	LV1_CHANGE: 'LV1_CHANGE',
	ALLOW_RENDER_VALUE_TRADE: 'ALLOW_RENDER_VALUE_TRADE',
	ALLOW_RENDER_CHANGE_PERCENT: 'ALLOW_RENDER_CHANGE_PERCENT',
	ALLOW_RENDER_TRADE_SIZE: 'ALLOW_RENDER_TRADE_SIZE',
	ALLOW_RENDER_CHANGE_POINT: 'ALLOW_RENDER_CHANGE_POINT',
	ALLOW_RENDER_WATCHLIST_CONTENT: 'ALLOW_RENDER_WATCHLIST_CONTENT',
	ALLOW_RENDER_OPEN_PRICE: 'ALLOW_RENDER_OPEN_PRICE',
	ALLOW_RENDER_PRICE_HEADER: 'ALLOW_RENDER_PRICE_HEADER',
	ALLOW_RENDER_PRICE_CONTENT: 'ALLOW_RENDER_PRICE_CONTENT',
	PRICE_LOADING: 'PRICE_LOADING',
	PRICE_OBJ: 'PRICE_OBJ'
};

const FLASHING_FIELD = {
	TRADE_PRICE: 'trade_price',
	BID_PRICE: 'bid_price',
	ASK_PRICE: 'ask_price'
};

const TYPE_FORM_REALTIME = {
	WATCHLIST: 'WATCHLIST',
	HOLDING: 'HOLDING',
	NEW_ORDER_BID_PRICE: 'NEW_ORDER_BID_PRICE',
	NEW_ORDER_TRADE_PRICE: 'NEW_ORDER_TRADE_PRICE',
	PRICE_SEARCH_DETAIL: 'PRICE_SEARCH_DETAIL'
};

const TREND_TYPE = {
	COMPARE_WITH_ZERO: 'COMPARE_WITH_ZERO',
	COMPARE_WITH_OLD: 'COMPARE_WITH_OLD'
};

const TREND_VALUE = {
	UP: 'Up',
	DOWN: 'Down',
	NONE: 'None',
	NULL: 'Null'
};

const WATCHLIST = {
	MOBILE_FAVOURITE: 'Mobile Favourite',
	// USER_WATCHLIST: 'user-watchlist',
	PREFIX: 'USER_',
	USER_WATCHLIST: 'USER_Mobile Favourite',
	TOP_VALUE: 'top-price-market-value',
	TOP_ASX_INDEX: 'top-asx-index'
};

const TYPE_NEWS = {
	RELATED: 'RELATED',
	EVERYTHING: 'EVERYTHING',
	SINGLE: 'SINGLE'
};

const FILTER_TYPE_NEWS = {
	PRICE_SENSITIVE: 'PriceSensitive',
	ALL: 'all'
};
const SIGN_NEWS = {
	NONE: 'None',
	PRICE_SENSITIVE: 'PriceSensitive'
};
const CHANNEL_COUNT = {
	MENU_ORDERS: 'menu_orders',
	MENU_NEWS: 'menu_news',
	TAB_RELATED_NEWS: 'tab_related_news'
};

const PAGE_SIZE_NEWS = 20;

const US_EXCHANGE = ['XNAS', 'XNYS', 'XASE', 'ARCX', 'BATS', 'IEXG'];
const AU_EXCHANGE = ['ASX'];

const EXCHANGE_DETAIL = {
	'ASX:BESTMKT': {
		flag: 'AU',
		displayExchange: 'nBestMKTExchange'
	},
	'CXA:qCXA': {
		flag: 'AU',
		displayExchange: 'nQCXAExchange'
	},
	'N:FIXED CO': {
		flag: 'AU',
		displayExchange: 'fixedcoExchange'
	},
	XKLS: {
		flag: 'US',
		displayExchange: 'xklsExchange'
	},
	XCBT: {
		flag: 'US',
		displayExchange: 'xcbtExchange'
	},
	XCEC: {
		flag: 'US',
		displayExchange: 'xcecExchange'
	},
	IFEU: {
		flag: 'US',
		displayExchange: 'ifeuExchange'
	},
	IFSG: {
		flag: 'US',
		displayExchange: 'ifsgExchange'
	},
	IFUS: {
		flag: 'US',
		displayExchange: 'ifusExchange'
	},
	IFLX: {
		flag: 'US',
		displayExchange: 'iflxExchange'
	},
	XLME: {
		flag: 'US',
		displayExchange: 'lmeExchange'
	},
	XNYM: {
		flag: 'US',
		displayExchange: 'xnymExchange'
	},
	XSCE: {
		flag: 'US',
		displayExchange: 'xsceExchange'
	},
	XTKT: {
		flag: 'US',
		displayExchange: 'xtktExchange'
	},
	'AXW:ASX': {
		flag: 'AU',
		displayExchange: 'axwExchange'
	},
	'AXW:AXW': {
		flag: 'AU',
		displayExchange: 'asxExchange'
	},
	'CXA:CXA': {
		flag: 'AU',
		displayExchange: 'nCXAExchange'
	},
	'AXW:CXA': {
		flag: 'AU',
		displayExchange: 'nCXAExchange'
	},
	'ASX:ASX': {
		flag: 'AU',
		displayExchange: 'asxExchange'
	},
	ASX: {
		flag: 'AU',
		displayExchange: 'asxExchange'
	},
	'ASX:ASXCP': {
		flag: 'AU',
		displayExchange: 'asxCPExchange'
	},
	ASXCP: {
		flag: 'AU',
		displayExchange: 'asxCPExchange'
	},
	'N:CXA': {
		flag: 'AU',
		displayExchange: 'nCXAExchange'
	},
	CXA: {
		flag: 'AU',
		displayExchange: 'nCXAExchange'
	},
	'CXA:CXACP': {
		flag: 'AU',
		displayExchange: 'cxaCPExchange'
	},
	CXACP: {
		flag: 'AU',
		displayExchange: 'cxaCPExchange'
	},
	'N:qCXA': {
		flag: 'AU',
		displayExchange: 'nQCXAExchange'
	},
	qCXA: {
		flag: 'AU',
		displayExchange: 'nQCXAExchange'
	},
	'N:BESTMKT': {
		flag: 'AU',
		displayExchange: 'nBestMKTExchange'
	},
	BESTMKT: {
		flag: 'AU',
		displayExchange: 'nBestMKTExchange'
	},
	XNYS: {
		flag: 'US',
		displayExchange: 'nyseExchange'
	},
	XASE: {
		flag: 'US',
		displayExchange: 'amexExchange'
	},
	ARCX: {
		flag: 'US',
		displayExchange: 'arcxExchange'
	},
	BATS: {
		flag: 'US',
		displayExchange: 'batsExchange'
	},
	IEXG: {
		flag: 'US',
		displayExchange: 'iexgExchange'
	},
	XNAS: {
		flag: 'US',
		displayExchange: 'xnasExchange'
	},
	'ASX:BB': {
		flag: 'AU',
		displayExchange: 'asxBBExchange'
	},
	'ASX:CP': {
		flag: 'AU',
		displayExchange: 'asxCPExchange'
	},
	'ASX:TM': {
		flag: 'AU',
		displayExchange: 'asxTMExchange'
	},
	'ASX:TM:D': {
		flag: 'AU',
		displayExchange: 'asxTMDExchange'
	},
	'ASX:TM:E1': {
		flag: 'AU',
		displayExchange: 'asxTME1Exchange'
	},
	'ASX:TM:E2': {
		flag: 'AU',
		displayExchange: 'asxTME2Exchange'
	},
	'ASX:TM:E3': {
		flag: 'AU',
		displayExchange: 'asxTME3Exchange'
	},
	'ASX:TM:E4': {
		flag: 'AU',
		displayExchange: 'asxTME4Exchange'
	},
	'ASX:TM:E5': {
		flag: 'AU',
		displayExchange: 'asxTME5Exchange'
	},
	'ASX:TM:I': {
		flag: 'AU',
		displayExchange: 'asxTMIExchange'
	},
	'ASX:TM:ID': {
		flag: 'AU',
		displayExchange: 'asxTMIDExchange'
	},
	'ASX:TM:IR': {
		flag: 'AU',
		displayExchange: 'asxTMIRExchange'
	},
	'ASX:TM:PRV': {
		flag: 'AU',
		displayExchange: 'asxTMPRVExchange'
	},
	'ASX:TM:QD': {
		flag: 'AU',
		displayExchange: 'asxTMQDExchange'
	},
	'ASX:TM:TST': {
		flag: 'AU',
		displayExchange: 'asxTMTSTExchange'
	},
	'ASX:TM:W': {
		flag: 'AU',
		displayExchange: 'asxTMWExchange'
	},
	'ASX:PM:E1': {
		flag: 'AU',
		displayExchange: 'asxPME1Exchange'
	},
	'ASX:PM:E2': {
		flag: 'AU',
		displayExchange: 'asxPME2Exchange'
	},
	'ASX:PM:E3': {
		flag: 'AU',
		displayExchange: 'asxPME3Exchange'
	},
	'ASX:PM:E4': {
		flag: 'AU',
		displayExchange: 'asxPME4Exchange'
	},
	'ASX:PM:E5': {
		flag: 'AU',
		displayExchange: 'asxPME5Exchange'
	},
	'ASX:V': {
		flag: 'AU',
		displayExchange: 'asxVExchange'
	},
	'CXA::FP': {
		flag: 'AU',
		displayExchange: 'cxaFPExchange'
	},
	'CXA::LI': {
		flag: 'AU',
		displayExchange: 'cxaLIExchange'
	},
	'CXA::MC': {
		flag: 'AU',
		displayExchange: 'cxaMCExchange'
	},
	'CXA::MP': {
		flag: 'AU',
		displayExchange: 'cxaMPExchange'
	},
	'CXA::NP': {
		flag: 'AU',
		displayExchange: 'cxaNPExchange'
	},
	NSX: {
		flag: 'AU',
		displayExchange: 'nsxExchange'
	},
	'NSX::COM': {
		flag: 'AU',
		displayExchange: 'nsxCOMExchange'
	},
	'NSX::CRP': {
		flag: 'AU',
		displayExchange: 'nsxCRPExchange'
	},
	'NSX::DBT': {
		flag: 'AU',
		displayExchange: 'nsxDBTExchange'
	},
	'NSX::MIN': {
		flag: 'AU',
		displayExchange: 'nsxMINExchange'
	},
	'NSX::PROP': {
		flag: 'AU',
		displayExchange: 'nsxPROPExchange'
	},
	'NSX::PRP': {
		flag: 'AU',
		displayExchange: 'nsxPRPExchange'
	},
	'NSX::RST': {
		flag: 'AU',
		displayExchange: 'nsxRSTExchange'
	},
	'NSX:SV': {
		flag: 'AU',
		displayExchange: 'nsxSVExchange'
	},
	'NSX:SP:EQY': {
		flag: 'AU',
		displayExchange: 'nsxSPEQYExchange'
	},
	'NSX:SP:RST': {
		flag: 'AU',
		displayExchange: 'nsxSPRSTExchange'
	},
	NZX: {
		flag: 'AU',
		displayExchange: 'nzxExchange'
	},
	'NZX::NXT': {
		flag: 'AU',
		displayExchange: 'nzxNXTExchange'
	},
	'NZX::SPEC': {
		flag: 'AU',
		displayExchange: 'nzxSPECExchange'
	},
	'NZX::FSM': {
		flag: 'AU',
		displayExchange: 'nzxFSMExchange'
	},
	'NZX::I': {
		flag: 'AU',
		displayExchange: 'nzxIExchange'
	},
	'NZX::DX': {
		flag: 'AU',
		displayExchange: 'nzxDXExchange'
	},
	'NZX::AX': {
		flag: 'AU',
		displayExchange: 'nzxAXExchange'
	},
	'NZX::DF': {
		flag: 'AU',
		displayExchange: 'nzxDFExchange'
	},
	'NZX::DO': {
		flag: 'AU',
		displayExchange: 'nzxDOExchange'
	},
	'NZX::IF': {
		flag: 'AU',
		displayExchange: 'nzxIFExchange'
	},
	'NZX:FX:DO': {
		flag: 'AU',
		displayExchange: 'nzxFXDOExchange'
	},
	'NZX:FX:DF': {
		flag: 'AU',
		displayExchange: 'nzxFXDFExchange'
	},
	'NZX:FX:EO': {
		flag: 'AU',
		displayExchange: 'nzxFXEOExchange'
	},
	'NZX:FX:IF': {
		flag: 'AU',
		displayExchange: 'nzxFXIFExchange'
	},
	'NZX:FX:MO': {
		flag: 'AU',
		displayExchange: 'nzxFXMOExchange'
	},
	'NSX:NSX': {
		flag: 'AU',
		displayExchange: 'nsxNSXExchange'
	},
	'BSX:BSX': {
		flag: 'AU',
		displayExchange: 'bsxBSXExchange'
	}
};

const SYMBOL_CLASS = {
	ALL_TYPES: 'allTypesUpper',
	allTypes: 'allTypes',
	EQUITY: 'equity',
	equityLowerCase: 'equityLowerCase',
	ETFS: 'etf',
	MF: 'mf',
	WARRANT: 'warrant',
	warrantLower: 'warrantLower',
	FUTURE: 'future',
	Futures: 'Futures',
	OPTION: 'option',
	Option: 'Option',
	OPTION_LOWERCASE: 'Option',
	INDICES: 'index',
	FX: 'forex'
};

const EXCHANGE_CLASS = {
	[SYMBOL_CLASS.EQUITY]: {
		'BSX:BSX': 'BSX:BSX',
		'NSX:NSX': 'NSX:NSX',
		'ASX:ASX': 'ASX:ASX',
		'ASX:ASXCP': 'ASX:ASXCP',
		'N:CXA': 'N:CXA',
		'CXA:CXACP': 'CXA:CXACP',
		'N:qCXA': 'N:qCXA',
		'N:BESTMKT': 'N:BESTMKT'
	},
	[SYMBOL_CLASS.OPTION]: {
		'BSX:BSX': 'BSX:BSX',
		'NSX:NSX': 'NSX:NSX',
		'ASX:ASX': 'ASX:ASX'
	},
	[SYMBOL_CLASS.ETFS]: {
		'BSX:BSX': 'BSX:BSX',
		'NSX:NSX': 'NSX:NSX',
		'AXW:CXA': 'AXW:CXA',
		'CXA:AXW': 'CXA:AXW',
		'AXW:ASX': 'AXW:ASX'
	},
	[SYMBOL_CLASS.MF]: {
		'BSX:BSX': 'BSX:BSX',
		'NSX:NSX': 'NSX:NSX',
		'AXW:CXA': 'AXW:CXA',
		'CXA:AXW': 'CXA:AXW',
		'AXW:ASX': 'AXW:ASX'
	},
	[SYMBOL_CLASS.WARRANT]: {
		'BSX:BSX': 'BSX:BSX',
		'NSX:NSX': 'NSX:NSX',
		'CXA:CXA': 'CXA:CXA',
		'AXW:ASX': 'AXW:ASX'
	}
};

const CHART_TYPE = {
	VALUE: '$',
	PERCENT: '%'
};

const URL_TIME_SERVER = 'http://nist.time.gov/actualtime.cgi?lzbc=siqm9b';

const DEFAULT_TXT = {
	RESET_UR_PIN: 'Reset Your PIN',
	PLEASE_ENTER_UR_PASS: 'Please enter your password'
};

const LIST_PRICE_BOARD = [
	'Personal',
	'Indices',
	'S&P 20',
	'S&P 50',
	'S&P 100',
	'S&P 200',
	'NASDAQ #1',
	'NASDAQ #2',
	'NYSE #1',
	'NYSE #2',
	'NYSE #3',
	'NYSE #4',
	'NYSE #5',
	'AMEX',
	'NYSE Arca'
];

const STATUS_IN_FAVORITES = {
	IN: 'IN',
	OUT: 'OUT',
	ADDING: 'ADDING',
	REMOVING: 'REMOVING'
};

const ERROR_CODE_PASSWORD = {
	2000: 2000,
	2001: 2001,
	2010: 2010,
	2011: 2011,
	2062: 2062
};

const ERROR_CODE_PASSWORD_MAPPING = {
	1303: 'userViewOnlyMode',
	1402: 'unknown_error',
	1403: 'unknown_error',
	1404: 'unknown_error',
	1405: 'unknown_error',
	2000: 'unknown_error',
	2001: 'fullNameIsInvalid',
	2002: 'userLoginisTaken',
	2003: 'mustEnter3255characters',
	2004: 'emailContactFormatNotRecognize',
	2005: 'phoneFormatNotRecognize',
	2006: 'accessMethodIsInvalid',
	2007: 'userGroupIsInvalid',
	2008: 'userStatusIsInvalid',
	2009: 'accountIsTaken',
	2010: 'mustEnter8255characters',
	2011: 'passwordIncorrect',
	2012: 'invalidUserLoginID',
	2013: 'userIDInactive',
	2014: 'invalidAccountID',
	2015: 'invalidStatus',
	2016: 'invalidUserID',
	2017: 'nochangeAccountInfo',
	2018: 'invalidExchange',
	2020: 'invalidEmailLoginIDFormat',
	2021: 'invalidEmailAddressFormat',
	2022: 'userIDClosed',
	2023: 'userIDLocked',
	2024: 'roleIsExist',
	2025: 'roleIsNotExist',
	2026: 'nochangeUserDetailInfo',
	2027: 'roleIDNotExist',
	2028: 'invalidToken',
	2029: 'roleCannotRemoved',
	2030: 'roleName255characters',
	2031: 'invalidRoleID',
	2032: 'userIDblocked',
	2034: 'unknown_error',
	2035: 'userGroupCannotRemoved',
	2036: 'userGroupRequired',
	2037: 'roleNameRequired',
	2050: 'branchNameExist',
	2051: 'unknown_error',
	2052: 'invalidBranchName',
	2053: 'branchNameMust1255characters',
	2054: 'invalidBranchName',
	2055: 'branchCannotRemoved',
	2056: 'vettingRuleGroupIDCannotDeleted',
	2057: 'enterNewPw',
	2058: 'userDisabled',
	2059: 'enterNewEmailPw',
	2060: 'emailNotExist',
	2061: 'errorSpamEmail',
	2062: 'userNotTrue',
	2063: 'needPermission',
	2064: 'invalidParameter',
	2065: 'invalidAccountTryAgain',
	2066: 'invalidVettingRule',
	2067: 'nochangeMarketAccessInfo',
	2077: 'codeExpired',
	2078: 'codeIsIncorrect',
	2080: 'newPasswordDifferent',
	2090: 'passwordRequired',
	2096: 'notableCreateRole',
	2097: 'userGroupNotExist',
	2098: 'notableCreateRole',
	2099: 'roleGroupNotExist',
	4001: 'invalidUserType',
	5000: 'invalidUserType',
	INVALID_PARAMS: 'codeIsIncorrect',
	PASSWORD_NOT_MATCH: 'passwordDidNotMatch',
	EMAIL_FORMAT_ERROR: 'emailFormatError',
	INTERNAL_ERROR: 'internalServerError',
	UNKNOWN_ERROR: 'unknown_error'
};

const TIMEOUT_HIDE_ERROR = 5 * 1000;

const TIMEOUT_CANCEL_REPORT_FROM_FILE = 30 * 1000;

const TIME_DURATION = 10000;

const TEST_COVERAGE = {
	ID: 'test_coverage_id'
};

const TYPE_EVENT_NAV = {
	DEEP_LINK: 'DeepLink',
	NAVBAR_BUTTON_PRESS: 'NavBarButtonPress'
};

const SIGN_IN_SCREEN_SWITCH = {
	FORGOT_USERNAME: 'FORGOT_USERNAME',
	FORGOT_PASSWORD: 'FORGOT_PASSWORD',
	COMPLETE_SIGN_UP: 'COMPLETE_SIGN_UP'
};

const FORGOT_PASSWORD_SCREEN = {
	FORGOT: 'FORGOT',
	NEW_PASSWORD: 'NEW_PASSWORD',
	EXPIRED: 'EXPIRED'
};

const KEY_VERSION = {
	DEFAULT: 'version',
	CASH_BALANCE: 'cashBalanceVersion'
};

const METHOD = {
	GET: 'get',
	POST: 'post',
	PUT: 'put',
	DELETE: 'delete'
};

const TIME_FORGOT_PASSWORD_EXPIRE = 20 * 60 * 1000;
// const TIME_FORGOT_PASSWORD_EXPIRE = 5 * 1000

const LABEL_COUNT = 5;

const REQ_KEY = {
	GET_PORTFOLIO: 'GET_PORTFOLIO'
};

const LOG_LEVEL = {
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error'
};

const PRICE_DECIMAL = {
	VALUE_AUD: 2,
	VALUE: 2,
	PRICE: 0,
	SPECIFIC_PRICE: 2,
	IRESS_PRICE: -1,
	PERCENT: 2,
	EXTERNAL: 4,
	VOLUME: 0,
	PRICE_IRESS: 1,
	PERCENT_IRESS: 2
};
const STEP = {
	STEP_VALUE: 10,
	STEP_PRICE: 0.5,
	STEP_PERCENT: 0.5,
	STEP_VOLUME: 1
};
const ROUND_STEP = {
	PRICE: 0.5,
	PERCENT: 0.01
};
const FLASHING_TYPE = {
	PRICE: PRICE_DECIMAL.PRICE,
	PERCENT: PRICE_DECIMAL.PERCENT,
	VALUE: PRICE_DECIMAL.VALUE
};

const THEME = {
	LIGHT: 'light',
	DARK: 'dark',
	THEME1: 'theme1'
};

const REDUX_EVENT_TYPE = {
	APP_CHANGE_CONNECTION: 'APP_CHANGE_CONNECTION'
};

const RES_TYPE = {
	ARRAY_BUFFER: 'arraybuffer'
};

const SYMBOL_CLASS_DISPLAY = {
	allTypesUpper: 'allTypesUpper',
	equity: 'equity',
	etf: 'etf',
	mf: 'managed fund',
	warrant: 'warrant',
	future: 'futures',
	option: 'option'
};

const SYMBOL_CLASS_DISPLAY_SHORT = {
	allTypesUpper: 'allTypesUpper',
	equity: 'Equity',
	etf: 'ETF',
	mf: 'MF',
	warrant: 'Warrant',
	future: 'Futures',
	option: 'Option'
};

const SYMBOL_CLASS_QUERY = {
	[SYMBOL_CLASS.EQUITY]: 'equity',
	[SYMBOL_CLASS.ETFS]: 'etf',
	[SYMBOL_CLASS.MF]: 'mf',
	[SYMBOL_CLASS.WARRANT]: 'warrant',
	[SYMBOL_CLASS.FUTURE]: 'future',
	[SYMBOL_CLASS.OPTION]: 'option',
	[SYMBOL_CLASS.INDICES]: 'index',
	[SYMBOL_CLASS.FX]: 'forex',
	// [SYMBOL_CLASS.ALL_TYPES]: 'equity,etf,mf,warrant,future,option,index,forex'
	[SYMBOL_CLASS.ALL_TYPES]: 'all'
};

const USER_TYPE = {
	OPERATOR: 'operation',
	ADVISOR: 'advisor',
	RETAIL: 'retail'
};

const TIME_OPEN_NEWS = 20 * 60 * 1000;
const TIME_REFRESH_TOKEN = 15 * 60 * 1000;

const MAX_LEN_PATH = 999999999999;

const NAV_BTN_ID = {
	BROWSERS: 'BROWSERS',
	CREATE: 'CREATE',
	REFRESH: 'REFRESH',
	REFRESHING: 'REFRESHING'
};

const USER_STATUS = {
	INACTIVE: 0,
	PENDING_EMAIL: 1,
	ACTIVE: 2,
	CLOSED: 3,
	ADMIN_BLOCKED: 4,
	SECURITY_BLOCKED: 5
};

const SECRET_KEY_ENCRYPT = 'EQUIX_MOBILE';
const LOGIN_RESPONSE = {
	SUCCESSFUL: 'SUCCESSFUL'
};

const NUMBER_HISTORY_SEARCH_ACCOUNT = 5;
const NUMBER_HISTORY_SEARCH_SYMBOL = 30;
const NUMBER_HISTORY_SEARCH_WATCHLIST = 5;

const CHANNEL_NOTIFICATION_ID_ANDROID = 'Equix_notification';
const ANDROID_VIBRATION_PATTERN = [500];

const USER_BLOCK_ERROR = {
	USER_INACTIVE: 2013,
	USER_CLOSED: 2022,
	USER_ADMIN_BLOCKED: 2023,
	USER_SECURITY_BLOCKED: 2032
};

const TIME_DELAY = 1000;

const LINK_HELP_CENTER = 'https://novus-fintech.com';
const TYPE_RESET_REDUX = 'RESET';

const ALERT_TYPE = {
	LAST_PRICE: {
		key: 'alertLastPrice',
		value: 'LAST_PRICE'
	},
	BID_PRICE: {
		key: 'alertBidPrice',
		value: 'BID_PRICE'
	},
	OFFER_PRICE: {
		key: 'alertOfferPrice',
		value: 'OFFER_PRICE'
	},
	CHANGE_POINT: {
		key: 'alertChangePoint',
		value: 'CHANGE_POINT'
	},
	CHANGE_PERCENT: {
		key: 'alertChangePercent',
		value: 'CHANGE_PERCENT'
	},
	TODAY_VOLUME: {
		key: 'alertTodayVolume',
		value: 'TODAY_VOLUME'
	},
	NEWS: {
		key: 'alertNews',
		value: 'NEWS'
	}
};

const PRICE_ALERT_TRIGGER = {
	AT_OR_ABOVE: {
		key: 'alertPriceTriggerAtOrAbove',
		value: 'AT_OR_ABOVE'
	},
	ABOVE: {
		key: 'alertPriceTriggerAbove',
		value: 'ABOVE'
	},
	BELOW: {
		key: 'alertPriceTriggerBelow',
		value: 'BELOW'
	},
	AT_OR_BELOW: {
		key: 'alertPriceTriggerAtOrBelow',
		value: 'AT_OR_BELOW'
	}
};

const NEWS_ALERT_TRIGGER = {
	PriceSensitive: {
		key: 'alertNewsTriggerSensitive',
		value: 'PriceSensitive'
	},
	AllNew: {
		key: 'alertNewsTriggerEverything',
		value: 'AllNew'
	}
};

const NEWS_ALERT_REPEAT = {
	EVERYTIME: {
		key: 'alertNewsRepeatEveryTime',
		value: 'EVERYTIME'
	},
	ONCE_ONLY: {
		key: 'alertNewsRepeatOnceOnly',
		value: 'ONCE_ONLY'
	}
};

const PRICE_LAST_PRICE_FUTURE_ALERT_TARGET = {
	USER_INPUT: {
		key: 'alertPriceTargetUserInput',
		value: 'USER_INPUT'
	},
	YESTERDAY_OPEN: {
		key: 'alertPriceTargetYesterdayOpen',
		value: 'YESTERDAY_OPEN'
	},
	YESTERDAY_HIGH: {
		key: 'alertPriceTargetYesterdayHigh',
		value: 'YESTERDAY_HIGH'
	},
	YESTERDAY_LOW: {
		key: 'alertPriceTargetYesterdayLow',
		value: 'YESTERDAY_LOW'
	},
	YESTERDAY_CLOSE: {
		key: 'alertPriceTargetYesterdayClose',
		value: 'YESTERDAY_CLOSE'
	},
	YESTERDAY_SETTLEMENT: {
		key: 'alertPriceTargetYesterdaySettlement',
		value: 'YESTERDAY_SETTLEMENT'
	},
	TODAY_OPEN: {
		key: 'alertPriceTargetTodayOpen',
		value: 'TODAY_OPEN'
	},
	TODAY_HIGH: {
		key: 'alertPriceTargetTodayHigh',
		value: 'TODAY_HIGH'
	},
	TODAY_LOW: {
		key: 'alertPriceTargetTodayLow',
		value: 'TODAY_LOW'
	}
};

const PRICE_LAST_PRICE_ALERT_TARGET = {
	USER_INPUT: {
		key: 'alertPriceTargetUserInput',
		value: 'USER_INPUT'
	},
	YESTERDAY_OPEN: {
		key: 'alertPriceTargetYesterdayOpen',
		value: 'YESTERDAY_OPEN'
	},
	YESTERDAY_HIGH: {
		key: 'alertPriceTargetYesterdayHigh',
		value: 'YESTERDAY_HIGH'
	},
	YESTERDAY_LOW: {
		key: 'alertPriceTargetYesterdayLow',
		value: 'YESTERDAY_LOW'
	},
	YESTERDAY_CLOSE: {
		key: 'alertPriceTargetYesterdayClose',
		value: 'YESTERDAY_CLOSE'
	},
	TODAY_OPEN: {
		key: 'alertPriceTargetTodayOpen',
		value: 'TODAY_OPEN'
	},
	TODAY_HIGH: {
		key: 'alertPriceTargetTodayHigh',
		value: 'TODAY_HIGH'
	},
	TODAY_LOW: {
		key: 'alertPriceTargetTodayLow',
		value: 'TODAY_LOW'
	}
};

const PRICE_NONE_LAST_PRICE_ALERT_TARGET = {
	USER_INPUT: {
		key: 'alertPriceTargetUserInput',
		value: 'USER_INPUT'
	}
};
const TAG_SYMBOL_CLASS = {
	EQUITY: 'EQT',
	MF: 'MF',
	ETFS: 'ETF',
	FUTURE: 'FUT',
	WARRANT: 'WAR',
	OPTION: 'OPT',
	INDICES: 'IND',
	FX: 'FX'
};
const TAG_NEWS_STRING_BY_KEY = {
	Everything: 'All News',
	PriceSensitive: 'Market Sensitive',
	TradingHalt: 'Trading Halt',
	TradingHaltLifted: 'Trading Halt Lifted',
	'Administrator/Receiver–Appointed/Removed':
		'Administrator / Receiver – Appointed / Removed',
	AdmissiontoOfficialList: 'Admission To Official List',
	Alterationtoissuedcapital: 'Alteration To Issued Capital',
	AlterationtoNoticeofMeeting: 'Alteration To Notice Of Meeting',
	Announcementofcall: 'Announcement Of Call',
	AnnualReport: 'Annual Report',
	Appendix16A: 'Appendix 16A',
	Appendix3B: 'Appendix 3B',
	Appendix4G: 'Appendix 4G',
	ArticlesofAssociation: 'Articles Of Association',
	AssetAcquisition: 'Asset Acquisition',
	'AssetAcquisition&Disposal–Other': 'Asset Acquisition & Disposal – Other',
	'ASSETACQUISITION&DISPOSAL': 'Asset Acquisition & Disposal',
	AssetDisposal: 'Asset Disposal',
	'ASXAnnouncement–Other': 'Asx Announcement – Other',
	ASXANNOUNCEMENT: 'Asx Announcement',
	'ASXBookBuild–ChangeinPublicParameter':
		'Asx Book Build – Change In Public Parameter',
	'ASXBookBuild–Close/Cancel': 'Asx Book Build – Close / Cancel',
	'ASXBookBuild–Upcoming/Commenced': 'Asx Book Build – Upcoming / Commenced',
	ASXCirculars: 'Asx Circulars',
	'ASXQuery–Other': 'Asx Query – Other',
	ASXQuery: 'Asx Query',
	ASXQUERY: 'ASX QUERY',
	Becomingasubstantialholder: 'Becoming A Substantial Holder',
	'Beneficialownership–Part6C.2': 'Beneficial Owner Ship – Part 6C.2',
	'Bidder’sStatement–Marketbid': "Bidder's Statement – Market Bid",
	'Bidder’sStatement–Off-marketbid': "Bidder's Statement – Off- Market Bid",
	'BonusIssue/In-SpecieIssue': 'Bonus Issue / In- Specie Issue',
	CapitalReconstruction: 'Capital Reconstruction',
	Ceasingtobeasubstantialholder: 'Ceasing To Be A Substantial Holder',
	'Chairman’sAddress–Other': "Chairman's Address – Other",
	'CHAIRMAN’SADDRESS': "Chairman'S Address",
	'Chairman’sAddresstoShareholders': "Chairman's Address To Share Holders",
	ChangeinBasisofQuotation: 'Change In Basis Of Quotation',
	Changeinsubstantialholding: 'Change In Substantial Holding',
	ChangeofBalanceDate: 'Change Of Balance Date',
	ChangeofCompanyName: 'Change Of Company Name',
	'ChangeofDirector’sInterestNotice': "Change Of Director's Interest Notice",
	CleansingNotice: 'Cleansing Notice',
	CommencementofOfficialQuotation: 'Commencement Of Official Quotation',
	'CommitmentsTestEntity–FirstQuarterReport':
		'Commitments Test Entity – First Quarter Report',
	'CommitmentsTestEntity–FourthQuarterReport':
		'Commitments Test Entity – Fourth Quarter Report',
	'CommitmentsTestEntity–SecondQuarterReport':
		'Commitments Test Entity – Second Quarter Report',
	'CommitmentsTestEntity–ThirdQuarterReport':
		'Commitments Test Entity – Third Quarter Report',
	'CommitmentsTestEntityQuarterlyReports–Other':
		'Commitments Test Entity Quarterly Reports – Other',
	COMMITMENTSTESTENTITYQUARTERLYREPORTS:
		'Commitments Test Entity Quarterly Reports',
	'CompanyAdministration–Other': 'Company Administration – Other',
	COMPANYADMINISTRATION: 'Company Administration',
	'CompanyPresentation(coverspresentationonbusinessupdatesprojectsactivitiesandothersthatacompanywillreportaspresentation)':
		'Company Presentation (Covers presentation on business updates projects activities and others that a company will report as presentation)',
	'CompanySecretaryAppointment/Resignation':
		'Company Secretary Appointment / Resignation',
	ConciseFinancialReport: 'Concise Financial Report',
	ConfirmationthatAnnualReportwassenttoSecurityHolders:
		'Confirmation That Annual Report Was Sent To Security Holders',
	Constitution: 'Constitution',
	CorporateGovernance: 'Corporate Governance',
	CreditRating: 'Credit Rating',
	DailyFundUpdate: 'Daily Fund Update',
	'DailyShareBuy-BackNotice': 'Daily Share Buy - Back Notice',
	DebtFacility: 'Debt Facility',
	DetailsofCompanyAddress: 'Details Of Company Address',
	DetailsofRegisteredofficeaddress: 'Details Of Registered Office Address',
	DetailsofShareRegistryaddress: 'Details Of Share Registry Address',
	'DirectorAppointment/Resignation': 'Director Appointment / Resignation',
	'Directors’StatementreTakeover': 'Directors’ Statement Re Takeover',
	DisclosureDocument: 'Disclosure Document',
	DISTRIBUTIONANNOUNCEMENT: 'Distribution Announcement',
	'Dividend–Other': 'Dividend – Other',
	DividendAlteration: 'Dividend Alteration',
	DividendPayDate: 'Dividend Pay Date',
	DividendRate: 'Dividend Rate',
	DividendRecordDate: 'Dividend Record Date',
	DividendReinvestmentPlan: 'Dividend Reinvestment Plan',
	EndofDay: 'End Of Day',
	'FinalDirector’sInterestNotice': "Final Director's Interest Notice",
	FirstQuarterActivitiesReport: 'First Quarter Activities Report',
	FirstQuarterCashFlowReport: 'First Quarter Cash Flow Report',
	FourthQuarterActivitiesReport: 'Fourth Quarter Activities Report',
	FourthQuarterCashFlowReport: 'Fourth Quarter Cash Flow Report',
	FullYearAccounts: 'Full Year Accounts',
	FullYearAuditReview: 'Full Year Audit Review',
	'FullYearDirectors’Report': 'Full Year Directors’ Report',
	'FullYearDirectors’Statement': 'Full Year Directors’ Statement',
	HalfYearAccounts: 'Half Year Accounts',
	HalfYearAuditReview: 'Half Year Audit Review',
	'HalfYearDirectors’Report': 'Half Year Directors’ Report',
	'HalfYearDirectors’Statement': 'Half Year Directors’ Statement',
	HalfYearlyReport: 'Half Yearly Report',
	'IndicativeNon-BindingProposal': 'Indicative Non - Binding Proposal',
	'InitialDirector’sInterestNotice': "Initial Director's Interest Notice",
	IntentiontoMakeTakeoverBid: 'Intention To Make Take Over Bid',
	InterestPayDate: 'Interest Pay Date',
	InterestRate: 'Interest Rate',
	InterestRecordDate: 'Interest Record Date',
	Internal: 'Internal',
	'IssuedCapital–Other': 'Issued Capital – Other',
	ISSUEDCAPITAL: 'Issued Capital',
	IssuestothePublic: 'Issues To The Public',
	LegalProceedings: 'Legal Proceedings',
	'LettertoShareholders–Other': 'Letter To Share Holders – Other',
	LETTERTOSHAREHOLDERS: 'LETTER TO SHARE HOLDERS',
	LettertoShareholders: 'Letter To Share Holders',
	Loansecuritiesonissue: 'Loan Securities On Issue',
	MAPCancellation: 'Map Cancellation',
	MAPCorrection: 'Map Correction',
	MAPTest: 'Map Test',
	'mFund-AlterationtoIssuedCapital': 'Mfund - Alteration To Issued Capital',
	'mFund-DailyUpdate': 'Mfund - Daily Update',
	'mFund-FundProfile': 'Mfund - Fund Profile',
	'mFund–DisclosureDocument': 'Mfund – Disclosure Document',
	'mFund–DividendPayment': 'Mfund – Dividend Payment',
	'mFund–DividendRate': 'Mfund – Dividend Rate',
	'mFund–DividendRecordDate': 'Mfund – Dividend Record Date',
	'mFund–NetTangibleAssetbacking': 'Mfund – Net Tangible Assetbacking',
	mFund: 'Mfund',
	NetTangibleAssetBacking: 'Net Tangible Asset Backing',
	'NewIssueLetterofOffer&Acc.Form': 'New Issue Letter Of Offer & Acc.Form',
	'Non-RenounceableIssue': 'Non - Renounceable Issue',
	NoticeofAnnualGeneralMeeting: 'Notice Of Annual General Meeting',
	'NoticeofCall–Other': 'Notice Of Call – Other',
	'NOTICEOFCALL(ContributingShares)': 'Notice Of Call (Contributing shares)',
	Noticeofcalltoshareholders: 'Notice Of Call To Share Holders',
	NoticeofExtraordinaryGeneralMeeting:
		'Notice Of Extraordinary General Meeting',
	NoticeofGeneralMeeting: 'Notice Of General Meeting',
	'NoticeofMeeting–Other': 'Notice Of Meeting – Other',
	NOTICEOFMEETING: 'Notice Of Meeting',
	NoticePending: 'Notice Pending',
	'Off-marketbidofferdocumenttobidclassholders':
		'Off - Market Bid Offer Document To Bid Class Holders',
	'Off-MarketBuy-Back': 'Off - Market Buy - Back',
	'On-MarketBuy-Back': 'On - Market Buy - Back',
	OpenBriefing: 'Open Briefing',
	OTHER: 'OTHER',
	Other: 'Other',
	OverseasListing: 'Overseas Listing',
	'PeriodicReports–Other': 'Periodic Reports – Other',
	PERIODICREPORTS: 'Periodic Reports',
	Placement: 'Placement',
	PreliminaryFinalReport: 'Preliminary Final Report',
	ProfitGuidance: 'Profit Guidance',
	'ProgressReport–Other': 'Progress Report – Other',
	PROGRESSREPORT: 'PROGRESS REPORT',
	ProgressReport: 'Progress Report',
	ProxyForm: 'Proxy Form',
	'QuarterlyActivitiesReport–Other': 'Quarterly Activities Report – Other',
	QUARTERLYACTIVITIESREPORT: 'Quarterly Activities Report',
	'QuarterlyCashFlowReport–Other': 'Quarterly Cash Flow Report – Other ',
	QUARTERLYCASHFLOWREPORT: 'Quarterly Cash Flow Report',
	ReinstatementtoOfficialQuotation: 'Reinstatement To Official Quotation',
	RemovalfromOfficialList: 'Removal From Official List',
	RenounceableIssue: 'Renounceable Issue',
	ReservedForFutureUse: 'Reserved For Future Use',
	ReservedforFutureUse: 'Reserved For Future Use',
	Reservedforfutureuse: 'Reserved For Future Use',
	ResponsetoASXQuery: 'Response To Asx Query',
	'ResponsibleEntityAppointment/Resignation':
		'Responsible Entity Appointment / Resignation',
	ResultsofMeeting: 'Results Of Meeting',
	SchemeofArrangement: 'Scheme Of Arrangement',
	SecondQuarterActivitiesReport: 'Second Quarter Activities Report',
	SecondQuarterCashFlowReport: 'Second Quarter Cash Flow Report',
	'Section205GNotice–Director’sInterests':
		"Section 205G Notice – Director's Interests",
	'Securityholderdetails–Other': 'Security Holder Details – Other',
	SECURITYHOLDERDETAILS: 'Security Holder Details',
	SecurityPurchasePlan: 'Security Purchase Plan',
	'StandardandPoor’sAnnouncement': "Standardand Poor's Announcement",
	'StructuredProducts–Other': 'Structured Products – Other',
	STRUCTUREDPRODUCTS: 'Structured Products',
	StructuredProductsAcceptance: 'Structured Products Acceptance',
	StructuredProductsAdjustment: 'Structured Products Adjustment',
	StructuredProductsDisclosureDocument:
		'Structured Products Disclosure Document',
	StructuredProductsDistribution: 'Structured Products Distribution',
	StructuredProductsIssuerReport: 'Structured Products Issuer Report',
	StructuredProductsSupplementaryDisclosureDocument:
		'Structured Products Supplementary Disclosure Document',
	StructuredProductsTrustDeed: 'Structured Products Trustdeed',
	'SupplementaryBidder’sStatement': "Supplementary Bidder's Statement",
	'SupplementaryTarget’sStatement': "Supplementary Target's Statement",
	SuspensionfromOfficialQuotation: 'Suspension From Official Quotation',
	'Takeover–Other': 'Take Over – Other',
	'Takeover–TimerApplied': 'Takeover – Timer Applied',
	'TakeoverAnnouncements/SchemeAnnouncements':
		'Take Over Announcements / Scheme Announcements',
	'Takeoverupdate–Section671B©Notice':
		'Take Over Update – Section 671B© Notice',
	'Target’sStatement–Marketbid': "Target's Statement – Market Bid",
	'Target’sStatement–Off-marketbid': "Target's Statement – Off - Market Bid",
	ThirdQuarterActivitiesReport: 'Third Quarter Activities Report',
	ThirdQuarterCashFlowReport: 'Third Quarter Cash Flow Report',
	Top20shareholders: 'Top20 Share Holders',
	TradingPolicy: 'Trading Policy',
	Trust12monthaccounts: 'Trust 12 Month Accounts',
	Trust6monthaccounts: 'Trust 6 Month Accounts',
	TrustDeed: 'Trust Deed',
	'TrusteeAppointment/Resignation': 'Trustee Appointment / Resignation',
	'TrustManagerAppointment/Resignation':
		'Trust Manager Appointment / Resignation',
	VariationofTakeoverBid: 'Variation Of Take Over Bid',
	Waiver: 'Waiver',
	WebCast: 'Web Cast',
	WithdrawalofOffer: 'Withdrawal Of Offer',
	Year2000Advice: 'Year 2000 Advice'
};

const TAG_NEWS_KEY_BY_STRING = {
	'All News': 'Everything',
	'Market Sensitive': 'PriceSensitive',
	'Trading Halt': 'TradingHalt',
	'Trading Halt Lifted': 'TradingHaltLifted',
	'Administrator / Receiver – Appointed / Removed':
		'Administrator/Receiver–Appointed/Removed',
	'Admission To Official List': 'AdmissiontoOfficialList',
	'Alteration To Issued Capital': 'Alterationtoissuedcapital',
	'Alteration To Notice Of Meeting': 'AlterationtoNoticeofMeeting',
	'Announcement Of Call': 'Announcementofcall',
	'Annual Report': 'AnnualReport',
	'Appendix 16A': 'Appendix16A',
	'Appendix 3B': 'Appendix3B',
	'Appendix 4G': 'Appendix4G',
	'Articles Of Association': 'ArticlesofAssociation',
	'Asset Acquisition': 'AssetAcquisition',
	'Asset Acquisition & Disposal – Other': 'AssetAcquisition&Disposal–Other',
	'Asset Acquisition & Disposal': 'ASSETACQUISITION&DISPOSAL',
	'Asset Disposal': 'AssetDisposal',
	'Asx Announcement – Other': 'ASXAnnouncement–Other',
	'Asx Announcement': 'ASXANNOUNCEMENT',
	'Asx Book Build – Change In Public Parameter':
		'ASXBookBuild–ChangeinPublicParameter',
	'Asx Book Build – Close / Cancel': 'ASXBookBuild–Close/Cancel',
	'Asx Book Build – Upcoming / Commenced': 'ASXBookBuild–Upcoming/Commenced',
	'Asx Circulars': 'ASXCirculars',
	'Asx Query – Other': 'ASXQuery–Other',
	'Asx Query': 'ASXQuery',
	'ASX QUERY': 'ASXQUERY',
	'Becoming A Substantial Holder': 'Becomingasubstantialholder',
	'Beneficial Owner Ship – Part 6C.2': 'Beneficialownership–Part6C.2',
	"Bidder's Statement – Market Bid": 'Bidder’sStatement–Marketbid',
	"Bidder's Statement – Off- Market Bid": 'Bidder’sStatement–Off-marketbid',
	'Bonus Issue / In- Specie Issue': 'BonusIssue/In-SpecieIssue',
	'Capital Reconstruction': 'CapitalReconstruction',
	'Ceasing To Be A Substantial Holder': 'Ceasingtobeasubstantialholder',
	"Chairman's Address – Other": 'Chairman’sAddress–Other',
	"Chairman'S Address": 'CHAIRMAN’SADDRESS',
	"Chairman's Address To Share Holders": 'Chairman’sAddresstoShareholders',
	'Change In Basis Of Quotation': 'ChangeinBasisofQuotation',
	'Change In Substantial Holding': 'Changeinsubstantialholding',
	'Change Of Balance Date': 'ChangeofBalanceDate',
	'Change Of Company Name': 'ChangeofCompanyName',
	"Change Of Director's Interest Notice": 'ChangeofDirector’sInterestNotice',
	'Cleansing Notice': 'CleansingNotice',
	'Commencement Of Official Quotation': 'CommencementofOfficialQuotation',
	'Commitments Test Entity – First Quarter Report':
		'CommitmentsTestEntity–FirstQuarterReport',
	'Commitments Test Entity – Fourth Quarter Report':
		'CommitmentsTestEntity–FourthQuarterReport',
	'Commitments Test Entity – Second Quarter Report':
		'CommitmentsTestEntity–SecondQuarterReport',
	'Commitments Test Entity – Third Quarter Report':
		'CommitmentsTestEntity–ThirdQuarterReport',
	'Commitments Test Entity Quarterly Reports – Other':
		'CommitmentsTestEntityQuarterlyReports–Other',
	'Commitments Test Entity Quarterly Reports':
		'COMMITMENTSTESTENTITYQUARTERLYREPORTS',
	'Company Administration – Other': 'CompanyAdministration–Other',
	'Company Administration': 'COMPANYADMINISTRATION',
	'Company Presentation (Covers presentation on business updates projects activities and others that a company will report as presentation)':
		'CompanyPresentation(coverspresentationonbusinessupdatesprojectsactivitiesandothersthatacompanywillreportaspresentation)',
	'Company Secretary Appointment / Resignation':
		'CompanySecretaryAppointment/Resignation',
	'Concise Financial Report': 'ConciseFinancialReport',
	'Confirmation That Annual Report Was Sent To Security Holders':
		'ConfirmationthatAnnualReportwassenttoSecurityHolders',
	Constitution: 'Constitution',
	'Corporate Governance': 'CorporateGovernance',
	'Credit Rating': 'CreditRating',
	'Daily Fund Update': 'DailyFundUpdate',
	'Daily Share Buy - Back Notice': 'DailyShareBuy-BackNotice',
	'Debt Facility': 'DebtFacility',
	'Details Of Company Address': 'DetailsofCompanyAddress',
	'Details Of Registered Office Address': 'DetailsofRegisteredofficeaddress',
	'Details Of Share Registry Address': 'DetailsofShareRegistryaddress',
	'Director Appointment / Resignation': 'DirectorAppointment/Resignation',
	'Directors’ Statement Re Takeover': 'Directors’StatementreTakeover',
	'Disclosure Document': 'DisclosureDocument',
	'Distribution Announcement': 'DISTRIBUTIONANNOUNCEMENT',
	'Dividend – Other': 'Dividend–Other',
	'Dividend Alteration': 'DividendAlteration',
	'Dividend Pay Date': 'DividendPayDate',
	'Dividend Rate': 'DividendRate',
	'Dividend Record Date': 'DividendRecordDate',
	'Dividend Reinvestment Plan': 'DividendReinvestmentPlan',
	'End Of Day': 'EndofDay',
	"Final Director's Interest Notice": 'FinalDirector’sInterestNotice',
	'First Quarter Activities Report': 'FirstQuarterActivitiesReport',
	'First Quarter Cash Flow Report': 'FirstQuarterCashFlowReport',
	'Fourth Quarter Activities Report': 'FourthQuarterActivitiesReport',
	'Fourth Quarter Cash Flow Report': 'FourthQuarterCashFlowReport',
	'Full Year Accounts': 'FullYearAccounts',
	'Full Year Audit Review': 'FullYearAuditReview',
	'Full Year Directors’ Report': 'FullYearDirectors’Report',
	'Full Year Directors’ Statement': 'FullYearDirectors’Statement',
	'Half Year Accounts': 'HalfYearAccounts',
	'Half Year Audit Review': 'HalfYearAuditReview',
	'Half Year Directors’ Report': 'HalfYearDirectors’Report',
	'Half Year Directors’ Statement': 'HalfYearDirectors’Statement',
	'Half Yearly Report': 'HalfYearlyReport',
	'Indicative Non - Binding Proposal': 'IndicativeNon-BindingProposal',
	"Initial Director's Interest Notice": 'InitialDirector’sInterestNotice',
	'Intention To Make Take Over Bid': 'IntentiontoMakeTakeoverBid',
	'Interest Pay Date': 'InterestPayDate',
	'Interest Rate': 'InterestRate',
	'Interest Record Date': 'InterestRecordDate',
	Internal: 'Internal',
	'Issued Capital – Other': 'IssuedCapital–Other',
	'Issued Capital': 'ISSUEDCAPITAL',
	'Issues To The Public': 'IssuestothePublic',
	'Legal Proceedings': 'LegalProceedings',
	'Letter To Share Holders – Other': 'LettertoShareholders–Other',
	'LETTER TO SHARE HOLDERS': 'LETTERTOSHAREHOLDERS',
	'Letter To Share Holders': 'LettertoShareholders',
	'Loan Securities On Issue': 'Loansecuritiesonissue',
	'Map Cancellation': 'MAPCancellation',
	'Map Correction': 'MAPCorrection',
	'Map Test': 'MAPTest',
	'Mfund - Alteration To Issued Capital': 'mFund-AlterationtoIssuedCapital',
	'Mfund - Daily Update': 'mFund-DailyUpdate',
	'Mfund - Fund Profile': 'mFund-FundProfile',
	'Mfund – Disclosure Document': 'mFund–DisclosureDocument',
	'Mfund – Dividend Payment': 'mFund–DividendPayment',
	'Mfund – Dividend Rate': 'mFund–DividendRate',
	'Mfund – Dividend Record Date': 'mFund–DividendRecordDate',
	'Mfund – Net Tangible Assetbacking': 'mFund–NetTangibleAssetbacking',
	Mfund: 'mFund',
	'Net Tangible Asset Backing': 'NetTangibleAssetBacking',
	'New Issue Letter Of Offer & Acc.Form': 'NewIssueLetterofOffer&Acc.Form',
	'Non - Renounceable Issue': 'Non-RenounceableIssue',
	'Notice Of Annual General Meeting': 'NoticeofAnnualGeneralMeeting',
	'Notice Of Call – Other': 'NoticeofCall–Other',
	'Notice Of Call (Contributing shares)': 'NOTICEOFCALL(ContributingShares)',
	'Notice Of Call To Share Holders': 'Noticeofcalltoshareholders',
	'Notice Of Extraordinary General Meeting':
		'NoticeofExtraordinaryGeneralMeeting',
	'Notice Of General Meeting': 'NoticeofGeneralMeeting',
	'Notice Of Meeting – Other': 'NoticeofMeeting–Other',
	'Notice Of Meeting': 'NOTICEOFMEETING',
	'Notice Pending': 'NoticePending',
	'Off - Market Bid Offer Document To Bid Class Holders':
		'Off-marketbidofferdocumenttobidclassholders',
	'Off - Market Buy - Back': 'Off-MarketBuy-Back',
	'On - Market Buy - Back': 'On-MarketBuy-Back',
	'Open Briefing': 'OpenBriefing',
	OTHER: 'OTHER',
	Other: 'Other',
	'Overseas Listing': 'OverseasListing',
	'Periodic Reports – Other': 'PeriodicReports–Other',
	'Periodic Reports': 'PERIODICREPORTS',
	Placement: 'Placement',
	'Preliminary Final Report': 'PreliminaryFinalReport',
	'Profit Guidance': 'ProfitGuidance',
	'Progress Report – Other': 'ProgressReport–Other',
	'PROGRESS REPORT': 'PROGRESSREPORT',
	'Progress Report': 'ProgressReport',
	'Proxy Form': 'ProxyForm',
	'Quarterly Activities Report – Other': 'QuarterlyActivitiesReport–Other',
	'Quarterly Activities Report': 'QUARTERLYACTIVITIESREPORT',
	'Quarterly Cash Flow Report – Other ': 'QuarterlyCashFlowReport–Other',
	'Quarterly Cash Flow Report': 'QUARTERLYCASHFLOWREPORT',
	'Reinstatement To Official Quotation': 'ReinstatementtoOfficialQuotation',
	'Removal From Official List': 'RemovalfromOfficialList',
	'Renounceable Issue': 'RenounceableIssue',
	'Reserved For Future Use': 'ReservedForFutureUse',
	'Response To Asx Query': 'ResponsetoASXQuery',
	'Responsible Entity Appointment / Resignation':
		'ResponsibleEntityAppointment/Resignation',
	'Results Of Meeting': 'ResultsofMeeting',
	'Scheme Of Arrangement': 'SchemeofArrangement',
	'Second Quarter Activities Report': 'SecondQuarterActivitiesReport',
	'Second Quarter Cash Flow Report': 'SecondQuarterCashFlowReport',
	"Section 205G Notice – Director's Interests":
		'Section205GNotice–Director’sInterests',
	'Security Holder Details – Other': 'Securityholderdetails–Other',
	'Security Holder Details': 'SECURITYHOLDERDETAILS',
	'Security Purchase Plan': 'SecurityPurchasePlan',
	"Standardand Poor's Announcement": 'StandardandPoor’sAnnouncement',
	'Structured Products – Other': 'StructuredProducts–Other',
	'Structured Products': 'STRUCTUREDPRODUCTS',
	'Structured Products Acceptance': 'StructuredProductsAcceptance',
	'Structured Products Adjustment': 'StructuredProductsAdjustment',
	'Structured Products Disclosure Document':
		'StructuredProductsDisclosureDocument',
	'Structured Products Distribution': 'StructuredProductsDistribution',
	'Structured Products Issuer Report': 'StructuredProductsIssuerReport',
	'Structured Products Supplementary Disclosure Document':
		'StructuredProductsSupplementaryDisclosureDocument',
	'Structured Products Trustdeed': 'StructuredProductsTrustDeed',
	"Supplementary Bidder's Statement": 'SupplementaryBidder’sStatement',
	"Supplementary Target's Statement": 'SupplementaryTarget’sStatement',
	'Suspension From Official Quotation': 'SuspensionfromOfficialQuotation',
	'Take Over – Other': 'Takeover–Other',
	'Takeover – Timer Applied': 'Takeover–TimerApplied',
	'Take Over Announcements / Scheme Announcements':
		'TakeoverAnnouncements/SchemeAnnouncements',
	'Take Over Update – Section 671B© Notice':
		'Takeoverupdate–Section671B©Notice',
	"Target's Statement – Market Bid": 'Target’sStatement–Marketbid',
	"Target's Statement – Off - Market Bid": 'Target’sStatement–Off-marketbid',
	'Third Quarter Activities Report': 'ThirdQuarterActivitiesReport',
	'Third Quarter Cash Flow Report': 'ThirdQuarterCashFlowReport',
	'Top20 Share Holders': 'Top20shareholders',
	'Trading Policy': 'TradingPolicy',
	'Trust 12 Month Accounts': 'Trust12monthaccounts',
	'Trust 6 Month Accounts': 'Trust6monthaccounts',
	'Trust Deed': 'TrustDeed',
	'Trustee Appointment / Resignation': 'TrusteeAppointment/Resignation',
	'Trust Manager Appointment / Resignation':
		'TrustManagerAppointment/Resignation',
	'Variation Of Take Over Bid': 'VariationofTakeoverBid',
	Waiver: 'Waiver',
	'Web Cast': 'WebCast',
	'Withdrawal Of Offer': 'WithdrawalofOffer',
	'Year 2000 Advice': 'Year2000Advice'
};

const DELIVERY_METHOD = {
	EMAIL: 'deliveryMethodEmail',
	NOTIFICATION: 'deliveryMethodNotification'
};

const PANEL_POSITION = {
	TOP: 'top',
	MIDDLE: 'middle',
	BOTTOM: 'bottom'
};

const ALERT_SCREEN = {
	LIST_ALERT: 'LIST_ALERT',
	NEW_ALERT: 'NEW_ALERT',
	DETAIL_NEW_ALERT: 'DETAIL_NEW_ALERT',
	MODIFY_ALERT: 'MODIFY_ALERT',
	DETAIL_MODIFY_ALERT: 'DETAIL_ALERT'
};

const KEY_CONVERT_LV1 = {
	1: 'exchange',
	2: 'symbol',
	3: 'ask_price',
	4: 'ask_size',
	5: 'bid_price',
	6: 'bid_size',
	7: 'trade_price',
	8: 'trade_size',
	9: 'open',
	10: 'high',
	11: 'low',
	12: 'close',
	13: 'previous_close',
	14: 'change_point',
	15: 'change_percent',
	16: 'volume',
	17: 'value_traded',
	18: 'updated'
};

const KEY_INFOR_SELECTED_PORTFOLIO = [
	'profit_loss',
	'profit_loss_per',
	'change',
	'change_per',
	'avg_price'
];
const TYPE_PORTFOLIO_DETAIL = {
	TRANSACTION: 'TRANSACTION',
	POSITION: 'POSITION'
};
const TYPE_ERROR_ORDER = {
	QUANTITY_INPUT_ERROR: 'QUANTITY_INPUT_ERROR',
	LIMIT_PRICE_INPUT_ERROR: 'LIMIT_PRICE_INPUT_ERROR',
	TRIGGER_PRICE_INPUT_ERROR: 'TRIGGER_PRICE_INPUT_ERROR',
	DEFAULT_MESSAGE_ERROR_TEXT: 'DEFAULT_MESSAGE_ERROR_TEXT',
	STOP_PRICE_INPUT_ERROR: 'STOP_PRICE_INPUT_ERROR',
	STOP_LIMIT_PRICE_ERROR: 'STOP_LIMIT_PRICE_ERROR',
	TAKE_PROFIT_LOSS: 'TAKE_PROFIT_LOSS',
	TAKE_PROFIT_LIMIT_PRICE_ERROR: 'TAKE_PROFIT_LIMIT_PRICE_ERROR',
	ORDER_PRICE: 'ORDER_PRICE',
	TRIGGER_PRICE_INVALID_ERROR: 'TRIGGER_PRICE_INVALID_ERROR',
	POINTS_INVALID_ERROR: 'POINTS_INVALID_ERROR'
};
const USER_TYPE_ROLE_SHOW_ORDER_STATE = {
	ADVISOR: [
		ORDER_STATE_ENUM.NEW,
		ORDER_STATE_ENUM.PARTIALLY_FILLED,
		ORDER_STATE_ENUM.FILLED,
		ORDER_STATE_ENUM.DONE_FOR_DAY,
		ORDER_STATE_ENUM.CANCELLED,
		ORDER_STATE_ENUM.REPLACED,
		ORDER_STATE_ENUM.STOPPED,
		ORDER_STATE_ENUM.REJECTED,
		ORDER_STATE_ENUM.SUSPENDED,
		ORDER_STATE_ENUM.PENDING_NEW,
		ORDER_STATE_ENUM.CALCULATED,
		ORDER_STATE_ENUM.EXPIRED,
		ORDER_STATE_ENUM.ACCEPTED_FOR_BIDDING,
		ORDER_STATE_ENUM.UNKNOWN,
		ORDER_STATE_ENUM.CLIENT_PLACE_ERROR,
		ORDER_STATE_ENUM.CLIENT_AMEND_ERROR,
		ORDER_STATE_ENUM.CLIENT_CANCEL_ERROR,
		ORDER_STATE_ENUM.REJECT_ACTION_CANCEL,
		ORDER_STATE_ENUM.REJECT_ACTION_REPLACE,
		ORDER_STATE_ENUM.PURGED,
		ORDER_STATE_ENUM.APPROVE_ACTION_CANCEL,
		ORDER_STATE_ENUM.APPROVE_ACTION_REPLACE,
		ORDER_STATE_ENUM.TRIGGER,
		ORDER_STATE_ENUM.PENDING_CANCEL,
		ORDER_STATE_ENUM.PENDING_REPLACE
	],
	RETAIL: [
		ORDER_STATE_ENUM.NEW,
		ORDER_STATE_ENUM.PARTIALLY_FILLED,
		ORDER_STATE_ENUM.FILLED,
		ORDER_STATE_ENUM.DONE_FOR_DAY,
		ORDER_STATE_ENUM.CANCELLED,
		ORDER_STATE_ENUM.REPLACED,
		ORDER_STATE_ENUM.STOPPED,
		ORDER_STATE_ENUM.REJECTED,
		ORDER_STATE_ENUM.SUSPENDED,
		ORDER_STATE_ENUM.PENDING_NEW,
		ORDER_STATE_ENUM.CALCULATED,
		ORDER_STATE_ENUM.EXPIRED,
		ORDER_STATE_ENUM.ACCEPTED_FOR_BIDDING,
		ORDER_STATE_ENUM.UNKNOWN,
		ORDER_STATE_ENUM.CLIENT_PLACE_ERROR,
		ORDER_STATE_ENUM.CLIENT_AMEND_ERROR,
		ORDER_STATE_ENUM.CLIENT_CANCEL_ERROR,
		ORDER_STATE_ENUM.REJECT_ACTION_CANCEL,
		ORDER_STATE_ENUM.REJECT_ACTION_REPLACE,
		ORDER_STATE_ENUM.PURGED,
		ORDER_STATE_ENUM.APPROVE_ACTION_CANCEL,
		ORDER_STATE_ENUM.APPROVE_ACTION_REPLACE,
		ORDER_STATE_ENUM.TRIGGER,
		ORDER_STATE_ENUM.PENDING_CANCEL,
		ORDER_STATE_ENUM.PENDING_REPLACE
	],
	OPERATOR: [
		ORDER_STATE_ENUM.NEW,
		ORDER_STATE_ENUM.PARTIALLY_FILLED,
		ORDER_STATE_ENUM.FILLED,
		ORDER_STATE_ENUM.DONE_FOR_DAY,
		ORDER_STATE_ENUM.CANCELLED,
		ORDER_STATE_ENUM.REPLACED,
		ORDER_STATE_ENUM.PENDING_CANCEL,
		ORDER_STATE_ENUM.STOPPED,
		ORDER_STATE_ENUM.REJECTED,
		ORDER_STATE_ENUM.SUSPENDED,
		ORDER_STATE_ENUM.PENDING_NEW,
		ORDER_STATE_ENUM.CALCULATED,
		ORDER_STATE_ENUM.EXPIRED,
		ORDER_STATE_ENUM.ACCEPTED_FOR_BIDDING,
		ORDER_STATE_ENUM.PENDING_REPLACE,
		ORDER_STATE_ENUM.PLACE,
		ORDER_STATE_ENUM.REPLACE,
		ORDER_STATE_ENUM.CANCEL,
		ORDER_STATE_ENUM.UNKNOWN,
		ORDER_STATE_ENUM.CLIENT_PLACE_ERROR,
		ORDER_STATE_ENUM.CLIENT_AMEND_ERROR,
		ORDER_STATE_ENUM.CLIENT_CANCEL_ERROR,
		ORDER_STATE_ENUM.REJECT_ACTION_CANCEL,
		ORDER_STATE_ENUM.REJECT_ACTION_REPLACE,
		ORDER_STATE_ENUM.PURGED,
		ORDER_STATE_ENUM.APPROVE_ACTION_CANCEL,
		ORDER_STATE_ENUM.APPROVE_ACTION_REPLACE,
		ORDER_STATE_ENUM.TRIGGER
	]
};

const ORDER_STATUS_STRING = {
	[ORDER_STATE_ENUM.PLACE]: 'placeUpper',
	[ORDER_STATE_ENUM.REPLACE]: 'replaceUpper',
	[ORDER_STATE_ENUM.CANCEL]: 'cancelUpper',
	[ORDER_STATE_ENUM.TRIGGER]: 'triggerUpper',
	[ORDER_STATE_ENUM.PENDING_CANCEL]: 'pendingCancelUpper',
	[ORDER_STATE_ENUM.PENDING_REPLACE]: 'pendingReplaceUpper',
	[ORDER_STATE_ENUM.APPROVE_ACTION_CANCEL]: 'approveCancelUpper',
	[ORDER_STATE_ENUM.APPROVE_ACTION_REPLACE]: 'approveReplaceUpper',
	[ORDER_STATE_ENUM.REPLACED]: 'replacedUpper',
	[ORDER_STATE_ENUM.REJECT_ACTION_CANCEL]: 'denyCancelUpper',
	[ORDER_STATE_ENUM.REJECT_ACTION_REPLACE]: 'denyModifyUpper',
	[ORDER_STATE_ENUM.PENDING_NEW]: 'pendingNewUpper',
	[ORDER_STATE_ENUM.NEW]: 'newUpper',
	[ORDER_STATE_ENUM.PARTIALLY_FILLED]: 'partiallyFilledUpper',
	[ORDER_STATE_ENUM.FILLED]: 'filledUpper',
	[ORDER_STATE_ENUM.DONE_FOR_DAY]: 'doneForDayUpper',
	[ORDER_STATE_ENUM.CANCELLED]: 'cancelledUpper',
	[ORDER_STATE_ENUM.STOPPED]: 'stoppedUpper',
	[ORDER_STATE_ENUM.REJECTED]: 'rejectedUpper',
	[ORDER_STATE_ENUM.SUSPENDED]: 'suspendedUpper',
	[ORDER_STATE_ENUM.CALCULATED]: 'calculatedUpper',
	[ORDER_STATE_ENUM.EXPIRED]: 'expiredUpper',
	[ORDER_STATE_ENUM.ACCEPTED_FOR_BIDDING]: 'acceptedForBiddingUpper',
	[ORDER_STATE_ENUM.PURGED]: 'purgedUpper'
};
const SIDE_POSITION = {
	SELL: 'Sell',
	BUY: 'Buy',
	CLOSE: 'Close'
};

const TYPE_SETTING_NOTIFICATION_REF = {
	SOUND: 'settingSound',
	VIBRATE: 'settingVibrate',
	NEWS: 'settingNews',
	ORDER: 'settingOrder'
};

const mapLang = {
	en: 'English',
	cn: '中文',
	vi: 'Tiếng Việt'
};
const TYPE_MESSAGE = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
	INFO: 'INFO',
	CONNECTING: 'CONNECTING',
	SUCCESS: 'SUCCESS'
};

const DURATION_NEWS = {
	ALL: 'all',
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
	QUARTER: 'quarter',
	YEAR: 'year',
	CUSTOM: 'custom'
};

const TAB_NEWS = {
	RELATED: 'relatedNews',
	ALL: 'everything'
};

const STATUS_ACCOUNT = {
	ACTIVE: 'active',
	INACTIVE: 'inactive'
};
const TYPE_SEARCH_ACCOUNT = {
	SINGLE: 'SINGLE',
	LESS_FIVE_ACCOUNT: 'LESS_FIVE_ACCOUNT',
	ABOVE_FIVE_ACCOUNT: 'ABOVE_FIVE_ACCOUNT'
};

const API_RESPONSE_TYPE = {
	SUCCESS: 'SUCCESS',
	NULL: 'NULL',
	EXCEPTION: 'EXCEPTION'
};

const SYMBOL_CLASS_API_UPPER = {
	INDEX: 'INDEX'
};

const NEWS_DETAIL_TYPE = {
	HTML: 'html',
	PDF: 'pdf'
};

const DOCUMENT_TYPE_NEW = {
	URL: 'url',
	PDF: 'pdf',
	HTML: 'html',
	TEXT: 'text'
};

const NEWS_ERROR = {
	NEWS_STORY_UNAVAILABLE: '5000',
	NEWS_SOURCE_UNAVAILABLE: '5001',
	NEWS_CATEGORY_UNAVAILABLE: '5002',
	INVALID_TIME_RANGE: '5003',
	INVALID_SECURITY_CODE: '5004',
	INVALID_TAG: '5005'
};
const NAME_PANEL = {
	NEW_ORDER: 'NEW_ORDER',
	NEW_ALERT: 'NEW_ALERT',
	WATCH_LIST_DETAIL: 'WATCH_LIST_DETAIL',
	SEARCH_ACCOUNT: 'SEARCH_ACCOUNT',
	SEARCH_SYMBOL: 'SEARCH_SYMBOL',
	ADD_SYMBOL: 'ADD_SYMBOL',
	ADD_AND_SEARCH: 'ADD_AND_SEARCH',
	CONFIRM_ORDER: 'CONFIRM_ORDER'
};
const NEW_ORDER_INPUT_KEY = {
	ORDER_TYPE: 'ORDER_TYPE',
	QUANTITY: 'QUANTITY',
	LIMIT_PRICE: 'LIMIT_PRICE',
	TRIGGER_PRICE: 'TRIGGER_PRICE',
	DURATION: 'DURATION',
	DESTINATION: 'DESTINATION',
	ORDER_VALUE: 'ORDER_VALUE',
	STOP_PRICE: 'STOP_PRICE',
	STOPLOSS_QUANTITY: 'STOPLOSS_QUANTITY',
	STOPLOSS_ORDER_TYPE: 'STOPLOSS_ORDER_TYPE',
	STOPLOSS_DURATION: 'STOPLOSS_ORDER_TYPE',
	STOPLOSS_LIMIT_PRICE: 'STOPLOSS_LIMIT_PRICE',
	TAKE_PROFIT_LOSS: 'TAKE_PROFIT_LOSS',
	TAKE_PROFIT_QUANTITY: 'TAKE_PROFIT_QUANTITY',
	TAKE_PROFIT_ORDER_TYPE: 'TAKE_PROFIT_ORDER_TYPE',
	TAKE_PROFIT_DURATION: 'TAKE_PROFIT_DURATION',
	TAKE_PROFIT_LIMIT_PRICE: 'TAKE_PROFIT_LIMIT_PRICE',
	CONTINGENT_STRATEGY: 'CONTINGENT_STRATEGY'
};
const STATE_BUY_SELL = {
	BUY: 'BUY',
	SELL: 'SELL',
	DISABLE: 'DISABLE'
};
const KEY_LAST_NEW_ORDER = {
	LIMIT_PRICE: 'limitPrice',
	STOP_PRICE: 'stopPrice',
	DURATION: 'duration',
	EXCHANGE: 'exchange',
	DATE: 'date',
	DATE_PERIOD: 'datePeriod',
	IS_DATE_PICKER_USED: 'isDatePickerUsed'
};
const MANAGE_BUTTON_STATUS = {
	MANAGE: 0,
	UNDO_MANAGE: 1,
	DELETE: 2
};
const DELETE_BUTTON_STATUS = {
	DELETE_ALL: 0,
	DELETE: 1
};
const FILTER_WARRANT = {
	WATCHLIST: 'watchlist'
};
const MAPPING_COUNTRY_CODE = {
	AFG: 'AF',
	ALA: 'AX',
	ALB: 'AL',
	DZA: 'DZ',
	ASM: 'AS',
	AND: 'AD',
	AGO: 'AO',
	AIA: 'AI',
	ATA: 'AQ',
	ATG: 'AG',
	ARG: 'AR',
	ARM: 'AM',
	ABW: 'AW',
	AUS: 'AU',
	AUT: 'AT',
	AZE: 'AZ',
	BHS: 'BS',
	BHR: 'BH',
	BGD: 'BD',
	BRB: 'BB',
	BLR: 'BY',
	BEL: 'BE',
	BLZ: 'BZ',
	BEN: 'BJ',
	BMU: 'BM',
	BTN: 'BT',
	BOL: 'BO',
	BES: 'BQ',
	BIH: 'BA',
	BWA: 'BW',
	BVT: 'BV',
	BRA: 'BR',
	IOT: 'IO',
	BRN: 'BN',
	BGR: 'BG',
	BFA: 'BF',
	BDI: 'BI',
	CPV: 'CV',
	KHM: 'KH',
	CMR: 'CM',
	CAN: 'CA',
	CYM: 'KY',
	CAF: 'CF',
	TCD: 'TD',
	CHL: 'CL',
	CHN: 'CN',
	CXR: 'CX',
	CCK: 'CC',
	COL: 'CO',
	COM: 'KM',
	COD: 'CD',
	COG: 'CG',
	COK: 'CK',
	CRI: 'CR',
	HRV: 'HR',
	CUB: 'CU',
	CUW: 'CW',
	CYP: 'CY',
	CZE: 'CZ',
	CIV: 'CI',
	DNK: 'DK',
	DJI: 'DJ',
	DMA: 'DM',
	DOM: 'DO',
	ECU: 'EC',
	EGY: 'EG',
	SLV: 'SV',
	GNQ: 'GQ',
	ERI: 'ER',
	EST: 'EE',
	SWZ: 'SZ',
	ETH: 'ET',
	FLK: 'FK',
	FRO: 'FO',
	FJI: 'FJ',
	FIN: 'FI',
	FRA: 'FR',
	GUF: 'GF',
	PYF: 'PF',
	ATF: 'TF',
	GAB: 'GA',
	GMB: 'GM',
	GEO: 'GE',
	DEU: 'DE',
	GHA: 'GH',
	GIB: 'GI',
	GRC: 'GR',
	GRL: 'GL',
	GRD: 'GD',
	GLP: 'GP',
	GUM: 'GU',
	GTM: 'GT',
	GGY: 'GG',
	GIN: 'GN',
	GNB: 'GW',
	GUY: 'GY',
	HTI: 'HT',
	HMD: 'HM',
	VAT: 'VA',
	HND: 'HN',
	HKG: 'HK',
	HUN: 'HU',
	ISL: 'IS',
	IND: 'IN',
	IDN: 'ID',
	IRN: 'IR',
	IRQ: 'IQ',
	IRL: 'IE',
	IMN: 'IM',
	ISR: 'IL',
	ITA: 'IT',
	JAM: 'JM',
	JPN: 'JP',
	JEY: 'JE',
	JOR: 'JO',
	KAZ: 'KZ',
	KEN: 'KE',
	KIR: 'KI',
	PRK: 'KP',
	KOR: 'KR',
	KWT: 'KW',
	KGZ: 'KG',
	LAO: 'LA',
	LVA: 'LV',
	LBN: 'LB',
	LSO: 'LS',
	LBR: 'LR',
	LBY: 'LY',
	LIE: 'LI',
	LTU: 'LT',
	LUX: 'LU',
	MAC: 'MO',
	MDG: 'MG',
	MWI: 'MW',
	MYS: 'MY',
	MDV: 'MV',
	MLI: 'ML',
	MLT: 'MT',
	MHL: 'MH',
	MTQ: 'MQ',
	MRT: 'MR',
	MUS: 'MU',
	MYT: 'YT',
	MEX: 'MX',
	FSM: 'FM',
	MDA: 'MD',
	MCO: 'MC',
	MNG: 'MN',
	MNE: 'ME',
	MSR: 'MS',
	MAR: 'MA',
	MOZ: 'MZ',
	MMR: 'MM',
	NAM: 'NA',
	NRU: 'NR',
	NPL: 'NP',
	NLD: 'NL',
	NCL: 'NC',
	NZL: 'NZ',
	NIC: 'NI',
	NER: 'NE',
	NGA: 'NG',
	NIU: 'NU',
	NFK: 'NF',
	MNP: 'MP',
	NOR: 'NO',
	OMN: 'OM',
	PAK: 'PK',
	PLW: 'PW',
	PSE: 'PS',
	PAN: 'PA',
	PNG: 'PG',
	PRY: 'PY',
	PER: 'PE',
	PHL: 'PH',
	PCN: 'PN',
	POL: 'PL',
	PRT: 'PT',
	PRI: 'PR',
	QAT: 'QA',
	MKD: 'MK',
	ROU: 'RO',
	RUS: 'RU',
	RWA: 'RW',
	REU: 'RE',
	BLM: 'BL',
	SHN: 'SH',
	KNA: 'KN',
	LCA: 'LC',
	MAF: 'MF',
	SPM: 'PM',
	VCT: 'VC',
	WSM: 'WS',
	SMR: 'SM',
	STP: 'ST',
	SAU: 'SA',
	SEN: 'SN',
	SRB: 'RS',
	SYC: 'SC',
	SLE: 'SL',
	SGP: 'SG',
	SXM: 'SX',
	SVK: 'SK',
	SVN: 'SI',
	SLB: 'SB',
	SOM: 'SO',
	ZAF: 'ZA',
	SGS: 'GS',
	SSD: 'SS',
	ESP: 'ES',
	LKA: 'LK',
	SDN: 'SD',
	SUR: 'SR',
	SJM: 'SJ',
	SWE: 'SE',
	CHE: 'CH',
	SYR: 'SY',
	TWN: 'TW',
	TJK: 'TJ',
	TZA: 'TZ',
	THA: 'TH',
	TLS: 'TL',
	TGO: 'TG',
	TKL: 'TK',
	TON: 'TO',
	TTO: 'TT',
	TUN: 'TN',
	TUR: 'TR',
	TKM: 'TM',
	TCA: 'TC',
	TUV: 'TV',
	UGA: 'UG',
	UKR: 'UA',
	ARE: 'AE',
	GBR: 'GB',
	UMI: 'UM',
	USA: 'US',
	URY: 'UY',
	UZB: 'UZ',
	VUT: 'VU',
	VEN: 'VE',
	VNM: 'VN',
	VGB: 'VG',
	VIR: 'VI',
	WLF: 'WF',
	ESH: 'EH',
	YEM: 'YE',
	ZMB: 'ZM',
	ZWE: 'ZW'
};

const PORTFOLIO_TYPE = {
	EQUITY: 'equity',
	CFD: 'cfd'
};

const ORDER_LAYOUT = {
	BASIC: 'BASIC',
	ADVANCE: 'ADVANCE'
};

const NEWS_STATUS_CODE = {
	END_SESSION: 2
};

const ACTIVE_STREAMING = {
	QUOTE: 'quote',
	DEPTH: 'depth',
	TRADE: 'trade',
	NEWS: 'news',
	MARKET_ACTIVITY: 'market-activity'
};

const SEC_DETAIL_TAB = {
	DEPTH: 'DEPTH',
	NEWS: 'NEWS',
	COS: 'COS'
};

const ORDER_TAG = {
	ACTIVE: 0,
	EXECUTED: 1,
	INACTIVE: 2
};

const ORDER_TAG_STRING = {
	0: 'Active',
	1: 'Executed',
	2: 'Inactive'
};

const FILTER_CIRCLE_STATUS = {
	NONE: 0,
	UP: 1,
	DOWN: 2
};

const FILL_STATUS = {
	UNFILLED: 'Unfilled',
	PARTIALLY_FILLED: 'Partially Filled',
	FILLED: 'Filled'
};

const AMEND_TYPE = {
	AMEND_TRADING_STRATEGIES: 'AMEND_TRADING_STRATEGIES',
	AMEND_TRADING_STOPPRICE: 'AMEND_TRADING_STOPPRICE',
	AMEND_TRADING_PROFITLOSS: 'AMEND_TRADING_PROFITLOSS',
	AMEND_ORIGINAL: 'AMEND_ORIGINAL',
	DEFAULT: 'NEW_ORDER_ENTRY'
};
const CANCEL_TYPE = {
	CANCEL_ORDER_ORIGINAL: 'CANCEL_ORIGINAL',
	CANCEL_ORDER_STOP_LOSS: 'CANCEL_STOP_LOSS',
	CANCEL_ORDER_TAKE_PROFIT: 'CANCEL_TAKE_PROFIT',
	CANCEL_ORDER_DEFAULT: 'CANCEL_ORDER_DEFAULT'
};
const ORDERS_SDIE = {
	BUY: 'buy',
	SELL: 'sell'
};
const ANIMATION_TYPE = {
	FADE_IN_SPECIAL: 'fadeInSpecial',
	FADE_IN: 'fadeIn',
	FADE_IN_LEFT: 'fadeInLeft',
	FADE_IN_RIGHT: 'fadeInRight',
	FADE_OUT_LEFT: 'fadeOutLeft',
	FADE_OUT_RIGHT: 'fadeOutRight'
};
const ORIGINAL_ORDER_STATUS = {
	CREATE: 'Create',
	AMEND: 'Amend',
	PURGE: 'Purge',
	CANCEL: 'Cancel'
};
const SLTP_ORDER_STATUS = {
	TRIGGERED: 'Triggered',
	ACTIVE: 'Active',
	INACTIVE: 'Inactive',
	NOT_TRIGGERED: 'NOT TRIGGERED',
	TRIGGERED_INACTIVE: 'Triggered Inactive',
	DELETED: 'Deleted'
};
const ST_TP_ORDER_ACTION = {
	CREATE: 'CREATE',
	AMEND: 'AMEND',
	CANCEL: 'CANCEL',
	PURGE: 'PURGE'
};
const ACTION_STATUS = {
	OK: 'OK',
	FAILED: 'FAILED',
	PENDING: 'PENDING',
	AUTHORISING: 'AUTHORISING',
	QUEUED: 'QUEUED',
	DENIED: 'DENIED'
};
const METHOD_GET_LOT_SIZE_BY_EXCHANGE = {
	BALANCE: 'BALANCE',
	MARKET_INFO_SYMBOL: 'MARKET_INFO_SYMBOL'
};
const LOT_SIZE_EXCHANGE_BY_SYMBOL = ['SGX'];
const LOT_SIZE_EXCHANGE_BY_BALANCE = ['ASX'];
const TYPE_LOT_SIZE = {
	MARGIN: 'MARGIN',
	SECURITY: 'SECURITY'
};
const ORDER_INPUT_TYPE = {
	ORDER_QUANTITY: 'ORDER_QUANTITY',
	ORDER_VALUE: 'ORDER_VALUE'
};
const ERROR_MODIFY_CANCEL_ORDERS = {
	ORIGINAL_SUCCESS_ST_TP_SUCCESS:
		'Original and Strategy orders cancel success',
	ORIGINAL_ST_SUCCESS: 'Original and Stop loss orders cancel success',
	ORIGINAL_TP_SUCCESS: 'Original and Take Profit orders cancel success',
	ORIGINAL_SUCCESS: 'Original order cancel success',
	ST_TP_SUCCESS: 'Strategy order cancel success',
	ST_TP_FAILED: 'Strategy order cancel failed',
	TP_SUCCESS: 'Take Profit order cancel success',
	ST_SUCCESS: 'Stop loss order cancel success',

	TP_FAILED: 'Take Profit order cancel failed',
	ST_FAILED: 'Stop loss order cancel failed',
	TP_ST_FAILED: 'Strategy order cancel failed',
	ORIGINAL_FAILED: 'Original order cancel failed',
	ORIGINAL_FAILED_ST_TP_FAILED: 'Original and Strategy orders cancel failed',
	ORIGINAL_FAILED_ST_FAILED: 'Original and Stop loss orders cancel failed',
	ORIGINAL_FAILED_TP_FAILED: 'Original and Take Profit orders cancel failed'
};
const ERROR_MODIFY_AMEND_ORDERS = {
	ORIGINAL_SUCCESS_ST_TP_SUCCESS:
		'Original and Strategy orders amend success',
	ORIGINAL_ST_SUCCESS: 'Original and Stop loss orders amend success',
	ORIGINAL_TP_SUCCESS: 'Original and Take Profit orders amend success',
	ORIGINAL_SUCCESS: 'Original order amend success',
	ST_TP_SUCCESS: 'Strategy order amend success',
	ST_TP_FAILED: 'Strategy order amend failed',
	TP_SUCCESS: 'Take Profit order amend success',
	ST_SUCCESS: 'Stop loss order amend success',

	TP_FAILED: 'Take Profit order amend failed',
	ST_FAILED: 'Stop loss order amend failed',
	TP_ST_FAILED: 'Strategy order amend failed',
	ORIGINAL_FAILED: 'Original order amend failed',
	ORIGINAL_FAILED_ST_TP_FAILED: 'Original and Strategy orders amend failed',
	ORIGINAL_FAILED_ST_FAILED: 'Original and Stop loss orders amend failed',
	ORIGINAL_FAILED_TP_FAILED: 'Original and Take Profit orders amend failed'
};
const LOGIN_TYPE = {
	DEFAULT: 'DEFAULT',
	OKTA: 'OKTA'
};
const ENV_TYPE = {
	UAT: 'uat',
	DEV: 'dev'
};
const REGION_ACCESS = {
	EMAIL: 'email',
	OKTA: 'okta'
};
const WIDTH_DRAWER = 220;
const SSE_ERROR = {
	INACTIVE: 'Inactive',
	INVALID_EXCHANGE: 'Invalid code/exchange'
};
const LIST_REGION = {
	UAT: {
		AU: 'AU',
		UK: 'UK',
		SG: 'SG',
		TESTA: 'testa_okta',
		TESTB: 'testb_okta',
		TESTC: 'testc_okta'
	},
	DEV: {
		AU: 'AU',
		UK: 'UK',
		SG: 'SG',
		TESTA: 'testa_okta',
		TESTB: 'testb_okta',
		TESTC: 'testc_okta'
	}
};
const ALERT_LOG_TYPE = {
	LAST_PRICE: 'LAST_PRICE',
	NEWS: 'NEWS',
	TODAY_VOLUME: 'TODAY_VOLUME',
	ASK_PRICE: 'ASK_PRICE',
	BID_PRICE: 'BID_PRICE',
	CHANGEPOINT: 'CHANGE_POINT',
	CHANGEPERCENT: 'CHANGE_PERCENT',
	TRADE_PRICE: 'TRADE_PRICE',
	TRADE_VOLUME: 'TRADE_VOLUME',
	TRADE_VALUE: 'TRADE_VALUE'
};
const TRIGGER_ALERT = {
	CONTAINS: 'CONTAINS',
	IS_MARKET_SENSITIVE: 'IS_MARKET_SENSITIVE'
};
const ALERT_TAG = {
	ALERT: 0,
	NOTIFICATION: 1
};
const FAILED_MESSAGE = {
	INSUFFICIENT_FUNDS: '20049'
};
const BIOMETRIC_SETTING = {
	ON: 'true',
	OFF: 'false'
};
const BIOMETRIC_TYPE = {
	TOUCH_ID: 'Touch ID',
	FACE_ID: 'Face ID',
	BIOMETRICS: 'Biometrics'
};
export default {
	BIOMETRIC_TYPE,
	BIOMETRIC_SETTING,
	LIST_REGION,
	SSE_ERROR,
	WIDTH_DRAWER,
	REGION_ACCESS,
	ENV_TYPE,
	LOGIN_TYPE,
	ORIGINAL_ORDER_STATUS,
	ORDER_INPUT_TYPE,
	TYPE_LOT_SIZE,
	METHOD_GET_LOT_SIZE_BY_EXCHANGE,
	LOT_SIZE_EXCHANGE_BY_SYMBOL,
	LOT_SIZE_EXCHANGE_BY_BALANCE,
	ACTION_STATUS,
	ST_TP_ORDER_ACTION,
	SLTP_ORDER_STATUS,
	ANIMATION_TYPE,
	ORDERS_SDIE,
	FILL_STATUS,
	FILTER_CIRCLE_STATUS,
	ORDER_TAG,
	ORDER_TAG_STRING,
	AMEND_TYPE,
	CANCEL_TYPE,
	STEP,
	ROUND_STEP,
	SEC_DETAIL_TAB,
	ORDER_LAYOUT,
	ACTIVE_STREAMING,
	NEWS_STATUS_CODE,
	PORTFOLIO_TYPE,
	MAPPING_COUNTRY_CODE,
	FILTER_WARRANT,
	DELETE_BUTTON_STATUS,
	MANAGE_BUTTON_STATUS,
	NEWS_ERROR,
	DOCUMENT_TYPE_NEW,
	NEWS_DETAIL_TYPE,
	SYMBOL_CLASS_API_UPPER,
	API_RESPONSE_TYPE,
	STATUS_ACCOUNT,
	TAB_NEWS,
	DURATION_NEWS,
	TYPE_MESSAGE,
	FONT_SIZE_LIST,
	FONT_SIZE_INT,
	mapLang,
	TYPE_SETTING_NOTIFICATION_REF,
	ORDER_STATUS_STRING,
	USER_TYPE_ROLE_SHOW_ORDER_STATE,
	KEY_CONVERT_LV1,
	PANEL_POSITION,
	PRICE_LAST_PRICE_FUTURE_ALERT_TARGET,
	PRICE_LAST_PRICE_ALERT_TARGET,
	PRICE_NONE_LAST_PRICE_ALERT_TARGET,
	DELIVERY_METHOD,
	TAG_NEWS_STRING_BY_KEY,
	TAG_NEWS_KEY_BY_STRING,
	NEWS_ALERT_REPEAT,
	PRICE_ALERT_TRIGGER,
	NEWS_ALERT_TRIGGER,
	ALERT_TYPE,
	TYPE_RESET_REDUX,
	USER_BLOCK_ERROR,
	CHANNEL_NOTIFICATION_ID_ANDROID,
	ANDROID_VIBRATION_PATTERN,
	NUMBER_HISTORY_SEARCH_ACCOUNT,
	NUMBER_HISTORY_SEARCH_SYMBOL,
	NUMBER_HISTORY_SEARCH_WATCHLIST,
	LOGIN_RESPONSE,
	SECRET_KEY_ENCRYPT,
	USER_STATUS,
	TIME_REFRESH_TOKEN,
	NAV_BTN_ID,
	USER_TYPE,
	EVENT,
	FEE,
	FLAG,
	SIDE,
	LANG,
	LINK_HELP_CENTER,
	TIME_OPEN_NEWS,
	EXCHANGE_CLASS,
	SYMBOL_CLASS_QUERY,
	SYMBOL_CLASS,
	SYMBOL_CLASS_DISPLAY,
	SYMBOL_CLASS_DISPLAY_SHORT,
	RES_TYPE,
	REDUX_EVENT_TYPE,
	THEME,
	METHOD,
	SCREEN,
	REQ_KEY,
	CHANNEL,
	ID_FORM,
	TIMEZONE,
	EXCHANGE,
	CURRENCY,
	ICON_NAME,
	ROLE_USER,
	LOG_LEVEL,
	WATCHLIST,
	TYPE_NEWS,
	TABLE_NAME,
	NOTE_STATE,
	CACHE_TYPE,
	PRICE_LIST,
	ID_ELEMENT,
	ERROR_CODE,
	STATUS_ORD,
	TITLE_FORM,
	TITLE_NOTI,
	CHART_TYPE,
	ACTION_ORD,
	TREND_TYPE,
	KEY_VERSION,
	TREND_VALUE,
	CONFIRM_ORD,
	DEFAULT_TXT,
	LABEL_COUNT,
	PTC_CHANNEL,
	DEFAULT_VAL,
	AU_EXCHANGE,
	US_EXCHANGE,
	FORMAT_TIME,
	ENVIRONMENT,
	SUB_ENVIRONMENT,
	MONGO_METHOD,
	ORDER_ACTION,
	MAX_LEN_PATH,
	PRICE_SOURCE,
	DISPLAY_TYPE,
	PRICE_LIST_AU,
	KEYBOARD_TYPE,
	MENU_SELECTED,
	TEST_COVERAGE,
	TIME_FLASHING,
	ACCOUNT_STATE,
	PRICE_DECIMAL,
	CHANNEL_COUNT,
	PRICE_LIST_US,
	EXCHANGE_CODE,
	EXCHANGE_CODE_MAPPING,
	TRAILING_TYPE,
	ANIMATED_TYPE,
	PRICE_MAP_KEY,
	DURATION_CODE,
	PAGE_SIZE_NEWS,
	SPECIAL_STRING,
	MAX_LENGTH_COS,
	TYPE_EVENT_NAV,
	FLASHING_FIELD,
	FLASHING_TYPE,
	TYPE_PRICEBOARD,
	EXCHANGE_STRING,
	CNOTE_PAGE_SIZE,
	REPORT_DURATION,
	NAVIGATOR_EVENT,
	EXCHANGE_DETAIL,
	URL_TIME_SERVER,
	NAVIGATION_TYPE,
	RESPONSE_STATUS,
	DURATION_STRING,
	PRICE_FILL_TYPE,
	PRIORITY_SCREEN,
	LIST_DEVICE_APP,
	PRICE_LIST_GUEST,
	LIST_FILTER_TIME,
	LIST_PRICE_BOARD,
	FILTER_TYPE_NEWS,
	ORDER_TYPE_STRING,
	ORDER_TYPE_SYSTEM,
	TIME_AGO_INTERVAL,
	LIST_PRICE_OBJECT,
	BAR_BY_PRICE_TYPE,
	USER_PRICE_SOURCE,
	CNOTE_FILTER_TYPE,
	TYPE_FORM_REALTIME,
	ORDER_STATE_SYSTEM,
	TIMEOUT_HIDE_ERROR,
	LIST_FILTER_ACTION,
	TYPE_STREAMING_ALL,
	ORDERS_TYPE_FILTER,
	ORDER_STATE_STRING,
	XAO_SUMMARY_FILTER,
	ERROR_CODE_PASSWORD,
	STATUS_IN_FAVORITES,
	PRICE_LIST_TAB_LABEL,
	LIST_PRICE_OBJECT_AU,
	PRICEBOARD_STATIC_ID,
	OPEN_SESSION_AU_TIME,
	LIST_PRICE_OBJECT_US,
	OPEN_SESSION_US_TIME,
	EXCHANGE_CODE_STRING,
	EXCHANGE_STRING_CODE,
	REPORT_FROM_FILE_TYPE,
	STREAMING_MARKET_TYPE,
	ORDER_STATE_SAXO_CODE,
	SIGN_IN_SCREEN_SWITCH,
	CLOSE_SESSION_AU_TIME,
	CLOSE_SESSION_US_TIME,
	BUSINESS_LOG_PAGE_SIZE,
	FORGOT_PASSWORD_SCREEN,
	ORDER_TYPE_ORIGIN_UPPER,
	TYPE_VALID_CUSTOM_INPUT,
	BUSINESS_LOG_FILTER_TYPE,
	EXCHANGE_BY_VETTING_CODE,
	VETTING_CODE_BY_EXCHANGE,
	SUMMARY_PERFORMANCE_FILTER,
	TIME_FORGOT_PASSWORD_EXPIRE,
	LIST_FILTER_ACTION_OPERATOR,
	ERROR_CODE_PASSWORD_MAPPING,
	DURATION_MAPPING_STRING_CODE,
	VETTING_ORDER_TYPE_DURATION_BY_EXCHANGE,
	TIMEOUT_CANCEL_REPORT_FROM_FILE,
	LOCATION,
	ROLE_DETAIL,
	TIME_DURATION,
	TIME_DELAY,
	FONT_SIZES,
	KEY_INFOR_SELECTED_PORTFOLIO,
	TYPE_PORTFOLIO_DETAIL,
	REPORT_DURATION1,
	SIDE_POSITION,
	ALERT_SCREEN,
	TYPE_SEARCH_ACCOUNT,
	SIGN_NEWS,
	NAME_PANEL,
	NEW_ORDER_INPUT_KEY,
	STATE_BUY_SELL,
	TYPE_ERROR_ORDER,
	TAG_SYMBOL_CLASS,
	ERROR_MODIFY_CANCEL_ORDERS,
	ERROR_MODIFY_AMEND_ORDERS,
	ALERT_LOG_TYPE,
	TRIGGER_ALERT,
	ALERT_TAG,
	FAILED_MESSAGE
};

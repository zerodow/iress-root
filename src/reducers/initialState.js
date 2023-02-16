import filterType from '../constants/filter_type';
import userTypeEnum from '../constants/user_type';
import loginUserType from '../constants/login_user_type';
import PIN_SETTING from '../constants/pin_setting.json';
import * as utils from '../lib/base/functionUtil';
import * as timeUtils from '~/lib/base/dateTime';
import ENUM from '../enum';

const { FILTER_CIRCLE_STATUS, ANIMATION_TYPE } = ENUM;
export default {
	search: {
		listHistory: []
	},
	app: {
		loginUserType: loginUserType.MEMBER,
		isDemo: false,
		keys: {},
		fisrt_open: true,
		clear_storage: true,
		values: {},
		isConnected: true,
		isReviewAccount: false,
		listSymbolApi: {},
		exchanges: {}
	},
	login: {
		lastEmail: '',
		accountInfo: {},
		loginObj: {},
		email: '',
		password: '',
		userType: '',
		token: '',
		accountId: '',
		version: 0,
		isLogin: false,
		checked: false,
		isLocked: false,
		isLoading: true,
		forgotPass: false,
		error: '',
		errorForgot: '',
		isAuthLoading: false,
		errorAuth: '',
		isLoadingOkta: false,
		isLoadingOkta1: false,
		brokerName: '',
		loadingBroker: false
	},
	orderHistory: {
		isLoading: true,
		listData: []
	},
	tab: {
		currentTab: ''
	},
	trade: {
		listData: [],
		listSymbol: [],
		dicUserSymbol: {},
		loading: true,
		isLoading: false,
		isRefreshing: false,
		isFullData: false,
		dicSymbol: {},
		symbolIndex: -1,
		userType: userTypeEnum.Streaming,
		listDataFull: []
	},
	addcode: {
		listData: [],
		listSymbol: [],
		dicUserSymbol: {},
		isLoading: true,
		isRefreshing: false,
		isFullData: false,
		dicSymbol: {},
		symbolIndex: -1
	},
	user: {
		userInfo: {
			user_id: '',
			account_id: '',
			name: '',
			date_of_birth: '',
			gender: 1,
			driver_licence: '',
			phone: '',
			address: '',
			email: '',
			city: '',
			postcode: '',
			state: '',
			adviser_name: '',
			adviser_code: '',
			account_hin: ''
		},
		isLoading: true
	},
	picker: {
		name: ''
	},
	order: {
		triggerType: 'Percent',
		trailingPercent: 0,
		trailingStopPrice: 0,
		trailingAmount: 0,
		listHistory: [],
		orderType: 'MARKET TO LIMIT',
		volume: 0,
		limitPrice: 0,
		isSendOrder: false,
		stopPrice: 0,
		tradeType: 'sell',
		trail: 0,
		exchange: '', // temporary
		listLimitPrice: [],
		listStopPrice: [],
		userType: '',
		duration: '',
		tabInfo: {}
	},
	orders: {
		isLoading: true,
		data: [],
		buyFilter: false,
		sellFilter: false,
		volumeFilter: FILTER_CIRCLE_STATUS.NONE,
		timeFilter: FILTER_CIRCLE_STATUS.DOWN,
		isSyncData: false,
		isSyncSymbolinfo: false
	},
	loadingList: {
		animationType: ANIMATION_TYPE.FADE_IN
	},
	modifyOrder: {
		limitPrice: 0,
		stopPrice: 0,
		volume: 0,
		price: 0,
		trail: '%',
		trailingAmount: 0,
		trailingPercent: 0,
		trailingStopPrice: 0,
		userType: userTypeEnum.Streaming
	},
	portfolio: {
		isLoading: false,
		plState: 0,
		accActive: '',
		data: {}
	},
	reducerNews: {
		isSelector: false
	},
	working: {
		activeTab: 0,
		isRefresh: false,
		listData: [],
		listDataCancelled: [],
		listDataFilled: [],
		listDataStopLoss: [],
		isLoadingWorking: false,
		isLoadingStopLoss: false,
		isLoadingFilled: false,
		isLoadingCancelled: false
	},
	order_content: {
		orders_transaction: {},
		list_order_transction: [],
		order_id: ''
	},
	orderContent: {
		orders_transaction: {},
		list_order_transction: [],
		order_id: '',
		userType: ''
	},
	news: {
		notiStatus: {
			unread: 0,
			readOverview: false,
			listUnread: {}
		},
		listData: [],
		listDataMergeRealtime: [],
		listNewsOnWatchlist: [],
		listNewsMergeRealtimeOnWatchlist: [],
		isLoadMore: false,
		isRelatedLoadMore: false,
		isRefreshing: false,
		listSymbol: [],
		timeStamp: 9999999999999,
		isLoading: false,
		isLoadingOnWatchlist: true,
		filterType: filterType.ALL,
		relatedFilterType: filterType.ALL,
		everythingFilterType: filterType.ALL,
		notLoginFilterType: filterType.ALL,
		isFullData: true,
		isSearchLoading: false,
		listDataSearch: [],
		everythingPageID: 1,
		relatedPageID: 1,
		textSearch: ''
	},
	cnotes: {
		customDuration: {
			fromDate: new Date().setHours(0, 0, 0),
			toDate: new Date().setHours(23, 59, 59)
		},
		listData: [],
		isLoadMore: false,
		isRefreshing: false,
		listSymbol: [],
		timeStamp: 9999999999999,
		isLoading: true,
		isRefresh: false,
		isFullData: true,
		isSearchLoading: false,
		listDataSearch: [],
		cnoteTop: 0,
		textSearch: '',
		duration: ENUM.CNOTE_FILTER_TYPE.Week
	},
	bLog: {
		listData: [],
		isLoadMore: false,
		isRefreshing: false,
		listSymbol: [],
		timeStamp: 9999999999999,
		isLoading: true,
		isFullData: true,
		isSearchLoading: false,
		listDataSearch: [],
		bLogTop: 0,
		textSearch: '',
		duration: ENUM.LIST_FILTER_TIME.week,
		action: 'all',
		customDuration: null
	},
	cashAccountSummary: {
		is_loading: true,
		dataAccount: {},
		total: 0,
		dataDetail: []
	},
	setting: {
		lang: 'en',
		noti: true,
		notiSound: false,
		vibration: true,
		loginWithPassword: true,
		objStorage: null,
		news: {
			priceSensitive: true,
			allRelated: false,
			scheduled: true,
			reset: false,
			fromHour: 20,
			fromMinute: 0,
			toHour: 8,
			toMinute: 0
		},
		order: {
			on_market: true,
			partial_fill: false,
			filled: true,
			cancelled: true,
			rejected: true,
			expired: true,
			reset: false
		},
		homeScreen: 1,
		pinSetting: 0,
		userPriceSource: 0,
		timeZone: {},
		textFontSize: 17,
		order_history: [],
		account_history: [],
		watchlist_history: [],
		biometric: undefined,
		notiAlert: false
	},
	authSetting: {
		isLoading: false,
		error: '',
		isTurnOnTouchID: false
	},
	overview: {
		isLoading: false,
		data: [],
		dataTop5: [],
		dataByDate: {},
		chartType: '$',
		filterType: 'Day',
		userType: ''
	},
	individual: {
		applicant: [
			{
				title: '',
				gender: 'Male',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: false,
				consent: false
			},
			{
				title: '',
				gender: 'Female',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: true,
				consent: false
			}
		],
		linked: {
			providerName: 'Bank West'
		},
		chess: {
			accountHolder: ['61 21 262 641', '61 21 262 641', '61 21 262 641'],
			transfer: 'Transfer my/our HIN and all its holdings'
		},
		trading: [{ platform: 'Iress trader' }, { platform: 'Iress trader' }],
		applicantToTrade: {
			likeToApply: true
		}
	},
	company: {
		company: {
			companyType: 'Proprietary',
			companyName: 'Beli',
			mainSource: 'Advisor',
			isOrganised: false,
			isFinancial: true
		},
		applicant: [
			{
				title: '',
				gender: 'Male',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: false,
				consent: false
			},
			{
				title: '',
				gender: 'Female',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: true,
				consent: false
			}
		],
		additional: [
			{
				fullName: ''
			},
			{
				fullName: ''
			},
			{
				fullName: ''
			},
			{
				fullName: ''
			}
		],
		linked: {
			providerName: 'Bank West'
		},
		chess: {
			accountHolder: ['61 21 262 641', '61 21 262 641', '61 21 262 641'],
			transfer: 'Transfer my/our HIN and all its holdings'
		},
		trading: [{ platform: 'Iress trader' }, { platform: 'Iress trader' }],
		applicantToTrade: {
			likeToApply: true
		},
		interest: {
			areYouOr: false
		},
		beneficial: [
			{
				fullName: 'Beli Bond',
				residentialAddress: 'Australia',
				dob: '01/05/1988',
				isBeneficial: false,
				hasBeneficial: false
			},
			{
				fullName: 'Beli Bond',
				residentialAddress: 'Australia',
				dob: '01/05/1988',
				isBeneficial: false,
				hasBeneficial: false
			}
		]
	},
	trust: {
		company: {
			companyType: 'Proprietary',
			companyName: 'Beli',
			mainSource: 'Advisor',
			isOrganised: false,
			isFinancial: true
		},
		trust: {
			trustType: 'Charitable',
			trustABN: 'Beli',
			companyName: 'Beli',
			mainSource: 'Advisor',
			regulatedTrust: 'Self-Managed Super Fund',
			isOrganised: false,
			areAny: true,
			wasTheTrust: false
		},
		beneficial: [
			{
				fullName: 'Beli Bond',
				residentialAddress: 'Australia',
				dob: '01/05/1988',
				isBeneficial: false,
				hasBeneficial: false
			},
			{
				fullName: 'Beli Bond',
				residentialAddress: 'Australia',
				dob: '01/05/1988',
				isBeneficial: false,
				hasBeneficial: false
			}
		],
		additional: [
			{
				fullName: ''
			},
			{
				fullName: ''
			},
			{
				fullName: ''
			},
			{
				fullName: ''
			}
		],
		applicant: [
			{
				title: '',
				gender: 'Male',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: false,
				consent: false
			},
			{
				title: '',
				gender: 'Female',
				country: [
					{
						title: 'Australia',
						citizen: false,
						residesIn: true,
						taxResident: true
					},
					{
						title: 'America',
						citizen: true,
						residesIn: false,
						taxResident: false
					}
				],
				areYou: true,
				consent: false
			}
		],
		linked: {
			providerName: 'Bank West',
			incomeDirection: false
		},
		chess: {
			accountHolder: ['61 21 262 641', '61 21 262 641', '61 21 262 641'],
			transfer: 'Transfer my/our HIN and all its holdings'
		},
		applicantToTrade: {
			likeToApply: true
		},
		trading: [{ platform: 'Iress trader' }, { platform: 'Iress trader' }],
		interest: {}
	},
	priceRowEvent: {
		name: ''
	},
	priceTopRowEvent: {
		name: ''
	},
	overviewRowEvent: {
		codeOld: '',
		codeCurrent: ''
	},
	report: {},
	categoriesWL: {
		manageBtnStatus: 0,
		deleteBtnStatus: 0,
		dicSymbolAdded: {},
		firstIndex: ''
	}
};

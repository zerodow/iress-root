import { processColor } from 'react-native';
const version = ['demo', 'lite'];
const versionType = version[1];

module.exports = {
	currentIosVersion: '20181228000',
	currentAndroidVersion: '201901080000',
	colorVersion: versionType === 'demo' ? '#4c4c4c' : '#10a8b2',
	timeCodePush: 0,
	env: 'dev',
	color: { textColor: '#000', textTab: '#007aff', navigation: '#FFFFFF' },
	fontFamily: 'HelveticaNeue',
	fontTitle: 'HelveticaNeue-Medium',
	enableLog: true,
	timeCheckUpdate: 1 * 60 * 1000,
	enableSend: true,
	useParitechAccount: true,
	logChanel: 'https://dev2-api.equix.app/v1/log/data',
	colorIcon: {
		none: '#8e8e93',
		selected: versionType === 'demo' ? '#4c4c4c' : '#10a8b2'
	},
	button: {
		navigation: '#fefefe'
	},
	timeRender: 500,
	dataConnect: 'nchan',
	background: {
		tabBar: '#f8f8f89e',
		navigation: versionType === 'demo' ? '#4c4c4c' : '#10a8b2',
		statusBar: '#171b29',
		buttonGroupActive: '#FFFFFF',
		buttonGroup: versionType === 'demo' ? '#4c4c4c' : '#10a8b2',
		screen: '#FFF'
	},
	version: 201,
	candleChart: {
		axisDependency: 'RIGHT',
		drawValues: false,
		highlightColor: processColor('darkgray'),
		shadowColor: processColor('rgba(0, 0, 0, 0.7)'),
		shadowWidth: 1,
		shadowColorSameAsCandle: true,
		decreasingColor: processColor('#df0000'),
		increasingPaintStyle: 'fill',
		decreasingPaintStyle: 'fill',
		neutralColor: processColor('rgba(0, 0, 0, 0.87)'),
		increasingColor: processColor('#00b800')
	},
	// checkRender: true,
	checkRender: false,
	exceptionHanlder: false,
	enablePin: true,
	clearLocalStorage: false,
	isProductVersion: false,
	byPassVetting: false,
	enableRealtimePortfolioByMkt: true,
	environment: 'IRESS_DEV2',
	subEnvironment: 'IRESS_DEV2',
	envRegion: 'IRESS_DEV',
	logoInApp: 'IRESS',
	isDetoxTest: false,
	enableIress: false,
	byPassAuthen: true,
	isChangeRegion: true,
	appleStore: {
		// link: 'https://itunes.apple.com/us/app/apple-store/id3753809148?mt=8'
		link: 'itms-apps://itunes.apple.com/au/app/id1267749753?mt=8'
	},
	googleStore: {},
	sseUrlConfig: {
		IRESS_DEV2: {
			url: 'https://iress-streaming.equixapp.com'
		},
		IRESS_UAT: {
			url: 'https://iress-streaming.equixapp.com'
		},
		IRESS_PROD: {
			url: 'https://iress-streaming.equixapp.com'
		},
		IRESS_ABSA: {
			url: 'https://iress-streaming.equixapp.com'
		},
		CIMB_DEV: {
			url: 'https://iress-streaming.equixapp.com'
		},
		CIMB_UAT: {
			url: 'https://iress-streaming.equixapp.com'
		},
		CIMB_PROD: {
			url: 'https://iress-streaming.equixapp.com'
		},
		HL_DEV: {
			url: 'https://iress-streaming.equixapp.com'
		},
		HL_UAT: {
			url: 'https://iress-streaming.equixapp.com'
		}
	},
	apiUrlConfig: {
		IRESS_DEV2: {
			url: 'https://iress-dev-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		IRESS_UAT: {
			url: 'https://iress-uat-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		IRESS_PROD: {
			url: 'https://iress-prod-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		IRESS_ABSA: {
			url: 'https://iress-absa-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		CIMB_PROD: {
			url: 'https://iress-cimb-prod-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		CIMB_UAT: {
			url: 'https://iress-cimb-uat-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		CIMB_DEV: {
			url: 'https://iress-cimb-dev-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		HL_DEV: {
			url: 'https://iress-hl-dev-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		HL_UAT: {
			url: 'https://iress-hl-uat-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		},
		CIMB_UAT: {
			url: 'https://iress-hl-uat-api.equix.app',
			version: 'v1',
			cashBalanceVersion: 'v1',
			entityChangeVersion: 'v1',
			agilityReport: 'v1',
			calendar: 'v1'
		}
	},
	sseConfig: {
		url: 'https://iress-dev-market-feed.equix.app',
		port: '',
		fullUrl: 'https://iress-dev-market-feed.equix.app'
	},
	streamingConfig: {
		IRESS_DEV2: {
			url: 'https://iress-dev-market-feed.equix.app',
			urlAll: 'https://iress-dev-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		IRESS_UAT: {
			url: 'https://iress-uat-market-feed.equix.app',
			urlAll: 'https://iress-uat-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		IRESS_PROD: {
			url: 'https://iress-uat-market-feed.equix.app',
			urlAll: 'https://iress-uat-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		IRESS_ABSA: {
			url: 'https://iress-absa-market-feed.equix.app',
			urlAll: 'https://iress-absa-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		CIMB_UAT: {
			url: 'https://iress-cimb-uat-market-feed.equix.app',
			urlAll: 'https://iress-cimb-uat-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		CIMB_PROD: {
			url: 'https://iress-cimb-prod-market-feed.equix.app',
			urlAll: 'https://iress-cimb-prod-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		CIMB_DEV: {
			url: 'https://iress-cimb-dev-market-feed.equix.app',
			urlAll: 'https://iress-cimb-dev-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		HL_DEV: {
			url: 'https://iress-hl-dev-market-feed.equix.app',
			urlAll: 'https://iress-hl-dev-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		},
		HL_UAT: {
			url: 'https://iress-hl-uat-market-feed.equix.app',
			urlAll: 'https://iress-hl-uat-market-feed.equix.app',
			versionQuote: 'v1',
			versionTrades: 'v1',
			versionDepth: 'v1',
			versionPrice: 'v1',
			versionHistorical: 'v1',
			versionNews: 'v1',
			versionAll: 'v1',
			versionPortfolio: 'v1',
			versionOrder: 'v1'
		}
	},
	colors1: [
		'#6495ed',
		'#dc143c',
		'#ff69b4',
		'#ff6347',
		'#eee8aa',
		'#ee82ee',
		'#8a2ae2',
		'#6a5acd',
		'#33cd32',
		'#2e8b57',
		'#808000',
		'#008080',
		'#41e0d0',
		'#b0e0e6',
		'#000080',
		'#f5deb3',
		'#b8860b',
		'#800000',
		'#dcdcdc',
		'#778899',
		'#808080'
	],
	colors2: [
		'#dc143c',
		'#ff69b4',
		'#ff6347',
		'#eee8aa',
		'#ee82ee',
		'#8a2ae2',
		'#6a5acd',
		'#33cd32',
		'#2e8b57',
		'#808000',
		'#008080',
		'#41e0d0',
		'#b0e0e6',
		'#000080',
		'#f5deb3',
		'#b8860b',
		'#800000',
		'#dcdcdc',
		'#778899',
		'#6494ed',
		'#808080'
	],
	website: 'novus-fintech.com',
	urlWebsite: 'https://www.novus-fintech.com',
	registerWebsite: 'https://www.novus-fintech.com',
	aboutUs: '2020 - 2022 Novus Fintech Pty Ltd',
	urlLogTest: {
		info: 'https://hooks.slack.com/services/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',
		warning:
			'https://hooks.slack.com/services/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',
		error: 'https://hooks.slack.com/services/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'
	},
	network: {
		http: {
			timeout: {
				get: 10000,
				post: 20000,
				put: 20000,
				delete: 20000
			},
			resend: {
				get: true,
				post: false,
				put: false,
				delete: false
			}
		}
	}
};

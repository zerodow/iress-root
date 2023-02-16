import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Linking,
	Platform,
	StatusBar
} from 'react-native';
import logoEquix from '../../img/background_mobile/logo.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language';
import {
	log,
	setStyleNavigation,
	switchForm,
	setRefTabbar
} from '../../lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import config from '../../config';
import styles from './style/about_us';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { dataStorage, func } from '../../storage';
import ScreenId from '../../constants/screen_id';
import * as Controller from '../../memory/controller';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import Header from '../../../src/component/headerNavBar/index';
import BottomTabBar from '~/component/tabbar';
import Icons from '../../../src/component/headerNavBar/icon';
import FallHeader from '~/component/fall_header';
import Icon2 from '~/screens/watchlist/Component/Icon2.js';
import ENUM from '~/enum';

const { SUB_ENVIRONMENT } = ENUM;

export class AboutUs extends Component {
	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.perf = new Perf(performanceEnum.show_form_about_us);
		this.disableRateMe = this.checkDisableRateMe();
	}
	renderRightComp() {
		return (
			<React.Fragment>
				<Icon styles={{ paddingRight: 8 }} name="ios-create" />
				<Icon styles={{ paddingHorizontal: 8 }} name="ios-add-circle" />
				<Icon styles={{ paddingLeft: 8 }} name="ios-search" />
			</React.Fragment>
		);
	}
	componentWillMount() {
		this.perf &&
			this.perf.incrementCounter(performanceEnum.show_form_about_us);
		setCurrentScreen(analyticsEnum.aboutUs);
	}

	onRate(link) {
		Linking.canOpenURL(link).then(
			(supported) => {
				supported && Linking.openURL(link);
			},
			(err) => log(err)
		);
	}

	onNavigatorEvent(event) {
		if (event.type === 'DeepLink') {
			switchForm(this.props.navigator, event);
		}
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'menu_ios':
					this.props.navigator.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
			}
		} else {
			switch (event.id) {
				case 'didAppear':
					setRefTabbar(this.tabbar);
					func.setCurrentScreenId(ScreenId.ABOUT_US);
					break;
				default:
					break;
			}
		}
	}

	goToWebSite(url) {
		this.perf &&
			this.perf.incrementCounter(performanceEnum.click_to_website);
		Linking.openURL(url).catch((err) => log(err));
	}

	renderLeftComp = () => {
		return (
			<View style={{ left: -4 }}>
				<Icon2
					color={CommonStyle.fontColor}
					size={30}
					name="menu"
					onPress={this.openMenu}
					// style={{
					// 	alignSelf: 'center'
					// }}
				/>
				{/* <Icons styles={{ paddingRight: 16 }} name='ios-menu' onPress={this.openMenu} size={34} /> */}
			</View>
		);
	};
	openMenu = () => {
		const { navigator } = this.props;
		if (navigator) {
			navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
		}
	};

	renderHeader = this.renderHeader.bind(this);
	renderHeader() {
		const { navigator } = this.props;
		return (
			<Header
				navigator={navigator}
				leftIcon={'menu'}
				title="App Info"
				// renderLeftComp={this.renderLeftComp}
				containerStyle={{
					zIndex: 9999
				}}
				styleDefaultHeader={{
					paddingBottom: 0
				}}
				firstChildStyles={{ minHeight: 18 }}
				style={{ paddingTop: 16, paddingBottom: 5 }}
			></Header>
		);
	}

	checkDisableRateMe = this.checkDisableRateMe.bind(this);
	checkDisableRateMe() {
		// Disable rate me on IRESS MOBILE APP
		return true;
		if (
			config.subEnvironment === SUB_ENVIRONMENT.PRODUCT ||
			config.subEnvironment === SUB_ENVIRONMENT.BETA
		) {
			return false;
		}
		return true;
	}

	renderContentOM = this.renderContentOM.bind(this);
	renderContentOM() {
		const link =
			'https://itunes.apple.com/us/app/apple-store/id1267749753?mt=8';
		const linkAndroid =
			'https://play.google.com/store/apps/details?id=com.quantedge.equix3';
		const url = config.website;
		const urlWebsite = config.urlWebsite;
		return (
			<View style={CommonStyle.content}>
				<TouchableOpacity
					disabled={this.disableRateMe}
					style={[
						styles.rate,
						{ opacity: this.disableRateMe ? 0.54 : 1 }
					]}
					onPress={this.onRate.bind(
						this,
						Platform.OS === 'ios' ? link : linkAndroid
					)}
				>
					<Text style={[CommonStyle.textRate, { width: '100%' }]}>
						{I18n.t('rateMe')}
					</Text>
					<Ionicons
						testID="renderLinkToRateApp"
						name="ios-arrow-forward"
						style={styles.icon}
						color={CommonStyle.colorIconSettings}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.website}
					onPress={this.goToWebSite.bind(this, urlWebsite)}
				>
					<Text style={CommonStyle.textLink}>
						{I18n.t('website')}
					</Text>
					<Text
						style={[
							CommonStyle.textwebsite,
							{ textAlign: 'right', flex: 1 }
						]}
					>
						{url}
					</Text>
					<View
						style={{
							width: 24,
							marginTop: 5
						}}
					>
						<Ionicons
							testID="renderLinkToWebsite"
							name="ios-arrow-forward"
							style={styles.icon2}
							color={CommonStyle.colorIconSettings}
						/>
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	renderContentEquix = this.renderContentEquix.bind(this);
	renderContentEquix() {
		const link =
			'https://itunes.apple.com/us/app/apple-store/id1267749753?mt=8';
		const linkAndroid =
			'https://play.google.com/store/apps/details?id=com.quantedge.equix3';
		const urlWebsite = config.urlWebsite;
		return (
			<View style={CommonStyle.content}>
				<TouchableOpacity
					style={styles.rate}
					onPress={this.onRate.bind(
						this,
						Platform.OS === 'ios' ? link : linkAndroid
					)}
				>
					<Text
						style={[
							CommonStyle.inputText,
							{ width: '100%', paddingRight: 25 }
						]}
					>
						{I18n.t('textChangeTo')}
					</Text>
					<Ionicons
						testID="renderLinkToRateApp"
						name="ios-arrow-forward"
						style={styles.icon}
						color={CommonStyle.colorIconSettings}
					/>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		return (
			<FallHeader
				isNotBottomLine
				style={{ backgroundColor: CommonStyle.backgroundColorNews }}
				header={this.renderHeader()}
			>
				<View testID="ViewAboutUs" style={CommonStyle.containerAppInfo}>
					<View style={{ backgroundColor: CommonStyle.ColorTabNews }}>
						<View
							style={[CommonStyle.logo]}
							testID="logoEquixAbousUS"
						>
							<Image
								testID="iconEquix"
								style={styles.image}
								source={logoEquix}
							/>
							<Text
								testID="versionText"
								style={[
									CommonStyle.textMainLightOpacity,
									{ marginBottom: 24 }
								]}
							>
								{I18n.t('version')}
							</Text>
						</View>
					</View>

					{this.renderContentOM()}
					<View style={{ alignItems: 'center', paddingTop: 24 }}>
						<Text
							testID="nameCompany"
							style={CommonStyle.textMainLightOpacity}
						>
							{config.aboutUs}
						</Text>
					</View>
				</View>
				<BottomTabBar
					navigator={this.props.navigator}
					ref={(ref) => {
						this.tabbar = ref;
						setRefTabbar(ref);
					}}
				/>
			</FallHeader>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

export default connect(mapStateToProps)(AboutUs);

import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	Dimensions,
	TouchableOpacity,
	Platform,
	ScrollView,
	PixelRatio,
	Linking,
	StatusBar
} from 'react-native';
import styles from './style/disclaimer';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import background from '../../img/termsofuse.png';
import { CheckBox } from 'react-native-elements';
import I18n from '../../modules/language';
import deviceModel from '../../constants/device_model';
import { func, dataStorage } from '../../storage';
import {
	switchForm,
	logDevice,
	setDicReAuthen,
	isIphoneXorAbove,
	setRefTabbar
} from '../../lib/base/functionUtil';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import ScreenId from '../../constants/screen_id';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import config from '../../config';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import BottomTabBar from '../../component/tabbar';
import Header from '../../component/headerNavBar/index';
import Icons from '../../component/headerNavBar/icon';
import Header1 from './index';

const { height, width } = Dimensions.get('window');
const telpehone = `1300 769 433`;

export class Disclaimer extends Component {
	constructor(props) {
		super(props);
		this.deviceModel = dataStorage.deviceModel;
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.state = {
			softMenuBarHeight: 0,
			checked: true,
			disable: false
		};
		this.perf = new Perf(performanceEnum.show_form_disclaimer);
	}

	componentDidMount() {
		if (Platform.OS === 'android') {
			// Get soft bar height
			const softMenuBarHeight =
				ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0;
			console.log(`SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			logDevice('info', `SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			this.setState({
				softMenuBarHeight
			});
		}
		if (!this.props.backMore) {
			this.props.onCheck && this.props.onCheck(true);
		}
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
				case 'willAppear':
					this.perf &&
						this.perf.incrementCounter(
							performanceEnum.show_form_disclaimer
						);
					setCurrentScreen(analyticsEnum.terms);
					break;
				case 'didAppear':
					setRefTabbar(this.tabbar);
					if (this.props.backMore) {
						func.setCurrentScreenId(ScreenId.TERM_OF_USE);
					}
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	renderLeftComp = () => {
		return (
			<View style={{ left: -14 }}>
				<Icons
					styles={{ paddingRight: 16 }}
					name="ios-menu"
					onPress={this.openMenu}
					size={34}
				/>
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

	linkToOMPrivacyPolicy(url, type) {
		let linkingUrl = '';
		if (type === 'web') {
			linkingUrl = url;
		} else if (type === 'telephone') {
			linkingUrl = `tel:${url}`;
		}
		Linking.canOpenURL(linkingUrl)
			.then((supported) => {
				if (supported) {
					return Linking.openURL(linkingUrl)
						.then(() => {
							console.log('link success');
						})
						.catch((err) => console.log(err));
				} else {
					console.log('Linking not supported');
				}
			})
			.catch((error) => {
				logDevice(
					'info',
					`Disclaimer exception cant open link ${linkingUrl}: ${error}`
				);
			});
	}
	onCheck() {
		const checked = !this.state.checked;
		this.setState({ checked });
	}

	render() {
		const { navigator } = this.props;
		const title1 = I18n.tOri('termOfUseTitle1');
		const title2 = I18n.tOri('termOfUseTitle2');
		const title3 = I18n.tOri('termOfUseTitle3');
		const title4 = I18n.tOri('termOfUseTitle4');
		const title5 = I18n.tOri('termOfUseTitle5');
		const title6 = I18n.tOri('termOfUseTitle6');
		const title7 = I18n.tOri('termOfUseTitle7');
		const title8 = I18n.tOri('termOfUseTitle8');
		const title9 = I18n.tOri('termOfUseTitle9');
		const title10 = I18n.tOri('termOfUseTitle10');
		const title11 = I18n.tOri('termOfUseTitle11');
		const part1 = I18n.tOri('termOfUsePart1');
		const part2 = I18n.tOri('termOfUsePart2');
		const part3a = I18n.tOri('termOfUsePart3a');
		const part3c = `${I18n.tOri('termOfUsePart3c1')}

${I18n.tOri('termOfUsePart3c2')}`;
		const part4 = `${I18n.tOri('termOfUsePart41')}

${I18n.tOri('termOfUsePart42')}`;
		const part5 = I18n.tOri('termOfUsePart5');
		const part6a = I18n.tOri('termOfUsePart6a');
		const part6b = telpehone;
		const part6c = I18n.tOri('termOfUsePart6c');
		const part7a = I18n.tOri('termOfUsePart7a');
		const part7c1 = I18n.tOri('termOfUsePart7c1');
		const part7c2 = I18n.tOri('termOfUsePart7c2');
		const part7c3 = I18n.tOri('termOfUsePart7c3');
		const part7d = I18n.tOri('termOfUsePart7d');
		const part8 = I18n.tOri('termOfUsePart8');
		const part9 = `${I18n.tOri('termOfUsePart91')}

${I18n.tOri('termOfUsePart92')}

${I18n.tOri('termOfUsePart93')}`;
		const part10 = `${I18n.tOri('termOfUsePart101')}

${I18n.tOri('termOfUsePart102')}`;
		const part11 = I18n.tOri('termOfUsePart11');
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: this.props.backMore
						? CommonStyle.fontDefaultColor
						: CommonStyle.fontDefaultColor
				}}
			>
				{this.props.backMore ? (
					<View
						style={{
							backgroundColor: CommonStyle.backgroundColorNews
						}}
					>
						<StatusBar barStyle={CommonStyle.statusBarMode} />
						<Header
							navigator={navigator}
							leftIcon={'ios-menu'}
							title={I18n.tOri('disclaimer')}
							// renderLeftComp={this.renderLeftComp}
							style={{ paddingTop: 16, paddingBottom: 5 }}
						/>
					</View>
				) : (
					<View
						style={{
							backgroundColor: CommonStyle.backgroundColorNews
						}}
					>
						<StatusBar barStyle={CommonStyle.statusBarMode} />
						<Header1
							navigator={navigator}
							title={I18n.tOri('disclaimer')}
							style={{ paddingTop: 16, paddingLeft: 16 }}
						>
							<View
								style={{
									width: '100%',
									justifyContent: 'center'
								}}
							></View>
							<View style={{ paddingVertical: 4 }} />
						</Header1>
					</View>
				)}
				<ScrollView
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					style={{ marginHorizontal: 16 }}
				>
					<View style={{ height: 8 }}></View>
					{this.props.backMore ? null : (
						<View>
							<Text
								style={[
									this.props.backMore
										? CommonStyle.labelFromMenu
										: {
												textDecorationLine: 'underline',
												textDecorationColor:
													CommonStyle.fontColor,
												fontSize:
													CommonStyle.fontSizeM - 2,
												fontFamily:
													CommonStyle.fontPoppinsBold,
												color: CommonStyle.fontColor
										  }
								]}
							>
								{title1}
							</Text>
							<Text
								style={{
									lineHeight: 16,
									color: CommonStyle.fontColor,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular,
									paddingTop: 8
								}}
							>
								{part1}
							</Text>
							<View style={{ height: 24 }}></View>
						</View>
					)}
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								textDecorationLine: 'underline',
								textDecorationColor: CommonStyle.fontColor,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsBold,
								color: CommonStyle.fontColor
							}
						]}
					>
						{title2}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								opacity: 1,
								color: CommonStyle.fontColor,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part2}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsBold,
								color: CommonStyle.fontColor,
								paddingTop: 8
							}
						]}
					>
						{title3}
					</Text>
					<Text style={{ flexDirection: 'row', paddingTop: 8 }}>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part3a}
						</Text>
						{/* <Text onPress={this.linkToOMPrivacyPolicy.bind(this, linkToOM, 'web')} style={[CommonStyle.textSubMedium, { color: '#007aff', opacity: 1, fontSize: CommonStyle.fontSizeM - 2, fontFamily: CommonStyle.fontPoppinsRegular }]}>{part3b}</Text> */}
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part3c}
						</Text>
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM,
								fontFamily: CommonStyle.fontPoppinsBold
							}
						]}
					>
						{title4}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part4}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsBold,
								color: CommonStyle.fontColor
							}
						]}
					>
						{title5}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part5}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsBold,
								color: CommonStyle.fontColor
							}
						]}
					>
						{title6}
					</Text>
					<Text style={{ flexDirection: 'row', paddingTop: 8 }}>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part6a}
						</Text>
						<Text
							onPress={this.linkToOMPrivacyPolicy.bind(
								this,
								telpehone,
								'telephone'
							)}
							style={[
								CommonStyle.textSubMedium,
								{
									color: '#007aff',
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part6b}
						</Text>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part6c}
						</Text>
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsBold,
								color: CommonStyle.fontColor
							}
						]}
					>
						{title7}
					</Text>
					<Text style={{ flexDirection: 'row', paddingTop: 8 }}>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part7a}
						</Text>
						{/* <Text onPress={this.linkToOMPrivacyPolicy.bind(this, urlLinkToOMPrivacyPolicy, 'web')} style={[CommonStyle.textSubMedium, { color: '#007aff', opacity: 1, fontSize: CommonStyle.fontSizeM - 2, fontFamily: CommonStyle.fontPoppinsRegular }]}>{part7b}</Text> */}
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part7c1}
						</Text>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontStyle: 'italic',
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part7c2}
						</Text>
						<Text
							style={[
								CommonStyle.textSubMedium,
								{
									color: CommonStyle.fontColor,
									opacity: 1,
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsRegular
								}
							]}
						>
							{part7c3}
						</Text>
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{part7d}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{title8}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part8}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{title9}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part9}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{title10}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular,
								paddingTop: 8
							}
						]}
					>
						{part10}
					</Text>
					<View style={{ height: 24 }}></View>
					<Text
						style={[
							this.props.backMore
								? CommonStyle.labelFromMenu
								: CommonStyle.label,
							{
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{title11}
					</Text>
					<Text
						style={[
							CommonStyle.textSubMedium,
							{
								color: CommonStyle.fontColor,
								opacity: 1,
								paddingTop: 8,
								fontSize: CommonStyle.fontSizeM - 2,
								fontFamily: CommonStyle.fontPoppinsRegular
							}
						]}
					>
						{part11}
					</Text>
					<View style={{ height: 8 }}></View>
					<View></View>
					<View
						style={{
							height: CommonStyle.heightTabbar,
							width: '100%'
						}}
					/>
				</ScrollView>
				{this.props.backMore ? (
					<BottomTabBar
						navigator={this.props.navigator}
						ref={(ref) => {
							this.tabbar = ref;
							setRefTabbar(ref);
						}}
					/>
				) : (
					<View style={styles.footer}>
						<View
							style={{
								alignItems: 'center',
								flexDirection: 'row',
								justifyContent: 'space-between'
							}}
						>
							<CheckBox
								testID={`hideDisclaimer`}
								containerStyle={{
									margin: 0,
									marginLeft: 0,
									padding: 0,
									borderWidth: 0,
									backgroundColor: 'transparent',
									alignItems: 'flex-start'
								}}
								textStyle={{
									color: '#ffffff',
									fontSize: CommonStyle.fontSizeM - 2,
									fontFamily: CommonStyle.fontPoppinsMedium
								}}
								checkedColor={'#fefefe'}
								uncheckedColor={'#fefefe'}
								checkedIcon={'check-square'}
								onPress={() => this.onCheck()}
								center
								title={I18n.tOri('dontDisplayAgain')}
								checked={this.state.checked}
							/>
							<TouchableOpacity
								style={[
									styles.acceptButton,
									{ justifyContent: 'center' }
								]}
								disabled={this.state.disable}
								onPress={() => {
									if (Platform.OS === 'ios') {
										this.setState({ disable: true });
										if (this.props.backMore) {
											this.props.navigator.pop();
										} else {
											this.props.onCheck &&
												this.props.onCheck(
													this.state.checked
												);
											this.props.onAccept &&
												this.props.onAccept();
										}
									} else {
										this.setState({ disable: true });
										this.props.onCheck &&
											this.props.onCheck(
												this.state.checked
											);
										this.props.onAccept &&
											this.props.onAccept();
										func.setAutoOktaLogin(false);
									}
								}}
							>
								<Text
									testID={`disclaimerAcceptText`}
									style={[
										CommonStyle.textMainNoColor,
										{
											color: CommonStyle.fontColorButtonSwitch,
											fontSize: CommonStyle.fontSizeM
										}
									]}
								>
									{I18n.tOri('iAccept')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</View>
		);
	}
}

export default Disclaimer;

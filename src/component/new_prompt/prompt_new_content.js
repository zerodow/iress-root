import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
	StyleSheet,
	Linking
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import { BlurView } from 'react-native-blur';

export default class PromptNewContent extends Component {
	constructor(props) {
		super(props);
		this.isIOS = Platform.OS === 'ios';
		this.hideModal = this.hideModal.bind(this);
	}

	hideModal(cb) {
		this.props.hideModal(cb);
	}

	openURL(url) {
		Linking.canOpenURL(url)
			.then(supported => {
				if (supported) {
					return Linking.openURL(url)
						.then(() => {
							console.log('linking success');
						})
						.catch(error => {
							console.log('cant linking', error);
						});
				} else {
					console.log('Not supported');
				}
			})
			.catch(error => console.log('Cant Linking', error));
	}

	communication(param, type) {
		this.props.isHideModal && this.hideModal();
		setTimeout(() => {
			if (type === 'mail') {
				url = `mailto:${param}`;
			} else if (type === 'tel') {
				url = `tel:${param}`;
			}
			this.openURL(url);
		}, 500);
	}

	getTestIDModal() {
		return this.props.type === 'reviewAccount'
			? 'reviewAccLoginSuccessModal'
			: '';
	}

	getTestIDButton() {
		return this.props.type === 'reviewAccount'
			? `reviewAccLoginSuccessBtnConfirm`
			: ``;
	}

	getText(txt) {
		return I18n.t(txt, {
			locale: this.props.language
		});
	}

	renderAccountInfo(txt) {
		const { textDefault } = styles;
		return (
			<View
				style={{
					justifyContent: 'center',
					flexDirection: 'row'
				}}
			>
				<Text style={textDefault}>
					{this.getText('lockedAccPopup1')}
				</Text>
				<Text
					style={[
						textDefault,
						{
							fontWeight: '700',
							color: 'black'
						}
					]}
				>
					{dataStorage.accountId || ''}
				</Text>
				<Text style={textDefault}>{` ${this.getText(txt)}`}</Text>
			</View>
		);
	}

	renderPhoneSupport() {
		const { textDefault, textLink } = styles;
		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					justifyContent: 'center',
					marginTop: 15
				}}
			>
				<Text style={textDefault}>{`${this.getText(
					'reviewAccPopup2'
				)} `}</Text>

				<Text
					style={[textDefault, textLink]}
					onPress={() => this.communication('1300769433', 'tel')}
				>{`1300 769 433`}</Text>

				<Text style={textDefault}>{`, `}</Text>

				<Text
					style={[textDefault, textLink]}
					onPress={() => this.communication('+61381997700', 'tel')}
				>{`+61 3 81997700`}</Text>
			</View>
		);
	}

	renderMailSupport() {
		const { textLink, textDefault, textUnderline } = styles;
		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					justifyContent: 'center',
					marginTop: 5
				}}
			>
				<Text style={textDefault}>
					{this.getText('reviewAccPopup3')}{' '}
				</Text>

				<Text
					onPress={() =>
						this.communication('service@iress.com.au', 'mail')
					}
					style={[textDefault, textLink, textUnderline]}
				>{` ${this.getText('reviewAccPopup4')}`}</Text>

				<Text style={textDefault}>{` ${this.getText(
					'reviewAccPopup5'
				)}`}</Text>
			</View>
		);
	}

	renderContent(txt) {
		return (
			<View
				style={{
					marginHorizontal: 6,
					marginTop: 15,
					marginBottom: 15
				}}
			>
				{this.renderAccountInfo(txt)}
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						justifyContent: 'center'
					}}
				/>
				{this.renderPhoneSupport()}
				{this.renderMailSupport()}
			</View>
		);
	}

	getLockText() {
		const { touchIDType, type } = this.props;
		if (touchIDType === '' || !touchIDType) {
			if (type === 'changedToken') {
				return this.getText('changedTokenWarning');
			}
			return this.getText('wrongPinManyTimes');
		}
		if (touchIDType === 'notEnrolled') {
			if (this.isIOS) {
				return this.getText('changedTokenWarning');
			}
			return this.getText('wrongPinManyTimes');
		}

		return this.getText('lockTouchID');
	}

	renderFailContent() {
		return (
			<View
				style={{
					marginHorizontal: 16,
					marginTop: 9.5,
					marginBottom: 9.5
				}}
			>
				<Text
					testID={`failPin`}
					style={[
						this.isIOS
							? CommonStyle.textMainNormalNoColor
							: CommonStyle.fontLargeNormal,
						{
							color: '#030303',
							textAlign: 'left'
						}
					]}
				>
					{this.getLockText()}
				</Text>
			</View>
		);
	}

	renderModalContent() {
		let content = null;
		switch (this.props.type) {
			case 'reviewAccount':
				content = this.renderContent('reviewAccPopup1');
				break;

			case 'lockedAccount':
				content = this.renderContent('lockedAccPopup2');
				break;
			default:
				content = this.renderFailContent();
				break;
		}

		return content;
	}

	renderLoadingButton() {
		if (this.props.isLoading) {
			return (
				<ActivityIndicator
					style={{
						width: 24,
						height: 24
					}}
					color="black"
				/>
			);
		}

		return (
			<Text
				testID={this.getTestIDButton()}
				style={[
					CommonStyle.fontLargeNormal,
					{
						color: CommonStyle.fontApple,
						textAlign: 'center'
					}
				]}
			>
				{this.getText('ok')}
			</Text>
		);
	}

	renderModalButton() {
		if (this.props.isLockedTouchID) {
			return (
				<View
					style={{
						height: 45,
						marginTop: 0,
						marginBottom: 0,
						flexDirection: 'row'
					}}
				>
					<TouchableOpacity
						onPress={this.hideModal}
						style={{
							flex: 1,
							borderRightWidth: 0.5,
							borderRightColor: '#0000001e',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							style={[
								CommonStyle.fontLargeNormal,
								{
									color: CommonStyle.fontApple,
									textAlign: 'center'
								}
							]}
						>
							{this.getText('cancel')}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={this.props.linkAppSetting}
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							style={[
								CommonStyle.fontLargeNormal,
								{
									color: CommonStyle.fontApple,
									textAlign: 'center'
								}
							]}
						>
							{this.getText('settings')}
						</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<TouchableOpacity
				onPress={
					this.props.type === 'reviewAccount' ||
						this.props.type === 'lockedAccount'
						? this.hideModal
						: this.props.logoutFunc
				}
				style={{
					marginVertical: 8,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				{this.renderLoadingButtonState()}
			</TouchableOpacity>
		);
	}

	renderMainContent() {
		return (
			<View
				testID={this.getTestIDModal()}
				style={{ backgroundColor: 'transparent' }}
			>
				{this.renderModalContent()}

				<View
					style={{
						height: 1,
						backgroundColor: '#0000001e'
					}}
				/>

				{this.renderModalButton()}
			</View>
		);
	}

	render() {
		if (this.isIOS) {
			return (
				<BlurView blurType="xlight" style={{ borderRadius: 16 }}>
					{this.renderMainContent()}
				</BlurView>
			);
		}

		return (
			<View
				style={{
					backgroundColor: 'white',
					borderRadius: 12
				}}
			>
				{this.renderMainContent()}
			</View>
		);
	}
}

PromptNewContent.defaultProps = {
	linkAppSetting: () => null
};

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		textLink: {
			color: CommonStyle.fontApple
		},
		textEmail: {
			fontWeight: this.isIOS ? '700' : 'bold'
		},
		textDefault: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontFamily,
			color: '#030303'
		},
		textUnderline: {
			textDecorationLine: 'underline'
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

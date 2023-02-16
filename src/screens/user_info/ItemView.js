import React, { PureComponent } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableWithoutFeedback,
	Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import TransitionView from '~/component/animation_component/transition_view'

class ItemView extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {}
		this.labelAnim = 'fadeInLeft'
		this.contentAnim = 'fadeInRightBig'
	}

	renderContentManagement = this.renderContentManagement.bind(this)
	renderContentManagement() {
		const fakeData = [
			'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
			'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
		]
		const { title, value, isLoading } = this.props;
		console.log('DCM renderContentManagement', isLoading, new Date())
		let remakeValueStyle = null;
		switch (title) {
			case 'Organisation Code Management':
				remakeValueStyle = {
					marginVertical: 2,
					paddingHorizontal: 10,
					color: '#ffffff',
					fontSize: CommonStyle.fontSizeXS,
					backgroundColor: '#00b800',
					borderRadius: 1,
					marginTop: 7,
					fontFamily: 'HelveticaNeue',
					fontWeight: 'bold',
					marginRight: 8
				};
				return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
					{
						value.length !== 0
							? value.map((element, index) => (
								<Text key={index} style={remakeValueStyle}>
									{element}
								</Text>
							))
							: <Text> </Text>
					}
				</View>
			case 'Branch Code Management':
				remakeValueStyle = {
					paddingVertical: 2,
					paddingHorizontal: 10,
					color: '#ffffff',
					fontSize: CommonStyle.fontSizeXS,
					backgroundColor: '#ec870e',
					borderRadius: 1,
					marginTop: 7,
					fontFamily: 'HelveticaNeue',
					fontWeight: 'bold',
					marginRight: 8
				};
				return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
					{
						value.length !== 0
							? value.map((element, index) => (
								<Text key={index} style={remakeValueStyle}>
									{element}
								</Text>
							))
							: <Text> </Text>
					}
				</View>
			case 'Advisor Code Management':
				remakeValueStyle = {
					paddingVertical: 2,
					paddingHorizontal: 10,
					color: '#ffffff',
					fontSize: CommonStyle.fontSizeXS,
					backgroundColor: '#2096f3',
					borderRadius: 1,
					marginTop: 7,
					fontFamily: 'HelveticaNeue',
					fontWeight: 'bold',
					marginRight: 8
				};
				return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
					{
						value.length !== 0
							? value.map((element, index) => (
								<Text
									key={index}
									style={remakeValueStyle}>
									{element}
								</Text>
							))
							: <Text> </Text>
					}
				</View>
			case 'Account Management':
				remakeValueStyle = {
					marginVertical: 4,
					paddingHorizontal: 10,
					color: '#ffffff',
					fontSize: CommonStyle.fontSizeXS - 1,
					borderRadius: 8,
					marginTop: 4,
					fontFamily: CommonStyle.fontPoppinsRegular,
					marginRight: 8
				};
				return value.length !== 0
					? value.map(element => (
						<View
							style={{
								backgroundColor: 'rgba(91, 183, 194, 0.15)',
								borderRadius: 8,
								marginBottom: 8
							}}
						>
							<Text
								key={element.account_id}
								style={remakeValueStyle}
							>
								{`${element.account_name} (${element.account_id})`}
							</Text>
						</View>
					))
					: isLoading
						? <TransitionView animation={this.contentAnim}>
							{
								fakeData.map(element => (
									<ViewLoading
										isLoading={true}
										containerStyle={[{
											flexDirection: 'row',
											alignItems: 'center',
											alignSelf: 'center'
										}]}>
										<View
											style={{
												backgroundColor: 'rgba(91, 183, 194, 0.15)',
												borderRadius: 8,
												marginBottom: 8
											}}
										>
											<Text
												key={element.account_id}
												style={remakeValueStyle}
											>
												{`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`}
											</Text>
										</View>
									</ViewLoading>
								))
							}
						</TransitionView>
						: null
		}
	}

	render() {
		const { title, value, isEmailNotif, isLoading, style = {} } = this.props;
		const needUpperCase = title === 'Role'
		return (
			<View
				style={[
					styles.container,
					{ borderBottomColor: CommonStyle.fontBorderNewsUi },
					style
				]}
			>
				<View style={styles.leftBox}>
					<TransitionView animation={this.labelAnim}>
						<Text style={CommonStyle.textFloatingLabel2}>{title}</Text>
					</TransitionView>
					{
						Array.isArray(value)
							? this.renderContentManagement()
							: <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
								<TransitionView animation={this.contentAnim}>
									<TextLoading
										styleViewLoading={{ alignSelf: 'baseline' }}
										isLoading={isLoading}
										style={[CommonStyle.accountInfo]}>
										{
											isLoading && !value
												? 'userInfo'
												: needUpperCase
													? value.toUpperCase()
													: value
										}
									</TextLoading>
								</TransitionView>
							</View>
					}
				</View>
				{
					isEmailNotif && isEmailNotif
						? <TouchableWithoutFeedback
							onPress={() => {
								this.props.hideTabbarQuick && this.props.hideTabbarQuick()
								this.props.navigator.showModal({
									screen: 'equix.AlertModal',
									animationType: 'none',
									navigatorStyle: {
										...CommonStyle.navigatorModalSpecialNoHeader,
										modalPresentationStyle: 'overCurrentContext'
									},
									passProps: {
										showTabbarQuick: this.props.showTabbarQuick,
										hideTabbarQuick: this.props.hideTabbarQuick
									}
								})
							}}
						>
							<MaterialCommunityIcons
								name={'border-color'}
								size={20}
								color={CommonStyle.color.modify}
								style={{ opacity: 1, alignSelf: 'flex-end' }}
							/>
						</TouchableWithoutFeedback>
						: null
				}
			</View>
		);
	}
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	container: {
		borderBottomWidth: 1,
		paddingVertical: 6,
		paddingRight: 16,
		backgroundColor: 'transparent'
	},
	leftBox: {
		alignItems: 'flex-start',
		flex: 1
	},
	titleStyle: {
		fontSize: CommonStyle.fontSizeXS,
		opacity: 0.87
	},
	valueStyle: {
		fontSize: CommonStyle.fontSizeM,
		marginTop: 4,
		opacity: 0.87,
		fontWeight: '500'
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default ItemView;

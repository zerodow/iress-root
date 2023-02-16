import React, { Component } from 'react';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import { iconsMap } from '../../utils/AppIcons';
import { View, Text, ScrollView, processColor, TouchableOpacity, PixelRatio } from 'react-native';

export default class CustomerGroupManagement extends Component {
	constructor(props) {
		super(props);
				this.groupDetail = this.groupDetail.bind(this);
		this.listGroup = [
			{
				name: 'Individual Normal',
				description: 'Group of idividual accounts with holding valuation lo...',
				callback: (item) => this.groupDetail(item.name)
			}, {
				name: 'Company',
				description: 'Group of company accounts',
				callback: (item) => this.groupDetail(item.name)
			}, {
				name: 'Trust/Super Fund',
				description: 'Western Areas Limited',
				callback: (item) => this.groupDetail(item.name)
			}
		]
	}
	groupDetail(title) {
		this.props.navigator.push({
			screen: 'equix.CustomerGroupDetail',
			backButtonTitle: '',
			title: title,
			navigatorStyle: {
				navBarBackgroundColor: CommonStyle.statusBarBgColor,
				navBarTranslucent: false,
				drawUnderNavBar: true,
				navBarHideOnScroll: false,
				navBarTextColor: config.color.navigation,
				navBarTextFontFamily: 'HelveticaNeue-Medium',
				navBarTextFontSize: 18,
				navBarNoBorder: true,
				navBarTransparent: true,
				navBarButtonColor: config.button.navigation,
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				drawUnderTabBar: false,
				navBarSubtitleColor: 'white',
				navBarSubtitleFontFamily: 'HelveticaNeue'
			},
			navigatorButtons: {
				rightButtons: [{
					id: 'create_customer_group',
					icon: iconsMap['ios-create-outline']
				}]
			}
		});
	}

	companyAccount() {
		console.log('Comany Account');
	}

	trustSuperAccount() {
		console.log('Trust/Super Fund');
	}
	render() {
		return (
			<View style={{ marginLeft: 16 }}>
				{this.listGroup.map(item => {
					return <TouchableOpacity onPress={() => item.callback(item)} key={item.name} style={{ marginTop: 10 }}>
						<Text style={CommonStyle.textMain}>{item.name}</Text>
						<Text style={CommonStyle.textSub}>{item.description}</Text>
						<View style={{
							marginTop: 10,
							height: 1,
							width: '100%',
							borderBottomWidth: 1,
							borderColor: '#0000001e'
						}}></View>
					</TouchableOpacity>
				})}
			</View>
		);
	}
}

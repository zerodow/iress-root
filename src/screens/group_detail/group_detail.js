import React, { Component } from 'react';
import { View, Text, Platform, Dimensions, TouchableOpacity, Modal, AppState, Alert } from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { dataStorage, func } from '../../storage';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';
import GroupDetailInformation from '../group_detail_information/group_detail_information';

const { height, width } = Dimensions.get('window');
export default class CustomerGroupDetail extends Component {
	render() {
		return (
			<Tabs
				style={[{
					backgroundColor: '#ffffff'
				}]}
				test_id='Tabs'
				onChangeTab={(tabInfo) => {
					if (this.setButton) {
						this.setButton(tabInfo)
					}
				}}
				tabBarUnderlineStyle={{ height: dataStorage.platform === 'ios' ? 0 : 2, backgroundColor: 'white' }}
				renderTabBar={(...arg) => {
					return <ScrollableTabBar activeTab={1} activeTextColor='#FFF' renderTab={(name, page, isTabActive, onPressHandler, onLayoutHandler) => {
						if (dataStorage.platform === 'ios') {
							return (<TouchableOpacity test_id={'Tab' + page}
								key={page}
								onPress={() => onPressHandler(page)}
								onLayout={onLayoutHandler}
								style={{
									height: 30,
									alignItems: 'center',
									justifyContent: 'center',
									borderRightColor: config.background.buttonGroupActive,
									borderTopColor: config.background.buttonGroupActive,
									borderTopWidth: 1,
									borderBottomColor: config.background.buttonGroupActive,
									borderBottomWidth: 1,
									marginLeft: page === 0 ? 16 : 0,
									marginRight: page === 2 ? 16 : 0,
									borderLeftColor: config.background.buttonGroupActive,
									backgroundColor: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup,
									borderLeftWidth: page === 0 ? 1 : 0,
									borderRightWidth: 1,
									borderTopLeftRadius: page === 0 ? 4 : 0,
									borderBottomLeftRadius: page === 0 ? 4 : 0,
									borderTopRightRadius: page === 2 ? 4 : 0,
									borderBottomRightRadius: page === 2 ? 4 : 0,
									width: (width - 32) / 3
								}}>
								<Text style={{
									color: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
									height: 18,
									fontFamily: 'HelveticaNeue',
									fontSize: CommonStyle.font13,
									fontWeight: '300',
									lineHeight: 18.0,
									letterSpacing: -0.06,
									textAlign: 'center'
								}}>{name}</Text>
							</TouchableOpacity>);
						} else {
							return (<TouchableOpacity test_id={'Tab' + page}
								key={page}
								onPress={() => onPressHandler(page)}
								onLayout={onLayoutHandler}
								style={{
								height: 48,
								alignItems: 'center',
								justifyContent: 'center',
								width: width / 3
								}}>
								<Text style={{
									color: isTabActive ? '#ffffff' : '#b2ffffff',
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontMedium,
									textAlign: 'center'
								}}>{name.toUpperCase()}</Text>
							</TouchableOpacity>);
						}
					}} backgroundColor={config.background.buttonGroup} tabsContainerStyle={dataStorage.platform === 'ios' ? { height: 32, marginTop: 8 } : { height: 49 }} />
				}}>
				<View tabLabel={I18n.t('Information')} style={{ flex: 1, backgroundColor: '#FFF' }}>
					<GroupDetailInformation navigator={this.props.navigator} />
				</View>
				<View tabLabel={I18n.t('ListOfGroup')} style={{ flex: 1, backgroundColor: '#FFF' }}>
					<GroupDetailInformation navigator={this.props.navigator} />
				</View>
				<View tabLabel={I18n.t('fees')} style={{ flex: 1, backgroundColor: '#FFF' }}>
					<GroupDetailInformation navigator={this.props.navigator} />
				</View>
			</Tabs>
		);
	}
}

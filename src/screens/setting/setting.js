import React, { Component, PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	View, Dimensions
} from 'react-native';
import * as settingActions from './setting.actions';
import * as loginActions from '../login/login.actions';
import {
	switchForm, logDevice, setRefTabbar
} from '../../lib/base/functionUtil';
import BottomTabBar from '~/component/tabbar'
// Component
import MainSetting from './main_setting/main_setting'
import NewsSetting from './news_setting/news_setting'
import OrderSetting from './order_setting/order_setting'
import SecuritySetting from './auth_setting/auth_setting2'
import ScreenId from '~/constants/screen_id';
import { func } from '~/storage';
import CommonStyle from '~/theme/theme_controller';

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')

class Setting extends Component {
	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	onNavigatorEvent(event) {
		if (event.type === 'DeepLink') {
			switchForm(this.props.navigator, event)
		}
		switch (event.id) {
			case 'didAppear': setRefTabbar(this.refBottomTabBar)
				func.setCurrentScreenId(ScreenId.SETTING)
				break
		}
	}

	getBottomTabLayout = this.getBottomTabLayout.bind(this)
	getBottomTabLayout(event) {
		return this.heightBottomBar = event.nativeEvent.layout.height;
	}

	setRef = this.setRef.bind(this)
	setRef(type, ref) {
		this.dicRef[type] = ref
	}

	setRefNewsNotification = this.setRefNewsNotification.bind(this)
	setRefNewsNotification(ref) {
		if (ref) {
			this.refNewsNoti = ref
		}
	}

	getRefNewsNotification = this.getRefNewsNotification.bind(this)
	getRefNewsNotification() {
		return this.refNewsNoti
	}

	setRefOrderNotification = this.setRefOrderNotification.bind(this)
	setRefOrderNotification(ref) {
		if (ref) {
			this.refOrderNoti = ref
		}
	}

	setRefSecurity = this.setRefSecurity.bind(this)
	setRefSecurity(ref) {
		if (ref) {
			this.refSecurity = ref
		}
	}

	getRefOrderNotification = this.getRefOrderNotification.bind(this)
	getRefOrderNotification() {
		return this.refOrderNoti
	}

	getRefSecurity = this.getRefSecurity.bind(this)
	getRefSecurity() {
		return this.refSecurity
	}

	setRefBottomTabBar = this.setRefBottomTabBar.bind(this)
	setRefBottomTabBar(ref) {
		setRefTabbar(ref)
		this.refBottomTabBar = ref
	}
	showTabbarQuick = this.showTabbarQuick.bind(this)
	showTabbarQuick() {
		this.refBottomTabBar && this.refBottomTabBar.showTabbarQuick()
	}
	hideTabbarQuick = this.hideTabbarQuick.bind(this)
	hideTabbarQuick() {
		this.refBottomTabBar && this.refBottomTabBar.hideTabbarQuick()
	}

	changeLanguageBottomTabBar = this.changeLanguageBottomTabBar.bind(this)
	changeLanguageBottomTabBar() {
		this.refBottomTabBar && this.refBottomTabBar.forceUpdate()
	}

	render() {
		return (
			<React.Fragment>
				<View style={{ height: '100%', width: 4 * WIDTH_DEVICE, flexDirection: 'row' }}>
					<MainSetting
						changeLanguageBottomTabBar={this.changeLanguageBottomTabBar}
						getRefNewsNotification={this.getRefNewsNotification}
						getRefOrderNotification={this.getRefOrderNotification}
						getRefSecurity={this.getRefSecurity}
						navigator={this.props.navigator}
						forceUpdate={() => {
							this.forceUpdate();
							this.props.navigator.setStyle({ statusBarColor: CommonStyle.statusBarColor });
						}}
					/>
					<NewsSetting
						navigator={this.props.navigator}
						setRef={this.setRefNewsNotification} />
					<OrderSetting
						navigator={this.props.navigator}
						setRef={this.setRefOrderNotification} />
					<SecuritySetting
						showTabbarQuick={this.showTabbarQuick}
						hideTabbarQuick={this.hideTabbarQuick}
						navigator={this.props.navigator}
						setRef={this.setRefSecurity} />
				</View>
				<BottomTabBar
					setRef={this.setRefBottomTabBar}
					navigator={this.props.navigator}
					onLayout={this.getBottomTabLayout} />
			</React.Fragment>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		setting: state.setting
	}
}
export default connect(mapStateToProps)(Setting)

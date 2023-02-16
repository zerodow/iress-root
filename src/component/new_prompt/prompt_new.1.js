import React, { Component } from 'react';
import { View, Text, Platform, PixelRatio } from 'react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as loginActions from '../../screens/login/login.actions';
import Content from './prompt_new_content';

class PromptNew extends Component {
	constructor(props) {
		super(props);
				this.state = {
			isModalVisible: false
		};
		this.logoutFunc = this.logoutFunc.bind(this);
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.onHideModal = this.onHideModal.bind(this);
		this.isIOS = Platform.OS === 'ios';
	}

	componentDidMount() {
		this.props.isShow && this.showModal();
	}

	showModal() {
		this.setState({
			isModalVisible: true
		});
	}

	onHideModal(cb) {
		if (cb && typeof cb === 'function') cb();
		const {
			hidePlacingOrderCb = () => null,
			reloadAfterLoginCallback = () => null,
			realtimeLockFn = () => null
		} = this.props;

		hidePlacingOrderCb();
		reloadAfterLoginCallback();
		realtimeLockFn();
	}
	hideModal(cb = null) {
		this.setState({ isModalVisible: false }, () => this.onHideModal(cb));
	}

	logoutFunc() {
		// Clear last email when enter wrong pin 3 times
		this.props.actions.setLastEmail('');
		this.props.actions.logout(this.props.navigator, this.hideModal);
	}

	render() {
		const {
			type,
			isHideModal,
			setting,
			touchIDType,
			isLoading,
			isLockedTouchID,
			linkAppSetting
		} = this.props;

		return (
			<Modal
				isVisible={this.state.isModalVisible}
				backdropColor={
					this.isIOS ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)'
				}
				style={{
					flex: 1,
					position: 'absolute',
					top: 0,
					right: 0,
					bottom: 0,
					left: 0
				}}
			>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						marginHorizontal: 16
					}}
				>
					<Content
						logoutFunc={this.logoutFunc}
						linkAppSetting={linkAppSetting}
						isLockedTouchID={isLockedTouchID}
						type={type}
						isLoading={isLoading}
						hideModal={this.hideModal}
						isHideModal={isHideModal}
						language={setting.lang}
						touchIDType={touchIDType}
					/>
				</View>
			</Modal>
		);
	}
}

function mapStateToProps(state) {
	return {
		isLoading: state.login.isLoading,
		setting: state.setting
	};
}
function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch)
	};
}
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PromptNew);

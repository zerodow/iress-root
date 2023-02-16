import React, { PureComponent } from 'react';
import _ from 'lodash';
import { View, Text, PixelRatio, FlatList } from 'react-native';
import { connect } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';

import * as RoleUser from '../../roleUser';
import * as Util from '../../util';
import Enum from '../../enum';
import Header from './swiper_market_depth.header';
import I18n from '../../modules/language';
import Row from './swiper_market_depth.row';
import marketActions from './swiper_market_depth.reducer';
import LoadingComp from '../../component/loadingComp';
import AppState from '~/lib/base/helper/appState2';
import CommonStyle, { register } from '~/theme/theme_controller'

export class ListEmpty extends PureComponent {
	getText(text) {
		return I18n.t(text);
	}
	render() {
		return (
			<View
				style={{
					height: 200,
					paddingHorizontal: 16,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				{<Text style={{ color: CommonStyle.fontColor }}>{this.getText('noMarketDepth')}</Text>}
			</View>
		);
	}
}

class MarketDepth extends PureComponent {
	constructor(props) {
		super(props);
		this.idForm = Util.getRandomKey();

		this.props.setTypeForm(this.props.isOrder);

		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.subMarketDepth(this.idForm);
		});
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;

		if (changeSymbol || changeNerworkState) {
			this.props.subMarketDepth(this.idForm);
		}
	};

	componentDidMount() {
		const { subMarketDepth } = this.props;
		subMarketDepth(this.idForm);
	}
	onNavigatorEvent(event) {
		switch (event.id) {
			case 'didAppear':
				this.props.subMarketDepth(this.idForm);
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				Emitter.deleteByIdEvent(this.idForm);
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	renderContent() {
		if (
			_.isEmpty(this.props.marketDepthData) ||
			!RoleUser.checkRoleByKey(
				Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_UNIVERSALSEARCH
			)
		) {
			return <ListEmpty />;
		}
		return (
			<FlatList
				scrollEnabled={!this.props.scrollDisable}
				data={this.props.marketDepthData}
				renderItem={({ item, index }) => (
					<Row index={index} data={item} />
				)}
			/>
		);
	}

	render() {
		return (
			<LoadingComp isLoading={this.props.isLoading}>
				<Header />
				{this.renderContent()}
			</LoadingComp>
		);
	}
}

const mapStateToProps = state => ({
	isLoading: state.marketDepth.isLoading,
	marketDepthData: state.marketDepth.listData,
	isConnected: state.app.isConnected,
	symbol: state.searchDetail.symbol
});

const mapDispatchToProps = dispatch => ({
	setTypeForm: (...p) => dispatch(marketActions.setTypeForm(...p)),
	subMarketDepth: (...p) => dispatch(marketActions.subMarketDepth(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MarketDepth);

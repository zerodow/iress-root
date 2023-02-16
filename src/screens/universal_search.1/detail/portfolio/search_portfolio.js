import React, { PureComponent } from 'react';
import { Platform, View, Text, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';

import I18n from '~/modules/language';
import styles from '@unis/style/universal_search';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Enum from '~/enum';
import * as RoleUser from '~/roleUser';
import AppState from '~/lib/base/helper/appState2';

import {
	OpenPriceHeader,
	PriceContent,
	ListTransaction
} from '~s/open_price/new_open_price.1';

import PortfolioActions from './search_portfolio.reducer';
import { dataStorage } from '~/storage';

class HeaderComp extends PureComponent {
	getText(text) {
		return I18n.t(text, {
			locale: this.props.language
		});
	}
	render() {
		const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || Enum.CURRENCY.AUD
		return (
			<View style={styles.headerBorderTop}>
				<View style={{ flexDirection: 'row' }}>
					<Text style={[styles.col31, CommonStyle.textMainHeader]}>
						{this.getText('symbolUpper')}
					</Text>
					<Text
						style={[
							styles.col32,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('quantityUpper')}
					</Text>
					<Text
						style={[
							styles.col33,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('mktPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col34,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('mktPriceValueUpper')} {`(${accountCurrency})`}
					</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={[styles.col31, CommonStyle.textSubHeader]} />
					<Text style={[styles.col32, CommonStyle.textSubHeader]} />
					<Text
						style={[
							styles.col33,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('avgPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col34,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('mktValueUpper')}
					</Text>
				</View>
			</View>
		);
	}
}

const Header = connect(state => ({ language: state.setting.lang }))(HeaderComp);
class SearchPortfolio extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isCollapsed: true
		};
		this.onPress = this.onPress.bind(this);

		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.getSnapshot();
		});
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;
		if (changeNerworkState || changeSymbol) {
			this.props.getSnapshot();
		}
	};

	componentDidMount = () => {
		this.props.getSnapshot();
	};

	onNavigatorEvent(event) {
		switch (event.id) {
			case 'search_refresh':
				this.props.getSnapshot();
				break;
			case 'willAppear':
				this.props.getSnapshot();
				break;
			case 'didAppear':
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	onPress() {
		LayoutAnimation.easeInEaseOut();
		!this.state.isCollapsed && this.props.onScrollChange && this.props.onScrollChange();
		this.setState(preState => ({
			isCollapsed: !preState.isCollapsed
		}));
	}
	render() {
		const result = [];
		result.push(<Header key='searchPortfolioHeader' />);
		if (
			!RoleUser.checkRoleByKey(
				Enum.ROLE_DETAIL.VIEW_HOLDING_UNIVERSALSEARCH
			)
		) {
			result.push(
				<View
					key='searchPortfolioTitle'
					style={{
						height: 50,
						paddingHorizontal: 16,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					{<Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>}
				</View>
			);
			return result;
		}
		// push openprice
		result.push(<OpenPriceHeader onPress={this.onPress} key='searchPortfolioPriceHeader' />);

		if (!this.state.isCollapsed) {
			result.push(<View style={{ height: 1 * 24 }} key='searchPortfolioFooter' />);
			return result;
		}
		result.push(
			<PriceContent
				key='searchPortfolioContent'
				symbol={this.props.symbol}
				navigator={this.props.navigator}
			/>
		);
		result.push(<ListTransaction symbol={this.props.symbol} key='searchPortfolioTransaction' />);

		// NewOpenPriceRow

		// if (Platform.OS === 'android') {
		// 	result.push(<View style={{ height: 1 * 24 }} key='searchPortfolioFooter' />);
		// }

		return result;
	}
}

const mapStateToProps = state => ({
	isConnected: state.app.isConnected,
	symbol: state.searchDetail.symbol
});

const mapDispatchToProps = dispatch => ({
	getSnapshot: (...p) => dispatch(PortfolioActions.getDataPortfolio(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchPortfolio);

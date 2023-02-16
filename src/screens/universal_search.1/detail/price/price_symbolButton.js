import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import config from '~/config';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { getDisplayName, formatNumberNew2 } from '~/lib/base/functionUtil';
import SVActions from '~/component/scrollCustom/scrollview.reducer';

const CHILD_NAME = 'OverView';

class SymbolButton extends Component {
	constructor(props) {
		super(props);
		this.onSearch = this.onSearch.bind(this);
		this.props.addSVChild(CHILD_NAME, () => this);
	}

	shouldComponentUpdate({ isShouldRender }) {
		return isShouldRender || _.isUndefined(isShouldRender);
	}

	componentWillUnmount = () => {
		this.props.rmSVChild(CHILD_NAME);
	};

	onSearch() {
		if (this.props.isPushFromWatchlist) {
			this.props.navigator.showModal({
				animated: true,
				animationType: 'slide-up',
				screen: 'equix.Search',
				backButtonTitle: '',
				passProps: {
					typeNews: 'all',
					isLoading: true
				},
				navigatorStyle: {
					...CommonStyle.navigatorSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				}
			});
		} else {
			this.props.navigator.pop({
				animated: true,
				animationType: 'slide-horizontal'
			});
		}
	}

	showChangePercent(isLoading, value) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return `${formatNumberNew2(value, 2)}%`;
		}
	}

	render() {
		const {
			isBackground,
			symbol,
			isLoading,
			priceObject = {}
		} = this.props;
		const {
			change_percent: changePercent = null,
			tradingHalt = false
		} = priceObject;

		if (isBackground) return <View />;

		const warnString = tradingHalt ? `!` : ``;
		const displayName = getDisplayName(symbol);
		const change = this.showChangePercent(isLoading, changePercent);

		return (
			<View style={[CommonStyle.searchBarContainer, { width: '100%' }]}>
				<TouchableOpacity
					style={CommonStyle.searchBar}
					onPress={this.onSearch}
				>
					<Text
						style={CommonStyle.searchPlaceHolder}
					>{`${warnString} ${displayName} (${change})`}</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	isShouldRender: state.scrollView.childStatus[CHILD_NAME],
	priceObject: state.price.priceObject,
	isLoading: state.price.isLoading,
	symbol: state.searchDetail.symbol
});

const mapDispatchToProps = dispatch => ({
	addSVChild: (...p) => dispatch(SVActions.SvMeasureAddChildToStack(...p)),
	rmSVChild: (...p) => dispatch(SVActions.SvMeasureRemoveChildToStack(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SymbolButton);

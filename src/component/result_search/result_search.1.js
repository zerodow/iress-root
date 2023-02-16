import React, { PureComponent } from 'react';
import Uuid from 'react-native-uuid';
import _ from 'lodash';
import { View, Text } from 'react-native';

import * as Business from '../../business';
import * as Emitter from '@lib/vietnam-emitter';
import * as StreamingBusiness from '../../streaming/streaming_business';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Flag from '../../component/flags/flag';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../screens/order/style/order';
import ENUM from '../../enum';
import { dataStorage } from '../../storage';
import { getDisplayName } from '../../lib/base/functionUtil';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';

const TimeIcon = props =>
	props.isHistory ? (
		<Icon
			name="ios-timer-outline"
			size={24}
			style={{ top: 5, marginRight: 16 }}
		/>
	) : (
			<View />
		);

const SymbolWithFlag = props => (
	<View style={{ flexDirection: 'row' }}>
		<View style={{ width: '50%', flexDirection: 'row' }}>
			<Text style={[CommonStyle.textMainRed]}>
				{props.isHalt ? '! ' : ''}
			</Text>

			<Text style={CommonStyle.codeStyle} numberOfLines={1}>
				{getDisplayName(props.symbol) || ''}
			</Text>
		</View>

		<View style={{ width: '50%' }}>
			<Flag
				type={'flat'}
				code={Business.getFlag(props.symbol)}
				size={18}
			/>
		</View>
	</View>
);

const Company = props => {
	const { company_name: companyName, company } =
		dataStorage.symbolEquity[props.symbol] || {};
	const content = companyName || company || '';

	return <Text style={CommonStyle.companyStyle}>{content.toUpperCase()}</Text>;
};

export default class ResultSearch extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			tradingHalt: false
		};

		const { symbol } = this.props.data;
		this.updateHaltFromSymbolInfo(symbol);
		this.id = Uuid.v4();
	}
	componentWillReceiveProps(nextProps) {
		const { symbol: oldSymbol } = this.props.data;

		const { symbol: newSymbol } = nextProps.data;

		if (newSymbol !== oldSymbol) {
			this.updateHaltFromSymbolInfo(newSymbol);
		}
	}

	componentDidMount() {
		this.isMount = true;
		const { symbol } = this.props.data;

		this.subTradingHalt(symbol);
	}

	componentWillUnmount() {
		Emitter.deleteByIdEvent(this.id);
	}

	updateHaltFromSymbolInfo(symbol) {
		const { trading_halt: tradingHalt } =
			dataStorage.symbolEquity[symbol] || {};

		if (!_.isNil(tradingHalt)) {
			this.state.tradingHalt = tradingHalt;
		}
	}

	subTradingHalt(symbol) {
		const channel = StreamingBusiness.getChannelHalt(symbol);
		Emitter.addListener(channel, this.id, tradingHalt =>
			this.setState({
				tradingHalt
			})
		);
	}

	render() {
		const {
			data: { symbol, company, class: classItem },
			isNoneBorderBottom,
			isHistory
		} = this.props;

		const borderBottomWidth = isNoneBorderBottom && !isHistory ? 0 : 1;
		return (
			<TouchableOpacityOpt
				key={`${symbol}_orderHistory`}
				testID={`${symbol}_orderHistory`}
				style={[CommonStyle.rowContainer, { borderBottomWidth }]}
				onPress={() => this.props.onPressFn(symbol, company, classItem)}
				timeDelay={ENUM.TIME_DELAY}
			>
				<View style={{ width: '100%', flexDirection: 'row' }}>
					<TimeIcon />

					<View style={{ flex: 1 }}>
						<SymbolWithFlag
							symbol={symbol}
							isHalt={this.state.tradingHalt}
						/>

						<Company symbol={symbol} />
					</View>
				</View>
			</TouchableOpacityOpt>
		);
	}
}

ResultSearch.defaultProps = {
	onPressFn: () => null,
	data: {}
};

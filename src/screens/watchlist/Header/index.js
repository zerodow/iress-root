import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import _ from 'lodash';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import LeftIcon from './header.leftIcon';
import HeaderMessage from '../EditWatchList/Views/Header/HeaderMessage';
import RightIcon from './header.rightIcon';
import HeaderInvalid from './header.invalid';

import { styles as headerStyles, topSpace } from '../Component/DefaultHeader';
import EditWLButton from '../Component/EditWLButton';
import SubTitle from '../Component/SubTitle';
import MainComp from '../Component/DefaultMainHeader';
import SearchButton from './header.search';

import I18n from '~/modules/language/';
import { useShadow } from '~/component/shadow/SvgShadow';
import ENUM from '~/enum';
import { DEVICE_WIDTH } from '~s/watchlist/enum';

const DefaultHeader = ({
	navigator,
	showModal,
	closeModal,
	changeAllowUnmount
}) => {
	const [ShadowTitle, onLayout] = useShadow();
	return (
		<View>
			<View onLayout={onLayout}>
				<View style={{ height: topSpace }} />
				<View
					style={[
						headerStyles.container,
						styles.container,
						{ marginTop: 0 }
					]}
				>
					<LeftIcon navigator={navigator} />
					<MainComp
						style={{ width: 0.4 * DEVICE_WIDTH }}
						title={I18n.t('WatchListTitle')}
					/>
					<View style={[headerStyles.leftComp, styles.leftComp]}>
						<RightIcon
							changeAllowUnmount={changeAllowUnmount}
							navigator={navigator}
							showModal={showModal}
							closeModal={closeModal}
						/>
					</View>
				</View>
			</View>
			<ShadowTitle />
		</View>
	);
};

const WatchListHeader = ({
	navigator,
	showDetail,
	showModal,
	closeModal,
	changeAllowUnmount,
	_search
}) => {
	const [ShadowSubTitle, onLayoutSubTitle] = useShadow();
	const [ShadowSearch, onLayoutSearch] = useShadow();

	const isEmptyPriceBoard = useSelector((state) =>
		_.isEmpty(state.priceBoard.userPriceBoard)
	);

	const typePriceBoard = useSelector(
		(state) => state.priceBoard.typePriceBoard
	);
	if (typePriceBoard !== ENUM.TYPE_PRICEBOARD.IRESS && isEmptyPriceBoard) {
		return null;
	}

	return (
		<React.Fragment>
			<View>
				<View
					onLayout={onLayoutSubTitle}
					style={[
						styles.subHeader,
						{ justifyContent: 'space-between' }
					]}
				>
					<SubTitle showModal={showModal} closeModal={closeModal} />
					{
						typePriceBoard !== ENUM.TYPE_PRICEBOARD.IRESS &&
						<EditWLButton
							changeAllowUnmount={changeAllowUnmount}
							navigator={navigator}
						/>
					}
				</View>
				<ShadowSubTitle />
			</View>
			<View>
				<View onLayout={onLayoutSearch} style={styles.subHeader}>
					<SearchButton
						ref={_search}
						showDetail={showDetail} />
				</View>
				<ShadowSearch />
			</View>
		</React.Fragment>
	);
};

let Header = (props) => {
	return (
		<View style={styles.main}>
			<DefaultHeader {...props} />
			<WatchListHeader {...props} />
			<HeaderMessage />
			<HeaderInvalid />
		</View>
	);
};

Header = React.memo(Header);

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

	container: {
		marginLeft: 0,
		paddingTop: 16,
		paddingBottom: 12
	},
	leftComp: {
		paddingRight: 16,
		flexDirection: 'row'
	},
	main: {
		backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
	},
	subHeader: {
		flexDirection: 'row',
		width: '100%',
		paddingVertical: 8,
		alignItems: 'center'
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default Header;

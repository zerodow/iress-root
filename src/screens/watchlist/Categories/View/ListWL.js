import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import CreateNewWLButton from './CreateNewWLButton';
import WatchlistActions from '~s/watchlist/reducers';
import ListUserWL from './ListUserWL';
import ListSystemWL from './ListSystemWL';
import Shadow, { shadowOpt } from '~/component/shadow';
import { func } from '~/storage'
const Footer = (props) => {
	const { activeTab, navigator } = props;
	const setting = {
		...shadowOpt,
		...{ radius: 0, border: 3 }
	};
	return activeTab === 1 ? (
		<View />
	) : (
			<View>
				<Shadow setting={setting} />
				<View
					style={{
						zIndex: 10,
						paddingTop: 8,
						paddingBottom: 30,
						paddingHorizontal: 8,
						alignItems: 'center'
					}}
				>
					<CreateNewWLButton navigator={navigator} />
				</View>
			</View>
		);
};

const ListWL = ({
	activeTab,
	navigator,
	textSearch,
	showDelete,
	priceBoardSelected
}) => {
	const dispatch = useDispatch();
	const refUserWL = useRef({});
	const refSystemWL = useRef({});
	const showCheckBox = useCallback(() => {
		refUserWL.current.showCheckBox && refUserWL.current.showCheckBox();
	}, []);
	const hideCheckBox = useCallback(() => {
		refUserWL.current.hideCheckBox && refUserWL.current.hideCheckBox();
	}, []);
	const changePriceBoardSelected = async (watchlist, isRender) => {
		await func.setStoragePriceBoard(watchlist)
		navigator && navigator.pop();
		const lastWatchList = await func.getStoragePriceBoard()
		isRender &&
			setTimeout(
				() => dispatch.priceBoard.selectPriceBoard(lastWatchList),
				50
			);
	};
	return (
		<View style={{ flex: 1 }}>
			{activeTab ? (
				<ListSystemWL
					ref={refSystemWL}
					textSearch={textSearch}
					priceBoardSelected={priceBoardSelected}
					changePriceBoardSelected={changePriceBoardSelected}
				/>
			) : (
					<ListUserWL
						ref={refUserWL}
						priceBoardSelected={priceBoardSelected}
						textSearch={textSearch}
						changePriceBoardSelected={changePriceBoardSelected}
					/>
				)}
			<Footer
				showDelete={showDelete}
				navigator={navigator}
				activeTab={activeTab}
				showCheckBox={showCheckBox}
				hideCheckBox={hideCheckBox}
			/>
		</View>
	);
};

export default ListWL;

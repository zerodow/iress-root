import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import StreamingLv1 from '~/streaming/StreamComp/lv1';
import StreamingLv2 from '~/streaming/StreamComp/lv2';
import StreamingCos from '~/streaming/StreamComp/cos';
import { HandleDataComp } from '../handle_data';
import watchListActions from '../reducers';

export class HandleDataDetail extends HandleDataComp {
	onNavigatorEvent() {}

	getSnapshot = this.getSnapshot.bind(this);
	getSnapshot() {
		this.getSnapshotLv1 && this.getSnapshotLv1();
		this.getSnapshotLv2 && this.getSnapshotLv2();
		this.getSnapshotCos && this.getSnapshotCos();

		setTimeout(() => {
			if (this.props.isLoading) {
				this.props.changeLoadingState(false);
				this.props.setTimeUpdate && this.props.setTimeUpdate();
			}
		}, 5000);
	}

	setRefLv2 = this.setRefLv2.bind(this);
	setRefLv2(sef) {
		if (sef) {
			this.getSnapshotLv2 = sef.getSnapshot;
			this.unSubLv2 = sef.unSubAll;
		}
	}

	setRefCos = this.setRefCos.bind(this);
	setRefCos(sef) {
		if (sef) {
			this.getSnapshotCos = sef.getSnapshot;
			this.unSubCos = sef.unSubAll;
			this.subCos = sef.sub;
		}
	}

	render() {
		const listSymbol = this.props.listSymbol || this.getListSymbol();

		const onChangeLv1 = (state) => this.onChangeLoadingState('lv1', state);
		const onChangeLv2 = (state) => this.onChangeLoadingState('lv2', state);
		const onChangeCos = (state) => this.onChangeLoadingState('Cos', state);
		// const onChangeNews = state => this.onChangeLoadingState('news', state);
		return (
			<React.Fragment>
				<StreamingLv1
					onChangeLoadingState={onChangeLv1}
					ref={this.setRefLv1}
					listSymbol={listSymbol}
				/>
				<StreamingLv2
					onChangeLoadingState={onChangeLv2}
					ref={this.setRefLv2}
					listSymbol={listSymbol}
				/>
				<StreamingCos
					onChangeLoadingState={onChangeCos}
					ref={this.setRefCos}
					listSymbol={listSymbol}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const { detailLoading, screenSelected } = state.watchlist3;

	const {
		userPriceBoard,
		staticPriceBoard,
		priceBoardSelected
	} = state.priceBoard;
	const priceBoardDetail =
		userPriceBoard[priceBoardSelected] ||
		staticPriceBoard[priceBoardSelected] ||
		{};

	return {
		priceBoardDetail,
		priceBoardSelected,
		isLoading: detailLoading,
		screenSelected
	};
};

const mapDispatchToProps = (dispatch) => ({
	changeLoadingState: (...p) =>
		dispatch(watchListActions.watchListChangeDetailLoadingState(...p))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true
})(HandleDataDetail);

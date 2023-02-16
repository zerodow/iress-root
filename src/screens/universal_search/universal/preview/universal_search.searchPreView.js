import React, { PureComponent } from 'react';
import { Keyboard, View } from 'react-native';
import { connect } from 'react-redux';

import SearchDetail from '@unis/detail/search_detail.view';

export class SearchPreView extends PureComponent {
	onScroll = this.onScroll.bind(this);
	onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
	onScrollEndDrag = this.onScrollEndDrag.bind(this);

	onScroll(evt) {
		const { y: offsetY = 0 } = evt.nativeEvent.contentOffset;

		if (!this.startPosition && this.startPosition !== 0) {
			this.startPosition = offsetY;
		}
		this.endPosition = offsetY;
	}

	onScrollBeginDrag() {
		this.startPosition = null;
		this.endPosition = null;
	}

	onScrollEndDrag() {
		const { onScrollEndDrag } = this.props;

		Keyboard.dismiss();

		const isHide = this.startPosition < this.endPosition;

		setTimeout(() => {
			if (onScrollEndDrag) {
				onScrollEndDrag(isHide);
			}
			this.startPosition = null;
			this.endPosition = null;
		}, 300);
	}

	render() {
		const { isHistory, isLoading, navigator, listData } = this.props;
		const { symbol } = listData[0] || {};
		if (isHistory || isLoading || !symbol) {
			return null;
		}
		return (
			<View
				style={{
					backgroundColor: '#FFF',
					flex: 1
				}}
			>
				<SearchDetail
					scrollProps={{
						onScroll: this.onScroll,
						onScrollBeginDrag: this.onScrollBeginDrag,
						onScrollEndDrag: this.onScrollEndDrag,
						disableCheckRealtime: true,
						removeClippedSubviews: false
					}}
					navigator={navigator}
					isBackground
					symbol={symbol}
				/>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	isLoading: state.uniSearch.isLoading,
	listData: state.uniSearch.listData
});

export default connect(mapStateToProps)(SearchPreView);

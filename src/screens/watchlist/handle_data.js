import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import StreamingLv1 from '~/streaming/StreamComp/lv1';
import TradingPeriod from '~/streaming/StreamComp/tradingPeriod';

import watchListActions from './reducers';
import { switchForm } from '~/lib/base/functionUtil';
import PriceBoard from './handle_priceBoard_data';
import AppState from '~/lib/base/helper/appState2';
export class HandleDataComp extends PureComponent {
    constructor(props) {
        super(props);
        this.dicLoading = {};
        this.appState = new AppState(() => {
            setTimeout(() => {
                this.props.changeLoadingState(true, true);
                this.getSnapshot();
                this.props.setTimeUpdate && this.props.setTimeUpdate();
            }, 100);
        });
    }

    componentDidMount() {
        this.appState.addListenerAppState();
        this.handleOnNavigator = this.props.navigator.addOnNavigatorEvent((e) =>
            this.onNavigatorEvent(e)
        );
    }

    componentWillUnmount() {
        this.appState.removeListenerAppState();
        if (this.handleOnNavigator) {
            this.handleOnNavigator();
        }
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            switchForm(this.props.navigator, event);
        }

        switch (event.id) {
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

    getListSymbol() {
        const { value = [] } = this.props.priceBoardDetail;
        return value.map((item) => ({
            symbol: item.symbol,
            exchange: item.exchange
        }));
    }

    setRefLv1 = this.setRefLv1.bind(this);
    setRefLv1(sef) {
        if (sef) {
            this.getSnapshotLv1 = sef.getSnapshot;
            this.unSubLv1 = sef.unSubAll;
            this.subLv1 = sef.sub;
        }
    }

    setRefPeriod = this.setRefPeriod.bind(this);
    setRefPeriod(sef) {
        if (sef) {
            this.getSnapshotPeriod = sef.getSnapshotPeriod;
        }
    }

    getSnapshot = this.getSnapshot.bind(this);
    getSnapshot() {
        this.onChangeLoadingState('lv1', true);
        this.getSnapshotLv1 && this.getSnapshotLv1();
        this.getSnapshotPeriod && this.getSnapshotPeriod();
        this.getSnapshotChart && this.getSnapshotChart();
    }

    onChangeLoadingState(key, state) {
        this.dicLoading[key] = state;
        let check = false;
        _.forEach(this.dicLoading, (value) => (check = check || value));
        if (check && !this.props.isLoading) {
            // this.props.changeLoadingState(true);
        }
        if (!check && this.props.isLoading) {
            // this.props.changeLoadingState(false);
            // this.props.changeLoadingState(false, true);
            this.props.setTimeUpdate && this.props.setTimeUpdate();
        }
    }

    render() {
        const listSymbol = this.props.listSymbol || this.getListSymbol();
        const onChangeLv1 = (state) => this.onChangeLoadingState('lv1', state);
        return (
            <React.Fragment>
                <PriceBoard />
                <StreamingLv1
                    onChangeLoadingState={onChangeLv1}
                    ref={this.setRefLv1}
                    listSymbol={listSymbol}
                />
                <TradingPeriod
                    ref={this.setRefPeriod}
                    listSymbol={listSymbol}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const {
        priceBoardSelected,
        priceBoard,
        isLoading,
        screenSelected
    } = state.watchlist3;
    return {
        priceBoardDetail: priceBoard[priceBoardSelected] || {},
        priceBoardSelected,
        isLoading,
        screenSelected
    };
};

// const mapDispatchToProps = (dispatch) => ({
//     changeLoadingState: (...p) =>
//         dispatch(watchListActions.watchListChangeLoadingState(...p))
// });

export default connect(
    mapStateToProps
    // mapDispatchToProps,
    // null
)(HandleDataComp);

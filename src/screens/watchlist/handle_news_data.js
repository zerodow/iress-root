import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import WatchlistActions from './reducers';

export class News extends PureComponent {
    getSnapshot = this.getSnapshot.bind(this);

    componentWillReceiveProps(nextProps) {
        const { listSymbol, getNewToday } = nextProps;
        if (_.isEqual(listSymbol, this.props.listSymbol)) return;
        this.getSnapshot(nextProps);
    }

    componentDidMount() {
        this.getSnapshot(this.props);
    }

    onChangeLoadingState(state) {
        this.props.onChangeLoadingState &&
            this.props.onChangeLoadingState(state);
    }

    getSnapshot(props) {
        const { listSymbol, getNewToday } = props || this.props;
        if (!listSymbol || !listSymbol[0]) return;

        this.onChangeLoadingState(true);
        getNewToday(listSymbol, () => this.onChangeLoadingState(false));
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => ({
    getNewToday: (...p) => dispatch(WatchlistActions.watchListGetNewToday(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    News
);

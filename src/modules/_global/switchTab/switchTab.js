import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as switchActions from './switchTab.actions';
class SwitchTab extends Component {
    componentWillReceiveProps(nextProps) {
        console.log('nextProps3: ', nextProps);

        switch (nextProps.tab.currentTab) {
            case 'WatchList':
                this.props.navigator.switchToTab({
                    tabIndex: 0
                });
                break;
            case 'News':
                this.props.navigator.switchToTab({
                    tabIndex: 1
                });
                break;
            case 'Login':
                this.props.navigator.switchToTab({
                    tabIndex: 2
                });
                break;
            default:
                break;
        }
    }
    componentWillUpdate(nextProps) {
        console.log('nextProps2: ', nextProps);

        switch (nextProps.tab.currentTab) {
            case 'WatchList':
                this.props.navigator.switchToTab({
                    tabIndex: 0
                });
                break;
            case 'News':
                this.props.navigator.switchToTab({
                    tabIndex: 1
                });
                break;
            case 'Login':
                this.props.navigator.switchToTab({
                    tabIndex: 2
                });
                break;
            default:
                break;
        }
    }
    shouldComponentUpdate(nextProps) {
        console.log('nextProps1: ', nextProps);

        switch (nextProps.tab.currentTab) {
            case 'WatchList':
                this.props.navigator.switchToTab({
                    tabIndex: 0
                });
                break;
            case 'News':
                this.props.navigator.switchToTab({
                    tabIndex: 1
                });
                break;
            case 'Login':
                this.props.navigator.switchToTab({
                    tabIndex: 2
                });
                break;
            default:
                break;
        }
    }
    render() {
        return null;
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(switchActions, dispatch)
    };
}

function mapStateToProps(state, ownProps) {
    return {
        tab: state.tab
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchTab);

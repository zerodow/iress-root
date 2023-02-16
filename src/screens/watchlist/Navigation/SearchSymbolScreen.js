import React, { Component } from 'react';
import { View } from 'react-native';

import SearchWatchList from '../Search';
import Detail from './DetailScreen';

export default class SearchSymbolScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFirstLoad: true
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isFirstLoad: false
            });
        }, 300);
    }

    onRowPress = this.onRowPress.bind(this);
    onRowPress({ symbol, exchange }) {
        this._detail && this._detail.changeSymbol(symbol, exchange, true);
    }
    renderDetail() {
        if (this.state.isFirstLoad) return null;

        const { navigator, onAuth } = this.props;
        return (
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 99
                }}
            >
                <Detail
                    ref={(sef) => (this._detail = sef)}
                    onAuth={onAuth}
                    navigator={navigator}
                />
            </View>
        );
    }

    render() {
        const { navigator, onAuth } = this.props;
        return (
            <React.Fragment>
                <SearchWatchList
                    isFirstLoad={this.state.isFirstLoad}
                    onRowPress={this.onRowPress}
                    navigator={navigator}
                    onAuth={onAuth}
                    isHasHistory={this.props.isHasHistory}
                />
                {this.renderDetail()}
            </React.Fragment>
        );
    }
}

import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types';
import * as Emitter from '@lib/vietnam-emitter';
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util';
import { func } from '../../storage'
import * as StreamingBusiness from '../../streaming/streaming_business'

export default class OHLCWatchlist extends XComponent {
    static propTypes = {
        indexInList: PropTypes.any,
        allowRender: PropTypes.bool,
        symbol: PropTypes.string.isRequired,
        channelAllowRender: PropTypes.string,
        value: PropTypes.object,
        isLoading: PropTypes.bool,
        field: PropTypes.string.isRequired,
        parentID: PropTypes.string.isRequired,
        channelLoadingTrade: PropTypes.string,
        formatFunc: PropTypes.func.isRequired,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
    };

    constructor(props) {
        super(props)

        this.isValueChange = this.isValueChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onLoading = this.onLoading.bind(this);

        this.value = this.props.value || {};
        this.style = this.props.style || {};
        this.testID = this.props.testID || null;
        this.numberOfLines = this.props.numberOfLines || null;
        this.isLoading = Util.getBooleanable(this.props.isLoading, false);
    }

    componentDidMount() {
        super.componentDidMount();

        const exchange = func.getExchangeSymbol(this.props.symbol)
        const channel = StreamingBusiness.getChannelLv1(exchange, this.props.symbol)
        Emitter.addListener(channel, this.id, this.onValueChange)
        Emitter.addListener(this.props.channelLoadingTrade, this.id, this.onLoading);
    }

    isValueChange(oldValue, newValue) {
        return oldValue[this.props.field] !== newValue[this.props.field];
    }

    onValueChange(data) {
        if (!data) return;
        if (this.isValueChange(this.value, data)) {
            this.value = data;
            this.setState();
        } else {
            this.value = data;
        }
    }

    onLoading(data) {
        if (this.isLoading === data) return;
        this.isLoading = data;
        this.setState();
    }

    render() {
        return <Text testID={this.testID} numberOfLines={this.numberOfLines} style={this.style}>
            {this.props.formatFunc(this.value, this.isLoading)}
        </Text>
    }
};

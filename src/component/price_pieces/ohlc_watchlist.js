import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types';
import * as Emitter from '@lib/vietnam-emitter';
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util';

export default class OHLCWatchlist extends XComponent {
    static propTypes = {
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        isLoading: PropTypes.bool,
        channelLoadingTrade: PropTypes.string,
        formatFunc: PropTypes.func.isRequired,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        field: PropTypes.string.isRequired,
        parentID: PropTypes.string.isRequired
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

        Emitter.addListener(this.props.channelLv1FromComponent, this.id, this.onValueChange);
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

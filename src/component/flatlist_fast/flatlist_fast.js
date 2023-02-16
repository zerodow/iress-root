import React, { Component } from 'react';
import {
    View,
    FlatList
} from 'react-native';
import PropTypes from 'prop-types';
import CommonStyle from '~/theme/theme_controller'

export default class FlatListFast extends Component {
    static propTypes = {
        initialNumToRender: PropTypes.number
    }

    static defaultProps = {
        itemOnePage: 12
    }

    constructor(props) {
        super(props);

        this.loadMore = this.loadMore.bind(this);
        this.getCurrentNumberItem = this.getCurrentNumberItem.bind(this);

        this.initialNumToRender = this.props.initialNumToRender || this.props.itemOnePage;
        this.currentIndex = 0;
        this.currentData = this.getPartOfList(this.initialNumToRender, this.props.data);
    }

    getPartOfList(count, listData) {
        let cloneList = JSON.parse(JSON.stringify(listData));
        if (cloneList.length > count) {
            cloneList.length = count;
        }
        return cloneList;
    }

    getCurrentNumberItem() {
        return this.initialNumToRender + this.currentIndex * this.props.itemOnePage;
    }

    loadMore() {
        if (this.getCurrentNumberItem() >= this.props.data.length) return;
        this.currentIndex++;
        // this.currentData = this.getPartOfList(this.getCurrentNumberItem(), this.props.data);
        this.currentData = this.getPartOfList(this.getCurrentNumberItem(), this.props.data);

        this.setState({});
    }

    componentWillReceiveProps(nextProps) {
        this.initialNumToRender = nextProps.initialNumToRender || nextProps.itemOnePage;
        this.props.itemOnePage = nextProps.itemOnePage;

        const maxIndex = this.initialNumToRender >= nextProps.data.length
            ? 0
            : (nextProps.data.length - this.initialNumToRender) / nextProps.itemOnePage + 1;

        if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;

        this.currentData = this.getPartOfList(this.getCurrentNumberItem(), nextProps.data);
    }

    renderFooter = this.renderFooter.bind(this)
    renderFooter() {
        return <View style={{ height: CommonStyle.heightTabbar + 16 }} />
    }

    render() {
        return (
            <FlatList
                {...this.props}
                data={this.currentData}
                onEndReached={this.loadMore}
                indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                ListFooterComponent={this.renderFooter}
                onEndReachedThreshold={0.4}
            />
        );
    }
};

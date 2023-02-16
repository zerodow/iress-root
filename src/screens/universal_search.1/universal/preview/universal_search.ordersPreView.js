import React, { PureComponent } from 'react';
import { Keyboard, View, Animated, Text } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import { connect } from 'react-redux';
// Component
import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import SearchDetail from '@unis/detail/search_detail.view';

export class OrderPreView extends PureComponent {
    show = this.show.bind(this)
    scrollContainerValue = new Animated.Value(0)
    scrollValue = new Animated.Value(0)
    state = {
        symbol: '',
        data: {},
        listOrderHistory: [],
        isShowPrice: false
    }

    componentDidMount() {
        this.props.onRef && this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef && this.props.onRef(undefined)
    }

    show({ data }) {
        const { symbol, ordersTab } = data
        this.setState({ symbol, data }, () => {
            this.nestedScroll && this.nestedScroll.snapContainerTopTop()
        });
    }

    render() {
        const { symbol } = this.state
        if (!symbol) {
            return null;
        }
        return (
            <NestedScrollView
                scrollContainerValue={this.scrollContainerValue}
                scrollValue={this.scrollValue}
                ref={sef => (this.nestedScroll = sef)}
                style={{ flex: 1 }}
            >
                <ScrollLoadAbs
                    style={{ backgroundColor: CommonStyle.backgroundColor }}
                    scrollValue={this.scrollValue}>
                    <View
                        style={{
                            backgroundColor: CommonStyle.backgroundColor,
                            flex: 1
                        }}
                    >
                        <View style={{ width: '100%', height: 200, backgroundColor: 'green' }}>
                            <Text>orders preview</Text>
                        </View>
                        <View style={{ width: '100%', height: 200, backgroundColor: 'blue' }}>
                            <Text>orders preview</Text>
                        </View>
                        <View style={{ width: '100%', height: 200, backgroundColor: 'orange' }}>
                            <Text>orders preview</Text>
                        </View>
                    </View>
                </ScrollLoadAbs>
            </NestedScrollView>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.uniSearch.isLoading,
    listData: state.uniSearch.listData
});

export default connect(mapStateToProps)(OrderPreView);

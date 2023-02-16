import React, { PureComponent, Component } from 'react';
import { View, Text, Animated, FlatList } from 'react-native';

import RowLoading from './RowLoading'
export const TYPE_ANIMATION = {
    'FADE_IN': 'FADE_IN',
    'FADE_OUT': 'FADE_OUT'
}
export class SquenceView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type || 'FADE_IN'
        };
        this.progressValue = this.props.progressValue || new Animated.Value(0)
        this.duration = this.props.duration || 1000
        this.index = this.props.index || 0
        this.totalCountData = this.props.totalCountData || 10
        this.delta = this.duration / this.totalCountData
        let x = 1
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.duration !== this.duration) {
            this.duration = nextProps.duration
            this.delta = this.duration / this.totalCountData
        }
    }
    getDetal = () => {
        return this.duration / this.totalCountData
    }
    getStartInterpolate = () => {
        return this.delta + this.index * this.delta / 2
    }
    getEndInterpolate = () => {
        console.log('DCM ', this.index * this.delta + this.delta)
        return this.index * this.delta + this.delta
    }
    getOutputRangeOpacity = () => {
        switch (this.props.type) {
            case TYPE_ANIMATION.FADE_IN:
                return [0, 1, 1]
            case TYPE_ANIMATION.FADE_OUT:
                return [1, 0, 0]
            default:
                return [1, 1, 1]
        }
    }

    getOutputRange = () => {
        switch (this.props.type) {
            case TYPE_ANIMATION.FADE_IN:
                return [0, 1, 1]
            case TYPE_ANIMATION.FADE_OUT:
                return [1, 0, 0]
        }
    }
    getInterpolateOpacity = () => {
        return this.progressValue.interpolate({
            inputRange: [this.getStartInterpolate(), this.getEndInterpolate(), this.duration + this.index * this.delta / 2],
            outputRange: this.getOutputRange()
        })
    }
    mapInterpolateToRender = () => {
        return (<Animated.View style={{
            opacity: this.getInterpolateOpacity()
        }}>
            {
                this.props.children
            }
        </Animated.View>)
    }

    render() {
        return (
            <View>
                {this.mapInterpolateToRender()}
            </View>
        );
    }
}
export default class FlatListAni extends Component {
    constructor(props) {
        super(props)
        this.progressValue = new Animated.Value(0)
        this.totalCountData = Array.isArray(this.props.data) ? this.props.data.length : 10
        this.duration = this.props.duration || 1000
        this.state = {
            type: this.props.type || TYPE_ANIMATION.FADE_IN
        }
    }
    componentDidMount() {
        this.runAnimation()
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoading && nextProps.isLoading !== this.props.isLoading) {
            this.progressValue.setValue(0)
            this.runAnimation()
        }
    }
    shouldComponentUpdate() {
        return false
    }
    runAnimation = () => {
        Animated.timing(this.progressValue, {
            toValue: this.duration,
            duration: this.duration,
            useNativeDriver: true
        }).start()
    }
    animate = ({
        type,
        duration
    }) => {
        if (duration) {
            this.duration = duration
        }
        this.progressValue.setValue(0)
        this.setState({
            type
        }, () => {
            this.runAnimation()
        })
    }
    renderItem = ({ index, item }) => {
        return (
            <SquenceView key={`SquenceView-${index}-${item.news_id}`} progressValue={this.progressValue} duration={this.duration} type={this.state.type} key={`${index}-${item}`} index={index} totalCountData={this.props.data.length}>
                {/* <View style={{
                    height: 44,
                    width: '100%',
                    backgroundColor: index % 2 === 0 ? 'red' : 'blue',
                    marginTop: 16
                }}>

                </View> */}
                <RowLoading index={index} item={item} />
            </SquenceView>
        )
    }

    render() {
        return (
            <FlatList
                extraData={this.props.data}
                keyExtractor={(item, index) => `${item.news_id}#${index}`}
                {...this.props}
                data={this.props.data}
                renderItem={this.renderItem}
            />
        )
    }
}

import React, { Component, PureComponent } from 'react'
import { View, Text, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Animated from 'react-native-reanimated'

const {
    interpolate
} = Animated

export default class PagingNews extends PureComponent {
    constructor(props) {
        super(props)
        this.translateY = interpolate(this.props.translateY, {
            inputRange: [-1, 0, 1],
            outputRange: [1, 0, -1]
        })
        this.state = {
            currentPage: 0,
            numberOfPages: 0
        }
    }

    updatePagingNews = this.updatePagingNews.bind(this)
    updatePagingNews({ currentPage, numberOfPages }) {
        this.setState({
            currentPage,
            numberOfPages
        })
    }

    renderPaging = this.renderPaging.bind(this)
    renderPaging() {
        return this.state.currentPage &&
            this.state.numberOfPages
            ? <View
                style={{
                    position: 'absolute',
                    right: 0,
                    left: 0,
                    bottom: 20,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent'
                }}
            >
                <Animated.View
                    style={{
                        width: 80,
                        backgroundColor: 'gray',
                        opacity: 0.8,
                        alignItems: 'center',
                        borderRadius: 20,
                        transform: [{ translateY: this.translateY }]
                    }}
                >
                    {
                        <Text
                            style={{
                                color: CommonStyle.fontColor,
                                paddingHorizontal: 5,
                                paddingVertical: 5
                            }}
                        >
                            {`${this.state.currentPage} / ${this.state.numberOfPages}`}
                        </Text>
                    }
                </Animated.View>
            </View>
            : null
    }

    render() {
        return this.renderPaging()
    }
}

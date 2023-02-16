import React, { Component } from 'react'
import AffectedSymbol from './AffectedSymbol'
import Preview from './Preview'
import PagingNews from './PagingNews'
import Animated, { Easing } from 'react-native-reanimated'

const {
    Value,
    timing
} = Animated

export default class Content extends Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.translateY = new Value(0)
        this.dic = {
            heightNavbar: 0,
            heightAffectedSymbol: 0
        }
    }

    updateLayoutHeaderNav = this.updateLayoutHeaderNav.bind(this)
    updateLayoutHeaderNav(layout) {
        const { height } = layout
        this.dic.heightNavbar = height
    }

    onLayoutAffectedSymbol = this.onLayoutAffectedSymbol.bind(this)
    onLayoutAffectedSymbol(event) {
        const { layout } = event.nativeEvent
        const { height } = layout
        this.dic.heightAffectedSymbol = height
    }

    showThenHideError = this.showThenHideError.bind(this)
    showThenHideError(error) {
        this.refAffectedSymbol && this.refAffectedSymbol.showThenHideError(error)
    }

    hideAffectedSymbol = this.hideAffectedSymbol.bind(this)
    hideAffectedSymbol() {
        timing(this.translateY, {
            toValue: -this.dic.heightAffectedSymbol,
            duration: 300,
            easing: Easing.linear
        }).start()
    }

    setRefPagingNews = this.setRefPagingNews.bind(this)
    setRefPagingNews(ref) {
        if (ref) {
            this.refPagingNews = ref
        }
    }

    setRefAffectedSymbol = this.setRefAffectedSymbol.bind(this)
    setRefAffectedSymbol(ref) {
        if (ref) {
            this.refAffectedSymbol = ref
        }
    }

    updatePagingNews = this.updatePagingNews.bind(this)
    updatePagingNews({ currentPage, numberOfPages }) {
        this.refPagingNews && this.refPagingNews.updatePagingNews({ currentPage, numberOfPages })
    }

    showAffectedSymbol = this.showAffectedSymbol.bind(this)
    showAffectedSymbol() {
        timing(this.translateY, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear
        }).start()
    }

    render() {
        const {
            navigator, onPressAffectedSymbol,
            heightHeader, setRefPdf, data, available, timeToAvailable
        } = this.props
        return <Animated.View style={{ flex: 1, transform: [{ translateY: this.translateY }] }}>
            <AffectedSymbol
                ref={this.setRefAffectedSymbol}
                onLayoutAffectedSymbol={this.onLayoutAffectedSymbol}
                data={data}
                heightHeader={heightHeader}
                onPressAffectedSymbol={onPressAffectedSymbol}
                navigator={navigator} />
            <Preview
                onHideShare={this.props.onHideShare}
                updatePagingNews={this.updatePagingNews}
                translateY={this.translateY}
                showAffectedSymbol={this.showAffectedSymbol}
                hideAffectedSymbol={this.hideAffectedSymbol}
                updateDisableShareNew={this.props.updateDisableShareNew}
                showThenHideError={this.showThenHideError}
                timeToAvailable={timeToAvailable}
                available={available}
                setRefPdf={setRefPdf}
                data={data} />
            <PagingNews
                translateY={this.translateY}
                ref={this.setRefPagingNews} />
        </Animated.View>
    }
}

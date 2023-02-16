import React, { useRef } from 'react'
import {
    View, Text, Dimensions
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import PortfolioFirstTab from './PortfolioFirstTab'
import PortfolioSecondTab from './PortfolioSecondTab'
import { ScrollView } from 'react-native-gesture-handler';

const { width: DEVICE_WIDTH } = Dimensions.get('window')
const TabContent = ({ setTitle, refScroll, refButton }) => {
    const dic = useRef({
        prevPosition: 0
    })
    const scrollToBegin = () => {
        refScroll.current && refScroll.current.scrollTo({ x: 0, animated: true })
        dic.current.prevPosition = 0
        setTitle && setTitle(0)
        refButton.current.setTabActive && refButton.current.setTabActive(0)
    }
    const scrollToEnd = () => {
        refScroll.current && refScroll.current.scrollTo({ x: 2 * DEVICE_WIDTH, animated: true })
        dic.current.prevPosition = DEVICE_WIDTH
        setTitle && setTitle(1)
        refButton.current.setTabActive && refButton.current.setTabActive(1)
    }
    const onScrollEndDrag = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const isMoveLeftToRight = x === 0
            ? dic.current.prevPosition < x
            : dic.current.prevPosition < x + 1 // Android delta > max
        console.info('onScrollEndDrag', dic.current.prevPosition, x, isMoveLeftToRight)
        if (isMoveLeftToRight) {
            return scrollToEnd()
        }
        return scrollToBegin()
    }
    return <View style={{
        width: DEVICE_WIDTH,
        backgroundColor: CommonStyle.color.dark
    }}>
        <ScrollView
            onScrollEndDrag={onScrollEndDrag}
            ref={refScroll}
            horizontal
            showsHorizontalScrollIndicator={false}>
            <PortfolioFirstTab />
            <PortfolioSecondTab />
        </ScrollView>
    </View>
}

export default TabContent

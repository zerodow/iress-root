import React, { Component } from 'react';
import _ from 'lodash';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { ViewLoading } from '../TradeList/tradelist.rowLoading';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
// import * as Business from '~/business';

import { WIDTH_ROW, HEIGHT_ROW } from './header.row';

const CompanyName = ({ symbol, exchange }) => (
    <Text numberOfLines={1} style={styles.company}>
        {`${symbol}.${exchange}`}
    </Text>
);

const wrapData = (data, numberLoop) => {
    if (_.isEmpty(data)) return;
    if (_.size(data) < numberLoop) return data;
    const firstArr = _.take(data, numberLoop);
    const newData = _.concat(data, firstArr);

    return newData;
};

let Item = ({ item, index }) => (
    <View key={`${item.symbol}.${item.exchange}${index}`} style={styles.item}>
        <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
                <CompanyName {...item} />

                <ViewLoading style={styles.viewLoading} />

                <View style={styles.loadingContent}>
                    <ViewLoading style={styles.loadingItem} />
                    <ViewLoading style={styles.loadingItem} />
                </View>
            </View>
        </View>
    </View>
);

Item = React.memo(Item);

let HeaderLoading = ({ data, numberLoop, _scrollValue }) => {
    const listData = wrapData(data, numberLoop);

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [
                        {
                            translateX: _scrollValue
                        }
                    ],
                    flexDirection: 'row'
                }}
            >
                {_.map(listData, (item, index) => (
                    <Item item={item} index={index} />
                ))}
            </Animated.View>
        </View>
    );
};

HeaderLoading = React.memo(HeaderLoading, (prevProps, nextProps) =>
    _.isEqual(prevProps, nextProps)
);
export default HeaderLoading;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        top: 0,
        bottom: 0,
        overflow: 'visible',
        justifyContent: 'flex-end'
    },
    company: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.font15,
        color: CommonStyle.color.turquoiseBlueHex
    },
    item: {
        width: WIDTH_ROW,
        height: HEIGHT_ROW,
        paddingLeft: 4
    },
    itemContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: CommonStyle.fontDark3,
        borderRadius: 8
    },
    itemContent: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: '100%'
    },
    viewLoading: {
        height: 21,
        width: 50,
        marginBottom: 2
    },
    loadingContent: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    loadingItem: { height: 16, width: 30 }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

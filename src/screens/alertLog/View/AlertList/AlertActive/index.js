import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Image, View, Text, Dimensions, Keyboard, FlatList } from 'react-native'
import { useSelector } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import Animated from 'react-native-reanimated'
import I18n from '~/modules/language/'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import RowItem from '~/screens/alertLog/View/AlertList/RowItem/index.active'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import ShowCreateAlert from '../ShowCreateAlert'

const ViewTypes = {
    FULL: 'FULL'
};
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const HEIGHT_ROW = 102

const TextRow = ({ value, isShowIcon = false }) => {
    return <View style={{
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 8,
        marginHorizontal: 16,
        justifyContent: 'space-between'
    }}>
        <Text style={{
            fontSize: CommonStyle.font13,
            color: CommonStyle.fontColor,
            fontWeight: 'bold'
        }}>{I18n.t(value)}</Text>
        {isShowIcon && <TouchableOpacityOpt>
            <Image source={require('~/img/icon/close.png')}
                style={{ width: 12, height: 12 }} />
        </TouchableOpacityOpt>}
    </View>
}
const HeaderList = () => {
    return <View>

    </View>
}

const FooterList = () => {
    return <View style={{
        height: 8
    }} />
}

const AlertActive = ({
    data,
    navigator,
    updateActiveStatus,
    onDelete,
    _recyclerListView
}) => {
    const isLoading = useSelector(state => state.loading.effects.alertLog.getAlertLog)
    const keyExtractor = useCallback((item, index) => {
        return index
    }, [])
    const renderHeader = useCallback(() => {
        return <HeaderList />
    }, [])
    const renderFooter = useCallback(() => {
        return <FooterList />
    }, [])
    const renderNodata = useCallback(() => {
        return !isLoading && <ShowCreateAlert navigator={navigator} />
    }, [isLoading])
    const renderItem = ({ item, index }) => {
        return <RowItem
            navigator={navigator}
            updateActiveStatus={updateActiveStatus}
            data={item}
            index={index}
            onDelete={onDelete}
            data={item}
        />
    }
    const onScrollBeginDrag = () => {
    }

    const _rowRenderer = ({ item, index }) => {
        return renderItem({ item, index })
    }

    return (
        <View onStartShouldSetResponder={() => Keyboard.dismiss()}
            style={{
                flex: 1
            }}>
            {data.length ? <TextRow value={'activeLowerCase'} /> : null}

            {
                data.length
                    ? <FlatList
                        contentContainerStyle={!data.length && { flexGrow: 1 }}
                        keyboardShouldPersistTaps={'always'}
                        showsVerticalScrollIndicator={false}
                        data={data}
                        keyExtractor={keyExtractor}
                        ref={_recyclerListView}
                        onScrollBeginDrag={onScrollBeginDrag}
                        ListHeaderComponent={renderHeader}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderNodata}
                        renderItem={_rowRenderer}
                    />
                    : renderNodata()
            }

        </View >
    )
}
export default AlertActive

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CommonStyle.backgroundColor1
    }
})

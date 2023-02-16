import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Image, View, Text, Dimensions, Keyboard, FlatList } from 'react-native'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import Animated from 'react-native-reanimated'
import I18n from '~/modules/language/'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import RowItem from '~/screens/alertLog/View/AlertList/RowItem/index.executed'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { ScrollView } from 'react-native-gesture-handler'

import LoadingList from '~/component/loading_component/list'
import RowLoadingCompn from '~s/alertLog/View/AlertList/RowItem/RowLoadingCompn'

const ViewTypes = {
    FULL: 'FULL'
};
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
export const HEIGHT_ROW = 102

const TextRow = ({ value, isShowIcon = false, onPress, isConnected }) => {
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
        {isShowIcon && <TouchableOpacityOpt disabled={!isConnected} onPress={onPress} style={{ opacity: isConnected ? 1 : 0.5 }}>
            <Image source={require('~/img/icon/close.png')}
                style={{ width: 18, height: 18 }} />

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

const AlertExecuted = React.memo(({ data, _recyclerListView, onDelete, updateActiveStatus }) => {
    const [isDeleteExecuted, setDeleteExecuted] = useState(false)
    const { isConnected, deleteExcuted } = useSelector((state) => {
        return {
            isConnected: state.app.isConnected,
            deleteExcuted: state.alertLog.deleteExcuted
        };
    }, shallowEqual);
    const dispatch = useDispatch()
    const keyExtractor = useCallback((item, index) => {
        return index
    }, [])
    const renderHeader = useCallback(() => {
        return <HeaderList />
    }, [])
    const renderFooter = useCallback(() => {
        return <FooterList />
    }, [])
    const renderItem = useCallback(({ item, index }) => {
        return <RowItem
            updateActiveStatus={updateActiveStatus}
            index={index}
            data={item}
            index={index}
            onDelete={onDelete}
        />
    }, [])
    const onScrollBeginDrag = () => {
    }
    const _rowRenderer = ({ item, index }) => {
        return renderItem({ item, index })
    }
    const onSuccess = () => {
        console.info('onSuccess')
    }
    const onError = () => {
        console.info('onError')
    }
    const onDeleteNotifications = () => {
        dispatch.alertLog.handleDeleteExcuted(true)
        dispatch.alertLog.changeLoadingAlertLog(true)
        let listAlertId = []
        data.map((item) => {
            return listAlertId.push(
                item.alert_id
            )
        })
        setTimeout(() => {
            dispatch.alertLog.deleteAlertLog({
                alertID: listAlertId,
                onSuccess,
                onError
            });
        }, 10)
    }
    if (deleteExcuted) return null
    return (
        <View
            onStartShouldSetResponder={Keyboard.dismiss()}
            style={{

                backgroundColor: CommonStyle.backgroundColor1,
                flex: 1
            }}>
            <TextRow value={'executedLowerCase'} isShowIcon={true} onPress={onDeleteNotifications} isConnected={isConnected} />
            {
                data.length || !isDelete
                    ? <FlatList
                        contentContainerStyle={!data.length && { flexGrow: 1 }}
                        keyboardShouldPersistTaps={'always'}
                        showsVerticalScrollIndicator={false}
                        data={data}
                        ref={_recyclerListView}
                        keyExtractor={keyExtractor}
                        onScrollBeginDrag={onScrollBeginDrag}
                        ListHeaderComponent={renderHeader}
                        ListFooterComponent={renderFooter}
                        renderItem={_rowRenderer} />
                    : null
            }
        </View>
    )
}, (pre, next) => pre.data === next.data)

export default AlertExecuted

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CommonStyle.backgroundColor1
    }
})

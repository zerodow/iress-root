import React, {
    useMemo, useCallback, useRef, useState, useImperativeHandle, forwardRef,
    useEffect, useLayoutEffect
} from 'react'
import { StyleSheet, View, Keyboard, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import CommonStyle from '~/theme/theme_controller'
import AlertActive from './AlertActive'
import AlertExecuted from './AlertExecuted'
import * as Business from '~/business'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import ShowCreateAlert from './ShowCreateAlert'
import HandleData from '~s/alertLog/View/HandleData'
import LoadingList from '~/component/loading_component/list'
import RowLoadingCompn from '~s/alertLog/View/AlertList/RowItem/RowLoadingCompn'
import Animated from 'react-native-reanimated'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const HEIGHT_ROW = 102
export const HandleLoading = React.memo(({ refLoading, resetList }) => {
    const isLoading = useSelector(state => state.loading.effects.alertLog.getAlertLog)
    useEffect(() => {
        if (isLoading) {
            refLoading.current && refLoading.current.start && refLoading.current.start()
            resetList && resetList()
        } else {
            refLoading.current && refLoading.current.stop && refLoading.current.stop()
        }
    }, [isLoading])
    return null
}, () => true)
const AlertList = React.memo(({ navigator, updateActiveStatus }) => {
    const listRefActive = useRef([])
    const listRefExecuted = useRef([])
    const _recyclerListView = useRef()
    const refLoading = useRef({})
    const [alertIDActive, setAlertIDActive] = useState([])
    const [alertIDExecuted, setAlertIDExecuted] = useState([])
    const { data, reload, isLoading } = useSelector((state) => {
        return {
            data: state.alertLog.data || [],
            reload: state.alertLog.reload,
            isLoading: state.loading.effects.alertLog.getAlertLog
        }
    }, shallowEqual);
    const dispatch = useDispatch();
    useLayoutEffect(() => {
        dispatch.alertLog.getAlertLog()
    }, [reload])
    const translateYAnim = useMemo(() => {
        return new Animated.Value(0)
    }, [])
    // List Active
    const listActive = useMemo(() => {
        if (data.length) {
            return data.filter((item) => {
                return item.active
            })
        } else {
            return []
        }
    }, [data])
    // Sort theo created_time
    const arrActive = JSON.parse(JSON.stringify(listActive))
    const listActiveSort = arrActive.sort((a, b) => {
        return b.created_time - a.created_time
    })
    // Delete alert
    const listActiveDelete = listActiveSort.filter((item) => {
        if (alertIDActive.indexOf(item.alert_id) === -1) {
            return item
        }
    })
    const onDeleteActive = (data, index) => {
        listRefActive.current.push(data.alert_id)
        setAlertIDActive([...listRefActive.current])
    }
    // List Executed
    // Filter theo active
    const listExecuted = useMemo(() => {
        if (data.length) {
            return data.filter((item) => {
                return !item.active;
            })
        } else {
            return []
        }
    }, [data])
    const arrExecuted = JSON.parse(JSON.stringify(listExecuted))
    const listExecutedSort = arrExecuted.sort((a, b) => {
        return b.last_notify_time - a.last_notify_time
    })
    const listExecutedDelete = listExecutedSort.filter((item) => {
        if (alertIDExecuted.indexOf(item.alert_id) === -1) {
            return item
        }
    })
    const onDeleteExecuted = (data, index) => {
        listRefExecuted.current.push(data.alert_id)
        setAlertIDExecuted([...listRefExecuted.current])
    }
    const renderButtonCreateAlert = useCallback(() => {
        return <ShowCreateAlert navigator={navigator} />
    }, [data])

    return (
        <View onStartShouldSetResponder={Keyboard.dismiss()}
            style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor1 }}>
            <HandleData data={data.length ? data : []} />
            <HandleLoading
                resetList={() => {
                    try {
                        _recyclerListView.current._scrollViewRef.scrollTo({
                            x: 0,
                            y: 0,
                            animated: true
                        });
                        clearInteractable()
                    } catch (error) {

                    }
                }}
                refLoading={refLoading} />
            {data.length
                ? <ScrollView
                    style={{ flex: 1 }}>
                    {
                        listActiveDelete.length ? <AlertActive
                            data={listActiveDelete}
                            _recyclerListView={_recyclerListView}
                            navigator={navigator}
                            updateActiveStatus={updateActiveStatus}
                            onDelete={onDeleteActive}
                        /> : null
                    }
                    {
                        listExecutedDelete.length ? <AlertExecuted
                            data={listExecutedDelete}
                            navigator={navigator}
                            _recyclerListView={_recyclerListView}
                            updateActiveStatus={updateActiveStatus}
                            onDelete={onDeleteExecuted}
                        /> : null
                    }
                    <View style={{ height: 94 }} />
                </ScrollView>
                : renderButtonCreateAlert()}
            {
                isLoading ? <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        height: DEVICE_HEIGHT,
                        backgroundColor: CommonStyle.backgroundColor1,
                        transform: [{
                            translateY: translateYAnim
                        }]
                    }}>
                    <LoadingList
                        ref={refLoading}
                        rowLoadingComp={RowLoadingCompn}
                        translateY={translateYAnim}
                        duration={1000}
                        scrollEnabled={true} />
                </Animated.View> : null
            }
        </View >
    )
}, (pre, next) => pre.data === next.data)

export default AlertList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CommonStyle.backgroundColor1
    }
})

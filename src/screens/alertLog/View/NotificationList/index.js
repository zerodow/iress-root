// import React in our code
import React, {
    useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect
} from 'react';
// import all the components we are going to use
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Keyboard,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'
import RowNotification from '~s/alertLog/View/NotificationList/RowItem/RowNotification';
import LoadingList from '~/component/loading_component/list'
import RowLoadingNotification from '~s/alertLog/View/NotificationList/RowItem/RowLoadingNotification'
import Animated from 'react-native-reanimated'
import { getLoadNotification, setListAlertID } from '~s/alertLog/Model/AlertLogModel';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')

const PAGE_COUNT = 8

export const HandleLoading = React.memo(({ isLoading, refLoading, resetList }) => {
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

const NotifcationList = React.memo(() => {
    const refLoading = useRef({})
    const dispatch = useDispatch();
    const [isLoadMore, setLoadMore] = useState(false)
    const { data, isLoading, reload } = useSelector((state) => {
        return {
            data: state.alertLog.listNotification || [],
            isLoading: state.alertLog.loading,
            reload: state.alertLog.reload
        };
    }, shallowEqual);
    const { status_code: statusCode, data: listData, request_id: requestId } = data

    const translateYAnim = useMemo(() => {
        return new Animated.Value(0)
    }, [])
    useEffect(() => {
        dispatch.alertLog.getListNotification({
            page: PAGE_COUNT,
            onSuccess,
            onError
        })
    }, [])
    useEffect(() => {
        if (listData) {
            setListAlertID(listData)
        }
    }, [listData, reload])
    const listAlertId = useMemo(() => {
        let listID = []
        if (listData) {
            listData.filter((item) => {
                if (!item.acknowledged) {
                    listID.push(item.alert_id)
                }
            })
        }
        return listID
    }, [listData])
    const onSuccessDelete = () => {
    }
    const onErrorDelete = () => {
    }
    useEffect(() => {
        dispatch.alertLog.readNotification({
            listAlertId: listAlertId,
            onSuccessDelete,
            onErrorDelete
        });
    }, [])
    const onSuccess = () => {
        setLoadMore(false)
    }
    const onError = () => {
        setLoadMore(false)
    }
    const handleLoadMore = () => {
        if (statusCode === 2) return;
        setLoadMore(true)
        dispatch.alertLog.getListNotification({
            page: PAGE_COUNT,
            requestId,
            onSuccess: onSuccess(),
            onError: onSuccess()
        })
    }

    const renderFooter = () => {
        if (!isLoadMore) return null;
        return (
            <View
                style={{
                    paddingTop: 8,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}
            >
                <ActivityIndicator color='#efefef' />
            </View>
        );
    };

    const rowRenderer = useCallback(({ item, index }) => {
        return (
            <View
                style={{
                    paddingHorizontal: 8
                }}
            >
                {renderItemSeparatorComponent()}
                <RowNotification
                    data={item}
                    index={index}
                />
            </View>
        );
    }, [])
    const renderItemSeparatorComponent = () => {
        return <View style={{ height: 8, width: DEVICE_WIDTH }} />;
    };
    const renderNodata = useCallback(() => {
        return <TouchableWithoutFeedback onPress={Keyboard.dismiss()}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{
                    color: CommonStyle.fontColor,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }}>
                    {I18n.t('noData')}
                </Text>
            </View>
        </TouchableWithoutFeedback>
    }, [])
    return (
        <View style={styles.container}>

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
                isLoading={isLoading}
                refLoading={refLoading} />
            {listData && !isLoading ?
                <FlatList
                    style={{ flex: 1 }}
                    data={listData}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={renderItemSeparatorComponent}
                    renderItem={rowRenderer}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                /> : renderNodata()
            }
            <View style={{ height: 78 + 16 }} />
            {isLoading ? <Animated.View
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
                    rowLoadingComp={RowLoadingNotification}
                    translateY={translateYAnim}
                    duration={1000}
                    scrollEnabled={true} />
            </Animated.View> : null}
        </View>
    );
}, (pre, next) => pre.listData === next.listData || pre.reload === next.reload)
export default NotifcationList

const styles = StyleSheet.create({
    container: {
        backgroundColor: CommonStyle.backgroundColor1,
        flex: 1
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    }
})

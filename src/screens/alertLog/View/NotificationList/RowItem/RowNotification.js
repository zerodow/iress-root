import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import ENUM from '~/enum';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import SvgIcon from '~s/watchlist/Component/Icon2';
import { getDisplayNameAlertLog } from '~s/alertLog/Controller/AlertController'
import * as Business from '~/business'
const { TRIGGER_ALERT, ALERT_LOG_TYPE } = ENUM
const HEIGHT_ROW = 78
const RowTop = ({ displayAlerttype, date, acknowledged }) => {
    const color = acknowledged ? CommonStyle.backgroundColor : CommonStyle.fontLink
    return (
        <View style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row'
        }} >
            <View style={{
                alignItems: 'center',
                flexDirection: 'row'
            }} >
                <Text style={{
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontWhite,
                    opacity: 0.5

                }}>{displayAlerttype}</Text>

                <CommonStyle.icons.oval
                    name="search"
                    size={17}
                    color={CommonStyle.fontColor}
                    style={{ opacity: 0.2472, marginHorizontal: 4 }}
                />
                <Text style={{
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontWhite,
                    opacity: 0.25

                }}>{date}</Text>
            </View>
            <View style={{
                backgroundColor: color,
                width: 10,
                height: 10,
                borderRadius: 100,
                marginRight: 8
            }} />
        </View>
    )
}
const RowNotification = React.memo(({ data }) => {
    const { memo, acknowledged, message, event, updated } = data
    const displayAlerttype = useMemo(() => {
        if (memo === 'NEWS_IS_MARKET_SENSITIVE') {
            return 'Sensitive News'
        } else if (memo === 'NEWS_CONTAINS') {
            return 'News'
        } else if (memo === ALERT_LOG_TYPE.TODAY_VOLUME) {
            return 'Volume'
        } else {
            return getDisplayNameAlertLog(memo)
        }
    }, [memo])
    const date = Business.getTimeNews(updated)
    return (
        <View
            style={{
                borderRadius: 8,
                backgroundColor: CommonStyle.backgroundColor,
                height: data && data.length === 0 ? HEIGHT_ROW : HEIGHT_ROW,
                justifyContent: 'space-around'
            }}>
            <View style={{
                paddingLeft: 16
            }}>
                <RowTop displayAlerttype={displayAlerttype} date={date} acknowledged={acknowledged} />
                <View style={{ paddingTop: 8, paddingRight: 16 }}>
                    <Text numberOfLines={2} style={{
                        color: CommonStyle.fontColor,
                        alignSelf: 'baseline',
                        fontSize: CommonStyle.font11
                    }}>{event}</Text>
                </View>
            </View>
        </View>
    )
}, (pre, next) => pre.data === next.data)

export default RowNotification

const styles = StyleSheet.create({})

import React, { } from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import _ from 'lodash'

const Row = props => {
    const { item, textStyle } = props
    return <View style={{ marginHorizontal: 8 }}>
        <Text style={[{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            opacity: 0.7,
            textAlign: 'center'
        }, textStyle]}>
            {item}
        </Text>
    </View>
}

const ListUserWLDelete = props => {
    const { listData, textStyle } = props
    const data = _.take(listData, 10)
    return <View style={{}}>
        {
            data.map((item, index) => {
                return <Row textStyle={textStyle} key={item} item={item} />
            })
        }
        {
            listData.length > 10
                ? <Row textStyle={textStyle} key={'...'} item={'...'} />
                : null
        }
        <View style={{ height: 8 }} />
    </View>
}

export default ListUserWLDelete

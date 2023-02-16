import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';

import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import PriceValue from '../Component/PriceValue';
import {
    DEFAULT_COLOR,
    UP_COLOR,
    DOWN_COLOR,
    NORMAL_COLOR
} from '../Component/Progressbar';
import * as FuncUtil from '~/lib/base/functionUtil';
import PricePercent from '../Component/PricePercent';
import PriceChangePoint from '../Component/PriceChangePoint';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const ChangePoint = ({ changePoint }) => {
    let color = DEFAULT_COLOR;
    let showValue = FuncUtil.formatNumberNew2(
        changePoint,
        PRICE_DECIMAL.IRESS_PRICE
    );
    if (changePoint || changePoint === 0) {
        if (changePoint === 0) {
            color = NORMAL_COLOR;
        } else if (+changePoint > 0) {
            color = CommonStyle.fontOceanGreen;
            showValue = '+' + showValue;
        } else {
            color = CommonStyle.fontNewRed;
        }
    }

    return (
        <Text
            style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font11,
                color
            }}
        >
            {`${showValue} `}
        </Text>
    );
};

const MPRCInfo = ({ symbol, exchange, mprc, changePoint, changePercent }) => {
    const isMPRC = !_.isNil(mprc)
    return (
        <View
            style={{
                flexDirection: 'row'
            }}
        >
            {
                isMPRC
                    ? <Text
                        style={[
                            CommonStyle.textAlert,
                            { fontSize: CommonStyle.font11, paddingRight: 8 }
                        ]}
                    >
                        MPRC:
            </Text>
                    : null
            }
            <PriceChangePoint
                exchange={exchange}
                symbol={symbol}
                isMPRC={isMPRC}
                value={isMPRC ? mprc : changePoint}
                style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11
                }}
            />

            <View style={styles.space} />

            <PricePercent
                value={isMPRC ? mprc : changePercent}
                colorFlag={isMPRC ? mprc : changePoint}
                style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11
                }}
            />
        </View>
    );
};

export default MPRCInfo;

const styles = StyleSheet.create({
    space: { width: 8 }
});

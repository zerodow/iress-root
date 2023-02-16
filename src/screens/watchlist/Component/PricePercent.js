import React, { Component } from 'react';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { DEFAULT_COLOR, UP_COLOR, DOWN_COLOR } from './Progressbar';
import CommonStyle from '~/theme/theme_controller';
import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

export default class PricePercent extends Component {
    render() {
        const { style, value, colorFlag } = this.props;
        let color = DEFAULT_COLOR;
        let title = ' --';
        let iconContent = null;

        if (value) {
            if (colorFlag || colorFlag === 0) {
                if (+colorFlag >= 0) {
                    color = CommonStyle.fontGreenNew;
                    iconContent = (
                        <CommonStyle.icons.arrowUp
                            name="md-arrow-dropup"
                            color={CommonStyle.fontGreenNew}
                            size={6}
                            style={[
                                CommonStyle.iconPickerUp,
                                {
                                    color: CommonStyle.fontGreenNew,
                                    marginRight: 4,
                                    alignSelf: 'center'
                                }
                            ]}
                        />
                    );
                } else {
                    color = CommonStyle.fontNewRed;
                    iconContent = (
                        <CommonStyle.icons.arrowDown
                            name="md-arrow-dropdown"
                            size={6}
                            color={CommonStyle.fontNewRed}
                            style={[
                                CommonStyle.iconPickerDown,
                                {
                                    color: CommonStyle.fontNewRed,
                                    marginRight: 4,
                                    alignSelf: 'center'
                                }
                            ]}
                        />
                    );
                }
            }
            title = ' ';
            title += FuncUtil.formatNumberNew2(value, PRICE_DECIMAL.PERCENT);
            title += '%';
            // eslint-disable-next-line no-useless-escape
            title = title.replace(/\-/g, '');
        } else {
            iconContent = null;
            // iconContent = (
            //     <Icon
            //         name="md-arrow-dropdown"
            //         size={6}
            //         style={[
            //             CommonStyle.iconPickerDown,
            //             {
            //                 color: CommonStyle.fontRed,
            //                 marginRight: 4,
            //                 alignSelf: 'center',
            //                 opacity: 0
            //             }
            //         ]}
            //     />
            // );
        }

        if (value === 0) {
            color = CommonStyle.fontWhite;
            title = '0.00%';
        }

        return (
            <React.Fragment>
                {iconContent}
                <Text
                    numberOfLines={1}
                    textAlign="right"
                    style={[
                        {
                            fontFamily: CommonStyle.fontPoppinsMedium,
                            fontSize: CommonStyle.fontSizeXS,
                            color
                        },
                        style
                    ]}
                >
                    {title}
                </Text>
            </React.Fragment>
        );
    }
}

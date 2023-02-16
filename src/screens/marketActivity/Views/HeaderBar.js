import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
    styles as headerStyles,
    topSpace
} from '~s/watchlist/Component/DefaultHeader';
import MainComp from '~s/watchlist/Component/DefaultMainHeader';
import LeftIcon from '~s/watchlist/Header/header.leftIcon';
import { useShadow } from '~/component/shadow/SvgShadow';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language';

const HeaderBar = ({ navigator }) => {
    const [Shadow, onLayout] = useShadow();

    return (
        <React.Fragment>
            <Shadow />
            <View
                onLayout={onLayout}
                style={[
                    headerStyles.container,
                    styles.container,
                    {
                        zIndex: 9,
                        backgroundColor: CommonStyle.color.dark,
                        marginTop: 0,
                        paddingTop: topSpace + 16,
                        paddingBottom: 16
                    }
                ]}
            >
                <LeftIcon navigator={navigator} />
                <MainComp title={I18n.t('marketActivity')} />
                <View style={[headerStyles.leftComp, styles.leftComp]}></View>
            </View>
        </React.Fragment>
    );
};

export default HeaderBar;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        marginLeft: 0,
        paddingTop: 16
    },
    leftComp: {
        paddingRight: 16,
        flexDirection: 'row'
    },
    main: {
        backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

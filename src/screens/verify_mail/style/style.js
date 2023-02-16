import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../../src/config';
import style from '../../../../src/style';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../../src/storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		searchBarContainer3: {
			height: 64,
			width: '100%',
			flexDirection: 'row',
			paddingTop: CommonStyle.marginSize - 4,
			alignItems: 'center',
			backgroundColor: config.colorVersion,
			paddingLeft: 0,
			shadowColor: 'rgba(76,0,0,0)',
			shadowOffset: {
				width: 0,
				height: 0.5
			}
		},
		errorTxt: {
			textAlign: 'center',
			color: '#FFFFFF',
			fontSize: CommonStyle.fontSizeS,
			fontFamily: 'HelveticaNeue',
			marginHorizontal: 8,
			marginVertical: 8
		},
		wrapperErrorTxt: {
			backgroundColor: 'red'
		},
		containerDecription: {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#EFEFEF'
		},
		decriptionText: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: 'HelveticaNeue',
			color: '#000000',
			backgroundColor: 'transparent'
		},
		containerInputMail: {
			alignItems: 'flex-start',
			marginHorizontal: 16,
			flexDirection: 'row',
			borderBottomColor: 'rgba(0, 0, 0, 0.12)',
			borderTopColor: 'rgba(0, 0, 0, 0.12)',
			borderBottomWidth: 1,
			borderTopWidth: 1
		},
		headerButton: {
			fontWeight: '500',
			color: '#f2f2f2',
			fontFamily: 'HelveticaNeue',
			fontSize: CommonStyle.fontSizeM
		},
		inputText: {
			color: '#3d3f48',
			fontSize: CommonStyle.fontSizeXL
		},
		iconClear: {
			opacity: 0.6,
			color: 'black'
		},
		remindText: {
			fontSize: CommonStyle.font13,
			fontFamily: 'HelveticaNeue'
		},
		mail: {
			fontSize: CommonStyle.font13,
			fontFamily: 'HelveticaNeue-Bold'
		},
		sendCode: {
			fontSize: CommonStyle.fontSizeM,
			color: '#359ee4'
		}
	})

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

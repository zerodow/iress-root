import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		dropDownContainer: {
			width: 0
		},
		rowContainer: {
			flexDirection: 'row',
			paddingLeft: 15,
			paddingRight: 15,
			height: 40,
			justifyContent: 'center',
			alignItems: 'center',
			borderBottomWidth: 1,
			borderColor: '#0000001e'
		},
		dropDownRow: {
			height: 41,
			justifyContent: 'center',
			width: 160,
			paddingLeft: 10
		},
		dropDownStyle: {
			borderWidth: 0,
			alignItems: 'flex-end',
			width: 160,
			marginTop: 62,
			shadowColor: 'rgba(0,0,0,0.3)',
			shadowOffset: {
				width: 0,
				height: 5
			},
			shadowOpacity: 1,
			shadowRadius: 20
		},
		normalText: {
			color: 'black',
			fontSize: CommonStyle.fontSizeM
		},
		textfieldWithFloatingLabel: {
			height: 48
		},
		textInputStyle: {
			flexGrow: 1,
			flex: 0,
			color: 'rgba(0, 0, 0, 0.87)',
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontMedium
		},
		textInputStyleUpdate: {
			flexGrow: 1,
			flex: 0,
			color: 'rgba(0, 0, 0, 0.87)',
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontMedium
		},
		textInputContainer: {
			borderColor: '#787878',
			width: '60%',
			borderBottomWidth: 1,
			height: '70%',
			justifyContent: 'center',
			alignItems: 'center'
		},
		iconPicker: {
			color: '#00000054',
			opacity: 0.87,
			width: 24,
			height: 24,
			textAlign: 'right',
			position: 'absolute'
		},
		textLeft: {
			width: '40%',
			fontWeight: 'bold'
		},
		errorLabel: {
			height: 12,
			fontSize: CommonStyle.fontSizeXS,
			fontFamily: CommonStyle.fontLight,
			color: '#df0000',
			lineHeight: 12
		},
		textRight: {
			textAlign: 'right',
			width: '60%',
			color: '#787878'
		},
		errorContainer: {
			backgroundColor: 'white',
			width: '100%',
			paddingHorizontal: 16,
			height: 48,
			alignItems: 'center',
			position: 'absolute'
		},
		inputText: {
			flexGrow: 1,
			flex: 0,
			fontSize: CommonStyle.fontSizeM,
			color: 'black',
			opacity: CommonStyle.opacity1,
			fontFamily: CommonStyle.fontMedium,
			height: CommonStyle.heightM,
			// marginLeft: -5,
			marginBottom: -8
		}
	})

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

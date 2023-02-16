import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		paddingTop: 8,
		paddingBottom: 8,
		marginTop: 8
	},
	priceBaseTab: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'center'
	},
	conditionTab: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
		alignItems: 'center'
	},
	inputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4
	},
	inputContent: {
		flex: 0.55,
		marginTop: 16,
		marginRight: 8
	},
	block: {
		borderColor: 'rgb(58, 66, 94)',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderStyle: 'solid',
		marginTop: 8,
		marginLeft: 8,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		padding: 8
	},
	text: {
		color: '#FFFFFF',
		fontWeight: '400',
		fontSize: 14,
		opacity: 0.7,
		textTransform: 'uppercase'
	},
	label: {
		marginLeft: 16,
		color: '#FFFFFF',
		opacity: 0.5
	},
	divider: { height: 3, backgroundColor: 'black', marginTop: 8 }
});

export default styles;

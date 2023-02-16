import IonIcons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
export default [
	{
		id: 0,
		tabName: 'activity',
		screen: 'equix.Activities',
		iconName: 'showchart',
		testId: 'Id-Bottom-Bar-OverView',
		accessibilityLabel: 'Label-Bottom-Bar-OverView',
		iconType: MaterialIcons
	},
	{
		id: 1,
		tabName: 'WatchListTitle',
		screen: 'equix.Trade',
		iconName: 'viewlist',
		testId: 'Id-Bottom-Bar-WatchList',
		accessibilityLabel: 'Label-Bottom-Bar-WatchList',
		iconType: MaterialIcons
	},
	{}, // coi nhu 1 tab cho quickbutton
	{
		id: 3,
		tabName: 'portfolio',
		iconName: 'web',
		screen: 'equix.Portfolio',
		testId: 'Id-Bottom-Bar-Portfolio',
		accessibilityLabel: 'Label-Bottom-Bar-Portfolio',
		iconType: MaterialIcons
	},
	{
		id: 4,
		tabName: 'Orders',
		screen: 'equix.Orders',
		iconName: 'swapvert',
		testId: 'Id-Bottom-Bar-Order',
		accessibilityLabel: 'Label-Bottom-Bar-Order',
		iconType: MaterialIcons
	}
];

import { iconsMap } from '../utils/AppIcons';

export const refreshButton = isRefresh => {
	if (isRefresh) {
		return [
			{
				id: 'custom-button',
				component: 'equix.CustomButton'
			}
		];
	}
	return [
		{
			title: 'Refresh',
			id: 'search_refresh',
			icon: iconsMap['ios-refresh-outline']
		}
	];
};

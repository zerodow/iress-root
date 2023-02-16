import Uuid from 'react-native-uuid';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import { useEffect, useState } from 'react';
import CommonStyle from '~/theme/theme_controller';
import { Platform } from 'react-native';

export const useUpdateChangeTheme = (nav) => {
	const [update, setUpdate] = useState(1);
	useEffect(() => {
		const id = Uuid.v4();
		Emitter.addListener(Channel.getChannelChangeTheme(), id, () => {
			setUpdate({});
			if (nav && Platform.OS === 'android') {
				nav.setStyle({ statusBarColor: CommonStyle.statusBarColor });
			}
		});
		return () => {
			Emitter.deleteListener(Channel.getChannelChangeTheme(), id);
		};
	}, []);
	return update;
};

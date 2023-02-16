import { AsyncStorage } from 'react-native'
import { persistStore, getStoredState } from 'redux-persist';
import { logDevice } from '../lib/base/functionUtil';
import _ from 'lodash'
import RNFetchBlob from 'rn-fetch-blob'
import FilesystemStorage from 'redux-persist-filesystem-storage'

FilesystemStorage.config({
	storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`
});

// FilesystemStorage.clear()

export default function persistStoreWithOption(store, callback) {
	const config = {
		// key: 'root',
		storage: FilesystemStorage,
		whitelist: ['app', 'login']
	};
	const fsPersistor = persistStore(store, config, async (fsError, fsResult) => {
		console.log('LOAD PERSIST STORE SUCCESS', fsError, fsResult);
		if (_.isEmpty(fsResult)) {
			console.log('LOAD PERSIST STORE fsResult NULL', fsError, fsResult);
			// if state from fs storage is empty try to read state from previous storage
			try {
				const asyncState = await getStoredState({ storage: AsyncStorage })
				console.log('LOAD PERSIST STORE PREVIOUS DATA', asyncState);
				if (!_.isEmpty(asyncState)) {
					// if data exists in `AsyncStorage` - rehydrate fs persistor with it
					fsPersistor.rehydrate(asyncState, { serial: false })
				}
				callback && callback();
			} catch (getStateError) {
				console.error('getStoredState error', getStateError)
				callback && callback();
			}
		} else {
			callback && callback();
		}
	});
	return fsPersistor
}

import RNFetchBlob from 'rn-fetch-blob';

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/watchlist`;

let options = {
	storagePath: defaultStoragePath,
	encoding: 'utf8',
	toFileName: name => name.split(':').join('-'),
	fromFileName: name => name.split('-').join(':')
};

const genKey = (key, id) => {
	return `${key}_${id}`
}

const pathForKey = (key) =>
	`${options.storagePath}/${options.toFileName(key)}`;

const deleteFolder = (path) => {
	return new Promise((resolve, reject) => {
		RNFetchBlob.fs
			.unlink(path)
			.then(resolve)
			.catch(reject)
	})
}

const writeFilePromise = (key, value) => {
	return new Promise((resolve, reject) => {
		RNFetchBlob.fs
			.writeFile(pathForKey(key), value, options.encoding)
			.then(() => resolve && resolve())
			.catch(error => reject && reject(error))
	})
}

const readFilePromise = (filePath, resolve, reject) => {
	RNFetchBlob.fs.exists(filePath)
		.then((exist) => {
			if (exist) {
				RNFetchBlob.fs
					.readFile(filePath, options.encoding)
					.then(data => {
						if (data) {
							resolve && resolve(JSON.parse(data));
						} else {
							resolve && resolve({});
						}
					})
					.catch(error => {
						reject && reject(error);
					});
			} else {
				const error = 'file not exist'
				reject && reject(error);
			}
		})
		.catch(error => {
			console.log('readFilePromise error', error)
			reject && reject(error);
		})
}

const getItemReturnPromise = (key) => {
	return new Promise((resolve, reject) => {
		const filePath = pathForKey(options.toFileName(key));
		return readFilePromise(filePath, resolve, reject)
	})
}

const setItem = (key, value) => {
	try {
		return writeFilePromise(key, value)
	} catch (error) {
		console.log('DCM setItem exception', error)
	}
}

const getItem = (key) => {
	try {
		return getItemReturnPromise(key)
	} catch (error) {
		console.log('DCM getItem exception', error)
	}
}

const storage = {
	save: ({ key, id, data }) => {
		const newKey = genKey(key, id)
		const dataStr = JSON.stringify(data)
		return setItem(newKey, dataStr)
	},
	load: ({ key, id }) => {
		const newKey = genKey(key, id)
		return getItem(newKey)
	},
	clearMap: () => deleteFolder(defaultStoragePath),
	createStoragePathIfNeeded: path => {
		return new Promise((resolve, reject) => {
			RNFetchBlob.fs
				.exists(path)
				.then(exists => {
					if (exists) {
						return resolve()
					} else {
						RNFetchBlob.fs.mkdir(path)
							.then(resolve)
							.catch(reject)
					}
				})
				.catch(err => console.log('DCM createStoragePathIfNeeded', err));
		})
	}
}

storage.clearMap();
storage.createStoragePathIfNeeded(defaultStoragePath)

global.storage = storage;

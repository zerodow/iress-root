import RNFetchBlob from 'rn-fetch-blob';

/*
    Overrite function from AsyncStorage - REACT NATIVE
    1.setItem
    2.getItem
    3.removeItem
    4.getAllKeys
    5.clear
*/

const createStoragePathIfNeeded = path =>
    RNFetchBlob.fs
        .exists(path)
        .then(exists => {
            if (!exists) {
                RNFetchBlob.fs.mkdir(path)
                    .then(() => {
                        console.log('CREATE STORAGE SUCCESS')
                    })
                    .catch(error => {
                        console.log('CREATE STORAGE ERROR', error)
                    })
            }
        })
        .catch(err => console.log('DCM createStoragePathIfNeeded', err));

const onStorageReadyFactory = storagePath => async (func) => {
    const storage = await createStoragePathIfNeeded(storagePath);

    return (...args) => storage
        .then(() => func(...args))
        .catch(err => console.log('DCM onStorageReadyFactory error', err));
};

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/localData`;

let onStorageReady = onStorageReadyFactory(defaultStoragePath);
let options = {
    storagePath: defaultStoragePath,
    encoding: 'utf8',
    toFileName: name => name.split(':').join('-'),
    fromFileName: name => name.split('-').join(':')
};

const pathForKey = (key) =>
    `${options.storagePath}/${options.toFileName(key)}`;

const deleteFile = (key, callback) => {
    RNFetchBlob.fs
        .unlink(pathForKey(options.toFileName(key)))
        .then(() => callback && callback())
        .catch(error => {
            callback && callback(error);
        })
}

const deleteFilePromise = (key) => {
    return new Promise((resolve, reject) => {
        RNFetchBlob.fs
            .unlink(pathForKey(options.toFileName(key)))
            .then(() => resolve && resolve())
            .catch(error => {
                reject && reject(error);
            })
    })
}

const writeFile = (key, value, callback) => {
    RNFetchBlob.fs
        .writeFile(pathForKey(key), value, options.encoding)
        .then(() => callback && callback())
        .catch(error => callback && callback(error))
}

const writeFilePromise = (key, value) => {
    return new Promise((resolve, reject) => {
        RNFetchBlob.fs
            .writeFile(pathForKey(key), value, options.encoding)
            .then(() => resolve && resolve())
            .catch(error => reject && reject(error))
    })
}

const readFile = (filePath, callback) => {
    RNFetchBlob.fs
        .readFile(filePath, options.encoding)
        .then(data => {
            callback && callback(null, data);
        })
        .catch(error => {
            callback && callback(error);
        });
}

const readFilePromise = (filePath, resolve, reject) => {
    RNFetchBlob.fs.exists(filePath)
        .then((exist) => {
            if (exist) {
                RNFetchBlob.fs
                    .readFile(filePath, options.encoding)
                    .then(data => {
                        resolve && resolve(data);
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

const getItemReturnCB = (key, callback) => {
    const filePath = pathForKey(options.toFileName(key));
    return readFile(filePath, callback)
}

const getItemReturnPromise = (key) => {
    return new Promise((resolve, reject) => {
        const filePath = pathForKey(options.toFileName(key));
        return readFilePromise(filePath, resolve, reject)
    })
}

const FilesystemStorage = {
    config: (customOptions) => {
        options = {
            ...options,
            ...customOptions
        };
        onStorageReady = onStorageReadyFactory(options.storagePath);
    },

    setItem: (key, value, callback) => {
        try {
            if (callback) {
                return writeFile(key, value, callback)
            }
            return writeFilePromise(key, value)
        } catch (error) {
            console.log('DCM setItem exception', error)
        }
    },
    getItem: (key, callback) => {
        try {
            if (callback) {
                return getItemReturnCB(key, callback)
            }
            return getItemReturnPromise(key)
        } catch (error) {
            console.log('DCM getItem exception', error)
        }
    },

    removeItem: (key, callback) => {
        if (callback) {
            return deleteFile(key, callback)
        }
        return deleteFilePromise(key)
    },

    getAllKeys: callback =>
        RNFetchBlob.fs
            .exists(options.storagePath)
            .then(exists =>
                exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
            )
            .then(() =>
                RNFetchBlob.fs
                    .ls(options.storagePath)
                    .then(files => files.map(file => options.fromFileName(file)))
                    .then(files => {
                        callback && callback(null, files);
                        if (!callback) {
                            return files;
                        }
                    })
            )
            .catch(error => {
                callback && callback(error);
                if (!callback) {
                    throw error;
                }
            }),

    clear: undefined // Workaround for Flow error coming from `clear` not being part of object literal
};

FilesystemStorage.clear = callback =>
    FilesystemStorage.getAllKeys((error, keys) => {
        if (error) throw error;

        if (Array.isArray(keys) && keys.length) {
            const removedKeys = [];

            keys.forEach(key => {
                FilesystemStorage.removeItem(key, (error) => {
                    removedKeys.push(key);
                    if (error && callback) {
                        callback(error, false);
                    }

                    if (removedKeys.length === keys.length && callback) {
                        callback(null, true);
                    }
                });
            });
            return true;
        }

        callback && callback(null, false);
        return false;
    }).catch(error => {
        callback && callback(error);
        if (!callback) {
            throw error;
        }
    });

createStoragePathIfNeeded(defaultStoragePath)

export default FilesystemStorage;

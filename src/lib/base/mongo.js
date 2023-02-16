import DataStore from 'react-native-local-mongodb';
import { dataStorage } from '../../storage';
export default class Mongo {
    constructor(name) {
        const filename = `${dataStorage.cachingVersion}_${name}`
        this.db = null;
        if (dataStorage.mongoConnected && dataStorage.mongoConnected[filename] && dataStorage.mongoCount && dataStorage.mongoCount[filename] > 0) {
            const mongoCount = dataStorage.mongoCount[filename];
            this.db = dataStorage.mongoConnected[filename];
            dataStorage.mongoCount[filename] = mongoCount + 1;
        } else {
            this.db = new DataStore({ filename: filename, autoload: true });
            dataStorage.mongoConnected[filename] = this.db;
            dataStorage.mongoCount[filename] = 1;
        }
    }

    returnCallback(err, data, cbFn) {
        cbFn && cbFn(err, data);
    }

    async update(query, newItem, cb) {
        if (cb) {
            this.db.update(query, newItem, {}, (err, numReplaced) => {
                this.returnCallback(err, numReplaced, cb)
            });
        } else {
            return new Promise((resolve, reject) => {
                // console.log(`ORDER CACHE ===> UPDATE: ${JSON.stringify(newItem)}`);
                this.db.update(query, newItem, {}, (err, numReplaced) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(numReplaced);
                    }
                });
            });
        }
    }

    async insert(item, cb) {
        if (cb) {
            this.db.insert(item, (err, newDocs) => {
                this.returnCallback(err, newDocs, cb)
            });
        } else {
            return new Promise((resolve, reject) => {
                // console.log(`ORDER CACHE ===> INSERT: ${JSON.stringify(item)}`);
                this.db.insert(item, (err, newDocs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(newDocs);
                    }
                });
            });
        }
    }

    async find(item, cb) {
        if (cb) {
            this.db.find(item, (err, newDocs) => {
                this.returnCallback(err, newDocs, cb)
            });
        } else {
            return new Promise((resolve, reject) => {
                this.db.find(item, (err, items) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                });
            });
        }
    }

    async findAll(cb) {
        if (cb) {
            this.db.find({}, (err, newDocs) => {
                this.returnCallback(err, newDocs, cb)
            });
        } else {
            return new Promise((resolve, reject) => {
                this.db.find({}, (err, items) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                });
            });
        }
    }

    async remove(query, cb) {
        if (cb) {
            this.db.remove(query, {}, (err, numRemoved) => {
                cb(err, numRemoved);
            });
        } else {
            return new Promise((resolve, reject) => {
                this.db.remove(query, {}, (err, numRemoved) => {
                    // console.log(`ORDER CACHE ===> numRemoved: ${numRemoved} - query: ${JSON.stringify(query)}`);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(numRemoved);
                    }
                });
            });
        }
    }

    async removeMulti(query, cb) {
        return new Promise((resolve, reject) => {
            this.db.remove(query, { multi: true }, (err, numRemoved) => {
                err ? reject(err) : resolve(numRemoved);
                cb && cb(err, numRemoved);
            });
        });
    }

    async removeAll(cb) {
        if (cb) {
            this.db.remove({}, { multi: true }, (err, numRemoved) => {
            });
        } else {
            return new Promise((resolve, reject) => {
                this.db.remove({}, { multi: true }, (err, numRemoved) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(numRemoved);
                    }
                });
            });
        }
    }

    async findOnce(item, cb) {
        if (cb) {
            this.db.findOne(item, (err, newDocs) => {
                this.returnCallback(err, newDocs, cb)
            });
        } else {
            return new Promise((resolve, reject) => {
                this.db.findOne(item, (err, items) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                });
            });
        }
    }
}

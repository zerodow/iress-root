
import firebase from '../../firebase';
export default class FirebaseManager {
    constructor() {
        this.dicRegister = {};
    }
    clearDicRegister() {
        this.dicRegister = {};
    }
    updateDicRegister(path, ref, handler, action) {
        try {
            let objRegister = this.dicRegister[path];
            if (!objRegister) {
                objRegister = {};
            }

            objRegister[action] = {
                ref,
                handler
            }
            this.dicRegister[path] = objRegister;
        } catch (error) {
            console.warn('error: ', error);
        }
    }

    getReference(path) {
        try {
            const item = this.dicRegister[path];
            if (!item || !item['value']) return null;
            return item['value'].ref;
        } catch (error) {
            console.warn(error);
        }
        return null;
    }

    registerOnce(path, callback, dispatch) {
        const fb = firebase.database().ref(path);
        fb.once('value', (data) => {
            callback(data, dispatch);
        });
    }

    createReference(path) {
        const fb = firebase.database().ref(path);
        return fb;
    }

    registerAdd(path, callback, dispatch) {
        const fb = firebase.database().ref(path);
        const add = fb.on('child_added', (data) => {
            callback(data, dispatch);
        });
        this.updateDicRegister(path, fb, add, 'child_added');
    }

    registerRemove(path, callback, dispatch) {
        const fb = firebase.database().ref(path);
        const remove = fb.on('child_removed', (data) => {
            callback(data, dispatch);
        });
        this.updateDicRegister(path, fb, remove, 'child_removed');
    }
    registerChanged(path, callback, dispatch) {
        const fb = firebase.database().ref(path);
        const change = fb.on('child_changed', (data) => {
            callback(data, dispatch);
        });
        this.updateDicRegister(path, fb, change, 'child_changed');
    }
    registerMoved(path, callback, dispatch) {
        const fb = firebase.database().ref(path);
        const move = fb.on('child_moved', (data) => {
            callback(data, dispatch);
        });
        this.updateDicRegister(path, fb, move, 'child_moved');
    }

    orderByChild(path, filedName, limitLength, callback, dispatch) {
        var ref = firebase.database().ref(path);
        if (limitLength) {
            ref.orderByChild(filedName).limitToFirst(limitLength).on('child_added', function (snapshot) {
                callback(snapshot, dispatch);
            });
        } else {
            ref.orderByChild(filedName).on('child_added', function (snapshot) {
                callback(snapshot, dispatch);
            });
        }
    }

    orderByChildOnce(path, filedName, limitLength, callback) {
        var ref = firebase.database().ref(path);
        if (limitLength) {
            ref.orderByChild(filedName).limitToFirst(limitLength).once('value', function (snapshot) {
                callback(snapshot);
            });
        } else {
            ref.orderByChild(filedName).once('value', function (snapshot) {
                callback(snapshot);
            });
        }
    }

    orderByKey(path, filedName, limitLength, callback, dispatch) {
        var ref = firebase.database().ref(path);
        if (limitLength) {
            ref.orderByKey().limitToFirst(limitLength).on('child_added', function (snapshot) {
                console.log(snapshot.key);
                callback(snapshot, dispatch);
            });
        } else {
            ref.orderByKey().on('child_added', function (snapshot) {
                console.log(snapshot.key);
                callback(snapshot, dispatch);
            });
        }
    }
    register(path, callback, ...arg) {
        try {
            const fb = firebase.database().ref(path);
            const value = fb.on('value', (data) => {
                callback(data, ...arg);
            });
            this.updateDicRegister(path, fb, value, 'value');
            return Promise.resolve()
        } catch (error) {
            console.warn(error);
        }
    }

    registerWithOrderByChild(path, filedName, callback, dispatch) {
        try {
            const fb = firebase.database().ref(path).orderByChild(filedName);
            const value = fb.on('value', (data) => {
                callback(data, dispatch);
            });
            this.updateDicRegister(path, fb, value, 'value');
        } catch (error) {
            console.warn(error);
        }
    }

    unregister() {
        try {
            if (this.dicRegister) {
                for (const keyRegister in this.dicRegister) {
                    const objPath = this.dicRegister[keyRegister];
                    for (const key in objPath) {
                        const val = objPath[key];
                        val.ref.off(key, val.handler);
                    }
                }
                this.clearDicRegister();
            }
        } catch (error) {
            console.warn(error);
        }
    }
}

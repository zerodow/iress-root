import { EventEmitter } from 'fbemitter';

export const emitters = {};
export const dicData = {};

export function newEmitter(name) {
    emitters[name] = new EventEmitter();
}

export function addListener(name, nameEvent, callback, emitOldEvent = true) {
    if (!emitters[name]) newEmitter(name);
    const emit = emitters[name];
    const newNameEvent = nameEvent;
    const itemData = dicData[name] || {};
    const param = itemData[nameEvent];

    if (emit) {
        if (param) {
            if (emitOldEvent) {
                setTimeout(() => {
                    emit.emit(newNameEvent, param);
                }, 0);
            }
        }

        return emit.addListener(nameEvent, callback);
    }
    return null;
}

export function emit(name, nameEvent, param) {
    const emit = emitters[name];
    if (emit) {
        const itemData = dicData[name] || {};
        itemData[nameEvent] = param;
        dicData[name] = itemData;
        emit.emit(nameEvent, param);
    }
}

export function deleteEmitter(name) {
    delete emitters[name]
}

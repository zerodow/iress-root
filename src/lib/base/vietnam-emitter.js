import uuidv4 from 'react-native-uuid';
import clone from './vietname-clone';
const dicFunc = {};
const dicPTC = {};
const dicMidd = {};

export function getId() {
	return uuidv4();
}

export function addListener(event, id, cb) {
	if (!cb) return;
	if (!dicFunc[event]) dicFunc[event] = [];
	const idEvent = id || getId();
	if (dicFunc[event].find(item => item.id === idEvent)) return;
	dicFunc[event].push({
		id: idEvent,
		func: cb
	});
	return idEvent;
}

export function emit(event, data) {
	if (!dicFunc[event]) return;
	let newData = clone(data);
	if (dicMidd[event] && typeof dicMidd[event] === 'function') {
		newData = dicMidd[event](newData, data);
	}
	dicFunc[event].map(item => item.func(newData));
}

export function emitById(event, id, data) {
	if (!dicFunc[event]) return;
	let newData = clone(data);
	if (dicMidd[event] && typeof dicMidd[event] === 'function') {
		newData = dicMidd[event](newData, data);
	}
	dicFunc[event].map(item => item.func(newData));
	const objEmit = dicFunc[event].find(e => e.id === id)
	objEmit && objEmit.func && objEmit.func(newData)
}

export function setMiddleware(event, handleDataFunc) {
	if (!handleDataFunc) return;
	dicMidd[event] = handleDataFunc;
}

export function deleteListener(event, idEvent) {
	if (!dicFunc[event]) return;
	let index = -1;
	for (let i = 0; i < dicFunc[event].length; i++) {
		if (dicFunc[event][i].id === idEvent) {
			index = i;
			break;
		}
	}
	if (index !== -1) dicFunc[event].splice(index, 1);
}

export function deleteEvent(event) {
	delete dicFunc[event];
	delete dicMidd[event];
}

export function deleteEventById(event, id) {
	if (!dicFunc[event]) return
	const idx = dicFunc[event].findIndex(e => e.id === id)
	if (idx === -1) return
	dicFunc[event].splice(idx, 1);
}

export function deleteByIdEvent(idEvent) {
	if (!dicFunc) return;
	Object.keys(dicFunc).map(event => {
		deleteListener(event, idEvent);
	});
}

export function addChildPTC(parentID, childID, func) {
	dicPTC[parentID] = dicPTC[parentID] || [];
	if (dicPTC[parentID].find(a => a.childID === childID)) return;
	dicPTC[parentID].push({
		childID,
		func
	});
}

export function parentEmitPTC(parentID, param = {}, isPromise) {
	return new Promise(resolve => {
		if (!dicPTC[parentID]) return resolve();
		const listResul = dicPTC[parentID].map(item => item.func(clone(param)));
		return isPromise
			? Promise.all(listResul).then(resolve)
			: resolve(listResul);
	});
}

export function removeChildPTC(parentID, childID) {
	if (!dicPTC || !dicPTC[parentID]) return;

	let index = -1;
	for (let i = 0; i < dicPTC[parentID].length; i++) {
		if (dicPTC[parentID][i].childID === childID) {
			index = i;
			break;
		}
	}
	if (index !== -1) dicPTC[parentID].splice(index, 1);
}

import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '../streaming/streaming_business';

export const dicConnection = {
    appState: 'active',
    isConnected: null,
    screenId: null,
    getSnapshot: null,
    updateDrawer: null
}

export function checkNetworkConnecting(prevNetworkConnection, networkConnection) {
    setStateConnection(networkConnection);
    if (!prevNetworkConnection && networkConnection) {
        const channel = Channel.getChannelReconnectSSE('Account');
        reloadScreen();
        Emitter.emit(channel);
    }
};

export function unRegisterSnapshot(screenId) {
    if (dicConnection.screenId === screenId) {
        dicConnection.getSnapshot = null;
    }
}

export function reloadScreen() {
    dicConnection.getSnapshot && dicConnection.getSnapshot();
}

export function reloadDrawer(themename) {
    dicConnection.updateDrawer && dicConnection.updateDrawer(themename);
}

export function setScreenId(screenId) {
    dicConnection.screenId = screenId;
}

export function setAppState(nextAppState) {
    dicConnection.appState = nextAppState;
}

export function getAppState() {
    return dicConnection.appState;
}

export function setStateConnection(networkConnection) {
    dicConnection.isConnected = networkConnection;
}

export function getStateConnection() {
    return dicConnection.isConnected;
}

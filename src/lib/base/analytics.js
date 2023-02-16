import firebase from '../../firebase';
export function setCurrentScreen(screenName) {
    try {
        firebase.analytics().setCurrentScreen(screenName);
    } catch (error) {
        console.log(error);
    }
}
export function setUserId(userId) {
    try {
        firebase.analytics().setUserId(userId)
    } catch (error) {
        console.log(error);
    }
}

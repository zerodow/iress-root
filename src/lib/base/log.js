import firebase from '../../firebase';
export default function report(error, maxStackSize) {
    if (!error.code) error.code = 'code';
    // firebase.crash().report(error, maxStackSize)
}

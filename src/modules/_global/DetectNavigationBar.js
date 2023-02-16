import { NativeModules } from 'react-native';

/**
 * @description Check if navigation bar is hidden in android devices
 * (full screen gesture mode, also works with immersive mode).
 * List of functions / promise:
 * - getScreenHeight (Promise)
 * @example
 * DetectNavigationBar.getScreenHeight().then((height) => {
 *     console.log('Screen height: ', height);
 * });
 */
export default NativeModules.DetectNavigationBar;

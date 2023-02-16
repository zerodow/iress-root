yarn add react-native-navigation

# config ios

# currentLib='#import \"RCCManager.h\"'
# nextLib='#import \<ReactNativeNavigation\/ReactNativeNavigation.h\>'
# sed -i -e "s/$currentLib/$nextLib/g" ios/equix/AppDelegate.m

# currentCmd='\[\[RCCManager sharedInstance\] initBridgeWithBundleURL:jsCodeLocation\];'
# nextCmd='\[ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions\];'
# sed -i -e "s/$currentCmd/$nextCmd/g" ios/equix/AppDelegate.m

currentLibPath='react-native-navigation'
nextLibPath='react-native-navigation\/lib'
sed -i -e "s/$currentLibPath/$nextLibPath/g" ios/equix.xcodeproj/project.pbxproj

cp -r cicd/upgrade_RNNavigation/ios/AppDelegate.m ios/equix/AppDelegate.m

# config android
cp -r cicd/upgrade_RNNavigation/index.js ./
rm -rf index.android.js
rm -rf index.ios.js

cp -r cicd/upgrade_RNNavigation/android/build.gradle android/build.gradle
cp -r cicd/upgrade_RNNavigation/android/settings.gradle android/settings.gradle

cp -r cicd/upgrade_RNNavigation/android/app/.classpath android/app/.classpath
cp -r cicd/upgrade_RNNavigation/android/app/build.gradle android/app/build.gradle

cp -r cicd/upgrade_RNNavigation/android/app/MainActivity.java android/app/src/main/java/com/equix/MainActivity.java
cp -r cicd/upgrade_RNNavigation/android/app/MainApplication.java android/app/src/main/java/com/equix/MainApplication.java



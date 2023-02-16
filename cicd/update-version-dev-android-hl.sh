#!/usr/bin/env bash

nextId='hlib.app.com'
currentId='com.quantedge.equixnext'
sed -i -e "s/$currentId/$nextId/g" android/app/build.gradle


nextKeyStoreType='hl.keystore'
currentKeyStoreType='equixNext.jks'
sed -i -e "s/$currentKeyStoreType/$nextKeyStoreType/g" android/app/build.gradle

nextSign='hongleong' # add key jks
currentSign='equixNext'
sed -i -e "s/$currentSign/$nextSign/g" android/app/build.gradle

nextSignMain='hlib.app.com'
currentSignMain='com.quantedge.equixnext'
sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/AndroidManifest.xml
sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/java/com/equix/MainApplication.java

sed -i '' '/roundIcon/d' android/app/src/main/AndroidManifest.xml

currentCodePush='##codepushKeyAndroid##'
nextCodePush='wL6lyFgknYUMCA0_SiDzbkjEKLPy2QQQgHNlU'
sed -i -e "s/$currentCodePush/$nextCodePush/g" android/app/build.gradle

nextVersion="\1\"1.1.1\"" 
currentVersion="\(versionName \).*"
sed -i -e "s/$currentVersion/$nextVersion/g" android/app/build.gradle

nextBuildName="\1`date +%s`"
currentBuildName="\(versionCode \).*"
sed -i -e "s/$currentBuildName/$nextBuildName/g" android/app/build.gradle

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentAndroidVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentIosVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'HL_DEV',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'HL_DEV',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextName='Hong Leong'
currentName='Iress Mobile'
sed -i -e "s/$currentName/$nextName/g" android/app/src/main/res/values/strings.xml
rm -f android/app/src/main/res/values/strings.xml-e

nextLogoInApp="\1 'IRESS',"
currentLogoInApp="\(logoInApp:\).*"
sed -i -e "s/$currentLogoInApp/$nextLogoInApp/g" src/config.js

nextWebsite="\1 'novus-fintech.com',"
currentWebsite="\(website:\).*"
sed -i -e "s/$currentWebsite/$nextWebsite/g" src/config.js

nextUrlWebsite="\1 'https:\/\/www.novus-fintech.com',"
currentUrlWebsite="\(urlWebsite:\).*"
sed -i -e "s/$currentUrlWebsite/$nextUrlWebsite/g" src/config.js

nextChangeRegion="\1 true,"
currentChangeRegion="\(isChangeRegion:\).*"
sed -i -e "s/$currentChangeRegion/$nextChangeRegion/g" src/config.js

cp -rf config/LogoEquix_Iress_prod/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_Iress_prod/logo_in_app/logo.png src/img/background_mobile/

rm -rf android/app/src/main/res/mipmap-*

cp -rf config/Logo_HL_DEV/android/ android/app/src/main/res/

rm -f android/app/src/main/res/playstore-icon.png

cp -r config/RNnavigation/NavigationApplication.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/NavigationApplication.java
cp -r config/RNnavigation/NavigationReactGateway.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/react/NavigationReactGateway.java

cp -r android_config_iress_uat/google-services-hl.json android/app/google-services.json

# bitrise run qa
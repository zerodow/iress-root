#!/usr/bin/env bash
nextVersion="\1 = \"1.2.1\";" 
currentVersion="\(MARKETING_VERSION\).*"
sed -i -e "s/$currentVersion/$nextVersion/g" ios/equix.xcodeproj/project.pbxproj

nextBuildName="\1 = `date +%s`;"
currentBuildName="\(CURRENT_PROJECT_VERSION\).*"
sed -i -e "s/$currentBuildName/$nextBuildName/g" ios/equix.xcodeproj/project.pbxproj

currentCodePush='##codepushKeyIOS##'
nextCodePush='J0Qg6Igzmkm-yIqnUqHDKQXYT3hiIrsD5nsdo'
sed -i -e "s/$currentCodePush/$nextCodePush/g" ios/equix/Info.plist

currentName='OM Equix'
nextName='IRESS Mobile'
sed -i -e "s/$currentName/$nextName/g" ios/equix/Info.plist

currentId='com.quantedge.equix2'
nextId='com.iressv4.test'
sed -i -e "s/$currentId/$nextId/g" ios/equix.xcodeproj/project.pbxproj

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentAndroidVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentIosVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

# doi domain
nextLogChannnel="\1 'https:\/\/iress-dev-api.equix.app\/v1\/log\/data',"
currentLogChannel="\(logChanel:\).*"
sed -i -e "s/$currentLogChannel/$nextLogChannnel/g" src/config.js

nextEnv="\1 'IRESS_DEV2',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'IRESS_DEV',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextRealtimePortfolio="\1 true,"
currentRealtimePortfolio="\(enableRealtimePortfolioByMkt:\).*"
sed -i -e "s/$currentRealtimePortfolio/$nextRealtimePortfolio/g" src/config.js


nextAppName="\1 \"IRESS\","
currentAppName="\(\"appName\":\).*"
sed -i -e "s/$currentAppName/$nextAppName/g" src/modules/language/language_json/en.json
sed -i -e "s/$currentAppName/$nextAppName/g" src/modules/language/language_json/cn.json
sed -i -e "s/$currentAppName/$nextAppName/g" src/modules/language/language_json/vi.json


nextWebOn="\1 \"IRESS WEB ON\","
currentWebOn="\(\"equixWebOn\":\).*"
sed -i -e "s/$currentWebOn/$nextWebOn/g" src/modules/language/language_json/en.json
sed -i -e "s/$currentWebOn/$nextWebOn/g" src/modules/language/language_json/cn.json
sed -i -e "s/$currentWebOn/$nextWebOn/g" src/modules/language/language_json/vi.json

nextAppOn="\1 \"IRESS APP ON\","
currentAppOn="\(\"equixAppOn\":\).*"
sed -i -e "s/$currentAppOn/$nextAppOn/g" src/modules/language/language_json/en.json
sed -i -e "s/$currentAppOn/$nextAppOn/g" src/modules/language/language_json/vi.json
sed -i -e "s/$currentAppOn/$nextAppOn/g" src/modules/language/language_json/cn.json

nextLogoInApp="\1 'IRESS',"
currentLogoInApp="\(logoInApp:\).*"
sed -i -e "s/$currentLogoInApp/$nextLogoInApp/g" src/config.js

nextWebsite="\1 'novus-fintech.com',"
currentWebsite="\(website:\).*"
sed -i -e "s/$currentWebsite/$nextWebsite/g" src/config.js

nextUrlWebsite="\1 'https:\/\/www.novus-fintech.com',"
currentUrlWebsite="\(urlWebsite:\).*"
sed -i -e "s/$currentUrlWebsite/$nextUrlWebsite/g" src/config.js

currentTheme="FIXED_THEME = THEME.THEME1"
nextTheme="FIXED_THEME = THEME.DARK"
sed -i -e "s/$currentTheme/$nextTheme/g" src/theme/theme_controller.js

currentTheme="FIXED_THEME = THEME.THEME1"
nextTheme="FIXED_THEME = THEME.DARK"
sed -i -e "s/$currentTheme/$nextTheme/g" src/theme/theme_controller.js

cp -rf config/LogoEquix_Iress/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_Iress/splashscreen/Equix.png ios/equix/Images.xcassets/Equix.imageset/
cp -rf config/LogoEquix_Iress/logo_in_app/logo.png src/img/background_mobile/
cp -r ios_config_v4/GoogleService-Info.plist ios/GoogleService-Info.plist

rm -rf ios/equix/Images.xcassets/AppIcon.appiconset/
cp -rf config/LogoEquix_V4_Test/ios/AppIcon.appiconset/ ios/equix/Images.xcassets/AppIcon.appiconset/
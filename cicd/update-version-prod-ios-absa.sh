#!/usr/bin/env bash
nextVersion="\1 = \"1.1.0\";" 
currentVersion="\(MARKETING_VERSION\).*"
sed -i -e "s/$currentVersion/$nextVersion/g" ios/equix.xcodeproj/project.pbxproj

nextBuildName="\1 = `date +%s`;"
currentBuildName="\(CURRENT_PROJECT_VERSION\).*"
sed -i -e "s/$currentBuildName/$nextBuildName/g" ios/equix.xcodeproj/project.pbxproj

currentCodePush='##codepushKeyIOS##'
nextCodePush='4HdKckT_4fO-X4har8YJoNfeNevlTvNbcDPpy'
sed -i -e "s/$currentCodePush/$nextCodePush/g" ios/equix/Info.plist

currentName='OM Equix'
nextName='IRESS Mobile'
sed -i -e "s/$currentName/$nextName/g" ios/equix/Info.plist

currentId='com.quantedge.equix2'
nextId='za.co.absa.AbsaShareTradingApp.uat'
sed -i -e "s/$currentId/$nextId/g" ios/equix.xcodeproj/project.pbxproj

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentAndroidVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentIosVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

# doi domain
nextLogChannnel="\1 'https:\/\/iress-absa-api.equix.app\/v1\/log\/data',"
currentLogChannel="\(logChanel:\).*"
sed -i -e "s/$currentLogChannel/$nextLogChannnel/g" src/config.js

nextEnv="\1 'IRESS_ABSA',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'ABSA_PROD',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextRealtimePortfolio="\1 true,"
currentRealtimePortfolio="\(enableRealtimePortfolioByMkt:\).*"
sed -i -e "s/$currentRealtimePortfolio/$nextRealtimePortfolio/g" src/config.js

nextChangeRegion="\1 false,"
currentChangeRegion="\(isChangeRegion:\).*"
sed -i -e "s/$currentChangeRegion/$nextChangeRegion/g" src/config.js

nextLogoInApp="\1 'IRESS',"
currentLogoInApp="\(logoInApp:\).*"
sed -i -e "s/$currentLogoInApp/$nextLogoInApp/g" src/config.js

nextWebsite="\1 'novus-fintech.com',"
currentWebsite="\(website:\).*"
sed -i -e "s/$currentWebsite/$nextWebsite/g" src/config.js

nextUrlWebsite="\1 'https:\/\/www.novus-fintech.com',"
currentUrlWebsite="\(urlWebsite:\).*"
sed -i -e "s/$currentUrlWebsite/$nextUrlWebsite/g" src/config.js

currentTheme="FIXED_THEME = THEME.DARK"
nextTheme="FIXED_THEME = THEME.THEME1"
sed -i -e "s/$currentTheme/$nextTheme/g" src/theme/theme_controller.js

currentBusyBox="screens\/busybox\/busybox"
nextBusyBox="screens\/busybox\/busyboxAbsa"
sed -i -e "s/$currentBusyBox/$nextBusyBox/g" src/screens.js


cp -rf config/LogoEquix_Iress/logo_about_us/EQUIX-product-icon-06.png src/img/
# cp -rf config/LogoEquix_V6_Dev/splashscreen/Equix.png ios/equix/Images.xcassets/Equix.imageset/
cp -rf config/LogoEquix_Iress/logo_in_app/logo.png src/img/background_mobile/
cp -r  config_v6/GoogleService-Info.plist ios/GoogleService-Info.plist

rm -rf ios/equix/Images.xcassets/Equix.imageset/
cp -rf config/LogoEquix_V6_Dev/Equix.imageset/ ios/equix/Images.xcassets/Equix.imageset/

rm -rf ios/equix/Images.xcassets/AppIcon.appiconset/
cp -rf config/LogoEquix_V6_Dev/ios/AppIcon.appiconset/ ios/equix/Images.xcassets/AppIcon.appiconset/
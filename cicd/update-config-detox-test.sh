nextEnv="\1 true,"
currentEnv="\(isDetoxTest:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js
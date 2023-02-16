#!/usr/bin/env bash

currentCodePush='##codepushKeyIOS##'
currentCodePush1='NEvd3loP4tPKhUtFJBwiNijuuD-905d73241-3c54-4861-86b2-b372bea5f09e'
nextCodePush=''
sed -i -e \"s/$currentCodePush/$nextCodePush/g\" ios/equix/Info.plist
sed -i -e \"s/$currentCodePush1/$nextCodePush/g\" ios/equix/Info.plist
export CODE_SIGNING_REQUIRED=NO
git clone https://github.com/facebook/FBSimulatorControl.git
cd FBSimulatorControl
git checkout 4a3a339ca325ae2ac0b34fef92605204b79e0c09
./build.sh fbsimctl build output
PATH=$PATH:$(pwd)/output/bin
cd ..
npm run quick-test
rm -rf FBSimulatorControl/
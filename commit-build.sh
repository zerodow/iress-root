#!/usr/bin/env bash
path=${PWD}
fullPath=$path"/"
fullPath1=$path"/"
directory="equix"
directory1="equix-mobile"
username="build.bot"
password="quantedge"
res=https://$username:$password@gitlab.com/equix-au/equix.git
branch="master"

res1=https://$username:$password@gitlab.quant-edge.com/equix-au/equix-mobile.git

branch1="master"

fullPath+=$directory
fullPath1+=$directory1

rm -rf $fullPath1/

git clone -b $branch1 $res1
cd $directory1
rm -rf .git/
rm -f commit-build.sh
cd ..

if [ -d "$fullPath" ]; then
    cd $fullPath
    echo exist $fullPath
    # git pull <remote> <branchname>
    echo pull code project: $res branch: $branch
    git reset --hard
    git pull origin $branch
    cd ..
else
    # git clone -b <branch> <remote_repo>
    echo clone sub project: $res with branch: $branch
    git clone -b $branch $res
fi

cp -R $fullPath1/* $fullPath/
cd $fullPath
git add -A
git commit -a -m "commit build,[FULL BUILD]"
git push
exit 0
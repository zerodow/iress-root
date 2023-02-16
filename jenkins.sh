git reset --hard
git clean -f -d

git pull

yarn
yarn run build-web-script
yarn run iressv4_dev_codepush

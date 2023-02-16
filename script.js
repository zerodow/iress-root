const browserify = require('browserify');
const babelify = require('babelify');
const fs = require('fs');

const execFileSync = require('child_process').execFileSync;

const listPath = [];

function endsWith(str, search) {
	return str.indexOf(search, str.length - search.length) !== -1;
}

function handleWebFile() {
	const buf = execFileSync('find', ['./src']);
	const stdout = buf.toString();
	const file_list = stdout.split('\n');
	file_list.forEach((element) => {
		let arrFileSrc = element.split('/');
		const fullFileName = arrFileSrc.pop();
		const cwd = arrFileSrc.join('/');

		let arrFullFileName = fullFileName.split('.');
		const fileName = arrFullFileName[0];

		if (endsWith(fullFileName, '.web.js')) {
			listPath.push({ cwd, fileName });
		}
	});
}

function handleBundle(cb) {
	const listPromise = [];
	console.log(listPath);
	listPath.forEach(({ cwd, fileName }) => {
		listPromise.push(
			new Promise((resolve) => {
				const oldFile = cwd + '/' + fileName + '.web.js';
				const newFile = cwd + '/' + fileName + '.bundle.js';

				const fsStreamer = fs.createWriteStream(newFile);
				const b = browserify();

				b.add(oldFile);
				b.transform(babelify, { presets: ['@babel/preset-env'] });
				b.plugin('tinyify');
				b.bundle().pipe(fsStreamer).on('close', resolve);
			})
		);
	});
	Promise.all(listPromise).then(cb);
}

function convertToString() {
	listPath.forEach(({ cwd, fileName }) => {
		const pathFile = cwd + '/' + fileName + '.bundle.js';
		const fileAsString = fs.readFileSync(pathFile, {
			encoding: 'utf-8'
		});
		fs.writeFileSync(
			pathFile,
			`export default \`${encodeURI(fileAsString.toString())}\``
		);
		console.log(`done : ${pathFile} \n`);
		console.log('-------------');
	});
}

handleWebFile();

handleBundle(() => convertToString());

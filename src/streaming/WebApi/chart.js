class Chart {
	convertCsvToObject(csvString, { startLine, endLine }) {
		if (!csvString || startLine < endLine || startLine < 1) return null;
		const listLine = csvString.split('\\n');
		const startPosition = startLine ? startLine - 1 : 0;
		const endPosition = endLine || listLine.length;
		const listLineResul = listLine.slice(startPosition, endPosition);
		return this.convertLineStringToObject(listLineResul);
	}

	convertLineStringToObject(listLine = []) {
		try {
			const listObject = [];
			const listFieldFistLine = listLine[0].split(',');

			for (let i = 1; i < listLine.length; i++) {
				const listValue = listLine[i].split(',');
				if (listValue.length !== listFieldFistLine.length) continue;
				const item = {};
				for (let j = 0; j < listValue.length; j++) {
					const key = listFieldFistLine[j];
					const value = listValue[j];
					item[key] = value;
				}
				listObject.push(item);
			}
			return listObject;
		} catch (error) {
			return {};
		}
	}

	getIndex(snap) {
		const preStr = _.split(snap, 'Time,Open,High,Low,Close,Volume')[0];
		return _.size(_.split(preStr, '\\n'));
	}

	getCurrentTimezone() {
		return (-1 * new Date().getTimezoneOffset()) / 60;
	}

	handleOneCSV(snap) {
		if (snap && typeof snap === 'string') {
			const data = this.convertCsvToObject(snap, {
				startLine: this.getIndex(snap)
			});

			if (_.size(data) < 1) return null;

			const dataChart = {};

			_.forEach(
				data,
				({
					Time: time,
					Open: open,
					High: high,
					Close: close,
					Volume: volume,
					Low: low
				}) => {
					const timeStamp =
						this.getCurrentTimezone() * (60 * 60 * 1000);
					const timeUpdated =
						moment(time, ['DD/MM/YY HH:mm:ss.SSS']).valueOf() +
						timeStamp;
					if (!timeUpdated) return;

					dataChart[timeUpdated] = {
						updated: timeUpdated,
						open,
						high,
						close,
						volume,
						low
					};
				}
			);

			return dataChart;
		}
	}

	handleData(snap) {
		const result = {};
		if (snap && typeof snap === 'string') {
			const keySplit = 'Symbol,';
			const arrSnap = _.split(snap, keySplit);
			_.forEach(arrSnap, onceSnap => {
				let newStr = _.trim(onceSnap);
				if (!newStr) return;

				const symbol = _.split(newStr, '\\n')[0];
				newStr = keySplit + newStr;
				const data = this.handleOneCSV(newStr);
				data && (result[symbol] = data);
			});
		}
		cw.emit('chart.handleData', result);
	}
}

chart = new Chart();

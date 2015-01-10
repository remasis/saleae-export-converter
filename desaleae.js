var fs = require('fs');
var util = require('util');

console.log(process.argv[2]);
if (process.argv.length !== 4) {
	console.log("Usage: node <thisscript.js> file1 file2");
}

var file1, file2;
file1 = fs.readFileSync(process.argv[2], {
	encoding: 'utf-8'
});

file2 = fs.readFileSync(process.argv[3], {
	encoding: 'utf-8'
});

function fileToStruct(file, src) {
	var lines = file.split('\n');
	lines.shift(); //remove header
	lines.pop(); //remove empty newline
	// 'Time [s],Value,Parity Error,Framing Error'
	var entries = [];
	var lasttime = 0;
	lines.forEach(function(line, ind, array) {
		var linedata = line.split(',');
		var thistime = parseFloat(linedata[0]);
		var hex;

		if (thistime - lasttime > 0.004 || lasttime === 0) {
			//new entry
			entries.push({
				timeOffset: thistime,
				data: [],
				src: src
			});
		} else {
			//new data item in current entry
			hex = linedata[1].substr(linedata[1].indexOf('0x'), 4);
			entries[entries.length - 1].data.push(hex);
		}
		lasttime = thistime;
	});

	entries.forEach(function(entry, ind) {
		entry.data = new Buffer(entry.data);
	});
	return entries;
}

file1 = fileToStruct(file1, process.argv[2]);
file2 = fileToStruct(file2, process.argv[3]);

var alldata = file1.concat(file2);

alldata.sort(function(a, b) {
	return a.timeOffset - b.timeOffset;
});

alldata.forEach(function(item, ind) {
	/*	var line;
		if (item.src === process.argv[2]) {
			line = "\x1b[32m"; //grn
		} else {
			line = "\x1b[31m"; //red
		}
		console.log(line += item.data.toString().trim());
		*/
	console.log(item.src + '(' + item.timeOffset + '):\t' + item.data.toString().trim());
});

// console.log("\x1b[0m"); //reset color
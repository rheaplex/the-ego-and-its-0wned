const fs = require("fs");
const path = require('node:path');
const { parse } = require("csv-parse/sync");

const numColumns = 8;

// Time series
// 50 volts
// Ignore first 6 seconds.

const srcdir = "./recordings";
const destdir = "./app/data";

// https://docs.openbci.com/Cyton/CytonDataFormat/#interpreting-the-eeg-data
//const gain = 1;
//const scale = 4.5 / gain / (2^23 - 1);

const processFile = sourcefile => {
  const raw = fs.readFileSync(sourcefile);
  let rows = parse(
    raw,
    {
      columns: true,
      comment: "%",
      skip_empty_lines: true,
    }
  );

  rows = rows.map(row => ({
    timestamp: parseFloat(row[" Timestamp"].trim()),
    data: [
      parseFloat(row[' EXG Channel 0'].trim()),
      parseFloat(row[' EXG Channel 1'].trim()),
      parseFloat(row[' EXG Channel 2'].trim()),
      parseFloat(row[' EXG Channel 3'].trim()),
      parseFloat(row[' EXG Channel 4'].trim()),
      parseFloat(row[' EXG Channel 5'].trim()),
      parseFloat(row[' EXG Channel 6'].trim()),
      parseFloat(row[' EXG Channel 7'].trim()),
    ]}));

  const minValues = [9999999999, 9999999999, 9999999999, 9999999999, 9999999999, 9999999999, 9999999999, 9999999999];
  const maxValues = [0, 0, 0, 0, 0, 0, 0, 0];

  rows.forEach(row => {
    for (let i = 0; i < numColumns; i++) {
      const columnValue = row.data[i];
      if (columnValue < minValues[i]) {
        minValues[i] = columnValue;
      } else if (columnValue > maxValues[i]) {
        maxValues[i] = columnValue;
      }
    }
  });

  const scales = [];
  for (let i = 0; i < numColumns; i++) {
    scales[i] = 1.0 / (maxValues[i] - minValues[i]);
  }

  rows = rows.map(row => ({
    timestamp: row.timestamp,
    data: [
      (row.data[0] - minValues[0]) * scales[0],
      (row.data[1] - minValues[1]) * scales[1],
      (row.data[2] - minValues[2]) * scales[2],
      (row.data[3] - minValues[3]) * scales[3],
      (row.data[4] - minValues[4]) * scales[4],
      (row.data[5] - minValues[5]) * scales[5],
      (row.data[6] - minValues[6]) * scales[6],
      (row.data[7] - minValues[7]) * scales[7],
    ]}));

  return JSON.stringify(rows);
};

fs.readdirSync(srcdir).forEach(srcfilename => {
  const srcfilepath = path.join(srcdir, srcfilename);
  const data = processFile(srcfilepath);
  const destfilepath = path.join(
    destdir,
    `${path.basename(srcfilename, ".csv")}.json`
  );
  fs.writeFileSync(destfilepath, data);
});

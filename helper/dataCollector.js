const fs = require('fs');
const http = require('http');
const download = require('download-file')
const XLSX = require('xlsx');
const stringParser = require('./stringparser');

/*
  Downloads from the excel spreadsheet from the michigan.gov/lara website containing
  the full liquor price list.  Saves it as a csv and then returns the name of that csv.
  Make sure that you handle the thrown error when calling this class.
  TODO: make sure it downloads the most current version of the spreadsheet.
*/
exports.downloadFile = function(){
  //Get the current date to save into filename.
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth()+1; //January is 0!
  let year = date.getFullYear();
  let today = month + "_" + day + "_" + year;
  const filename = "liquorPrices_" + today + ".xlsx";//filename
  const filenameCSV = "liquorPrices_" + today + ".csv"
  //download the file and save as csv
  const testUrl2 = "https://www.michigan.gov/documents/lara/07_29_18_PRICE_BOOK_627422_7.xlsx";//TODO: make sure it downloads the most current version of the spreadsheet.
  const options = {
      filename: filename
  }

  //downloads file, not throws error unhandled
  //This code is not particularly efficent however it is going to be run infrequently and
  //the file is small enough the the multiple reads and writes don't matter performance wise.
  download(testUrl2, options, function(err){
      if (err) throw err
      let worksheet = XLSX.readFile(filename);
      XLSX.writeFile(worksheet, filenameCSV);
      console.log(stringParser.parseData(fs.readFileSync("./" + filenameCSV)));
  });

}

exports.downloadFile();

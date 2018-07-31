const fs = require('fs');
const http = require('http');
const download = require('download-file')

/*
  Downloads from the excel spreadsheet from the michigan.gov/lara website containing
  the full liquor price list.  Saves it as a csv and then returns the name of that csv.
  Make sure that you handle the thrown error when calling this class.
  TODO: make sure it downloads the most current version of the spreadsheet.
*/
exports.downloadFile = function(){
  //Get the current date to save into filename.
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth()+1; //January is 0!
  var year = date.getFullYear();
  var today = month + "_" + day + "_" + year;

  //download the file and save as csv
  const testUrl2 = "https://www.michigan.gov/documents/lara/07_29_18_PRICE_BOOK_627422_7.xlsx";//TODO: make sure it downloads the most current version of the spreadsheet.
  const options = {
      filename: "liquorPrices_" + today + ".csv"//filename
  }

  //downloads file, not throws error unhandled
  download(testUrl2, options, function(err){
      if (err) throw err
  })
  return "liquorPrices_" + today + ".csv";//returns filename
}

exports.downloadFile();

const fs = require('fs');
const http = require('http');
const https = require('https');
const mysql = require('mysql');
const express = require('express');
const request = require('request');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const stringParser = require('./stringparser');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dkbrifkvo759603",
  database: "statemin"
});

//TODO: under construction
function postAlcohol(alcohol){
  console.log(alcohol[0]);
  let sql = "INSERT into alcohol (alcoholType, michiganDistiller, ADAnum, liquorCode, brandName, iquorCode, brandName,  proof, sizeML, packSize, basePrice, licenseePrice, minimumShelfPrice, newChange) VALUES (??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??);";
  let inserts = [alcohol[0].alcoholType, alcohol[0].MichiganDistiller, alcohol[0].ADA, alcohol[0].liquorCode, alcohol[0].brandName, alcohol[0].proof, alcohol[0].size, alcohol[0].packSize, alcohol[0].basePrice, alcohol[0].licenseePrice, alcohol[0].minimumShelfPrice, alcohol[0].newChange];
  sql = mysql.format(sql, inserts);
  con.query(sql, function(err, result, fields) {});
}

/*
  Downloads from the excel spreadsheet from the michigan.gov/lara website containing
  the full liquor price list.  Saves it as a csv and then returns the name of that csv.
  Make sure that you handle the thrown error when calling this class.
  TODO: make sure it downloads the most current version of the spreadsheet.
*/
exports.downloadFile = function() {
  //Get the current date to save into filename.
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1; //January is 0!
  let year = date.getFullYear();
  let today = month + "_" + day + "_" + year;
  const filename = "liquorPrices_" + today + ".xlsx"; //filename
  const filenameCSV = "liquorPrices_" + today + ".csv"
  //download the file and save as csv
  const testUrl = "https://www.michigan.gov/documents/lara/07_29_18_PRICE_BOOK_627422_7.xlsx"; //TODO: make sure it downloads the most current version of the spreadsheet.

  //downloads file, not throws error unhandled
  //This code is not particularly efficent however it is going to be run infrequently and
  //the file is small enough the the multiple reads and writes don't matter performance wise.
  download(testUrl, filename, function(err) {
    if (err) throw err
    let worksheet = XLSX.readFile(filename);
    XLSX.writeFile(worksheet, filenameCSV);
    postAlcohol(stringParser.parseData(fs.readFileSync("./" + filenameCSV)));
  });
}

//downloads an https file asyncrynously with callback.
function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  });
}

exports.downloadFile();

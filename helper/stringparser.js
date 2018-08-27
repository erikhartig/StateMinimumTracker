const express = require('express');
const request = require('request');
const sjcl = require('sjcl');
const bodyParser = require('body-parser');
const fs = require('fs');

/*
  Helper function that returns true if a single character that is a capital or lower
  case letter is given.
*/
function isLetter(str) {
  return (str.length === 1 && str.match(/[a-z]/i));
}

/*
  This function takes a csv file of michigan minimum price info as a string and turns it
  into json objects, puts it in an array, and then returns it.
*/
exports.parseData = function(inputStr) {
  var ret = [];//init array to contain all parsed data
  let lines = String(inputStr).split(/\r?\n/);//splits the string by the new line character
  let alcoholType = "";//initialize empty alcohol type to be appended to all data
  let i;
  for (i = 2; i < lines.length; i++) {//iterates over all lines, skips first two lines as they are useless header data.
    //check if its a splitter line
    let line = lines[i];
    if (line.charAt(0) == ',' && line.charAt(1) == ',' && line.charAt(2) == ',') {//checks to see if line contains three consecutive commas, if so it is a useless filler line, so ignore.
      continue;
    }
    else if (line != null && line.charAt(0) != null) {//checks to make sure line isn't null
      var name;
      if (line.includes("\"")) {//checks to see if the line contains any quotation marks, these would indicate sections that contain commas that need to be pulled out before splitting.
        name = line.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);//regex selects all items enclosed by quotation marks.  Returns array containing all of the elements enclosed in quotation marks.
        let k;
        for (k = 0; k < name.length; k++) {//iterates over all found elements contained in quotation marks.
          line = line.replace(name[k], "placeholder" + k);//replaces the text in the quotation marks with a placedholder string ie. ...,"1,2,3",... = ...,placeholder0,...
        }
      }
      let split = line.split(',');//splets the csv by commas
      if (name != null) {//checks if any placeholders were used.
        for (k = 0; k < name.length; k++) {//iterates over all placeholder text saved.
          let replacement = name[k];
          for(sp in split){//iterates over all elements split apart to replace the placeholder text with original.  Note if for some reason 10 or more placeholders are used this will break.
            sp = sp.replace("placeholder" + k, replacement).replace(/(")/g, '');
          }
        }
      }
      let j;
      for (j = 0; j < split.length; j++) {
        if (split[j] == '') {//removes all empty string elements from split
          split.splice(j, 1);
          j--;
        } else if (!isLetter(split[j].toString().charAt(0))) {//If the element does not contain a letter as its first character remove spaces.
            split[j] = split[j].replace(/( )/g, '');
        }
      }

      //handles different formats of data entry and saves them into appropriate json objects.
      if (split.length == 9) {
        let data = {
          "alcoholType": alcoholType,
          "MichiganDistiller" : false,
          "ADA": split[0],
          "liquorCode": split[1],
          "brandName": split[2],
          "proof": split[3],
          "size": split[4],
          "packSize": split[5],
          "basePrice": split[6],
          "licenseePrice": split[7],
          "minimumShelfPrice": split[8]
        };
        ret.push(data);
      } else if (split.length == 10 && split[0] != "MI") {
        let data = {
          "alcoholType": alcoholType,
          "MichiganDistiller" : false,
          "ADA": split[0],
          "liquorCode": split[1],
          "brandName": split[2],
          "proof": split[3],
          "size": split[4],
          "packSize": split[5],
          "basePrice": split[6],
          "licenseePrice": split[7],
          "minimumShelfPrice": split[8],
          "new/change": split[9]
        };
        ret.push(data);
      } else if (split.length == 10 && split[0] == "MI"){
        let data = {
          "alcoholType": alcoholType,
          "MichiganDistiller" : true,
          "ADA": split[1],
          "liquorCode": split[2],
          "brandName": split[3],
          "proof": split[4],
          "size": split[5],
          "packSize": split[6],
          "basePrice": split[7],
          "licenseePrice": split[8],
          "minimumShelfPrice": split[9],
        };
        ret.push(data);
      }else if(split.length == 11 && split[0] == "MI"){
        let data = {
          "alcoholType": alcoholType,
          "MichiganDistiller" : true,
          "ADA": split[1],
          "liquorCode": split[2],
          "brandName": split[3],
          "proof": split[4],
          "size": split[5],
          "packSize": split[6],
          "basePrice": split[7],
          "licenseePrice": split[8],
          "minimumShelfPrice": split[9],
          "new/change": split[10]
        };
        ret.push(data);
      }else if (split.length == 1){//sets alcoholType
        alcoholType = split[0];
      } else {
        console.log(split);
      }
    }
  }
  return ret;
}

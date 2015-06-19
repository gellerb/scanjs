#!/usr/bin/env node
/*jshint node:true*/

// This script is for using scanjs server side

var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;
var JSZip = require("jszip");

var parser = require(__dirname + '/client/js/lib/acorn.js');
var ScanJS = require(__dirname + '/common/scan');

var signatures = JSON.parse(fs.readFileSync(__dirname + "/common/rules.json", "utf8"));
var createZip = false;
var ignoreFile = '.scanjsignore';
var ignoreContent = [];

ScanJS.parser(parser);
ScanJS.loadRules(signatures);

var argv = require('optimist').usage('Usage: $node scan.js -t [path/to/app] -o [resultFile.json] --zip --ignore [ignorefilename]').demand(['t']).argv;

var dive = function(dir, action) {
  if (typeof action !== 'function') {
    action = function(error, file) {
      console.log(">" + file);
    };
  }
  list = fs.readdirSync(dir);
  list.forEach(function(file) {
    var fullpath = dir + '/' + file;
    try {
      var stat = fs.statSync(fullpath);
    } catch (e) {
      console.log("SKIPPING FILE: Could not stat " + fullpath);
    }
    if (stat && stat.isDirectory()) {
      dive(fullpath, action);
    } else {
      action(file, fullpath);
    }
  });
};

var filePathToFileNameForZip = function(filename) {
  try {
    // enables integration of JSON results and the vulnerable ZIP in the Web GUI, linking filenames to fullpaths
    filename = filename.replace(/\\|\//g, "="); 
  } catch (e) {
    console.log("Error: filepath could not be converted to a valid filename for the zip.");
  }
  return filename;
};

var writeReport = function(results, name) {
  if(fs.existsSync(name)) {
    console.log("Error:output file already exists (" + name + "). Supply a different name using: -o [filename]");
  }
  fs.writeFile(name, JSON.stringify(results), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The scan results were saved to " + name);
    }
  });
};

var downloadZip = function(zipFile, filename) { //camel
  var buffer = zipFile.generate({
    type: "nodebuffer"
  });
  fs.writeFile(filename, buffer, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("The zip file containing vulnerable files was saved to " + filename);
    }
  });
};

var readIgnoreFile = function() {
  if (!fs.existsSync(ignoreFile)) {
    console.log("Error: Invalid Ignore File. Supply a valid ignore file using --ignore [ignoreFileName]");
    return;
  }
  ignoreContent = fs.readFileSync(ignoreFile, 'utf8').toString().split(/\r\n|\n/g).filter(function(e) {
    return e !== '';
  });;
  console.log("ignoreAst: " + JSON.stringify(ignoreContent, null, 2));
}

var parseIgnoreFile = function(){
  var i = 0;
  while( i < ignoreContent.length ){
    var stringToParse = ignoreContent[i];
    if(stringToParse.substring(0,2) == './'){
      stringToParse = "//" + stringToParse.substring(2);
      ignoreContent[i] = stringToParse;
      i++;
    }
    else if(stringToParse.substring(0,1) == '*'){
      stringToParse = stringToParse.substring(1);
      try{
        stringToParse = stringToParse.substring(0, stringToParse.indexOf('*'));
        ignoreContent[i] = stringToParse;
        i++;
      } catch(e){
        console.log("Error: only one instance of * found in ignore file");
        ignoreContent.splice(i,1);
      }
    }
    else if(stringToParse.substring(0,1) == '/'){
      ignoreContent[i] = stringToParse;
      i++;
    } else{
      ignoreContent.splice(i,1);
    } 
  }
  //DEBUG
  console.log(JSON.stringify(ignoreContent, null, 2));
}

var ignoreThisPath = function(filepath) {
  for (var i = 0; i < ignoreContent.length; i++) {
    var index = filepath.indexOf(ignoreContent[i]);
    if (index > -1) {
      if(ignoreContent[i].substring(0,1) == '/'){
        return index==0;
      }
      else {
        //DEBUG:
        console.log("filepath ignored: " + filepath);
        return true;
      }
    }
  }
  return false;
}

var zip = new JSZip();

if (typeof process != 'undefined' && process.argv[2]) {
  results = {};
  reportname = argv.o ? argv.o : 'scanresults';
  reportdir = reportname + "_files";
  createZip = argv.zip;
  ignoreFile = argv.ignore ? argv.ignore : '.scanjsignore';
  readIgnoreFile();
  parseIgnoreFile();
  if(fs.existsSync(reportname) || fs.existsSync(reportdir)) {
    console.log("Error:output file or dir already exists (" + reportname + "). Supply a different name using: -o [filename]");
  }
  else {
    fs.mkdirSync(reportdir);
    dive(argv.t, function(file, fullpath) {
      var ext = path.extname(file.toString());

      if(ext == '.js') {
        var content = fs.readFileSync(fullpath, 'utf8');
        //beautify source so result snippet is meaningful
        var content = beautify(content, { indent_size: 2 });

        var ast = parser.parse(content, { locations: true });
        // DEBUG
        console.log("file to scan: " + fullpath);
        if (!ignoreThisPath(fullpath)) {
          var scanresult = ScanJS.scan(ast, fullpath);

          if (scanresult.length > 0) {
            if (scanresult[0]["type"] == 'error') {
              console.log("SKIPPING FILE: Error in " + fullpath + ", at Line " + scanresult.error.loc.line + ", Column " + scanresult.error.loc.column + ": " + scanresult.error.message);
            }
            if (scanresult[0]["type"] == 'finding') {
              var fileToZipName = filePathToFileNameForZip(scanresult.filename);
              zip.file(fileToZipName, content);
            }
          }
          results[fullpath] = scanresult;
        } else {
          console.log("This file was ignored: " + fullpath);
        }
      }
    });
    // Flatten report file to remove files with no findings and tests with no results (i.e. empty arr)
    // TODO: Don't even store empty unless --overly-verbose or so..
    for (var testedFile in results) {
      for (var testCase in results[testedFile]) {
        if (results[testedFile][testCase].length == 0) {
          delete(results[testedFile][testCase]);
        }
      }
      if (Object.keys(results[testedFile]).length == 0) {
        delete(results[testedFile]);
      }
    }
    writeReport(results, reportname + '.JSON');
    if (createZip === true) {
      downloadZip(zip, reportname + '.zip');
    }
  }
} else {
  console.log('usage: $ node scan.js path/to/app ');
}
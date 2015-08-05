#!/usr/bin/env node
// COPYRIGHT (c) 2015 Joshua Bemenderfer
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Don't read this file. Inside you will find only horror. Don't code when frazzled at 9:00 P.M.
// I like inline conditionals. Don't hurt me please!

var fs = require("fs");
var path = require("path");
var argv = require("minimist")(process.argv.slice(2));

var exitWithHelp = function() {
  console.log([
  "    Usage: shadowify [--prefix=fa] /PATH/TO/CSS/FILE /PATH/TO/OUTPUT/CSS/FILE",
  "    Options:",
  "        -p, --prefix (fa)    Prefix (partial) class name. Expects icons to be named with [PREFIX]-ICONNAME",
  "        -d, --newdeep (false) Use the new >>> style deep selector instead of /deep/ ",
  ].join("\n"));
  process.exit(1);
}

if(argv.help || argv.h) {
  exitWithHelp();
}

// Set up command variables
var inputPath,
    outputPath,
    inputText,
    outputText,
    classPartial,
    deepCombinator,

inputPath = (function() {
  if(argv._[0] && typeof argv._[0] == "string") {
    return argv._[0];
  } else {
    console.log("[ERR] No input path specified.");
    exitWithHelp();
  }
})();

outputPath = (function() {
  if(argv._[1] && typeof argv._[1] == "string") {
    return argv._[1];
  } else {
    console.log("[ERR] No output path specified.");
    exitWithHelp();
  }
})();

inputText = (function() {
  try {
    return fs.readFileSync(path.resolve(inputPath), {encoding: "utf-8"});
  } catch (e) {
    console.log("[ERR] Input file not found or unreadable: '"+inputPath+"', exiting.");
    console.log(e.message);
    process.exit(1);
  }
})();

classPartial = argv.prefix ? argv.prefix : argv.p ? argv.p : "fa";
deepCombinator = !!argv.newdeep ? ">>>" : !!argv.d ? ">>>" : "/deep/";

console.log([
  "    Options:",
  "         Class Partial: "+classPartial,
  "         Deep Combinator: "+deepCombinator,
].join("\n"));

outputText = (function() {
  var substitution = "$1, * "+deepCombinator+" $1";

  var processSubstitution = function(input) {
    return substitution.split("$1").join(input);
  }
  
  var regex = "(\\."+classPartial+".*?)\\s*?{";
  return inputText.replace(new RegExp(regex, "g"), function(fullmatch, match1) {
    var splitmatch = match1.split(",");
    var result = [];
    
    if(splitmatch.length > 1) {
      splitmatch.forEach(function(item) {
        result.push(processSubstitution(item));
      })
      result = result.join(",");
      //console.log(result);
    } else {
      result = processSubstitution(splitmatch[0])
    }
    return result+" {";
  });
})();

try {
  fs.writeFileSync(path.resolve(outputPath), outputText);
  console.log("Conversion completed sucessfully. Output written to "+path.resolve(outputPath));
} catch (e) {
  console.log("[ERR] Unable to access or create output file, exiting.");
  console.log(e.message);
  process.exit(1);
}

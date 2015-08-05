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

// Universal Module Definition (UMD)
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD Define
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node (Not strict CommonJS)
        module.exports = factory();
    } else {
        // Browser global (root is window)
        root.Shadowify = factory();
  }
}(this, function () {
  // Actual code
  var Shadowify = function(input, classPartial, deepCombinator) {
    if(typeof deepCombinator != "string") {
      deepCombinator = !!deepCombinator ? ">>>" : "/deep/";
    }
    
    // The string that will replace the default selectors.
    var substitution = "$1, * " + deepCombinator + " $1";

    // Function to perform the substitution above.
    var substituteInput = function(input) {
      return substitution.split("$1").join(input);
    }
    
    // Should match pretty much every possible selector, but will fail on sub-nested selectors.
    var regex = "(\\." + classPartial + ".*?)\\s*?{";
    
    // Ugly function to perform the match
    return input.replace(new RegExp(regex, "g"), function(fullmatch, match1) {
      var splitmatch = match1.split(",");
      var result = [];
      
      // Entire lines may be matched, so split at commas.
      if(splitmatch.length > 1) {
        splitmatch.forEach(function(item) {
          result.push(substituteInput(item));
        })
        result = result.join(",");
      } else {
        result = substituteInput(splitmatch[0]);
      }
      
      return result + " {";
    });
  };
  return Shadowify;
}));

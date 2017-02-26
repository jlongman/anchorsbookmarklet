//  anchors.js
//  Created by J. Longman on 2016-07-27.
//  Copyright © 2016 J. Longman. All rights reserved.

// Anchors isolates linkable elements within webpages.  Browsers know how to directly navigate to the
// page position of these anchors, making it convenient for deep-linking within a webpage.

// This code is intended to run as an iOS app extension, but can be cut and paste into a browser (or possibly used
// as a bookmarklet) by entering the code then executing ExtensionPreprocessingJS.fun() on the console.

var AnchorExtensionJavaScriptClass = function () {
};

if (typeof(String.prototype.trim) === "undefined") {
  // we add the trim method, which surprisingly isn't always included.
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}

AnchorExtensionJavaScriptClass.prototype = {

  /**
   * run
   * @param arguments
   *
   * Process the current page looking for meaningful linkable elements. We examine three main types:
   * <ol>
   *   <li>Wikipedia's <code>span<code> elements which are useful</li>
   *   <li>Header (as in <code>&lt;H1&gt;</code>, etc) elements</li>
   *   <li>Anchors</li>
   * </ol>
   *
   * These are added as keys ("span", "header", "a", respectively) in an associative array with arrays as values
   * These sub-arrays contain a URI-encoded label followed by a tab, and then the URL for the label.
   *
   * The results also contain a key "baseURI" with a single URL as a value.
   *
   * Upon completion, the function contained in <code>arguments.completionFunction</code> is called back.
   *
   * This method meets the ExtensionJavaScriptClass prototype API.
   */
  run: function (arguments) {
    var results = {"baseURI": document.baseURI};

    var cleanBaseURI = document.baseURI;
    var lastSlash = cleanBaseURI.lastIndexOf('/');
    var lastHash = cleanBaseURI.lastIndexOf('#');
    if (lastHash > lastSlash) {
      // technically illegal, should be encoded, seen in practice
      cleanBaseURI = cleanBaseURI.substring(0, lastHash);
    }

    // special handling for wikipedia's anchor elements
    results["span"] = AnchorExtensionJavaScriptClass.parseWikipedia(document, cleanBaseURI);
    // support for HTML H* headers, probably useful
    results["header"] = AnchorExtensionJavaScriptClass.parseHeaders(document, cleanBaseURI);
    // The classic HTML anchor
    results["a"] = AnchorExtensionJavaScriptClass.parseAnchors(document, cleanBaseURI);

    arguments.completionFunction(results);
  },

  // Note that the finalize function is only available in iOS.

  /**
   * finalize
   * @param arguments
   *
   * Scroll the selectedId element into view in the iOS browser webpage.
   * Note this will be defeated by slow loading images.  TODO: ensure element is visible?
   *
   * This method meets the ExtensionJavaScriptClass prototype API.
   */
  finalize: function (arguments) {
    var el = document.getElementById(arguments["selectedId"]);
    if (el != null) {
      el.scrollIntoView();
    } else {
      var els = document.getElementsByName(arguments["selectedId"]);
      if (els != null && els.length > 0) {
        els[0].scrollIntoView();
      }
    }
  }

}
;


/**
 * completion
 * @param results associative array containing results
 *
 * Convenience static method to format the output array from the run method, and replace the current document
 * with contents.
 *
 * Input should be associative array containing key baseURI with a simple value,
 * then remaining keys should contain arrays.
 * Input array[s] are not modified.
 */
AnchorExtensionJavaScriptClass.completion = function (results) {
  var formatted = "<body>";
  for (var element in results) {
    formatted += "<h1>" + element + "</h1>";
    if (element === "baseURI") {
      // simple print
      formatted += "<a href=\"" + results[element] + "\">" + results[element] + "</a>";
    } else {
      // break out and decode list items
      formatted += "<ul>";
      for (var subelement in results[element]) {
        var compound = results[element][subelement];
        var label = decodeURI(compound.substring(0, compound.lastIndexOf('\t')));
        var url = compound.substring(compound.lastIndexOf('\t'), compound.length);
        formatted += "<li>";
        formatted += label;
        formatted += "<a href=\"" + url + "\">" + url + "</a>";
        formatted += "</li>";
      }
      formatted += "</ul>";
    }
  }
  formatted += "</body>";
  document.body.innerHTML = formatted;
};


/**
 * parseWikipedia
 * @param cleanBaseURI
 * @returns {Array} containing the link format, label<tab>url
 *
 * Knowing the wikipedia header/link span format, we search for these elements and pull them out.
 */
AnchorExtensionJavaScriptClass.parseWikipedia = function (document, cleanBaseURI) {
  var anchors = [];
  if (cleanBaseURI.includes("wikipedia")) {
    var links = document.getElementsByTagName("SPAN");
    // links = links.filter(function(link){!link.hasAttribute("id") && link.childNodes.length == 0});
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
      if (!link.hasAttribute("id")) continue;
      if (link.childNodes.length == 0) continue;

      var label = link.childNodes[0].nodeValue;
      if (label == null || label.length == 0) {
        // Sometimes there is a subnode with the actual
        label = link.childNodes[0].id;
      }
      label.trim();
      anchors.push(
        encodeURI(label)
        + "\t" +
        cleanBaseURI + "#" + link.getAttribute("id")
      );
    }
  }
  return anchors;
};

/**
 * parseHeaders
 * @param cleanBaseURI
 * @returns {Array} containing the link format, label<tab>url
 *
 * Headers are frequently linkable and useful as targets, but we only use headers with id's.
 */
AnchorExtensionJavaScriptClass.parseHeaders = function (document, cleanBaseURI) {
  var anchors = [];
  anchors.push(encodeURI(document.title.trim()) + "\t" + cleanBaseURI + "#"); // we add this page
  var links = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  //.filter(function(link){link.hasAttribute("id")});

  for (var i = 0; i < links.length; i++) {
    var link = links[i];

    if (!link.hasAttribute("id")) continue;
    var label = link.textContent ? link.textContent : "";
    label = label.trim();
    label = link.nodeName + " : " + label;
    label = label.trim();
    label = encodeURI(label);
    /*
     if (links[i].origin + links[i].pathname != self.location.href) {
     */
    anchors.push(label + "\t" +
      cleanBaseURI + "#" + link.getAttribute("id")
    );
  }
  return anchors;
};

/**
 * parseAnchors
 * @param cleanBaseURI
 * @returns {Array} containing the link format, label<tab>url
 *
 * Parse the classic anchor and id links for useful information.
 */
AnchorExtensionJavaScriptClass.parseAnchors = function (document, cleanBaseURI) {
  var anchors = [];
  var duplicateSet = new Set();
  var links = document.getElementsByTagName("A");
  for (var i = 0; i < links.length; i++) {
    var link = links[i];

    // if (!links[i].href) continue;
    //        if (!links[i].hash && !links[i].hasAttribute("name") && !links[i].hasAttribute("id")) continue;

    // get the linkable element
    var linkhref = link.href;
    if (linkhref.lastIndexOf('#') < 0 && !link.hash) {
      if (link.hasAttribute("name")) {
        linkhref = cleanBaseURI + "#" + link.getAttribute("name");
      } else if (link.hasAttribute("id")) {
        linkhref = cleanBaseURI + "#" + link.getAttribute("id");
      } else {
        // we can't link this without a name or id, skip
        continue;
      }
    }

    // try to provide as much context as possible.
    var label = link.nodeName + " - " + link.textContent ? link.textContent : "";

    if (label == null || label.length == 0) {
      if (linkhref.lastIndexOf('#') >= 0) {
        label = linkhref.substring(linkhref.lastIndexOf('#'), linkhref.length);
      }
    }
    label = label.trim();
    if (cleanBaseURI.includes("wikipedia.org") && label.length == 1) {
      // we skip single character labels, they're usually back-references
      continue;
    }

    label = encodeURI(label);
    var pushstring = label + "\t" + linkhref;
    if (!duplicateSet.has(pushstring)) {
      anchors.push(pushstring);
      duplicateSet.add(pushstring);
    }
  }
  return anchors;
};

/**
 * fun
 * @param arguments are ignored.
 *
 * Static method to replace current page with anchor elements, replicating iOS functionality.
 */
AnchorExtensionJavaScriptClass.fun = function (arguments) {
  var callback = AnchorExtensionJavaScriptClass.completion;
  var go = {"completionFunction": callback};
  AnchorExtensionJavaScriptClass.prototype.run.call(null, go);
};
debugger;
// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
var ExtensionPreprocessingJS = new AnchorExtensionJavaScriptClass;

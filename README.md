# anchorsbookmarklet
Seek out the anchors in a webpage

`anchors.js` is the core element of my iOS app extension that pulls out anchors and clickable links in a webpage.

The [bookmarklet](https://github.com/jlongman/anchorsbookmarklet/blob/master/anchors.bookmarklet) will allow you to do this to any page in a browser.  It replaces the page content with the span, header and anchor elements.  It is derived from anchor.js, after minification and adding the bookmarklet magic.  I.e. prefixed with `javascript:(function(){` and suffixed with `;AnchorExtensionJavaScriptClass.fun();})()`.  The `fun` method is unneccesary in the iOS app. 
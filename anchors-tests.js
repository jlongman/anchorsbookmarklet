/**
 * Created by longman on 2017-02-24.
 *
 * Some of the closures get sticky for values - strange that they aren't closed over properly.
 */

AnchorExtensionJavaScriptClass.tests = function (arguments) {
  const cleanURI = "https://jlongman.github.io";
  {
    // basic test
    const anchorlabel = "anchor";
    var mydocument = document.implementation.createHTMLDocument(anchorlabel);
    mydocument.body.innerHTML = "<a name=\"myName\" href=\"myHref\"></a>";
    const aanchors = AnchorExtensionJavaScriptClass.parseAnchors(mydocument, cleanURI);

    QUnit.test(anchorlabel + "-" + "basic", function (assert) {
      assert.equal(aanchors.length, 1);
      assert.ok(aanchors[0].indexOf('\t') > 0);
      var both = aanchors[0].split('\t');
      assert.equal(both.length, 2, "anchor length");
      var label = both[0];
      var link = both[1];

      assert.equal(link, cleanURI + "#myName", "link");
      assert.equal(label, "#myName", "label");
    });
  }

  {
    // basic test
    const headerLabel = "headers";
    var mydocument = document.implementation.createHTMLDocument(headerLabel);
    mydocument.body.innerHTML = "<h1 id=\"myHeaderName\">Visible Header</h1>";
    const banchors = AnchorExtensionJavaScriptClass.parseHeaders(mydocument, cleanURI);
    QUnit.test(headerLabel + "-" + "basic", function (assert) {
      assert.equal(banchors.length, 2, banchors);
      {
        // title link
        assert.ok(banchors[0].indexOf('\t') > 0, banchors[0]);
        var both = banchors[0].split('\t');
        assert.equal(both.length, 2, "anchor length");
        var label = both[0];
        var link = both[1];
        assert.equal(link, cleanURI + "#", "link: " + link);
        assert.equal(label, encodeURI(headerLabel), "label: " + label);

      }

      {
        assert.ok(banchors[1].indexOf('\t') > 0, banchors[1]);
        var both = banchors[1].split('\t');
        assert.equal(both.length, 2, "anchor length");
        var label = both[0];
        var link = both[1];

        assert.equal(link, cleanURI + "#myHeaderName", "link: " + link);
        assert.equal(label, encodeURI("H1 : Visible Header"), "label: " + label);
      }
    });
  }


  {
    // need linkable id
    const headerLabel = "invalidheaders";
    const mydocument = document.implementation.createHTMLDocument(headerLabel);
    mydocument.body.innerHTML = "<h1 >Visible Header</h1>";
    const bianchors = AnchorExtensionJavaScriptClass.parseHeaders(mydocument, cleanURI);
    QUnit.test(headerLabel + "-" + "invalid", function (assert) {
      assert.equal(bianchors.length, 1, bianchors);
      {
        // title link
        assert.ok(bianchors[0].indexOf('\t') > 0, bianchors[0]);
        var both = bianchors[0].split('\t');
        assert.equal(both.length, 2, "anchor length");
        var label = both[0];
        var link = both[1];
        assert.equal(link, cleanURI + "#", "link: " + link);
        assert.equal(label, encodeURI(headerLabel), "label: " + label);

      }


    });
  }

  {
    // basic test
    var wikiLabel = "wikipedia";
    var mydocument = document.implementation.createHTMLDocument(wikiLabel);
    mydocument.body.innerHTML = "<span class=\"mw-headline\" id=\"Services_and_facilities\">Services and facilities</span>";
    var canchors = AnchorExtensionJavaScriptClass.parseWikipedia(mydocument, "https://wikipedia.org");
    QUnit.test(wikiLabel + "-" + "basic", function (assert) {
      assert.equal(canchors.length, 1, canchors);

      {
        assert.ok(canchors[0].indexOf('\t') > 0, canchors[0]);
        var both = canchors[0].split('\t');
        assert.equal(both.length, 2, "anchor length");
        var label = both[0];
        var link = both[1];

        assert.equal(link, "https://wikipedia.org" + "#Services_and_facilities", "link: " + link);
        assert.equal(label, encodeURI("Services and facilities"), "label: " + label);
      }
    });
  }

  {
    // we don't do wikipedia scanning on non-wiki sites
    var wikiLabel2 = "notwikipedia";
    var mydocument = document.implementation.createHTMLDocument(wikiLabel2);
    mydocument.body.innerHTML = "<span class=\"mw-headline\" id=\"Services_and_facilities\">Services and facilities</span>";
    var cnanchors = AnchorExtensionJavaScriptClass.parseWikipedia(mydocument, cleanURI);
    QUnit.test(wikiLabel2 + "-" + "invalid", function (assert) {
      assert.equal(cnanchors.length, 0, cnanchors);

    });
  }
  {
    // nothing to link to without id
    var wikiLabel2 = "noidwikipedia";
    var mydocument = document.implementation.createHTMLDocument(wikiLabel2);
    mydocument.body.innerHTML = "<span class=\"mw-headline\" name=\"Services_and_facilities\">Services and facilities</span>";
    var cianchors = AnchorExtensionJavaScriptClass.parseWikipedia(mydocument, cleanURI);
    QUnit.test(wikiLabel2 + "-" + "invalid", function (assert) {
      assert.equal(cianchors.length, 0, cianchors);

    });
  }

  {
    // child nodes are used to determine label, need child nodes
    var wikiLabel2 = "nochildwikipedia";
    var mydocument = document.implementation.createHTMLDocument(wikiLabel2);
    mydocument.body.innerHTML = "<span class=\"mw-headline\" id=\"Services_and_facilities\"></span>";
    var ccanchors = AnchorExtensionJavaScriptClass.parseWikipedia(mydocument, cleanURI);
    QUnit.test(wikiLabel2 + "-" + "invalid", function (assert) {
      assert.equal(ccanchors.length, 0, ccanchors);

    });
  }


}
AnchorExtensionJavaScriptClass.tests();


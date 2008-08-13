/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.html.Element",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      var helper = document.createElement("div");
      document.body.appendChild(helper);

      this._doc = new qx.html.Root(helper);
      this._doc.setAttribute("id", "doc");
    },


    tearDown : function()
    {
      var div = document.getElementById("doc");
      document.body.removeChild(div);
    },


    testBasics : function()
    {
      //
      // BASICS
      //

      var el1 = new qx.html.Element;
      var el2a = new qx.html.Element;
      var el2b = new qx.html.Element;
      var el3a = new qx.html.Element;
      var el3b = new qx.html.Element;

      this.assertQxObject(el1);
      this.assertQxObject(el2a);
      // ...

      el1.setAttribute("id", "el1");
      el2a.setAttribute("id", "el2a");
      el2b.setAttribute("id", "el2b");
      el3a.setAttribute("id", "el3a");
      el3b.setAttribute("id", "el3b");

      this.assertIdentical(el1.getAttribute("id"), "el1");
      this.assertIdentical(el2a.getAttribute("id"), "el2a");
      // ...

      el1.add(el2a, el2b);
      el2a.add(el3a, el3b);
      this._doc.add(el1);

      el3a.setAttribute("html", "<b>hello</b>");

      this.assertIdentical(el3a.getAttribute("html"), "<b>hello</b>");

      el1.setStyle("color", "blue");
      el1.setStyle("width", "100px").setStyle("height", "100px");

      this.assertCssColor("blue", el1.getStyle("color"));
      this.assertIdentical("100px", el1.getStyle("width"));
      this.assertIdentical("100px", el1.getStyle("height"));

      qx.html.Element.flush();

      // DOM Structure Tests
      var pa = document.getElementById("el1");
      var ch1 = document.getElementById("el2a");
      var ch2 = document.getElementById("el2b");
      var ch3 = document.getElementById("el3a");
      var ch4 = document.getElementById("el3b");

      this.assertFalse(ch1===ch2);
      this.assertIdentical(ch1.parentNode, pa);
      this.assertIdentical(ch2.parentNode, pa);
      this.assertIdentical(ch3.parentNode, ch1);
      this.assertIdentical(ch4.parentNode, ch1);

      // Internal Structure Tests
      this.assertIdentical(el1.getChildren()[0], el2a);
      this.assertIdentical(el1.getChildren()[1], el2b);
      this.assertIdentical(el2a.getChildren()[0], el3a);
      this.assertIdentical(el2a.getChildren()[1], el3b);





      //
      // POSITIONED INSERT #1
      //

      this.assertIdentical(this._doc.getChildren()[0], el1);

      var before1 = new qx.html.Element;
      before1.setAttribute("id", "before1");
      before1.insertBefore(el1);

      var after1 = new qx.html.Element;
      after1.setAttribute("id", "after1");
      after1.insertAfter(el1);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], el1);
      this.assertIdentical(this._doc.getChildren()[2], after1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], after1.getDomElement());




      //
      // POSITIONED INSERT #2
      //

      var before2 = new qx.html.Element;
      before2.setAttribute("id", "before2");
      this._doc.addAt(before2, 0);

      var after2 = new qx.html.Element;
      after2.setAttribute("id", "after2");
      this._doc.addAt(after2, 10);

      this.assertIdentical(this._doc.getChildren()[0], before2);
      this.assertIdentical(this._doc.getChildren()[1], before1);
      this.assertIdentical(this._doc.getChildren()[2], el1);
      this.assertIdentical(this._doc.getChildren()[3], after1);
      this.assertIdentical(this._doc.getChildren()[4], after2);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after2.getDomElement());




      //
      // MOVE
      //

      before2.moveAfter(before1);
      after2.moveBefore(after1);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], before2);
      this.assertIdentical(this._doc.getChildren()[2], el1);
      this.assertIdentical(this._doc.getChildren()[3], after2);
      this.assertIdentical(this._doc.getChildren()[4], after1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], after2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after1.getDomElement());




      //
      // SWITCH
      //

      var in1 = this._doc.indexOf(before2);
      var in2 = this._doc.indexOf(after2);

      this.assertIdentical(in1, 1);
      this.assertIdentical(in2, 3);

      before2.moveTo(in2);
      after2.moveTo(in1);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], after2);
      this.assertIdentical(this._doc.getChildren()[2], el1);
      this.assertIdentical(this._doc.getChildren()[3], before2);
      this.assertIdentical(this._doc.getChildren()[4], after1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], after2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after1.getDomElement());





      //
      // REMOVE
      //

      this._doc.remove(before2);
      this._doc.remove(after2);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], el1);
      this.assertIdentical(this._doc.getChildren()[2], after1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], after1.getDomElement());




      // RE-ADD

      this._doc.add(before2, after2);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], el1);
      this.assertIdentical(this._doc.getChildren()[2], after1);
      this.assertIdentical(this._doc.getChildren()[3], before2);
      this.assertIdentical(this._doc.getChildren()[4], after2);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after2.getDomElement());




      // REMOVE, ADD, REMOVE, ADD
      // should be identical afterwards

      this._doc.remove(before2, after2);
      this._doc.add(before2, after2);
      this._doc.remove(before2, after2);
      this._doc.add(before2, after2);

      this.assertIdentical(this._doc.getChildren()[0], before1);
      this.assertIdentical(this._doc.getChildren()[1], el1);
      this.assertIdentical(this._doc.getChildren()[2], after1);
      this.assertIdentical(this._doc.getChildren()[3], before2);
      this.assertIdentical(this._doc.getChildren()[4], after2);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after2.getDomElement());





      // REMOVER, MOVE AND INSERT IN ONE STEP

      this._doc.remove(before2);
      before1.moveAfter(after1);
      before2.insertBefore(before1);

      this.assertIdentical(this._doc.getChildren()[0], el1);
      this.assertIdentical(this._doc.getChildren()[1], after1);
      this.assertIdentical(this._doc.getChildren()[2], before2);
      this.assertIdentical(this._doc.getChildren()[3], before1);
      this.assertIdentical(this._doc.getChildren()[4], after2);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], after2.getDomElement());

      /*
      BEFORE:        AFTER1:        AFTER2:        AFTER3:

      before1        before1        el1            el1
      el1            el1            after1         after1
      after1         after1         before1        before2
      before2        after2         after2         before1
      after2                                       after2
      */






      // SORT

      var a = this._doc.getChildren();
      for (var i=1, l=a.length; i<l; i++) {
        a[i].moveTo(0);
      }

      this.assertIdentical(this._doc.getChildren()[0], after2);
      this.assertIdentical(this._doc.getChildren()[1], before1);
      this.assertIdentical(this._doc.getChildren()[2], before2);
      this.assertIdentical(this._doc.getChildren()[3], after1);
      this.assertIdentical(this._doc.getChildren()[4], el1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], after2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], el1.getDomElement());







      // ROTATION

      before1.moveAfter(before2);

      this.assertIdentical(this._doc.getChildren()[0], after2);
      this.assertIdentical(this._doc.getChildren()[1], before2);
      this.assertIdentical(this._doc.getChildren()[2], before1);
      this.assertIdentical(this._doc.getChildren()[3], after1);
      this.assertIdentical(this._doc.getChildren()[4], el1);

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], after2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], before2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], before1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], after1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], el1.getDomElement());

    },



    testExclude : function()
    {
      this.info("Create five elements (2 hidden)");

      var el1 = new qx.html.Element;
      el1.setAttribute("id", "el1");

      var el2 = new qx.html.Element;
      el2.setAttribute("id", "el2");

      var el3 = new qx.html.Element;
      el3.setAttribute("id", "el3");

      var el4 = new qx.html.Element;
      el4.setAttribute("id", "el4");

      var el5 = new qx.html.Element;
      el5.setAttribute("id", "el5");


      this._doc.add(el1, el2, el3, el4, el5);

      el2.exclude();
      el4.exclude();

      qx.html.Element.flush();


      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], undefined);

      /**
       * Current:
       *
       * doc
       * - el1
       * - el3
       * - el5
       */




      this.info("Make simple hidden element visible");

      el2.include();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], undefined);

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el5
       */




      this.info("Make complex hidden element visible");

      var el4_1 = new qx.html.Element;
      el4_1.setAttribute("id", "el4_1");

      var el4_2 = new qx.html.Element;
      el4_2.setAttribute("id", "el4_2");
      el4_2.setStyle("color", "red");
      el4_2.setAttribute("text", "el4_2");
      el4_2.exclude();

      var el4_3 = new qx.html.Element;
      el4_3.setAttribute("id", "el4_3");

      el4.add(el4_1, el4_2, el4_3);

      el4.include();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el4.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[5], undefined);

      this.assertIdentical(this._doc.getDomElement().childNodes[3].firstChild, el4_1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].lastChild, el4_3.getDomElement());


      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el4
       *   - el4_1
       *   - el4_3
       * - el5
       */



      this.info("Show inner element");

      el4_2.include();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el4.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[5], undefined);

      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[0], el4_1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[1], el4_2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[2], el4_3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[3], undefined);


      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el4
       *   - el4_1
       *   - el4_2
       *   - el4_3
       * - el5
       */




      this.info("Internal move while hidden");

      el4.exclude();

      el4_3.moveTo(0);
      el4.remove(el4_2);

      el4_1.setStyle("fontSize", "20px");
      el4_1.setAttribute("text", "el4_1");

      el4.setStyle("backgroundColor", "#ccc");

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], undefined);

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el5
       */




      this.info("Internal move while hidden -> show again");

      el4.include();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el4.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[5], undefined);

      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[0], el4_3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[1], el4_1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3].childNodes[2], undefined);


      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el4
       *   - el4_3
       *   - el4_1
       * - el5
       */
    },


    testVisibility : function()
    {
      this.info("Create five elements (2 hidden)");

      var el1 = new qx.html.Element;
      el1.setAttribute("id", "el1");

      var el2 = new qx.html.Element;
      el2.setAttribute("id", "el2");

      var el3 = new qx.html.Element;
      el3.setAttribute("id", "el3");

      var el4 = new qx.html.Element;
      el4.setAttribute("id", "el4");

      var el5 = new qx.html.Element;
      el5.setAttribute("id", "el5");


      this._doc.add(el1, el2, el3, el4, el5);

      el2.hide();
      el4.hide();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], undefined);

      /**
       * Current:
       *
       * doc
       * - el1
       * - el3
       * - el5
       */



      this.info("Show one of the two hidden elements");

      el2.show();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], undefined);

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3
       * - el5
       */




      this.info("Hide a rendered element");

      el3.hide();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], undefined);
      this.assertIdentical(el3.getDomElement().style.display, "none");

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el3 (hidden)
       * - el5
       */





      this.info("Exclude & show together");

      el3.exclude();
      el3.show();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], undefined);
      this.assertIdentical(el3.getDomElement().style.display, "");

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2
       * - el5
       */




      this.info("Include one and hide another element");

      el3.include();
      el2.hide();

      qx.html.Element.flush();

      this.assertIdentical(this._doc.getDomElement().childNodes[0], el1.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[1], el2.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[2], el3.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[3], el5.getDomElement());
      this.assertIdentical(this._doc.getDomElement().childNodes[4], undefined);
      this.assertIdentical(el2.getDomElement().style.display, "none");
      this.assertIdentical(el3.getDomElement().style.display, "");

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2 (hidden)
       * - el3
       * - el5
       */
    },


    testResetStyles : function()
    {
      var el = new qx.html.Element();
      this._doc.add(el);

      qx.html.Element.flush();
      this.assertIdentical(el.getDomElement().style.backgroundColor, '');

      el.setStyle("backgroundColor", "green");

      qx.html.Element.flush();
      this.assertCssColor("green", el.getDomElement().style.backgroundColor);

      el.setStyle("backgroundColor", null);
      el.setStyle("backgroundColor", "yellow");

      qx.html.Element.flush();
      this.assertCssColor("yellow", el.getDomElement().style.backgroundColor);

      el.setStyle("backgroundColor", null);

      qx.html.Element.flush();
      this.assertIdentical(el.getDomElement().style.backgroundColor, "");
    }

  }
});

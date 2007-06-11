/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.test.Element",
{
  extend : testrunner.TestCase,

  members :
  {
    testBasics : function()
    {
      var helper = document.createElement("div");
      document.body.appendChild(helper);

      var doc = new qx.html2.Element(helper);




      //
      // BASICS
      //

      var el1 = new qx.html2.Element;
      var el2a = new qx.html2.Element;
      var el2b = new qx.html2.Element;
      var el3a = new qx.html2.Element;
      var el3b = new qx.html2.Element;

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

      el1.addList(el2a, el2b);
      el2a.addList(el3a, el3b);
      doc.add(el1);

      el3a.setHtml("<b>hello</b>");

      this.assertIdentical(el3a.getHtml(), "<b>hello</b>");

      el1.setStyle("color", "blue");
      el1.setPixelStyle("width", 100).setPixelStyle("height", 100);

      this.assertIdentical(el1.getStyle("color"), "blue");
      this.assertIdentical(el1.getPixelStyle("width"), 100);
      this.assertIdentical(el1.getPixelStyle("height"), 100);

      qx.html2.Element.flushQueue();

      // DOM Structure Tests
      var pa = document.getElementById("el1");
      var ch1 = document.getElementById("el2a");
      var ch2 = document.getElementById("el2b");
      var ch3 = document.getElementById("el3a");
      var ch4 = document.getElementById("el3b");

      this.assertFalse(ch1===ch2);
      this.assertTrue(ch1.parentNode===pa);
      this.assertTrue(ch2.parentNode===pa);
      this.assertTrue(ch3.parentNode===ch1);
      this.assertTrue(ch4.parentNode===ch1);

      // Internal Structure Tests
      this.assertTrue(el1.getChildren()[0] === el2a);
      this.assertTrue(el1.getChildren()[1] === el2b);
      this.assertTrue(el2a.getChildren()[0] === el3a);
      this.assertTrue(el2a.getChildren()[1] === el3b);





      //
      // POSITIONED INSERT #1
      //

      this.assertTrue(doc.getChildren()[0] === el1);

      var before1 = new qx.html2.Element;
      before1.setAttribute("id", "before1");
      doc.insertBefore(before1, el1);

      var after1 = new qx.html2.Element;
      after1.setAttribute("id", "after1");
      doc.insertAfter(after1, el1);

      this.assertTrue(doc.getChildren()[0] === before1);
      this.assertTrue(doc.getChildren()[1] === el1);
      this.assertTrue(doc.getChildren()[2] === after1);

      qx.html2.Element.flushQueue();

      this.assertTrue(doc.getElement().childNodes[0] === before1.getElement());
      this.assertTrue(doc.getElement().childNodes[1] === el1.getElement());
      this.assertTrue(doc.getElement().childNodes[2] === after1.getElement());




      //
      // POSITIONED INSERT #2
      //

      var before2 = new qx.html2.Element;
      before2.setAttribute("id", "before2");
      doc.insertAt(before2, 0);

      var after2 = new qx.html2.Element;
      after2.setAttribute("id", "after2");
      doc.insertAt(after2, 10);

      this.assertTrue(doc.getChildren()[0] === before2);
      this.assertTrue(doc.getChildren()[1] === before1);
      this.assertTrue(doc.getChildren()[2] === el1);
      this.assertTrue(doc.getChildren()[3] === after1);
      this.assertTrue(doc.getChildren()[4] === after2);

      qx.html2.Element.flushQueue();

      this.assertTrue(doc.getElement().childNodes[0] === before2.getElement());
      this.assertTrue(doc.getElement().childNodes[1] === before1.getElement());
      this.assertTrue(doc.getElement().childNodes[2] === el1.getElement());
      this.assertTrue(doc.getElement().childNodes[3] === after1.getElement());
      this.assertTrue(doc.getElement().childNodes[4] === after2.getElement());




      //
      // MOVE
      //

      doc.moveAfter(before2, before1);
      doc.moveBefore(after2, after1);

      this.assertTrue(doc.getChildren()[0] === before1);
      this.assertTrue(doc.getChildren()[1] === before2);
      this.assertTrue(doc.getChildren()[2] === el1);
      this.assertTrue(doc.getChildren()[3] === after2);
      this.assertTrue(doc.getChildren()[4] === after1);

      qx.html2.Element.flushQueue();

      this.assertTrue(doc.getElement().childNodes[0] === before1.getElement());
      this.assertTrue(doc.getElement().childNodes[1] === before2.getElement());
      this.assertTrue(doc.getElement().childNodes[2] === el1.getElement());
      this.assertTrue(doc.getElement().childNodes[3] === after2.getElement());
      this.assertTrue(doc.getElement().childNodes[4] === after1.getElement());
    }
  }
});
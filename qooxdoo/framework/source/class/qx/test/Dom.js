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

qx.Class.define("qx.test.Dom",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      var div = document.createElement("div");
      div.id = "html_basics"

      div.innerHTML =
        '<div id="test1">' +

        '<div id="test2"></div>' +

        '<div id="test3">' +
          '<div id="test4"></div>' +
        '</div>' +

        '</div>'

      document.body.appendChild(div);
    },


    tearDown : function()
    {
      var div = document.getElementById("html_basics");
      document.body.removeChild(div);
    },


    testIsDocument : function()
    {
      this.assertTrue(qx.dom.Node.isDocument(document));
      this.assertFalse(qx.dom.Node.isDocument(document.body));
      this.assertFalse(qx.dom.Node.isDocument(window));
    },


    testContains : function()
    {
      var test1 = document.getElementById("test1");
      var test2 = document.getElementById("test2");
      var test3 = document.getElementById("test3");
      var test4 = document.getElementById("test4");

      this.assertTrue(qx.dom.Hierarchy.contains(document, document.body));
      this.assertTrue(qx.dom.Hierarchy.contains(test1, test2));
      this.assertTrue(qx.dom.Hierarchy.contains(test1, test4));

      this.assertTrue(qx.dom.Hierarchy.contains(document, test2));
      this.assertTrue(qx.dom.Hierarchy.contains(document.body, test2));

      this.assertFalse(qx.dom.Hierarchy.contains(document.body, document));
      this.assertFalse(qx.dom.Hierarchy.contains(test2, test1));
      this.assertFalse(qx.dom.Hierarchy.contains(test4, test1));

      this.assertFalse(qx.dom.Hierarchy.contains(test2, document));
      this.assertFalse(qx.dom.Hierarchy.contains(test2, document.body));


      this.assertFalse(qx.dom.Hierarchy.contains(test2, test3));
      this.assertFalse(qx.dom.Hierarchy.contains(test2, test4));
    }



  }

});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Element_2",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.info("Create document");

      var doc = new qx.html.Root(document.getElementById("test"));
      doc.setAttribute("id", "doc");



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


      doc.add(el1, el2, el3, el4, el5);

      el2.exclude();
      el4.exclude();

      qx.html.Element.flush();



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
    }
  }
});

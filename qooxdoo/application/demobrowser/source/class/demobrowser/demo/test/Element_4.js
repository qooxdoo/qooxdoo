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

qx.Class.define("demobrowser.demo.test.Element_4",
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

      el2.hide();
      el4.hide();

      qx.html.Element.flush();


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

      /**
       * Current:
       *
       * doc
       * - el1
       * - el2 (hidden)
       * - el3
       * - el5
       */
    }
  }
});

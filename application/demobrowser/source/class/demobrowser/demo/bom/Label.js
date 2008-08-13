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

qx.Class.define("demobrowser.demo.bom.Label",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var label1 = qx.bom.Label.create("Quite a long label text");
      label1.style.border = "1px solid red";
      label1.style.width = "80px";
      document.body.appendChild(label1);

      var pref = qx.bom.Label.getTextSize("Quite a long label text");
      this.debug("Preferred Label1 Size: " + pref.width + "x" + pref.height);



      var label2 = qx.bom.Label.create("This is <b>bold</b> text", true);
      label2.style.border = "1px solid red";
      label2.style.width = "80px";
      document.body.appendChild(label2);

      var pref = qx.bom.Label.getHtmlSize("This is <b>bold</b> text");
      this.debug("Preferred Label2 Size: " + pref.width + "x" + pref.height);

      var pref = qx.bom.Label.getHtmlSize("This is <b>bold</b> text", null, 80);
      this.debug("Preferred Label2 Size (HeightForWidth): " + pref.width + "x" + pref.height);



      var t1 = "hello world";
      var t2 = "foo bar";
      var clazz = qx.bom.Label;
      var start = new Date;
      for (var i=0; i<500; i++) {
        clazz.getTextSize(i%2?t1:t2);
      }
      var stop = new Date;
      this.debug("Runtime to measure 500 text blocks: " + (stop-start) + "ms");



      var h1 = "hello <b>world</b>";
      var h2 = "foo <i>bar</i>";
      var clazz = qx.bom.Label;
      var start = new Date;
      for (var i=0; i<500; i++) {
        clazz.getHtmlSize(i%2?h1:h2);
      }
      var stop = new Date;
      this.debug("Runtime to measure 500 html blocks: " + (stop-start) + "ms");
    }
  }
});

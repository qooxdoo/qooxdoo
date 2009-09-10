/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.HeaderSimple",
{
  extend : qx.application.Standalone,

  /*
  *
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      var layout = new qx.ui.layout.HBox(2);
      var container = new qx.ui.container.Composite(layout);
      var doc = this.getRoot();

      doc.add(container, {left: 10, top : 20});


      var header1 = new demobrowser.demo.virtual.RowHeader("Foo");
      var header2 = new demobrowser.demo.virtual.RowHeader("Bar");

      container.add(header1);
      container.add(header2);
    }
  }
});

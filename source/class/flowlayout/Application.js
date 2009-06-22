/* ************************************************************************

   qooxdoo - the new era of web development
   http://qooxdoo.org

   Copyright:
     2008 Dihedrals.com, http://www.dihedrals.com

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Chris Banford (zermattchris)

************************************************************************ */

/* ************************************************************************

#asset(flowlayout/*)

************************************************************************ */

/**
 * Simple demo app that uses FlowLayout.
 */
qx.Class.define("flowlayout.Application",
{
  extend : qx.application.Standalone,



  /*
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

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */
	  var fl = new flowlayout.FlowLayout();
	  // Change a few things on how the FlowLayout displays its children...
	  fl.setAlignX( "center" );	// Align children to the X axis of the container (left|center|right)
	  //fl.setReversed( true );	// draws children elements in reverse order.
      var container = new qx.ui.container.Composite( fl );
	  

      var button1 = new qx.ui.form.Button("1. First Button", "flowlayout/test.png");
      container.add(button1);

      var button2 = new qx.ui.form.Button("2. Second longer Button...", "flowlayout/test.png");
      // Have this child create a break in the current Line (next child will always start a new Line)
      container.add(button2, {lineBreak: true});


      var button3 = new qx.ui.form.Button("3rd really, really, really long Button", "flowlayout/test.png");
      button3.setHeight(100);  // tall button
      container.add(button3);

      var button4 = new qx.ui.form.Button("Number 4", "flowlayout/test.png");
      button4.setAlignY("bottom");
      container.add(button4);


      var button5 = new qx.ui.form.Button("20px Margins around the great big 5th button!");
      button5.setHeight(100);  // tall button
      button5.setMargin(20);
      container.add(button5, {lineBreak: true});		// Line break after this button.

      var button6 = new qx.ui.form.Button("Number 6", "flowlayout/test.png");
      button6.setAlignY("middle");	// Align this child to the vertical center of this line.
      container.add(button6);


      var button7 = new qx.ui.form.Button("7th a wide, short button", "flowlayout/test.png");
      button7.setMaxHeight(20);  // short button
      container.add(button7);


      this.getRoot().add(container, {edge: 0});
    }
  }
});

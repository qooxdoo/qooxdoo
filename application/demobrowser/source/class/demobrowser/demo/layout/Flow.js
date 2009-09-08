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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/48/devices/computer.png)

************************************************************************ */

/**
 * Simple demo app that uses FlowLayout.
 */
qx.Class.define("demobrowser.demo.layout.Flow",
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
      this.base(arguments);

      this._createGalleryWindow(20, 20);
      this._createLineBreakWindow(160, 50);
    },


    _createGalleryWindow : function(left, top)
    {
      var win = new qx.ui.window.Window("Flow Layout").set({
        contentPadding: 0,
        width: 200
      });
      win.setLayout(new qx.ui.layout.Grow());

      var scroller = new qx.ui.container.Scroll();
      win.add(scroller);

      var container = new qx.ui.container.Composite(new qx.ui.layout.Flow()).set({
        allowShrinkY: false
      });
      scroller.add(container);

      for (var i=0; i<30; i++)
      {
        container.add(new qx.ui.basic.Atom("item #" + (i+1), "icon/48/devices/computer.png").set({
          iconPosition: "top",
          width: 60,
          padding: 5
        }));
      }

      win.moveTo(left, top);
      win.open();
    },


    _createLineBreakWindow : function(left, top)
    {
      var fl = new qx.ui.layout.Flow();
      fl.setAlignX( "center" ); // Align children to the X axis of the container (left|center|right)
      //fl.setReversed( true ); // draws children elements in reverse order.

      var container = new qx.ui.window.Window("Flow Layout with line breaks").set({
        contentPadding: 0,
        width: 500,
        height: 200,
        layout: fl
      });


      var icon = "icon/48/devices/computer.png";

      var button1 = new qx.ui.form.Button("1. First Button", icon);
      container.add(button1);

      var button2 = new qx.ui.form.Button("2. Second longer Button...", icon);
      // Have this child create a break in the current Line (next child will always start a new Line)
      container.add(button2, {lineBreak: true});


      var button3 = new qx.ui.form.Button("3rd really, really, really long Button", icon);
      button3.setHeight(100);  // tall button
      container.add(button3);

      var button4 = new qx.ui.form.Button("Number 4", icon);
      button4.setAlignY("bottom");
      container.add(button4);


      var button5 = new qx.ui.form.Button("20px Margins around the great big 5th button!");
      button5.setHeight(100);  // tall button
      button5.setMargin(20);
      container.add(button5, {lineBreak: true});    // Line break after this button.

      var button6 = new qx.ui.form.Button("Number 6", icon);
      button6.setAlignY("middle");  // Align this child to the vertical center of this line.
      container.add(button6);


      var button7 = new qx.ui.form.Button("7th a wide, short button", icon);
      button7.setMaxHeight(20);  // short button
      container.add(button7);


      container.moveTo(left, top);
      container.open();
    }
  }
});

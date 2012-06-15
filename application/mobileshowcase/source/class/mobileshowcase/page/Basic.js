/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing all basic widgets available:
 * - Labels
 * - Atoms
 * - Images
 * - Buttons
 * - Enabled / Disabled state
 */
qx.Class.define("mobileshowcase.page.Basic",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Basic Widgets");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // BASIC WIDGET CHANGE MENU
      this.getContent().add(new qx.ui.mobile.form.Title("Widget Modes"));

      // TOGGLE BUTTON
      var toggleEnableButton = new qx.ui.mobile.form.ToggleButton(true,"Enable","Disable", 11);

      toggleEnableButton.addListener("changeValue", function(e) {
        exImage.toggleEnabled();
        exToggleButton.toggleEnabled();
        exLabel.toggleEnabled();
        exButton.toggleEnabled();
        exAtomLeft.toggleEnabled();
        exAtomRight.toggleEnabled();
        exAtomTop.toggleEnabled();
        exAtomBottom.toggleEnabled();
      }, this);


      // TOGGLE LABEL WRAP BUTTONT
      var toggleLabelWrapButton = new qx.ui.mobile.form.ToggleButton(true,"Wrap","Ellipsis", 11);
      toggleLabelWrapButton.addListener("changeValue", function(e) {
        exLabel.toggleWrap();
      }, this);

      // WIDGETS 4 EXAMPLE
      var exButton = new qx.ui.mobile.form.Button("Button");

      var exToggleButton = new qx.ui.mobile.form.ToggleButton(false);

      var labelText = "qx.Mobile is qooxdoo's mobile framework. It provides specific UI classes for touch devices, handling of mobile events like swiping, and specific styling. It is suitable for various mobile web browsers on iOS and Android platforms.";

     /* var labelText = "Mobile theme: "+qx.core.Environment.get("qx.theme");
      labelText += " <br>Device Type: "+qx.core.Environment.get("device.type");
      labelText += " <br>Operation system: "+qx.core.Environment.get("os.name");
      labelText += " <br>OS version: "+qx.core.Environment.get("os.version");
      labelText += " <br>Browser: "+qx.core.Environment.get("browser.name");
      labelText += " <br>Browser version: "+qx.core.Environment.get("browser.version");*/

      var exLabel = new qx.ui.mobile.basic.Label(labelText);
      exLabel.addCssClass("space-top");

      var exImage = new qx.ui.mobile.basic.Image("mobileshowcase/icon/arrowleft.png");

      // ATOMS
      var positions = [ "left", "right", "top", "bottom" ]

      var iconSrc = "mobileshowcase/icon/camera.png";
      var exAtomLeft = new qx.ui.mobile.basic.Atom("Icon Position: left", iconSrc);
      exAtomLeft.setIconPosition(positions[0]);
      exAtomLeft.addCssClass("space-top");

      var exAtomRight = new qx.ui.mobile.basic.Atom("Icon Position: right", iconSrc);
      exAtomRight.setIconPosition(positions[1]);
      exAtomRight.addCssClass("space-top");

      var exAtomTop = new qx.ui.mobile.basic.Atom("Icon Position: top", iconSrc);
      exAtomTop.setIconPosition(positions[2]);
      exAtomTop.addCssClass("space-top");

      var exAtomBottom = new qx.ui.mobile.basic.Atom("Icon Position: bottom", iconSrc);
      exAtomBottom.setIconPosition(positions[3]);
      exAtomBottom.addCssClass("space-top");

      // BUILD VIEW
      this.getContent().add(toggleEnableButton);
      this.getContent().add(toggleLabelWrapButton);

      this.getContent().add(new qx.ui.mobile.form.Title("Button"));
      this.getContent().add(exButton);

      this.getContent().add(new qx.ui.mobile.form.Title("ToggleButton"));
      this.getContent().add(exToggleButton);

      this.getContent().add(new qx.ui.mobile.form.Title("Label"));

      this.getContent().add(exLabel);

      this.getContent().add(new qx.ui.mobile.form.Title("Image"));
      this.getContent().add(exImage);

      this.getContent().add(new qx.ui.mobile.form.Title("Atoms"));
      this.getContent().add(exAtomLeft);
      this.getContent().add(exAtomTop);
      this.getContent().add(exAtomRight);
      this.getContent().add(exAtomBottom);
    },


    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});
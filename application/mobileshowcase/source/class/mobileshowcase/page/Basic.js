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
 * - Collapsible
 * - Enabled / Disabled state
 */
qx.Class.define("mobileshowcase.page.Basic",
{
  extend : mobileshowcase.page.Abstract,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Basic Widgets");
    this._widgets = [];
  },


  members :
  {

    _widgets : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // BASIC WIDGET CHANGE MENU
      this.getContent().add(new qx.ui.mobile.form.Title("Widget Modes"));

      // TOGGLE BUTTON
      var toggleEnableButton = new qx.ui.mobile.form.ToggleButton(true, "ON", "OFF");
      toggleEnableButton.addListener("changeValue", function(e) {
        for (var i = 0; i < this._widgets.length; i++) {
          this._widgets[i].toggleEnabled();
        }
      }, this);


      // TOGGLE LABEL WRAP BUTTON
      var toggleLabelWrapButton = new qx.ui.mobile.form.ToggleButton(true, "ON", "OFF");
      toggleLabelWrapButton.addListener("changeValue", function(e) {
        exLabel.toggleWrap();
      }, this);

      // EXAMPLE WIDGETS
      var exButton = new qx.ui.mobile.form.Button("Button");

      var exToggleButton = new qx.ui.mobile.form.ToggleButton(false);

      var labelText = "qx.Mobile is a sophisticated HTML5 framework. It provides specific UI widgets for touch devices, handling of mobile events like swiping, custom theming and much more. It is suitable for mobile web browsers on platforms such as Android, iOS, WP8 or BlackBerry 10.";

      var exLabel = new qx.ui.mobile.basic.Label(labelText);
      exLabel.addCssClass("space-top");

      var exImage = new qx.ui.mobile.basic.Image("mobileshowcase/icon/mobile.png");

      // ATOMS
      var positions = [ "top", "left", "right", "bottom" ];
      var iconSrc = "mobileshowcase/icon/mobile.png";
      var atomGroup = new qx.ui.mobile.form.Group();
      for (var i = 0; i < positions.length; i++) {
        var atomExample = new qx.ui.mobile.basic.Atom("Icon Position: " + positions[i], iconSrc);
        atomExample.setIconPosition(positions[i]);
        atomGroup.add(atomExample);
        this._widgets.push(atomExample);
      }

      var exCollapsible = this._createCollapsible();

      this._widgets.push(exButton);
      this._widgets.push(exToggleButton);
      this._widgets.push(exLabel);
      this._widgets.push(exImage);
      this._widgets.push(exCollapsible);

      // BUILD VIEW
      var form = new qx.ui.mobile.form.Form();
      form.add(toggleEnableButton, "Enable");
      form.add(toggleLabelWrapButton, "Wrap");
      var formWidget = new qx.ui.mobile.form.renderer.Single(form);
      qx.bom.element.Style.set(formWidget.getContentElement(), "padding", "0.625rem");
      this.getContent().add(formWidget);


      this.getContent().add(new qx.ui.mobile.form.Title("Button"));
      var buttonGroup = new qx.ui.mobile.form.Group([exButton], false);
      this.getContent().add(buttonGroup);

      this.getContent().add(new qx.ui.mobile.form.Title("ToggleButton"));

      var toggleButtonGroup = new qx.ui.mobile.form.Group;
      toggleButtonGroup.add(exToggleButton);
      this.getContent().add(toggleButtonGroup);

      this.getContent().add(new qx.ui.mobile.form.Title("Label"));
      this.getContent().add(new qx.ui.mobile.form.Group([exLabel]));
      this.getContent().add(new qx.ui.mobile.form.Title("Image"));
      this.getContent().add(new qx.ui.mobile.form.Group([exImage], false));
      this.getContent().add(new qx.ui.mobile.form.Title("Collapsible"));
      this.getContent().add(new qx.ui.mobile.form.Group([exCollapsible], false));
      this.getContent().add(new qx.ui.mobile.form.Title("Atoms"));
      this.getContent().add(atomGroup);
    },


    _createCollapsible : function() {
      var collapsible = new qx.ui.mobile.container.Collapsible("Collapsible Header");
      var label = new qx.ui.mobile.basic.Label("This is the content of the Collapsible.");
      collapsible.add(label);
      return collapsible;
    }
  }
});

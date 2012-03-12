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
 * Mobile page responsible for showing the all basic widgets available:
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
      
      
      this.getContent().add(new qx.ui.mobile.form.Title("Button"));
      this.getContent().add(new qx.ui.mobile.form.Button("Button"));
      
      this.getContent().add(new qx.ui.mobile.form.Title("ToggleButton"));
      this.getContent().add(new qx.ui.mobile.form.ToggleButton(false));
      
      this.getContent().add(new qx.ui.mobile.form.Title("Label"));
      this.getContent().add(new qx.ui.mobile.basic.Label("A text label"));
      
      this.getContent().add(new qx.ui.mobile.form.Title("Image"));
      this.getContent().add(new qx.ui.mobile.basic.Image("../build/resource/qx/mobile/icon/android/checkbox-green.png"));
      
    },


    // overridden
    _back : function()
    {
     qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});
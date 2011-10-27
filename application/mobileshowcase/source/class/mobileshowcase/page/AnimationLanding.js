/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * Mobile page responsible for showing the landing page for the "animation" showcase.
 */
qx.Class.define("mobileshowcase.page.AnimationLanding",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Animation");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },

  properties :
  {
    /**
     * The current animaton.
     */
    animation :
    {
      check : "String",
      init : ""
    }
  },

  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var embed = new qx.ui.mobile.embed.Html('<strong>Tap "back" button for the reverse animation</strong>');
      this.getContent().add(embed);
    },


    // overridden
    _back : function()
    {
     qx.ui.mobile.navigation.Manager.getInstance().executeGet("/animation", {animation:this.getAnimation(), reverse:true});
    }
  }
});
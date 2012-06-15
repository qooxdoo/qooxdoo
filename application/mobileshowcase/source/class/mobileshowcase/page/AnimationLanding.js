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
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

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
    this.setShowBackButtonOnTablet(true);
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
    __landingText : '<strong>Tap "back" button for the reverse animation</strong>',

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var embed = new qx.ui.mobile.embed.Html(this.__landingText);

      if(this._isTablet) {
        qx.event.Registration.addListener(this, "appear", this.__deactiveAnimation, this);
      }

      this.getContent().add(embed);
    },


    /**
     * Deactivates the animation on parentContainer's layout.
     */
    __deactiveAnimation : function() {
      this.getLayoutParent().getLayout().setShowAnimation(false);
    },


    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/animation", {animation:this.getAnimation(), reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function() {
       this._disposeObjects("__landingText");
    }
  }
});
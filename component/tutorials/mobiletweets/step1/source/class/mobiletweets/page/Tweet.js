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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * This page displays a single tweet.
 */
qx.Class.define("mobiletweets.page.Tweet",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function() {
    this.base(arguments);
    this.set({
      title : "Details",
      showBackButton : true,
      backButtonText : "Back"
    });
  },


  properties:
  {
    /** Holds the current shown tweet */
    tweet :
    {
      check : "Object",
      nullable : true,
      init : null,
      event : "changeTweet"
    }
  },

  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);
      // Create a new label instance
      var label = new qx.ui.mobile.basic.Label();
      this.getContent().add(label);
      // bind the "tweet.getText" property to the "value" of the label
      this.bind("tweet.text", label, "value");
    }
  }
});
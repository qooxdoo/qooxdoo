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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.container.Scroller",
{
  extend : qx.ui.mobile.container.Composite,
  include : [ qx.ui.mobile.core.MChildrenHandling, qx.ui.mobile.core.MLayoutHandling],


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    cssClass :
    {
      refine : true,
      init : "scroller"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContainerElement : function()
    {
      var element = this.base(arguments);
      var scrollerElement = this._createScrollerElement();
      if (scrollerElement) {
        element.appendChild(scrollerElement);
      }
      return element;
    },


    // overridden
    _getContentElement : function()
    {
      var contentElement = this.base(arguments);
      var scrollerContentElement = this._getScrollerContentElement();
      return scrollerContentElement || contentElement;
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    // TODO: Move this somewere else
    if (qx.core.Variant.isSet("qx.mobile.nativescroll", "off"))
    {
      qx.Class.include(statics, qx.ui.mobile.container.MIScroll);
    } else {
      qx.Class.include(statics, qx.ui.mobile.container.MNativeScroll);
    }
  }
});

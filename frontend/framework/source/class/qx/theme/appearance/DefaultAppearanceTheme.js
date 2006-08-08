/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(appearancethemes)
#require(qx.manager.object.SingletonManager)

// HACK temporary:
// we need to ignore these, appearance theme should be fixed to
// not use widget checks.
#optional(qx.ui.tree.AbstractTreeElement)
#optional(qx.ui.treefullcontrol.AbstractTreeElement)

************************************************************************ */

qx.OO.defineClass("qx.theme.appearance.DefaultAppearanceTheme", qx.renderer.theme.AppearanceTheme,
function(vTitle) {
  qx.renderer.theme.AppearanceTheme.call(this, vTitle || "qooxdoo default appearance");
});




qx.Proto._appearances = qx.lang.Object.carefullyMergeWith(
{
  /*
  ---------------------------------------------------------------------------
    CORE
  ---------------------------------------------------------------------------
  */

  "image" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        allowStretchX : false,
        allowStretchY : false
      }
    }
  },

  "client-document" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
      this.color = new qx.renderer.color.ColorObject("windowtext");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.bgcolor,
        color : this.color,
        hideFocus : true,
        enableElementFocus : false
      }
    }
  },

  "blocker" :
  {
    initial : function(vWidget, vTheme)
    {
      // You could also use: "static/image/dotted_white.gif" for example as backgroundImage here
      // (Visible) background tiles could be dramatically slow down mshtml!
      // A background image or color is always needed for mshtml to block the events successfully.
      return {
        cursor : qx.constant.Core.DEFAULT,
        backgroundImage : "static/image/blank.gif"
      }
    }
  },

  "atom" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        spacing : 4,
        width : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO,
        horizontalChildrenAlign : qx.constant.Layout.ALIGN_CENTER,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE,
        stretchChildrenOrthogonalAxis : false,
        allowStretchY : false,
        allowStretchX : false
      }
    }
  },

  "label" :
  {
    setup : function()
    {
      this.color_disabled = new qx.renderer.color.ColorObject("graytext");
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    },

    initial : function(vWidget, vTheme)
    {
      return {
        font: this.font,
        wrap : false
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        color : vStates.disabled ? this.color_disabled : null
      }
    }
  },

  "htmlcontainer" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "label");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "label");
    }
  },

  "popup" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO
      }
    }
  },

  "tool-tip" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("InfoBackground");
      this.color = new qx.renderer.color.ColorObject("InfoText");
    },

    initial : function(vWidget, vTheme)
    {
      vWidget.setStyleProperty(qx.constant.Style.PROPERTY_FILTER, "progid:DXImageTransform.Microsoft.Shadow(color='Gray', Direction=135, Strength=4)");

      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "popup"), {
        backgroundColor : this.bgcolor,
        color : this.color,
        border : qx.renderer.border.BorderPresets.info,
        paddingTop : 1,
        paddingRight : 3,
        paddingBottom : 2,
        paddingLeft : 3
      });
    }
  },

  "iframe" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.inset
      }
    }
  },






  /*
  ---------------------------------------------------------------------------
    BUTTON
  ---------------------------------------------------------------------------
  */

  "button" :
  {
    setup : function()
    {
      this.bgcolor_default = new qx.renderer.color.ColorObject("buttonface");
      this.bgcolor_over = new qx.renderer.color.Color("#87BCE5");
      this.bgcolor_left = new qx.renderer.color.Color("#FFF0C9");

      this.border_pressed = qx.renderer.border.BorderPresets.inset;
      this.border_default = qx.renderer.border.BorderPresets.outset;
    },

    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "atom");
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vReturn = {
        backgroundColor : vStates.abandoned ? this.bgcolor_left : vStates.over ? this.bgcolor_over : this.bgcolor_default,
        border : vStates.pressed || vStates.checked || vStates.abandoned ? this.border_pressed : this.border_default
      }

      if (vStates.pressed || vStates.abandoned)
      {
        vReturn.paddingTop = 4;
        vReturn.paddingRight = 3;
        vReturn.paddingBottom = 2;
        vReturn.paddingLeft = 5;
      }
      else
      {
        vReturn.paddingTop = vReturn.paddingBottom = 3;
        vReturn.paddingRight = vReturn.paddingLeft = 4;
      }

      return vReturn;
    }
  },








  /*
  ---------------------------------------------------------------------------
    TOOLBAR
  ---------------------------------------------------------------------------
  */

  "toolbar" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.thinOutset,
        backgroundColor : this.bgcolor,
        height : qx.constant.Core.AUTO
      }
    }
  },

  "toolbar-part" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : qx.constant.Core.AUTO
      }
    }
  },

  "toolbar-part-handle" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 10
      }
    }
  },

  "toolbar-part-handle-line" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        top : 2,
        left : 3,
        bottom : 2,
        width : 4,
        border : qx.renderer.border.BorderPresets.thinOutset
      }
    }
  },

  "toolbar-separator" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 8
      }
    }
  },

  "toolbar-separator-line" :
  {
    setup : function()
    {
      var b = this.border = new qx.renderer.border.BorderObject;

      b.setLeftColor("threedshadow");
      b.setRightColor("threedhighlight");

      b.setLeftStyle(qx.renderer.border.Border.STYLE_SOLID);
      b.setRightStyle(qx.renderer.border.Border.STYLE_SOLID);

      b.setLeftWidth(1);
      b.setRightWidth(1);
      b.setTopWidth(0);
      b.setBottomWidth(0);
    },

    initial : function(vWidget, vTheme)
    {
      return {
        top : 2,
        left: 2,
        width : 2,
        bottom : 2,
        border : this.border
      }
    }
  },

  "toolbar-button" :
  {
    setup : function()
    {
      this.bgcolor_default = new qx.renderer.color.ColorObject("buttonface");
      this.bgcolor_left = new qx.renderer.color.Color("#FFF0C9");

      this.border_pressed = qx.renderer.border.BorderPresets.thinInset;
      this.border_over = qx.renderer.border.BorderPresets.thinOutset;
      this.border_default = null;

      this.checked_background = "static/image/dotted_white.gif";
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        spacing : 4,
        width : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vReturn =
      {
        backgroundColor : vStates.abandoned ? this.bgcolor_left : this.bgcolor_default,
        backgroundImage : vStates.checked && !vStates.over ? this.checked_background : null
      }

      if (vStates.pressed || vStates.checked || vStates.abandoned) {
        vReturn.border = this.border_pressed;
      } else if (vStates.over) {
        vReturn.border = this.border_over;
      } else {
        vReturn.border = this.border_default;
      }

      if (vStates.pressed || vStates.checked || vStates.abandoned)
      {
        vReturn.paddingTop = 3;
        vReturn.paddingRight = 2;
        vReturn.paddingBottom = 1;
        vReturn.paddingLeft = 4;
      }
      else if (vStates.over)
      {
        vReturn.paddingTop = vReturn.paddingBottom = 2;
        vReturn.paddingLeft = vReturn.paddingRight = 3;
      }
      else
      {
        vReturn.paddingTop = vReturn.paddingBottom = 3;
        vReturn.paddingLeft = vReturn.paddingRight = 4;
      }

      return vReturn;
    }
  },







  /*
  ---------------------------------------------------------------------------
    BAR VIEW
  ---------------------------------------------------------------------------
  */

  "bar-view" :
  {
    setup : function()
    {
      this.background = new qx.renderer.color.ColorObject("#FAFBFE");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.background,
        border : qx.renderer.border.BorderPresets.shadow
      }
    }
  },

  "bar-view-pane" :
  {
    state : function(vWidget, vTheme, vStates)
    {
      switch(vWidget.getParent().getBarPosition())
      {
        case qx.constant.Layout.ALIGN_TOP:
        case qx.constant.Layout.ALIGN_BOTTOM:
          return {
            width : null,
            height : qx.constant.Core.FLEX
          }

        case qx.constant.Layout.ALIGN_LEFT:
        case qx.constant.Layout.ALIGN_RIGHT:
          return {
            width : qx.constant.Core.FLEX,
            height : null
          }
      }
    }
  },

  "bar-view-page" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        left : 10,
        right : 10,
        top : 10,
        bottom : 10
      }
    }
  },

  "bar-view-bar" :
  {
    setup : function()
    {
      this.background_color = new qx.renderer.color.ColorObject("#E1EEFF");

      this.border_color = new qx.renderer.color.ColorObject("threedshadow");

      this.border_top = new qx.renderer.border.BorderObject;
      this.border_top.setBottom(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);

      this.border_bottom = new qx.renderer.border.BorderObject;
      this.border_bottom.setTop(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);

      this.border_left = new qx.renderer.border.BorderObject;
      this.border_left.setRight(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);

      this.border_right = new qx.renderer.border.BorderObject;
      this.border_right.setLeft(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.background_color
      }
    },

    state : function(vWidget, vTheme, vState)
    {
      switch(vWidget.getParent().getBarPosition())
      {
        case qx.constant.Layout.ALIGN_TOP:
          return {
            paddingTop : 1,
            paddingRight : 0,
            paddingBottom : 1,
            paddingLeft : 0,

            border : this.border_top,
            height : qx.constant.Core.AUTO,
            width : null,
            orientation : qx.constant.Layout.ORIENTATION_HORIZONTAL
          }

        case qx.constant.Layout.ALIGN_BOTTOM:
          return {
            paddingTop : 1,
            paddingRight : 0,
            paddingBottom : 1,
            paddingLeft : 0,

            border : this.border_bottom,
            height : qx.constant.Core.AUTO,
            width : null,
            orientation : qx.constant.Layout.ORIENTATION_HORIZONTAL
          }

        case qx.constant.Layout.ALIGN_LEFT:
          return {
            paddingTop : 0,
            paddingRight : 1,
            paddingBottom : 0,
            paddingLeft : 1,

            border : this.border_left,
            height : null,
            width : qx.constant.Core.AUTO,
            orientation : qx.constant.Layout.ORIENTATION_VERTICAL
          }

        case qx.constant.Layout.ALIGN_RIGHT:
          return {
            paddingTop : 0,
            paddingRight : 1,
            paddingBottom : 0,
            paddingLeft : 1,

            border : this.border_right,
            height : null,
            width : qx.constant.Core.AUTO,
            orientation : qx.constant.Layout.ORIENTATION_VERTICAL
          }
      }
    }
  },

  "bar-view-button" :
  {
    setup : function()
    {
      this.background_color_normal = null;
      this.background_color_checked = new qx.renderer.color.ColorObject("#FAFBFE");

      this.border_color = new qx.renderer.color.ColorObject("threedshadow");
      this.border_color_checked = new qx.renderer.color.ColorObject("#FEC83C");

      this.border_top_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);
      this.border_top_checked.setBottom(3, qx.renderer.border.Border.STYLE_SOLID, this.border_color_checked);

      this.border_bottom_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);
      this.border_bottom_checked.setTop(3, qx.renderer.border.Border.STYLE_SOLID, this.border_color_checked);

      this.border_left_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);
      this.border_left_checked.setRight(3, qx.renderer.border.Border.STYLE_SOLID, this.border_color_checked);

      this.border_right_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, this.border_color);
      this.border_right_checked.setLeft(3, qx.renderer.border.Border.STYLE_SOLID, this.border_color_checked);
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "atom"), {
        iconPosition : qx.constant.Layout.ALIGN_TOP
      });
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vBarPosition = vWidget.getView().getBarPosition();

      var vReturn =
      {
        backgroundColor : vStates.checked ? this.background_color_checked : this.background_color_normal,
        allowStretchX : true,
        allowStretchY : true
      }

      if (vStates.checked || vStates.over)
      {
        switch(vBarPosition)
        {
          case qx.constant.Layout.ALIGN_TOP:
            vReturn.border = this.border_top_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 1;
            vReturn.paddingLeft = 6;
            break;

          case qx.constant.Layout.ALIGN_BOTTOM:
            vReturn.border = this.border_bottom_checked;
            vReturn.paddingTop = 1;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 6;
            break;

          case qx.constant.Layout.ALIGN_LEFT:
            vReturn.border = this.border_left_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 4;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 6;
            break;

          case qx.constant.Layout.ALIGN_RIGHT:
            vReturn.border = this.border_right_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 4;
        }
      }
      else
      {
        vReturn.border = null;
        vReturn.paddingTop = vReturn.paddingBottom = 4;
        vReturn.paddingRight = vReturn.paddingLeft = 7;
      }

      switch(vBarPosition)
      {
        case qx.constant.Layout.ALIGN_TOP:
        case qx.constant.Layout.ALIGN_BOTTOM:
          vReturn.marginTop = vReturn.marginBottom = 0;
          vReturn.marginRight = vReturn.marginLeft = 1;
          vReturn.width = qx.constant.Core.AUTO;
          vReturn.height = null;
          break;

        case qx.constant.Layout.ALIGN_LEFT:
        case qx.constant.Layout.ALIGN_RIGHT:
          vReturn.marginTop = vReturn.marginBottom = 1;
          vReturn.marginRight = vReturn.marginLeft = 0;
          vReturn.height = qx.constant.Core.AUTO;
          vReturn.width = null;
      }

      return vReturn;
    }
  },









  /*
  ---------------------------------------------------------------------------
    WINDOW
  ---------------------------------------------------------------------------
  */

  "window" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
      this.color = new qx.renderer.color.ColorObject("windowtext");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.bgcolor,
        color : this.color,
        paddingTop : 1,
        paddingRight : 1,
        paddingBottom : 1,
        paddingLeft : 1
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        border : vStates.maximized ? qx.renderer.border.BorderPresets.none : qx.renderer.border.BorderPresets.outset
      }
    }
  },

  "window-captionbar" :
  {
    setup : function()
    {
      this.bgcolor_active = new qx.renderer.color.ColorObject("activecaption");
      this.color_active = new qx.renderer.color.ColorObject("captiontext");
      this.bgcolor_inactive = new qx.renderer.color.ColorObject("inactivecaption");
      this.color_inactive = new qx.renderer.color.ColorObject("inactivecaptiontext");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        paddingTop : 1,
        paddingRight : 2,
        paddingBottom : 2,
        paddingLeft : 2,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE,
        height : qx.constant.Core.AUTO,
        overflow : qx.constant.Style.OVERFLOW_HIDDEN
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        backgroundColor : vStates.active ? this.bgcolor_active : this.bgcolor_inactive,
        color : vStates.active ? this.color_active : this.color_inactive
      }
    }
  },

  "window-resize-frame" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.shadow
      }
    }
  },

  "window-captionbar-icon" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        marginRight : 2
      }
    }
  },

  "window-captionbar-title" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
      this.font.setBold(true);
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        font : this.font,
        marginRight : 2,
        wrap : false
      }
    }
  },

  "window-captionbar-button" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "button");
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vReturn = vTheme.stateFrom(vWidget, "button");

      if (vStates.pressed || vStates.abandoned)
      {
        vReturn.paddingTop = 2;
        vReturn.paddingRight = 1;
        vReturn.paddingBottom = 0;
        vReturn.paddingLeft = 3;
      }
      else
      {
        vReturn.paddingTop = vReturn.paddingBottom = 1;
        vReturn.paddingRight = vReturn.paddingLeft = 2;
      }

      return vReturn;
    }
  },

  "window-captionbar-minimize-button" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "window-captionbar-button");
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "window-captionbar-button");
    }
  },

  "window-captionbar-restore-button" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "window-captionbar-button");
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "window-captionbar-button");
    }
  },

  "window-captionbar-maximize-button" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "window-captionbar-button");
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "window-captionbar-button");
    }
  },

  "window-captionbar-close-button" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "window-captionbar-button"), {
        marginLeft : 2
      });
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "window-captionbar-button");
    }
  },

  "window-statusbar" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.thinInset,
        height : qx.constant.Core.AUTO
      }
    }
  },

  "window-statusbar-text" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        paddingTop : 1,
        paddingRight : 4,
        paddingBottom : 1,
        paddingLeft : 4,
        cursor : qx.constant.Core.DEFAULT
      }
    }
  },










  /*
  ---------------------------------------------------------------------------
    MENU
  ---------------------------------------------------------------------------
  */

  "menu" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("menu");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        width : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO,
        backgroundColor : this.bgcolor,
        border : qx.renderer.border.BorderPresets.outset,
        paddingTop : 1,
        paddingRight : 1,
        paddingBottom : 1,
        paddingLeft : 1
      }
    }
  },

  "menu-layout" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
      }
    }
  },

  "menu-button" :
  {
    setup : function()
    {
      this.BGCOLOR_OVER = new qx.renderer.color.ColorObject("highlight");
      this.BGCOLOR_OUT = null;

      this.COLOR_OVER = new qx.renderer.color.ColorObject("highlighttext");
      this.COLOR_OUT = null;
    },

    initial : function(vWidget, vTheme)
    {
      return {
        minWidth : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO,
        spacing : 2,
        paddingTop : 2,
        paddingRight : 4,
        paddingBottom : 2,
        paddingLeft : 4,
        cursor : qx.constant.Core.DEFAULT,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE,
        allowStretchX : true
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        backgroundColor : vStates.over ? this.BGCOLOR_OVER : this.BGCOLOR_OUT,
        color : vStates.over ? this.COLOR_OVER : this.COLOR_OUT
      }
    }
  },

  "menu-check-box" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "menu-button");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "menu-button");
    }
  },

  "menu-radio-button" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "menu-button");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "menu-button");
    }
  },

  "menu-separator" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.AUTO,
        marginTop : 3,
        marginBottom : 2,
        paddingLeft : 3,
        paddingRight : 3
      }
    }
  },

  "menu-separator-line" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        right : 0,
        left : 0,
        height : qx.constant.Core.AUTO,
        border : qx.renderer.border.BorderPresets.verticalDivider
      }
    }
  },








  /*
  ---------------------------------------------------------------------------
    LIST
  ---------------------------------------------------------------------------
  */

  "list" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.Color("white");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        overflow : qx.constant.Style.OVERFLOW_HIDDEN,
        border : qx.renderer.border.BorderPresets.thinInset,
        backgroundColor : this.bgcolor
      }
    }
  },

  "list-item" :
  {
    setup : function()
    {
      this.bgcolor_selected = new qx.renderer.color.ColorObject("highlight");
      this.color_selected = new qx.renderer.color.ColorObject("highlighttext");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        height : qx.constant.Core.AUTO,
        horizontalChildrenAlign : qx.constant.Layout.ALIGN_LEFT,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE,
        spacing : 4,
        paddingTop : 3,
        paddingRight : 5,
        paddingBottom : 3,
        paddingLeft : 5,
        minWidth : qx.constant.Core.AUTO
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      if (vStates.lead)
      {
        vWidget.setStyleProperty("MozOutline", qx.constant.Style.FOCUS_OUTLINE);
        vWidget.setStyleProperty("outline", qx.constant.Style.FOCUS_OUTLINE);
      }
      else
      {
        vWidget.removeStyleProperty("MozOutline");
        vWidget.removeStyleProperty("outline");
      }

      return {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      }
    }
  },








  /*
  ---------------------------------------------------------------------------
    FIELDS
  ---------------------------------------------------------------------------
  */

  "text-field" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    },

    initial : function(vWidget, vTheme)
    {
      return {
        hideFocus : true,
        border : qx.renderer.border.BorderPresets.thinInset,
        paddingTop : 1,
        paddingRight : 3,
        paddingBottom : 1,
        paddingLeft : 3,
        allowStretchY : false,
        allowStretchX : true,
        font : this.font,
        width : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO
      }
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "label");
    }
  },

  "text-area" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "text-field"), {
        overflow : qx.constant.Core.AUTO
      });
    },

    state : function(vWidget, vTheme) {
      return vTheme.stateFrom(vWidget, "text-field");
    }
  },










  /*
  ---------------------------------------------------------------------------
    COMBOBOX
  ---------------------------------------------------------------------------
  */

  "combo-box" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.Color("white");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        minWidth : 40,
        width : 120,
        height : qx.constant.Core.AUTO,
        border : qx.renderer.border.BorderPresets.inset,
        backgroundColor : this.bgcolor,
        allowStretchY : false
      }
    }
  },

  "combo-box-list" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "list"), {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0,
        border : null,
        overflow : qx.constant.Style.OVERFLOW_VERTICAL
      });
    }
  },

  "combo-box-popup" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "list"), {
        height : qx.constant.Core.AUTO,
        maxHeight : 150,
        border : qx.renderer.border.BorderPresets.shadow
      });
    }
  },

  "combo-box-text-field" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.Color("transparent");
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "text-field"), {
        border : qx.renderer.border.BorderPresets.none,
        width : qx.constant.Core.FLEX,
        backgroundColor : this.bgcolor
      });
    }
  },

  "combo-box-button" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "button"), {
        height : null,
        allowStretchY : true
      });
    },

    state : function(vWidget, vTheme) {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "button"), {
        paddingTop : 0,
        paddingRight : 3,
        paddingBottom : 0,
        paddingLeft : 2
      });
    }
  },







  /*
  ---------------------------------------------------------------------------
    TREE
  ---------------------------------------------------------------------------
  */

  "tree-element" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : 16,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    }
  },

  "tree-element-icon" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 16,
        height : 16
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      // The widget is the icon.
      // We need the property of the qx.ui.tree.TreeFile, the qx.ui.tree.TreeFolder or of the qx.ui.tree.Tree
      var vParent = vWidget.getParent();
      while (vParent && !(vParent instanceof qx.ui.tree.AbstractTreeElement)) {
        vParent = vParent.getParent();
      }

      if (vParent.getIcon())
      {
        return {
          source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
        }
      }
      else
      {
        return {
          source : "icon/16/file-new.png"
        }
      }
    }
  },

  "tree-element-label" :
  {
    setup : function()
    {
      this.bgcolor_selected = new qx.renderer.color.ColorObject("highlight");
      this.color_selected = new qx.renderer.color.ColorObject("highlighttext");
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "label"), {
        cursor : qx.constant.Core.DEFAULT,
        marginLeft : 3,
        height : 15,
        paddingTop : 2,
        paddingRight : 2,
        paddingBottom : 2,
        paddingLeft : 2,
        allowStretchY : false
      });
    },

    state : function(vWidget, vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "label"), {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      });
    }
  },

  "tree-folder" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "tree-element");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "tree-element");
    }
  },

  "tree-folder-icon" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 16,
        height : 16
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      // The widget is the icon.
      // We need the property of the qx.ui.tree.TreeFile, the qx.ui.tree.TreeFolder or of the qx.ui.tree.Tree
      var vParent = vWidget.getParent();
      while (vParent && !(vParent instanceof qx.ui.tree.AbstractTreeElement)) {
        vParent = vParent.getParent();
      }

      if (vParent.getIcon())
      {
        return {
          source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
        }
      }
      else
      {
        return {
          source : vStates.selected ? "icon/16/folder-open.png" : "icon/16/folder.png"
        }
      }
    }
  },

  "tree-folder-label" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "tree-element-label");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "tree-element-label");
    }
  },

  "tree" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "tree-folder");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "tree-folder");
    }
  },

  "tree-icon" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "tree-folder-icon");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "tree-folder-icon");
    }
  },

  "tree-label" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "tree-folder-label");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "tree-folder-label");
    }
  },

  "tree-container" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        verticalChildrenAlign : qx.constant.Layout.ALIGN_TOP
      }
    }
  },

  "tree-folder-container" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_TOP
      }
    }
  },







  /*
  ---------------------------------------------------------------------------
    TREE FULL CONTROL
  ---------------------------------------------------------------------------
  */

  "treefullcontrol-element" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : 16,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    }
  },

  "treefullcontrol-element-icon" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 16,
        height : 16
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      // The widget is the icon.
      // We need the property of the qx.ui.tree.TreeFile, the qx.ui.tree.TreeFolder or of the qx.ui.tree.Tree
      var vParent = vWidget.getParent();
      while (vParent && !(vParent instanceof qx.ui.treefullcontrol.AbstractTreeElement)) {
        vParent = vParent.getParent();
      }

      if (vParent.getIcon())
      {
        return {
          source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
        }
      }
      else
      {
        return {
          source : "icon/16/file-new.png"
        }
      }
    }
  },

  "treefullcontrol-element-label" :
  {
    setup : function()
    {
      this.bgcolor_selected = new qx.renderer.color.ColorObject("highlight");
      this.color_selected = new qx.renderer.color.ColorObject("highlighttext");
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "label"), {
        cursor : qx.constant.Core.DEFAULT,
        marginLeft : 3,
        height : 15,
        paddingTop : 2,
        paddingRight : 2,
        paddingBottom : 2,
        paddingLeft : 2,
        allowStretchY : false
      });
    },

    state : function(vWidget, vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "label"), {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      });
    }
  },

  "treefullcontrol-folder" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "treefullcontrol-element");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "treefullcontrol-element");
    }
  },

  "treefullcontrol-folder-icon" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : 16,
        height : 16
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      // The widget is the icon.
      // We need the property of the qx.ui.tree.TreeFile, the qx.ui.tree.TreeFolder or of the qx.ui.tree.Tree
      var vParent = vWidget.getParent();
      while (vParent && !(vParent instanceof qx.ui.treefullcontrol.AbstractTreeElement)) {
        vParent = vParent.getParent();
      }

      if (vParent.getIcon())
      {
        return {
          source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
        }
      }
      else
      {
        return {
          source : vStates.selected ? "icon/16/folder-open.png" : "icon/16/folder.png"
        }
      }
    }
  },

  "treefullcontrol-folder-label" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "treefullcontrol-element-label");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "treefullcontrol-element-label");
    }
  },

  "treefullcontrol" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "treefullcontrol-folder");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "treefullcontrol-folder");
    }
  },

  "treefullcontrol-icon" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "treefullcontrol-folder-icon");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "treefullcontrol-folder-icon");
    }
  },

  "treefullcontrol-label" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "treefullcontrol-folder-label");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "treefullcontrol-folder-label");
    }
  },

  "treefullcontrol-container" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        verticalChildrenAlign : qx.constant.Layout.ALIGN_TOP
      }
    }
  },

  "treefullcontrol-folder-container" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_TOP
      }
    }
  },







  /*
  ---------------------------------------------------------------------------
    LISTVIEW
  ---------------------------------------------------------------------------
  */

  "list-view" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        overflow: qx.constant.Style.OVERFLOW_HIDDEN
      }
    }
  },

  "list-view-pane" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        width : qx.constant.Core.FLEX,
        horizontalSpacing : 1,
        overflow : qx.constant.Style.OVERFLOW_HIDDEN
      }
    }
  },

  "list-view-header" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border;
      this.border.setBottom(1, "solid", "#e2e2e2");

      this.bgcolor = new qx.renderer.color.Color("#f2f2f2");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.AUTO,
        overflow: qx.constant.Style.OVERFLOW_HIDDEN,
        border : this.border,
        backgroundColor : this.bgcolor
      }
    }
  },

  "list-view-header-cell" :
  {
    setup : function()
    {
      this.border_hover = new qx.renderer.border.Border,
      this.border_hover.setBottom(2, "solid", "#F9B119");

      this.bgcolor_hover = new qx.renderer.color.Color("white");
    },

    initial : function(vWidget, vTheme)
    {
      // Text Overflow
      vWidget.setStyleProperty(qx.constant.Style.PROPERTY_OVERFLOW_TEXT, qx.constant.Style.OVERFLOW_ELLIPSIS);

      return {
        overflow : qx.constant.Style.OVERFLOW_HIDDEN,
        paddingTop : 2,
        paddingRight : 6,
        paddingBottom : 2,
        paddingLeft : 6,
        spacing : 4
      };
    },

    state : function(vWidget, vTheme, vStates)
    {
      if (vStates.over)
      {
        return {
          backgroundColor : this.bgcolor_hover,
          paddingBottom : 0,
          border : this.border_hover
        };
      }
      else
      {
        return {
          backgroundColor : null,
          paddingBottom : 2,
          border : null
        };
      }
    }
  },

  "list-view-header-separator" :
  {
    setup : function() {
      this.bgcolor = new qx.renderer.color.Color("#D6D5D9");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.bgcolor,
        width : 1,
        marginTop : 1,
        marginBottom : 1
      };
    }
  },

  "list-view-content-cell" :
  {
    setup : function()
    {
      this.bgcolor_selected = new qx.renderer.color.ColorObject("highlight");
      this.color_selected = new qx.renderer.color.ColorObject("highlighttext");
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      };
    }
  },

  "list-view-content-cell-image" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        paddingLeft : 6,
        paddingRight : 6
      };
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "list-view-content-cell");
    }
  },

  "list-view-content-cell-text" :
  {
    initial : function(vWidget, vTheme)
    {
      vWidget.setStyleProperty(qx.constant.Style.PROPERTY_WHITESPACE, "nowrap");
      vWidget.setStyleProperty(qx.constant.Style.PROPERTY_OVERFLOW_TEXT, qx.constant.Style.OVERFLOW_ELLIPSIS);

      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "htmlcontainer"), {
        overflow: qx.constant.Style.OVERFLOW_HIDDEN,
        paddingLeft : 6,
        paddingRight : 6
      });
    },

    state : function(vWidget, vTheme, vStates) {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "htmlcontainer"), vTheme.stateFrom(vWidget, "list-view-content-cell"));
    }
  },

  "list-view-content-cell-html" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
    }
  },

  "list-view-content-cell-icon-html" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
    }
  },

  "list-view-content-cell-link" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
    }
  },







  /*
  ---------------------------------------------------------------------------
    TABVIEW
  ---------------------------------------------------------------------------
  */

  "tab-view" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        spacing : -1
      };
    }
  },

  "tab-view-bar" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.AUTO
      };
    }
  },

  "tab-view-pane" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "#91A5BD");
      this.bgcolor = new qx.renderer.color.ColorObject("#FAFBFE");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        height : qx.constant.Core.FLEX,
        backgroundColor : this.bgcolor,
        border : this.border,
        paddingTop : 10,
        paddingRight : 10,
        paddingBottom : 10,
        paddingLeft : 10
      };
    }
  },

  "tab-view-page" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
      };
    }
  },

  "tab-view-button" :
  {
    setup : function()
    {
      this.bgcolor_normal = new qx.renderer.color.ColorObject("#E1EEFF");
      this.bgcolor_checked = new qx.renderer.color.ColorObject("#FAFBFE");

      this.border_top_normal = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "#91A5BD");
      this.border_top_normal.setBottomWidth(0);

      this.border_top_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "#91A5BD");
      this.border_top_checked.setBottomWidth(0);
      this.border_top_checked.setTop(3, qx.renderer.border.Border.STYLE_SOLID, "#FEC83C");

      this.border_bottom_normal = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "#91A5BD");
      this.border_bottom_normal.setTopWidth(0);

      this.border_bottom_checked = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "#91A5BD");
      this.border_bottom_checked.setTopWidth(0);
      this.border_bottom_checked.setBottom(3, qx.renderer.border.Border.STYLE_SOLID, "#FEC83C");
    },

    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "atom");
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vFrame = vWidget.getView();
      var vAlignLeft = vFrame.getAlignTabsToLeft();
      var vBarTop = vFrame.getPlaceBarOnTop();
      var vReturn;

      if (vStates.checked)
      {
        vReturn =
        {
          backgroundColor : this.bgcolor_checked,
          zIndex : 1,
          paddingTop : 2,
          paddingBottom : 4,
          paddingLeft : 7,
          paddingRight : 8,
          border : vBarTop ? this.border_top_checked : this.border_bottom_checked,
          marginTop : 0,
          marginBottom : 0,
          marginRight : -1,
          marginLeft : -2
        }

        if (vAlignLeft)
        {
          if (vWidget.getParent().getFirstVisibleChild() == vWidget)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 7;
            vReturn.marginLeft = 0;
          }
        }
        else
        {
          if (vWidget.getParent().getLastVisibleChild() == vWidget)
          {
            vReturn.paddingLeft = 8;
            vReturn.paddingRight = 5;
            vReturn.marginRight = 0;
          }
        }
      }
      else
      {
        vReturn =
        {
          backgroundColor : vStates.over ? this.bgcolor_checked : this.bgcolor_normal,
          zIndex : 0,
          paddingTop : 2,
          paddingBottom : 2,
          paddingLeft : 5,
          paddingRight : 6,
          marginRight : 1,
          marginLeft : 0
        }

        if (vAlignLeft)
        {
          if (vWidget.getParent().getFirstVisibleChild() == vWidget)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 5;
          }
        }
        else
        {
          if (vWidget.getParent().getLastVisibleChild() == vWidget)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 5;
            vReturn.marginRight = 0;
          }
        }

        if (vBarTop)
        {
          vReturn.border = this.border_top_normal;
          vReturn.marginTop = 3;
          vReturn.marginBottom = 1;
        }
        else
        {
          vReturn.border = this.border_bottom_normal;
          vReturn.marginTop = 1;
          vReturn.marginBottom = 3;
        }
      }

      return vReturn;
    }
  },






  /*
  ---------------------------------------------------------------------------
    FIELDSET
  ---------------------------------------------------------------------------
  */

  "field-set" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        backgroundColor : this.bgcolor
      }
    }
  },

  "field-set-legend" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "atom"), {
        top : 1,
        left : 10,
        backgroundColor : this.bgcolor,
        paddingRight : 3,
        paddingLeft : 4
      });
    }
  },

  "field-set-frame" :
  {
    initial : function(vWidget, vTheme)
    {
      return {
        top : 8,
        left : 2,
        right : 2,
        bottom : 2,
        paddingTop : 12,
        paddingRight : 9,
        paddingBottom : 12,
        paddingLeft : 9,
        border : qx.renderer.border.BorderPresets.groove
      }
    }
  },

  "check-box-field-set-legend" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    },

    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "atom"), {
        top : 1,
        left : 10,
        backgroundColor : this.bgcolor,
        paddingRight : 3
      });
    }
  },

  "radio-button-field-set-legend" :
  {
    initial : function(vWidget, vTheme) {
      return vTheme.initialFrom(vWidget, "check-box-field-set-legend");
    }
  },







  /*
  ---------------------------------------------------------------------------
    SPINNER
  ---------------------------------------------------------------------------
  */

  "spinner" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.Color("white");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        width : 60,
        height : 22,
        border : qx.renderer.border.BorderPresets.inset,
        backgroundColor : this.bgcolor
      }
    }
  },

  "spinner-field" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "text-field"), {
        width : qx.constant.Core.FLEX,
        border : qx.renderer.border.BorderPresets.none
      });
    },

    state : function(vWidget, vTheme, vStates) {
      return vTheme.stateFrom(vWidget, "text-field");
    }
  },

  "spinner-button-up" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "image"),
      {
        height: qx.constant.Core.FLEX,
        width: 16,
        backgroundColor: new qx.renderer.color.ColorObject("threedface")
      });
    },

    state : function(vWidget, vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "button"),
      {
        paddingTop : 0,
        paddingRight : 0,
        paddingBottom: 0,
        paddingLeft : 3
      });
    }
  },

  "spinner-button-down" :
  {
    initial : function(vWidget, vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom(vWidget, "image"),
      {
        height: qx.constant.Core.FLEX,
        width: 16,
        backgroundColor: new qx.renderer.color.ColorObject("threedface")
      });
    },

    state : function(vWidget, vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom(vWidget, "button"),
      {
        paddingTop : 1,
        paddingRight : 0,
        paddingBottom: 0,
        paddingLeft : 3
      });
    }
  },





  /*
  ---------------------------------------------------------------------------
    COLORSELECTOR
  ---------------------------------------------------------------------------
  */

  "colorselector" :
  {
    setup : function()
    {
      this.border = qx.renderer.border.BorderPresets.outset;
    },

    initial : function(vWidget, vTheme)
    {
      return {
        border : this.border,
        width: qx.constant.Core.AUTO,
        height: qx.constant.Core.AUTO
      }
    },

    state : function(vWidget, vTheme, vStates)
    {

    }
  },





  /*
  ---------------------------------------------------------------------------
    DATECHOOSER
  ---------------------------------------------------------------------------
  */

  "datechooser-toolbar-button" :
  {
    setup : function()
    {
      this.bgcolor_default = new qx.renderer.color.ColorObject("buttonface");
      this.bgcolor_left = new qx.renderer.color.Color("#FFF0C9");

      this.border_pressed = qx.renderer.border.BorderPresets.thinInset;
      this.border_over = qx.renderer.border.BorderPresets.thinOutset;
      this.border_default = null;

      this.checked_background = "static/image/dotted_white.gif";
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        spacing : 4,
        width : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      var vReturn = {
        backgroundColor : vStates.abandoned ? this.bgcolor_left : this.bgcolor_default,
        backgroundImage : (vStates.checked && !vStates.over) ? this.checked_background : null
      }

      if (vStates.pressed || vStates.checked || vStates.abandoned) {
        vReturn.border = this.border_pressed;
      } else if (vStates.over) {
        vReturn.border = this.border_over;
      } else {
        vReturn.border = this.border_default;
      }

      if (vStates.pressed || vStates.checked || vStates.abandoned) {
        vReturn.paddingTop = 2;
        vReturn.paddingRight = 0;
        vReturn.paddingBottom = 0;
        vReturn.paddingLeft = 2;
      } else if (vStates.over) {
        vReturn.paddingTop = vReturn.paddingBottom = 1;
        vReturn.paddingLeft = vReturn.paddingRight = 1;
      } else {
        vReturn.paddingTop = vReturn.paddingBottom = 2;
        vReturn.paddingLeft = vReturn.paddingRight = 2;
      }

      return vReturn;
    }
  },


  "datechooser-monthyear" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(13, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    },

    initial : function(vWidget, vTheme)
    {
      return {
        font : this.font,
        textAlign: "center",
        verticalAlign: "middle"
      }
    }
  },


  "datechooser-datepane" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_SOLID, "gray");
      this.bgcolor = new qx.renderer.color.ColorObject("window");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        border : this.border,
        backgroundColor : this.bgcolor
      }
    }
  },


  "datechooser-weekday" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border;
      this.border.set({ bottomColor:"gray", bottomStyle :qx.renderer.border.Border.STYLE_SOLID, bottomWidth:1 });
      this.color = new qx.renderer.color.ColorObject("window");
      this.bgcolor = new qx.renderer.color.ColorObject("#6285BA");
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
      this.font.setBold(true);
    },

    initial : function(vWidget, vTheme)
    {
      return {
        border : this.border,
        font : this.font,
        textAlign : "center"
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        color : vStates.weekend ? this.bgcolor : this.color,
        backgroundColor : vStates.weekend ? this.color : this.bgcolor
      }
    }

  },


  "datechooser-day" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');

      this.selectedColor = new qx.renderer.color.ColorObject("highlightText");
      this.selectedBgColor = new qx.renderer.color.ColorObject("highlight");
      this.color = new qx.renderer.color.ColorObject("windowText");
      this.otherMonthColor = new qx.renderer.color.ColorObject("grayText");

      this.transparentBorder = new qx.renderer.border.Border(1, qx.renderer.border.Border.STYLE_NONE);
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        border : this.border,
        color : this.color,
        font : this.font,
        textAlign : "center",
        verticalAlign: "middle",
        selectable: false
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        border : vStates.today ? qx.renderer.border.BorderPresets.black : this.transparentBorder,
        color : vStates.selected ? this.selectedColor :
          (vStates.otherMonth ? this.otherMonthColor : this.color),
        backgroundColor : vStates.selected ? this.selectedBgColor : null
      }
    }
  },

  "datechooser-week" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border;
      this.border.set({ rightColor:"gray", rightStyle :qx.renderer.border.Border.STYLE_SOLID, rightWidth:1 });
      this.headerBorder = new qx.renderer.border.Border;
      this.headerBorder.set({ rightColor:"gray", rightStyle :qx.renderer.border.Border.STYLE_SOLID, rightWidth:1,
                   bottomColor:"gray", bottomStyle :qx.renderer.border.Border.STYLE_SOLID, bottomWidth:1 });
      this.color = new qx.renderer.color.ColorObject("#6285BA");
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    },

    initial : function(vWidget, vTheme)
    {
      return {
        border : this.border,
        font : this.font,
        color: this.color,
        paddingLeft : 2
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        border : vStates.header ? this.headerBorder : this.border
      }
    }
  },






  /*
  ---------------------------------------------------------------------------
    TABLE
  ---------------------------------------------------------------------------
  */

  "table-focus-statusbar" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
      this.border = new qx.renderer.border.Border;
      this.border.set({ topColor:"threedshadow", topStyle :qx.renderer.border.Border.STYLE_SOLID, topWidth:1 });
    },

    initial : function(vWidget, vTheme)
    {
      return {
        font: this.font,
        border: this.border,
        paddingLeft: 2,
        paddingRight: 2
      }
    }
  },


  "table-focus-indicator" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border(3, qx.renderer.border.Border.STYLE_SOLID, "#b3d9ff");
      this.editingBorder = new qx.renderer.border.Border(2, qx.renderer.border.Border.STYLE_SOLID, "#b3d9ff");
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        border : vStates.editing ? this.editingBorder : this.border
      }
    }
  },


  "table-editor-textfield" :
  {
    setup : function()
    {
      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    },

    initial : function(vWidget, vTheme)
    {
      return {
        font: this.font,
        border: qx.renderer.border.BorderPresets.none,
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 0,
        paddingBottom: 0
      }
    }
  },


  "table-data-cell" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border;
      this.border.set({ rightColor:"#eeeeee", rightStyle :qx.renderer.border.Border.STYLE_SOLID, rightWidth:1,
                 bottomColor:"#eeeeee", bottomStyle :qx.renderer.border.Border.STYLE_SOLID, bottomWidth:1 });
      this.focusedBorder = new qx.renderer.border.Border(3, qx.renderer.border.Border.STYLE_SOLID, "#b3d9ff");

      this.font = new qx.renderer.font.Font(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');

      this.color = new qx.renderer.color.ColorObject("windowText");
      this.selectedColor = new qx.renderer.color.ColorObject("highlightText");
      this.selectedBgColor = new qx.renderer.color.ColorObject("highlight");
      this.evenBackground = new qx.renderer.color.ColorObject("#faf8f3");
      this.oddBackground = new qx.renderer.color.ColorObject("window");
      this.focusedBackground = new qx.renderer.color.ColorObject("#ddeeff");
      this.focusedSelectedBackground = new qx.renderer.color.ColorObject("#5a8ad3");
    },

    initial : function(vWidget, vTheme)
    {
      var properties = {
        cursor : qx.constant.Core.DEFAULT,
        border : this.border,
        paddingLeft : 2,
        paddingRight : 2,
        selectable: false
      }
      if (vWidget.setFont) {
        properties.font = this.font;
      }
      return properties;
    },

    state : function(vWidget, vTheme, vStates)
    {
      var ret = {
        color : vStates.selected ? this.selectedColor : this.color
      }

      if (vStates.focusedRow) {
        ret.backgroundColor = vStates.selected ? this.focusedSelectedBackground : this.focusedBackground;
      } else {
        ret.backgroundColor = (vStates.selected ? this.selectedBgColor : (vStates.even ? this.evenBackground : this.oddBackground));
      }

      return ret;
    }
  },


  "table-header-cell" :
  {
    setup : function()
    {
      this.border = new qx.renderer.border.Border;
      this.border.set({ rightColor:"#d6d2c2", rightStyle :qx.renderer.border.Border.STYLE_SOLID, rightWidth:1,
                bottomColor:"#d6d2c2", bottomStyle :qx.renderer.border.Border.STYLE_SOLID, bottomWidth:2 });

      this.mouseOverBorder = new qx.renderer.border.Border;
      this.mouseOverBorder.set({ rightColor:"#d6d2c2", rightStyle :qx.renderer.border.Border.STYLE_SOLID, rightWidth:1,
                     bottomColor:"#F9B119", bottomStyle :qx.renderer.border.Border.STYLE_SOLID, bottomWidth:2 });

      this.mouseOverBackground = new qx.renderer.color.ColorObject("white");
      this.background = new qx.renderer.color.ColorObject("#ebeadb");
    },

    initial : function(vWidget, vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        border : this.border,
        paddingLeft : 2,
        paddingRight : 2,
        spacing:2,
        overflow:"hidden",
        selectable: false,
        backgroundColor:this.background,
        iconPosition:"right",
        verticalChildrenAlign:"middle"
      }
    },

    state : function(vWidget, vTheme, vStates)
    {
      return {
        backgroundColor : vStates.mouseover ? this.mouseOverBackground : this.background,
        border : vStates.mouseover ? this.mouseOverBorder : this.border
      }
    }
  }




  /*
  ---------------------------------------------------------------------------
    END
  ---------------------------------------------------------------------------
  */
}, qx.Super.prototype._appearances);





/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.theme.appearance.DefaultAppearanceTheme);

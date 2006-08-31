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

#module(ui_core)
#module(theme_appearance)
#optional(qx.renderer.color.Color)
#optional(qx.renderer.color.ColorObject)
#optional(qx.renderer.border.Border)
#optional(qx.renderer.border.BorderObject)
#optional(qx.renderer.font.Font)
#optional(qx.renderer.font.FontObject)

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
    initial : function(vTheme)
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

    initial : function(vTheme)
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
    initial : function(vTheme)
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
    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return {
        font: this.font,
        wrap : false
      }
    },

    state : function(vTheme, vStates)
    {
      return {
        color : vStates.disabled ? this.color_disabled : null
      }
    }
  },

  "htmlcontainer" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("label");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("label", vStates);
    }
  },

  "popup" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("popup"), {
        backgroundColor : this.bgcolor,
        color : this.color,
        border : qx.renderer.border.BorderPresets.getInstance().info,
        paddingTop : 1,
        paddingRight : 3,
        paddingBottom : 2,
        paddingLeft : 3
      });
    }
  },

  "iframe" :
  {
    initial : function(vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.getInstance().inset
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

      this.border_pressed = qx.renderer.border.BorderPresets.getInstance().inset;
      this.border_default = qx.renderer.border.BorderPresets.getInstance().outset;
    },

    initial : function(vTheme) {
      return vTheme.initialFrom("atom");
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.getInstance().thinOutset,
        backgroundColor : this.bgcolor,
        height : qx.constant.Core.AUTO
      }
    }
  },

  "toolbar-part" :
  {
    initial : function(vTheme)
    {
      return {
        width : qx.constant.Core.AUTO
      }
    }
  },

  "toolbar-part-handle" :
  {
    initial : function(vTheme)
    {
      return {
        width : 10
      }
    }
  },

  "toolbar-part-handle-line" :
  {
    initial : function(vTheme)
    {
      return {
        top : 2,
        left : 3,
        bottom : 2,
        width : 4,
        border : qx.renderer.border.BorderPresets.getInstance().thinOutset
      }
    }
  },

  "toolbar-separator" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
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

      this.border_pressed = qx.renderer.border.BorderPresets.getInstance().thinInset;
      this.border_over = qx.renderer.border.BorderPresets.getInstance().thinOutset;
      this.border_default = null;

      this.checked_background = "static/image/dotted_white.gif";
    },

    initial : function(vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        spacing : 4,
        width : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
    {
      return {
        backgroundColor : this.background,
        border : qx.renderer.border.BorderPresets.getInstance().shadow
      }
    }
  },

  "bar-view-pane" :
  {
    state : function(vTheme, vStates)
    {
      if (vStates.barHorizontal)
      {
        return {
          width : null,
          height : qx.constant.Core.FLEX
        }
      }
      else
      {
        return {
          width : qx.constant.Core.FLEX,
          height : null
        }
      }
    }
  },

  "bar-view-page" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return {
        backgroundColor : this.background_color
      }
    },

    state : function(vTheme, vStates)
    {
      if (vStates.barTop)
      {
        return {
          paddingTop : 1,
          paddingRight : 0,
          paddingBottom : 1,
          paddingLeft : 0,

          border : this.border_top,
          height : qx.constant.Core.AUTO,
          width : null,
          orientation : qx.constant.Layout.ORIENTATION_HORIZONTAL
        };
      }
      else if (vStates.barBottom)
      {
        return {
          paddingTop : 1,
          paddingRight : 0,
          paddingBottom : 1,
          paddingLeft : 0,

          border : this.border_bottom,
          height : qx.constant.Core.AUTO,
          width : null,
          orientation : qx.constant.Layout.ORIENTATION_HORIZONTAL
        };
      }
      else if (vStates.barLeft)
      {
        return {
          paddingTop : 0,
          paddingRight : 1,
          paddingBottom : 0,
          paddingLeft : 1,

          border : this.border_left,
          height : null,
          width : qx.constant.Core.AUTO,
          orientation : qx.constant.Layout.ORIENTATION_VERTICAL
        };
      }
      else if (vStates.barRight)
      {
        return {
          paddingTop : 0,
          paddingRight : 1,
          paddingBottom : 0,
          paddingLeft : 1,

          border : this.border_right,
          height : null,
          width : qx.constant.Core.AUTO,
          orientation : qx.constant.Layout.ORIENTATION_VERTICAL
        };
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

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("atom"), {
        iconPosition : qx.constant.Layout.ALIGN_TOP
      });
    },

    state : function(vTheme, vStates)
    {
      var vReturn =
      {
        backgroundColor : vStates.checked ? this.background_color_checked : this.background_color_normal,
        allowStretchX : true,
        allowStretchY : true
      }

      if (vStates.checked || vStates.over)
      {
        if (vStates.barTop)
        {
          vReturn.border = this.border_top_checked;
          vReturn.paddingTop = 3;
          vReturn.paddingRight = 6;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft = 6;
        }
        else if (vStates.barBottom)
        {
          vReturn.border = this.border_bottom_checked;
          vReturn.paddingTop = 1;
          vReturn.paddingRight = 6;
          vReturn.paddingBottom = 3;
          vReturn.paddingLeft = 6;
        }
        else if (vStates.barLeft)
        {
          vReturn.border = this.border_left_checked;
          vReturn.paddingTop = 3;
          vReturn.paddingRight = 4;
          vReturn.paddingBottom = 3;
          vReturn.paddingLeft = 6;
        }
        else if (vStates.barRight)
        {
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

      if (vStates.barTop || vStates.barBottom)
      {
        vReturn.marginTop = vReturn.marginBottom = 0;
        vReturn.marginRight = vReturn.marginLeft = 1;
        vReturn.width = qx.constant.Core.AUTO;
        vReturn.height = null;
      }
      else if (vStates.barLeft || vStates.barRight)
      {
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
      return {
        border : vStates.maximized ? qx.renderer.border.BorderPresets.getInstance().none : qx.renderer.border.BorderPresets.getInstance().outset
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
      return {
        backgroundColor : vStates.active ? this.bgcolor_active : this.bgcolor_inactive,
        color : vStates.active ? this.color_active : this.color_inactive
      }
    }
  },

  "window-resize-frame" :
  {
    initial : function(vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.getInstance().shadow
      }
    }
  },

  "window-captionbar-icon" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
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
    initial : function(vTheme) {
      return vTheme.initialFrom("button");
    },

    state : function(vTheme, vStates)
    {
      var vReturn = vTheme.stateFrom("button", vStates);

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
    initial : function(vTheme) {
      return vTheme.initialFrom("window-captionbar-button");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("window-captionbar-button", vStates);
    }
  },

  "window-captionbar-restore-button" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("window-captionbar-button");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("window-captionbar-button", vStates);
    }
  },

  "window-captionbar-maximize-button" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("window-captionbar-button");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("window-captionbar-button", vStates);
    }
  },

  "window-captionbar-close-button" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("window-captionbar-button"), {
        marginLeft : 2
      });
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("window-captionbar-button", vStates);
    }
  },

  "window-statusbar" :
  {
    initial : function(vTheme)
    {
      return {
        border : qx.renderer.border.BorderPresets.getInstance().thinInset,
        height : qx.constant.Core.AUTO
      }
    }
  },

  "window-statusbar-text" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return {
        width : qx.constant.Core.AUTO,
        height : qx.constant.Core.AUTO,
        backgroundColor : this.bgcolor,
        border : qx.renderer.border.BorderPresets.getInstance().outset,
        paddingTop : 1,
        paddingRight : 1,
        paddingBottom : 1,
        paddingLeft : 1
      }
    }
  },

  "menu-layout" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
      return {
        backgroundColor : vStates.over ? this.BGCOLOR_OVER : this.BGCOLOR_OUT,
        color : vStates.over ? this.COLOR_OVER : this.COLOR_OUT
      }
    }
  },

  "menu-check-box" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("menu-button");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("menu-button", vStates);
    }
  },

  "menu-radio-button" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("menu-button");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("menu-button", vStates);
    }
  },

  "menu-separator" :
  {
    initial : function(vTheme)
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
    initial : function(vTheme)
    {
      return {
        right : 0,
        left : 0,
        height : qx.constant.Core.AUTO,
        border : qx.renderer.border.BorderPresets.getInstance().verticalDivider
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

    initial : function(vTheme)
    {
      return {
        overflow : qx.constant.Style.OVERFLOW_HIDDEN,
        border : qx.renderer.border.BorderPresets.getInstance().thinInset,
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
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

    initial : function(vTheme)
    {
      return {
        hideFocus : true,
        border : qx.renderer.border.BorderPresets.getInstance().thinInset,
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

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("label", vStates);
    }
  },

  "text-area" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("text-field"), {
        overflow : qx.constant.Core.AUTO
      });
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("text-field", vStates);
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

    initial : function(vTheme)
    {
      return {
        minWidth : 40,
        width : 120,
        height : qx.constant.Core.AUTO,
        border : qx.renderer.border.BorderPresets.getInstance().inset,
        backgroundColor : this.bgcolor,
        allowStretchY : false
      }
    }
  },

  "combo-box-list" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("list"), {
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
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("list"), {
        height : qx.constant.Core.AUTO,
        maxHeight : 150,
        border : qx.renderer.border.BorderPresets.getInstance().shadow
      });
    }
  },

  "combo-box-text-field" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.Color("transparent");
    },

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("text-field"), {
        border : qx.renderer.border.BorderPresets.getInstance().none,
        width : qx.constant.Core.FLEX,
        backgroundColor : this.bgcolor
      });
    }
  },

  "combo-box-button" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("button"), {
        height : null,
        allowStretchY : true
      });
    },

    state : function(vTheme, vStates) {
      return qx.lang.Object.mergeWith(vTheme.stateFrom("button", vStates), {
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
    initial : function(vTheme)
    {
      return {
        height : 16,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    }
  },

  "tree-element-icon" :
  {
    initial : function(vTheme)
    {
      return {
        width : 16,
        height : 16
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

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("label"), {
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

    state : function(vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom("label", vStates), {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      });
    }
  },

  "tree-folder" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("tree-element");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("tree-element", vStates);
    }
  },

  "tree-folder-icon" :
  {
    initial : function(vTheme)
    {
      return {
        width : 16,
        height : 16
      }
    }
  },

  "tree-folder-label" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("tree-element-label");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("tree-element-label", vStates);
    }
  },

  "tree" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("tree-folder");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("tree-folder", vStates);
    }
  },

  "tree-icon" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("tree-folder-icon");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("tree-folder-icon", vStates);
    }
  },

  "tree-label" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("tree-folder-label");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("tree-folder-label", vStates);
    }
  },

  "tree-container" :
  {
    initial : function(vTheme)
    {
      return {
        verticalChildrenAlign : qx.constant.Layout.ALIGN_TOP
      }
    }
  },

  "tree-folder-container" :
  {
    initial : function(vTheme)
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
    initial : function(vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        overflow: qx.constant.Style.OVERFLOW_HIDDEN
      }
    }
  },

  "list-view-pane" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
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
      this.border_hover = new qx.renderer.border.Border;
      this.border_hover.setBottom(2, "solid", "#F9B119");

      this.bgcolor_hover = new qx.renderer.color.Color("white");
    },

    initial : function(vTheme)
    {
      return {
        overflow : qx.constant.Style.OVERFLOW_HIDDEN,
        paddingTop : 2,
        paddingRight : 6,
        paddingBottom : 2,
        paddingLeft : 6,
        spacing : 4
      };
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
      return {
        backgroundColor : vStates.selected ? this.bgcolor_selected : null,
        color : vStates.selected ? this.color_selected : null
      };
    }
  },

  "list-view-content-cell-image" :
  {
    initial : function(vTheme)
    {
      return {
        paddingLeft : 6,
        paddingRight : 6
      };
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("list-view-content-cell", vStates);
    }
  },

  "list-view-content-cell-text" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("htmlcontainer"), {
        overflow: qx.constant.Style.OVERFLOW_HIDDEN,
        paddingLeft : 6,
        paddingRight : 6
      });
    },

    state : function(vTheme, vStates) {
      return qx.lang.Object.mergeWith(vTheme.stateFrom("htmlcontainer", vStates), vTheme.stateFrom("list-view-content-cell", vStates));
    }
  },

  "list-view-content-cell-html" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("list-view-content-cell-text");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("list-view-content-cell-text", vStates);
    }
  },

  "list-view-content-cell-icon-html" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("list-view-content-cell-text");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("list-view-content-cell-text", vStates);
    }
  },

  "list-view-content-cell-link" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("list-view-content-cell-text");
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("list-view-content-cell-text", vStates);
    }
  },







  /*
  ---------------------------------------------------------------------------
    TABVIEW
  ---------------------------------------------------------------------------
  */

  "tab-view" :
  {
    initial : function(vTheme)
    {
      return {
        spacing : -1
      };
    }
  },

  "tab-view-bar" :
  {
    initial : function(vTheme)
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

    initial : function(vTheme)
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
    initial : function(vTheme)
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

    initial : function(vTheme) {
      return vTheme.initialFrom("atom");
    },

    state : function(vTheme, vStates)
    {
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
          border : vStates.barTop ? this.border_top_checked : this.border_bottom_checked,
          marginTop : 0,
          marginBottom : 0,
          marginRight : -1,
          marginLeft : -2
        }

        if (vStates.alignLeft)
        {
          if (vStates.firstChild)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 7;
            vReturn.marginLeft = 0;
          }
        }
        else
        {
          if (vStates.lastChild)
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

        if (vStates.alignLeft)
        {
          if (vStates.firstChild)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 5;
          }
        }
        else
        {
          if (vStates.lastChild)
          {
            vReturn.paddingLeft = 6;
            vReturn.paddingRight = 5;
            vReturn.marginRight = 0;
          }
        }

        if (vStates.barTop)
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

    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("atom"), {
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
    initial : function(vTheme)
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
        border : qx.renderer.border.BorderPresets.getInstance().groove
      }
    }
  },

  "check-box-field-set-legend" :
  {
    setup : function()
    {
      this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    },

    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("atom"), {
        top : 1,
        left : 10,
        backgroundColor : this.bgcolor,
        paddingRight : 3
      });
    }
  },

  "radio-button-field-set-legend" :
  {
    initial : function(vTheme) {
      return vTheme.initialFrom("check-box-field-set-legend");
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

    initial : function(vTheme)
    {
      return {
        width : 60,
        height : 22,
        border : qx.renderer.border.BorderPresets.getInstance().inset,
        backgroundColor : this.bgcolor
      }
    }
  },

  "spinner-field" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("text-field"), {
        width : qx.constant.Core.FLEX,
        border : qx.renderer.border.BorderPresets.getInstance().none
      });
    },

    state : function(vTheme, vStates) {
      return vTheme.stateFrom("text-field", vStates);
    }
  },

  "spinner-button-up" :
  {
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("image"),
      {
        height: qx.constant.Core.FLEX,
        width: 16,
        backgroundColor: new qx.renderer.color.ColorObject("threedface")
      });
    },

    state : function(vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom("button", vStates),
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
    initial : function(vTheme)
    {
      return qx.lang.Object.mergeWith(vTheme.initialFrom("image"),
      {
        height: qx.constant.Core.FLEX,
        width: 16,
        backgroundColor: new qx.renderer.color.ColorObject("threedface")
      });
    },

    state : function(vTheme, vStates)
    {
      return qx.lang.Object.mergeWith(vTheme.stateFrom("button", vStates),
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
      this.border = qx.renderer.border.BorderPresets.getInstance().outset;
    },

    initial : function(vTheme)
    {
      return {
        border : this.border,
        width: qx.constant.Core.AUTO,
        height: qx.constant.Core.AUTO
      }
    },

    state : function(vTheme, vStates)
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

      this.border_pressed = qx.renderer.border.BorderPresets.getInstance().thinInset;
      this.border_over = qx.renderer.border.BorderPresets.getInstance().thinOutset;
      this.border_default = null;

      this.checked_background = "static/image/dotted_white.gif";
    },

    initial : function(vTheme)
    {
      return {
        cursor : qx.constant.Core.DEFAULT,
        spacing : 4,
        width : qx.constant.Core.AUTO,
        verticalChildrenAlign : qx.constant.Layout.ALIGN_MIDDLE
      }
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
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

    initial : function(vTheme)
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

    initial : function(vTheme)
    {
      return {
        border : this.border,
        font : this.font,
        textAlign : "center"
      }
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
    {
      return {
        border : vStates.today ? qx.renderer.border.BorderPresets.getInstance().black : this.transparentBorder,
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

    initial : function(vTheme)
    {
      return {
        border : this.border,
        font : this.font,
        color: this.color,
        paddingLeft : 2
      }
    },

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
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

    initial : function(vTheme)
    {
      return {
        font: this.font,
        border: qx.renderer.border.BorderPresets.getInstance().none,
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 0,
        paddingBottom: 0
      }
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

    initial : function(vTheme)
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

    state : function(vTheme, vStates)
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

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = qx.util.Return.returnInstance;



/*
---------------------------------------------------------------------------
  REGISTER TO MANAGER
---------------------------------------------------------------------------
*/

qx.manager.object.AppearanceManager.getInstance().registerAppearanceTheme(qx.Class);

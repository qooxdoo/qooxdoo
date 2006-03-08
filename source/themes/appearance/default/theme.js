/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(appearancethemes)
#require(QxAppearanceTheme)
#require(QxAppearanceManager)

************************************************************************ */

theme = new QxAppearanceTheme("default", "qooxdoo default appearance");





/*
---------------------------------------------------------------------------
  CORE
---------------------------------------------------------------------------
*/

theme.registerAppearance("image",
{
  initial : function(vWidget, vTheme)
  {
    return {
      allowStretchX : false,
      allowStretchY : false
    };
  }
});

theme.registerAppearance("client-document",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
    this.color = new QxColorObject("windowtext");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.bgcolor,
      color : this.color,
      hideFocus : true,
      enableElementFocus : false
    };
  }
});

theme.registerAppearance("blocker",
{
  initial : function(vWidget, vTheme)
  {
    // You could also use: "core/dotted_white.gif" for example as backgroundImage here
    // (Visible) background tiles could be dramatically slow down mshtml!
    // A background image or color is always needed for mshtml to block the events successfully.
    return {
      cursor : QxConst.CORE_DEFAULT,
      backgroundImage : QxConst.IMAGE_BLANK
    };
  }
});

theme.registerAppearance("atom",
{
  initial : function(vWidget, vTheme)
  {
    return {
      cursor : QxConst.CORE_DEFAULT,
      spacing : 4,
      width : QxConst.CORE_AUTO,
      height : QxConst.CORE_AUTO,
      horizontalChildrenAlign : QxConst.ALIGN_CENTER,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE,
      stretchChildrenOrthogonalAxis : false,
      allowStretchY : false,
      allowStretchX : false
    };
  }
});

theme.registerAppearance("label",
{
  setup : function()
  {
    this.color_disabled = new QxColorObject("graytext");
    this.font = new QxFont(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
  },

  initial : function(vWidget, vTheme)
  {
    return {
      font: this.font,
      wrap : false
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      color : vStates.disabled ? this.color_disabled : null
    };
  }
});

theme.registerAppearance("htmlcontainer",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "label");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "label");
  }
});

theme.registerAppearance("popup",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : QxConst.CORE_AUTO,
      height : QxConst.CORE_AUTO
    };
  }
});

theme.registerAppearance("tool-tip",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("InfoBackground");
    this.color = new QxColorObject("InfoText");
  },

  initial : function(vWidget, vTheme)
  {
    vWidget.setStyleProperty(QxConst.PROPERTY_FILTER, "progid:DXImageTransform.Microsoft.Shadow(color='Gray', Direction=135, Strength=4)");

    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "popup"), {
      backgroundColor : this.bgcolor,
      color : this.color,
      border : QxBorderObject.presets.info,
      paddingTop : 1,
      paddingRight : 3,
      paddingBottom : 2,
      paddingLeft : 3
    });
  }
});

theme.registerAppearance("iframe",
{
  initial : function(vWidget, vTheme)
  {
    return {
      border : QxBorderObject.presets.inset
    };
  }
});






/*
---------------------------------------------------------------------------
  BUTTON
---------------------------------------------------------------------------
*/

theme.registerAppearance("button",
{
  setup : function()
  {
    this.bgcolor_default = new QxColorObject("buttonface");
    this.bgcolor_over = new QxColor("#87BCE5");
    this.bgcolor_left = new QxColor("#FFF0C9");

    this.border_pressed = QxBorderObject.presets.inset;
    this.border_default = QxBorderObject.presets.outset;
  },

  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "atom");
  },

  state : function(vWidget, vTheme, vStates)
  {
    var vReturn = {
      backgroundColor : vStates.abandoned ? this.bgcolor_left : vStates.over ? this.bgcolor_over : this.bgcolor_default,
      border : vStates.pressed || vStates.checked || vStates.abandoned ? this.border_pressed : this.border_default
    };

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
    };

    return vReturn;
  }
});








/*
---------------------------------------------------------------------------
  TOOLBAR
---------------------------------------------------------------------------
*/

theme.registerAppearance("toolbar",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      border : QxBorderObject.presets.thinOutset,
      backgroundColor : this.bgcolor,
      height : QxConst.CORE_AUTO
    };
  }
});

theme.registerAppearance("toolbar-part",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : QxConst.CORE_AUTO
    };
  }
});

theme.registerAppearance("toolbar-part-handle",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : 10
    };
  }
});

theme.registerAppearance("toolbar-part-handle-line",
{
  initial : function(vWidget, vTheme)
  {
    return {
      top : 2,
      left : 3,
      bottom : 2,
      width : 4,
      border : QxBorderObject.presets.thinOutset
    };
  }
});

theme.registerAppearance("toolbar-separator",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : 8
    };
  }
});

theme.registerAppearance("toolbar-separator-line",
{
  setup : function()
  {
    var b = this.border = new QxBorderObject;

    b.setLeftColor("threedshadow");
    b.setRightColor("threedhighlight");

    b.setLeftStyle(QxConst.BORDER_STYLE_SOLID);
    b.setRightStyle(QxConst.BORDER_STYLE_SOLID);

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
    };
  }
});

theme.registerAppearance("toolbar-button",
{
  setup : function()
  {
    this.bgcolor_default = new QxColorObject("buttonface");
    this.bgcolor_left = new QxColor("#FFF0C9");

    this.border_pressed = QxBorderObject.presets.thinInset;
    this.border_over = QxBorderObject.presets.thinOutset;
    this.border_default = null;

    this.checked_background = "core/dotted_white.gif";
  },

  initial : function(vWidget, vTheme)
  {
    return {
      cursor : QxConst.CORE_DEFAULT,
      spacing : 4,
      width : QxConst.CORE_AUTO,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    var vReturn =
    {
      backgroundColor : vStates.abandoned ? this.bgcolor_left : this.bgcolor_default,
      backgroundImage : vStates.checked && !vStates.over ? this.checked_background : null
    };

    if (vStates.pressed || vStates.checked || vStates.abandoned) {
      vReturn.border = this.border_pressed;
    } else if (vStates.over) {
      vReturn.border = this.border_over;
    } else {
      vReturn.border = this.border_default;
    };

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
    };

    return vReturn;
  }
});







/*
---------------------------------------------------------------------------
  BAR VIEW
---------------------------------------------------------------------------
*/

theme.registerAppearance("bar-view",
{
  setup : function()
  {
    this.background = new QxColorObject("#FAFBFE");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.background,
      border : QxBorderObject.presets.shadow
    };
  }
});

theme.registerAppearance("bar-view-pane",
{
  state : function(vWidget, vTheme, vStates)
  {
    switch(vWidget.getParent().getBarPosition())
    {
      case QxConst.ALIGN_TOP:
      case QxConst.ALIGN_BOTTOM:
        return {
          width : null,
          height : QxConst.CORE_FLEX
        };

      case QxConst.ALIGN_LEFT:
      case QxConst.ALIGN_RIGHT:
        return {
          width : QxConst.CORE_FLEX,
          height : null
        };
    };
  }
});

theme.registerAppearance("bar-view-page",
{
  initial : function(vWidget, vTheme)
  {
    return {
      left : 10,
      right : 10,
      top : 10,
      bottom : 10
    };
  }
});

theme.registerAppearance("bar-view-bar",
{
  setup : function()
  {
    this.background_color = new QxColorObject("#E1EEFF");

    this.border_color = new QxColorObject("threedshadow");

    this.border_top = new QxBorderObject;
    this.border_top.setBottom(1, QxConst.BORDER_STYLE_SOLID, this.border_color);

    this.border_bottom = new QxBorderObject;
    this.border_bottom.setTop(1, QxConst.BORDER_STYLE_SOLID, this.border_color);

    this.border_left = new QxBorderObject;
    this.border_left.setRight(1, QxConst.BORDER_STYLE_SOLID, this.border_color);

    this.border_right = new QxBorderObject;
    this.border_right.setLeft(1, QxConst.BORDER_STYLE_SOLID, this.border_color);
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.background_color
    };
  },

  state : function(vWidget, vTheme, vState)
  {
    switch(vWidget.getParent().getBarPosition())
    {
      case QxConst.ALIGN_TOP:
        return {
          paddingTop : 1,
          paddingRight : 0,
          paddingBottom : 1,
          paddingLeft : 0,

          border : this.border_top,
          height : QxConst.CORE_AUTO,
          width : null,
          orientation : QxConst.ORIENTATION_HORIZONTAL
        };

      case QxConst.ALIGN_BOTTOM:
        return {
          paddingTop : 1,
          paddingRight : 0,
          paddingBottom : 1,
          paddingLeft : 0,

          border : this.border_bottom,
          height : QxConst.CORE_AUTO,
          width : null,
          orientation : QxConst.ORIENTATION_HORIZONTAL
        };

      case QxConst.ALIGN_LEFT:
        return {
          paddingTop : 0,
          paddingRight : 1,
          paddingBottom : 0,
          paddingLeft : 1,

          border : this.border_left,
          height : null,
          width : QxConst.CORE_AUTO,
          orientation : QxConst.ORIENTATION_VERTICAL
        };

      case QxConst.ALIGN_RIGHT:
        return {
          paddingTop : 0,
          paddingRight : 1,
          paddingBottom : 0,
          paddingLeft : 1,

          border : this.border_right,
          height : null,
          width : QxConst.CORE_AUTO,
          orientation : QxConst.ORIENTATION_VERTICAL
        };
    };
  }
});

theme.registerAppearance("bar-view-button",
{
  setup : function()
  {
    this.background_color_normal = null;
    this.background_color_checked = new QxColorObject("#FAFBFE");

    this.border_color = new QxColorObject("threedshadow");
    this.border_color_checked = new QxColorObject("#FEC83C");

    this.border_top_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, this.border_color);
    this.border_top_checked.setBottom(3, QxConst.BORDER_STYLE_SOLID, this.border_color_checked);

    this.border_bottom_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, this.border_color);
    this.border_bottom_checked.setTop(3, QxConst.BORDER_STYLE_SOLID, this.border_color_checked);

    this.border_left_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, this.border_color);
    this.border_left_checked.setRight(3, QxConst.BORDER_STYLE_SOLID, this.border_color_checked);

    this.border_right_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, this.border_color);
    this.border_right_checked.setLeft(3, QxConst.BORDER_STYLE_SOLID, this.border_color_checked);
  },

  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "atom"), {
      iconPosition : QxConst.ALIGN_TOP
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
    };

    if (vStates.checked || vStates.over)
    {
      switch(vBarPosition)
      {
        case QxConst.ALIGN_TOP:
          vReturn.border = this.border_top_checked;
          vReturn.paddingTop = 3;
          vReturn.paddingRight = 6;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft = 6;
          break;

        case QxConst.ALIGN_BOTTOM:
          vReturn.border = this.border_bottom_checked;
          vReturn.paddingTop = 1;
          vReturn.paddingRight = 6;
          vReturn.paddingBottom = 3;
          vReturn.paddingLeft = 6;
          break;

        case QxConst.ALIGN_LEFT:
          vReturn.border = this.border_left_checked;
          vReturn.paddingTop = 3;
          vReturn.paddingRight = 4;
          vReturn.paddingBottom = 3;
          vReturn.paddingLeft = 6;
          break;

        case QxConst.ALIGN_RIGHT:
          vReturn.border = this.border_right_checked;
          vReturn.paddingTop = 3;
          vReturn.paddingRight = 6;
          vReturn.paddingBottom = 3;
          vReturn.paddingLeft = 4;
      };
    }
    else
    {
      vReturn.border = null;
      vReturn.paddingTop = vReturn.paddingBottom = 4;
      vReturn.paddingRight = vReturn.paddingLeft = 7;
    };

    switch(vBarPosition)
    {
      case QxConst.ALIGN_TOP:
      case QxConst.ALIGN_BOTTOM:
        vReturn.marginTop = vReturn.marginBottom = 0;
        vReturn.marginRight = vReturn.marginLeft = 1;
        vReturn.width = QxConst.CORE_AUTO;
        vReturn.height = null;
        break;

      case QxConst.ALIGN_LEFT:
      case QxConst.ALIGN_RIGHT:
        vReturn.marginTop = vReturn.marginBottom = 1;
        vReturn.marginRight = vReturn.marginLeft = 0;
        vReturn.height = QxConst.CORE_AUTO;
        vReturn.width = null;
    };

    return vReturn;
  }
});









/*
---------------------------------------------------------------------------
  WINDOW
---------------------------------------------------------------------------
*/

theme.registerAppearance("window",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
    this.color = new QxColorObject("windowtext");
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
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      border : vStates.maximized ? QxBorderObject.presets.none : QxBorderObject.presets.outset
    };
  }
});

theme.registerAppearance("window-captionbar",
{
  setup : function()
  {
    this.bgcolor_active = new QxColorObject("activecaption");
    this.color_active = new QxColorObject("captiontext");
    this.bgcolor_inactive = new QxColorObject("inactivecaption");
    this.color_inactive = new QxColorObject("inactivecaptiontext");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      paddingTop : 1,
      paddingRight : 2,
      paddingBottom : 2,
      paddingLeft : 2,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE,
      height : QxConst.CORE_AUTO,
      overflow : QxConst.OVERFLOW_VALUE_HIDDEN
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      backgroundColor : vStates.active ? this.bgcolor_active : this.bgcolor_inactive,
      color : vStates.active ? this.color_active : this.color_inactive
    };
  }
});

theme.registerAppearance("window-resize-frame",
{
  initial : function(vWidget, vTheme)
  {
    return {
      border : QxBorderObject.presets.shadow
    };
  }
});

theme.registerAppearance("window-captionbar-icon",
{
  initial : function(vWidget, vTheme)
  {
    return {
      marginRight : 2
    };
  }
});

theme.registerAppearance("window-captionbar-title",
{
  setup : function()
  {
    this.font = new QxFont(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    this.font.setBold(true);
  },

  initial : function(vWidget, vTheme)
  {
    return {
      cursor : QxConst.CORE_DEFAULT,
      font : this.font,
      marginRight : 2,
      wrap : false
    };
  }
});

theme.registerAppearance("window-captionbar-button",
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
    };

    return vReturn;
  }
});

theme.registerAppearance("window-captionbar-minimize-button",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "window-captionbar-button");
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "window-captionbar-button");
  }
});

theme.registerAppearance("window-captionbar-restore-button",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "window-captionbar-button");
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "window-captionbar-button");
  }
});

theme.registerAppearance("window-captionbar-maximize-button",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "window-captionbar-button");
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "window-captionbar-button");
  }
});

theme.registerAppearance("window-captionbar-close-button",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "window-captionbar-button"), {
      marginLeft : 2
    });
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "window-captionbar-button");
  }
});

theme.registerAppearance("window-statusbar",
{
  initial : function(vWidget, vTheme)
  {
    return {
      border : QxBorderObject.presets.thinInset,
      height : QxConst.CORE_AUTO
    };
  }
});

theme.registerAppearance("window-statusbar-text",
{
  initial : function(vWidget, vTheme)
  {
    return {
      paddingTop : 1,
      paddingRight : 4,
      paddingBottom : 1,
      paddingLeft : 4,
      cursor : QxConst.CORE_DEFAULT
    };
  }
});










/*
---------------------------------------------------------------------------
  MENU
---------------------------------------------------------------------------
*/

theme.registerAppearance("menu",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("menu");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      width : QxConst.CORE_AUTO,
      height : QxConst.CORE_AUTO,
      backgroundColor : this.bgcolor,
      border : QxBorderObject.presets.outset,
      paddingTop : 1,
      paddingRight : 1,
      paddingBottom : 1,
      paddingLeft : 1
    };
  }
});

theme.registerAppearance("menu-layout",
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
});

theme.registerAppearance("menu-button",
{
  setup : function()
  {
    this.BGCOLOR_OVER = new QxColorObject("highlight");
    this.BGCOLOR_OUT = null;

    this.COLOR_OVER = new QxColorObject("highlighttext");
    this.COLOR_OUT = null;
  },

  initial : function(vWidget, vTheme)
  {
    return {
      minWidth : QxConst.CORE_AUTO,
      height : QxConst.CORE_AUTO,
      spacing : 2,
      paddingTop : 2,
      paddingRight : 4,
      paddingBottom : 2,
      paddingLeft : 4,
      cursor : QxConst.CORE_DEFAULT,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE,
      allowStretchX : true
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      backgroundColor : vStates.over ? this.BGCOLOR_OVER : this.BGCOLOR_OUT,
      color : vStates.over ? this.COLOR_OVER : this.COLOR_OUT
    };
  }
});

theme.registerAppearance("menu-check-box",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "menu-button");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "menu-button");
  }
});

theme.registerAppearance("menu-check-box-icon",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "image");
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      source : vStates.checked ? "widgets/menu/checkbox.gif" : QxConst.IMAGE_BLANK
    };
  }
});

theme.registerAppearance("menu-radio-button",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "menu-button");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "menu-button");
  }
});

theme.registerAppearance("menu-radio-button-icon",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "image");
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      source : vStates.checked ? "widgets/menu/radiobutton.gif" : QxConst.IMAGE_BLANK
    };
  }
});

theme.registerAppearance("menu-separator",
{
  initial : function(vWidget, vTheme)
  {
    return {
      height : QxConst.CORE_AUTO,
      marginTop : 3,
      marginBottom : 2,
      paddingLeft : 3,
      paddingRight : 3
    };
  }
});

theme.registerAppearance("menu-separator-line",
{
  initial : function(vWidget, vTheme)
  {
    return {
      right : 0,
      left : 0,
      height : QxConst.CORE_AUTO,
      border : QxBorderObject.presets.verticalDivider
    };
  }
});








/*
---------------------------------------------------------------------------
  LIST
---------------------------------------------------------------------------
*/

theme.registerAppearance("list",
{
  setup : function()
  {
    this.bgcolor = new QxColor("white");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      overflow : QxConst.OVERFLOW_VALUE_HIDDEN,
      border : QxBorderObject.presets.thinInset,
      backgroundColor : this.bgcolor
    };
  }
});

theme.registerAppearance("list-item",
{
  setup : function()
  {
    this.bgcolor_selected = new QxColorObject("highlight");
    this.color_selected = new QxColorObject("highlighttext");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      cursor : QxConst.CORE_DEFAULT,
      height : QxConst.CORE_AUTO,
      horizontalChildrenAlign : QxConst.ALIGN_LEFT,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE,
      spacing : 4,
      paddingTop : 3,
      paddingRight : 5,
      paddingBottom : 3,
      paddingLeft : 5,
      minWidth : QxConst.CORE_AUTO
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    if (vStates.lead)
    {
      vWidget.setStyleProperty("MozOutline", QxConst.FOCUS_OUTLINE);
      vWidget.setStyleProperty("outline", QxConst.FOCUS_OUTLINE);
    }
    else
    {
      vWidget.removeStyleProperty("MozOutline");
      vWidget.removeStyleProperty("outline");
    };

    return {
      backgroundColor : vStates.selected ? this.bgcolor_selected : null,
      color : vStates.selected ? this.color_selected : null
    };
  }
});








/*
---------------------------------------------------------------------------
  FIELDS
---------------------------------------------------------------------------
*/

theme.registerAppearance("text-field",
{
  setup : function()
  {
    this.font = new QxFont(11, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
  },

  initial : function(vWidget, vTheme)
  {
    return {
      hideFocus : true,
      border : QxBorderObject.presets.thinInset,
      paddingTop : 1,
      paddingRight : 3,
      paddingBottom : 1,
      paddingLeft : 3,
      allowStretchY : false,
      allowStretchX : true,
      font : this.font,
      width : QxConst.CORE_AUTO,
      height : QxConst.CORE_AUTO
    };
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "label");
  }
});

theme.registerAppearance("text-area",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "text-field"), {
      overflow : QxConst.CORE_AUTO
    });
  },

  state : function(vWidget, vTheme) {
    return vTheme.stateFrom(vWidget, "text-field");
  }
});










/*
---------------------------------------------------------------------------
  COMBOBOX
---------------------------------------------------------------------------
*/

theme.registerAppearance("combo-box",
{
  setup : function()
  {
    this.bgcolor = new QxColor("white");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      minWidth : 40,
      width : 120,
      height : QxConst.CORE_AUTO,
      border : QxBorderObject.presets.inset,
      backgroundColor : this.bgcolor,
      allowStretchY : false
    };
  }
});

theme.registerAppearance("combo-box-list",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "list"), {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0,
      border : null,
      overflow : QxConst.OVERFLOW_VALUE_VERTICAL
    });
  }
});

theme.registerAppearance("combo-box-popup",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "list"), {
      height : QxConst.CORE_AUTO,
      maxHeight : 150,
      border : QxBorderObject.presets.shadow
    });
  }
});

theme.registerAppearance("combo-box-text-field",
{
  setup : function()
  {
    this.bgcolor = new QxColor("transparent");
  },

  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "text-field"), {
      border : QxBorder.presets.none,
      width : QxConst.CORE_FLEX,
      backgroundColor : this.bgcolor
    });
  }
});

theme.registerAppearance("combo-box-button",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "button"), {
      height : null,
      allowStretchY : true
    });
  },

  state : function(vWidget, vTheme) {
    return QxUtil.mergeObjectWith(vTheme.stateFrom(vWidget, "button"), {
      paddingTop : 0,
      paddingRight : 3,
      paddingBottom : 0,
      paddingLeft : 2
    });
  }
});







/*
---------------------------------------------------------------------------
  TREE
---------------------------------------------------------------------------
*/

theme.registerAppearance("tree-element",
{
  initial : function(vWidget, vTheme)
  {
    return {
      height : 16,
      verticalChildrenAlign : QxConst.ALIGN_MIDDLE
    };
  }
});

theme.registerAppearance("tree-element-icon",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : 16,
      height : 16
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    // The widget is the icon.
    // We need the property of the QxTreeFile, the QxTreeFolder or of the QxTree
    var vParent = vWidget.getParent();
    while (vParent && !(vParent instanceof QxTreeElement)) {
      vParent = vParent.getParent();
    };

    if (vParent.getIcon())
    {
      return {
        source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
      };
    }
    else
    {
      return {
        source : "icons/16/file-new.png"
      };
    };
  }
});

theme.registerAppearance("tree-element-label",
{
  setup : function()
  {
    this.bgcolor_selected = new QxColorObject("highlight");
    this.color_selected = new QxColorObject("highlighttext");
  },

  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "label"), {
      cursor : QxConst.CORE_DEFAULT,
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
    return QxUtil.mergeObjectWith(vTheme.stateFrom(vWidget, "label"), {
      backgroundColor : vStates.selected ? this.bgcolor_selected : null,
      color : vStates.selected ? this.color_selected : null
    });
  }
});

theme.registerAppearance("tree-folder",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "tree-element");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "tree-element");
  }
});

theme.registerAppearance("tree-folder-icon",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : 16,
      height : 16
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    // The widget is the icon.
    // We need the property of the QxTreeFile, the QxTreeFolder or of the QxTree
    var vParent = vWidget.getParent();
    while (vParent && !(vParent instanceof QxTreeElement)) {
      vParent = vParent.getParent();
    };

    if (vParent.getIcon())
    {
      return {
        source : vStates.selected ? vParent.getIconSelected() || vParent.getIcon() : vParent.getIcon()
      };
    }
    else
    {
      return {
        source : vStates.selected ? "icons/16/folder-open.png" : "icons/16/folder.png"
      };
    };
  }
});

theme.registerAppearance("tree-folder-label",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "tree-element-label");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "tree-element-label");
  }
});

theme.registerAppearance("tree",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "tree-folder");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "tree-folder");
  }
});

theme.registerAppearance("tree-icon",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "tree-folder-icon");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "tree-folder-icon");
  }
});

theme.registerAppearance("tree-label",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "tree-folder-label");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "tree-folder-label");
  }
});

theme.registerAppearance("tree-container",
{
  initial : function(vWidget, vTheme)
  {
    return {
      verticalChildrenAlign : QxConst.ALIGN_TOP
    };
  }
});

theme.registerAppearance("tree-folder-container",
{
  initial : function(vWidget, vTheme)
  {
    return {
      height : QxConst.CORE_AUTO,
      verticalChildrenAlign : QxConst.ALIGN_TOP
    };
  }
});









/*
---------------------------------------------------------------------------
  LISTVIEW
---------------------------------------------------------------------------
*/

theme.registerAppearance("list-view",
{
  initial : function(vWidget, vTheme)
  {
    return {
      cursor : QxConst.CORE_DEFAULT,
      overflow: QxConst.OVERFLOW_VALUE_HIDDEN
    };
  }
});

theme.registerAppearance("list-view-pane",
{
  initial : function(vWidget, vTheme)
  {
    return {
      width : QxConst.CORE_FLEX,
      horizontalSpacing : 1,
      overflow : QxConst.OVERFLOW_VALUE_HIDDEN
    };
  }
});

theme.registerAppearance("list-view-header",
{
  setup : function()
  {
    this.border = new QxBorder;
    this.border.setBottom(1, "solid", "#e2e2e2");

    this.bgcolor = new QxColor("#f2f2f2");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      height : QxConst.CORE_AUTO,
      overflow: QxConst.OVERFLOW_VALUE_HIDDEN,
      border : this.border,
      backgroundColor : this.bgcolor
    };
  }
});

theme.registerAppearance("list-view-header-cell",
{
  setup : function()
  {
    this.border_hover = new QxBorder,
    this.border_hover.setBottom(2, "solid", "#F9B119");

    this.bgcolor_hover = new QxColor("white");
  },

  initial : function(vWidget, vTheme)
  {
    // Text Overflow
    vWidget.setStyleProperty(QxConst.PROPERTY_OVERFLOW_TEXT, QxConst.OVERFLOW_VALUE_ELLIPSIS);

    return {
      overflow : QxConst.OVERFLOW_VALUE_HIDDEN,
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
    };
  }
});

theme.registerAppearance("list-view-header-separator",
{
  setup : function() {
    this.bgcolor = new QxColor("#D6D5D9");
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
});

theme.registerAppearance("list-view-content-cell",
{
  setup : function()
  {
    this.bgcolor_selected = new QxColorObject("highlight");
    this.color_selected = new QxColorObject("highlighttext");
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      backgroundColor : vStates.selected ? this.bgcolor_selected : null,
      color : vStates.selected ? this.color_selected : null
    };
  }
});

theme.registerAppearance("list-view-content-cell-image",
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
});

theme.registerAppearance("list-view-content-cell-text",
{
  initial : function(vWidget, vTheme)
  {
    vWidget.setStyleProperty(QxConst.PROPERTY_WHITESPACE, "nowrap");
    vWidget.setStyleProperty(QxConst.PROPERTY_OVERFLOW_TEXT, QxConst.OVERFLOW_VALUE_ELLIPSIS);

    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "htmlcontainer"), {
      overflow: QxConst.OVERFLOW_VALUE_HIDDEN,
      paddingLeft : 6,
      paddingRight : 6
    });
  },

  state : function(vWidget, vTheme, vStates) {
    return QxUtil.mergeObjectWith(vTheme.stateFrom(vWidget, "htmlcontainer"), vTheme.stateFrom(vWidget, "list-view-content-cell"));
  }
});

theme.registerAppearance("list-view-content-cell-html",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
  }
});

theme.registerAppearance("list-view-content-cell-icon-html",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
  }
});

theme.registerAppearance("list-view-content-cell-link",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "list-view-content-cell-text");
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "list-view-content-cell-text");
  }
});







/*
---------------------------------------------------------------------------
  TABVIEW
---------------------------------------------------------------------------
*/

theme.registerAppearance("tab-view",
{
  initial : function(vWidget, vTheme)
  {
    return {
      spacing : -1
    };
  }
});

theme.registerAppearance("tab-view-bar",
{
  initial : function(vWidget, vTheme)
  {
    return {
      height : QxConst.CORE_AUTO
    };
  }
});

theme.registerAppearance("tab-view-pane",
{
  setup : function()
  {
    this.border = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, "#91A5BD");
    this.bgcolor = new QxColorObject("#FAFBFE");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      height : QxConst.CORE_FLEX,
      backgroundColor : this.bgcolor,
      border : this.border,
      paddingTop : 10,
      paddingRight : 10,
      paddingBottom : 10,
      paddingLeft : 10
    };
  }
});

theme.registerAppearance("tab-view-page",
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
});

theme.registerAppearance("tab-view-button",
{
  setup : function()
  {
    this.bgcolor_normal = new QxColorObject("#E1EEFF");
    this.bgcolor_checked = new QxColorObject("#FAFBFE");

    this.border_top_normal = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, "#91A5BD");
    this.border_top_normal.setBottomWidth(0);

    this.border_top_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, "#91A5BD");
    this.border_top_checked.setBottomWidth(0);
    this.border_top_checked.setTop(3, QxConst.BORDER_STYLE_SOLID, "#FEC83C");

    this.border_bottom_normal = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, "#91A5BD");
    this.border_bottom_normal.setTopWidth(0);

    this.border_bottom_checked = new QxBorder(1, QxConst.BORDER_STYLE_SOLID, "#91A5BD");
    this.border_bottom_checked.setTopWidth(0);
    this.border_bottom_checked.setBottom(3, QxConst.BORDER_STYLE_SOLID, "#FEC83C");
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
      };

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
      };
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
      };

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
      };

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
      };
    };

    return vReturn;
  }
});






/*
---------------------------------------------------------------------------
  FIELDSET
---------------------------------------------------------------------------
*/

theme.registerAppearance("field-set",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.bgcolor
    };
  }
});

theme.registerAppearance("field-set-legend",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
  },

  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "atom"), {
      top : 1,
      left : 10,
      backgroundColor : this.bgcolor,
      paddingRight : 3,
      paddingLeft : 4
    });
  }
});

theme.registerAppearance("field-set-frame",
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
      border : QxBorderObject.presets.groove
    };
  }
});

theme.registerAppearance("check-box-field-set-legend",
{
  setup : function()
  {
    this.bgcolor = new QxColorObject("threedface");
  },

  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "atom"), {
      top : 1,
      left : 10,
      backgroundColor : this.bgcolor,
      paddingRight : 3
    });
  }
});

theme.registerAppearance("radio-button-field-set-legend",
{
  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "check-box-field-set-legend");
  }
});







/*
---------------------------------------------------------------------------
  SPINNER
---------------------------------------------------------------------------
*/

theme.registerAppearance("spinner",
{
  setup : function()
  {
    this.bgcolor = new QxColor("white");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      width : 60,
      height : 22,
      border : QxBorderObject.presets.inset,
      backgroundColor : this.bgcolor
    };
  }
});

theme.registerAppearance("spinner-field",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "text-field"), {
      width : QxConst.CORE_FLEX,
      border : QxBorder.presets.none
    });
  },

  state : function(vWidget, vTheme, vStates) {
    return vTheme.stateFrom(vWidget, "text-field");
  }
});

theme.registerAppearance("spinner-button-up",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "image"),
    {
      height: QxConst.CORE_FLEX,
      width: 16,
      backgroundColor: new QxColorObject("threedface")
    });
  },

  state : function(vWidget, vTheme, vStates)
  {
    return QxUtil.mergeObjectWith(vTheme.stateFrom(vWidget, "button"),
    {
      paddingTop : 0,
      paddingRight : 0,
      paddingBottom: 0,
      paddingLeft : 3
    });
  }
});

theme.registerAppearance("spinner-button-down",
{
  initial : function(vWidget, vTheme)
  {
    return QxUtil.mergeObjectWith(vTheme.initialFrom(vWidget, "image"),
    {
      height: QxConst.CORE_FLEX,
      width: 16,
      backgroundColor: new QxColorObject("threedface")
    });
  },

  state : function(vWidget, vTheme, vStates)
  {
    return QxUtil.mergeObjectWith(vTheme.stateFrom(vWidget, "button"),
    {
      paddingTop : 1,
      paddingRight : 0,
      paddingBottom: 0,
      paddingLeft : 3
    });
  }
});





/*
---------------------------------------------------------------------------
  COLORSELECTOR
---------------------------------------------------------------------------
*/

theme.registerAppearance("colorselector",
{
  setup : function()
  {
    this.border = QxBorderObject.presets.outset;
  },

  initial : function(vWidget, vTheme)
  {
    return {
      border : this.border,
      width: QxConst.CORE_AUTO,
      height: QxConst.CORE_AUTO
    };
  },

  state : function(vWidget, vTheme, vStates)
  {

  }
});

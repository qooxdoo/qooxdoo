/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(guicore)
#require(qx.renderer.font.FontCache)
#after(qx.renderer.font.FontObject)

************************************************************************ */

qx.OO.defineClass("qx.ui.basic.Label", qx.ui.basic.Terminator,
function(vHtml, vMnemonic)
{
  qx.ui.basic.Terminator.call(this);

  // Apply constructor arguments
  if (qx.util.Validation.isValidString(vHtml)) {
    this.setHtml(vHtml);
  }

  if (qx.util.Validation.isValidString(vMnemonic)) {
    this.setMnemonic(vMnemonic);
  }

  // Prohibit stretching through layout handler
  this.setAllowStretchX(false);
  this.setAllowStretchY(false);

  // Auto Sized
  this.auto();
});

qx.Class.COPY_STYLEPROPERTY = "styleproperty";
qx.Class.COPY_COMPUTEDELEMENT = "computedelement";
qx.Class.COPY_LOCALELEMENT = "localelement";

qx.Class._measureNodes = {};





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "label" });

/*!
  Any text string which can contain HTML, too
*/
qx.OO.addProperty({ name : "html", type : qx.constant.Type.STRING });

/*!
  The alignment of the text.
*/
qx.OO.addProperty({ name : "textAlign", type : qx.constant.Type.STRING, defaultValue : "left", possibleValues : [ "left", "center", "right", "justify" ] });

/*!
  The styles which should be copied
*/
qx.OO.addProperty({ name : "fontPropertiesProfile", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.DEFAULT, possibleValues : [ qx.constant.Core.NONE, qx.constant.Core.DEFAULT, "extended", "multiline", "extendedmultiline", "all" ] });

/*!
  A single character which will be underlined inside the text.
*/
qx.OO.addProperty({ name : "mnemonic", type : qx.constant.Type.STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.OO.addProperty({ name : "font", type : qx.constant.Type.OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
qx.OO.addProperty({ name : "wrap", type : qx.constant.Type.BOOLEAN, defaultValue : true });









/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

qx.ui.basic.Label.OVERFLOW_HIDDEN = "hidden";
qx.ui.basic.Label.OVERFLOW_ELLIPSIS = "ellipsis";
qx.ui.basic.Label.SYMBOL_ELLIPSIS = String.fromCharCode(8230);
qx.ui.basic.Label.INNER_TEXT = "innerText";
qx.ui.basic.Label.INNER_HTML = "innerHTML";
qx.ui.basic.Label.SUPPORT_NATIVE_ELLIPSIS = qx.sys.Client.isMshtml();

qx.ui.basic.Label.MNEMONIC_OUT_START = "(<span style=\"text-decoration:underline\">";
qx.ui.basic.Label.MNEMONIC_OUT_STOP = "</span>)";

qx.ui.basic.Label.MNEMONIC_IN_START = "<span style=\"text-decoration:underline\">";
qx.ui.basic.Label.MNEMONIC_IN_STOP = "</span>";

qx.ui.basic.Label.MNEMONIC_TEST1 = "^(((<([^>]|";
qx.ui.basic.Label.MNEMONIC_TEST2 = ")+>)|(&([^;]|";
qx.ui.basic.Label.MNEMONIC_TEST3 = ")+;)|[^&";
qx.ui.basic.Label.MNEMONIC_TEST4 = "])*)(";
qx.ui.basic.Label.MNEMONIC_TEST5 = ")";

qx.ui.basic.Label.MNEMONIC_REGMODE = "i";

// these are the properties what will be copied to the measuring frame.
qx.ui.basic.Label._fontProperties =
{
  "none" : [],

  "default" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration"],
  "extended" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing"],

  "multiline" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration", "lineHeight", "wordWrap"],
  "extendedmultiline" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing", "lineHeight", "wordBreak", "wordWrap", "quotes"],

  "all" : ["fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "letterSpacing", "lineBreak", "lineHeight", "quotes", "textDecoration", "textIndent", "textShadow", "textTransform", "textUnderlinePosition", "whiteSpace", "wordBreak", "wordSpacing", "wordWrap"]
}

qx.ui.basic.Label.BR = "<br/>";
qx.ui.basic.Label.CODE1 = "&#x";
qx.ui.basic.Label.CODE2 = "&#";
qx.ui.basic.Label.TOSTRHELPER = "0x";

qx.ui.basic.Label.htmlToText = function(s) {
  return String(s).replace(/\s+|<([^>])+>|&amp;|&lt;|&gt;|&quot;|&nbsp;|&#[0-9]+;|&#x[0-9a-fA-F];]/gi, qx.ui.basic.Label._htmlToText);
}

qx.ui.basic.Label._htmlToText = function(s)
{
  switch(s)
  {
    case qx.constant.Html.AMPERSAND:
      return qx.constant.Core.AMPERSAND;

    case qx.constant.Html.SMALLER:
      return qx.constant.Core.SMALLER;

    case qx.constant.Html.BIGGER:
      return qx.constant.Core.BIGGER;

    case qx.constant.Html.QUOTE:
      return qx.constant.Core.QUOTE;

    case qx.constant.Html.SPACE:
      return String.fromCharCode(160);

    default:
      if (s.substring(0, 3) == qx.ui.basic.Label.CODE1) {
        return String.fromCharCode(parseInt(qx.ui.basic.Label.TOSTRHELPER + s.substring(3, s.length - 1)));
      }
      else if (s.substring(0, 2) == qx.ui.basic.Label.CODE2) {
        return String.fromCharCode(s.substring(2, s.length - 1));
      }
      else if (/\s+/.test(s)) {
        return qx.constant.Core.SPACE;
      }
      else if (/^<BR/gi.test(s)) {
        return qx.constant.Core.NEWLINE;
      }

      return qx.constant.Core.EMPTY;
  }
}

qx.ui.basic.Label.textToHtml = function(s) {
  return String(s).replace(/&|<|>|\n|\u00A0/g, qx.ui.basic.Label._textToHtml);
}

qx.ui.basic.Label._textToHtml = function(s)
{
  switch(s)
  {
    case qx.constant.Core.AMPERSAND:
      return qx.constant.Html.AMPERSAND;

    case qx.constant.Core.SMALLER:
      return qx.constant.Html.SMALLER;

    case qx.constant.Core.BIGGER:
      return qx.constant.Html.BIGGER;

    case qx.constant.Core.NEWLINE:
      return qx.ui.basic.Label.BR;

    default:
      return qx.constant.Core.SPACE;
  }
}

qx.ui.basic.Label.createMeasureNode = function(vId)
{
  var vNode = qx.ui.basic.Label._measureNodes[vId];

  if (!vNode)
  {
    vNode = document.createElement(qx.constant.Tags.DIV);
    var vStyle = vNode.style;

    vStyle.width = vStyle.height = qx.constant.Core.AUTO;
    vStyle.visibility = qx.constant.Core.HIDDEN;
    vStyle.position = qx.constant.Style.POSITION_ABSOLUTE;
    vStyle.zIndex = "-1";

    document.body.appendChild(vNode);

    qx.ui.basic.Label._measureNodes[vId] = vNode;
  }

  return vNode;
}








/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._htmlMode = false;
qx.Proto._hasMnemonic = false;
qx.Proto._mnemonicHtml = qx.constant.Core.EMPTY;
qx.Proto._mnemonicTest = null;

qx.Proto._modifyHtml = function(propValue, propOldValue, propData)
{
  this._htmlMode = qx.util.Validation.isValidString(propValue) && propValue.match(/<.*>/) ? true : false;

  if (this._isCreated) {
    this._applyContent();
  }

  return true;
}

qx.Proto._modifyTextAlign = function(propValue, propOldValue, propData)
{
  this.setStyleProperty("textAlign", propValue);
  return true;
}

qx.Proto._modifyMnemonic = function(propValue, propOldValue, propData)
{
  this._hasMnemonic = qx.util.Validation.isValidString(propValue) && propValue.length == 1;

  this._mnemonicHtml = this._hasMnemonic ? qx.ui.basic.Label.MNEMONIC_OUT_START + propValue + qx.ui.basic.Label.MNEMONIC_OUT_STOP : qx.constant.Core.EMPTY;
  this._mnemonicTest = this._hasMnemonic ? new RegExp(qx.ui.basic.Label.MNEMONIC_TEST1 + propValue + qx.ui.basic.Label.MNEMONIC_TEST2 + propValue + qx.ui.basic.Label.MNEMONIC_TEST3 + propValue + qx.ui.basic.Label.MNEMONIC_TEST4 + propValue + qx.ui.basic.Label.MNEMONIC_TEST5, qx.ui.basic.Label.MNEMONIC_REGMODE) : null;

  return true;
}

qx.Proto._modifyFont = function(propValue, propOldValue, propData)
{
  this._invalidatePreferredInnerDimensions();

  if (propValue) {
    propValue.applyWidget(this);
  } else if (propOldValue) {
    propOldValue.resetWidget(this);
  }

  return true;
}

qx.Proto._modifyWrap = function(propValue, propOldValue, propData)
{
  this.setStyleProperty(qx.constant.Style.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
  return true;
}





/*
---------------------------------------------------------------------------
  HELPER FOR PREFERRED DIMENSION
---------------------------------------------------------------------------
*/

qx.Proto._computeObjectNeededDimensions = function()
{
  // copy styles
  var vNode = this._copyStyles();

  // prepare html
  var vHtml = this.getHtml();

  // test for mnemonic and fix content
  if (this._hasMnemonic && !this._mnemonicTest.test(vHtml)) {
    vHtml += this._mnemonicHtml;
  }

  // apply html
  vNode.innerHTML = vHtml;

  // store values
  this._cachedPreferredInnerWidth = vNode.scrollWidth;
  this._cachedPreferredInnerHeight = vNode.scrollHeight;
}

qx.Proto._copyStyles = function()
{
  var vProps = this.getFontPropertiesProfile();
  var vNode = qx.ui.basic.Label.createMeasureNode(vProps);
  var vUseProperties=qx.ui.basic.Label._fontProperties[vProps];
  var vUsePropertiesLength=vUseProperties.length-1;
  var vProperty=vUseProperties[vUsePropertiesLength--];

  var vStyle = vNode.style;
  var vTemp;

  if (!vProperty) {
    return vNode;
  }

  do {
    vStyle[vProperty] = qx.util.Validation.isValid(vTemp = this.getStyleProperty([vProperty])) ? vTemp : qx.constant.Core.EMPTY;
  } while(vProperty=vUseProperties[vUsePropertiesLength--]);

  return vNode;
}






/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

qx.Proto._computePreferredInnerWidth = function()
{
  this._computeObjectNeededDimensions();
  return this._cachedPreferredInnerWidth;
}

qx.Proto._computePreferredInnerHeight = function()
{
  this._computeObjectNeededDimensions();
  return this._cachedPreferredInnerHeight;
}






/*
---------------------------------------------------------------------------
  LAYOUT APPLY
---------------------------------------------------------------------------
*/

qx.Proto._postApply = function()
{
  var vHtml = this.getHtml();
  var vElement = this._getTargetNode();
  var vMnemonicMode = 0;

  if (qx.util.Validation.isInvalidString(vHtml)) {
    vElement.innerHTML = qx.constant.Core.EMPTY;
    return;
  }

  if (this._hasMnemonic) {
    vMnemonicMode = this._mnemonicTest.test(vHtml) ? 1 : 2;
  }

  // works only with text, don't use when wrap is enabled
  if (!this._htmlMode && !this.getWrap())
  {
    switch(this._computedWidthType)
    {
      case qx.ui.core.Widget.TYPE_PIXEL:
      case qx.ui.core.Widget.TYPE_PERCENT:
        var vNeeded = this.getPreferredInnerWidth();
        var vInner = this.getInnerWidth();

        if (vInner < vNeeded)
        {
          // test innerText support
          var vUseInnerText = true;

          try {
            vElement.innerText = qx.constant.Core.DEFAULT;
          } catch(ex) {
            vUseInnerText = false;
          }

          vElement.style.overflow = qx.ui.basic.Label.OVERFLOW_HIDDEN;

          if (qx.ui.basic.Label.SUPPORT_NATIVE_ELLIPSIS)
          {
            vElement.style.textOverflow = qx.ui.basic.Label.OVERFLOW_ELLIPSIS;
            vHtml += this._mnemonicHtml;
          }
          else
          {
            var vMeasureNode = this._copyStyles();

            var vSplitString = vHtml.split(qx.constant.Core.SPACE);
            var vSplitLength = vSplitString.length;

            var vWordIterator = 0;
            var vCharaterIterator = 0;

            var vPost = qx.ui.basic.Label.SYMBOL_ELLIPSIS;

            if (vMnemonicMode == 2)
            {
              var vPost = this._mnemonicHtml + vPost;
              vUseInnerText = false;
            }

            // Measure Words (if more than one)
            if (vSplitLength > 1)
            {
              var vSplitTemp = [];

              for (vWordIterator=0; vWordIterator<vSplitLength; vWordIterator++)
              {
                vSplitTemp.push(vSplitString[vWordIterator]);

                vMeasureNode[vUseInnerText ? qx.ui.basic.Label.INNER_TEXT : qx.ui.basic.Label.INNER_HTML] = vSplitTemp.join(qx.constant.Core.SPACE) + vPost;
                if (vMeasureNode.scrollWidth > vInner) {
                  break;
                }
              }

              // Remove last word which does not fit
              vSplitTemp.pop();

              // Building new temportary array
              vSplitTemp = [ vSplitTemp.join(qx.constant.Core.SPACE) ];

              // Extracting remaining string
              vCharaterString = vHtml.replace(vSplitTemp[0], qx.constant.Core.EMPTY);
            }
            else
            {
              var vSplitTemp = [];
              vCharaterString = vHtml;
            }

            var vCharaterLength = vCharaterString.length;

            // Measure Chars
            for (var vCharaterIterator=0; vCharaterIterator<vCharaterLength; vCharaterIterator++)
            {
              vSplitTemp.push(vCharaterString.charAt(vCharaterIterator));

              vMeasureNode[vUseInnerText ? qx.ui.basic.Label.INNER_TEXT : qx.ui.basic.Label.INNER_HTML] = vSplitTemp.join(qx.constant.Core.EMPTY) + vPost;
              if (vMeasureNode.scrollWidth > vInner) {
                break;
              }
            }

            // Remove last char which does not fit
            vSplitTemp.pop();

            // Add mnemonic and ellipsis symbol
            vSplitTemp.push(vPost);

            // Building Final HTML String
            vHtml = vSplitTemp.join(qx.constant.Core.EMPTY);
          }

          break;
        }
        else
        {
          vHtml += this._mnemonicHtml;
        }

        // no break here

      default:
        vElement.style.overflow = qx.constant.Core.EMPTY;

        if (qx.ui.basic.Label.SUPPORT_NATIVE_ELLIPSIS) {
          vElement.style.textOverflow = qx.constant.Core.EMPTY;
        }
    }
  }

  if (vMnemonicMode == 1)
  {
    // re-test: needed to make ellipsis handling correct
    this._mnemonicTest.test(vHtml);
    vHtml = RegExp.$1 + qx.ui.basic.Label.MNEMONIC_IN_START + RegExp.$7 + qx.ui.basic.Label.MNEMONIC_IN_STOP + RegExp.rightContext;
  }

  return this._postApplyHtml(vElement, vHtml, vMnemonicMode);
}


if (qx.sys.Client.isMshtml() || qx.sys.Client.isOpera())
{
  qx.Proto._postApplyHtml = function(vElement, vHtml, vMnemonicMode)
  {
    if (this._htmlMode || vMnemonicMode > 0)
    {
      vElement.innerHTML = vHtml;
    }
    else
    {
      try {
        vElement.textContent = vHtml;
        vElement.innerText = vHtml;
      } catch(ex) {
        vElement.innerHTML = vHtml;
      }
    }
  }
}
else
{
  qx.Proto._postApplyHtml = function(vElement, vHtml, vMnemonicMode)
  {
    if (this._htmlMode || vMnemonicMode > 0)
    {
      vElement.innerHTML = vHtml;
    }
    else
    {
      try {
        vElement.textContent = vHtml;
      } catch(ex) {
        vElement.innerHTML = vHtml;
      }
    }
  }
}

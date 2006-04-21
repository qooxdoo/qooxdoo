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

#package(guicore)
#require(qx.renderer.font.FontObject)
#require(qx.renderer.font.FontCache)

************************************************************************ */

qx.ui.basic.Label = function(vHtml, vMnemonic)
{
  qx.ui.basic.Terminator.call(this);

  // Apply constructor arguments
  if (qx.util.Validation.isValidString(vHtml)) {
    this.setHtml(vHtml);
  };

  if (qx.util.Validation.isValidString(vMnemonic)) {
    this.setMnemonic(vMnemonic);
  };

  // Prohibit stretching through layout handler
  this.setAllowStretchX(false);
  this.setAllowStretchY(false);

  // Auto Sized
  this.auto();
};

qx.ui.basic.Label.extend(qx.ui.basic.Terminator, "qx.ui.basic.Label");

qx.ui.basic.Label.COPY_STYLEPROPERTY = "styleproperty";
qx.ui.basic.Label.COPY_COMPUTEDELEMENT = "computedelement";
qx.ui.basic.Label.COPY_LOCALELEMENT = "localelement";



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.basic.Label.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "label" });

/*!
  Any text string which can contain HTML, too
*/
qx.ui.basic.Label.addProperty({ name : "html", type : qx.Const.TYPEOF_STRING });

/*!
  The alignment of the text.
*/
qx.ui.basic.Label.addProperty({ name : "textAlign", type : qx.Const.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "center", "right", "justify" ] });

/*!
  The styles which should be copied
*/
qx.ui.basic.Label.addProperty({ name : "fontPropertiesProfile", type : qx.Const.TYPEOF_STRING, defaultValue : qx.Const.CORE_DEFAULT, possibleValues : [ qx.Const.CORE_NONE, qx.Const.CORE_DEFAULT, "extended", "multiline", "extendedmultiline", "all" ] });

/*!
  A single character which will be underlined inside the text.
*/
qx.ui.basic.Label.addProperty({ name : "mnemonic", type : qx.Const.TYPEOF_STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.ui.basic.Label.addProperty({ name : "font", type : qx.Const.TYPEOF_OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
qx.ui.basic.Label.addProperty({ name : "wrap", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });









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
};

qx.ui.basic.Label.BR = "<br/>";
qx.ui.basic.Label.CODE1 = "&#x";
qx.ui.basic.Label.CODE2 = "&#";
qx.ui.basic.Label.TOSTRHELPER = "0x";

qx.ui.basic.Label.htmlToText = function(s) {
  return String(s).replace(/\s+|<([^>])+>|&amp;|&lt;|&gt;|&quot;|&nbsp;|&#[0-9]+;|&#x[0-9a-fA-F];]/gi, qx.ui.basic.Label._htmlToText);
};

qx.ui.basic.Label._htmlToText = function(s)
{
  switch(s)
  {
    case qx.Const.HTML_AMPERSAND:
      return qx.Const.CORE_AMPERSAND;

    case qx.Const.HTML_SMALLER:
      return qx.Const.CORE_SMALLER;

    case qx.Const.HTML_BIGGER:
      return qx.Const.CORE_BIGGER;

    case qx.Const.HTML_QUOTE:
      return qx.Const.CORE_QUOTE;

    case qx.Const.HTML_SPACE:
      return String.fromCharCode(160);

    default:
      if (s.substring(0, 3) == qx.ui.basic.Label.CODE1) {
        return String.fromCharCode(parseInt(qx.ui.basic.Label.TOSTRHELPER + s.substring(3, s.length - 1)));
      }
      else if (s.substring(0, 2) == qx.ui.basic.Label.CODE2) {
        return String.fromCharCode(s.substring(2, s.length - 1));
      }
      else if (/\s+/.test(s)) {
        return qx.Const.CORE_SPACE;
      }
      else if (/^<BR/gi.test(s)) {
        return qx.Const.CORE_NEWLINE;
      };

      return qx.Const.CORE_EMPTY;
  };
};

qx.ui.basic.Label.textToHtml = function(s) {
  return String(s).replace(/&|<|>|\n|\u00A0/g, qx.ui.basic.Label._textToHtml);
};

qx.ui.basic.Label._textToHtml = function(s)
{
  switch(s)
  {
    case qx.Const.CORE_AMPERSAND:
      return qx.Const.HTML_AMPERSAND;

    case qx.Const.CORE_SMALLER:
      return qx.Const.HTML_SMALLER;

    case qx.Const.CORE_BIGGER:
      return qx.Const.HTML_BIGGER;

    case qx.Const.CORE_NEWLINE:
      return qx.ui.basic.Label.BR;

    default:
      return qx.Const.CORE_SPACE;
  };
};

qx.ui.basic.Label.init = function()
{
  qx.ui.basic.Label._measureNodes = {};
  qx.ui.basic.Label.createMeasureNode(qx.Const.CORE_DEFAULT);
};

qx.ui.basic.Label.createMeasureNode = function(vId)
{
  var vNode = qx.ui.basic.Label._measureNodes[vId] = document.createElement(qx.Const.CORE_DIV);
  var vStyle = vNode.style;

  vStyle.width = vStyle.height = qx.Const.CORE_AUTO;
  vStyle.visibility = qx.Const.CORE_HIDDEN;
  vStyle.position = qx.Const.CORE_ABSOLUTE;
  vStyle.zIndex = "-1";

  document.body.appendChild(vNode);
};

if (typeof window.application != qx.Const.TYPEOF_UNDEFINED) {
  window.application.addEventListener(qx.Const.EVENT_TYPE_PRE, qx.ui.basic.Label.init);
};









/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._htmlMode = false;
proto._hasMnemonic = false;
proto._mnemonicHtml = qx.Const.CORE_EMPTY;
proto._mnemonicTest = null;

proto._modifyHtml = function(propValue, propOldValue, propData)
{
  this._htmlMode = qx.util.Validation.isValidString(propValue) && propValue.match(/<.*>/) ? true : false;

  if (this._isCreated) {
    this._applyContent();
  };

  return true;
};

proto._modifyTextAlign = function(propValue, propOldValue, propData)
{
  this.setStyleProperty("textAlign", propValue);
  return true;
};

proto._modifyFontPropertiesProfile = function(propValue, propOldValue, propData)
{
  if (!qx.ui.basic.Label._measureNodes[propValue]) {
    qx.ui.basic.Label.createMeasureNode(propValue);
  };

  return true;
};

proto._modifyMnemonic = function(propValue, propOldValue, propData)
{
  this._hasMnemonic = qx.util.Validation.isValidString(propValue) && propValue.length == 1;

  this._mnemonicHtml = this._hasMnemonic ? qx.ui.basic.Label.MNEMONIC_OUT_START + propValue + qx.ui.basic.Label.MNEMONIC_OUT_STOP : qx.Const.CORE_EMPTY;
  this._mnemonicTest = this._hasMnemonic ? new RegExp(qx.ui.basic.Label.MNEMONIC_TEST1 + propValue + qx.ui.basic.Label.MNEMONIC_TEST2 + propValue + qx.ui.basic.Label.MNEMONIC_TEST3 + propValue + qx.ui.basic.Label.MNEMONIC_TEST4 + propValue + qx.ui.basic.Label.MNEMONIC_TEST5, qx.ui.basic.Label.MNEMONIC_REGMODE) : null;

  return true;
};

proto._modifyFont = function(propValue, propOldValue, propData)
{
  this._invalidatePreferredInnerDimensions();

  if (propValue) {
    propValue.applyWidget(this);
  } else if (propOldValue) {
    propOldValue.resetWidget(this);
  };

  return true;
};

proto._modifyWrap = function(propValue, propOldValue, propData)
{
  this.setStyleProperty(qx.Const.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
  return true;
};





/*
---------------------------------------------------------------------------
  HELPER FOR PREFERRED DIMENSION
---------------------------------------------------------------------------
*/

proto._computeObjectNeededDimensions = function()
{
  // copy styles
  var vNode = this._copyStyles();

  // prepare html
  var vHtml = this.getHtml();

  // test for mnemonic and fix content
  if (this._hasMnemonic && !this._mnemonicTest.test(vHtml)) {
    vHtml += this._mnemonicHtml;
  };

  // apply html
  vNode.innerHTML = vHtml;

  // store values
  this._cachedPreferredInnerWidth = vNode.scrollWidth;
  this._cachedPreferredInnerHeight = vNode.scrollHeight;
};

proto._copyStyles = function()
{
  var vProps = this.getFontPropertiesProfile();
  var vNode = qx.ui.basic.Label._measureNodes[vProps];
  var vUseProperties=qx.ui.basic.Label._fontProperties[vProps];
  var vUsePropertiesLength=vUseProperties.length-1;
  var vProperty=vUseProperties[vUsePropertiesLength--];

  var vStyle = vNode.style;
  var vTemp;

  if (!vProperty) {
    return vNode;
  };

  do {
    vStyle[vProperty] = qx.util.Validation.isValid(vTemp = this.getStyleProperty([vProperty])) ? vTemp : qx.Const.CORE_EMPTY;
  } while(vProperty=vUseProperties[vUsePropertiesLength--]);

  return vNode;
};






/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function()
{
  this._computeObjectNeededDimensions();
  return this._cachedPreferredInnerWidth;
};

proto._computePreferredInnerHeight = function()
{
  this._computeObjectNeededDimensions();
  return this._cachedPreferredInnerHeight;
};






/*
---------------------------------------------------------------------------
  LAYOUT APPLY
---------------------------------------------------------------------------
*/

proto._postApply = function()
{
  var vHtml = this.getHtml();
  var vElement = this._getTargetNode();
  var vMnemonicMode = 0;

  if (qx.util.Validation.isInvalidString(vHtml)) {
    vElement.innerHTML = qx.Const.CORE_EMPTY;
    return;
  };

  if (this._hasMnemonic) {
    vMnemonicMode = this._mnemonicTest.test(vHtml) ? 1 : 2;
  };

  // works only with text
  if (!this._htmlMode)
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
            vElement.innerText = qx.Const.CORE_DEFAULT;
          } catch(ex) {
            vUseInnerText = false;
          };

          vElement.style.overflow = qx.ui.basic.Label.OVERFLOW_HIDDEN;

          if (qx.ui.basic.Label.SUPPORT_NATIVE_ELLIPSIS)
          {
            vElement.style.textOverflow = qx.ui.basic.Label.OVERFLOW_ELLIPSIS;
            vHtml += this._mnemonicHtml;
          }
          else
          {
            var vMeasureNode = this._copyStyles();

            var vSplitString = vHtml.split(qx.Const.CORE_SPACE);
            var vSplitLength = vSplitString.length;

            var vWordIterator = 0;
            var vCharaterIterator = 0;

            var vPost = qx.ui.basic.Label.SYMBOL_ELLIPSIS;

            if (vMnemonicMode == 2)
            {
              var vPost = this._mnemonicHtml + vPost;
              vUseInnerText = false;
            };

            // Measure Words (if more than one)
            if (vSplitLength > 1)
            {
              var vSplitTemp = [];

              for (vWordIterator=0; vWordIterator<vSplitLength; vWordIterator++)
              {
                vSplitTemp.push(vSplitString[vWordIterator]);

                vMeasureNode[vUseInnerText ? qx.ui.basic.Label.INNER_TEXT : qx.ui.basic.Label.INNER_HTML] = vSplitTemp.join(qx.Const.CORE_SPACE) + vPost;
                if (vMeasureNode.scrollWidth > vInner) {
                  break;
                };
              };

              // Remove last word which does not fit
              vSplitTemp.pop();

              // Building new temportary array
              vSplitTemp = [ vSplitTemp.join(qx.Const.CORE_SPACE) ];

              // Extracting remaining string
              vCharaterString = vHtml.replace(vSplitTemp[0], qx.Const.CORE_EMPTY);
            }
            else
            {
              var vSplitTemp = [];
              vCharaterString = vHtml;
            };

            var vCharaterLength = vCharaterString.length;

            // Measure Chars
            for (var vCharaterIterator=0; vCharaterIterator<vCharaterLength; vCharaterIterator++)
            {
              vSplitTemp.push(vCharaterString.charAt(vCharaterIterator));

              vMeasureNode[vUseInnerText ? qx.ui.basic.Label.INNER_TEXT : qx.ui.basic.Label.INNER_HTML] = vSplitTemp.join(qx.Const.CORE_EMPTY) + vPost;
              if (vMeasureNode.scrollWidth > vInner) {
                break;
              };
            };

            // Remove last char which does not fit
            vSplitTemp.pop();

            // Add mnemonic and ellipsis symbol
            vSplitTemp.push(vPost);

            // Building Final HTML String
            vHtml = vSplitTemp.join(qx.Const.CORE_EMPTY);
          };

          break;
        }
        else
        {
          vHtml += this._mnemonicHtml;
        };

        // no break here

      default:
        vElement.style.overflow = qx.Const.CORE_EMPTY;

        if (qx.ui.basic.Label.SUPPORT_NATIVE_ELLIPSIS) {
          vElement.style.textOverflow = qx.Const.CORE_EMPTY;
        };
    };
  };

  if (vMnemonicMode == 1)
  {
    // re-test: needed to make ellipsis handling correct
    this._mnemonicTest.test(vHtml);
    vHtml = RegExp.$1 + qx.ui.basic.Label.MNEMONIC_IN_START + RegExp.$7 + qx.ui.basic.Label.MNEMONIC_IN_STOP + RegExp.rightContext;
  };

  return this._postApplyHtml(vElement, vHtml, vMnemonicMode);
};


if (qx.sys.Client.isMshtml() || qx.sys.Client.isOpera())
{
  proto._postApplyHtml = function(vElement, vHtml, vMnemonicMode)
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
      };
    };
  };
}
else
{
  proto._postApplyHtml = function(vElement, vHtml, vMnemonicMode)
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
      };
    };
  };
};

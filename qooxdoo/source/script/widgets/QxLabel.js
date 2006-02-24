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
#require(QxEmu)
#require(QxFontObject)
#require(QxFontCache)
#post(QxLabelCore)

************************************************************************ */

function QxLabel(vHtml, vMnemonic)
{
  QxTerminator.call(this);

  // Apply constructor arguments
  if (QxUtil.isValidString(vHtml)) {
    this.setHtml(vHtml);
  };

  if (QxUtil.isValidString(vMnemonic)) {
    this.setMnemonic(vMnemonic);
  };

  // Prohibit stretching through layout handler
  this.setAllowStretchX(false);
  this.setAllowStretchY(false);

  // Auto Sized
  this.auto();
};

QxLabel.extend(QxTerminator, "QxLabel");

QxLabel.COPY_STYLEPROPERTY = "styleproperty";
QxLabel.COPY_COMPUTEDELEMENT = "computedelement";
QxLabel.COPY_LOCALELEMENT = "localelement";



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxLabel.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "label" });

/*!
  Any text string which can contain HTML, too
*/
QxLabel.addProperty({ name : "html", type : QxConst.TYPEOF_STRING });

/*!
  The alignment of the text.
*/
QxLabel.addProperty({ name : "textAlign", type : QxConst.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "center", "right", "justify" ] });

/*!
  The styles which should be copied
*/
QxLabel.addProperty({ name : "fontPropertiesProfile", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_DEFAULT, possibleValues : [ QxConst.CORE_NONE, QxConst.CORE_DEFAULT, "extended", "multiline", "extendedmultiline", "all" ] });

/*!
  A single character which will be underlined inside the text.
*/
QxLabel.addProperty({ name : "mnemonic", type : QxConst.TYPEOF_STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
QxLabel.addProperty({ name : "font", type : QxConst.TYPEOF_OBJECT, instance : "QxFont", convert : QxFontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
QxLabel.addProperty({ name : "wrap", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });



/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

QxLabel.OVERFLOW_HIDDEN = "hidden";
QxLabel.OVERFLOW_ELLIPSIS = "ellipsis";
QxLabel.SYMBOL_ELLIPSIS = String.fromCharCode(8230);
QxLabel.INNER_TEXT = "innerText";
QxLabel.INNER_HTML = "innerHTML";
QxLabel.SUPPORT_NATIVE_ELLIPSIS = QxClient.isMshtml();

QxLabel.MNEMONIC_OUT_START = "(<span style=\"text-decoration:underline\">";
QxLabel.MNEMONIC_OUT_STOP = "</span>)";

QxLabel.MNEMONIC_IN_START = "<span style=\"text-decoration:underline\">";
QxLabel.MNEMONIC_IN_STOP = "</span>";

QxLabel.MNEMONIC_TEST1 = "^(((<([^>]|";
QxLabel.MNEMONIC_TEST2 = ")+>)|(&([^;]|";
QxLabel.MNEMONIC_TEST3 = ")+;)|[^&";
QxLabel.MNEMONIC_TEST4 = "])*)(";
QxLabel.MNEMONIC_TEST5 = ")";

QxLabel.MNEMONIC_REGMODE = "i";

// these are the properties what will be copied to the measuring frame.
QxLabel._fontProperties =
{
  "none" : [],

  "default" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration"],
  "extended" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing"],

  "multiline" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration", "lineHeight", "wordWrap"],
  "extendedmultiline" : ["fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing", "lineHeight", "wordBreak", "wordWrap", "quotes"],

  "all" : ["fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "letterSpacing", "lineBreak", "lineHeight", "quotes", "textDecoration", "textIndent", "textShadow", "textTransform", "textUnderlinePosition", "whiteSpace", "wordBreak", "wordSpacing", "wordWrap"]
};




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._htmlMode = false;
proto._hasMnemonic = false;
proto._mnemonicHtml = QxConst.CORE_EMPTY;
proto._mnemonicTest = null;

proto._modifyHtml = function(propValue, propOldValue, propData)
{
  this._htmlMode = QxUtil.isValidString(propValue) && propValue.match(/<.*>/) ? true : false;

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
  if (!QxLabel._measureNodes[propValue]) {
    QxLabel.createMeasureNode(propValue);
  };

  return true;
};

proto._modifyMnemonic = function(propValue, propOldValue, propData)
{
  this._hasMnemonic = QxUtil.isValidString(propValue) && propValue.length == 1;

  this._mnemonicHtml = this._hasMnemonic ? QxLabel.MNEMONIC_OUT_START + propValue + QxLabel.MNEMONIC_OUT_STOP : QxConst.CORE_EMPTY;
  this._mnemonicTest = this._hasMnemonic ? new RegExp(QxLabel.MNEMONIC_TEST1 + propValue + QxLabel.MNEMONIC_TEST2 + propValue + QxLabel.MNEMONIC_TEST3 + propValue + QxLabel.MNEMONIC_TEST4 + propValue + QxLabel.MNEMONIC_TEST5, QxLabel.MNEMONIC_REGMODE) : null;

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
  this.setStyleProperty(QxConst.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
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
  var vNode = QxLabel._measureNodes[vProps];
  var vUseProperties=QxLabel._fontProperties[vProps];
  var vUsePropertiesLength=vUseProperties.length-1;
  var vProperty=vUseProperties[vUsePropertiesLength--];

  var vStyle = vNode.style;
  var vTemp;

  if (!vProperty) {
    return vNode;
  };

  do {
    vStyle[vProperty] = QxUtil.isValid(vTemp = this.getStyleProperty([vProperty])) ? vTemp : QxConst.CORE_EMPTY;
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

  if (QxUtil.isInvalidString(vHtml)) {
    vElement.innerHTML = QxConst.CORE_EMPTY;
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
      case QxWidget.TYPE_PIXEL:
      case QxWidget.TYPE_PERCENT:
        var vNeeded = this.getPreferredInnerWidth();
        var vInner = this.getInnerWidth();

        if (vInner < vNeeded)
        {
          // test innerText support
          var vUseInnerText = true;

          try {
            vElement.innerText = QxConst.CORE_DEFAULT;
          } catch(ex) {
            vUseInnerText = false;
          };

          vElement.style.overflow = QxLabel.OVERFLOW_HIDDEN;

          if (QxLabel.SUPPORT_NATIVE_ELLIPSIS)
          {
            vElement.style.textOverflow = QxLabel.OVERFLOW_ELLIPSIS;
            vHtml += this._mnemonicHtml;
          }
          else
          {
            var vMeasureNode = this._copyStyles();

            var vSplitString = vHtml.split(QxConst.CORE_SPACE);
            var vSplitLength = vSplitString.length;

            var vWordIterator = 0;
            var vCharaterIterator = 0;

            var vPost = QxLabel.SYMBOL_ELLIPSIS;

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

                vMeasureNode[vUseInnerText ? QxLabel.INNER_TEXT : QxLabel.INNER_HTML] = vSplitTemp.join(QxConst.CORE_SPACE) + vPost;
                if (vMeasureNode.scrollWidth > vInner) {
                  break;
                };
              };

              // Remove last word which does not fit
              vSplitTemp.pop();

              // Building new temportary array
              vSplitTemp = [ vSplitTemp.join(QxConst.CORE_SPACE) ];

              // Extracting remaining string
              vCharaterString = vHtml.replace(vSplitTemp[0], QxConst.CORE_EMPTY);
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

              vMeasureNode[vUseInnerText ? QxLabel.INNER_TEXT : QxLabel.INNER_HTML] = vSplitTemp.join(QxConst.CORE_EMPTY) + vPost;
              if (vMeasureNode.scrollWidth > vInner) {
                break;
              };
            };

            // Remove last char which does not fit
            vSplitTemp.pop();

            // Add mnemonic and ellipsis symbol
            vSplitTemp.push(vPost);

            // Building Final HTML String
            vHtml = vSplitTemp.join(QxConst.CORE_EMPTY);
          };

          break;
        }
        else
        {
          vHtml += this._mnemonicHtml;
        };

        // no break here

      default:
        vElement.style.overflow = QxConst.CORE_EMPTY;

        if (QxLabel.SUPPORT_NATIVE_ELLIPSIS) {
          vElement.style.textOverflow = QxConst.CORE_EMPTY;
        };
    };
  };

  if (vMnemonicMode == 1)
  {
    // re-test: needed to make ellipsis handling correct
    this._mnemonicTest.test(vHtml);
    vHtml = RegExp.$1 + QxLabel.MNEMONIC_IN_START + RegExp.$7 + QxLabel.MNEMONIC_IN_STOP + RegExp.rightContext;
  };

  return this._postApplyHtml(vElement, vHtml, vMnemonicMode);
};


if (QxClient.isMshtml() || QxClient.isOpera())
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

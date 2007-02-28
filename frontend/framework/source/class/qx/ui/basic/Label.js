/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

qx.Clazz.define("qx.ui.basic.Label",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml, vMnemonic)
  {
    this.base(arguments);

    // Apply constructor arguments
    if (vHtml != null) {
      this.setHtml(vHtml);
    }

    if (vMnemonic != null) {
      this.setMnemonic(vMnemonic);
    }

    // Prohibit stretching through layout handler
    this.setAllowStretchX(false);
    this.setAllowStretchY(false);

    // Auto Sized
    this.auto();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    _measureNodes : {},

    /* ************************************************************************
       Class data, properties and methods
    ************************************************************************ */

    /*
    ---------------------------------------------------------------------------
      DATA
    ---------------------------------------------------------------------------
    */

    SYMBOL_ELLIPSIS : String.fromCharCode(8230),

    // these are the properties what will be copied to the measuring frame.
    _fontProperties :
    {
      "none" : [],
      "default" : [ "fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration" ],

      "extended" : [ "fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing" ],

      "multiline" : [ "fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration", "lineHeight", "wordWrap" ],

      "extendedmultiline" : [ "fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "textDecoration", "textTransform", "whiteSpace", "wordSpacing", "lineHeight", "wordBreak", "wordWrap", "quotes" ],

      "all" : [ "fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "letterSpacing", "lineBreak", "lineHeight", "quotes", "textDecoration", "textIndent", "textShadow", "textTransform", "textUnderlinePosition", "whiteSpace", "wordBreak", "wordSpacing", "wordWrap" ]
    },


    /**
     * TODOC
     *
     * @type static
     * @param vId {var} TODOC
     * @return {var} TODOC
     */
    createMeasureNode : function(vId)
    {
      var vNode = qx.ui.basic.Label._measureNodes[vId];

      if (!vNode)
      {
        vNode = document.createElement("div");
        var vStyle = vNode.style;

        vStyle.width = vStyle.height = "auto";
        vStyle.visibility = "hidden";
        vStyle.position = "absolute";
        vStyle.zIndex = "-1";

        document.body.appendChild(vNode);

        qx.ui.basic.Label._measureNodes[vId] = vNode;
      }

      return vNode;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "label"
    },


    /** Any text string which can contain HTML, too */
    html : { _legacy : true },


    /** The alignment of the text. */
    textAlign :
    {
      _legacy        : true,
      type           : "string",
      defaultValue   : "left",
      possibleValues : [ "left", "center", "right", "justify" ]
    },


    /** The styles which should be copied */
    fontPropertiesProfile :
    {
      _legacy : true,
      type : "string",
      defaultValue : "default",

      possibleValues : [ "none", "default", "extended", "multiline", "extendedmultiline", "all" ]
    },


    /** A single character which will be underlined inside the text. */
    mnemonic :
    {
      _legacy : true,
      type    : "string"
    },


    /** The font property describes how to paint the font on the widget. */
    font :
    {
      _legacy                : true,
      type                   : "object",
      instance               : "qx.renderer.font.Font",
      convert                : qx.renderer.font.FontCache.convert,
      allowMultipleArguments : true
    },


    /** Wrap the text? */
    wrap :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /* ************************************************************************
       Instance data, properties and methods
    ************************************************************************ */

    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    _localized : false,
    _htmlContent : "",
    _htmlMode : false,
    _hasMnemonic : false,
    _mnemonicHtml : "",
    _mnemonicTest : null,


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyHtml : function(propValue, propOldValue, propData)
    {
      this._localized = this.getHtml() instanceof qx.locale.LocalizedString;
      this._updateHtml();
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateHtml : function()
    {
      if (this._localized)
      {
        this._htmlContent = this.getHtml().toString();
        qx.locale.Manager.getInstance().addEventListener("changeLocale", this._updateHtml, this);
      }
      else
      {
        this._htmlContent = this.getHtml() || "";
        qx.locale.Manager.getInstance().removeEventListener("changeLocale", this._updateHtml, this);
      }

      this._htmlMode = qx.util.Validation.isValidString(this._htmlContent) && this._htmlContent.match(/<.*>/) ? true : false;

      if (this._isCreated) {
        this._applyContent();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyTextAlign : function(propValue, propOldValue, propData)
    {
      this.setStyleProperty("textAlign", propValue);
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMnemonic : function(propValue, propOldValue, propData)
    {
      this._hasMnemonic = qx.util.Validation.isValidString(propValue) && propValue.length == 1;

      this._mnemonicHtml = this._hasMnemonic ? "(<span style=\"text-decoration:underline\">" + propValue + "</span>)" : "";
      this._mnemonicTest = this._hasMnemonic ? new RegExp("^(((<([^>]|" + propValue + ")+>)|(&([^;]|" + propValue + ")+;)|[^&" + propValue + "])*)(" + propValue + ")", "i") : null;

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFont : function(propValue, propOldValue, propData)
    {
      this._invalidatePreferredInnerDimensions();

      if (propValue) {
        propValue._applyWidget(this);
      } else if (propOldValue) {
        propOldValue._resetWidget(this);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyWrap : function(propValue, propOldValue, propData)
    {
      this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      HELPER FOR PREFERRED DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _computeObjectNeededDimensions : function()
    {
      // copy styles
      var vNode = this._copyStyles();

      // prepare html
      var vHtml = this._htmlContent;

      // test for mnemonic and fix content
      if (this._hasMnemonic && !this._mnemonicTest.test(vHtml)) {
        vHtml += this._mnemonicHtml;
      }

      // apply html
      vNode.innerHTML = vHtml;

      // store values
      this._cachedPreferredInnerWidth = vNode.scrollWidth;
      this._cachedPreferredInnerHeight = vNode.scrollHeight;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _copyStyles : function()
    {
      var vProps = this.getFontPropertiesProfile();
      var vNode = qx.ui.basic.Label.createMeasureNode(vProps);
      var vUseProperties = qx.ui.basic.Label._fontProperties[vProps];
      var vUsePropertiesLength = vUseProperties.length - 1;
      var vProperty = vUseProperties[vUsePropertiesLength--];

      var vStyle = vNode.style;
      var vTemp;

      if (!vProperty) {
        return vNode;
      }

      do {
        vStyle[vProperty] = qx.util.Validation.isValid(vTemp = this.getStyleProperty([ vProperty ])) ? vTemp : "";
      } while (vProperty = vUseProperties[vUsePropertiesLength--]);

      return vNode;
    },




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerWidth : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerWidth;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerHeight : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerHeight;
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT APPLY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    _postApply : function()
    {
      var vHtml = this._htmlContent;
      var vElement = this._getTargetNode();
      var vMnemonicMode = 0;

      if (qx.util.Validation.isInvalidString(vHtml))
      {
        vElement.innerHTML = "";
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
            // carstenl: enabled truncation code for flex sizing, too. Appears to work except for the
            //          truncation code (gecko version), which I have disabled (see below).
          case qx.ui.core.Widget.TYPE_FLEX:
            var vNeeded = this.getPreferredInnerWidth();
            var vInner = this.getInnerWidth();

            if (vInner < vNeeded)
            {
              vElement.style.overflow = "hidden";

              if (qx.core.Variant.isSet("qx.client", "mshtml"))
              {
                vElement.style.textOverflow = "ellipsis";
                vHtml += this._mnemonicHtml;
              }
              else
              {
                var vMeasureNode = this._copyStyles();

                var vSplitString = vHtml.split(" ");
                var vSplitLength = vSplitString.length;

                var vWordIterator = 0;
                var vCharaterIterator = 0;

                var vPost = qx.ui.basic.Label.SYMBOL_ELLIPSIS;

                var vUseInnerText = true;

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

                    var vLabelText = vSplitTemp.join(" ") + vPost;

                    if (vUseInnerText) {
                      qx.dom.Element.setTextContent(vMeasureNode, vLabelText);
                    } else {
                      vMeasureNode.innerHTML = vLabelText;
                    }

                    if (
                    /* carstenl: The following code (truncate the text to fit in the available
                     *           space, append ellipsis to indicate truncation) did not reliably
                     *           work in my tests. Problem was that sometimes the measurer returned
                     *           insanely high values for short texts, like "I..." requiring 738 px.
                     *
                     *           I don't have time to examine this code in detail. Since all of my
                     *           tests used flex width and the truncation code never was intended
                     *           for this, I am disabling truncation if flex is active.
                     */

                    (vMeasureNode.scrollWidth > vInner) && (this._computedWidthType != qx.ui.core.Widget.TYPE_FLEX)) {
                      break;
                    }
                  }

                  // Remove last word which does not fit
                  vSplitTemp.pop();

                  // Building new temportary array
                  vSplitTemp = [ vSplitTemp.join(" ") ];

                  // Extracting remaining string
                  vCharaterString = vHtml.replace(vSplitTemp[0], "");
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

                  var vLabelText = vSplitTemp.join("") + vPost;

                  if (vUseInnerText) {
                    qx.dom.Element.setTextContent(vMeasureNode, vLabelText);
                  } else {
                    vMeasureNode.innerHTML = vLabelText;
                  }

                  if (vMeasureNode.scrollWidth > vInner) {
                    break;
                  }
                }

                // Remove last char which does not fit
                vSplitTemp.pop();

                // Add mnemonic and ellipsis symbol
                vSplitTemp.push(vPost);

                // Building Final HTML String
                vHtml = vSplitTemp.join("");
              }

              break;
            }
            else
            {
              vHtml += this._mnemonicHtml;
            }

            // no break here

          default:
            vElement.style.overflow = "";

            if (qx.core.Variant.isSet("qx.client", "mshtml")) {
              vElement.style.textOverflow = "";
            }
        }
      }

      if (vMnemonicMode == 1)
      {
        // re-test: needed to make ellipsis handling correct
        this._mnemonicTest.test(vHtml);
        vHtml = RegExp.$1 + "<span style=\"text-decoration:underline\">" + RegExp.$7 + "</span>" + RegExp.rightContext;
      }

      return this._postApplyHtml(vElement, vHtml, vMnemonicMode);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vElement {var} TODOC
     * @param vHtml {var} TODOC
     * @param vMnemonicMode {var} TODOC
     * @return {void}
     */
    _postApplyHtml : function(vElement, vHtml, vMnemonicMode)
    {
      if (this._htmlMode || vMnemonicMode > 0) {
        vElement.innerHTML = vHtml;
      }
      else
      {
        try {
          qx.dom.Element.setTextContent(vElement, vHtml);
        } catch(ex) {
          vElement.innerHTML = vHtml;
        }
      }
    }
  }
});

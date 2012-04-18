/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Michael Haitz (mhaitz)
     * Jonathan Weiß (jonathan_rass)

   Contributors:
     * Petr Kobalicek (e666e)

************************************************************************ */

/* ************************************************************************

#asset(qx/static/blank.html)

************************************************************************ */

/**
 * Low-level Rich text editor which can be used by connecting it to an
 * existing DOM element (DIV node).
 * This component does not contain any {@link qx.ui} code resulting in a
 * smaller footprint.
 *
 *
 * Optimized for the use at a traditional webpage.
 */
qx.Class.define("qx.bom.htmlarea.HtmlArea",
{
  extend : qx.core.Object,

  /*
   * IMPORTANT NOTE
   * If you add functionality which manipulates the content of the HtmlArea
   * AND you want make these changes undo-/redo-able you have to make sure
   * to implement methods in the "Manager" and "UndoManager" classes.
   */

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Constructor
   *
   * @param element {Element} DOM element to connect the component to
   * @param value {String} Initial content
   * @param styleInformation {String | Map | null} Optional style information for the editor's document
   *                                               Can be a string or a map (example: { "p" : "padding:2px" }
   * @param source {String} source of the iframe
   *
   * @lint ignoreDeprecated(_keyCodeToIdentifierMap)
   */
  construct : function(element, value, styleInformation, source)
  {
    this.base(arguments);

    var uri = source || qx.util.ResourceManager.getInstance().toUri(qx.core.Environment.get("qx.blankpage"));

    this.__connectToDomElement(element);
    this.__initDocumentSkeletonParts();
    this._createAndAddIframe(uri);

    // catch load event
    this._addIframeLoadListener();

    // set the optional style information - if available
    this.__styleInformation = qx.bom.htmlarea.HtmlArea.__formatStyleInformation(styleInformation);

    // Check content
    if (qx.lang.Type.isString(value)) {
      this.__value = value;
    }

    /*
     * Build up this commandManager object to stack all commands
     * which are arriving before the "real" commandManager is initialised.
     * Once initialised the stacked commands will be executed.
     */
    this.__commandManager = this.__createStackCommandManager();
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * Thrown when the editor is loaded.
     */
    "load"             : "qx.event.type.Event",

    /**
     * Thrown when the editor gets an error at loading time.
     */
    "loadingError"     : "qx.event.type.Data",

    /**
     * Only available if messengerMode is active. This event returns the current content of the editor.
     */
    "messengerContent" : "qx.event.type.Data",

    /**
     * This event holds a data map which informs about the formatting at the
     * current cursor position. It holds the following keys:
     *
     * * bold
     * * italic
     * * underline
     * * strikethrough
     * * fontSize
     * * fontFamily
     * * insertUnorderedList
     * * insertOrderedList
     * * justifyLeft
     * * justifyCenter
     * * justifyRight
     * * justifyFull
     *
     * This map can be used to control/update a toolbar states.
     */
    "cursorContext"    : "qx.event.type.Data",

    /**
     * This event is dispatched when the editor is ready to use
     */
    "ready"            : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor is ready to use after it was
     * re-located and re-initialized. Only implemented for Gecko browsers.
     */
    "readyAfterInvalid" : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets the focus and his own handling is done
     */
    "focused"          : "qx.event.type.Event",


    /**
     * This event is dispatched when the document receives an "focusout" event
     */
    "focusOut"         : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets a right click.
     *
     * Fires a data event with the following data:
     *
     * * x - absolute x coordinate
     * * y - absolute y coordinate
     * * relX - relative x coordinate
     * * relY - relative y coordinate
     * * target - DOM element target
     */
    "contextmenu"      : "qx.event.type.Data",

    /**
     * Holds information about the state of undo/redo
     * Keys are "undo" and "redo".
     * Possible values are 0 and -1 to stay in sync with
     * the kind the "cursorContext" event works.
     * (1 = active/pressed, 0 = possible/not pressed, -1 = disabled)
     */
    "undoRedoState"    : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    // Inserted when the property "insertParagraphOnLinebreak" is false
    simpleLinebreak : "<br>",

    EMPTY_DIV : "<div></div>",

    // regex to extract text content from innerHTML
    GetWordsRegExp     : /([^\u0000-\u0040\u005b-\u005f\u007b-\u007f]|['])+/g,
    CleanupWordsRegExp : /[\u0000-\u0040]/gi,

    /** Map with infos about hotkey methods */
    hotkeyInfo :
    {
      bold : { method: "setBold" },
      italic : { method: "setItalic" },
      underline : { method: "setUnderline" },
      undo : { method: "undo" },
      redo : { method: "redo" }
    },

    /**
     * Formats the style information. If the styleInformation was passed
     * in as a map it gets converted to a string.
     *
     * @type static
     * @param styleInformation {Map} CSS styles which should be applied at startup of the editor
     * @return {String}
     */
    __formatStyleInformation : function (styleInformation)
    {
      if (styleInformation == null || styleInformation == "")
      {
        return "";
      }
      else if (typeof styleInformation == "object")
      {
        var str = "";
        for (var i in styleInformation)
        {
          str += i + " { " + styleInformation[i] + " }";
        }
        return str;
      }
      else
      {
        return styleInformation;
      }
    },

    /**
     * Parse style string to map.
     *
     * Example:
     * qx.bom.htmlarea.HtmlArea.__parseStyle("text-align: left; text-weight: bold;");
     *
     * @type static
     * @param str {String} String that contain valid style informations separated by ";"
     * @return {Map} Map of style names and it's values
     */
    __parseStyle: function(str)
    {
      var map = {};
      var a = str.split(";");
      var i;

      for (i = 0; i < a.length; i++)
      {
        var style = a[i], sep = style.indexOf(":");

        if (sep === -1) {
          continue;
        }

        var name =  qx.lang.String.trim(style.substring(0, sep));
        var value = qx.lang.String.trim(style.substring(sep+1, style.length));

        if (name && value) {
          map[name] = value;
        }

      }

      return map;
    },

    /**
     * Get html content (own recursive method)
     *
     * @type static
     * @param root {Node} Root node (starting point)
     * @param outputRoot {Boolean} Controls whether the root node is also added to the output
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @param postProcess {function} optional function to call which is executed with every element processing
     * @return {String} Content of current node
     */
    __getHtml : function(root, outputRoot, skipHtmlEncoding, postProcess)
    {
      // String builder is array for large text content
      var html = [];

      switch(root.nodeType)
      {
        // This is main area for returning html from iframe content. Content
        // from editor can be sometimes ugly, so it's needed to do some
        // postProcess to make it beautiful.
        //
        // The initial version of this function used direct HTML rendering
        // (each tag was rendered). This sometimes caused to render empty
        // elements. I'm introducing here new method - store tag name and
        // attributes and use some logic to render them (or not).

        // Node.ELEMENT_NODE
        case 1:
        // Node.DOCUMENT_FRAGMENT_NODE
        case 11:

          // for() helper variable
          var i;
          // Tag in lowercase
          var tag = root.tagName.toLowerCase();
          // Attributes map
          var attributes = {};
          // Styles map (order is not important here)
          var styles = {};
          // It's self-closing tag ? (<br />, <img />, ...)
          var closed = (!(root.hasChildNodes() || qx.bom.htmlarea.HtmlArea.__needsClosingTag(root)));

          if (outputRoot)
          {
            // --------------------------------------------------------------
            // get all of the children nodes of the div placeholder
            // but DO NOT return the placeholder div elements itself.
            // This special case is only relevant for IE browsers
            // --------------------------------------------------------------

            if ((qx.core.Environment.get("engine.name") == "mshtml"))
            {
              if (tag == "div" && root.className && root.className == "placeholder")
              {
                for (i=root.firstChild; i; i=i.nextSibling)
                {
                  html.push(qx.bom.htmlarea.HtmlArea.__getHtml(i, true, skipHtmlEncoding, postProcess));
                }
                return html.join("");
              }
            }

            // --------------------------------------------------------------
            // Parse attributes
            // --------------------------------------------------------------

            // Attributes list
            var attrs = root.attributes;
            var len = attrs.length;
            // Current attribute
            var a;

            if ((qx.core.Environment.get("engine.name") == "gecko"))
            {
              // we can leave out all auto-generated empty span elements which are marked dirty
              if (tag == "span" && len == 1 && attrs[0].name == "_moz_dirty" && root.childNodes.length == 0) {
                return "";
              }
            }

            for (i = 0; i < len; i++)
            {
              a = attrs[i];

              // TODO: Document this, I don't know what "specified" means
              if (!a.specified) {
                continue;
              }

              // Attribute name and value pair
              var name = qx.dom.Node.getName(a);
              var value = a.nodeValue;

              // Mozilla reports some special tags here; we don't need them.
              if (/(_moz|contenteditable)/.test(name))
              {
                continue;
              }

              if (name != "style")
              {
                if (qx.core.Environment.get("engine.name") == "mshtml")
                {
                  if (name == "id" && root.getAttribute("old_id"))
                  {
                    value = root.getAttribute("old_id");
                  }
                  else if (!isNaN(value))
                  {
                    // IE5: buggy on number values
                    // XXX: IE: String, Object, Number, Boolean, ... !!!
                    // XXX: Moz: String only
                    value = root.getAttribute(name);
                  }
                  else
                  {
                    value = a.nodeValue;
                  }
                }
                else
                {
                  value = a.nodeValue;
                }
              }
              else
              {
                // IE fails to put style in attributes list
                // FIXME: cssText reported by IE is UPPERCASE
                value = root.style.cssText;
              }

              if (/(_moz|^$)/.test(value))
              {
                // Mozilla reports some special tags
                // here; we don't need them.
                continue;
              }

              // Ignore old id
              if (name == "old_id") {
                continue;
              }

              // Ignore attributes with no values
              if (!value) {
                continue;
              }

              // ignore focus marker
              if (name == "id" && value == "__elementToFocus__") {
                continue;
              }

              // Ignore qooxdoo attributes (for example $$hash)
              if (name.charAt(0) === "$") {
                continue;
              }

              // Interesting attrubutes are added to attributes array
              attributes[name] = value;
            }

            // --------------------------------------------------------------
            // Parse styles
            // --------------------------------------------------------------

            if (attributes.style !== undefined)
            {
              styles = qx.bom.htmlarea.HtmlArea.__parseStyle(attributes.style);
              delete attributes.style;
            }

            // --------------------------------------------------------------
            // PostProcess
            // --------------------------------------------------------------

            // Call optional postProcess function to modify tag, attributes
            // or styles in this element.
            if (postProcess)
            {
              // create postprocess-info:
              // - info.domElement - current dom element
              // - info.tag - tag name
              // - info.attributes - attributes map (stored name and value pairs)
              // - info.styles - styles map (stored name and value pairs)
              var info = {
                domElement: root,
                tag: tag,
                attributes: attributes,
                styles: styles
              };

              // call user defined postprocessing function
              postProcess(info);

              // remove reference to dom element (is it needed ? For IE ?)
              info.domElement = null;
              // and get tag back
              tag = info.tag;
            }

            // --------------------------------------------------------------
            // Generate Html
            // --------------------------------------------------------------

            // If tag is empty, we don't want it!
            if (tag)
            {
              // Render begin of tag -> <TAG
              html.push("<", tag);

              // Render attributes -> attr=""
              for (var name in attributes)
              {
                var value = attributes[name];
                html.push(" ", name, '="', value.toString().replace(new RegExp('"', "g"), "'"), '"');
              }

              // Render styles -> style=""
              if (!qx.lang.Object.isEmpty(styles))
              {
                html.push(' style="');
                for (var name in styles)
                {
                  var value = styles[name];
                  html.push(name, ":", value.toString().replace(new RegExp('"', "g"), "'"), ";");
                }
                html.push('"');
              }

              // Render end of tag -> > or />
              html.push(closed ? " />" : ">");
            }
          }

          // Child nodes, recursive call itself

          for (i = root.firstChild; i; i = i.nextSibling)
          {
            html.push(qx.bom.htmlarea.HtmlArea.__getHtml(i, true, skipHtmlEncoding, postProcess));
          }

          // Close

          if (outputRoot && !closed && tag)
          {
            html.push("</", tag, ">");
          }
          break;

        // Node.TEXT_NODE
        case 3:

          html.push(skipHtmlEncoding ? root.data : qx.bom.htmlarea.HtmlArea.__htmlEncode(root.data));
          break;

        // Node.COMMENT_NODE
        case 8:
          // skip comments, for now ?
          html.push("<!--", root.data, "-->");
          break;
      }

      return html.join("");
    },

    // TODO: Map should be better! (Petr)
    /**
     * String containing all tags which need a corresponding closing tag
     */
    closingTags : " SCRIPT STYLE DIV SPAN TR TD TBODY TABLE EM STRONG FONT A P B I U STRIKE H1 H2 H3 H4 H5 H6 ",

    // TODO: No reason that first parameter is element, it should be only string with tag name (Petr)
    /**
     * Checks if given element needs a closing tag
     *
     * @type static
     * @param el {Element} Element to check
     * @return {Boolean} Closing tag needed or not
     */
    __needsClosingTag : function(el) {
      return (qx.bom.htmlarea.HtmlArea.closingTags.indexOf(" " + el.tagName + " ") != -1);
    },


    /**
     * Encodes given string with HTML-Entities
     *
     * @type static
     * @param s {String} String to encode
     * @return {String} Encoded string
     */
    __htmlEncode : function(s)
    {
      s = s.replace(/&/ig, "&amp;");
      s = s.replace(/</ig, "&lt;");
      s = s.replace(/>/ig, "&gt;");
      s = s.replace(/\x22/ig, "&quot;");

      // \x22 means '"' -- prevent errors in editor or compressors
      s = s.replace(/\xA9/ig, "&copy;");

      return s;
    },


    /**
     * Checks if the given node is a block node
     *
     * @type static
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node)
    {
      var deprecatedFunction = qx.bom.htmlarea.HtmlArea.isBlockNode;
      var deprecationMessage = "Please use the method 'qx.dom.Node.isBlockNode' instead.";
      qx.log.Logger.deprecatedMethodWarning(deprecatedFunction, deprecationMessage);

      return qx.dom.Node.isBlockNode(node);
    },


    /**
     * Checks if one element is in the list of elements that are allowed to contain a paragraph in HTML
     *
     * @param node {Node} node to check
     * @return {Boolean}
     */
    isParagraphParent : function(node)
    {
      if (!qx.dom.Node.isElement(node))
      {
        return false;
      }

      node = qx.dom.Node.getName(node);

      return /^(body|td|th|caption|fieldset|div)$/.test(node);
    },


    /**
     * Checks of the given node is headline node.
     *
     * @param node {Node} Node to check
     * @return {Boolean} whether it is a headline node
     */
    isHeadlineNode : function(node)
    {
      if (!qx.dom.Node.isElement(node)) {
        return false;
      }

      var nodeName = qx.dom.Node.getName(node);

      return /^h[1-6]$/.test(nodeName);
    }
 },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Selected content type. Currently only XHTML is supported. */
    contentType :
    {
      check : "String",
      init  : "xhtml"
    },


    /**
     * If turned on the editor acts like a messenger widget e.g. if one hits the Enter key the current content gets
     * outputted (via a DataEvent) and the editor clears his content
     */
    messengerMode :
    {
      check : "Boolean",
      init  : false
    },


    /**
     * Toggles whether a p element is inserted on each line break or not.
     * A "normal" linebreak can be achieved using the combination "Shift+Enter" anyway
     */
    insertParagraphOnLinebreak :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * If true we add a linebreak after control+enter
     */
    insertLinebreakOnCtrlEnter :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * Function to use in postProcessing html. See getHtml() and __getHtml().
     */
    postProcess:
    {
      check: "Function",
      nullable: true,
      init: null
    },


    /**
     * Toggles whether to use Undo/Redo
     */
    useUndoRedo :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * Whether to use the native contextmenu or to block it and use own event
     */
    nativeContextMenu :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontFamily :
    {
      check : "String",
      init : "Verdana"
    },


    /**
     * Default font size to use when e.g. user removes all content
     */
    defaultFontSize :
    {
      check : "Integer",
      init : 4
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __widget : null,
    __isReady : false,
    __isInvalid : false,
    __isLoaded : false,
    __isEditable : false,
    __isFirstLineSelected : false,
    __commandManager : null,
    __stackCommandManager : null,
    __currentEvent : null,
    __storedSelectedHtml : null,
    __iframe : null,
    __styleInformation : null,
    __documentSkeletonParts : null,
    __savedRange : null,
    __fireCursorContextOnNextInput : false,
    __mouseUpOnBody : false,


    /**
     * Create a "DIV" element which can be added to the document.
     * This element is the container for the editable iframe element.
     *
     * @param element {Element} DOM element to connect to
     * @return {void}
     */
    __connectToDomElement : function(element)
    {
      if (qx.dom.Node.isElement(element) &&
          qx.dom.Node.isNodeName(element, "div"))
      {
        this.__widget = element;
      }
    },


    /**
     * Creates an iframe element with the given URI and adds it to
     * the container element.
     *
     * @param uri {String} URI of the iframe
     */
    _createAndAddIframe : function(uri)
    {
      this.__iframe = qx.bom.Iframe.create();
      qx.bom.Iframe.setSource(this.__iframe, uri);

      // Omit native dotted outline border
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        qx.bom.element.Attribute.set(this.__iframe, "hideFocus", "true");
      } else {
        qx.bom.element.Style.set(this.__iframe, "outline", "none");
      }
      qx.bom.element.Style.setStyles(this.__iframe, { width: "100%",
                                                      height: "100%" });

      qx.dom.Element.insertBegin(this.__iframe, this.__widget);
    },


    /**
     * Returns the document of the iframe.
     *
     * @return {Document}
     */
    _getIframeDocument : function() {
      return qx.bom.Iframe.getDocument(this.__iframe);
    },


    /**
     * Returns the window of the iframe.
     *
     * @return {Window}
     */
    _getIframeWindow : function() {
      return qx.bom.Iframe.getWindow(this.__iframe);
    },


    /**
     * Adds the "load" listener to the iframe.
     *
     * @return {void}
     */
    _addIframeLoadListener : function() {
      qx.event.Registration.addListener(this.__iframe, "load", this._loaded, this);
    },

    /**
     * Initial content which is written dynamically into the iframe's document
     *
     * @return {void}
     */
    __initDocumentSkeletonParts : function()
    {
      this.__documentSkeletonParts =
      {
        "xhtml" :
        {
          doctype : '<!' + 'DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.0 Transitional/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
          html : '<html xmlns="http:/' + '/www.w3.org/1999/xhtml" xml:lang="en" lang="en">',
          meta: '<title></title><meta http-equiv="Content-type" content="text/html; charset=UTF-8" />',
          style : qx.core.Environment.select("engine.name",
          {
            "mshtml" : 'html { margin:0px; padding:0px; } ' +
                       'body { font-size: 100.01%; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif; width:100%; height:100%; background-color:transparent; overflow:auto; background-image:none; margin:0px; padding:5px; } ',

            "default" : 'html { width:100%; height:100%; margin:0px; padding:0px; overflow-y:auto; overflow-x:auto; } ' +
                        'body { font-size:100.01%; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif; background-color:transparent; overflow:visible; background-image:none; margin:0px; padding:5px; } '
          }),
          contentStyle : 'p { margin:0px; padding:0px; }',
          body : '<body>',
          footer : '</body></html>'
        }
      };
    },


    /** private field which holds the content of the editor  */
    __value        : "",


    /**
     * Returns the iframe object which is used to render the content
     *
     * @return {Iframe} iframe DOM element
     */
    getIframeObject : function() {
      return this.__iframe;
    },

    /**
     * Getter for command manager.
     *
     * @return {qx.bom.htmlarea.manager.Command?qx.bom.htmlarea.manager.UndoRedo} manager instance
     */
    getCommandManager : function() {
      return this.__commandManager;
    },


    /**
     * Setting the value of the editor
     *
     * @param value {String} new content to set
     * @return {void}
     */
    setValue : function(value)
    {
      if (qx.lang.Type.isString(value))
      {
        this.__value = value;

        var doc = this._getIframeDocument();
        if (doc && doc.body) {
          doc.body.innerHTML = this.__generateDefaultContent(value);
        }
      }
    },


    /**
     * Generates the default content and inserts the given string
     *
     * @param value {String} string to insert into the default content
     */
    __generateDefaultContent : function(value)
    {
      // bogus node for Firefox 2.x
      var bogusNode = "";
      if ((qx.core.Environment.get("engine.name") == "gecko"))
      {
        if (qx.core.Environment.get("browser.version") <= 2) {
          bogusNode += '<br _moz_editor_bogus_node="TRUE" _moz_dirty=""/>';
        }
      }

      var zeroWidthNoBreakSpace = value.length == 0 ? "\ufeff" : "";
      var idForFontElement =
        qx.core.Environment.get("engine.name") == "gecko" ||
        qx.core.Environment.get("engine.name") == "webkit" ?
        'id="__elementToFocus__"' : '';

      var defaultContent = '<p>' +
                           '<span style="font-family:' +
                            this.getDefaultFontFamily() + '">' +
                           '<font ' + idForFontElement + ' size="' +
                           this.getDefaultFontSize() +'">' +
                           bogusNode +
                           value +
                           zeroWidthNoBreakSpace +
                           '</font>' +
                           '</span>' +
                           '</p>';

      return defaultContent;
    },


    /**
     * Getting the value of the editor.
     * <b>Attention</b>: The content of the editor is synced
     * at focus/blur events, but not on every input. This method
     * is not delivering the current content in a stable manner.
     * To get the current value of the editor use the {@link #getComputedValue}
     * method instead.
     *
     * @return {String} value of the editor
     */
    getValue : function() {
      return this.__value;
    },


    /**
     * Getting the computed value of the editor.
     * This method returns the current value of the editor traversing
     * the elements below the body element. With this method you always
     * get the current value, but it is much more expensive. So use it
     * carefully.
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String} computed value of the editor
     */
    getComputedValue : function(skipHtmlEncoding) {
      return this.getHtml(skipHtmlEncoding);
    },


    /**
     * Returns the complete content of the editor
     *
     * @return {String}
     */
    getCompleteHtml : function()
    {
      var skeletonParts = this.__documentSkeletonParts[this.getContentType()];

      var completeHtml = skeletonParts.html + '<head>' + skeletonParts.meta +
                         '<style type="text/css">' + skeletonParts.contentStyle + '</style>' +
                         '</head>';

      // use "'" to prevent problems with certain font names encapsulated with '"'
      completeHtml += "<body style='" + this.__getBodyStyleToExport() + "'>";
      completeHtml += this.getHtml() + '</body></html>';

      return completeHtml;
    },


    /**
     * Returns the CSS styles which should be exported as a CSS string.
     * This prevents that styles which are only for internal use appear in the
     * result (e.g. overflow settings).
     *
     * @return {String} CSS string of body styles to export
     */
    __getBodyStyleToExport : function()
    {
      var stylesToExport = [ "backgroundColor", "backgroundImage",
                             "backgroundRepeat", "backgroundPosition",
                             "fontFamily", "fontSize",
                             "marginTop", "marginBottom", "marginLeft", "marginRight",
                             "paddingTop", "paddingBottom", "paddingLeft", "paddingRight" ];

      var Style = qx.bom.element.Style;
      var body = this.getContentBody();
      var bodyStyle = {};
      var styleAttribute, styleValue;
      var modeToUse = qx.core.Environment.get("engine.name") == "mshtml" ? 2 : 1;
      for (var i=0, j=stylesToExport.length; i<j; i++)
      {
        styleAttribute = stylesToExport[i];
        styleValue = Style.get(body, styleAttribute, modeToUse);
        if (styleValue !== undefined && styleValue != "") {
          bodyStyle[styleAttribute] = styleValue;
        }
      }

      return qx.bom.element.Style.compile(bodyStyle);
    },


    /**
     * Returns the document of the iframe
     *
     * @return {Object}
     */
    getContentDocument : function ()
    {
      if (this.__isReady) {
        return this._getIframeDocument();
      }
    },

    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentBody : function ()
    {
      if (this.__isReady) {
        return this._getIframeDocument().body;
      }
    },


    /**
     * Returns the window of the iframe
     *
     * @return {Node} window node
     */
    getContentWindow : function()
    {
      if (this.__isReady) {
         return this._getIframeWindow();
      }
    },


    /**
     * Returns all the words that are contained in a node.
     *
     * @type member
     * @param node {Object} the node element where the text should be retrieved from.
     * @return {String[]} all the words.
     */
    getWords : function(node)
    {
      if (!node) {
        node = this.getContentBody();
      }

      if (!node) {
        return [];
      }

      // Clone the node
      var nodeClone = node.cloneNode(true);
      var innerHTML = nodeClone.innerHTML;

      // Replace all ">" with space "> " to create new word borders
      innerHTML = innerHTML.replace(/>/gi, "> ");
      // Remove all line breaks
      innerHTML = innerHTML.replace(/\n/gi, " ");
      // Remove all comments
      innerHTML = innerHTML.replace(/<!--.*-->/gi, "");

      nodeClone.innerHTML = innerHTML;
      var text  =
        qx.core.Environment.get("engine.name") == "mshtml" ||
        qx.core.Environment.get("engine.name") == "opera" ?
        nodeClone.innerText : nodeClone.textContent;
      var words = text.match(qx.bom.htmlarea.HtmlArea.GetWordsRegExp);

      return !words ? [] : words;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all words
     *
     * @return {Map} all words
     */
    getWordsWithElement : function()
    {
      var list = this.getTextNodes();
      var result = {};
      var i, j, words, element, word;

      for(var i=0,len1=list.length; i<len1; ++i)
      {
        element = list[i];
        words = element.nodeValue.split(" ");

        for(var j=0,len2=words.length; j<len2; ++j)
        {
          word = this._cleanupWord(words[j]);

          if(word != null && word.length > 1)
          {
            if (!result[word])
            {
              result[word] = [];
            }

            result[word].push(element);
          }
        }
      }

      return result;
    },


    /**
     * Cleaning up a given word (removing HTML code)
     *
     * @param word {String} Word to clean
     * @return {String}
     */
    _cleanupWord : function(word)
    {
      if (!word)
      {
        return null;
      }

      return word.replace(qx.bom.htmlarea.HtmlArea.CleanupWordsRegExp, "");
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all text nodes
     *
     * @return {Array} Text nodes
     */
    getTextNodes : function() {
      return this._fetchTextNodes(this.getContentBody());
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Helper method for returning all text nodes
     *
     * @param element {Element} element to retrieve all text nodes from
     * @return {Array} Text nodes
     */
    _fetchTextNodes : function(element)
    {
      var result = [];
      var tmp;

      // Element node
      if(element.hasChildNodes)
      {
        for(var i=0; i<element.childNodes.length; i++)
        {
          tmp = this._fetchTextNodes(element.childNodes[i]);
          qx.lang.Array.append(result, tmp);
        }
      }

      // Text node
      if(element.nodeType == 3)
      {
        // Contains real text
        if(element.nodeValue.length > 1)
        {
          result.push(element);
        }
      }

      return result;
    },


    /*
    ---------------------------------------------------------------------------
      INITIALIZATION
    ---------------------------------------------------------------------------
    */

    __loadCounter : 0,


    /**
     * should be removed if someone find a better way to ensure that the document
     * is ready in IE6
     *
     * @return {void}
     */
    __waitForDocumentReady : function()
    {
      var doc = this._getIframeDocument();

      // first we try to get the document
      if (!doc)
      {
        this.__loadCounter++;

        if (this.__loadCounter > 5)
        {
          this.error('cant load HtmlArea. Document is not available. ' + doc);
          this.fireDataEvent("loadingError");
        }
        else
        {
          if (qx.core.Environment.get("qx.debug")) {
            this.error('document not available, try again...');
          }

          qx.event.Timer.once(function()
          {
            this.__waitForDocumentReady();
          }, this, 0);
        }
      }
      else
      {
        // reset counter, now we try to open the document
        this.__loadCounter = 0;
        this._onDocumentIsReady();
      }
    },


    /**
     * Is executed when event "load" is fired
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _loaded : function(e)
    {
      if (this.__isLoaded) {
        return;
      }

      if (this.__isInvalid) {
        this.__resetEditorToValidState();
        return;
      }

      // sometimes IE does some strange things and the document is not available
      // so we wait for it
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        this.__waitForDocumentReady();
      } else {
        this._onDocumentIsReady();
      }
    },


    /**
     * Whether the editor is ready to accept commands etc.
     *
     * @return {Boolean} ready or not
     */
    isReady : function() {
      return this.__isReady;
    },


    /**
     * Initializes the command manager, sets the document editable, renders
     * the content and adds a needed event listeners when the document is ready
     * for it.
     * After the successful startup the "ready" event is thrown.
     *
     * @type member
     * @return {void}
     */
    _onDocumentIsReady : function()
    {
      var cm = new qx.bom.htmlarea.manager.Command(this);
      if (this.getUseUndoRedo()) {
        cm = new qx.bom.htmlarea.manager.UndoRedo(cm, this);
      }

      this.__isLoaded = true;

      // For IE the document needs to be set in "designMode"
      // BEFORE the content is rendered.
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        this.setEditable(true);
      }

      // Open a new document and insert needed elements plus the initial content
      this.__renderContent();

      if (!(qx.core.Environment.get("engine.name") == "opera")) {
        this.__addListeners();
      }

      // Setting the document editable for all other browser engines
      // AFTER the content is set
      if (!(qx.core.Environment.get("engine.name") == "mshtml")) {
        this.setEditable(true);
      }

      this.__isReady = true;

      // replace the commandManager to be sure the stacked commands are
      // executed at the correct manager
      this.__commandManager = cm;
      cm.setContentDocument(this._getIframeDocument());

      this.__processStackedCommands();

      // Add listeners to opera after the edit mode is activated,
      // otherwise the listeners will be removed
      if ((qx.core.Environment.get("engine.name") == "opera")) {
        this.__addListeners();
      }

      // dispatch the "ready" event at the end of the initialization
      this.fireEvent("ready");
    },


    /**
     * Forces the htmlArea to reset the document editable. This method can
     * be useful (especially for Gecko) whenever the HtmlArea was hidden and
     * gets visible again.
     */
    forceEditable : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        var doc = this._getIframeDocument();
        if (doc)
        {
          /*
           * Don't ask my why, but this is the only way I found to get
           * gecko back to a state of an editable document after the htmlArea
           * was hidden and visible again.
           * Yes, and there are differences in Firefox 3.x and Firefox 2.x
           */
          if (parseFloat(qx.core.Environment.get("engine.version")) >= "1.9")
          {
            doc.designMode = "Off";

            doc.body.contentEditable = false;
            doc.body.contentEditable = true;
          }
          else
          {
            doc.body.contentEditable = true;
            this.__setDesignMode(true);
          }
        }
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Sets the editor for all gecko browsers into the state "invalid" to be
     * able to re-initialize the editor with the next load of the iframe.
     *
     * This "invalid" state is necessary whenever the whole HtmlArea high-level
     * widget is moved around to another container.
     *
     * Only implemented for Gecko browser.
     *
     * @signature function()
     */
    invalidateEditor : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        this.__isLoaded = false;
        this.__isReady = false;
        this.__isInvalid = true;
      },

      "default" : function() {}
    }),


    /**
     * Called when the iframes is loaded and the HtmlArea is in the "invalid"
     * state. Re-initializes the HtmlArea and fires the {@link qx.bom.htmlarea.HtmlArea#readyAfterInvalid}
     * event to offer a time moment for the application developer to execute
     * commands after the re-location.
     *
     * Only implemented for Gecko browser.
     *
     * @signature function()
     */
    __resetEditorToValidState : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        this.__renderContent();
        this.__addListeners();

        this.__commandManager.setContentDocument(this._getIframeDocument());

        this.setEditable(true);
        this.forceEditable();

        this.__isLoaded = true;
        this.__isReady = true;
        this.__isInvalid = false;

        this.fireEvent("readyAfterInvalid");
      },

      "default" : function() {}
    }),


    /**
     * Returns style attribute as string of a given element
     *
     * @param elem {Element} Element to check for styles
     * @return {String} Complete style attribute as string
     */
    __getElementStyleAsString : function(elem)
    {
      var style = "";

      if (!elem) {
        return style;
      }

      try
      {
        var styleAttrib = elem.getAttribute("style");

        if (!styleAttrib) {
          return style;
        }

        // IE returns an array when calling getAttribute
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          style = styleAttrib.cssText;
        }
        else
        {
          style = styleAttrib;
        }
      }
      catch(exc)
      {
        this.error("can't extract style from elem. ");
      }

      return style;
    },


    /**
     * Returns the document skeleton with content usable for the editor
     *
     * @param value {String} body.innerHTML
     * @return {String} content
     */
    __generateDocumentSkeleton : function(value)
    {
      // To hide the horizontal scrollbars in gecko browsers set the
      // "overflow-x" explicit to "hidden"
      // In mshtml browsers this does NOT work. The property "overflow-x"
      // overwrites the value of "overflow-y".
      var overflow = qx.core.Environment.get("engine.name") == "gecko" ?
        " html, body {overflow-x: visible; } " : "";

      var skeletonParts = this.__documentSkeletonParts[this.getContentType()];
      var head = '<head>' + skeletonParts.meta +
                 '<style type="text/css">' + overflow + skeletonParts.style + skeletonParts.contentStyle + this.__styleInformation + '</style>' +
                 '</head>';
      var content = skeletonParts.body + value;

      // When setting the content with a doctype IE7 has one major problem.
      // With EVERY char inserted the editor component hides the text/flickers.
      // To display it again it is necessary to unfocus and focus again the
      // editor component. To avoid this unwanted behaviour it is necessary to
      // set NO DOCTYPE.
      return skeletonParts.html + head + content + skeletonParts.footer;
    },


    /**
     * Opens a new document and sets the content (if available)
     *
     * @return {void}
     */
    __renderContent : function()
    {
      var value = this.__generateDefaultContent(this.getValue());

      if (qx.lang.Type.isString(value))
      {
        var doc = this._getIframeDocument();
        try
        {
          doc.open("text/html", true);
          doc.write(this.__generateDocumentSkeleton(value));
          doc.close();
        }
        catch (e)
        {
          this.error("cant open document on source '"+qx.bom.Iframe.queryCurrentUrl(this.__iframe) +"'", e);
          this.fireDataEvent("loadingError", e);
        }
      }
    },


    /**
     * Adds all needed eventlistener
     *
     * @return {void}
     */
    __addListeners : function()
    {
      this.__addKeyListeners();
      this.__addMouseListeners();
      this.__addFocusListeners();
    },


    /**
     * Add key event listeners to the body element
     */
    __addKeyListeners : function()
    {
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      Registration.addListener(doc.body, "keypress", this._handleKeyPress, this);
      Registration.addListener(doc.body, "keyup", this._handleKeyUp,    this);
      Registration.addListener(doc.body, "keydown", this._handleKeyDown,  this);
    },


    /**
     * Add focus event listeners.
     */
    __addFocusListeners : function()
    {
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      var focusBlurTarget = qx.core.Environment.get("engine.name") == "webkit" ? this._getIframeWindow() : doc.body;
      Registration.addListener(focusBlurTarget, "focus", this._handleFocusEvent, this);
      Registration.addListener(focusBlurTarget, "blur", this._handleBlurEvent, this);

      Registration.addListener(doc, "focusout",  this._handleFocusOutEvent, this);
    },


    /**
     * Add mouse event listeners.
     */
    __addMouseListeners : function()
    {
      // The mouse events are primarily needed to examine the current cursor context.
      // The cursor context examines if the current text node is formatted in any
      // manner like bold or italic. An event is thrown to e.g. activate/deactivate
      // toolbar buttons.
      // Additionally the mouseup at document level is necessary for gecko and
      // webkit to reset the focus (see Bug #2896).
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      var mouseEventName = qx.core.Environment.get("engine.name") == "mshtml" ? "click" : "mouseup";
      Registration.addListener(doc.body, mouseEventName, this._handleMouseUpOnBody, this);
      Registration.addListener(doc.documentElement, mouseEventName, this._handleMouseUpOnDocument, this);

      Registration.addListener(doc.documentElement, "contextmenu", this._handleContextMenuEvent, this);
    },


    /**
     * Helper method to create an object which acts like a command manager
     * instance to collect all commands which are executed BEFORE the command
     * manager instance is ready.
     *
     * @return {Object} stack command manager object
     */
    __createStackCommandManager : function()
    {
      if (this.__stackCommandManager == null)
      {
        this.__stackCommandManager = {
          execute : function(command, value)
          {
            this.stackedCommands = true;
            this.commandStack.push( { command : command, value : value } );
          },

          commandStack : [],
          stackedCommands : false
        };
      }
      this.__stackCommandManager.stackedCommands = false;

      return this.__stackCommandManager;
    },


    /**
     * Process the stacked commands if available.
     * This feature is necessary at startup when the command manager is yet
     * not ready to execute the commands after the initialization.
     */
    __processStackedCommands : function()
    {
      var manager = this.__stackCommandManager;

      if (manager != null && manager.stackedCommands)
      {
        var commandStack = manager.commandStack;
        if (commandStack != null)
        {
          for (var i=0, j=commandStack.length; i<j; i++) {
            this.__commandManager.execute(commandStack[i].command, commandStack[i].value);
          }
        }
      }
    },


    /**
     * Sets the designMode of the document
     *
     * @param onOrOff {Boolean} Set or unset the design mode on the current document
     * @return {void}
     */
    __setDesignMode : function (onOrOff)
    {
      var doc = this._getIframeDocument();

      if (this.__isLoaded && doc)
      {
        try
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            // FF Bug (Backspace etc. doesn't work if we dont set it twice)
            doc.designMode = (onOrOff !== false) ? 'Off' : 'On';
          }

          doc.designMode = (onOrOff !== false) ? 'On' : 'Off';
        }
        catch (e)
        {
          // Fails if the element is not shown actually
          // we set it again in _afterAppear
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EDITABLE
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the document is in editable mode
     *
     * @param value {Boolean} Current value
     * @return {void}
     * @throws {Error} Failed to enable rich edit functionality
     */
    setEditable : function(value)
    {
      if (this.__isLoaded)
      {
        this.__setDesignMode(true);

        // For Gecko set additionally "styleWithCSS" to turn on CSS.
        // Fallback for older Gecko engines is "useCSS".
        // see http://www.mozilla.org/editor/midas-spec.html
        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          try
          {
            var doc = this._getIframeDocument();
            doc.execCommand("styleWithCSS", false, true);
          }
          catch(ex)
          {
            try
            {
              var doc = this._getIframeDocument();
              doc.execCommand("useCSS", false, false);
            }
            catch(ex)
            {
              if (!this.__isReady)
              {
                this.error("Failed to enable rich edit functionality");
                this.fireDataEvent("loadingError", ex);
              }
              else {
                throw new Error("Failed to enable rich edit functionality");
              }
            }
          }
        }

        this.__isEditable = value;
      }
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    getEditable : function() {
      return this.__isEditable;
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    isEditable : function() {
      return this.__isEditable;
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /*
     * This flag is only needed by IE to implement the mechanism
     * of a linebreak when pressing "Ctrl+Enter". It is not possible
     * in IE to get to know that both keys are pressed together (at the
     * keypress event). It is only possible to look at the keypress event,
     * set this flag and insert the linebreak at the keyup event.
     */
    __controlPressed : false,


    /**
     * All keyUp events are delegated to this method
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _handleKeyUp : function(e)
    {
      var keyIdentifier = e.getKeyIdentifier().toLowerCase();
      this.__currentEvent = e;

      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug(e.getType() + " | " + keyIdentifier);
      }

      // This block inserts a linebreak when the key combination "Ctrl+Enter"
      // was pressed. It is necessary in IE to look after the keypress and the
      // keyup event. The keypress delivers the "Ctrl" key and the keyup the
      // "Enter" key. If the latter occurs right after the first one the
      // linebreak gets inserted.
      if (
        qx.core.Environment.get("engine.name") == "mshtml" ||
        qx.core.Environment.get("engine.name") == "webkit"
      ) {
        if (this.__controlPressed)
        {
          switch(keyIdentifier)
          {
            case "enter":
              if (this.getInsertLinebreakOnCtrlEnter())
              {
                if ((qx.core.Environment.get("engine.name") == "webkit"))
                {
                  this.__insertWebkitLineBreak();

                  e.preventDefault();
                  e.stopPropagation();
                }
                else
                {
                  var rng = this.__createRange(this.getSelection());

                  if (rng)
                  {
                    rng.collapse(true);
                    rng.pasteHTML('<br/><div class="placeholder"></div>');
                  }
                }

                this.__startExamineCursorContext();
              }
            break;

            // The keyUp event of the control key ends the "Ctrl+Enter" session.
            // So it is supported that the user is pressing this combination
            // several times without releasing the "Ctrl" key.
            case "control":
              this.__controlPressed = false;
              return;
            break;
          }
        }
      }
      else if ((qx.core.Environment.get("engine.name") == "gecko"))
      {
        // These keys can change the selection
        switch(keyIdentifier)
        {
          case "left":
          case "right":
          case "up":
          case "down":
          case "pageup":
          case "pagedown":
          case "delete":
          case "end":
          case "backspace":
            this.__isFirstLineSelected = (this.getFocusNode() == this.getContentBody().firstChild);
          break;
        }
      }
    },


    /**
     * Helper function which inserts an linebreak at the selection.
     *
     */
    __insertWebkitLineBreak : function()
    {
      var sel = this.getSelection();
      var helperString = "";

      // Insert bogus node if we are on an empty line:
      if(sel && (sel.focusNode.textContent == "" || sel.focusNode.parentElement.tagName == "LI")) {
        helperString = "<br class='webkit-block-placeholder' />";
      }

      this.__commandManager.execute("inserthtml", helperString + qx.bom.htmlarea.HtmlArea.simpleLinebreak);
    },


    /**
     * All keyDown events are delegated to this method
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _handleKeyDown : qx.core.Environment.select("engine.name",
    {
      "mshtml|webkit" : function(e)
      {
        var keyIdentifier   = e.getKeyIdentifier().toLowerCase();

        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          //this.debug(e.getType() + " | " + e.getKeyIdentifier().toLowerCase());
        }

        /* Stop the key events "Ctrl+Z" and "Ctrl+Y" for IE (disabling the browsers shortcuts) */
        if (this.__controlPressed && (keyIdentifier == "z" || keyIdentifier == "y" ||
                                      keyIdentifier == "b" || keyIdentifier == "u" ||
                                      keyIdentifier == "i" || keyIdentifier == "k"))
        {
          e.preventDefault();
          e.stopPropagation();
        }

        /*
         * Only set the flag to true
         * Setting it to false is handled in the "keyUp" handler
         * otherwise holding the "Ctrl" key and hitting e.g. "z"
         * will start the browser shortcut at the second time.
         */
        if(keyIdentifier == "control") {
          this.__controlPressed = true;
        }

      },

      "default" : function(e) {}
    }),


    /**
     * All keyPress events are delegated to this method
     *
     * @param e {Object} Event object
     * @return {void}
     */
   _handleKeyPress : function(e)
   {
      var doc = this.getContentDocument();
      var keyIdentifier   = e.getKeyIdentifier().toLowerCase();
      var isCtrlPressed   = e.isCtrlPressed();
      var isShiftPressed  = e.isShiftPressed();
      this.__currentEvent = e;

      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug(e.getType() + " | " + keyIdentifier);
      }

      // if a hotkey was executed at an empty selection it is necessary to fire
      // a "cursorContext" event after the first input
      if (this.__fireCursorContextOnNextInput)
      {
        // for IE it's necessary to NOT look at the cursorcontext right after
        // the "Enter" because the corresponding styles / elements are not yet
        // created.
        var fireEvent = !((qx.core.Environment.get("engine.name") == "mshtml") && keyIdentifier == "enter") ||
                        !((qx.core.Environment.get("engine.name") == "gecko") &&  keyIdentifier == "enter");

        if (fireEvent)
        {
          this.__startExamineCursorContext();
          this.__fireCursorContextOnNextInput = false;
        }
      }


      switch(keyIdentifier)
      {
        case "enter":
          // If only "Enter" key was pressed and "messengerMode" is activated
          if (!isShiftPressed && !isCtrlPressed && this.getMessengerMode())
          {
            e.preventDefault();
            e.stopPropagation();

            this.fireDataEvent("messengerContent", this.getComputedValue());
            this.resetHtml();
          }

          // This mechanism is to provide a linebreak when pressing "Ctrl+Enter".
          // The implementation for IE is located at the "control" block and at
          // the "_handleKeyUp" method.
          if (isCtrlPressed)
          {
            if (!this.getInsertLinebreakOnCtrlEnter()) {
              return;
            }

            e.preventDefault();
            e.stopPropagation();

            if ((qx.core.Environment.get("engine.name") == "gecko"))
            {
              if (this.__isSelectionWithinWordBoundary())
              {
                this.insertHtml("<br />");
                this.__startExamineCursorContext();
                return;
              }

              // Insert additionally an empty div element - this ensures that
              // the caret is shown and the cursor moves down a line correctly
              //
              // ATTENTION: the "div" element itself gets not inserted by Gecko,
              // it is only necessary to have anything AFTER the "br" element to
              // get it work.
              this.insertHtml("<br /><div id='placeholder'></div>");
            }
            else if ((qx.core.Environment.get("engine.name") == "opera"))
            {
              // To insert a linebreak for Opera it is necessary to work with
              // ranges and add the <br> element on node-level. The selection
              // of the node afterwards is necessary for Opera to show the
              // cursor correctly.
              var sel = this.getSelection();
              var rng = this.__createRange(sel);

              if (sel && rng)
              {
                var brNode = doc.createElement("br");
                rng.collapse(true);
                rng.insertNode(brNode);
                rng.collapse(true);

                rng.selectNode(brNode);
                sel.addRange(rng);
                rng.collapse(true);
              }
            }

            this.__startExamineCursorContext();
          }

          // Special handling for IE when hitting the "Enter" key instead of
          // letting the IE insert a <p> insert manually a <br> if the
          // corresponding property is set.
          if ((qx.core.Environment.get("engine.name") == "mshtml"))
          {
            if (!this.getInsertParagraphOnLinebreak())
            {
              // Insert a "br" element to force a line break. If the insertion
              // succeeds stop the key event otherwise let the browser handle
              // the linebreak e.g. if the user is currently editing an
              // (un)ordered list.
              if (this.__commandManager.execute("inserthtml", qx.bom.htmlarea.HtmlArea.simpleLinebreak))
              {
                this.__startExamineCursorContext();
                e.preventDefault();
                e.stopPropagation();
              }
            }
          }
          // Special handling for Firefox when hitting the "Enter" key
          else if((qx.core.Environment.get("engine.name") == "gecko"))
          {
            if (this.getInsertParagraphOnLinebreak() &&
                !isShiftPressed && !isCtrlPressed)
            {
              var sel = this.getSelection();

              if (sel)
              {
                var selNode = sel.focusNode;

                // check if the caret is within a word - Gecko can handle it
                if (this.__isSelectionWithinWordBoundary())
                {
                  this.__startExamineCursorContext();
                  return;
                }

                // caret is at an empty line
                if (this.__isFocusNodeAnElement())
                {
                  this.__startExamineCursorContext();
                  return;
                }

                // check if inside a list
                while (!qx.dom.Node.isNodeName(selNode, "body"))
                {
                  if (qx.dom.Node.isNodeName(selNode, "li"))
                  {
                    this.__startExamineCursorContext();
                    return;
                  }
                  selNode = selNode.parentNode;
                }
              }

              this.__commandManager.insertParagraphOnLinebreak();
              e.preventDefault();
              e.stopPropagation();

              this.__startExamineCursorContext();
              this.__fireCursorContextOnNextInput = true;
            }
          }
          else if((qx.core.Environment.get("engine.name") == "webkit"))
          {
            if (this.getInsertParagraphOnLinebreak() && isShiftPressed)
            {
              this.__insertWebkitLineBreak();

              e.preventDefault();
              e.stopPropagation();

              this.__startExamineCursorContext();
           }
          }
          break;


        case "up" :
          // Firefox 2 needs some additional work to select the first line
          // completely in case the selection is already on the first line and
          // "key up" is pressed.
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            qx.core.Environment.get("engine.version") < 1.9 && isShiftPressed)
          {
            var sel = this.getSelection();

            // First line is selected
            if(sel && sel.focusNode == doc.body.firstChild)
            {
              // Check if the first line has been (partly) selected before.
              if(this.__isFirstLineSelected)
              {
                // Check if selection does not enclose the complete line already
                if (sel.focusOffset != 0)
                {
                  // Select the complete line.
                  sel.extend(sel.focusNode, 0);
                }
              }
            }
          }

          this.__startExamineCursorContext();
          break;


        // Firefox 2 needs some extra work to move the cursor (and optionally
        // select text while moving) to first position in the first line.
        case "home":
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            qx.core.Environment.get("engine.version") < 1.9)
          {
            if(isCtrlPressed)
            {
              var sel = this.getSelection();

              // Select text from current position to first character on first line
              if (isShiftPressed)
              {
                // Check if target position is not yet selected
                if (sel && (sel.focusOffset != 0) || (sel.focusNode != doc.body.firstChild))
                {
                  // Extend selection to first child at position 0
                  sel.extend(doc.body.firstChild, 0);
                }
              }
              else
              {
                var elements = null;
                var currentItem;

                // Fetch all text nodes from body element
                if (doc) {
                  elements = doc.evaluate("//text()[string-length(normalize-space(.))>0]", doc.body, null, XPathResult.ANY_TYPE, null);
                }

                if (elements && sel)
                {
                  while(currentItem = elements.iterateNext())
                  {
                    // Skip CSS text nodes
                    if(currentItem && currentItem.parentNode &&
                       currentItem.parentNode.tagName != "STYLE")
                    {
                      // Expand selection to first text node and collapse here
                      try
                      {
                        // Sometimes this does not work...
                        sel.extend(currentItem, 0);
                        if (!this.isSelectionCollapsed()) {
                          sel.collapseToStart();
                        }
                      } catch(e) {}

                      // We have found the correct text node, leave loop here
                      break;
                    }
                  }
                }
              }
            }
          }

          this.__startExamineCursorContext();
        break;

        // For all keys which are able to reposition the cursor start to examine
        // the current cursor context
        case "left":
        case "right":
        case "down":
        case "pageup":
        case "pagedown":
        case "delete":
        case "end":
        case "backspace":
          this.__startExamineCursorContext();
        break;

        // Special shortcuts
        case "b":
          if (isCtrlPressed) {
            this.__executeHotkey('bold', true);
          }
        break;

        case "i":
        case "k":
          if (isCtrlPressed) {
            this.__executeHotkey('italic', true);
          }
        break;

        case "u":
          if (isCtrlPressed) {
            this.__executeHotkey('underline', true);
          }
        break;

        case "z":
          if (isCtrlPressed && !isShiftPressed) {
            this.__executeHotkey('undo', true);
          }
          else if (isCtrlPressed && isShiftPressed)
          {
            this.__executeHotkey('redo', true);
          }
        break;

        case "y":
          if (isCtrlPressed) {
            this.__executeHotkey('redo', true);
          }
          break;

        case "a":
          // Select the whole content if "Ctrl+A" was pressed
          //
          // NOTE: this code is NOT executed for mshtml and webkit. To get to
          // know if "Ctrl+A" is pressed in mshtml/webkit one need to check
          // this within the "keyUp" event. This info is not available
          // within the "keyPress" event in mshtml/webkit.
          if (isCtrlPressed) {
            this.selectAll();
          }
        break;

       }

       this.__currentEvent = null;
    },


    /**
     * Executes a method and prevent default
     *
     * @param hotkeyIdentifier {String} hotkey identifier for lookup
     * @param preventDefault {Boolean} whether do preventDefault or not
     * @return {void}
     */
    __executeHotkey : function (hotkeyIdentifier, preventDefault)
    {
      var method = null;
      var hotkeyInfo = qx.bom.htmlarea.HtmlArea.hotkeyInfo;
      if (hotkeyInfo[hotkeyIdentifier]) {
        method = hotkeyInfo[hotkeyIdentifier].method;
      }

      if (method != null && this[method])
      {
        this[method]();

        if (preventDefault)
        {
          this.__currentEvent.preventDefault();
          this.__currentEvent.stopPropagation();
        }

        if (this.isSelectionCollapsed()) {
          this.__fireCursorContextOnNextInput = true;
        }

        // Whenever a hotkey is pressed update the current cursorContext
        // Since this examination is done within a timeout we can be sure
        // the execution is performed before we're looking at the cursor context.
        this.__startExamineCursorContext();
      }
    },


    /**
     * Eventlistener for focus events
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _handleFocusEvent : function(e)
    {
      this.__storedSelectedHtml = null;

      if (
        qx.core.Environment.get("engine.name") == "gecko" ||
        qx.core.Environment.get("engine.name") == "webkit"
      ) {
        // Remove element to focus, as the editor is focused for the first time
        // and the element is not needed anymore.
        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        if (elementToFocus) {
          qx.bom.element.Attribute.reset(elementToFocus, "id");
        }
      }

      this.fireEvent("focused");
    },


    /**
     * Eventlistener for blur events
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _handleBlurEvent : function(e) {
      this.__value = this.getComputedValue();
    },


    /**
     * Eventlistener for focusout events - dispatched before "blur"
     *
     * @param e {Object} Event object
     * @return {void}
     */
    _handleFocusOutEvent : function(e)
    {
      this.__controlPressed = false;

      if (this.__storedSelectedHtml == null) {
        this.__storedSelectedHtml = this.getSelectedHtml();
      }

      this.fireEvent("focusOut");
    },


    /**
     * Eventlistener for all mouse events.
     * This method is invoked for mshtml on "click" events and
     * on "mouseup" events for all others.
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     * @return {void}
     */
    _handleMouseUpOnBody : function(e)
    {
      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug("handleMouse " + e.getType());
      }
      this.__mouseUpOnBody = true;

      this.__startExamineCursorContext();
    },


    /**
     * Checks if the user has performed a selection and released  the mouse
     * button outside of the editor. If so the body element is re-activated
     * to receive the keypress events correctly.
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     *
     * @signature function(e)
     * @return {void}
     */
    _handleMouseUpOnDocument : qx.core.Environment.select("engine.name", {
      "mshtml" : qx.lang.Function.empty,

      "default" : function(e)
      {
        if (!this.__mouseUpOnBody) {
          qx.bom.Element.activate(this.getContentBody());
        }
        this.__mouseUpOnBody = false;
      }
    }),


    /**
     * If the property {@link #nativeContextMenu} is set to <code>false</code> this handler method
     * stops the browser from displaying the native context menu and fires an own event for the
     * application developers to position their own (qooxdoo) contextmenu.
     *
     * Fires a data event with the following data:
     *
     *   * x - absolute x coordinate
     *   * y - absolute y coordinate
     *   * relX - relative x coordinate
     *   * relY - relative y coordinate
     *   * target - DOM element target
     *
     * Otherwise the native browser contextmenu is shown as usual.
     *
     * @param e {Object} Event object
     */
    _handleContextMenuEvent : function(e)
    {
      // only fire own "contextmenu" event if the native contextmenu should not be used
      if (!this.getNativeContextMenu())
      {
        var relX = e.getViewportLeft();
        var relY = e.getViewportTop();

        var absX = qx.bom.element.Location.getLeft(this.__widget) + relX;
        var absY = qx.bom.element.Location.getTop(this.__widget) + relY;

        var data = {
          x: absX,
          y: absY,
          relX: relX,
          relY: relY,
          target: e.getTarget()
        };

        e.preventDefault();
        e.stopPropagation();

        qx.event.Timer.once(function() {
          this.fireDataEvent("contextmenu", data);
        }, this, 0);
      }
    },


    /*
    ---------------------------------------------------------------------------
      EXEC-COMMANDS
    ---------------------------------------------------------------------------
    */

    /**
     * Service method to check if the component is already loaded.
     * Overrides the base method.
     *
     * @return {Boolean}
     */
    isLoaded : function () {
      return this.__isLoaded;
    },


    /**
     * Inserts html content on the current selection
     *
     * @param value {String} html content
     * @return {Boolean} Success of operation
     */
    insertHtml : function (value) {
      return this.__commandManager.execute("inserthtml", value);
    },


    /**
     * Removes all formatting styles on the current selection content and resets
     * the font family and size to the default ones. See {@link #defaultFontSize}
     * and {@link #defaultFontFamily}.
     *
     * @return {Boolean} Success of operation
     */
    removeFormat : function()
    {
      var value = this.__commandManager.execute("removeformat");

      // reset the default font size and family
      this.__commandManager.execute("fontsize", this.getDefaultFontSize());
      this.__commandManager.execute("fontfamily", this.getDefaultFontFamily());

      return value;
    },


    /**
     * Sets the current selection content to bold font style
     *
     * @return {Boolean} Success of operation
     */
    setBold : function() {
      return this.__commandManager.execute("bold");
    },


    /**
     * Sets the current selection content to italic font style
     *
     * @return {Boolean} Success of operation
     */
    setItalic : function() {
      return this.__commandManager.execute("italic");
    },


    /**
     * Sets the current selection content to underline font style
     *
     * @return {Boolean} Success of operation
     */
    setUnderline : function() {
      return this.__commandManager.execute("underline");
    },


    /**
     * Sets the current selection content to strikethrough font style
     *
     * @return {Boolean} Success of operation
     *
     */
    setStrikeThrough : function() {
      return this.__commandManager.execute("strikethrough");
    },


    /**
     * Sets the current selection content to the specified font size
     *
     * @param value {Number} Font size
     * @return {Boolean} Success of operation
     */
    setFontSize : function(value) {
      return this.__commandManager.execute("fontsize", value);
    },


    /**
     * Sets the current selection content to the specified font family
     *
     * @param value {String} Font family
     * @return {Boolean} Success of operation
     */
    setFontFamily : function(value) {
      return this.__commandManager.execute("fontfamily", value);
    },


    /**
     * Sets the current selection content to the specified font color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextColor : function(value) {
      return this.__commandManager.execute("textcolor", value);
    },


    /**
     * Sets the current selection content to the specified background color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextBackgroundColor : function(value) {
      return this.__commandManager.execute("textbackgroundcolor", value);
    },


    /**
     * Left-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyLeft : function() {
      return this.__commandManager.execute("justifyleft");
    },


    /**
     * Center-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyCenter : function() {
      return this.__commandManager.execute("justifycenter");
    },


    /**
     * Right-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyRight : function() {
      return this.__commandManager.execute("justifyright");
    },


    /**
     * Full-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyFull : function() {
      return this.__commandManager.execute("justifyfull");
    },


    /**
     * Indents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertIndent : function() {
      return this.__commandManager.execute("indent");
    },


    /**
     * Outdents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertOutdent : function() {
      return this.__commandManager.execute("outdent");
    },


    /**
     * Inserts an ordered list
     *
     * @return {Boolean} Success of operation
     */
    insertOrderedList : function() {
      return this.__commandManager.execute("insertorderedlist");
    },


    /**
     * Inserts an unordered list
     *
     * @return {Boolean} Success of operation
     */
    insertUnorderedList : function() {
      return this.__commandManager.execute("insertunorderedlist");
    },


    /**
     * Inserts a horizontal ruler
     *
     * @return {Boolean} Success of operation
     */
    insertHorizontalRuler : function() {
      return this.__commandManager.execute("inserthorizontalrule");
    },


    /**
     * Insert an image
     *
     * @param attributes {Map} Map of HTML attributes to apply
     * @return {Boolean} Success of operation
     */
    insertImage : function(attributes) {
      return this.__commandManager.execute("insertimage", attributes);
    },


    /**
     * Inserts a hyperlink
     *
     * @param url {String} URL for the image to be inserted
     * @return {Boolean} Success of operation
     */
    insertHyperLink : function(url) {
      return this.__commandManager.execute("inserthyperlink", url);
    },

    /**
     * Alias for setBackgroundColor("transparent");
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundColor : function () {
      this.__commandManager.execute("backgroundcolor", "transparent");
    },


    /**
     * Sets the background color of the editor
     *
     * @param value {String} color
     * @return {Boolean} if succeeded
     */
    setBackgroundColor : function (value) {
      this.__commandManager.execute("backgroundcolor", value);
    },


    /**
     * Alias for setBackgroundImage(null);
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundImage : function () {
      this.__commandManager.execute("backgroundimage");
    },


    /**
     * Inserts an background image
     *
     * @param url {String} url of the background image to set
     * @param repeat {String} repeat mode. Possible values are "repeat|repeat-x|repeat-y|no-repeat".
     *                                     Default value is "no-repeat"
     * @param position {String?Array} Position of the background image. Possible values are "|top|bottom|center|left|right|right top|left top|left bottom|right bottom" or
     *                                an array consisting of two values for x and
     *                                y coordinate. Both values have to define the
     *                                unit e.g. "px" or "%".
     *                                Default value is "top"
     * @return {Boolean} Success of operation
     */
    setBackgroundImage : function(url, repeat, position) {
      return this.__commandManager.execute("backgroundimage", [ url, repeat, position ]);
    },


    /**
     * Selects the whole content
     *
     * @return {Boolean} Success of operation
     */
    selectAll : function() {
      return this.__commandManager.execute("selectall");
    },


    /**
     * Undo last operation
     *
     * @return {void}
     */
    undo : function()
    {
      if (this.getUseUndoRedo()) {
        return this.__commandManager.execute("undo");
      } else {
        return true;
      }
    },


    /**
     * Redo last undo
     *
     * @return {void}
     */
    redo : function()
    {
      if (this.getUseUndoRedo()) {
        return this.__commandManager.execute("redo");
      } else {
        return true;
      }
    },


    /*
    ---------------------------------------------------------------------------
      CONTENT MANIPLUATION
    ---------------------------------------------------------------------------
    */

    /**
     * Resets the content of the editor
     *
     * @return {void}
     */
    resetHtml : function()
    {
      var doc = this._getIframeDocument();

      // clearing the editor
      while (doc.body.firstChild) {
        doc.body.removeChild(doc.body.firstChild);
      }

      // Gecko needs a p element with a text-node (&nbsp;) to
      // show the caret after clearing out the content. Otherwise
      // the user is able to type ahead but right after the clearing the
      // caret is not visible (-> cursor does not blink)
      if (qx.core.Environment.get("engine.name") == "gecko") {
        doc.body.innerHTML = "<p>&nbsp;</p>";
      }

      // To ensure Webkit is showing a cursor after resetting the
      // content it is necessary to create a new selection and add a range
      else if (qx.core.Environment.get("engine.name") == "webkit")
      {
        var sel = this.getSelection();
        var rng = doc.createRange();

        if (rng && sel) {
          sel.addRange(rng);
        }
      }
    },


    /**
     * Get html content (call own recursive method)
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String} current content of the editor as XHTML
     */
    getHtml : function(skipHtmlEncoding)
    {
      var doc = this._getIframeDocument();

      if (doc == null) {
        return null;
      }

      return qx.bom.htmlarea.HtmlArea.__getHtml(doc.body, false, skipHtmlEncoding, this.getPostProcess());
    },

    /**
     * Helper function to examine if HTMLArea is empty, except for
     * place holder(s) needed by some browsers.
     *
     * @return {Boolean} True, if area is empty - otherwise false.
     */
    containsOnlyPlaceholder : qx.core.Environment.select("engine.name",
    {

      "mshtml" : function()
      {
        var doc = this._getIframeDocument();
        return (doc.body.innerHTML == "<P>&nbsp;</P>");
      },

      "default" : qx.lang.Function.returnFalse
    }),


    /*
      -----------------------------------------------------------------------------
      FOCUS MANAGEMENT
      -----------------------------------------------------------------------------
    */

    /**
     * Convenient function to select an element. The "set" method of qx.bom.Selection is not
     * sufficient here. It does select the element, but does not show the caret.
     *
     * @param element {Element} DOM element to select
     */
    _selectElement : function(element)
    {
      var selection = this.getContentWindow().getSelection();
      var range =  this.getContentDocument().createRange();

      range.setStart(element, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    },


    /**
     * Can be used to set the user focus to the content. Also used when the "TAB" key is used to
     * tab into the component. This method is also called by the {@link qx.ui.embed.HtmlArea} widget.
     *
     * @signature function()
     */
    focusContent : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        var contentDocument = this.getContentDocument();
        var elementToFocus = contentDocument.getElementById("__elementToFocus__");

        this.getContentWindow().focus();
        qx.bom.Element.focus(this.getContentBody());

        if (elementToFocus) {
          this._selectElement(elementToFocus);
        } else {
          this.__checkForContentAndSetDefaultContent();
        }
      },

      "webkit" : function()
      {
        qx.bom.Element.focus(this.getContentWindow());
        qx.bom.Element.focus(this.getContentBody());

        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        if (elementToFocus) {
          qx.bom.element.Attribute.reset(elementToFocus, "id");
        }

        this.__checkForContentAndSetDefaultContent();
      },

      "opera" : function()
      {
        qx.bom.Element.focus(this.getContentWindow());
        qx.bom.Element.focus(this.getContentBody());

        this.__checkForContentAndSetDefaultContent();
      },

      "default" : function()
      {
        qx.bom.Element.focus(this.getContentBody());

        this.__checkForContentAndSetDefaultContent();
      }
    }),


    /**
     * Helper method which checks if content is available and if not sets the default content.
     */
    __checkForContentAndSetDefaultContent : function()
    {
      if (!this.__isContentAvailable()) {
        this.__resetToDefaultContentAndSelect();
      }
    },


    /**
     * Checks whether content is available
     *
     * @signature function()
     */
    __isContentAvailable : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          // consider a BR element with "_moz_dirty" attribute as empty content
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "br") &&
                   qx.bom.element.Attribute.get(childs[0], "_moz_dirty") != null);
        } else {
          return true;
        }
      },

      "webkit" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          // consider a solely BR element as empty content
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "br"));
        } else {
          return true;
        }
      },

      "default" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "p") &&
                   childs[0].firstChild == null);
        } else {
          return true;
        }
      }
    }),


    /**
     * Resets the content and selects the default focus node
     *
     * @signature function()
     */
    __resetToDefaultContentAndSelect : qx.core.Environment.select("engine.name",
    {
      "gecko|webkit" : function()
      {
        this.getContentDocument().body.innerHTML = this.__generateDefaultContent("");

        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        qx.bom.element.Attribute.reset(elementToFocus, "id");
        this._selectElement(elementToFocus);
      },

      "default" : function()
      {
        var firstParagraph = qx.dom.Hierarchy.getFirstDescendant(this.getContentBody());

        if (qx.dom.Node.isNodeName(firstParagraph, "p"))
        {
          qx.bom.element.Style.set(firstParagraph, "font-family", this.getDefaultFontFamily());
          qx.bom.element.Style.set(firstParagraph, "font-size", this.getDefaultFontSize());
        }
      }
    }),



    /*
      -----------------------------------------------------------------------------
      PROCESS CURSOR CONTEXT
      -----------------------------------------------------------------------------
    */


    /**
     * Returns the information about the current context (focusNode). It's a
     * map with information about "bold", "italic", "underline", etc.
     *
     * @return {Map} formatting information about the focusNode
     */
    getContextInformation : function() {
      return this.__examineCursorContext();
    },

    /**
     * Wrapper method to examine the current context
     *
     * @return {void}
     */
    __startExamineCursorContext : function()
    {
      // setting a timeout is important to get the right result */
      qx.event.Timer.once(function(e) {
        var contextInfo = this.__examineCursorContext();
        this.fireDataEvent("cursorContext", contextInfo);
      }, this, 200);
    },


    /**
     * Examines the current context of the cursor (e.g. over bold text).
     * This method will dispatch the data event "cursorContext" which holds a map
     * with different keys like bold, italic, underline etc.
     * The main purpose for this event is to be able to set the states of your toolbar
     * buttons so you can e.g. visualize that the cursor is currently over bold text.
     *
     * The possible values are
     * -1 = command is not possible at the moment. Used to disable the corresponding buttons
     *  0 = command is possible at the moment. Used to enable the corresponding buttons (e.g. bold/italic/underline etc.)
     *  1 = cursor is over content which already received that command. Used to to activate the corresponding buttons (e.g. bold/italic/underline etc.)
     *
     * @lint ignoreDeprecated(_processingExamineCursorContext)
     * @return {void}
     */
    __examineCursorContext : function()
    {
      if (this._processingExamineCursorContext || this.getEditable() == false) {
        return;
      }
      this._processingExamineCursorContext = true;

      if (!this.__isContentAvailable()) {
        this.__resetToDefaultContentAndSelect();
      }

      var focusNode = this.getFocusNode();
      if (focusNode == null) {
        return;
      }

      if (qx.dom.Node.isText(focusNode)) {
        focusNode = focusNode.parentNode;
      }

      var doc = this._getIframeDocument();
      var focusNodeStyle = (qx.core.Environment.get("engine.name") == "mshtml") ?
                           focusNode.currentStyle :
                           doc.defaultView.getComputedStyle(focusNode, null);

      var isBold = false;
      var isItalic = false;
      var isUnderline = false;
      var isStrikeThrough = false;

      var unorderedList = false;
      var orderedList = false;

      var justifyLeft = false;
      var justifyCenter = false;
      var justifyRight = false;
      var justifyFull = false;

      var fontSize = null;
      var computedFontSize = null;
      var fontFamily = null;

      if (focusNodeStyle != null)
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          isItalic = focusNodeStyle.fontStyle == "italic";
          isUnderline = focusNodeStyle.textDecoration.indexOf("underline") !== -1;
          isStrikeThrough = focusNodeStyle.textDecoration.indexOf("line-through") !== -1;

          fontSize = focusNodeStyle.fontSize;
          fontFamily = focusNodeStyle.fontFamily;

          justifyLeft = focusNodeStyle.textAlign == "left";
          justifyCenter = focusNodeStyle.textAlign == "center";
          justifyRight = focusNodeStyle.textAlign == "right";
          justifyFull = focusNodeStyle.textAlign == "justify";
        }
        else
        {
          isItalic = focusNodeStyle.getPropertyValue("font-style") == "italic";
          isUnderline = focusNodeStyle.getPropertyValue("text-decoration").indexOf("underline") !== -1;
          isStrikeThrough = focusNodeStyle.getPropertyValue("text-decoration").indexOf("line-through") !== -1;

          fontSize = focusNodeStyle.getPropertyValue("font-size");
          fontFamily = focusNodeStyle.getPropertyValue("font-family");

          justifyLeft = focusNodeStyle.getPropertyValue("text-align") == "left";
          justifyCenter = focusNodeStyle.getPropertyValue("text-align") == "center";
          justifyRight = focusNodeStyle.getPropertyValue("text-align") == "right";
          justifyFull = focusNodeStyle.getPropertyValue("text-align") == "justify";
        }

        if (
          qx.core.Environment.get("engine.name") == "mshtml" ||
          qx.core.Environment.get("engine.name") == "opera"
        ) {
          isBold = focusNodeStyle.fontWeight == 700;
        } else {
          isBold = focusNodeStyle.getPropertyValue("font-weight") == "bold" ||
                   qx.dom.Node.isNodeName(focusNode, "b");
        }
      }

      // Traverse the DOM to get the result, instead of using the CSS-Properties.
      // In this case the CSS-Properties are not useful, e.g. Gecko always reports
      // "disc" for "list-style-type" even if it is normal text. ("disc" is the
      // initial value)
      // Traverse the DOM upwards to determine if the focusNode is inside an
      // ordered/unordered list
      var node = focusNode;

      // only traverse the DOM upwards if were are not already within the body
      // element or at the top of the document
      if (node != null && node.parentNode != null &&
          !qx.dom.Node.isDocument(node.parentNode))
      {
        while (node != null && !qx.dom.Node.isNodeName(node, "body"))
        {
          var nodename = qx.dom.Node.getName(node);

          if (nodename == "ol")
          {
            orderedList = true;
            break;
          }
          else if (nodename == "ul")
          {
            unorderedList = true;
            break;
          }

          if (computedFontSize == null || computedFontSize == "") {
            computedFontSize = qx.bom.element.Attribute.get(node, 'size');
          }

          node = node.parentNode;
        }
      }

      var eventMap = {
        bold : isBold ? 1 : 0,
        italic : isItalic ? 1 : 0,
        underline : isUnderline ? 1 : 0,
        strikethrough : isStrikeThrough ? 1 : 0,
        fontSize : (computedFontSize == null) ? fontSize : computedFontSize,
        fontFamily : fontFamily,
        insertUnorderedList : unorderedList ? 1 : 0,
        insertOrderedList : orderedList ? 1 : 0,
        justifyLeft : justifyLeft ? 1 : 0,
        justifyCenter : justifyCenter ? 1 : 0,
        justifyRight : justifyRight ? 1 : 0,
        justifyFull : justifyFull ? 1 : 0
      };

      this._processingExamineCursorContext = false;

      return eventMap;
    },



    /*
     -----------------------------------------------------------------------------
     SELECTION
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the current selection object
     *
     * @return {Selection} Selection object
    */
    getSelection : qx.core.Environment.select("engine.name",
    {
       "mshtml" : function() {
         return this._getIframeDocument() ? this._getIframeDocument().selection : null;
       },

       "default" : function() {
         return this._getIframeWindow() ? this._getIframeWindow().getSelection() : null;
       }
    }),


    /**
     * Helper method to check if the selection is collapsed
     *
     * @return {Boolean} collapsed status of selection
     */
    isSelectionCollapsed : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function() {
        return this.getSelection() && this.getSelection().type == "None";
      },

      "default": function() {
        return this.getSelection() && this.getSelection().isCollapsed;
      }
    }),


    /**
     * Returns the currently selected text.
     *
     * @return {String} Selected plain text.
     */
    getSelectedText : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function() {
        return this.getRange() ? this.getRange().text : "";
      },

      "default" : function() {
        return this.getRange() ? this.getRange().toString() : "";
      }
    }),


    /**
     * Returns the content of the actual range as text
     *
     * @TODO: need to be implemented correctly
     * @return {String} selected text
     */
    getSelectedHtml : function()
    {
      // if a selection is stored, return it.
      if (this.__storedSelectedHtml != null) {
        return this.__storedSelectedHtml;
      }

      var range = this.getRange();

      if (!range) {
        return "";
      } else {
        return this.__getRangeContents(range);
      }
    },


    /**
     * Browser-specific implementation to get the current range contents
     *
     * @param range {Range object} Native range object
     *
     * @signature function(range)
     * @return {String} range contents
     */
    __getRangeContents : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(range)
      {
        if (!range) {
          return "";
        }

        return range.item ? range.item(0).outerHTML : range.htmlText;
      },

      "default" : function(range)
      {
        var doc = this._getIframeDocument();

        if (doc && range)
        {
          try
          {
            var tmpBody = doc.createElement("body");
            tmpBody.appendChild(range.cloneContents());

            return tmpBody.innerHTML;
          }
          catch (exc)
          {
            // [BUG #3142]
            // ignore this exception: NOT_FOUND_ERR: DOM Exception 8
          }

          return range + "";
        }

        return "";
      }
    }),



    /**
     * Clears the current selection
     *
     * @return {void}
     */
    clearSelection : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function()
      {
        var sel = this.getSelection();

        if (sel) {
          sel.empty();
        }
      },

      "default" : function()
      {
        var sel = this.getSelection();

        if (sel) {
          sel.collapseToStart();
        }
      }
    }),


    /**
     * Checks if the cursor is within a word boundary.
     * ATTENTION: Currently only implemented for Gecko
     *
     * @signature function()
     * @return {Boolean} within word boundary
     */
    __isSelectionWithinWordBoundary : qx.core.Environment.select("engine.name", {
      "gecko" : function()
      {
        var sel = this.getSelection();
        var focusNode = this.getFocusNode();

        // check if the caret is within a word
        return sel && this.isSelectionCollapsed() && focusNode != null &&
               qx.dom.Node.isText(focusNode) && sel.anchorOffset < focusNode.length;
      },

      "default" : function() {
        return false;
      }
    }),


    /**
     * Check the selection focus node if it's an element.
     * Used a paragraph handling - if the focus node is an
     * element it's not necessary to intercept the paragraph handling.
     *
     * ATTENTION: Currently only implemented for Gecko
     *
     * @signature function()
     * @return {Boolean} selection focus node
     */
    __isFocusNodeAnElement : qx.core.Environment.select("engine.name", {
      "gecko" : function() {
        return qx.dom.Node.isElement(this.getFocusNode());
      },

      "default" : function() {
        return false;
      }
    }),


    /*
     -----------------------------------------------------------------------------
     TEXT RANGE
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the range of the current selection
     *
     * @return {Range?null} Range object or null
     */
    getRange : function() {
      return this.__createRange(this.getSelection());
    },


    /**
     * Returns a range for the current selection
     *
     * @param sel {Selection} current selection object
     *
     * @signature function(sel)
     * @return {Range?null} Range object or null if the document is not available
     */
    __createRange : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(sel)
      {
        var doc = this._getIframeDocument();

        if (sel)
        {
          try {
            return sel.createRange();
          } catch(ex) {
            return doc ? doc.body.createTextRange() : null;
          }
        } else {
          return doc ? doc.body.createTextRange() : null;
        }
       },

       "default" : function(sel)
       {
         var doc = this._getIframeDocument();

         if (sel)
         {
           try {
             return sel.getRangeAt(0);
           } catch(ex) {
             return doc ? doc.createRange() : null;
           }
         } else {
           return doc ? doc.createRange() : null;
         }
       }
    }),


    /**
     * Saves the current range to let the next command operate on this range.
     * Currently only interesting for IE browsers, since they loose the range /
     * selection whenever an element is clicked which need to have a focus (e.g.
     * a textfield widget).
     *
     * *NOTE:* the next executed command will reset this range.
     *
     * @signature function()
     * @return {void}
     */
    saveRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        this.__savedRange = this.getRange();
      },

      "default" : function() {}
    }),


    /**
     * Returns the current stored range.
     *
     * @signature function()
     * @return {Range|null} range object or null
     */
    getSavedRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        return this.__savedRange;
      },

      "default" : function() {}
    }),


    /**
     * Resets the current saved range.
     *
     * @signature function()
     * @return {void}
     */
    resetSavedRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        this.__savedRange = null;
      },

      "default" : function() {}
    }),


    /*
      -----------------------------------------------------------------------------
      NODES
      -----------------------------------------------------------------------------
    */
    /**
     * Returns the node where the selection ends
     *
     * @signature function()
     * @return {Element?null} Focus node or null if no range is available
     */
    getFocusNode : qx.core.Environment.select("engine.name",
    {
       "mshtml" : function()
       {
         var sel = this.getSelection();
         var rng;

         switch(sel.type)
         {
           case "Text":
           case "None":
             // It seems that even for selection of type "None",
             // there _is_ a correct parent element
             rng = this.__createRange(sel);

             if (rng)
             {
               rng.collapse(false);
               return rng.parentElement();
             } else {
               return null;
             }
           break;

           case "Control":
             rng = this.__createRange(sel);

             if (rng)
             {
               try {
                 rng.collapse(false);
               } catch(ex) {}

               return rng.item(0);
             } else {
               return null;
             }
           break;

           default:
             return this._getIframeDocument().body;
         }
       },

       "default" : function()
       {
         var sel = this.getSelection();

         if (sel && sel.focusNode) {
           return sel.focusNode;
         }

         return this._getIframeDocument().body;
       }
    })
  },


  environment : {
    "qx.bom.htmlarea.HtmlArea.debug" : false
  },


  /*
  ---------------------------------------------------------------------------
    DESTRUCTOR
  ---------------------------------------------------------------------------
  */

  /**
   * Destructor
   *
   * @return {void}
   */
  destruct : function()
  {
    try
    {
      var doc = this._getIframeDocument();
      var Registration = qx.event.Registration;

      Registration.removeListener(doc.body, "keypress", this._handleKeyPress, this);
      Registration.removeListener(doc.body, "keyup", this._handleKeyUp, this);
      Registration.removeListener(doc.body, "keydown", this._handleKeyDown, this);

      var focusBlurTarget = qx.core.Environment.get("engine.name") == "webkit"
        ? this._getIframeWindow() : doc.body;
      Registration.removeListener(focusBlurTarget, "focus", this._handleFocusEvent);
      Registration.removeListener(focusBlurTarget, "blur",  this._handleBlurEvent);
      Registration.removeListener(doc, "focusout", this._handleFocusOutEvent);

      var mouseEventName = qx.core.Environment.get("engine.name") == "mshtml" ?
         "click" : "mouseup";
      Registration.removeListener(doc.body, mouseEventName, this._handleMouseUpOnBody, this);
      Registration.removeListener(doc.documentElement, mouseEventName, this._handleMouseUpOnDocument, this);
      Registration.removeListener(doc.documentElement, "contextmenu", this._handleContextMenuEvent, this);

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // Force unload of the iframe. Unload event is not fired when htmlarea is disposed.
        // Needed to dispose event manager (which is reg. on the unload event of the iframe) + to fix "no typing in text fields possible, when editor
        // has the focus and gets disposed when hidden".
        qx.bom.Iframe.setSource(this.__iframe, "about:blank");
      }
    } catch (ex) {};

    if (this.__commandManager instanceof qx.core.Object) {
      this._disposeObjects("__commandManager");
    } else {
      this.__commandManager = null;
    }


    this.__documentSkeletonParts =  this.__iframe = this.__widget = this.__stackCommandManager = null;
  }
});

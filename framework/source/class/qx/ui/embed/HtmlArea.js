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
 * Rich text editor widget which encapsulates the low-level {@link qx.bom.htmlarea.HtmlArea}
 * component to offer editing features.
 *
 *
 * Optimized for the use at a RIA.
 */
qx.Class.define("qx.ui.embed.HtmlArea",
{
  extend : qx.ui.core.Widget,

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
   * @param value {String} Initial content
   * @param styleInformation {String | Map | null} Optional style information for the editor's document
   *                                               Can be a string or a map (example: { "p" : "padding:2px" }
   * @param source {String} source of the iframe
   */
  construct : function(value, styleInformation, source)
  {
    this.__postPonedProperties = {};

    // **********************************************************************
    //   INIT
    // **********************************************************************
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Grow);

    this.__addAppearListener();

    this.__initValues = { content: value,
                          styleInfo: styleInformation,
                          source: source };

    qx.event.Registration.addListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.addListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.addListener(document.body, "losecapture", this.release, this, true);
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
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
    /**
     * Checks if the given node is a block node
     *
     * @type static
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node)
    {
      var deprecatedFunction = qx.ui.embed.HtmlArea.isBlockNode;
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
    isParagraphParent : function(node) {
      return qx.bom.htmlarea.HtmlArea.isParagraphParent(node);
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
      init  : "xhtml",
      apply : "_applyContentType"
    },


    /**
     * If turned on the editor acts like a messenger widget e.g. if one hits the Enter key the current content gets
     * outputted (via a DataEvent) and the editor clears his content
     */
    messengerMode :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyMessengerMode"
    },


    /**
     * Toggles whether a p element is inserted on each line break or not.
     * A "normal" linebreak can be achieved using the combination "Shift+Enter" anyway
     */
    insertParagraphOnLinebreak :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyInsertParagraphOnLinebreak"
    },


    /**
     * If true we add a linebreak after control+enter
     */
    insertLinebreakOnCtrlEnter :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyInsertLinebreakOnCtrlEnter"
    },


    /**
     * Function to use in postprocessing html. See getHtml() and __getHtml().
     */
    postProcess:
    {
      check: "Function",
      nullable: true,
      init: null,
      apply : "_applyPostProcess"
    },


    /**
     * Toggles whether to use Undo/Redo
     */
    useUndoRedo :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyUseUndoRedo"
    },

    /**
     * appearance
     */
    appearance :
    {
      refine : true,
      init   : "htmlarea"
    },

    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontFamily :
    {
      check : "String",
      init : "Verdana",
      apply : "_applyDefaultFontFamily"
    },

    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontSize :
    {
      check : "Integer",
      init : 4,
      apply : "_applyDefaultFontSize"
    },

    /**
     * Focusable
     */
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __editorComponent: null,
    __postPonedProperties: null,
    __blockerElement : null,
    __initValues : null,
    __onDOMNodeRemoved : null,


    /**
     * Initializes the blocker element if (yet) not available
     */
    _initBlockerElement : function ()
    {
      if (!this.__blockerElement) {
        this.__blockerElement = this._createBlockerElement();
      }
    },


    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    _applyContentType : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setContentType(value);
      } else {
        this.__postPonedProperties["ContentType"] = value;
      }
    },


    _applyMessengerMode : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setMessengerMode(value);
      } else {
        this.__postPonedProperties["MessengerMode"] = value;
      }
    },


    _applyInsertParagraphOnLinebreak : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setInsertParagraphOnLinebreak(value);
      } else {
        this.__postPonedProperties["InsertParagraphOnLinebreak"] = value;
      }
    },


    _applyInsertLinebreakOnCtrlEnter : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setInsertLinebreakOnCtrlEnter(value);
      } else {
        this.__postPonedProperties["InsertLinebreakOnCtrlEnter"] = value;
      }
    },


    _applyPostProcess : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setPostProcess(value);
      } else {
        this.__postPonedProperties["PostProcess"] = value;
      }
    },


    _applyUseUndoRedo : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setUseUndoRedo(value);
      } else {
        this.__postPonedProperties["UseUndoRedo"] = value;
      }
    },


    _applyDefaultFontFamily : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setDefaultFontFamily(value);
      } else {
        this.__postPonedProperties["DefaultFontFamily"] = value;
      }
    },


    _applyDefaultFontSize : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setDefaultFontSize(value);
      } else {
        this.__postPonedProperties["DefaultFontSize"] = value;
      }
    },

    // overridden
    _applyNativeContextMenu : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setNativeContextMenu(value);
      } else {
        this.__postPonedProperties["NativeContextMenu"] = value;
      }
    },


    /**
     * Creates <div> element which is aligned over iframe node to avoid losing mouse events.
     *
     * @return {Object} Blocker element node
     */
    _createBlockerElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyles({
        zIndex   : 20,
        position : "absolute",
        display  : "none"
      });

      // IE needs some extra love here to convince it to block events.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        el.setStyles({
          backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")",
          backgroundRepeat: "repeat"
        });
      }

      return el;
    },


    /*
    ---------------------------------------------------------------------------
      SETUP
    ---------------------------------------------------------------------------
    */

    /**
     * Adds the "appear" listener for correct startup
     *
     * @return {void}
     */
    __addAppearListener : function() {
      this.addListenerOnce("appear", this.__setupEditorComponent);
    },


    /**
     * Setup the low-level editor component and the listener delegate methods.
     */
    __setupEditorComponent : function()
    {
      var domElement = this.getContentElement().getDomElement();
      this.__editorComponent = new qx.bom.htmlarea.HtmlArea(domElement,
                                                           this.__initValues.content,
                                                           this.__initValues.styleInfo,
                                                           this.__initValues.source);
      this.__applyPostPonedProperties();
      this.__setupDelegateListeners();

      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        this.__setupInvalidateListener();
      }

      this.addListener("appear", this.forceEditable);
    },


    /**
     * Applies the postponed properties to the editor component
     *
     * @return {void}
     */
    __applyPostPonedProperties : function()
    {
      for(var propertyName in this.__postPonedProperties) {
        this.__editorComponent["set" + propertyName](this.__postPonedProperties[propertyName]);
      }
    },


    /**
     * Setup listeners for events of the low-level editing component and fires
     * them at the editing widget.
     */
    __setupDelegateListeners : function()
    {
      this.__editorComponent.addListener("ready", this.__delegateEvent, this);
      this.__editorComponent.addListener("readyAfterInvalid", this.__delegateEvent, this);
      this.__editorComponent.addListener("focused", this.__delegateEvent, this);
      this.__editorComponent.addListener("focusOut", this.__delegateEvent, this);

      this.__editorComponent.addListener("loadingError", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("cursorContext", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("contextmenu", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("undoRedoState", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("messengerContent", this.__delegateDataEvent, this);
    },


    /**
     * Clones the incoming event and fires it at itself to let the application
     * developers listen to the widget instance.
     *
     * @param e {qx.event.type.Event} event instance
     * @return {void}
     */
    __delegateEvent : function(e)
    {
      var clone = e.clone();
      this.fireEvent(clone.getType());
    },


    /**
     * Clones the incoming data event and fires it at itself to let the application
     * developers listen to the widget instance.
     *
     * @param e {qx.event.type.Data} event instance
     * @return {void}
     */
    __delegateDataEvent : function(e)
    {
      var clone = e.clone();
      this.fireDataEvent(clone.getType(), e.getData());
    },


    /**
     * Listens to DOM changes of the container element to get informed when the
     * HtmlArea is moved to another container.
     *
     * This method is only implemented for Gecko browsers.
     */
    __setupInvalidateListener : function()
    {
      this.__onDOMNodeRemoved = qx.lang.Function.bind(this.__invalidateEditor, this);

      var element = this.getContainerElement().getDomElement();
      qx.bom.Event.addNativeListener(element, "DOMNodeRemoved", this.__onDOMNodeRemoved);
    },


    /**
     * Invalidates the editor component if the connected DOM node is removed.
     *
     * @param e {qx.event.type.Event} event instance
     */
    __invalidateEditor : qx.event.GlobalError.observeMethod(function(e)
    {
      if (this.__editorComponent && !this.__editorComponent.isDisposed()) {
        this.__editorComponent.invalidateEditor();
      }
    }),


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // overridden
    renderLayout : function(left, top, width, height)
    {
      this.base(arguments, left, top, width, height);

      var pixel = "px";
      var insets = this.getInsets();

      if (!this.__blockerElement) {
        this._initBlockerElement();
      }

      this.__blockerElement.setStyles({
        left   : insets.left + pixel,
        top    : insets.top + pixel,
        width  : (width - insets.left - insets.right) + pixel,
        height : (height - insets.top - insets.bottom) + pixel
      });
    },


    /**
     * Returns the iframe object which is used to render the content
     *
     * @return {Iframe?null} iframe DOM element or null if the editor is not initialized
     */
    getIframeObject : function() {
      return this.__editorComponent != null ? this.__editorComponent.getIframeObject() : null;
    },

    /**
     * Getter for command manager.
     *
     * @return {htmlarea.manager.Manager?htmlarea.manager.UndoManager?null} manager instance
     * or null if the editor is not initialized
     */
    getCommandManager : function() {
      return this.__editorComponent != null ? this.__editorComponent.getCommandManager() : null;
    },


    /**
     * Setting the value of the editor if it's initialized
     *
     * @param value {String} new content to set
     * @return {void}
     */
    setValue : function(value)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setValue(value);
      } else {
        this.__initValues.content = value;
      }
    },


    /**
     * Getting the value of the editor.
     * <b>Attention</b>: The content of the editor is synced
     * at focus/blur events, but not on every input. This method
     * is not delivering the current content in a stable manner.
     * To get the current value of the editor use the {@link #getComputedValue}
     * method instead.
     *
     * @return {String?null} value of the editor or null if it's not initialized
     */
    getValue : function()
    {
      if (this.__editorComponent != null) {
        return this.__editorComponent.getValue();
      } else {
        return this.__initValues.content;
      }
    },


    /**
     * Getting the computed value of the editor.
     * This method returns the current value of the editor traversing
     * the elements below the body element. With this method you always
     * get the current value, but it is much more expensive. So use it
     * carefully.
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String?null} computed value of the editor or null if the editor is not initialized
     */
    getComputedValue : function(skipHtmlEncoding) {
      return this.__editorComponent != null ? this.__editorComponent.getHtml(skipHtmlEncoding) : null;
    },


    /**
     * Returns the complete content of the editor
     *
     * @return {String?null} complete content or null if the editor is not initialized
     */
    getCompleteHtml : function() {
      return this.__editorComponent != null ? this.__editorComponent.getCompleteHtml() : null;
    },


    /**
     * Returns the document of the iframe
     *
     * @return {Object}
     */
    getContentDocument : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentDocument() : null;
    },

    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentBody : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentBody() : null;
    },


    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentWindow : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentWindow() : null;
    },


    /**
     * Returns all the words that are contained in a node.
     *
     * @param node {Object} the node element where the text should be retrieved from.
     * @return {String[]} all the words.
     */
    getWords : function(node) {
      return this.__editorComponent != null ? this.__editorComponent.getWords(node) : null;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all words
     *
     * @return {Map} all words
     */
    getWordsWithElement : function() {
      return this.__editorComponent != null ? this.__editorComponent.getWordsWithElement() : null;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all text nodes
     *
     * @return {Array} Text nodes
     */
    getTextNodes : function() {
      return this.__editorComponent != null ? this.__editorComponent.getTextNodes() : null;
    },


    /**
     * Whether the editor is ready to accept commands etc.
     *
     * @return {Boolean} ready or not
     */
    isReady : function() {
      return this.__editorComponent != null ? this.__editorComponent.isReady() : false;
    },


    /**
     * Forces the htmlArea to reset the document editable. This method can
     * be useful (especially for Gecko) whenever the HtmlArea was hidden and
     * gets visible again.
     */
    forceEditable : function() {
      if (this.__editorComponent != null) {
        this.__editorComponent.forceEditable();
      }
    },


    /**
     * Service method to check if the component is already loaded.
     * Overrides the base method.
     *
     * @return {Boolean}
     */
    isLoaded : function() {
      return this.__editorComponent != null ? this.__editorComponent.isLoaded() : false;
    },


    /**
     * Whether the document is in editable mode
     *
     * @param value {Boolean} whether the component should be editable
     * @return {void}
     */
    setEditable : function(value) {
      if (this.__editorComponent != null) {
        this.__editorComponent.setEditable(value);
      }
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    getEditable : function() {
      return this.__editorComponent != null ? this.__editorComponent.getEditable() : false;
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    isEditable : function() {
      return this.__editorComponent != null ? this.__editorComponent.isEditable() : false;
    },


    /**
     * Inserts html content on the current selection
     *
     * @param value {String} html content
     * @return {Boolean} Success of operation
     */
    insertHtml : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.insertHtml(value) : false;
    },


    /**
     * Removes all formatting styles on the current selection content and resets
     * the font family and size to the default ones. See {@link #defaultFontSize}
     * and {@link #defaultFontFamily}.
     *
     * @return {Boolean} Success of operation
     */
    removeFormat : function() {
      return this.__editorComponent != null ? this.__editorComponent.removeFormat() : false;
    },


    /**
     * Sets the current selection content to bold font style
     *
     * @return {Boolean} Success of operation
     */
    setBold : function() {
      return this.__editorComponent != null ? this.__editorComponent.setBold() : false;
    },


    /**
     * Sets the current selection content to italic font style
     *
     * @return {Boolean} Success of operation
     */
    setItalic : function() {
      return this.__editorComponent != null ? this.__editorComponent.setItalic() : false;
    },


    /**
     * Sets the current selection content to underline font style
     *
     * @return {Boolean} Success of operation
     */
    setUnderline : function() {
      return this.__editorComponent != null ? this.__editorComponent.setUnderline() : false;
    },


    /**
     * Sets the current selection content to strikethrough font style
     *
     * @return {Boolean} Success of operation
     *
     */
    setStrikeThrough : function() {
      return this.__editorComponent != null ? this.__editorComponent.setStrikeThrough() : false;
    },


    /**
     * Sets the current selection content to the specified font size
     *
     * @param value {Number} Font size
     * @return {Boolean} Success of operation
     */
    setFontSize : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setFontSize(value) : false;
    },


    /**
     * Sets the current selection content to the specified font family
     *
     * @param value {String} Font family
     * @return {Boolean} Success of operation
     */
    setFontFamily : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setFontFamily(value) : false;
    },


    /**
     * Sets the current selection content to the specified font color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setTextColor(value) : false;
    },


    /**
     * Sets the current selection content to the specified background color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextBackgroundColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setTextBackgroundColor(value) : false;
    },


    /**
     * Left-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyLeft : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyLeft() : false;
    },


    /**
     * Center-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyCenter : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyCenter() : false;
    },


    /**
     * Right-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyRight : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyRight() : false;
    },


    /**
     * Full-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyFull : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyFull() : false;
    },


    /**
     * Indents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertIndent : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertIndent() : false;
    },


    /**
     * Outdents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertOutdent : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertOutdent() : false;
    },


    /**
     * Inserts an ordered list
     *
     * @return {Boolean} Success of operation
     */
    insertOrderedList : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertOrderedList() : false;
    },


    /**
     * Inserts an unordered list
     *
     * @return {Boolean} Success of operation
     */
    insertUnorderedList : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertUnorderedList() : false;
    },


    /**
     * Inserts a horizontal ruler
     *
     * @return {Boolean} Success of operation
     */
    insertHorizontalRuler : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertHorizontalRuler() :false;
    },


    /**
     * Insert an image
     *
     * @param attributes {Map} Map of HTML attributes to apply
     * @return {Boolean} Success of operation
     */
    insertImage : function(attributes) {
      return this.__editorComponent != null ? this.__editorComponent.insertImage(attributes) : false;
    },


    /**
     * Inserts a hyperlink
     *
     * @param url {String} URL for the image to be inserted
     * @return {Boolean} Success of operation
     */
    insertHyperLink : function(url) {
      return this.__editorComponent != null ? this.__editorComponent.insertHyperLink(url) : false;
    },

    /**
     * Alias for setBackgroundColor("transparent");
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundColor : function() {
      return this.__editorComponent != null ? this.__editorComponent.removeBackgroundColor() : false;
    },


    /**
     * Sets the background color of the editor
     *
     * @param value {String} color
     * @return {Boolean} if succeeded
     */
    setBackgroundColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setBackgroundColor(value) : false;
    },


    /**
     * Alias for setBackgroundImage(null);
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundImage : function () {
      return this.__editorComponent != null ? this.__editorComponent.removeBackgroundImage() : false;
    },


    /**
     * Inserts an background image
     *
     * @param url {String} url of the background image to set
     * @param repeat {String} repeat mode. Possible values are "repeat|repeat-x|repeat-y|no-repeat".
     *                                     Default value is "no-repeat"
     * @param position {String?Array} Position of the background image.
     *                                Possible values are "|top|bottom|center|left|right|right top|left top|left bottom|right bottom" or
     *                                an array consisting of two values for x and
     *                                y coordinate. Both values have to define the
     *                                unit e.g. "px" or "%".
     *                                Default value is "top"
     * @return {Boolean} Success of operation
     */
    setBackgroundImage : function(url, repeat, position) {
      return this.__editorComponent != null ? this.__editorComponent.setBackgroundImage(url, repeat, position) : false;
    },


    /**
     * Selects the whole content
     *
     * @return {Boolean} Success of operation
     */
    selectAll : function() {
      return this.__editorComponent != null ? this.__editorComponent.selectAll() : false;
    },


    /**
     * Undo last operation
     *
     * @return {void}
     */
    undo : function() {
      return this.__editorComponent != null ? this.__editorComponent.undo() : false;
    },


    /**
     * Redo last undo
     *
     * @return {void}
     */
    redo : function() {
      return this.__editorComponent != null ? this.__editorComponent.redo() : false;
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
      if (this.__editorComponent != null) {
        this.__editorComponent.resetHtml();
      }
    },


    /**
     * Get html content (call own recursive method)
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String?null} current content of the editor as XHTML or null if not initialized
     */
    getHtml : function(skipHtmlEncoding) {
      return this.__editorComponent != null ? this.__editorComponent.getHtml(skipHtmlEncoding) : null;
    },

    /**
     * Helper function to examine if HTMLArea is empty, except for
     * place holder(s) needed by some browsers.
     *
     * @return {Boolean} True, if area is empty - otherwise false.
     */
    containsOnlyPlaceholder : function() {
      return this.__editorComponent != null ? this.__editorComponent.containsOnlyPlaceHolder() : false;
    },


    /*
      -----------------------------------------------------------------------------
      PROCESS CURSOR CONTEXT
      -----------------------------------------------------------------------------
    */


    /**
     * Returns the information about the current context (focusNode). It's a
     * map with information about "bold", "italic", "underline", etc.
     *
     * @return {Map?null} formatting information about the focusNode or null if not initialized
     */
    getContextInformation : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContextInformation() : null;
    },


    /*
     -----------------------------------------------------------------------------
     SELECTION
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the current selection object
     *
     * @return {Selection?null} Selection object or null if not initialized.
    */
    getSelection : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelection() : null;
    },


    /**
     * Returns the currently selected text.
     *
     * @return {String?null} Selected plain text or null if not initialized.
     */
    getSelectedText : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelectedText() : null;
    },


    /**
     * Returns the content of the actual range as text
     *
     * @TODO: need to be implemented correctly
     * @return {String?null} selected text or null if not initialized
     */
    getSelectedHtml : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelectedHtml() : null;
    },


    /**
     * Clears the current selection
     *
     * @return {void}
     */
    clearSelection : function()
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.clearSelection();
      }
    },


    /*
     -----------------------------------------------------------------------------
     TEXT RANGE
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the range of the current selection
     *
     * @return {Range?null} Range object or null if not initialized
     */
    getRange : function() {
      return this.__editorComponent.getRange();
    },


    /**
     * Safes the current range to let the next command operate on this range.
     * Currently only interesting for IE browsers, since they loose the range /
     * selection whenever an element is clicked which need to have a focus (e.g.
     * a textfield widget).
     *
     * *NOTE:* the next executed command will reset this range.
     *
     * @return {void}
     */
    saveRange : function() {
      this.__editorComponent.saveRange();
    },


    /**
     * Returns the current stored range.
     *
     * @return {Range|null} range object or null
     */
    getSavedRange : function() {
      return this.__editorComponent.getSavedRange();
    },


    /**
     * Resets the current saved range.
     *
     * @return {void}
     */
    resetSavedRange : function() {
      this.__editorComponent.resetSavedRange();
    },


    /*
      -----------------------------------------------------------------------------
      NODES
      -----------------------------------------------------------------------------
    */

    /**
     *  Returns the node where the selection ends
     *
     *  @return {Node?null} focus node or null if not initialized
     */
    getFocusNode : function() {
      return this.__editorComponent != null ? this.__editorComponent.getFocusNode() : null;
    },

    /**
     * Cover the iframe with a transparent blocker div element. This prevents
     * mouse or key events to be handled by the iframe. To release the blocker
     * use {@link #release}.
     *
     */
    block : function()
    {
      if (!this.__blockerElement) {
        this._initBlockerElement();
      }

      if (!this.getContainerElement().hasChild(this.__blockerElement)) {
        this.getContainerElement().add(this.__blockerElement);
      }

      this.__blockerElement.setStyle("display", "block");
    },


    /**
     * Release the blocker set by {@link #block}.
     *
     */
    release : function()
    {
      if (this.__blockerElement) {
        this.__blockerElement.setStyle("display", "none");
      }
    },


    /*
    -----------------------------------------------------------------------------
      FOCUS MANAGEMENT
    -----------------------------------------------------------------------------
    */

    // overridden
    focus : function()
    {
      this.base(arguments);

      this.__focusContent();
    },

    // overridden
    tabFocus : function()
    {
      this.base(arguments);

      this.__focusContent();
    },


    /**
     * Focus the document content
     */
    __focusContent : function()
    {
      if (this.__editorComponent != null) {
        qx.event.Timer.once(function() {
          this.__editorComponent.focusContent();
        }, this, 0);
      }
    }
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
    this.__postPonedProperties = this.__initValues = null;

    qx.event.Registration.removeListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.removeListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.removeListener(document.body, "losecapture", this.release, this, true);

    var element = this.getContainerElement().getDomElement();
    if (element) {
      qx.bom.Event.removeNativeListener(element, "DOMNodeRemoved", this.__onDOMNodeRemoved);
    }

    this._disposeObjects("__blockerElement", "__editorComponent");
  }
});

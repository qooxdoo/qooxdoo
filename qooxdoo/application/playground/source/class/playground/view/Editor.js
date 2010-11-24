/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(playground/*)
#ignore(require)

************************************************************************ */

/**
 * Container for the source code editor.
 */
qx.Class.define("playground.view.Editor",
{
  extend : qx.ui.container.Composite,
  include : qx.ui.core.MBlocker,


  construct : function()
  {
    this.base(arguments);
  },


  events :
  {
    /**
     * Event for signaling that the highlighting could not be done by the editor.
     */
    "disableHighlighting" : "qx.event.type.Event"
  },


  members :
  {
    __textarea : null,
    __highlighted : null,
    __editor : null,
    __ace : null,

    /**
     * The constructor was spit up to make the included mixin available during
     * the init process.
     * 
     * @lint ignoreUndefined(require)
     */
    init: function()
    {
      // If widgets are added to the container, the zIndex of the editor blocker
      // is set to 100. This makes possible to resize the splitpanes
      this.addListener("addChildWidget", function() {
        this.getBlocker().getContentBlockerElement().setStyles({ "zIndex" : 100 });
        this.getBlocker().getBlockerElement().setStyles({ "zIndex" : 100 });
      }, this);

      // layout stuff
      var layout = new qx.ui.layout.VBox();
      layout.setSeparator("separator-vertical");
      this.setLayout(layout);
      this.set({ decorator : "main" });

      // caption
      var caption = new qx.ui.basic.Label(this.tr("Source Code")).set({
        font       : "bold",
        padding    : 5,
        allowGrowX : true,
        allowGrowY : true
      });
      this.add(caption);

      // plain text area
      this.__textarea = new qx.ui.form.TextArea().set({
        wrap      : false,
        font      : qx.bom.Font.fromString("14px monospace"),
        decorator : null,
        backgroundColor: "white",
        padding   : [0,0,0,5]
      });
      this.add(this.__textarea, { flex : 1 });
      
      this.__editor = new qx.ui.core.Widget();
      var highlightDisabled = false;
      // FF2 does not have that...
      // also block the editor for IE which seems not to work
      // https://github.com/ajaxorg/ace/issues/issue/7
      if (!document.createElement("div").getBoundingClientRect || qx.bom.client.Browser.NAME == "ie") {
      // https://github.com/ajaxorg/ace/issues/issue/3
        this.fireEvent("disableHighlighting");
        highlightDisabled = true;
      } else {
        this.__editor.addListenerOnce("appear", function() {
          this.__onEditorAppear();
        }, this);
      }
      this.__editor.setVisibility("excluded");
      this.add(this.__editor, { flex : 1 });

      
      // load the CSS files for the code editor
      qx.bom.Stylesheet.includeFile("resource/playground/css/editor.css");
      qx.bom.Stylesheet.includeFile("resource/playground/css/tm.css");
      
      // override the focus border CSS of the editor
      qx.bom.Stylesheet.createElement(
        ".ace_editor {border: 0px solid #9F9F9F !important;}"
      );
      
      // chech the initial highlight state
      var shouldHighligth = qx.bom.Cookie.get("playgroundHighlight") !== "false";
      this.useHighlight(!highlightDisabled && shouldHighligth);
    },


    /**
     * This code part uses the ajax.org code editor library to add a
     * syntax-highlighting editor as an textarea replacement
     *
     * @lint ignoreUndefined(require)
     */
     __onEditorAppear : function() {
       var self = this;
       
       // ajax.org code editor include
       require(
         {baseUrl: "resource/playground/editor"},
         [
             "ace/editor",
             "ace/virtual_renderer",
             "ace/document",
             "ace/mode/javascript",
             "ace/undomanager"
         ], function(
           Editor, Renderer, Document, JavaScriptMode, UndoManager
          ) { 

         var container = self.__editor.getContentElement().getDomElement();
         self.__ace = new Editor(new Renderer(container));

         var doc = new Document(self.__textarea.getValue());
         doc.setMode(new JavaScriptMode());
         doc.setUndoManager(new UndoManager());
         doc.setUseSoftTabs(true);
         doc.setTabSize(2);
         self.__ace.setDocument(doc);  
         
         self.__ace.focus();

         // remove the print margin and move it to column 3 
         // [http://github.com/ajaxorg/editor/issues/issue/1]
         self.__ace.setShowPrintMargin(false);
         self.__ace.setPrintMarginColumn(3);

         self.__ace.resize();
         
         // append resize listener
        self.__editor.addListener("resize", function() {
          // use a timeout to let the layout queue apply its changes to the dom
          window.setTimeout(function() {
            self.__ace.resize();            
          }, 0);
         });
       });
     },


    /**
     * Returns the current set code of the editor.
     * @return {String} The current set text.
     */
    getCode : function() {
      if (this.__highlighted && this.__ace) {
        return this.__ace.getDocument().toString();
      } else {
        return this.__textarea.getValue();
      }
    },


    /**
     * Sets the given code to the editor.
     * @param code {String} The new code.
     */
    setCode : function(code) {
      if (this.__ace) {
        this.__ace.getDocument().setValue(code);
      }
      this.__textarea.setValue(code);
    },


    /**
     * Switches between the ajax code editor editor and a plain textarea.
     * @param value {Boolean} True, if the code editor should be used.
     */
    useHighlight : function(value) {
      this.__highlighted = value;

      if (value) {
        // change the visibility
        this.__editor.setVisibility("visible");
        this.__textarea.setVisibility("excluded");
        
        // copy the value, if the editor already availabe
        if (this.__ace) {
          this.__ace.getDocument().setValue(this.__textarea.getValue());
          // workaround for a drawing issue in the editor
          this.__editor.addListenerOnce("appear", function() {
            this.__ace.resize();            
          }, this);
        }
      } else {
        // change the visibility        
        this.__editor.setVisibility("excluded");
        this.__textarea.setVisibility("visible");
        
        // copy the value, if the editor already availabe
        if (this.__ace) {
          this.__textarea.setValue(this.__ace.getDocument().toString());          
        }
      }
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__textarea");
    this.__ace = null;
  }
});
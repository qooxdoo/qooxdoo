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
     * Yuecel Beser (ybeser)

************************************************************************ */

/**
 * Container for the source code editor.
 *
 * This is implemented as a separate class, for instance to easily change the
 * z-index of the iframe blocker.
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
    "disableHighlighting" : "qx.event.type.Event"
  },
  

  members : 
  {
    __textarea : null,
    __codeMirror : null,
    __highlighted : null,
    
    /**
     * The constructor was spit up to make the included mixin available during 
     * the init process.
     * 
     * @lint ignoreUndefined(CodeMirror)
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
      qx.html.Element.flush();


      if (CodeMirror != undefined) {
        this.__textarea.addListenerOnce("appear", this.__onTextAreaAppear, this);
        this.__highlighted = true;
      } else {
        this.fireEvent("disableHighlighting");
        this.__highlighted = false;
      }    
    },
    
    /**
     * this code part uses the CodeMirror library to add a
     * syntax-highlighting editor as an textarea replacement
     * 
     * @lint ignoreUndefined(CodeMirror)
     */
    __onTextAreaAppear : function() {
      
      // hide the plain textarea
      this.__textarea.getContentElement().getDomElement().style.visibility = "hidden";
      
      // create the sheet for the codemirror iframe
      qx.bom.Stylesheet.createElement(
        ".code-mirror-iframe {position: absolute; z-index: 11}"
      );
      
      var that = this;
      var bounds = this.__textarea.getBounds();
      this.__codeMirror = new CodeMirror(
        this.__textarea.getContainerElement().getDomElement(),
        {
          content            : this.__textarea.getValue(),
          parserfile         : [ "tokenizejavascript.js", "parsejavascript.js" ],
          stylesheet         : "resource/playground/css/jscolors.css",
          path               : "resource/playground/js/",
          textWrapping       : false,
          continuousScanning : false,
          width              : bounds.width + "px",
          height             : bounds.height + "px",
          autoMatchParens    : true,
          iframeClass        : "code-mirror-iframe",
          lineNumbers        : false,
          initCallback       : function(editor) {
            var lineOffset = parseInt(editor.frame.parentNode.style.marginLeft) || 0;
            editor.frame.style.width = (that.__textarea.getBounds().width - lineOffset) + "px";
            editor.frame.style.height = that.__textarea.getBounds().height + "px";
          }
        }
      );

      bounds = this.__textarea.getBounds();
      this.__codeMirror.frame.style.width = bounds.width + "px";
      this.__codeMirror.frame.style.height = bounds.height + "px";

      // to achieve auto-resize, the editor sets the size of the container element
      this.__textarea.addListener("resize", function() {
        var lineOffset = 
          parseInt(this.__codeMirror.frame.parentNode.style.marginLeft) || 0;
        this.__codeMirror.frame.style.width = 
          (this.__textarea.getBounds().width - lineOffset) + "px";
        this.__codeMirror.frame.style.height = 
          this.__textarea.getBounds().height + "px";
      }, this);

      // The protector blocks the editor, therefore it needs to be removed.
      // This code fragment is a temporary solution, it will be removed once
      // a better solution is found
      var protector = this.__textarea.getContainerElement().getChildren()[1];
      if (protector) {
        protector.getDomElement().parentNode.removeChild(protector.getDomElement());
      }
    },
    
    
    getCode : function() {
      if (this.__highlighted && this.__codeMirror) {
        return this.__codeMirror.getCode();
      } else {
        return this.__textarea.getValue();
      }
    },
    
    
    setCode : function(code) {
      if (this.__highlighted && this.__codeMirror) {
        this.__codeMirror.setCode(code);
      } else {
        this.__textarea.setValue(code);
      }
    },
    

    useHighlight : function(value) {
      if (!this.__codeMirror) {
        return;
      }
      
      this.__highlighted = value;

      if (value) {
        this.__codeMirror.setCode(this.__textarea.getValue());
        this.__codeMirror.frame.style.visibility = "visible";
        this.__textarea.getContentElement().getDomElement().style.visibility = "hidden";        
      } else {
        this.__textarea.setValue(this.__codeMirror.getCode());
        this.__textarea.getContentElement().getDomElement().style.visibility = "visible";
        this.__codeMirror.frame.style.visibility = "hidden";
      }      
    }
  }
});
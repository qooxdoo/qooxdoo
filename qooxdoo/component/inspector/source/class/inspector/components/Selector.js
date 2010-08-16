/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.components.Selector",
{
  extend : qx.core.Object,

  /**
   * Creates the selector.
   * 
   * @param inspectorModel {inspector.components.IInspectorModel} model
   */
  construct : function(inspectorModel)
  {
    this.base(arguments);
    
    this.__model = inspectorModel;
    this.__model.addListener("changeApplication", this.__onChangeApplication, this);
    this.__model.addListener("changeInspected", this.__onChangeInspected, this);
    
    this.__timerHighlighter = new qx.event.Timer(this.self(arguments).DURATION);
    this.__timerHighlighter.addListener("interval", this.__onHighlighterInterval, this);
  },

  statics : 
  {
    BORDER : 2,
    
    BORDER_COLOR : "red",
    
    Z_INDEX : 1e6,
    
    BACKGROUND_COLOR : "black",
    
    OPACITY : 0.1,
    
    DURATION : 1000
  },
  
  members :
  {
    __model : null,
    
    __catchClickLayer : null,
    
    __highlighter : null,
    
    __timerHighlighter : null,
    
    __applicationWindow : null,
    
    start : function()
    {
      if (this.__catchClickLayer != null) {
        this.__catchClickLayer.show();
      }
    },
    
    end : function()
    {
      if (this.__catchClickLayer != null) {
        this.__catchClickLayer.hide();
      }
    },

    __onChangeApplication : function()
    {
      this.__applicationWindow = this.__model.getWindow();
      
      if (this.__applicationWindow == null) {
        return;
      }
      
      this.__catchClickLayer = this.__createCatchClickLayer();
      this.__highlighter = this.__createHighlighter();
    },
    
    __onChangeInspected : function(e) {
      var inspected = e.getData();

      if (inspected == null || this.__applicationWindow == null) {
        return;
      }
      
      this.__timerHighlighter.restart();
      
      this.__highlight(inspected);
    },
    
    __onHighlighterInterval : function(e)
    {
      this.__timerHighlighter.stop();
      this.__highlighter.hide();
    },
    
    __createHighlighter : function() {
      var highlightDecorator = new this.__applicationWindow.qx.ui.decoration.Single(
        this.self(arguments).BORDER, 
        "solid", 
        this.self(arguments).BORDER_COLOR);
      this.__model.addToExcludes(highlightDecorator);

      var highlightOverlay = new this.__applicationWindow.qx.ui.core.Widget();
      this.__model.addToExcludes(highlightOverlay);
      highlightOverlay.setDecorator(highlightDecorator);
      highlightOverlay.setZIndex(this.self(arguments).Z_INDEX - 2);
      highlightOverlay.hide();
      
      var applicationRoot = this.__model.getApplication().getRoot();
      applicationRoot.add(highlightOverlay);
      
      return highlightOverlay;     
    },
    
    __createCatchClickLayer : function()
    {
      var catchClickLayer = new this.__applicationWindow.qx.ui.core.Widget();
      this.__model.addToExcludes(catchClickLayer);
      catchClickLayer.setBackgroundColor(this.self(arguments).BACKGROUND_COLOR);
      catchClickLayer.setOpacity(this.self(arguments).OPACITY);
      catchClickLayer.setZIndex(this.self(arguments).Z_INDEX - 1);
      catchClickLayer.hide();

      catchClickLayer.addListener("click", this.__onClick, this);
      catchClickLayer.addListener("mousemove", this.__onMouseMove, this);
      
      this.__addToApplicationRoot(catchClickLayer);
      
      return catchClickLayer;
    },
          
    __addToApplicationRoot : function(widget)
    {
      var applicationRoot = this.__model.getApplication().getRoot();
      
      var win = this.__applicationWindow;
      if (win.qx.Class.isSubClassOf(widget.constructor, win.qx.ui.root.Application)) {
        applicationRoot.add(widget, {edge: 0});
      }
      else
      {
        widget.setHeight(qx.bom.Document.getHeight(win));
        widget.setWidth(qx.bom.Document.getWidth(win));
        applicationRoot.add(widget, {left: 0, top: 0});
      }
    },
    
    __onClick : function(e) {
      this.__catchClickLayer.hide();

      var xPosition = e.getDocumentLeft();
      var yPosition = e.getDocumentTop();
      
      var clickedElement = this.__searchWidgetInAllRoots(xPosition, yPosition); 
        
      this.__highlighter.hide();
      this.__model.setInspected(clickedElement);
    },

    __onMouseMove : function(e) {
      var xPosition = e.getDocumentLeft();
      var yPosition = e.getDocumentTop();

      var object = this.__searchWidgetInAllRoots(xPosition, yPosition); 
      this.__highlight(object);
    },

    __searchWidgetInAllRoots : function(xPosition, yPosition)
    {
      var widget = null;
      var rootNodes = this.__model.getRoots();
      for (var i = 0; i < rootNodes.length; i++) {
        widget = this.__searchWidget(rootNodes[i], xPosition, yPosition);
        if (widget != rootNodes[i]) {
          break;
        }
      }
      return widget;
    },
    
    __searchWidget: function(widget, x, y) {
      var returnWidget = widget;
      var excludes = this.__model.getExcludes();
      
      for (var i = 0; i < widget._getChildren().length; i++) {
        var childWidget = widget._getChildren()[i];

        try
        {
          var win = this.__applicationWindow;
          
          if (qx.lang.Array.contains(excludes, childWidget) || 
              win.qx.Class.isSubClassOf(childWidget.constructor, win.qx.ui.core.Spacer)) {
            continue;
          }
        } catch (ex) {}

        var domElement = null;
        if (this.__isWidget(childWidget)) {
          domElement = childWidget.getContainerElement().getDomElement();
        } else if (this.__isQxHtmlElement(childWidget)) {
          domElement = childWidget.getDomElement();
        } else {
          return childWidget;
        }

        var coordinates = this.__getCoordinates(domElement);

        if (coordinates != null) {
          // if the element is under the mouse position
          if (coordinates.right >= x && coordinates.left <= x &&
              coordinates.bottom >= y && coordinates.top <= y) {
            returnWidget = this.__searchWidget(childWidget, x, y);
          }
        }
      }
      return returnWidget;
    },

    __getCoordinates: function(element) {
      if (element == null) {
        return null;
      }
      var result = {};
      result.left = qx.bom.element.Location.getLeft(element);
      result.right = qx.bom.element.Location.getRight(element);
      result.top = qx.bom.element.Location.getTop(element);
      result.bottom = qx.bom.element.Location.getBottom(element);
      return result;
    },

    __highlight: function(object) {
      var element = null;
      
      if (this.__isWidget(object) && !this.__isRootElement(object)) {
        element = object.getContainerElement().getDomElement();
      } else if (this.__isQxHtmlElement(object)) {
        element = object.getDomElement();
      } else {
        this.__highlighter.hide();
        return;
      }
      
      // if element is null, the object is not rendered.
      if (element == null) {
        this.__highlighter.hide();
        return;
      }

      var coordinates = this.__getCoordinates(element);
      var left = coordinates.left - this.self(arguments).BORDER;
      var right = coordinates.right + this.self(arguments).BORDER;
      var top = coordinates.top - this.self(arguments).BORDER;
      var bottom = coordinates.bottom + this.self(arguments).BORDER;

      this.__highlighter.renderLayout(left, top, right - left, bottom - top);
      this.__highlighter.show();
    },
    
    __isRootElement : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.ui.root.Abstract);          
    },
    
    __isWidget : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.ui.core.Widget);          
    },
    
    __isQxHtmlElement : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.html.Element);          
    }
  },

  destruct : function()
  {
    this.__model = this.__applicationWindow = null;
    this._disposeObjects("__catchClickLayer", "__highlighter", "__timerHighlighter");
  }
});

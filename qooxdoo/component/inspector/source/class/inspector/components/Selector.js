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
/**
 * The <code>Selector</code> is for visualizing the inspected object in the
 * inspected application and also for selecting an object with the mouse.
 */
qx.Class.define("inspector.components.Selector",
{
  extend : qx.core.Object,

  /**
   * Creates the selector.
   *
   * @param inspectorModel {inspector.components.IInspectorModel} inspector model.
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
    /** {Integer} The border size for the highlighter. */
    BORDER : 2,

    /** {String} The border color for the highlighter. */
    BORDER_COLOR : "red",

    /** {Integer} The max zIndex highlighter and click layer. */
    Z_INDEX : 1e6,

    /** {String} The background color for the click layer. */
    BACKGROUND_COLOR : "black",

    /** {Number} The opacity for the click layer. */
    OPACITY : 0.1,

    /** {Integer} The duration in msec how long the highlighter is shown. */
    DURATION : 1000
  },

  members :
  {
    /** {inspector.components.IInspectorModel} The inspector model instance */
    __model : null,

    /** {qx.ui.core.Widget} Reference to the click layer in the inspected application. */
    __catchClickLayer : null,

    /** {qx.ui.core.Widget} Reference to the highlighter in the inspected application. */
    __highlighter : null,

    /** {qx.event.Timer} Timer reference for hiding the highlighter */
    __timerHighlighter : null,

    /** {Window} Reference to the DOM window of the inspected application */
    __applicationWindow : null,

    /**
     * Shows the click layer to start the object selection in the inspected application.
     */
    start : function()
    {
      if (this.__catchClickLayer != null) {
        this.__updateCatchClickLayer();
        this.__catchClickLayer.show();

        // Flush queue before next user interaction occurs.
        qx.ui.core.queue.Manager.flush();
      }
    },

    /**
     * Hides the click layer to stop the object selection in the inspected application.
     */
    stop : function()
    {
      if (this.__catchClickLayer != null) {
        this.__catchClickLayer.hide();
        this.__onHighlighterInterval();

        // Flush queue before next user interaction occurs.
        qx.ui.core.queue.Manager.flush();
      }
    },

    /**
     * Listener for the "changeApplication", creates the click layer and the highlighter
     * in the inspected application.
     *
     * @param e {qx.event.type.Event} the fired event.
     */
    __onChangeApplication : function(e)
    {
      this.__applicationWindow = this.__model.getWindow();
      var applicationRoot = qx.core.Init.getApplication().getRoot();

      if (this.__applicationWindow == null) {
        // It's important to remove the old references from the old
        // Iframe object instances
        applicationRoot.removeListener("resize", this.__updateCatchClickLayer, this);
        this.__catchClickLayer = null;
        this.__highlighter = null;
        return;
      }

      this.__catchClickLayer = this.__createCatchClickLayer();
      this.__highlighter = this.__createHighlighter();

      applicationRoot.addListener("resize", this.__updateCatchClickLayer, this);
    },

    /**
     * Listener for the "changeInspected", shows the highlighter for the {@link #DURATION}.
     *
     * @param e {qx.event.type.Data} the fired event.
     */
    __onChangeInspected : function(e) {
      var inspected = e.getData();

      if (inspected == null || this.__applicationWindow == null) {
        return;
      }

      // Hide highlighter and flush queue before next user interaction occurs.
      this.__highlighter.hide();
      qx.ui.core.queue.Manager.flush();

      this.__timerHighlighter.restart();
      this.__highlight(inspected);
    },

    /**
     * Listener for the "interval", stops the timer and hide the highlighter.
     *
     * @param e {qx.event.type.Event} the fired event.
     */
    __onHighlighterInterval : function(e)
    {
      this.__timerHighlighter.stop();
      this.__highlighter.hide();

      // Flush queue before next user interaction occurs.
      qx.ui.core.queue.Manager.flush();
    },

    /**
     * Helper method to create and add the highlighter to the inspected application,
     * also adds the highlighter to the excludes list from the inspector model.
     *
     * @return {qx.ui.core.Widget} the created highlighter.
     */
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

    /**
     * Helper method to create and add the click layer to the inspected application,
     * also adds the click layer to the excludes list from the inspector model.
     *
     * @return {qx.ui.core.Widget} the created click layer.
     */
    __createCatchClickLayer : function()
    {
      var catchClickLayer = new this.__applicationWindow.qx.ui.core.Widget();
      this.__model.addToExcludes(catchClickLayer);
      catchClickLayer.setBackgroundColor(this.self(arguments).BACKGROUND_COLOR);
      catchClickLayer.setOpacity(this.self(arguments).OPACITY);
      catchClickLayer.setZIndex(this.self(arguments).Z_INDEX - 1);
      catchClickLayer.testId = "catchClickLayer";
      catchClickLayer.hide();

      catchClickLayer.addListener("click", this.__onClick, this);
      catchClickLayer.addListener("mousemove", this.__onMouseMove, this);

      this.__addToApplicationRoot(catchClickLayer);

      return catchClickLayer;
    },

    /**
     * Helper method to add the passes widget to the inspected application in full size.
     *
     * @param widget {qx.ui.core.Widget} to add in full size.
     */
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

    /**
     * Listener for the "click", tries to fined the clicked object in all application roots
     * and sets the found object as inspected.
     *
     * @param e {qx.event.type.Mouse} the fired event.
     */
    __onClick : function(e) {
      this.__catchClickLayer.hide();

      var xPosition = e.getDocumentLeft();
      var yPosition = e.getDocumentTop();

      var clickedElement = this.__searchWidgetInAllRoots(xPosition, yPosition);

      // Hide highlighter and flush queue before next user interaction occurs.
      this.__highlighter.hide();
      qx.ui.core.queue.Manager.flush();

      this.__model.setInspected(clickedElement);
    },

    /**
     * Listener for the "mousemove", tries to fined the object below the mouse pointer
     * and highlights the found object.
     *
     * @param e {qx.event.type.Mouse} the fired event.
     */
    __onMouseMove : function(e) {
      var xPosition = e.getDocumentLeft();
      var yPosition = e.getDocumentTop();

      var object = this.__searchWidgetInAllRoots(xPosition, yPosition);
      this.__highlight(object);
    },

    /**
     * Helper method to find a object in all roots which match to the passed position.
     *
     * @param xPosition {Integer} x position
     * @param yPosition {Integer} y position
     *
     * @return {qx.ui.core.Widget} found widget.
     */
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

    /**
     * Helper method to find a object which match to the passed position.
     *
     * The algorithm has a complexity of O(n). The algorithm begins form the
     * passed start node and tries to find the object which match to the passed
     * position. The the start node is returned, when the algorithm coudn't find
     * a object which match to the passed values.
     *
     * @param widget {qx.ui.core.Widget|qx.html.Element} start node.
     * @param x {Integer} x position
     * @param y {Integer} y position
     *
     * @return {qx.ui.core.Widget} found widget or start node.
     */
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

    /**
     * Returns the coordinates from the passed DOM element in relation to
     * it's top level body element.
     *
     * @param element {Element} DOM element to get the coordinates.
     * @return {Map|null} with the coordinates <code>left, right, top, bottom</code> as key.
     */
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

    /**
     * Helper method to highlight the passed object.
     *
     * @param object {qx.ui.core.Widget|qx.html.Element} object to highlight.
     */
    __highlight: function(object) {
      // Flush queue before compute size
      qx.ui.core.queue.Manager.flush();

      var element = null;
      if (this.__isWidget(object) && !this.__isRootElement(object)) {
        element = object.getContainerElement().getDomElement();
      } else if (this.__isQxHtmlElement(object)) {
        element = object.getDomElement();
      } else {
        // Hide highlighter and flush queue before next user interaction occurs.
        this.__highlighter.hide();
        qx.ui.core.queue.Manager.flush();
        return;
      }

      // if element is null, the object is not rendered.
      if (element == null) {
        // Hide highlighter and flush queue before next user interaction occurs.
        this.__highlighter.hide();
        qx.ui.core.queue.Manager.flush();
        return;
      }

      var coordinates = this.__getCoordinates(element);
      var left = coordinates.left - this.self(arguments).BORDER;
      var right = coordinates.right + this.self(arguments).BORDER;
      var top = coordinates.top - this.self(arguments).BORDER;
      var bottom = coordinates.bottom + this.self(arguments).BORDER;

      this.__highlighter.renderLayout(left, top, right - left, bottom - top);
      this.__highlighter.show();

      // Flush queue before next user interaction occurs.
      qx.ui.core.queue.Manager.flush();
    },

    /**
     * Helper method to check if the passed object is a root element.
     *
     * @param object {qx.core.Object} object to check.
     * @return <code>true</code> if root element, <code>false</code> otherwise.
     */
    __isRootElement : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.ui.root.Abstract);
    },

    /**
     * Helper method to check if the passed object is a widget.
     *
     * @param object {qx.core.Object} object to check.
     * @return <code>true</code> if widget, <code>false</code> otherwise.
     */
    __isWidget : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.ui.core.Widget);
    },

    /**
     * Helper method to check if the passed object is a <code>qx.html.Element</code>.
     *
     * @param object {qx.core.Object} object to check.
     * @return <code>true</code> if <code>qx.html.Element</code>, <code>false</code> otherwise.
     */
    __isQxHtmlElement : function (object)
    {
      var win = this.__applicationWindow;
      return win.qx.Class.isSubClassOf(object.constructor, win.qx.html.Element);
    },

    /**
     * Helper methide to update the "CatchClickLayer" size.
     *
     * @param e {qx.event.type.Data} the resize event.
     */
    __updateCatchClickLayer : function(e)
    {
      var win = this.__applicationWindow;

      if (win != null && this.__catchClickLayer != null
          && this.__highlighter != null)
      {
        this.__highlighter.hide();

        // Flush the queue and set the size asynchronous,
        // otherwise the resize doesn't work
        qx.ui.core.queue.Manager.flush();
        qx.event.Timer.once(function()
        {
          this.__catchClickLayer.setHeight(qx.bom.Document.getHeight(win));
          this.__catchClickLayer.setWidth(qx.bom.Document.getWidth(win));

          // Flush queue before next user interaction occurs.
          qx.ui.core.queue.Manager.flush();
        }, this, 0);
      }
    }
  },

  destruct : function()
  {
    this.__model = this.__applicationWindow = null;
    this._disposeObjects("__catchClickLayer", "__highlighter", "__timerHighlighter");
  }
});

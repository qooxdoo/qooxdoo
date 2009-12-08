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

************************************************************************ */
qx.Class.define("inspector.components.Selector",
{
  extend : qx.core.Object,


  construct : function(iFrameWindow)
  {
    this.base(arguments);
    this.setJSWindow(iFrameWindow);
  },


  properties : {

    selection : {
      event: "changeSelection",
      nullable: true
    }

  },

  members :
  {

    setJSWindow : function(win) {
      this._iFrameWindow = win;
      this._addedWidgets = [];
      this._root = this._iFrameWindow.qx.core.Init.getApplication().getRoot();

      this._createCatchClickLayer();
      this._createHighlightStuff();

      this.setSelection(null);
    },


    getAddedWidgets: function() {
      return this._addedWidgets;
    },


    start: function() {
      this._catchClickLayer.show();
    },

    end: function() {
      this._catchClickLayer.hide();
    },


    highlightFor: function(object, msec) {
      // if its an application object
      if (object.classname == "qx.ui.root.Application") {
        return;
      }
      this._highlight(object);

      // check for an old time
      if (this._highlightTimerId != null) {
        window.clearTimeout(this._highlightTimerId);
      }

      var self = this;
      self._highlightTimerId = window.setTimeout(function() {
        self._highlightOverlay.hide();
        self._highlightTimerId = null;
      }, msec);
    },


    _createCatchClickLayer: function() {
      // initialize the layer to catch the clicks
      this._catchClickLayer = new this._iFrameWindow.qx.ui.core.Widget();
      this._addedWidgets.push(this._catchClickLayer);
      this._catchClickLayer.setBackgroundColor("black");
      this._catchClickLayer.setOpacity(0.1);
      this._catchClickLayer.setZIndex(1e6 - 1);
      this._catchClickLayer.hide();
      this._root.add(this._catchClickLayer, {left: 0, top: 0, right: 0, bottom: 0});

      // register the handler to catch the clicks and select the clicked widget
      this._catchClickLayer.addListener("click", function(e) {
        // hide the layer that catches the click
        this._catchClickLayer.hide();
        // get the current mouse position
        var xPosition = e.getDocumentLeft();
        var yPosition = e.getDocumentTop();
        // search the widget at the current position
        var clickedElement = this._searchWidget(
          this._root, xPosition, yPosition
        );
        // hide the highlight
        this._highlightOverlay.hide();
        // select the widget with the given id in the tree
        this.setSelection(clickedElement);
      }, this);

      // register the mousemove handler
      this._catchClickLayer.addListener("mousemove", function(e) {
        // get the current mouse position
        var xPosition = e.getDocumentLeft();
        var yPosition = e.getDocumentTop();
        // search the widget at the current position
        var object = this._searchWidget(
          this._root, xPosition, yPosition, ""
        );
        // highlight the widget under the mouse pointer
        this._highlight(object);
      }, this);
    },


    _createHighlightStuff: function() {
      // create the border used to highlight the widgets
      this._highlightDecorator = new this._iFrameWindow.qx.ui.decoration.Single(2, "solid", "red");
      this._addedWidgets.push(this._highlightDecorator);

      // create a new overlay atom object
      this._highlightOverlay = new this._iFrameWindow.qx.ui.core.Widget();
      this._addedWidgets.push(this._highlightOverlay);
      this._highlightOverlay.setDecorator(this._highlightDecorator);
      this._highlightOverlay.setZIndex(1e6 - 2);
      this._highlightOverlay.hide();
      this._root.add(this._highlightOverlay);
    },


    _searchWidget: function(widget, x, y) {
      var returnWidget = widget;
      // visit all children
      for (var i = 0; i < widget._getChildren().length; i++) {
        // get the current child
        var childWidget = widget._getChildren()[i];
        // ignore the catchClickLayer and highlightOverlay atom
        if (childWidget == this._catchClickLayer || childWidget == this._highlightOverlay) {
          continue;
        }
        // check for a spacer
        try {
          if (childWidget instanceof this._iFrameWindow.qx.ui.core.Spacer) {
            continue;
          }
        } catch (ex) {}
        // get the coordinates of the current widget
        if (childWidget.getContainerElement) {
          var domElement = childWidget.getContainerElement().getDomElement();
        } else if (childWidget.getDomElement) {
          var domElement = childWidget.getDomElement();
        } else {
          return childWidget;
        }

        var coordinates = this._getCoordinates(domElement);
        // if the element is visible
        if (coordinates != null) {
          // if the element is under the mouse position
          if (coordinates.right >= x && coordinates.left <= x &&
              coordinates.bottom >= y && coordinates.top <= y) {
            returnWidget = this._searchWidget(childWidget, x, y);
          }
        }
      }
      return returnWidget;
    },


    _getCoordinates: function(element) {
      // return null if no element is given
      if (element == null) {
        return null;
      }
      var returnObject = {};
      returnObject.left = qx.bom.element.Location.getLeft(element);
      returnObject.right = qx.bom.element.Location.getRight(element);
      returnObject.top = qx.bom.element.Location.getTop(element);
      returnObject.bottom = qx.bom.element.Location.getBottom(element);
      return returnObject;
    },


    _highlight: function(object) {
      var element = null;
      if (object.getContainerElement && object.getContainerElement().getDomElement) {
        element = object.getContainerElement().getDomElement();
      } else if (object.getDomElement) {
        element = object.getDomElement();
      }
      // do not highlight if the element is not shown on the screen
      if (element == null) {
        this._highlightOverlay.hide();
        return;
      }

      // get the coordinates
      var coordinates = this._getCoordinates(element);
      var left = coordinates.left - 2;
      var right = coordinates.right + 2;
      var top = coordinates.top - 2;
      var bottom = coordinates.bottom + 2;

      // set the values to the selected object
      this._highlightOverlay.renderLayout(left, top, right - left, bottom - top);
      this._highlightOverlay.show();
    }

  },
  
  destruct : function()
  {
    this._iFrameWindow = this._addedWidgets = this._root = null;
    this._disposeObjects("_catchClickLayer", "_highlightDecorator",
      "_highlightOverlay");
  }
});

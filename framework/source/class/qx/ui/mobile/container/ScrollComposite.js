/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The ScrollComposite is a extension of {@linkqx.ui.mobile.container.Composite},
 * and makes it possible to scroll vertically, if content size is greater than
 * scrollComposite's size.
 *
 * Every widget will be added to child's composite.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the composite
 *   var scrollComposite = new qx.ui.mobile.container.ScrollComposite();
 *
 *   scrollComposite.setLayout(new qx.ui.mobile.layout.HBox());
 *
 *   // add some children
 *   scrollComposite.add(new qx.ui.mobile.basic.Label("Name: "), {flex:1});
 *   scrollComposite.add(new qx.ui.mobile.form.TextField());
 * </pre>
 *
 * This example horizontally groups a label and text field by using a
 * Composite configured with a horizontal box layout as a container.
 */
qx.Class.define("qx.ui.mobile.container.ScrollComposite",
{
  extend : qx.ui.mobile.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be used for this
   *     container
   */
  construct : function(layout)
  {
    this.base(arguments);

    this.__targetOffset = [0,0];
    this.__currentOffset = [0,0];
    this.__touchStartPoints = [0,0];

    this.addCssClass("scrollableBottom");

    this.__scrollContainer = new qx.ui.mobile.container.Composite();
    this.__scrollContainer.addCssClass("scrollContainerChild");

    this.__scrollContainer.addListener("touchstart",this._onTouchStart,this);
    this.__scrollContainer.addListener("touchmove",this._onTouchMove,this);
    this.__scrollContainer.addListener("touchend",this._onTouchEnd,this);

    this._setLayout(new qx.ui.mobile.layout.VBox());
    this._add(this.__scrollContainer, {flex:1});
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "scrollContainer"
    }
  },


  members :
  {
    __scrollContainer : null,
    __touchStartPoints : null,
    __targetOffset : null,
    __currentOffset : null,
    __scrollTopOnStart : 0,
    __targetScrollTop : 0,


     /**
     * TouchHandler for scrollContainer
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchStart : function(evt){
      var touchX = evt.getScreenLeft();
      var touchY = evt.getScreenTop();

      qx.bom.element.Style.set(this.__scrollContainer.getContainerElement(),"transitionDuration","0s");

      this.__touchStartPoints[0] = touchX;
      this.__touchStartPoints[1] = touchY;

      evt.stopPropagation();
    },


    /**
     * Handler for touch move events on scrollContainer
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(evt) {
      var touchX = evt.getScreenLeft();
      var touchY = evt.getScreenTop();

      var distanceX = touchX - this.__touchStartPoints[0];
      var distanceY = touchY - this.__touchStartPoints[1];

      var targetElement =  this.__scrollContainer.getContainerElement();
      var lowerLimit = targetElement.scrollHeight - targetElement.offsetHeight-4;

       // Upper Limit
      if(this.__currentOffset[1] >= 0) {
        this.removeCssClass("scrollableTop");
      } else {
        this.addCssClass("scrollableTop");
      }

      // Lower Limit
      if(this.__currentOffset[1] < -lowerLimit) {
        this.removeCssClass("scrollableBottom");
      } else {
        this.addCssClass("scrollableBottom");
      }

      // X
      this.__currentOffset[0] =  this.__targetOffset[0] + distanceX;
      // Y
      this.__currentOffset[1] =  this.__targetOffset[1] + distanceY;

      this.__scrollContainer.setTranslateY(this.__currentOffset[1]);

      evt.stopPropagation();
    },


    /**
     * TouchHandler for scrollContainer
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchEnd : function(evt) {
      var targetElement =  this.__scrollContainer.getContainerElement();
      var lowerLimit = targetElement.scrollHeight - targetElement.offsetHeight-4;

       // Upper Limit
      if(this.__currentOffset[1] >= 0) {
        this.__currentOffset[1] = 0;
      }

      // Lower Limit
      if(this.__currentOffset[1] < -lowerLimit) {
        this.__currentOffset[1] = -lowerLimit;
      }

      qx.bom.element.Style.set(targetElement,"transitionDuration",".2s");

      this.__scrollContainer.setTranslateY(this.__currentOffset[1]);

      this.__targetOffset[0] = this.__currentOffset[0];
      this.__targetOffset[1] = this.__currentOffset[1];


      evt.stopPropagation();
    },


    //overridden
    add : function(child, options) {
      this.__scrollContainer.add(child,options);
      this._handleSize(child);
    },


    // overridden
    addAfter : function(child, after, layoutProperties) {
      this.__scrollContainer.addAfter(child, after, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    addAt : function(child, index, options) {
      this.__scrollContainer.addAt(child, index, options);
      this._handleSize(child);
    },


    // overridden
    addBefore : function(child, before, layoutProperties) {
      this.__scrollContainer.addBefore(child, before, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    getChildren : function() {
      return this.__scrollContainer.getChildren();
    },


    // overridden
    getLayout : function() {
      return this.__scrollContainer.getLayout();
    },


     // overridden
    setLayout : function(layout) {
      this.__scrollContainer.setLayout(layout);
    },


    // overridden
    hasChildren : function() {
      return this.__scrollContainer.getLayout();
    },


    indexOf : function(child) {
      this.__scrollContainer.indexOf(child);
    },


    // overridden
    remove : function(child) {
      this._unhandleSize(child);
      this.__scrollContainer.remove(child);
    },


    // overridden
    removeAll : function() {
      var children = this.getChildren();
      for(var i = 0; i < children.length; i++) {
        this._unhandleSize(children[i]);
      }

      this.__scrollContainer.removeAll();
    },


    // overridden
    removeAt : function(index) {
      var children = this.getChildren();
      this._unhandleSize(children[index]);

      this.__scrollContainer.removeAt(index);
    },


    /**
     * Checks if size handling is needed:
     * if true, it adds all listener which are needed for synchronizing the scrollHeight to
     * elements height.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _handleSize : function(child) {
      // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea, for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        // Check for Listener TODO
        child.addListener("appear", this._fixChildElementsHeight, child);
        child.addListener("input", this._fixChildElementsHeight, child);
        child.addListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Removes Listeners from a child if necessary.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _unhandleSize : function(child) {
       // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea, for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        // Check for Listener TODO
        child.removeListener("appear", this._fixChildElementsHeight, child);
        child.removeListener("input", this._fixChildElementsHeight, child);
        child.removeListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Synchronizes the elements.scrollHeight and its height.
     * Needed for making textArea scrollable.
     * @param evt {qx.event.type.Data} a custom event.
     */
    _fixChildElementsHeight : function(evt) {
        this.getContainerElement().style.height = 'auto';
        this.getContainerElement().style.height = this.getContainerElement().scrollHeight+'px';
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    this.__scrollContainer.removeListener("touchstart",this._onTouchStart,this);
    this.__scrollContainer.removeListener("touchmove",this._onTouchMove,this);
    this.__scrollContainer.removeListener("touchend",this._onTouchEnd,this);

    var children = this.getChildren();
    for(var i = 0; i < children.length; i++) {
      this._unhandleSize(children[i]);
    }

    this._disposeObjects("__scrollContainer");
  }
});

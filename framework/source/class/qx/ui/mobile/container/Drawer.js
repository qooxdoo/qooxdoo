/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Creates a drawer widget inside the given parent widget. The parent widget can
 * be assigned as a constructor argument. If no parent is set, the application's root
 * will be assumed as parent. A drawer widget can be assigned to left, right, top or bottom edge of its
 * parent by property "orientation". The drawer floats in on show() and floats out on hide(). Additionally the
 * drawer is shown by swiping in reverse direction on the parent edge to where the drawer is placed to:
 * Orientation: "left", Swipe: "right" on parents edge: >> Drawer is shown etc.
 * The drawer is hidden when user touches the parent area, outside of the drawer. This behaviour can be 
 * deactivated by the property "hideOnParentTouch".
 *     
 * <pre class='javascript'>
 *  
 *  var drawer = new qx.ui.mobile.container.Drawer();
 *  drawer.setOrientation("right");
 *  drawer.setTouchOffset(100);
 *  
 *  var button = new qx.ui.mobile.form.Button("A Button");
 *  drawer.add(button);
 * </pre>
 * 
 * 
 */
qx.Class.define("qx.ui.mobile.container.Drawer",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param parent {qx.ui.mobile.container.Composite?null} The widget to which the drawer should be added,
   *  if null it is added to app root.
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be used for this
   *     container
   */
  construct : function(parent, layout)
  {
    this.base(arguments);
    if (layout) {
      this.setLayout(layout);
    }
    
    this.initOrientation();
    
    if(parent) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInstance(parent, qx.ui.mobile.container.Composite);
      }
      
      parent.add(this);
    } else {
      qx.core.Init.getApplication().getRoot().add(this);
    }
    
    this.getLayoutParent().addListener("swipe",this._onParentSwipe,this);
    this.getLayoutParent().addListener("touchstart",this._onParentTouchStart,this);
    
    this._touchStartPosition = [0,0];
    
    this.hide();
  },
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "drawer"
    },
    
    
    /** Property for setting the orientation of the drawer.
     * Allowed values are: "left","right","top","bottom" */
    orientation : {
      check : "String",
      init : "left",
      apply : "_applyOrientation"
    },
    
    
    /** The width of the drawer. Only relevant if orientation is "left" or "right". */
    width : {
      check : "Integer",
      init : 300,
      apply : "_applySize"
    },
    
    
    /** The height of the drawer. Only relevant if orientation is "top" or "bottom". */
    height : {
      check : "Integer",
      init : 300,
      apply : "_applySize"
    },
    
    
    /** Indicates whether the drawer should hide when the parent area of it is touched.  */
    hideOnParentTouch : {
      check : "Boolean",
      init : true
    },
    
    
    /** Sets the size of the touching area, where the drawer reacts on swipes for opening itself. */
    touchOffset : {
      check : "Integer",
      init : 20
    } 
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  { 
    _touchStartPosition : null,
    __parent : null,
  
  
    // property apply
    _applyOrientation : function(value, old) {
      this.removeCssClass(old);
      this.addCssClass(value);
      
      var isVertical = value=="left" || value == "right";
      if(isVertical) {
        qx.bom.element.Style.set(this.getContainerElement(),"height",null);
        qx.bom.element.Style.set(this.getContainerElement(),"width",this.getWidth()+"px");
      } else {
        qx.bom.element.Style.set(this.getContainerElement(),"width",null);
        qx.bom.element.Style.set(this.getContainerElement(),"height",this.getHeight()+"px");
      }
    },
    
    
    // property apply
    _applySize : function(value, old) {
      // Reapply of orientation.
      this.setOrientation(this.getOrientation());
    },
  
  
    /**
     * Shows the drawer.
     */
    show : function()
    {
      this.base(arguments);
      this.removeCssClass("hidden");
    },
    
    
    /**
     * Hides the drawer
     */
    hide : function() {
      this.addCssClass("hidden");
    },
    
    
    /**
     * Handles a touch on application's root.
     */
    _onParentTouchStart : function(evt) {
      var clientX = evt.getAllTouches()[0].clientX;
      var clientY = evt.getAllTouches()[0].clientY;
      
      this._touchStartPosition = [clientX,clientY];
      
      var isShown = !this.hasCssClass("hidden");
      if(isShown && this.isHideOnParentTouch()) {
        var location = qx.bom.element.Location.get(this.getContainerElement());
        
        if (this.getOrientation() =="left" && this._touchStartPosition[0] > location.right
        || this.getOrientation() =="top" && this._touchStartPosition[1] > location.bottom
        || this.getOrientation() =="bottom" && this._touchStartPosition[1] < location.top
        || this.getOrientation() =="right" && this._touchStartPosition[0] < location.left)
        {
          // First touch on overlayed page should be ignored.
          evt.preventDefault();
          
          this.hide();
        }
      } 
    },
    
    
    /**
     * Handles a swipe on layout parent.
     */
    _onParentSwipe : function(evt) {
      var direction = evt.getDirection();
      var isHidden = this.hasCssClass("hidden");
      if(isHidden) {
        var location = qx.bom.element.Location.get(this.getContainerElement());
        
        if (
          (direction == "right" 
          && this.getOrientation() == "left" 
          && this._touchStartPosition[0] < location.right + this.getTouchOffset()
          && this._touchStartPosition[0] > location.right)
          || 
          (direction == "left" 
          && this.getOrientation() == "right"
          && this._touchStartPosition[0] > location.left - this.getTouchOffset()
          && this._touchStartPosition[0] < location.left)
          || 
          (direction == "down" 
          && this.getOrientation() == "top"
          && this._touchStartPosition[1] < this.getTouchOffset() + location.bottom 
          && this._touchStartPosition[1] > location.bottom) 
          || 
          (direction == "up" 
          && this.getOrientation() == "bottom"
          && this._touchStartPosition[1] > location.top - this.getTouchOffset()
          && this._touchStartPosition[1] < location.top)
        )
        {
          this.show();
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
    this.getLayoutParent().removeListener("swipe",this._onParentSwipe,this);
    this.getLayoutParent().removeListener("touchstart",this._onParentTouchStart,this);
    
    this._touchStartPosition = null;
  }
});

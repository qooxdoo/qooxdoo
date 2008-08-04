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
     * Alexander Back (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Manager class for drag and drop of container
 */
qx.Class.define("portal.dragdrop.Manager",
{
  type : "singleton",
  extend : qx.core.Object,
  
  /* ******************************************************
   *    PROPERTIES
   * ******************************************************/
  properties :
  {
    /** The current active draggable box. This assumes a drag session is starting */
    activeBox :
    {
      check    : "portal.box.Box",
      init     : null,
      nullable : true
    },
    
    sessionActive :
    {
      check : "Boolean",
      init  : false
    }
  },
  

  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    __activeBoxInfo   : { top : null, height : null },
    __currentGroupBox : null,
    __groupBoxChange  : false,
    __positions       : { top : 0, left : 0 },
    __groupBoxInfos   : null,
    
    
    
    /**
     * Starts a drag and drop session
     * 
     * @param activeBox {portal.box.Box} active box instance
     * @return {void}
     */
    startSession : function(activeBox)
    {
      // set session active
      this.setSessionActive(true);
      
      // set the active draggable
      this.setActiveBox(activeBox);
      
      // set the start groupBox
      this.__currentGroupBox = activeBox.getGroupBoxId();
           
      // ghost element
      this.__createGhostElement();
      
      // create groupBox coords map (if not available)
      if (this.__groupBoxInfos == null)
      {
        this.__groupBoxInfos = {};
        var groupBoxes = portal.box.Manager.getInstance().getGroupBoxes();
        for (var i=0, j=groupBoxes.length; i<j; i++)
        {
          this.__groupBoxInfos[groupBoxes[i].element.id] = {
            left  : qx.bom.element.Location.getLeft(groupBoxes[i].element),
            right : qx.bom.element.Location.getLeft(groupBoxes[i].element) + qx.bom.element.Dimension.getWidth(groupBoxes[i].element)
          };                                      
        } 
      }
    },
    
    
    /**
     * Creates the ghost element which is moved during the drag&drop session
     * 
     * @return {void}
     */
    __createGhostElement : function()
    {
      // create ghost element
      if (!this.__ghost) {
        this.__ghost = qx.bom.Element.create("div");
      }

      
      // use the computedStyle rather than the "clientWidth" or "clientHeight"
      // to ensure the padding is included for Firefox
      var element   = this.getActiveBox().getElement();
      var dimension = portal.box.Util.getComputedDimension(element);
      
      // get all elements of box
      this.__switchParent(element, this.__ghost);

      // style the ghost element
      qx.bom.element.Class.add(this.__ghost, qx.bom.element.Class.get(element));
      
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        var top = qx.bom.element.Location.getTop(element, "margin") - 
                  parseInt(qx.bom.element.Style.get(element, "paddingTop")) -
                  parseInt(qx.bom.element.Style.get(element, "borderTopWidth"));
      }
      else if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        var top = qx.bom.element.Location.getTop(element, "margin");
      }
      else
      {
        var top = qx.bom.element.Location.getTop(element);
      }
      
      var css = "opacity:0.5;margin:0;position:absolute;" +
                "top:" + top + "px;" +
                "left:" + qx.bom.element.Location.getLeft(element) + "px;" +
                "width:" + dimension.width + "px;" + 
                "height:" + dimension.height + "px";
                
      qx.bom.element.Style.setCss(this.__ghost, css);
      
      // set a new border for the box element - this element actually gets moved around
      qx.bom.element.Style.set(element, "border", "1px dashed red");

      // insert the ghost element and bring it to the front
      qx.dom.Node.getBodyElement(element).appendChild(this.__ghost);
      portal.box.Util.bringToFront(this.__ghost);
    },
    
    
    /**
     * Add the children elements of the source node to the target node.
     *
     * @param source {Node} source DOM node
     * @param target {Node} target DOM node
     * @return {void} 
     */
    __switchParent : function(source, target)
    {
      while (source.firstChild) {
        target.appendChild(source.firstChild);
      }
    },

    
    /**
     * Stops a drag and drop session.
     * 
     * @param e {qx.event.type.Drag} Drag event instance
     * @return {void}
     */
    stopSession : function(e)
    {
      // set session inactive
      this.setSessionActive(false);
      
      var activeBox  = this.getActiveBox();       
      var element    = activeBox.getElement();
      
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        var top        = qx.bom.element.Location.getTop(element, "margin") - parseInt(qx.bom.element.Style.get(element, "paddingTop")) - parseInt(qx.bom.element.Style.get(element, "paddingBottom"));
        var left       = qx.bom.element.Location.getLeft(element, "margin") - parseInt(qx.bom.element.Style.get(element, "paddingLeft"));
      }
      else if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        var top        = qx.bom.element.Location.getTop(element, "margin");
        var left       = qx.bom.element.Location.getLeft(element, "margin");
      }
      else
      {
        var top        = qx.bom.element.Location.getTop(element);
        var left       = qx.bom.element.Location.getLeft(element);
      }
      
      // inform the box manager about the update
      portal.box.Manager.getInstance().updateGroupBoxMembers(activeBox.getGroupBoxId(), this.__currentGroupBox, activeBox);
      
      // store the new groupBox id
      activeBox.setGroupBoxId(this.__currentGroupBox);
      
      // animation setup
      var animMove = new qx.fx.effect.core.Move(this.__ghost);
      animMove.set(
      {
        x          : left,
        y          : top,
        mode       : "absolute",
        duration   : 0.5,
        transition : "spring"
      });
      
      // start the animation
      animMove.start();

      // listener for animation end 
      var self = this;
      animMove.addListener("finish", function()
      {
        // switch back
        self.__switchParent(self.__ghost, element);
        
        // reset the border
        qx.bom.element.Style.reset(element, "border");

        // remove ghost
        self.__ghost.parentNode.removeChild(self.__ghost);

        // check if the box is already the active one
        if (activeBox.isActive())
        {
          // if active call the apply to be sure about the state
          activeBox._applyActive(true);
        }
        else
        {
          // otherwise call the manager to make box active
          portal.box.Manager.getInstance().setActiveBox(activeBox);  
        }
      });
    },
    
    
    /**
     * Listener method for "dragmove" events
     *
     * @param top {Integer} top coordinate of the drag event
     * @param left {Integer} left coordinate of the drag event
     * @param offsetTop {Integer} offsetTop of the drag event
     * @param offsetLeft {Integer} offsetLeft of the drag event 
     * @return {void} 
     */
    onDragMove : function(top, left)
    {
      // set the new left coord (if changed)
      if (this.__positions.left != left)
      {
        qx.bom.element.Style.set(this.__ghost, "left", left + "px");
      }
      
      // set the new top coord (if changed)
      if (this.__positions.top != top)
      {
        qx.bom.element.Style.set(this.__ghost, "top", top + "px");
      }
      
      // get the element of the dragged box and cache top position and height
      var activeBoxElement = this.getActiveBox().getElement();
      if (this.__activeBoxInfo.top == null)
      {
        this.__activeBoxInfo.top = qx.bom.element.Location.getTop(activeBoxElement);
      }
      
      if (this.__activeBoxInfo.height == null)
      {
        this.__activeBoxInfo.height = qx.bom.element.Dimension.getHeight(activeBoxElement);
      }
      
      // if the mouse pointer is moved over the placeholder nothing has to be done
      if (this.__groupBoxChange == false  && top >= this.__activeBoxInfo.top &&
          top <= (this.__activeBoxInfo.top + this.__activeBoxInfo.height))
      {
        return;
      }
      
      
      var nextBox;
      /* 
       * Special case: box is dragged to a new groupBox
       */ 
      if (this.__groupBoxChange)
      {
        // get the first element of the groupBox as start point
        nextBox = qx.dom.Hierarchy.getFirstDescendant(document.getElementById(this.__currentGroupBox));
        var nextBoxTop, nextBoxHeight;
        
        // iterate over all elements to check where to insert the placeholder element
        while (nextBox != null)
        {
          if (this.__checkInsert(true, top, activeBoxElement, nextBox))
          {
            this.__groupBoxChange = false;
            return;
          }
          nextBox = qx.dom.Hierarchy.getNextElementSibling(nextBox);
        }
      }
      else
      {
        nextBox = activeBoxElement;
      }
      
      // which direction to check?
      if (top - this.__positions.top > 0)
      {
        // down
        nextBox = qx.dom.Hierarchy.getNextElementSibling(nextBox);
        var nextBoxTop, nextBoxHeight;
        
        while(nextBox != null)
        {
          if (nextBox) {
            if (this.__checkInsert(true, top, activeBoxElement, nextBox))
            {
              return;
            }
          }
          nextBox = qx.dom.Hierarchy.getNextElementSibling(nextBox);
        }
      }
      else
      {
        // up
        var nextBox = qx.dom.Hierarchy.getPreviousElementSibling(nextBox);
        var nextBoxTop, nextBoxHeight;
        
        while(nextBox != null)
        {
          if (nextBox) {
            if (this.__checkInsert(false, top, activeBoxElement, nextBox))
            {
              return;
            }
          }
          nextBox = qx.dom.Hierarchy.getPreviousElementSibling(nextBox);
        }
      }
      
      // store the current offsets to check against at the next cycle
      this.__positions.left = left;
      this.__positions.top  = top; 
    },
    
    
    /**
     * Helper method to check where or if at all to insert the dragged box
     * 
     * @param downwards {Boolean} drag direction
     * @param top {Integer} top coordinate
     * @param activeBoxElement {Element} element of the dragged box
     * @param nextBox {Element} element to check against (for possible insertion)
     * @return {Boolean} whether the element was inserted
     */
    __checkInsert : function(downwards, top, activeBoxElement, nextBox)
    {
      var nextBoxTop    = qx.bom.element.Location.getTop(nextBox);
      var nextBoxHeight = qx.bom.element.Dimension.getClientHeight(nextBox);
      var sibling;
      
      if (downwards) {
        if (top >= (nextBoxTop + (nextBoxHeight / 3))) {
          sibling = qx.dom.Hierarchy.getNextElementSibling(nextBox);
          if (sibling != activeBoxElement || sibling == null) {
            qx.dom.Element.insertAfter(activeBoxElement, nextBox);
            
            this.__activeBoxInfo.top = qx.bom.element.Location.getTop(activeBoxElement);
          }
          return true;
        }
      }
      else {
        if (top <= (nextBoxTop + nextBoxHeight * 2 / 3)) {
          sibling = qx.dom.Hierarchy.getPreviousElementSibling(nextBox);
          if (sibling != activeBoxElement || sibling == null) {
            qx.dom.Element.insertBefore(activeBoxElement, nextBox);
            
            this.__activeBoxInfo.top = qx.bom.element.Location.getTop(activeBoxElement);
          }
          return true;
        }
      }
      
      return false;
    },
    
    
    /**
     * Checks over which groupBox the dragged box is and sets the current
     * groupBox. 
     * 
     * @param {Integer} current x coordinate
     * @return {void}
     */
    checkGroupBox : function(left)
    {
      // check at first the current groupBox
      if (this.__groupBoxInfos[this.__currentGroupBox].left <= left && this.__groupBoxInfos[this.__currentGroupBox].right >= left)
      {
        return;
      }
      
      for (var info in this.__groupBoxInfos)
      {
        if (info != this.__currentGroupBox)
        {
          if (this.__groupBoxInfos[info].left <= left && this.__groupBoxInfos[info].right >= left)
          {
            this.__currentGroupBox = info;
            this.__groupBoxChange  = true;
            return;
          }          
        }
      } 
    }
  },


  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function()
  {
    this._disposeFields("__activeBoxInfo", "__positions", "__currentGroupBox", "__currentBoxElement", "__ghost", "__groupBoxInfos");
  }
});

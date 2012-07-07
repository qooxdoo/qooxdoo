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
     * Alexander Steitz (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Manager class for drag and drop of container
 */
qx.Class.define("demobrowser.demo.bom.portal.dragdrop.Manager",
{
  type : "singleton",
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this.__activeBoxInfo = { top : null, height : null };
    this.__positions = { top : 0, left : 0 };
  },


  /* ******************************************************
   *    PROPERTIES
   * ******************************************************/
  properties :
  {
    /** The current active draggable box. This assumes a drag session is starting */
    activeBox :
    {
      check    : "demobrowser.demo.bom.portal.box.Box",
      init     : null,
      nullable : true
    },

    /** Indicates whether a drag and drop session is currently active */
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
    __activeBoxInfo : null,
    __currentGroupBox : null,
    __groupBoxChange : false,
    __positions : null,
    __groupBoxInfos : null,
    __ghost : null,


    /**
     * Starts a drag and drop session
     *
     * @param activeBox {demobrowser.demo.bom.portal.box.Box} active box instance
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
        var groupBoxes = demobrowser.demo.bom.portal.box.Manager.getInstance().getGroupBoxes();
        for (var i=0, j=groupBoxes.length; i<j; i++)
        {
          this.__groupBoxInfos[groupBoxes[i].element.id] = {
            left  : qx.bom.element.Location.getLeft(groupBoxes[i].element),
            right : qx.bom.element.Location.getLeft(groupBoxes[i].element) +
                    qx.bom.element.Dimension.getWidth(groupBoxes[i].element)
          };
        }
      }
    },


    /**
     * Creates the ghost element which is moved during the drag&drop session
     */
    __createGhostElement : function()
    {
      // create ghost element
      if (!this.__ghost) {
        this.__ghost = qx.dom.Element.create("div");
      }

      var element = this.getActiveBox().getElement();
      var dimension = qx.bom.element.Dimension.getContentSize(element);

      // get all elements of box
      this.__switchParent(element, this.__ghost);

      // style the ghost element
      qx.bom.element.Class.add(this.__ghost, qx.bom.element.Class.get(element));

      var css = "opacity:0.5;margin:0;position:absolute;" +
                "top:" + qx.bom.element.Location.getTop(element) + "px;" +
                "left:" + qx.bom.element.Location.getLeft(element) + "px;" +
                "width:" + dimension.width + "px;" +
                "height:" + dimension.height + "px";

      qx.bom.element.Style.setCss(this.__ghost, css);

      // set a new border for the box element - this element gets moved around
      qx.bom.element.Style.set(element, "border", "1px dashed red");

      qx.dom.Node.getBodyElement(element).appendChild(this.__ghost);
      demobrowser.demo.bom.portal.box.Util.bringToFront(this.__ghost);
    },


    /**
     * Add the children elements of the source node to the target node.
     *
     * @param source {Node} source DOM node
     * @param target {Node} target DOM node
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
     * @lint ignoreDeprecated(_applyActive)
     */
    stopSession : function(e)
    {
      // set session inactive
      this.setSessionActive(false);

      var activeBox = this.getActiveBox();
      var element = activeBox.getElement();

      // inform the box manager about the update
      demobrowser.demo.bom.portal.box.Manager.getInstance().updateGroupBoxMembers(
        activeBox.getGroupBoxId(), this.__currentGroupBox, activeBox
      );

      // store the new groupBox id
      activeBox.setGroupBoxId(this.__currentGroupBox);

      // animation setup
      var from = {left: qx.bom.element.Location.getLeft(this.__ghost) + "px", top: qx.bom.element.Location.getTop(this.__ghost) + "px"};
      var to = {left: qx.bom.element.Location.getLeft(element) + "px", top: qx.bom.element.Location.getTop(element) + "px"};
      var desc = {timing: "ease-out", duration: 300, keep: 100, keyFrames : {
        0 : from,
        100 : to
      }};
      var handle = qx.bom.element.Animation.animate(this.__ghost, desc);

      // listener for animation end
      handle.addListener("end", function()
      {
        this.__switchParent(this.__ghost, element);

        qx.bom.element.Style.reset(element, "border");

        this.__ghost.parentNode.removeChild(this.__ghost);

        if (activeBox.isActive()) {
          activeBox._applyActive(true);
        } else {
          demobrowser.demo.bom.portal.box.Manager.getInstance().setActiveBox(activeBox);
        }
      }, this);
    },


    /**
     * Listener method for "dragmove" events
     *
     * @param top {Integer} top coordinate of the drag event
     * @param left {Integer} left coordinate of the drag event
     */
    onDragMove : function(top, left)
    {
      if (this.__positions.left != left) {
        qx.bom.element.Style.set(this.__ghost, "left", left + "px");
      }

      if (this.__positions.top != top) {
        qx.bom.element.Style.set(this.__ghost, "top", top + "px");
      }

      // get the element of the dragged box and cache top position and height
      var activeBoxElement = this.getActiveBox().getElement();
      if (this.__activeBoxInfo.top == null) {
        this.__activeBoxInfo.top = qx.bom.element.Location.getTop(activeBoxElement);
      }

      if (this.__activeBoxInfo.height == null) {
        this.__activeBoxInfo.height = qx.bom.element.Dimension.getHeight(activeBoxElement);
      }

      // if the mouse pointer is moved over the placeholder nothing has to be done
      if (this.__groupBoxChange == false  && top >= this.__activeBoxInfo.top &&
          top <= (this.__activeBoxInfo.top + this.__activeBoxInfo.height)) {
        return;
      }


      var nextBox;

      // Special case: box is dragged to a new groupBox
      if (this.__groupBoxChange)
      {
        // get the first element of the groupBox as start point
        nextBox = qx.dom.Hierarchy.getFirstDescendant(document.getElementById(this.__currentGroupBox));

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
      else {
        nextBox = activeBoxElement;
      }

      // which direction to check?
      if (top - this.__positions.top > 0)
      {
        // down
        nextBox = qx.dom.Hierarchy.getNextElementSibling(nextBox);

        while(nextBox != null)
        {
          if (nextBox) {
            if (this.__checkInsert(true, top, activeBoxElement, nextBox)) {
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

        while(nextBox != null)
        {
          if (nextBox) {
            if (this.__checkInsert(false, top, activeBoxElement, nextBox)) {
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
      var nextBoxTop = qx.bom.element.Location.getTop(nextBox);

      var nextBoxPaddingTop = parseInt(qx.bom.element.Style.get(nextBox, "paddingTop"));
      var nextBoxPaddingBottom = parseInt(qx.bom.element.Style.get(nextBox, "paddingBottom"));
      var nextBoxHeight = qx.bom.element.Dimension.getContentHeight(nextBox) +
                          nextBoxPaddingBottom + nextBoxPaddingTop;

      var sibling;

      if (downwards)
      {
        if (top >= (nextBoxTop + (nextBoxHeight / 3)))
        {
          sibling = qx.dom.Hierarchy.getNextElementSibling(nextBox);
          if (sibling != activeBoxElement || sibling == null)
          {
            qx.dom.Element.insertAfter(activeBoxElement, nextBox);

            this.__activeBoxInfo.top = qx.bom.element.Location.getTop(activeBoxElement);
          }
          return true;
        }
      }
      else
      {
        if (top <= (nextBoxTop + nextBoxHeight * 2 / 3))
        {
          sibling = qx.dom.Hierarchy.getPreviousElementSibling(nextBox);
          if (sibling != activeBoxElement || sibling == null)
          {
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
     * @param left {Integer} current x coordinate
     */
    checkGroupBox : function(left,width)
    {
      // check at first the current groupBox
      if (this.__groupBoxInfos[this.__currentGroupBox].left <= left &&
          this.__groupBoxInfos[this.__currentGroupBox].right >= left) {
        return;
      }

      for (var info in this.__groupBoxInfos)
      {
        if (info != this.__currentGroupBox)
        {
          if (this.__groupBoxInfos[info].left <= left+width && this.__groupBoxInfos[info].right >= left)
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
    this.__activeBoxInfo = this.__positions = this.__currentGroupBox = null;
    this.__currentBoxElement = this.__ghost = this.__groupBoxInfos = null;
  }
});

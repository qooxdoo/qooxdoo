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
 * Manager class for all boxes.
 */
qx.Class.define("demobrowser.demo.bom.portal.box.Manager",
{
  type : "singleton",
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.__members    = [];
    this.__groupBoxes = [];
    this.__boxLookup  = {};
  },


  /* ******************************************************
   *    STATICS
   * ******************************************************/
  statics :
  {
     dataKeyRoot       : "boxData",
     dataKeyGroupBoxes : "groupBoxes",
     dataKeyBoxes      : "boxes"
  },

  /* ******************************************************
   *    EVENTS
   * ******************************************************/
  events :
  {
    /** Fired when the manager finished his initialization */
    "loaded" : "qx.event.type.Event"
  },


  /* ******************************************************
   *    PROPERTIES
   * ******************************************************/
  properties :
  {
    /**
     * Stores the currently active box instance
     */
    activeBox :
    {
      init  : null,
      check : "demobrowser.demo.bom.portal.box.Box",
      apply : "_applyActiveBox"
    }
  },


  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    __members    : null,
    __groupBoxes : null,
    __boxLookup  : null,


    /**
     * Apply method for "activeBox" property
     *
     * @param value {demobrowser.demo.bom.portal.box.Box} new active box
     * @param old {demobrowser.demo.bom.portal.box.Box ? null} old active box or null
     * @return {void}
     */
    _applyActiveBox : function(value, old)
    {
      if (old != null)
      {
        // Set the currently active container inactive
        old.setActive(false);
      }

      // Set the active container
      value.setActive(true);
    },


    /**
     * Method to start the initialisations of the manager
     *
     * @return {void}
     */
    load : function()
    {
      // get the data from the global variable
      this.__init(window[demobrowser.demo.bom.portal.box.Manager.dataKeyRoot]);

      // dispatch "loaded" event
      qx.event.Registration.fireEvent(this, "loaded");
    },


    /**
     * Internal init method which is used by the {@link #load} method
     *
     * @param boxData {Map} data structure of the boxes/groupBoxes
     * @return {void}
     */
    __init : function(boxData)
    {
      var groupBox, groupBoxId, groupBoxBoxes, groupBoxData, newBox, boxData;

      // information about the groupBoxes and boxes
      var groupBoxes = boxData[demobrowser.demo.bom.portal.box.Manager.dataKeyGroupBoxes];
      var boxes      = boxData[demobrowser.demo.bom.portal.box.Manager.dataKeyBoxes];

      // iterate over the groupBoxes, store them in an array and create a
      // small lookup array to quickly get the boxes of the groupBox
      for (var groupBoxId in groupBoxes)
      {
        groupBox      = groupBoxes[groupBoxId];
        groupBoxBoxes = groupBox.boxes;
        groupBoxId    = groupBox.id;

        groupBoxData =
        {
          id      : groupBoxId,
          element : document.getElementById(groupBoxId)
        };

        // store the info about each groupBox and create lookup array
        this.__groupBoxes.push(groupBoxData);
        this.__boxLookup[groupBoxId] = [];

        // get the boxes of each groupBox, create an instance for each and
        // store them in an array
        for (var k=0, l=groupBoxBoxes.length; k<l; k++)
        {
          boxData     = boxes[groupBoxBoxes[k]];
          var element = document.getElementById(boxData.id);

          var newBox = new demobrowser.demo.bom.portal.box.Box(boxData, element, null, groupBoxId);

          this.__members.push(newBox);
          this.__boxLookup[groupBoxId].push(newBox);
        }
      }
    },


    /**
     * Return all members (boxes)
     *
     * @return {Array} All members as array
     */
    getBoxes : function() {
      return this.__members;
    },


    /**
     * Return all groupboxes
     *
     * @return {Array} All members as array
     */
    getGroupBoxes : function() {
      return this.__groupBoxes;
    },


    /**
     * Updates the members of groupBoxes. If a box is moved or added to a
     * groupBox the data structure has to be updated.
     *
     * @param newGroupBoxId {String} Id of the new groupBox
     * @param oldGroupBoxId {String} Id of the old groupBox
     * @param box {demobrowser.demo.bom.portal.box.Box} moved box instance
     * @return {void}
     */
    updateGroupBoxMembers : function(newGroupBoxId, oldGroupBoxId, box)
    {
      // get the position of the element in the DOM
      var index = qx.dom.Hierarchy.getElementIndex(box.getElement());

      // delete it from the lookup table
      qx.lang.Array.remove(this.__boxLookup[oldGroupBoxId], box);

      // insert it at the new position
      qx.lang.Array.insertAt(this.__boxLookup[newGroupBoxId], box, index);
    },


    /**
     * Get the groupBox which contains the given box
     *
     * @param boxId {Integer} Id of the box
     * @return {Map | null} Data structure of a group box or null
     */
    getGroupBoxDataOfBox : function(boxId)
    {
      for (var i=0, j=this.__groupBoxes.length, boxes; i<j; i++)
      {
        boxes = this.__boxLookup[this.__groupBoxes[i].id];

        for (var k=0, l=boxes.length; k<l; k++)
        {
          if (boxes[k].getId() === boxId) {
            return this.__groupBoxes[i];
          }
        }
      }

      return null;
    }
  },


  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function() {
    this.__members = this.__groupBoxes = this.__boxLookup = null;
  }
});

/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)


************************************************************************ */

/**
 * Registrar for command groups to be able to active or deactive them.
 */
qx.Class.define("qx.ui.command.GroupManager",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);
    this.__groups = [];
  },


  members :
  {
    __groups: null,
    __activeGroup : null,


    /**
     * Add command group.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {Boolean} <code>false</code> if group was already added before
     */
    add : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      if (this.__groups.includes(group)){
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Group is already added!");
        }
        return false;
      }

      this.__groups.push(group);

      // deactivate added group to prevent collusions
      group.setActive(false);

      return true;
    },


    /**
     * Whether a command manager was added.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {Boolean} <code>true</code> if group already added
     */
    has : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      return !!(this._getGroup(group));
    },


    /**
     * Removes a command group from group manager. If removed group was the
     * active group, active group will be set to <code>null</code> Returns the
     * group.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {qx.ui.command.Group | null} Command group or null if group was not added before
     */
    remove : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Group must be an instance of qx.ui.command.Group");
      }

      var index = this.__groups.indexOf(group);
      if (index === -1){
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Group was not added before. Please use " +
            "'add()' method to add the group.");
        }
      }

      // reset active group
      if (this.getActive() === group) {
        this.__activeGroup = null;
      }

      // remove group from internal array
      this.__groups.splice(index, 1);

      return group;
    },


    /**
     * Activates a command group and deactivates all other added groups.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {Boolean} <code>false</code> if group was not added before
     */
    setActive : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      if (!this.has(group)) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Group was not added before! You have to use 'addCommand()' method before activating!");
        }
        return false;
      }

      // iterate through all groups and deactivate all expect the given one
      for (var i=0; i<this.__groups.length; i++) {
        var item = this.__groups[i];
        if (item == group){
          item.setActive(true);
          this.__activeGroup = item;
          continue;
        }
        item.setActive(false);
      }

      return true;
    },


    /**
     * Returns active command group.
     *
     * @return {qx.ui.command.Group | null} Active command group
     */
    getActive : function()
    {
      return this.__activeGroup;
    },


    /**
     * Blocks the active command group.
     */
    block : function()
    {
      if(this.__activeGroup){
        this.__activeGroup.setActive(false);
      }
    },


    /**
     * Unblocks the active command group.
     */
    unblock : function()
    {
      if(this.__activeGroup){
        this.__activeGroup.setActive(true);
      }
    },


    /**
     * Helper function returns added command group.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {qx.ui.command.Group | null} Command group or null
     */
    _getGroup : function(group)
    {
      var index = this.__groups.indexOf(group);
      if (index === -1){
        return null;
      }

      return this.__groups[index];
    }
  },


  destruct : function()
  {
    this.__groups = this.__activeGroup = null;
  }
});

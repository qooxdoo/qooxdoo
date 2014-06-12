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
     * @param group {qx.ui.command.Group} Command group
     */
    addGroup : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      if (qx.lang.Array.contains(this.__groups, group)){
        this.debug("Group is already added!");
        return;
      }

      this.__groups.push(group);

      // deactivate added group to prevent collusions
      group.setActive(false);
    },


    /**
     * Activates a command group and deactiveted all others.
     * @param group {qx.ui.command.Group} Command group
     */
    setActiveGroup : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      if (!this.hasGroup(group)){
        this.debug("Group was not added before! You have to use 'addCommand()' method before activating!");
        return;
      }

      // iterate through all groups and deactivate all expect the given one
      for (var i=0; i<this.__groups.length; i++)
      {
        var item = this.__groups[i];
        if (item == group){
          item.setActive(true);
          this.__activeGroup = item;
          continue;
        }
        item.setActive(false);
      }
    },


    /**
     * Returns active command group.
     * @return {qx.ui.command.Group} Active command group
     */
    getActiveGroup : function()
    {
      return this.__activeGroup;
    },


    /**
     * Deactives all command groups, even the active one.
     */
    blockAll : function()
    {
      for (var i=0; i<this.__groups.length; i++){
        var item = this.__groups[i];
        item.setActive(false);
      }
    },


    /**
     * Blockes active command group.
     */
    blockActiveGroup : function()
    {
      if(this.__activeGroup){
        this.__activeGroup.setActive(false);
      }
    },


    /**
     * Unblocks active command group.
     */
    unblockActiveGroup : function()
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
    },


    /**
     * Whether a command manager was added.
     *
     * @param group {qx.ui.command.Group} Command group
     *
     * @return {Boolean} <code>true</code> if group already added
     */
    hasGroup : function(group)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(group, qx.ui.command.Group, "Given group is not an instance of qx.ui.command.Group");
      }

      return !!(this._getGroup(group));
    }
  },


  destruct : function()
  {
     this.__groups = this.__activeGroup = null;
  }
});

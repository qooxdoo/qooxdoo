/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Registrar for commands to be able to group them.
 */
qx.Class.define("qx.ui.command.Group",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);
    this._cmds = {};
  },


  properties :
  {
    /**
     * Activates or deactivates all commands in group.
     */
    active :
    {
      init : true,
      check : "Boolean",
      apply : "_applyActive"
    }
  },


  members :
  {
    _cmds : null,

    
    // property apply
    _applyActive : function(value)
    {
      for(var cmdkey in this._cmds){
        this._cmds[cmdkey].setActive(value);          
      }
    },

    
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */
    
    
    /**
     * Adds a command with a key to the group.
     * @param key {String} Key to be able to adress the command.
     * @param command {qx.ui.command.Command} Command  
     */
    addCommand : function(key, command)
    {
      // TODO: Assertion check
      
      if (this.getCommand(key)){
        throw new Error("Command with key: " + key +  " allready exists!");
        return;
      }
      
      this._cmds[key] = command;
    },


    /**
     * Returns a command by key.
     * @param key {String} Key which adresses the command.
     * @return {qx.ui.command.Command} Command
     */
    getCommand : function(key)
    {
      // TODO: Assertion check.
      if (key == null){
        return null;
      }
      var cmd = this._cmds[key];
      if (cmd == null){
        return null;
      }
      return cmd;
    },
    
    
    /**
     * Removes a command by key. Returns the command.
     * @param key {String} Key which adresses the command.
     * @return {qx.ui.command.Command} Command
     */
    removeCommand : function(key)
    {
      // TODO: Assertion check.
      if (key == null){
        return null;
      }
      var cmd = this._cmds[key];
      if (cmd == null){
        return null;
      }
      
      delete this._cmds[key];
      
      return cmd;
    }
  },

  destruct : function()
  {
    this._cmds = null;
  }
});

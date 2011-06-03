/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The mixin contains all functionality to provide a value property for input
 * widgets.
 */
qx.Mixin.define("qx.ui.mobile.form.MState",
{

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
  __state: null,
  
    addState : function(state) {
      this.__state = state;
      this.addCssClass(state);
    },
    
    hasState : function(state) {
      return this.__state === state;
    },
    
    removeState : function(state) {
      if(this.hasState(state)) {
        this.__state = null;
        this.removeCssClass(state);
      }
    },
    
    replaceState : function(oldState, newState) {
      this.__state = newState;
      this.removeCssClass(oldState);
      this.addCssClass(newState);
    }

  }
});

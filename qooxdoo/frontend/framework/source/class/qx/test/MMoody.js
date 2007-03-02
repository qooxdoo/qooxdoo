qx.Mixin.define("qx.test.MMoody",
{

	properties : 
	{
		age: {_legacy: true, type: "string"}
	},
	
  members :
  {
    /**
     * Hiss me
     *
     * @type member
     * @return {void}
     */
    hiss : function() {
      this.debug("CCCCCCCCCHHHHHH!!");
    }    
  },
  
  statics : 
  {
  	amIFat: function() { return true; }
  }

  
});

/**
 * DetailFrameTabView write docs about it
 */
qx.Class.define("apiviewer.DetailFrameTabView",
{
  extend : qx.ui.tabview.TabView,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

    members :
    {
      add : function(page){
        this.base(arguments,page);
        if(this.getChildren().length==1)
        {
          this.getChildren()[0].setShowCloseButton(false);
        }
        else
        {
          for(var i=0, l=this.getChildren().length; i<l; i++) {
            this.getChildren()[i].setShowCloseButton(true);
          }
        }
      },
      remove : function(page){
        if(this.getChildren().length>1)
        {
          this.base(arguments,page);
          if(this.getChildren().length==1) {
            this.getChildren()[0].setShowCloseButton(false);
          }
        }
      }
    }
});

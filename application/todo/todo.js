q.define({
  construct : function() {
    this.__data = q.localStorage.getItem("qx-todo");
    if (!this.__data) {
      this.__data = [{id: Date.now(), done: false, name: "My first ToDo"}];
    }

    q("#add").on("click", this._onAdd, this);
    this.render();
  },


  members : {
    render : function() {
      q("#tasks").empty();
      for (var i=0; i < this.__data.length; i++) {
        var li = q.template.get("task", this.__data[i]);
        li.find("input[type=checkbox]")[0].model = this.__data[i];
        q("#tasks").append(li);
        q("#tasks").find("input[type=checkbox]").on("click", this._onCheck, this);
      };
      this.updateClearButton();
    },

    updateClearButton : function() {
      if (q("#tasks").find("input[type=checkbox][checked]").length > 0) {
        q("#clear")
          .on("click", this._onClear, this)
          .replaceClass("button-disabled", "button");
      } else {
        q("#clear")
          .off("click", this._onClear, this)
          .replaceClass("button", "button-disabled");
      }
    },

    save : function() {
      q.localStorage.setItem("qx-todo", this.__data);
      this.render();
    },

    _onAdd : function() {
      var name = prompt("Task name", "") || "";
      this.__data.push({id: Date.now(), done: false, name: name});
      this.save();
    },

    _onClear : function() {
      for (var i = this.__data.length -1; i >= 0; i--) {
        if (this.__data[i].done) {
          this.__data.splice(i, 1);
        }
      };
      this.save();
    },

    _onCheck : function(e) {
      var checkbox = e.getTarget();
      checkbox.model.done = checkbox.checked;
      this.save();
    }
  },

  defer : function(statics) {
    q.$attachStatic({
      "startTodo" : function() {
        new statics();
      }
    });
  }
});
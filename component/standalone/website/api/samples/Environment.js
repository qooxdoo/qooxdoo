addSample("q.env.get", {
  html: ['<div id="data"></div>'],
  javascript: function() {
    var data = [
      "browser.name: " +  q.env.get("browser.name"),
      "browser.version: " + q.env.get("browser.version")
      ].join("<br>");
    q("#data").setHtml(data);
  },
  executable: true
});

addSample("q.env.add", {
  javascript: function() {
    q.env.add("my.setting", 123);
    console.log(q.env.get("my.setting"));
  },
  executable: true
});
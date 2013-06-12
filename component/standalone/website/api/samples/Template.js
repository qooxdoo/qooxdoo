addSample("q.template.render", function() {
  var webappData = {
    groupId: 23,
    artifactid: 42,
    detailLink: "/webapps/23/42"
  };

  var entryTemplate = '&lt;li&gt;' +
                      '&lt;a href="{{link}}"&gt;{{groupid}} - {{artifactid}}&lt;/a&gt;' +
                      '&lt;/li&gt;';

  q('#app-list').append(q.template.render(entryTemplate, {
    groupid: webappData.groupId,
    artifactid: webappData.artifactid,
    link: webappData.detailLink
  }));
});

addSample("q.template.renderToNode", function() {
  var webappData = {
    artifacts : [
      { groupId: 23, artifactid: 42, detailLink: "/webapps/23/42" },
      { groupId: 23, artifactid: 43, detailLink: "/webapps/23/43" },
      { groupId: 23, artifactid: 44, detailLink: "/webapps/23/44" }
    ]
  };
  var entryTemplate = '<div>{{#artifacts}}<p><a href="{{detailLink}}">{{groupId}} - {{artifactid}}</a>{{/artifacts}}</p></div>';

  var renderedCollection = q.template.renderToNode(entryTemplate, webappData);  
  renderedCollection.on("click", function(e){
    alert("clicked at " + e.getTarget().innerHTML);
    e.preventDefault();
  });

  renderedCollection.appendTo(document.body);
});


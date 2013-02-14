addSample("q.template.render", function() {
  var webappData = {
    groupId: 23,
    artefactId: 42,
    detailLink: "/webapps/23/42"
  };

  var entryTemplate = '&lt;li&gt;' +
                      '&lt;a href="{{link}}"&gt;{{groupid}} - {{artefactid}}&lt;/a&gt;' +
                      '&lt;/li&gt;';

  q('#app-list').append(q.template.render(entryTemplate, {
    groupid: webappData.groupId,
    artefactid: webappData.artefactId,
    link: webappData.detailLink
  }));
});

addSample("q.object.merge", {
  javascript: function() {
    var target = {
      id: 1234,
      nested: {
        test: true
      }
    };

    var source = {
      id: 5678,
      name: 'qxWeb',
      nested: {
        id: 1234
      }
    };

    var source2 = {
      licence: 'MIT',
      list: [ 0, 1, 2 ]
    };

    var result = q.object.merge(target, source, source2);
    // result is
    //{
    //  id: 5678,
    //  name: 'qxWeb',
    //  nested: {
    //    id: 1234
    //  }
    //  licence: 'MIT',
    //  list: [ 0, 1, 2 ]
    //}
    console.log(result);
  },
  executable: true
});
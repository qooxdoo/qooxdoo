qx.Class.define("classIssue726",
  {
    members:
    {
      test_1: function () {
        let test = "class:1:2";
        let [t_0, t_1] = test.split(":");
        console.log(t_0, t_1);
        let [testClass, ...testName] = test.split(":");
        console.log(testClass, testName);
      },
      test_2: function (test_2_param1 = {}) {
        console.log(test_2_param1);
      },
      test_3: function ({test_3_param1, test_3_param2} = {}) {
        console.log(test_3_param1, test_3_param2);
      },
      test_4: function ({test_4_param1 = 1, test_4_param2 = 2} = {}) {
        console.log(test_4_param1, test_4_param2);
      }
    }
  });

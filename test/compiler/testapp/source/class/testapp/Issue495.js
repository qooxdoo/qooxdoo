qx.Class.define("testapp.Issue495", {
  extend: qx.core.Object,
  
  members: {
    test() {
      Object.entries({foo:"bar"}).map(([key, value]) => console.log(`${key}: ${value}`));

      var obj = { a: 1, b: 2, c: 3 };
      var fn = ({b,c}) => console.log(`b=${b} c=${c}`);
      fn(obj);
    }
  }
});

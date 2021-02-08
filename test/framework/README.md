
# how to run test

```bash
git clone https://github.com/qooxdoo/qooxdoo.git
cd qooxdoo
npm install
cd cd test/framework
npx qx test
```

to test a single class 
```bash
npx qx test --class=class_to_test
```


# debug tests

```bash
npx qx serve
```

call your browser with: ```http://localhost:8080```
to debug a single class: ```http://localhost:8080?class=class_to_test```


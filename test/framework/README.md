# tested requirements

## Windows
- node --version: 14.15.4
- npm  --version: 7.5.3


## Linux

- node --version: 14.15.4
- npm  --version: 6.14.10

# how to run test

```bash
git clone https://github.com/qooxdoo/qooxdoo.git
cd qooxdoo
npm install
cd test/framework
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

```bash
../../node_modules/.bin/qx serve
```


call your browser with: ```http://localhost:8080```

to debug a single class: ```http://localhost:8080?class=class_to_test```

# hints

if ```npx qx``` fails after the first run - it do so in my linux enviroment - you can start 
qx with ```../../node_modules/.bin/qx``` or ```../../node_modules/@qooxdoo/compiler/bin/deploy/qx```


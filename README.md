[![NPM Version][npm-image]][npm-url]
[![Gitter][gitter-image]][gitter-url]

# Qooxdoo JavaScript Framework 

qooxdoo is a universal JavaScript framework that enables you to create 
applications for a wide range of platforms. With its object-oriented 
programming model you build rich, interactive applications (RIAs), 
native-like apps for mobile devices, light-weight traditional web 
applications or even applications to run outside the browser.

You leverage its integrated tool chain to develop and deploy 
applications of any scale, while taking advantage of modern web 
technologies like HTML5 and CSS3, its comprehensive feature set and a 
state-of-the-art GUI toolkit. qooxdoo is open source under liberal 
licenses, led by a dedicated developer team, with a vibrant 
community.

For more information please see http://qooxdoo.org .

## License

qooxdoo may be used under the terms of the MIT License.

For more information please see http://qooxdoo.org/LICENCSE .

## Quick start

It is easy to get started with qooxdoo. For detailed information please
see [our Get Started Guide](https://qooxdoo.org/documentation/#/?id=getting-started).

## Development

If you develop *with* qooxdoo, you would normally use a stable
[NPM release](https://www.npmjs.com/package/@qooxdoo/qx) and a
compiler called with `npx qx ...`. 

In contrast, when hacking qooxdoo itself, you
need to first execute the following steps:

```bash
git clone https://github.com/qooxdoo/qooxdoo.git
cd qooxdoo
npm install
./bootstrap-compiler
./bootstrap/qx config set qx.library `pwd`
```
This compiles the compiler you will be using to compile your code from the sources
of this repository, which makes sure that you are using the latest version of the
compiler. 

If you work on the compiler itself, you will then use `./bin/source/qx`. In order
to compile modified framework code, use the optimized `./bin/build/qx` executable. 

## Contributing

There are many ways you can contribute to qooxdoo, ranging from providing
feedback, making translations, providing a custom library to full-blown patches
to the code. Please check our web site for details. Mind that for every patch to
the repository we require an open bug in our issue tracker, and that commits to
the repository will fall under qooxdoo's license terms.

Qooxdoo source code is hosted on [github/qooxdoo](https://github.com/qooxdoo) and
we use the standard [Issue Tracker](https://github.com/qooxdoo/qooxdoo/issues) and
[Pull Requests feature](https://github.com/qooxdoo/qooxdoo/pulls).


## Community

Online chat is available via Gitter at https://gitter.im/qooxdoo/qooxdoo (or using
one of the Gitter desktop or mobile clients) - the core team hang out there, as do
other developers who use Qooxdoo.

## Learn more

* Documentation
  - http://qooxdoo.org/documentation (latest stable)
  - http://qooxdoo.org/qooxdoo (current master)

* Online Demos
  http://qooxdoo.org/demos

* API Documentation
  http://qooxdoo.org/api


[npm-image]: https://badge.fury.io/js/%40qooxdoo%2Fframework.svg
[npm-url]: https://npmjs.org/package/@qooxdoo/framework
[travis-image]: https://travis-ci.org/qooxdoo/qooxdoo.svg?branch=master
[travis-url]: https://travis-ci.org/qooxdoo/qooxdoo
[coveralls-image]: https://coveralls.io/repos/github/qooxdoo/qooxdoo/badge.svg?branch=master 
[coveralls-url]: https://coveralls.io/github/qooxdoo/qooxdoo?branch=master
[saucelab-image]: https://saucelabs.com/buildstatus/qx-core
[saucelab-url]: https://saucelabs.com/open_sauce/user/qx-core
[gitter-image]: https://badges.gitter.im/qooxdoo/qooxdoo.svg
[gitter-url]: https://gitter.im/qooxdoo/qooxdoo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

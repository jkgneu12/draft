# Ray Web UI


## Setup
_All commands should be run from this directory._

### Install software
* Install Ruby (if not installed)
    * Check if Ruby is installed: `gem`
    * If not installed, [install ruby](https://www.ruby-lang.org/en/documentation/installation/)
* Install [Sass](http://sass-lang.com/): `gem install sass`
* Install [node.js](https://nodejs.org/)
* Install [bower](http://bower.io/): `npm install -g bower`

### Install libraries
* Install [npm](https://www.npmjs.com/) dependencies
    * `npm update`
    * `npm install`
* Install bower dependencies:
    * `bower update`
    * `bower install`

### Run
`grunt serve`

### Unit Tests
`grunt test`

### Lint
`grunt lint`


## Technology Overview

* [React] (https://facebook.github.io/react/) - Application Framework
    * [React Component Lifecycle] (https://facebook.github.io/react/docs/component-specs.html)
    * [TodoMVC React+Backbone] (http://todomvc.com/examples/react-backbone/)
    * [JSX] (https://facebook.github.io/react/docs/jsx-in-depth.html)
* [React-Router] (https://github.com/rackt/react-router) - Request Router
* [Backbone] (http://backbonejs.org) - Data Model
    * Only using Backbone for the data model (not leverage there UI framework)
        * [Model] (http://backbonejs.org/#Model)
        * [Collection] (http://backbonejs.org/#Collection)
* [SCSS/SASS] (http://sass-lang.com/guide) - Better CSS
    * [SASS vs. SCSS syntax] (http://thesassway.com/editorial/sass-vs-scss-which-syntax-is-better)
* [Bootstrap] (http://getbootstrap.com/getting-started/)
* [Font Awesome] (http://fortawesome.github.io/Font-Awesome/icons/) - Icons 
    * Just icons that are actually fonts under the hood so they scale nicely
* [NPM] (https://www.npmjs.com/) - Package manager
* [Bower] (http://bower.io/) - Another package manager 
    * [NPM vs Bower] (http://stackoverflow.com/questions/18641899/what-is-the-difference-between-bower-and-npm)
* [Grunt] (http://gruntjs.com/) - Task runner (ANT for the web)
    * Also worth looking at [Gulp] (http://gulpjs.com/). Not using it now, but its widely adopted…
* [Webpack] (http://webpack.github.io/) - Bundler
* [Q] (https://github.com/kriskowal/q) - promise library
* [jQuery] (http://api.jquery.com/)
* [Underscore] (http://underscorejs.org/) - utility library

'use strict';

var Plugin           = require('../preprocessors/plugin');
var StylePlugin      = require('../preprocessors/style-plugin');
var TemplatePlugin   = require('../preprocessors/template-plugin');
var JavascriptPlugin = require('../preprocessors/javascript-plugin');
var debug            = require('debug')('ember-cli:registry');
var _remove          = require('lodash-node/modern/arrays/remove');
var _find            = require('lodash-node/modern/collections/find');

function Registry(plugins, app) {
  this.registry = {
    js: [],
    css: [],
    'minify-css': [],
    template: []
  };

  this.instantiatedPlugins = [];
  this.availablePlugins = plugins;
  this.app = app;
  this.pluginTypes = {
    'js': JavascriptPlugin,
    'css': StylePlugin,
    'template': TemplatePlugin
  };
}

module.exports = Registry;

Registry.prototype.extensionsForType = function(type) {
  var registered = this.registeredForType(type);

  var extensions =  registered.reduce(function(memo, plugin) {
    return memo.concat(plugin.ext);
  }, [type]);

  return require('lodash-node/underscore/arrays/uniq')(extensions);
};

Registry.prototype.load = function(type) {
  var plugins = this.registeredForType(type).map(function(plugin) {
    if(this.instantiatedPlugins.indexOf(plugin) > -1 || this.availablePlugins.hasOwnProperty(plugin.name)) {
      return plugin;
    }
  }.bind(this));

  return plugins.filter(Boolean);
};

Registry.prototype.registeredForType = function(type) {
  return this.registry[type] = this.registry[type] || [];
};

Registry.prototype.add = function(type, name, extension, options) {
  debug('add type: %s, name: %s, extension:%s, options:%s', type, name, extension, options);

  var registered = this.registeredForType(type);
  var plugin, PluginType;

  // plugin is being added directly do not instantiate it
  if (typeof name === 'object') {
    plugin = name;
    this.instantiatedPlugins.push(plugin);
  } else {
    PluginType = this.pluginTypes[type] || Plugin;
    options = options || {};
    options.applicationName = this.app.name;
    options.app = this.app;

    plugin = new PluginType(name, extension, options);
  }

  registered.push(plugin);
};

Registry.prototype.remove = function(type, name) {
  debug('remove type: %s, name: %s', type, name);

  var registered = this.registeredForType(type);
  var plugin;

  if (typeof name === 'object') {
    plugin = name;
    _remove(this.instantiatedPlugins, plugin);
  } else {
    plugin = _find(registered, { name: name });
  }

  _remove(registered, plugin);
};

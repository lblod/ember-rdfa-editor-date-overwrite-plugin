@lblod/ember-rdfa-editor-date-overwrite-plugin
==============================================================================

Easy update of xsd:date or xsd:dateTime in an editor-document.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install @lblod/ember-rdfa-editor-date-overwrite-plugin
```
The plugin will automatically be added in the default and all editor profiles in app/config/editor-profiles.js. Add the plugin name rdfa-editor-date-manipulation-plugin to other editor profiles if you want to enable the plugin in these profiles, too.


Usage
------------------------------------------------------------------------------

Looks for the following RDFA:
```
<span property="ns:aProperty" datatype="xsd:date" content="2012-12-12">12 december 2012</span>
```
Once found, hint is registered. User can click in date, and this plugin will suggest to overwrite it.

Provides a datepicker as help.

Recommended to use this plugin in conjunction with [ember-rdfa-editor-date-plugin](https://github.com/lblod/ember-rdfa-editor-date-plugin) to allow insertion of new dates.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

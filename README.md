@lblod/ember-rdfa-editor-date-overwrite-plugin
==============================================================================

Easy update of date in editor-document


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


Usage
------------------------------------------------------------------------------

Looks for the following RDFA:
```
<span property="ns:aProprty" datatype="xsd:date" content="2012-12-12">12 december 2012</span>
```
Once found, hint is registered. User can click in date, and this plugin will suggest to overwrite it.

Providing a datepicker as help.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

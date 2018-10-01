@lblod/ember-rdfa-editor-date-overwrite-plugin
==============================================================================

Easy update of date in editor-document

Installation
------------------------------------------------------------------------------

```
ember install @lblod/ember-rdfa-editor-date-overwrite-plugin
```


Usage
------------------------------------------------------------------------------

Looks for the following RDFA:
```
<span class="annotation" property="ns:aProprty" datatype="xsd:date" content="2012-12-12">12 december 2012</span>
```
Once found, hint is registered. User can click in date, and this plugin will suggest to overwrite it.

Providing a datepicker as help.


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-rdfa-editor-date-overwrite-plugin`
* `npm install`

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

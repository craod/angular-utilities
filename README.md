# angular-utilities
Tools for interacting with the Craod API through AngularJS

**[Requirements](#requirements)** **[Installation](#installation)** **[Usage](#usage)**

<a name="requirements"></a>
## Requirements
angular-utilities only requires AngularJS to work.

<a name="installation"></a>
## Installation
Simply include the files provided in the dist folder: angular-utilities.js and angular-utilities.css or angular-utilities.min.js and angular-utilities.min.css.
Add the *angular-utilities* module to your application for tools to be available.

<a name="usage"></a>
## Usage
### Settings
Configure the Settings service by setting its endpoint using the SettingsProvider and by setting initial data using the data property, if needed:

```
SettingsProvider.endpoint = '<settings endpoint>';
SettingsProvider.data = {
	key: 'value'
};
```

Use the load method to load the data, which is then navigable using the Settings.get method:

```
Settings.load().then(function () {
	alert('This is something that was loaded: ' + Settings.get('Configuration.option.path', defaultValue));
});
```

### Resource
Use the resource utility to be able to manipulate Craod resources. Ensure the Settings are loaded first, then you have access to the Resource methods.

### CrudService
Use the CrudService factory to easily create a Crud service with a number of endpoints. Simply initialize the CrudService with an associative array of
endpoints with their available configuration options, then you can use it:

```
var service = this;
var endpoints = {
	get: {
		url: Configuration.api.url + 'object/:guid',
		cachable: true
	},
	autocomplete: {
		url: Configuration.api.url + 'autocomplete/:query',
		method: 'get',
		cachable: true,
		pagination: true,
		sorting: false
	}
};

angular.extend(service, new CrudService(endpoints));

// Then, later:
service.get({}, {guid: 'aGuid'}).then(function (object) {
	alert('Got an object using the CrudService factory!');
});
```

For each endpoint, the following properties are understood:

Option | Default | Description
--- | --- | ---
method | get | The method to use to communicate with the server
pagination | undefined, falsy | Whether the endpoint allows for automatic pagination
sorting | undefined, falsy | Whether the endpoint allows for automatic sorting
filtering | undefined, falsy | Whether the endpoint allows for automatic filtering
cachable | undefined, falsy | Whether the endpoint may re-use the promise in order to provide a cache to prevent additional server calls

Each created endpoint uses the following signature:
```
/**
 * @param {?Object} properties Endpoint-specific configuration
 * @param {?Object} parameters Request data
 * @param {?Object} data POST data
 * @returns {Promise}
 */
function (properties, parameters, data)
```

#### Included CRUD services
There are three CRUD services included:

* UserService
* CategoryService
* ObjectService

These interact with the Craod API out of the box - however, they require the configuration setting **api.url** to be set in order to be used.

## Directives
### render-object
Use render-object to render an object (either an object or a loadable guid), using either a translation key or a property:

```
<p data-render-object="user" data-property="firstName" data-object="aUserGuid"></p>

<td data-render-object="category" data-property="name" data-object="{name: 'Switzerland'}"></td>
```

### object-image
Use the object-image directive to render an object image in the given size:

```
For a user: <object-image object="theUser" width="200" height="200" type="user"></object-image>
For an object: <object-image object="theObject" width="1000" height="600"></object-image>
```
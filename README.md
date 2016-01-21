# angular-utilities
Tools for interacting with the Craod API through AngularJS

**[Requirements](#requirements)** **[Installation](#installation)** **[Usage](#usage)**

<a name="requirements"></a>
## Requirements
angular-utilities only requires AngularJS to work.

<a name="installation"></a>
## Installation
Simply include the files provided in the dist folder: angular-utilities.js or angular-utilities.min.js. Add the *angular-utilities*
module to your application for tools to be available.

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
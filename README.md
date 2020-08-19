Vanilla Toasts (also refered to as vtoast) is a lightweight VanillaJS toast library. It does not require any framework to run. It is inspired from [toastr](https://github.com/CodeSeven/toastr) but removes the dependency to jQuery. 

It's also lighter and has fewer lines of code.

It is currently in active development thus some features mentioned below might not be (yet) implemented. Additional features may also be developed.

Current version: 1.0.0

Known issues with the current code:
- None
## States
A toast has 3 states
- Hidden: The toast is either in the process of being created or deleted.
- Shown: The toast is visible for the time set in the `duration` option.
- Focused: The toast is frozen in time (the auto-remove is cancelled). Happens when the cursor enters the toast. Once the cursor leaves the toast, the toast will remain in a "shown" state for the time set in the `unfocus-duration` option.
## Usage
To start with, include the CSS and the JavaScript (where PATH is the installation path or URL)
```html
<link rel="stylesheet" href="PATH/vtoast.css">
<script src="PATH/vtoast.js"></script>
```
And you are ready to bring quality toasts to your website.  

Consider the 3 variables below:
```javascript
let title;
let content;
let options;
```
`title` and `content` are strings, `options` is a JSON.

### Content only
If you pass only one parameter to the `show` method, it will be used as content and the [default options set]() will be used.
```javascript
vtoast.show(content);
```
### Title and content
You can pass the title and the content to the `show` method, the [default options set]() will be used.
```javascript
vtoast.show(title, content);
```
### Title, content and options
You can take full control and pass the title, the content and the options to the `show` method.
```javascript
vtoast.show(title, content, options);
```
## Options
Options are passed to the `show` method as a "one depth" JSON object.

|Option key|Default value|Description/Possible values|
|---|---|---|
|width|350|Defines the width (in px) of the toast. Any Number|
|margin|10|Defines the margin (in px) around the toast. Any Number|
|color|#004085 (bootstrap's primary)|Defines the font color of the toast. Any hex value|
|backgroundcolor|#CCE5FF (bootstrap's primary)|Defines the background color of the toast. Any hex value|
|duration|5000|The time (in ms) during which the toast will be visible. Any number|
|unfocusduration|1000|The time (in ms) that the toast will remain visible after it as been unfocused|
|position|`top-right`|The position of the toast. Any combination of `top\|middle\|bottom`-`left\|centre\|right`|
|showclose|false|Whether or not to show a close icon on the toast. true or false.|
|progressbar|`hidden`|The position of the progress bar in the toast. Either `hidden`, `top` or `bottom`. Performance note: when using `hidden`, the progress bar is disabled and the code is not included (It's not simply "hidden" through CSS).|
|opacity|1|The opacity of the toast. Any decimal number between 0 and 1.|

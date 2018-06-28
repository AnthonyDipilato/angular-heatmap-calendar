# Angular Heatmap Calendar
Angular directive for a heatmap calendar inspired by [GitHub's Contribution Calendar](https://help.github.com/articles/viewing-contributions-on-your-profile/#contributions-calendar)

## Demo
[Demo](https://jsfiddle.net/Anthony780/L71r6fy3/)  

## Requirements
AngularJS

D3

## Setup
1. Include `heatmap.calendar.js` and `heatmap-calendar.css`

2. Add heatmap calendar as a dependency in your app.

```javascript
var myApp = angular.module('myApp', ['heatmapCalendar']);
```

3. Include the directive in your page's code

```javascript
<heatmap-calendar 
        max-color="#144592" 
        verb="logged" 
        units="['mile','miles','mileage']" 
        tooltips="true" 
        callback="clicked(date)" 
        ng-model="values">
</heatmap-calendar>
```

## Options


| Option        | type           | description  |
| ------------- | ------------- | ----- |
| max-color | color hex value | The color for the max valued day. The directive generates a linear gradient from white to this value. |
| verb | string | The verb used for the units (logged, submitted, completed) |
| units | array(3) | The units displayed in the tooltips. `['singular','plural','none']`|
| tooltips | boolean | Enable or disable the tooltips. Default is true. |
| callback | function(date) | The function called when a date with a value is clicked. | 
| ng-model | array | The values used to generate the data. `item = { date: 'YYYYMMDD', value: 0}` |



## Author
Anthony DiPilato, anthony@bumbol.com

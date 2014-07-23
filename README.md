# PS

A module-like framework that encapsulates plugins, libraries, and other frameworks. It sets the framework as to how these module interact with each other through a namespaced and powerful global event system. Requires jQuery 1.7+.

# Directions

Include script `<script src="ps.js"></script>`

# Usage

## P$.define(String name, Function constructor)
Module definition for PS
```
// define a module
P$.define("some widget", function(){
    this.on("some event", function(){});
    this.on("some other event", function(){});
});
```

## P$(String name[, Array arguments]) returns PSinstance
P$ is the instantiator for modules defined by P$.define
The event will only trigger on the single instance
```
var widgetP$;

// define a module
P$.define("some widget", function(a, b){
    this.on("some event", function(){
        alert(a);
    });

    this.on("some other event", function(){
        alert(b);
    });
});
widgetP$ = P$("some widget", [1,2]);
widgetP$.trigger("some event"); // alerts 1
widgetP$.trigger("some other event"); // alerts 2
```

## P$.global(String name) returns P$instance
Returns a namespaced event listener that can be used globally.
Can be used as a global function that does not need to return without polluting the global/window namespace
`PS.global(name)` always return the same PSinstance object for the given name
```
// listener can be defined anywhere
P$.global("some global namespace").on("fateful event", function(){});

// trigger can be called anywhere
P$.global("some global namespace").trigger("fateful event");
```

## P$instance.on(String eventName) returns P$instance
Listens to an event, can be defined in P$.define's constructor or on the P$instance
```
// this illustrates modular use
var widgetP$;
P$.define("widget", function(){
    this.on("available to all widget's instances event", function(){
        alert("all widget");
    });
});

widgetP$ = P$("some widget");
widgetP$.on("only available to this instance event", function(){
    alert("only this instance");
});

anotherWidgetP$ = P$("some widget");

widgetP$.trigger("only available to this instance event"); // alerts only this instance
widgetP$.trigger("available to all widget's instances event"); // alerts all widget
anotherWidgetP$.trigger("only available to this instance event"); // nothing happens
anotherWidgetP$.trigger("available to all widget's instances event"); // alerts all widget

// this illustrates global use
// listener can be defined anywhere
P$.global("some global namespace").on("fateful event", function(){
    alert("fateful");
});

// trigger can be called anywhere
P$.global("some global namespace").trigger("fateful event"); // alerts fateful
```

## P$instance.one(String eventName) returns P$instance
Similar to P$instance.on but event fires only once
```
// this illustrates modular use
var widgetP$;
P$.define("widget", function(){
    this.one("event", function(){
        alert("event");
    });
});
widgetP$ = P$("widget");
widgetP$.trigger("event"); // alerts event
widgetP$.trigger("event"); // do nothing

## P$instance.off(String eventName) returns P$instance
Stop listening to an event can be used by both module instance and global
```
// this illustrates modular use
var widgetP$;
P$.define("widget", function(){
    this.on("event", function(){
        alert("event");
    });
});
widgetP$ = P$("widget");
widgetP$.trigger("event"); // alerts event
widgetP$
    .off("event")
    .trigger("event"); // do nothing

## P$instance.trigger(String eventName[, Array arguments]) returns P$instance
Triggers an event, analogous to executing a function i.e. `someFunction(args)`
```
var widgetP$;
P$.define("widget", function(){
    this.on("event", function(a){
        alert(a);
    });
});
widgetP$ = P$("widget");
widgetP$.trigger("event", [1]); // alert 1
```

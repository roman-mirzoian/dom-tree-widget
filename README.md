#  DOM tree navigation widget
This is an embed widget that can be added to any site and page.  
The idea behind the widget is to visually create a tree node widget in a window above the page.  
When the user clicks the node element in the widget, the node on the page will be highlighted and the page will be scrolled to that page.  
The widget has options for hiding/showing the view, canceling the view, and moving around the page.  

To quickly use this widget on the page, write in the developer console and execute the following code:
```
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/gh/roman-mirzoian/dom-tree-widget/widget.js';
document.head.appendChild(script);
```

(function (document, window, undefined) {

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- classList ------------------------------------------ */
    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
    /* ------------------------------------------------------------------------------------- */
    /* 
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in window) {

    // Full polyfill for browsers with no classList support
    if (!("classList" in document.createElement("_"))) {

    (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
          classListProp = "classList"
        , protoProp = "prototype"
        , elemCtrProto = view.Element[protoProp]
        , objCtr = Object
        , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
        }
        , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var
                  i = 0
                , len = this.length
            ;
            for (; i < len; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        // Vendors: please allow content code to instantiate DOMExceptions
        , DOMEx = function (type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
        }
        , checkTokenAndGetIndex = function (classList, token) {
            if (token === "") {
                throw new DOMEx(
                      "SYNTAX_ERR"
                    , "An invalid or illegal string was specified"
                );
            }
            if (/\s/.test(token)) {
                throw new DOMEx(
                      "INVALID_CHARACTER_ERR"
                    , "String contains an invalid character"
                );
            }
            return arrIndexOf.call(classList, token);
        }
        , ClassList = function (elem) {
            var
                  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                , i = 0
                , len = classes.length
            ;
            for (; i < len; i++) {
                this.push(classes[i]);
            }
            this._updateClassName = function () {
                elem.setAttribute("class", this.toString());
            };
        }
        , classListProto = ClassList[protoProp] = []
        , classListGetter = function () {
            return new ClassList(this);
        }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
        return this[i] || null;
    };
    classListProto.contains = function (token) {
        token += "";
        return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
        ;
        do {
            token = tokens[i] + "";
            if (checkTokenAndGetIndex(this, token) === -1) {
                this.push(token);
                updated = true;
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.remove = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
            , index
        ;
        do {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while (index !== -1) {
                this.splice(index, 1);
                updated = true;
                index = checkTokenAndGetIndex(this, token);
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.toggle = function (token, force) {
        token += "";

        var
              result = this.contains(token)
            , method = result ?
                force !== true && "remove"
            :
                force !== false && "add"
        ;

        if (method) {
            this[method](token);
        }

        if (force === true || force === false) {
            return force;
        } else {
            return !result;
        }
    };
    classListProto.toString = function () {
        return this.join(" ");
    };

    if (objCtr.defineProperty) {
        var classListPropDesc = {
              get: classListGetter
            , enumerable: true
            , configurable: true
        };
        try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
            if (ex.number === -0x7FF5EC54) {
                classListPropDesc.enumerable = false;
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
        }
    } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
        "use strict";

        var testElement = document.createElement("_");

        testElement.classList.add("c1", "c2");

        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
            var createMethod = function(method) {
                var original = DOMTokenList.prototype[method];

                DOMTokenList.prototype[method] = function(token) {
                    var i, len = arguments.length;

                    for (i = 0; i < len; i++) {
                        token = arguments[i];
                        original.call(this, token);
                    }
                };
            };
            createMethod('add');
            createMethod('remove');
        }

        testElement.classList.toggle("c3", false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
            var _toggle = DOMTokenList.prototype.toggle;

            DOMTokenList.prototype.toggle = function(token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };

        }

        testElement = null;
    }());

    }

}

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Element.insertAfter -------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ; if (!Element.prototype.insertAfter){
        Element.prototype.insertAfter = function(el){

            var nextSibling = this.nextSibling;

            while(!!nextSibling && nextSibling.nodeType != 1) {
                nextSibling = nextSibling.nextSibling
            }

            if(!nextSibling) this.parentNode.appendChild(el);

            if(!!nextSibling) this.parentNode.insertBefore(el, nextSibling);

        }
    };    

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Element.remove ------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Element.prototype.remove){
        Element.prototype.remove = function(){

            !!this.parentNode ? this.parentNode.removeChild(this) : null;

        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Element.prependChild ------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Element.prototype.prependChild){
        Element.prototype.prependChild = function(el){

            for(var i = 0; i < this.children.length; i++){
                if(this.children[i].nodeType === 1){
                    this.insertBefore(el, this.children[i]);
                    return;
                }
            }

        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Array.indexOf -------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                 ? Math.ceil(from)
                 : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Array.exist ---------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Array.prototype.exists) {
        Array.prototype.exist = function (obj) {
            for(var i = 0; i < this.length; i++) if(this[i] === obj) return true;
            return false;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Array.forEach -------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback) {
            for(var i = 0; i < this.length; i++) callback.call(window, this[i], i, this);
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Array.map ------------------------------------------ */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Array.prototype.map) {
        Array.prototype.map = function (callback) {
            var arr = [];
            for(var i = 0; i < this.length; i++) arr.push(callback.call(window, this[i], i, this));
                return arr;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Array.remove --------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Array.prototype.remove) {
        Array.prototype.remove = function (callback) {
            var arr = []
            for(var i = 0; i < this.length; i++) {
                if(!callback.call(window, this[i], i, this)) arr.push(this[i]);
            }
            return arr;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- String.trim ---------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- String.format -------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!String.prototype.format) {
        String.prototype.format = function () {
            var s = this;
            for(var i = 0; i < arguments.length; i++){
                s = s.replace('{' + i + '}', arguments[i]);
            }
            return s;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- String.startsWith ---------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(str){
            return this.substring(0, str.length) === str;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Math.toRad ----------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if(!Number.prototype.toRad){
        Number.prototype.toRad = function(degrees){
            return degrees * Math.PI / 180;
        }
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- HTMLCollection.toArray ----------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if(!HTMLCollection.prototype.toArray){
        HTMLCollection.prototype.toArray = function(){
            return Array.prototype.slice.apply(this);
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- NamedNodeMap.toArray ------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if(!NamedNodeMap.prototype.toArray){
        NamedNodeMap.prototype.toArray = function(){
            return Array.prototype.slice.apply(this);
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Event.preventDefault ------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    ;if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault=function() {
            this.returnValue=false;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Event.stopPropagation ------------------------------ */
    /* ------------------------------------------------------------------------------------- */
    if (!Event.prototype.stopPropagation) {
        Event.prototype.stopPropagation=function() {
            this.cancelBubble=true;
        };
    };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Element.addEventListsner --------------------------- */
    /* ------------------------------------------------------------------------------------- */
  ;if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        if (listener.handleEvent) {
          listener.handleEvent(e);
        } else {
          listener.call(self,e);
        }
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  };

    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- Function.bind -------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    if (!Function.prototype.bind) {
      Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
          // closest thing possible to the ECMAScript 5
          // internal IsCallable function
          throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
              return fToBind.apply(this instanceof fNOP && oThis
                     ? this
                     : oThis,
                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
      };
    };

    var

    self = this,

    patty = function (selector, context) {
        return new polyfiller.fn.init(selector, context);
    };

    patty.fn = patty.prototype = {

        event: function (eventName, eventHandler) {

            var

            _event = function (context, eventName, eventHandler) {

                if (window.addEventListener) {
                    context.addEventListener(eventName, eventHandler, false);
                } else {
                    context.attachEvent('on' + eventName, eventHandler, false);
                }

            }

            if (this.length > 1) {

                for (var i = 0; i < this.length; i++) {
                    _event(this[i], eventName, eventHandler);
                    return this;
                }

            }

            _event(this[0], eventName, eventHandler);
            return this;

        },

        index: function () {
            var
            index = 0,
            node = this[0];
            while ((node = node.previousSibling)) {
                if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
                    index++;
                }
            }
            return index;
        }

    };

    var init = patty.fn.init = function (selector, context) {

        if (!selector)
            return this;

        this.context = context || document;
        this.selector = selector;

        if (typeof selector === 'string') {

            var
            elements = this.context.querySelectorAll(selector);

            this.length = 0;

            for (var i = 0; i < elements.length; i++) {
                this[i] = elements[i];
                this.length++;
            }

        } else if (selector.nodeType) {

            this.context = this[0] = selector;
            this.length = 1;
            return this;

        } else if (typeof selector !== undefined) {
            this[0] = selector;
            this.length = 1;
        }

        return this;

    };

    patty.ajax = function (url, method, data, successCallback, errorCallback) {

        var json = JSON.stringify(data);
        var xmlhttp;
        // compatible with IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (xmlhttp.responseText)
                    successCallback(JSON.parse(xmlhttp.responseText));
                else
                    successCallback({});
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
                if (errorCallback)
                    errorCallback.call(xmlhttp, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText);
            }
        }
        xmlhttp.open(method, url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.setRequestHeader('Accept', 'application/json');

        if (data)
            xmlhttp.send(json);
        else
            xmlhttp.send();
    };

    patty.merge = function (obj1, obj2) {

        var obj3 = {};

        for (var attrname in obj1) {

            if (true) {
                obj3[attrname] = obj1[attrname];
            }

        }

        for (attrname in obj2) {

            if (obj3[attrname] && Object.prototype.toString.call(obj2[attrname]) === '[object Object]' && Object.prototype.toString.call(obj3[attrname]) === '[object Object]') {

                obj3[attrname] = patty.merge(obj3[attrname], obj2[attrname]);

            } else {

                obj3[attrname] = obj2[attrname];

            }

        }

        return obj3;
    };

    init.prototype = patty.fn;

    window.patty = window.p$ = patty;


})(document, window);
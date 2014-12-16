; (function (doc, win) {

    'use strict';

    var

    validNodeNames = ['FORM', 'INPUT', 'SELECT', 'TEXTAREA'],

    defaultSettings = {
        
        disableStandardValidation:      true,
        attributePrefix:                'data-clival-',
        errorClass:                     'error',
        useErrorClass:                  true,
        useErrorSummary:                true,
        useErrorMessage:                true,
        errorMessageClass:              'error-msg',
        errorSummary:                   null,
        errorSummaryLocatior:           'top',
        errorSummaryClass:              'error-summary',
        oneChangeBeforeValidate:        false,
        showErrorBeforeSubmit:          false,
        validateOnChange:               true,
        validateOnKeyUp:                true,
        culture:                        'en'

    },

    fireEvent = function (callbacks, scope) {

        for (var i = 0; i < callbacks.length; i++) {
            if (arguments.length > 2) {
                callbacks[i].apply(scope, Array.prototype.slice.call(arguments, 1, arguments.length - 1));
            } else {
                callbacks[i].apply(scope);
            }
        }

    },

    //#region clival

    clival = function () {

        var

        // Private properties
        properties = {

        },

        eventCallbacks = {

            onBeforeValidateCallbacks: [],
            onValidatedCallbacks: [],
            onBeforeFormValidateCallbacks: [],
            onFormValidatedCallbacks: [],
            onBeforeComponentValidateCallbacks: [],
            onComponentValidatedCallbacks: []

        },

        // Settings
        settings = undefined;

        // Public properties
        this.components = [];
        this.valid = false;
        this.validated = false;

        // Public methods
        // Get
        this.get = function (property) { return properties[property];};

        // Set
        this.set = function (property, value) { properties[property] = value };

        // Set Event Callback
        this.setEventCallback = function(name, callback){
            eventCallbacks[name].push(callback);
        }

        // Get Event Callback
        this.getEventCallbacks = function(name){
            return eventCallbacks[name];
        }

        // Constructor

        var
        arg1 = arguments[0];

        settings = polyfills.merge(defaultSettings, arguments.length > 1 ? arguments[1] : {});

        if (!!arg1 && polyfills.is(arg1, polyfills.type.object)) {

            settings = polyfills.merge(defaultSettings, arg1);

        } else if (!!arg1 && validNodeNames.indexOf(arg1.nodeName) > -1) {

            this.addComponent(new components[arg1.nodeName.toLowerCase()](arg1, {settings: settings, eventCallbacks: eventCallbacks}));

        }

    };

    clival.prototype.addComponent = function (component) {

        this.components.push(component)

    };

    clival.prototype.validate = function () {

        fireEvent(this.getEventCallbacks('onBeforeValidateCallbacks'), this);

        var
        valid = true;
        
        for (var i = 0; i < this.components.length; i++) {

            valid = valid && this.components[i].validate();

        }

        this.valid = valid;

        fireEvent(this.getEventCallbacks('onValidatedCallbacks'), this, valid);

        return valid;

    };

    clival.prototype.onBeforeValidate = function (callback) {
        this.setEventCallback('onBeforeValidateCallbacks', callback);
    };

    clival.prototype.onValidated = function (callback) {
        this.setEventCallback('onValidatedCallbacks', callback);
    };

    clival.prototype.onBeforeFormValidate = function (callback) {
        this.setEventCallback('onBeforeFormValidateCallbacks', callback);
    };

    clival.prototype.onFormValidated = function (callback) {
        this.setEventCallback('onFormValidatedCallbacks', callback);
    };

    clival.prototype.onBeforeComponentValidate = function (callback) {
        this.setEventCallback('onBeforeComponentValidateCallbacks', callback);
    };

    clival.prototype.onComponentValidated = function (callback) {
        this.setEventCallback('onComponentValidatedCallbacks', callback);
    };

    //#endregion

    //#region Components

    Function.prototype.inherits = function(base){
  
      this.prototype = Object.create(base.prototype);
      this.prototype.constructor = this;
      
    }

    var

    components = {

        base: function (node, global, form) {

            // Private Properties
            var 

            properties = {
                node: node,
                form: form,
                eventCallbacks: global.eventCallbacks,
                errorMessageElement: document.createElement('span')
            },

            settings = global.settings;

            // Public methods

            this.get = function(prop){
                return properties[prop];
            }

            this.set = function(prop, val){
                properties[prop] = val;
            }

            this.settings = function(setting, val){

                if(val !== undefined){
                    settings[setting] = val;
                }


                return settings[setting];
            }

            // Constructor

            properties.errorMessageElement.classList.add(this.settings('errorMessageClass'));

            this.listen();

        },

        form: function (node, global) {

            components.base.call(this, node, global);

            this.components = [];
            this.submitTries = 0;

            for (var i = 0; i < node.childNodes.length; i++) {

                if (validNodeNames.indexOf(node.childNodes[i].nodeName) > -1) {

                    this.components.push(new components[node.childNodes[i].nodeName.toLowerCase()](node.childNodes[i], global, this));

                }

            }

            if(this.settings('disableStandardValidation')){
                this.get('node').setAttribute('novalidate', 'novalidate');
            }

        },

        input: function (node, global, form) {

            components.base.call(this, node, global, form);

        },

        select: function (node, global, form) {

            components.base.call(this, node, global, form);

        },

        textarea: function (node, global, form) {

            components.base.call(this, node, global, form);

        }

    };

    // base prototype

    components.base.prototype.validated = false;
    components.base.prototype.valid = false;
    components.base.prototype.errorMessages = [];

    components.base.prototype.validate = function () {

        var
        node = this.get('node'),
        attributes = node.attributes,
        valid = true,
        validator = undefined,
        callbacks = this.get('eventCallbacks'),
        result = null;

        fireEvent(callbacks.onBeforeComponentValidateCallbacks, this, node);

        this.errorMessages = [];

        for (var i = 0; i < attributes.length; i++) {

            validator = validators.get.call(this, attributes[i].name);
            result = !!validator ? validator.call(this, node, attributes[i]) : null;

            if (!!result) { 
                valid =  result.valid && valid;
                
                if(!result.valid){
                    this.errorMessages.push(result.errorMessage);
                }
            }

        }

        this.validated = true;
        this.valid = valid;

        fireEvent(callbacks.onComponentValidatedCallbacks, this, node, valid, this.errorMessages);

        this.onValidated();
        return valid;

    };

    components.base.prototype.listen = function(){

        var node = this.get('node');

        if(this.settings('validateOnChange')){

            node.addEventListener('change', function(){ 
                this.validate();
            }.bind(this));

        }

        if(this.settings('validateOnKeyUp') && (!this.settings('oneChangeBeforeValidate') || (this.settings('oneChangeBeforeValidate') && this.validated))) {

            node.addEventListener('keyup', function(){ 
                this.validate();
            }.bind(this));

        }

    };

    components.base.prototype.onValidated = function(){

        this.showHideErrorClass();
        this.showHideErrorMessage();  

    };

    components.base.prototype.showHideErrorClass = function(){

        if(this.settings('useErrorClass') && (this.settings('showErrorBeforeSubmit') || (!this.settings('showErrorBeforeSubmit') && this.get('form').submitTries > 0))){

            if(this.valid){
                this.get('node').classList.remove(this.settings('errorClass'));    
            } else {
                this.get('node').classList.add(this.settings('errorClass'));    
            }
            
        }

    };

    components.base.prototype.showHideErrorMessage = function(){

        if(this.settings('useErrorMessage') && (this.settings('showErrorBeforeSubmit') || (!this.settings('showErrorBeforeSubmit') && this.get('form').submitTries > 0))){

            if(this.valid && !!this.get('errorMessageElement').parentNode){
                this.get('node').parentNode.removeChild(this.get('errorMessageElement'));
            } else if(!this.valid){
                this.get('errorMessageElement').innerText = this.errorMessages[0];
                this.get('node').insertAfter(this.get('errorMessageElement'));
            }
            
        }

    };

    // form prototype

    components.form.inherits(components.base);

    components.form.components = [];

    components.form.submitTries = 0;

    components.form.prototype.validate = function () {

        var
        node = this.get('node'),
        callbacks = this.get('eventCallbacks'),
        valid = true,
        componentValid = false;

        fireEvent(callbacks.onBeforeFormValidateCallbacks, this, node);

        this.errorMessages = [];

        for (var i = 0; i < this.components.length; i++) {

            componentValid = this.components[i].validate();
            valid = componentValid && valid;

            if (!componentValid) {
                this.errorMessages.push(this.components[i].errorMessages[0]);
            };
        }

        this.valid = valid;
        this.validated = true;

        fireEvent(callbacks.onFormValidatedCallbacks, this, node, valid, this.errorMessages);

        return valid;

    };

    components.form.prototype.listen = function(){

        this.get('node').addEventListener('submit', function(e){

            this.submitTries++;
            this.validate();

            if(!this.valid){
                e.preventDefault();
            }

        }.bind(this));

    };

    // Other prototypes

    components.input.inherits(components.base);
    components.textarea.inherits(components.base);
    components.select.inherits(components.base);

    //#endregion

    //#region Validators

    var

    validators = {

        get: function (validatorName) {

            var 
            prefix = this.settings('attributePrefix'),
            culture = this.settings('culture');

            if (validatorName.substring(0, prefix.length).toLowerCase() === prefix.toLowerCase()) {
                validatorName = validatorName.replace(prefix, '');
            }

            return validators[validatorName];

        },

        type: function (node, attribute) {

            return !!validators[attribute.value] ? validators[attribute.value](node) : null;

        },

        required: function (node, attribute) {

            var 
            valid = node.value !== undefined && node.value !== '';

            return {
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].required
            };

        },

        number: function (node, attribute) {
            
            var
            valid =  /^-?\d*\.?\d*$/.test(node.value);

            return{
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].number
            }

        },

        min: function (node, attribute) {

            var numberVal = validators.number.call(this, node);
            if (!numberVal.valid) return numberVal;

            var 
            val         = parseFloat(node.value),
            min         = !!attribute.value ? parseFloat(attribute.value) : Number.MIN_VALUE,
            valid       = val >= min;

            return {
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].min.format(min)
            };
        },

        max: function (node, attribute) {

            var numberVal = validators.number.call(this, node);
            if (!numberVal.valid) return numberVal;

            var 
            val         = parseFloat(node.value),
            max         = !!attribute.value ? parseFloat(attribute.value) : Number.MAX_VALUE,
            valid       = val <= max;

            return {
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].max.format(max)
            };

        },

        url: function(node, attribute){

            var
            valid = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?').test(node.value);

            return  {
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].url
            }
        },

        range: function (node, attribute) {

            var numberVal = validators.number.call(this, node);
            if (!numberVal.valid) return numberVal;

            var 
            val         = parseFloat(node.value),
            minAttr     = node.getAttribute('min'),
            maxAttr     = node.getAttribute('max'),
            maxMinAttr  = attribute.value,
            maxMin      = !!maxMinAttr ? maxMinAttr.split(',') : [],
            min         = !!minAttr ? parseFloat(minAttr) : maxMin.length === 2 ? parseFloat(maxMin[0].trim()) : 0,
            max         = !!maxAttr ? parseFloat(maxAttr) : maxMin.length === 2 ? parseFloat(maxMin[1].trim()) : Number.MAX_VALUE,
            valid       = val >= min && val <= max;

            return{
                valid: valid,
                errorMessage: valid ? '' : errorMessages[this.settings('culture')].range.format(min, max)
            }

        },

        email: function (node, attribute) {
            return true;
        },

        color: function (node, attribute) {
            return true;
        },

        date: function (node, attribute) {
            return true;
        },

        datetime: function (node, attribute) {
            return true;
        },

        month: function (node, attribute) {
            return true;
        },

        search: function (node, attribute) {
            return true;
        },

        tel: function (node, attribute) {
            return true;
        },

        time: function (node, attribute) {
            return true;
        },

        week: function (node, attribute) {
            return true;
        }

    }

    var 

    errorMessages = {

        en: {

            email: 'Ivalid email',
            number: 'Invalid number',
            url: 'Invalid URL',
            range: "Value can't be smaller than {0} or bigger than {1}",
            min: "Value can't be smaller than {0}",
            max: "Value can't be bigger than {0}",
            color: 'Invalid color',
            date: 'Invalid date',
            datetime: 'Ivalid datetime',
            month: 'Invalid month',
            required: 'This field is required'

        }

    }

    //#endregion

    // Constructor
    win.Clival = clival;

})(document, window);
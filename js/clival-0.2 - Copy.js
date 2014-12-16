;(function(doc, win, p$, undef){

	'use strict';

	var

	valNodeNames = ['INPUT', 'SELECT', 'TEXTAREA', 'FORM'],

	defaults = {
		culture: 						'en',
		attrPrefix: 					'data-clival-',
		useErrSummary: 					false,
		errSummaryClass: 				'error-summary',
		errSummaryPos: 					'before',
		hideErrSummaryBeforeSubmit: 	true,		
		useErrClass: 					true,
		errClass: 						'error',
		useErrLabel: 					true,
		errLabelClass: 					'error-msg',
		errLabelPos: 					'after',
		changeBeforeVal: 				true,
		valOnChange: 					true,
		valOnKeyup: 					true,
		reValOnChange: 					false,
		reValOnKeyPress: 				true,
		valOnSubmit: 					true,
		submitBeforeVal: 				true,
		disableStandardVal:  			true
	},

	helpers = {

		valElementsRecursive: function(el, excludeSelf){
			var 
			arr = [];

			if(!el) return arr;

			else if(!!el && !valNodeNames.exist(el.nodeName)){

				for(var i = 0; i < el.children.length; i++) if(el.children[i].nodeType === 1) arr = arr.concat(helpers.valElementsRecursive(el.children[i], false));

			}

			else if(!!el && valNodeNames.exist(el.nodeName) && !excludeSelf){

				arr.push(el);

			}

			else if(!!el && valNodeNames.exist(el.nodeName) && excludeSelf){

				for(var i = 0; i < el.children.length; i++) if(el.children[i].nodeType === 1) arr = arr.concat(helpers.valElementsRecursive(el.children[i], false));

			}

			else arr.push(el);

			return arr;
		}

	},

	clival = function(el, options){

		var

		container = el,

		elements = !!el ? helpers.valElementsRecursive(el) : [];

		this.valid = false;

		this.settings = p$.merge(defaults, options || {});

		this.components = elements.map(function(el){

			return new components[el.nodeName.toLowerCase()](el, this);

		}.bind(this));

	},

	components = {

		base: function(el, clival){

			var

			props = {
				element: el,
				clival: clival
			};

			this.prop = function(prop, val){
				if(!val) return props[prop];
				props[prop] = val;
			};

		},

		form: function(form, clival){

			components.base.call(this, form, clival);

			this.components = [];
			this.valid = false;
			this.errorMessages = [];
			this.submitCount = 0;
			this.validateCount = 0;

			// Create Error summary
			if(this.prop('clival').settings.useErrSummary){
				this.errorSummary = doc.createElement('ul');
				this.errorSummary.classList.add(this.prop('clival').settings.errSummaryClass);
			}

			// Get form children
			helpers.valElementsRecursive(form, true).forEach(function(el){
				if(valNodeNames.exist(el.nodeName)) this.components.push(new components[el.nodeName.toLowerCase()](el, clival));
			}.bind(this));

			// Disable standard validation
			if(this.prop('clival').settings.disableStandardVal) form.setAttribute('novalidate', 'novalidate');

			// Bind submit event
			form.addEventListener('submit', this.onSubmit.bind(this));

			// Validate
			this.validate = function(){

				var settings = this.prop('clival').settings;

				this.valid = true;
				this.errorMessages = [];
				this.validateCount++;

				this.components.forEach(function(component){

					component.validate();

					if(!component.valid){
						this.valid = false;
						component.summaryErrorMessages.length > 0 ? this.errorMessages.push(component.summaryErrorMessages[0]) : null;
					}

				}.bind(this));

				errorSummary();

			}.bind(this);

			var

			errorSummary = function(){

				var 
				settings = this.prop('clival').settings,
				el = this.prop('element');

				if(!settings.useErrSummary) return;

				if(this.valid) this.errorSummary.remove();

				this.errorSummary.innerHTML = '';

				this.errorMessages.forEach(function(msg){
					var li = doc.createElement('li');
					li.innerText = msg;
					this.errorSummary.appendChild(li);
				}.bind(this));

				settings.errSummaryPos === 'before' ? el.prependChild(this.errorSummary) : el.appendChild(this.errorSummary);

			}.bind(this);

		},

		fieldBase: function(el, clival){

			this.validators = [];
			this.errorMessages = [];
			this.valid = false;
			this.validateCount = 0;

			// Create error label
			if(this.prop('clival').settings.useErrLabel){
				this.errorLabel = doc.createElement('span');
				this.errorLabel.classList.add(this.prop('clival').settings.errLabelClass);
			}

			// Get validators
			for(var validator in validators){
				if(validators[validator].canValidate(el, validators, clival.settings)) this.validators.push(validators[validator]);
			}

			// Validate
			this.validate = function(){

				var settings = this.prop('clival').settings;

				this.labelErrorMessages = [];
				this.summaryErrorMessages = [];
				this.valid = true;
				this.validateCount++;

				this.validators.forEach(function(validator){

					var 
					props = !!validator.createProps ? validator.createProps(el, validators, settings) : undef,
					valid = validator.validate(el, validators, settings, props);

					if(!valid){
						this.labelErrorMessages.push(validator.errorMessage(el, settings.culture, validators, settings, props));
						this.summaryErrorMessages.push(validator.errorMessage(el, settings.culture, validators, settings, props, true));
						this.valid = false;
					}

				}.bind(this));

				onValidated();

			}.bind(this);

			var

			// onValidated, called when validation is done
			onValidated = function(){

				var 
				settings = this.prop('clival').settings,
				el = this.prop('element');

				errorClass(settings, el);
				errorLabel(settings, el);

			}.bind(this),

			errorClass = function(settings, el){

				if(settings.useErrClass)
					this.valid ? el.classList.remove(settings.errClass) : el.classList.add(settings.errClass);

			}.bind(this),

			errorLabel = function(settings, el){

				if(settings.useErrLabel && this.valid) this.errorLabel.remove();

				else if(settings.useErrLabel && !this.valid && this.labelErrorMessages.length > 0){

					this.errorLabel.innerText = this.labelErrorMessages[0];
					settings.errLabelPos === 'before' ? el.parentNode.insertBefore(this.errorLabel, el) : el.insertAfter(this.errorLabel);

				}

			}.bind(this);

		},

		input: function(inp, clival){

			components.base.call(this, inp, clival);
			components.fieldBase.call(this, inp, clival);
			
			inp.addEventListener('change', this.onChange.bind(this));
			inp.addEventListener('keyup', this.onKeyup.bind(this));
		},

		select: function(slct, clival){

			components.base.call(this, slct, clival);

		},

		textarea: function(txtArea, clival){

			components.base.call(this, txtArea, clival);

		}

	};

	clival.prototype.validate = function(){

		this.valid = true;

		this.components.forEach(function(component){
			component.validate();
			if(!component.valid) this.valid = false;
		}.bind(this));

	};

	components.input.prototype.onChange = function(e){

		var settings = this.prop('clival').settings;

		if(settings.valOnChange) 
			this.validate();

	};

	components.input.prototype.onKeyup = function(e){

		var settings = this.prop('clival').settings;

		if((!settings.changeBeforeVal || (settings.changeBeforeVal && this.validateCount > 0)) && settings.valOnKeyup)
			this.validate();

	};

	components.form.prototype.onSubmit = function(e){

		this.submitCount++;

		this.validate();

		if(!this.valid) e.preventDefault();

	};

	var

	extend = function(extObj){

		validators = p$.merge(validators, extObj);

	},

	validators = {

		type: {

            name: 'type',

            canValidate: function(el, validators, settings){
                var attr = el.getAttribute('type');
                return !!validators[attr];
            },

            validate: function(el, validators, settings){
                var attr = el.getAttribute('type');
                return validators[attr].validate.call(this, el, validators);
            },

            errorMessage: function(el, culture, validators, settings, props, isForSummary){
                var attr = el.getAttribute('type');
                return validators[attr].errorMessage.call(this, el, culture, validators); 
            }

        },

        required: {

        	name: 'required',

			canValidate: function(el, validators, settings){
        		return el.getAttribute('required') !== null;
        	},

        	createProps: function(el, validators, settings){

        		return {
        			label: el.getAttribute('data-clival-label')
        		};

        	},

        	validate: function(el, validators, settings){
        		return el.value !== '' && el.value !== undefined && el.value !== null;
        	},

        	errorMessage: function(el, culture, validators, settings, props, isForSummary){
        		var 
				msgs = {
					def: {
						summary: "{0} is required",
						label: "This field is required"
					},
					sv: {
						summary: '{0} är tvingande',
						label: 'Detta fält är tvingande'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				msg = msgs[culture] ? msgs[culture][type].format(props.min, props.max) : msgs.def[type].format(props.label);

				return msg;
        	}

        },

		number: {

			name: 'number',

			canValidate: function(el, validators, settings){
				var attr = el.getAttribute('type') || el.getAttribute(settings.attrPrefix + 'type') 
				return !!attr && attr === 'number';
			},

			validate: function(el, validators, settings){
				return el.value != '' && /^-?\d*\.?\d*$/.test(el.value);
			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msg = {
					def: 'This field requires a number',
					sv: 'Detta fältet kräver en siffra'
				};
				return msg[culture] || msg.def;
			}

		},

		min: {

			name: 'min',

			canValidate: function(el, validators, settings){
				return !!el.getAttribute('min') || el.getAttribute(settings.attrPrefix + 'min');
			},

			createProps: function(el, validators, settings){
				var attr = el.getAttribute('min') || el.getAttribute(settings.attrPrefix + 'min');
	            return {
	            	val: el.value,
            		min: !!attr ? parseFloat(attr) : Number.MIN_VALUE
	            }
			},

			validate: function(el, validators, settings, props){

            	if (!validators.number.validate(el, validators, settings)) return false;
	            
	            return props.val >= props.min;
			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msg = {
					def: 'This field must greater or equal to {0}',
					sv: 'Detta fältet måste vara större eller lika med {0}'
				}
				return msg[culture] ? msg[culture].format(props.min) : msg.def.format(props.min);
			}

		},

		max: {

			name: 'max',

			canValidate: function(el, validators, settings){
				return !!el.getAttribute('max') || el.getAttribute(settings.attrPrefix + 'max');
			},

			createProps: function(el, validators, settings){
				var attr = el.getAttribute('max') || el.getAttribute(settings.attrPrefix + 'max');
	            return {
	            	val: el.value,
            		max: !!attr ? parseFloat(attr) : Number.MAX_VALUE
	            }
			},

			validate: function(el, validators, settings, props){

            	if (!validators.number.validate(el, validators, settings)) return false;
	            
	            return props.val <= props.max;
			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msg = {
					def: 'This field must less or equal to {0}',
					sv: 'Detta fältet måste vara mindre eller lika med {0}'
				}
				return msg[culture] ? msg[culture].format(props.max) : msg.def.format(props.max);
			}

		},

		range: {

			name: 'range',

			canValidate: function(el, validators, settings){
				return el.getAttribute('type') === 'range' || el.getAttribute(settings.attrPrefix + 'range');
			},

			createProps: function(el, validators, settings){

				var 
	            val         = parseFloat(el.value),
	            minAttr     = el.getAttribute('min') || el.getAttribute(settings.attrPrefix + 'min'),
	            maxAttr     = el.getAttribute('max') || el.getAttribute(settings.attrPrefix + 'max'),
	            maxMinAttr  = el.getAttribute(settings.attrPrefix + 'range'),
	            maxMin      = !!maxMinAttr ? maxMinAttr.split(',') : [],
	            min         = !!minAttr ? parseFloat(minAttr) : maxMin.length === 2 ? parseFloat(maxMin[0].trim()) : Number.MIN_VALUE,
	            max         = !!maxAttr ? parseFloat(maxAttr) : maxMin.length === 2 ? parseFloat(maxMin[1].trim()) : Number.MAX_VALUE;

	            return {
	            	val: 	val,
	            	min: 	min,
	            	max: 	max,
	            	label: 	el.getAttribute('data-clival-label')
	            };
			},

			validate: function(el, validators, settigns, props){

				if (!validators.number.validate(el, validators, settigns)) return false;
	            return props.val >= props.min && props.val <= props.max;

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Invalid value for {0}",
						label: "Value can't be smaller than {0} or bigger than {1}"
					},
					sv: {
						summary: 'Felatkigt värde för {0}',
						label: 'Värdet får ej vara mindre än {0} elelr större än {1}'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label) : base.format(props.min, props.max);

				return msg;
			}

		},

		url: {

			name: 'url',

			canValidate: function(el, validators, settings){
				return el.getAttribute('type') === 'url' || el.getAttribute(settings.attrPrefix + 'type') === 'url';
			},

			createProps: function(el, validators, settings){

				return {
	            	label: 	el.getAttribute('data-clival-label')
	            };
			},

			validate: function(el, validators, settigns, props){

				return !!el.value && el.value != '' && new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?').test(el.value);

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Invalid URL for {0}",
						label: "Invalid URL"
					},
					sv: {
						summary: 'Felatkigt URL för {0}',
						label: 'Felatkig URL'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label) : base;

				return msg;
			}

		},

		email: {

			name: 'email',

			canValidate: function(el, validators, settings){
				return el.getAttribute('type') === 'email' || el.getAttribute(settings.attrPrefix + 'type') === 'email';
			},

			createProps: function(el, validators, settings){

				return {
	            	label: 	el.getAttribute('data-clival-label')
	            };
			},

			validate: function(el, validators, settigns, props){

				return !!el.value && el.value != '' && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(el.value);

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Invalid email for {0}",
						label: "Invalid email"
					},
					sv: {
						summary: 'Felatkigt E-Post för {0}',
						label: 'Felatkig E-Post'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label) : base;

				return msg;
			}

		},

		minlength: {

			name: 'minLength',

			canValidate: function(el, validators, settings){
				return el.getAttribute(settings.attrPrefix + 'minlength');
			},

			createProps: function(el, validators, settings){

				var attrVal = el.getAttribute(settings.attrPrefix + 'minlength');

				return {
	            	label: 	el.getAttribute('data-clival-label'),
	            	minLength: !!attrVal ? parseInt(attrVal) : Number.MIN_VALUE
	            };
			},

			validate: function(el, validators, settigns, props){

				return el.value !== undef && el.value !== null && el.value.length >= props.minLength

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Value for {0} must be at least {1} charachters",
						label: "This value must be at least {0} charachters"
					},
					sv: {
						summary: 'Värdet för {0} måste vara minst {1} tecken långt',
						label: 'Detta värde måste vara minst {0} tecken långt'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label, props.minLength) : base.format(props.minLength);

				return msg;
			}

		},

		maxlength: {

			name: 'maxLength',

			canValidate: function(el, validators, settings){
				return el.getAttribute(settings.attrPrefix + 'maxlength');
			},

			createProps: function(el, validators, settings){

				var attrVal = el.getAttribute(settings.attrPrefix + 'maxlength');

				return {
	            	label: 	el.getAttribute('data-clival-label'),
	            	maxLength: !!attrVal ? parseInt(attrVal) : Number.MAX_VALUE
	            };
			},

			validate: function(el, validators, settigns, props){

				return el.value !== undef && el.value !== null && el.value.length <= props.maxLength

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Value for {0} can't contain more then {1} charachters",
						label: "This value can't contain more than {0} charachters"
					},
					sv: {
						summary: 'Värdet för {0} får ej vara mer än {1} tecken långt',
						label: 'Detta värde får ej vara mer än {0} tecken långt'
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label, props.maxLength) : base.format(props.maxLength);

				return msg;
			}

		},

		length: {

			name: 'range',

			canValidate: function(el, validators, settings){
				return el.getAttribute(settings.attrPrefix + 'length');
			},

			createProps: function(el, validators, settings){

				var 
	            val         = parseFloat(el.value),
	            maxMinAttr  = el.getAttribute(settings.attrPrefix + 'length'),
	            maxMin      = !!maxMinAttr ? maxMinAttr.split(',') : [],
	            minLength   = maxMin.length === 2 ? parseInt(maxMin[0].trim()) : Number.MIN_VALUE,
	            maxLength   = maxMin.length === 2 ? parseInt(maxMin[1].trim()) : Number.MAX_VALUE;

	            return {
	            	val: 		val,
	            	minLength: 	minLength,
	            	maxLength: 	maxLength,
	            	label: 	el.getAttribute('data-clival-label')
	            };
			},

			validate: function(el, validators, settigns, props){

				return el.value !== undef && el.value != null && el.value.length >= props.minLength && el.value.length <= props.maxLength;

			},

			errorMessage: function(el, culture, validators, settings, props, isForSummary){
				var 
				msgs = {
					def: {
						summary: "Number of charachters for {0} must be between {0} and {1}",
						label: "Number of charachters must be between {0} and {1}"
					}
				},
				type = !!isForSummary ? 'summary' : 'label',
				base = msgs[culture] ? msgs[culture][type] : msgs.def[type],
				msg = !!isForSummary ? base.format(props.label, props.minLength, props.maxLength) : base.format(props.minLength, props.maxLength);

				return msg;
			}

		},

	}

	win.Clival = {};
	win.Clival.instance = clival;
	win.Clival.extend = extend;

})(document, window, patty);
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function($, window, document) {
    var BaseConstraint, BaseControl, CheckboxControl, EchoFormsInterface, FormControl, GroupControl, GroupingControl, InputControl, OutputControl, PatternConstraint, RangeControl, RequiredConstraint, SecretControl, SelectControl, SelectrefControl, TextareaControl, TypeConstraint, TypedControl, UrlOutputControl, XPathConstraint, XPathResolver, debug, defaultControls, defaults, echoformsControlUniqueId, err, error, execXPath, log, parseXML, pluginName, warn, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    log = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, args) : void 0 : void 0;
    };
    debug = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return typeof console !== "undefined" && console !== null ? typeof console.debug === "function" ? console.debug.apply(console, args) : void 0 : void 0;
    };
    warn = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return typeof console !== "undefined" && console !== null ? typeof console.warn === "function" ? console.warn.apply(console, args) : void 0 : void 0;
    };
    error = err = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return typeof console !== "undefined" && console !== null ? typeof console.error === "function" ? console.error.apply(console, args) : void 0 : void 0;
    };
    wgxpath.install(window);
    execXPath = function(root, xpath, resolver) {
      var result;
      if ((xpath != null ? xpath.charAt(0) : void 0) === '[') {
        xpath = "self::*" + xpath;
      }
      if (xpath === "true") {
        return true;
      }
      if (xpath === "false") {
        return false;
      }
      result = document.evaluate(xpath, root[0], resolver, XPathResult.ANY_TYPE, null);
      switch (result.resultType) {
        case XPathResult.NUMBER_TYPE:
          return result.numberValue;
        case XPathResult.STRING_TYPE:
          return result.stringValue;
        case XPathResult.BOOLEAN_TYPE:
          return result.booleanValue;
        default:
          return result.iterateNext();
      }
    };
    parseXML = function(data) {
      var xml;
      if (!data || typeof data !== 'string') {
        return null;
      }
      xml = void 0;
      try {
        if (window.DOMParser) {
          xml = new DOMParser().parseFromString(data, 'text/xml');
        } else {
          xml = new ActiveXObject("Microsoft.XMLDOM");
          xml.async = "false";
          xml.loadXML(data);
        }
      } catch (_error) {
        error = _error;
      }
      if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
        error("Invalid XML: " + data);
      }
      return xml;
    };
    BaseConstraint = (function() {
      function BaseConstraint(message) {
        this.message = message;
      }

      BaseConstraint.prototype.check = function(value, model, resolver) {
        return warn("" + this.constructor.name + " must override check");
      };

      return BaseConstraint;

    })();
    PatternConstraint = (function(_super) {
      __extends(PatternConstraint, _super);

      function PatternConstraint(patternStr, message) {
        this.pattern = new RegExp('^' + patternStr + '$');
        PatternConstraint.__super__.constructor.call(this, message != null ? message : 'Invalid');
      }

      PatternConstraint.prototype.check = function(value, model, resolver) {
        return !value || this.pattern.exec(value) !== null;
      };

      return PatternConstraint;

    })(BaseConstraint);
    XPathConstraint = (function(_super) {
      __extends(XPathConstraint, _super);

      function XPathConstraint(xpath, message) {
        this.xpath = xpath;
        XPathConstraint.__super__.constructor.call(this, message != null ? message : 'Invalid');
      }

      XPathConstraint.prototype.check = function(value, model, resolver) {
        return execXPath(model, this.xpath, resolver);
      };

      return XPathConstraint;

    })(BaseConstraint);
    TypeConstraint = (function(_super) {
      __extends(TypeConstraint, _super);

      TypeConstraint.MIN_SHORT = -Math.pow(2, 15);

      TypeConstraint.MAX_SHORT = Math.pow(2, 15) - 1;

      TypeConstraint.MIN_INT = -Math.pow(2, 31);

      TypeConstraint.MAX_INT = Math.pow(2, 31) - 1;

      TypeConstraint.MIN_LONG = -Math.pow(2, 63);

      TypeConstraint.MAX_LONG = Math.pow(2, 63) - 1;

      function TypeConstraint(rawType, message) {
        var a, human_type, match;
        if (message == null) {
          message = null;
        }
        match = rawType.match(/^(?:[^:]+:)?(.*)$/);
        this.type = match ? match[1] : rawType;
        human_type = (function() {
          switch (this.type) {
            case "double":
              return "number";
            case "long":
              return "integer between -2^63 and 2^63-1";
            case "int":
              return "integer between -2,147,483,648 and 2,147,483,647";
            case "short":
              return "integer between -32,768 and 32,767";
            case "datetime":
              return "date/time with format MM/DD/YYYYTHH:MM:SS";
            case "boolean":
              return "true or false";
            default:
              return this.type;
          }
        }).call(this);
        a = /^[aeiou]/i.test(human_type) ? 'an' : 'a';
        TypeConstraint.__super__.constructor.call(this, message != null ? message : "Value must be " + a + " " + human_type);
      }

      TypeConstraint.prototype.check = function(value, model, resolver) {
        if (!value) {
          return true;
        }
        switch (this.type) {
          case "string":
            return true;
          case "anyuri":
            return true;
          case "double":
            return this.checkDouble(value);
          case "long":
            return this.checkLong(value);
          case "int":
            return this.checkInt(value);
          case "short":
            return this.checkShort(value);
          case "datetime":
            return this.checkDateTime(value);
          case "boolean":
            return this.checkBoolean(value);
          default:
            warn("Unable to validate type: ", this.type);
            return true;
        }
      };

      TypeConstraint.prototype._checkIntegerRange = function(min, max, value) {
        var number;
        number = Number(value);
        return !isNaN(number) && number >= min && number <= max && value.indexOf('.') === -1;
      };

      TypeConstraint.prototype.checkDouble = function(value) {
        return !isNaN(Number(value));
      };

      TypeConstraint.prototype.checkLong = function(value) {
        return this._checkIntegerRange(TypeConstraint.MIN_LONG, TypeConstraint.MAX_LONG, value);
      };

      TypeConstraint.prototype.checkInt = function(value) {
        return this._checkIntegerRange(TypeConstraint.MIN_INT, TypeConstraint.MAX_INT, value);
      };

      TypeConstraint.prototype.checkShort = function(value) {
        return this._checkIntegerRange(TypeConstraint.MIN_SHORT, TypeConstraint.MAX_SHORT, value);
      };

      TypeConstraint.prototype.checkBoolean = function(value) {
        return value === 'true' || value === 'false';
      };

      TypeConstraint.prototype.checkDateTime = function(value) {
        var date, day, hour, minute, month, second, t, time, year, _ref, _ref1, _ref2;
        if (!value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
          return false;
        }
        _ref = value.split('T'), date = _ref[0], time = _ref[1];
        _ref1 = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = date.split('-');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            t = _ref1[_i];
            _results.push(parseInt(t, 10));
          }
          return _results;
        })(), year = _ref1[0], month = _ref1[1], day = _ref1[2];
        _ref2 = (function() {
          var _i, _len, _ref2, _results;
          _ref2 = time.split(':');
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            t = _ref2[_i];
            _results.push(parseInt(t, 10));
          }
          return _results;
        })(), hour = _ref2[0], minute = _ref2[1], second = _ref2[2];
        return (1 <= month && month <= 12) && (1 <= day && day <= 31) && hour < 24 && minute < 60 && second < 60;
      };

      return TypeConstraint;

    })(BaseConstraint);
    RequiredConstraint = (function(_super) {
      __extends(RequiredConstraint, _super);

      function RequiredConstraint(xpath, message) {
        this.xpath = xpath;
        if (message == null) {
          message = "Required field";
        }
        RequiredConstraint.__super__.constructor.call(this, message);
      }

      RequiredConstraint.prototype.check = function(value, model, resolver) {
        if (value instanceof Array && value.length === 0) {
          value = null;
        }
        return !!value || !execXPath(model, this.xpath, resolver);
      };

      return RequiredConstraint;

    })(BaseConstraint);
    echoformsControlUniqueId = 0;
    BaseControl = (function() {
      function BaseControl(ui, model, controlClasses, resolver) {
        var help, _i, _len, _ref, _ref1;
        this.ui = ui;
        this.model = model;
        this.controlClasses = controlClasses;
        this.resolver = resolver;
        this.onChange = __bind(this.onChange, this);
        this.changed = __bind(this.changed, this);
        this.refExpr = ui.attr('ref');
        this.id = (_ref = ui.attr('id')) != null ? _ref : "echoforms-control-" + (echoformsControlUniqueId++);
        this.relevantExpr = ui.attr('relevant');
        this.requiredExpr = ui.attr('required');
        this.readonlyExpr = ui.attr('readonly');
        this.label = ui.attr('label');
        _ref1 = ui.children('help');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          help = _ref1[_i];
          this.help = $(help).text();
        }
        this.loadConstraints();
        this.el = this.buildDom();
      }

      BaseControl.prototype.loadConstraints = function() {
        var constraintNodes, message, node, patternNode, xpathNode, _i, _len, _ref, _results;
        this.constraints = [];
        if (this.requiredExpr) {
          this.constraints.push(new RequiredConstraint(this.requiredExpr));
        }
        constraintNodes = this.ui.children('constraints');
        _ref = constraintNodes.children('constraint');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          node = $(node);
          message = node.children('alert').text();
          patternNode = node.children('pattern');
          xpathNode = node.children('xpath');
          if (patternNode.length > 0) {
            this.constraints.push(new PatternConstraint(patternNode.text(), message));
          }
          if (xpathNode.length > 0) {
            _results.push(this.constraints.push(new XPathConstraint(xpathNode.text(), message)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      BaseControl.prototype.ref = function() {
        if (this.refExpr != null) {
          return $(this.xpath(this.refExpr));
        } else {
          return this.model;
        }
      };

      BaseControl.prototype.refValue = function() {
        if (this.refExpr != null) {
          return $.trim(this.ref().text());
        } else {
          return void 0;
        }
      };

      BaseControl.prototype.inputValue = function() {
        return warn("" + this.constructor.name + " must override inputValue");
      };

      BaseControl.prototype.loadFromModel = function() {
        return this.validate();
      };

      BaseControl.prototype.validate = function() {
        var c, errors;
        if (this.relevantExpr != null) {
          this.relevant(!!this.xpath(this.relevantExpr));
        }
        if (this.readonlyExpr != null) {
          this.readonly(!!this.xpath(this.readonlyExpr));
        }
        errors = (function() {
          var _i, _len, _ref, _ref1, _results;
          _ref = this.constraints;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            if (!c.check((_ref1 = this.refValue()) != null ? _ref1 : this.inputValue(), this.model, this.resolver)) {
              _results.push(c.message);
            }
          }
          return _results;
        }).call(this);
        return this.setErrors(errors);
      };

      BaseControl.prototype.saveToModel = function() {};

      BaseControl.prototype.xpath = function(xpath) {
        return execXPath(this.model, xpath, this.resolver);
      };

      BaseControl.prototype.element = function() {
        return this.el != null ? this.el : this.el = this.buildDom();
      };

      BaseControl.prototype.isChanged = function(newValue) {
        return this.refValue() !== this.inputValue() || !this.refExpr;
      };

      BaseControl.prototype.changed = function() {
        return this.el.trigger('echoforms:modelchange');
      };

      BaseControl.prototype.relevant = function(arg) {
        var isRelevant, ref;
        if (arg != null) {
          isRelevant = !!arg;
          if (isRelevant !== this.relevant()) {
            this.el.toggleClass('echoforms-irrelevant', !isRelevant);
            this.el.toggle(isRelevant);
            ref = this.ref();
            ref.toggleClass('echoforms-pruned', !isRelevant);
            if (ref.attr('class') === '') {
              return ref.removeAttr('class');
            }
          }
        } else {
          return !this.el.hasClass('echoforms-irrelevant');
        }
      };

      BaseControl.prototype.readonly = function(arg) {
        var isReadonly;
        if (arg != null) {
          isReadonly = !!arg;
          if (isReadonly !== this.readonly()) {
            this.el.toggleClass('echoforms-readonly ui-state-disabled', isReadonly);
            return this.updateReadonly(isReadonly);
          }
        } else {
          return this.el.hasClass('echoforms-readonly');
        }
      };

      BaseControl.prototype.updateReadonly = function(isReadonly) {
        this.inputs().attr('disabled', isReadonly);
        return this.inputs().attr('readonly', isReadonly);
      };

      BaseControl.prototype.onChange = function(e) {
        if (this.isChanged()) {
          this.saveToModel();
          return this.changed();
        }
      };

      BaseControl.prototype.buildLabelDom = function() {
        if (this.label != null) {
          return $("<label class=\"echoforms-control-label\" for=\"" + this.id + "-element\">" + this.label + "</label>");
        } else {
          return $();
        }
      };

      BaseControl.prototype.buildHelpDom = function() {
        var help, result, _i, _len, _ref;
        result = $();
        _ref = this.ui.children('help');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          help = _ref[_i];
          result = result.add("<label class=\"echoforms-help\" for=\"" + this.id + "-element\">" + ($(help).text()) + "</label>");
        }
        return result;
      };

      BaseControl.prototype.buildControlDom = function() {
        return $("<div id=\"" + this.id + "\" class=\"echoforms-control echoforms-control-" + this.ui[0].nodeName + "\"/>");
      };

      BaseControl.prototype.buildElementsDom = function() {
        return $('<div class="echoforms-elements"/>').append(this.buildElementsChildrenDom());
      };

      BaseControl.prototype.buildErrorsDom = function() {
        return $('<div class="echoforms-errors"/>');
      };

      BaseControl.prototype.setErrors = function(messages) {
        var errors, message, _i, _len;
        errors = $();
        for (_i = 0, _len = messages.length; _i < _len; _i++) {
          message = messages[_i];
          error = $('<div class="echoforms-error"/>');
          error.text(message);
          errors = errors.add(error);
        }
        return this.el.find('.echoforms-errors').empty().append(errors);
      };

      BaseControl.prototype.buildElementsChildrenDom = function() {
        return $();
      };

      BaseControl.prototype.buildDom = function() {
        return this.buildControlDom().append(this.buildLabelDom()).append(this.buildElementsDom()).append(this.buildHelpDom()).append(this.buildErrorsDom());
      };

      return BaseControl;

    })();
    TypedControl = (function(_super) {
      __extends(TypedControl, _super);

      function TypedControl(ui, model, controlClasses, resolver) {
        var _ref;
        this.inputType = ((_ref = ui.attr('type')) != null ? _ref : 'string').replace(/^.*:/, '').toLowerCase();
        TypedControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
        this.inputs().bind('click change', this.onChange);
      }

      TypedControl.prototype.loadConstraints = function() {
        TypedControl.__super__.loadConstraints.call(this);
        return this.constraints.push(new TypeConstraint(this.inputType));
      };

      TypedControl.prototype.inputs = function() {
        return this._inputs != null ? this._inputs : this._inputs = this.el.find(':input');
      };

      TypedControl.prototype.inputValue = function() {
        return $.trim(this.inputs().val());
      };

      TypedControl.prototype.saveToModel = function() {
        TypedControl.__super__.saveToModel.call(this);
        if (this.refExpr) {
          return this.ref().text(this.inputValue());
        }
      };

      TypedControl.prototype.loadFromModel = function() {
        TypedControl.__super__.loadFromModel.call(this);
        if (this.refExpr) {
          return this.inputs().val(this.refValue());
        }
      };

      return TypedControl;

    })(BaseControl);
    InputControl = (function(_super) {
      __extends(InputControl, _super);

      function InputControl() {
        _ref = InputControl.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      InputControl.selector = 'input';

      InputControl.prototype.inputElementType = 'text';

      InputControl.prototype.buildElementsChildrenDom = function() {
        var element;
        element = $("<input id=\"" + this.id + "-element\" type=\"" + this.inputElementType + "\" class=\"echoforms-element-input echoforms-element-input-" + this.inputType + "\" autocomplete=\"off\">");
        if (this.inputType === 'datetime') {
          element.attr('placeholder', 'MM/DD/YYYYTHH:MM:SS');
        }
        return element;
      };

      return InputControl;

    })(TypedControl);
    CheckboxControl = (function(_super) {
      __extends(CheckboxControl, _super);

      function CheckboxControl() {
        _ref1 = CheckboxControl.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      CheckboxControl.selector = 'input[type$=boolean]';

      CheckboxControl.prototype.inputElementType = 'checkbox';

      CheckboxControl.prototype.inputValue = function() {
        return this.inputs().is(':checked').toString();
      };

      CheckboxControl.prototype.loadFromModel = function() {
        CheckboxControl.__super__.loadFromModel.call(this);
        if (this.refExpr) {
          return this.inputs().attr('checked', this.refValue() === 'true');
        }
      };

      CheckboxControl.prototype.buildDom = function() {
        var result;
        result = CheckboxControl.__super__.buildDom.call(this);
        result.find('.echoforms-elements').after(result.find('.echoforms-control-label'));
        return result;
      };

      return CheckboxControl;

    })(InputControl);
    OutputControl = (function(_super) {
      __extends(OutputControl, _super);

      OutputControl.selector = 'output';

      function OutputControl(ui, model, controlClasses, resolver) {
        this.valueExpr = ui.attr('value');
        OutputControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
      }

      OutputControl.prototype.inputs = function() {
        return $();
      };

      OutputControl.prototype.refValue = function() {
        if (this.valueExpr) {
          return this.xpath(this.valueExpr);
        } else {
          return OutputControl.__super__.refValue.call(this);
        }
      };

      OutputControl.prototype.loadFromModel = function() {
        OutputControl.__super__.loadFromModel.call(this);
        if (this.refExpr || this.valueExpr) {
          return this.el.find('.echoforms-elements > p').text(this.refValue());
        }
      };

      OutputControl.prototype.buildElementsChildrenDom = function() {
        return $('<p/>');
      };

      return OutputControl;

    })(TypedControl);
    UrlOutputControl = (function(_super) {
      __extends(UrlOutputControl, _super);

      function UrlOutputControl() {
        _ref2 = UrlOutputControl.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      UrlOutputControl.selector = 'output[type$=anyURI], output[type$=anyuri]';

      UrlOutputControl.prototype.loadFromModel = function() {
        var value;
        value = this.refValue();
        if (this.refExpr || this.valueExpr) {
          return this.el.find('.echoforms-elements > a').text(value).attr('href', value);
        }
      };

      UrlOutputControl.prototype.buildElementsChildrenDom = function() {
        return $('<a href="#" />');
      };

      return UrlOutputControl;

    })(OutputControl);
    SelectControl = (function(_super) {
      __extends(SelectControl, _super);

      SelectControl.selector = 'select';

      function SelectControl(ui, model, controlClasses, resolver) {
        var item, label, value;
        this.isMultiple = ui.attr('multiple') === 'true';
        this.valueElementName = ui.attr('valueElementName');
        this.items = (function() {
          var _i, _len, _ref3, _ref4, _results;
          _ref3 = ui.children('item');
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            item = _ref3[_i];
            _ref4 = [$(item).attr('label'), $(item).attr('value')], label = _ref4[0], value = _ref4[1];
            _results.push([label != null ? label : value, value]);
          }
          return _results;
        })();
        SelectControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
      }

      SelectControl.prototype.refValue = function() {
        var child, _i, _len, _ref3, _results;
        if ((this.valueElementName != null) && (this.refExpr != null)) {
          _ref3 = this.ref().children(this.valueElementName);
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            child = _ref3[_i];
            _results.push($(child).text());
          }
          return _results;
        } else {
          return SelectControl.__super__.refValue.call(this);
        }
      };

      SelectControl.prototype.saveToModel = function() {
        var namespace, node, root, value, _i, _len, _ref3, _results;
        if ((this.valueElementName != null) && (this.refExpr != null)) {
          root = this.ref().empty();
          namespace = root[0].nodeName.split(':')[0];
          _ref3 = this.inputValue();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            value = _ref3[_i];
            node = $("<" + namespace + ":" + this.valueElementName + "/>").text(value);
            _results.push(root.append(node));
          }
          return _results;
        } else {
          return SelectControl.__super__.saveToModel.call(this);
        }
      };

      SelectControl.prototype.loadFromModel = function() {
        var node, value;
        if ((this.valueElementName != null) && (this.refExpr != null)) {
          value = (function() {
            var _i, _len, _ref3, _results;
            _ref3 = this.ref().children();
            _results = [];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              node = _ref3[_i];
              _results.push($(node).text());
            }
            return _results;
          }).call(this);
          if (!this.isMultiple) {
            value = value[0];
          }
          return this.inputs().val(value);
        } else {
          return SelectControl.__super__.loadFromModel.call(this);
        }
      };

      SelectControl.prototype.inputValue = function() {
        var result;
        result = this.inputs().val();
        if ((this.valueElementName != null) && !(result instanceof Array)) {
          result = result != null ? [result] : [];
        }
        return result;
      };

      SelectControl.prototype.buildElementsChildrenDom = function() {
        var el, label, value, _i, _len, _ref3, _ref4;
        el = $("<select id=\"" + this.id + "-element\" class=\"echoforms-element-select\" autocomplete=\"off\"/>");
        if (this.isMultiple) {
          el.addClass('echoforms-element-select-multiple');
          el.attr('multiple', 'multiple');
        } else {
          el.append('<option value=""> -- Select a value -- </option>');
        }
        if (this.isOpen) {
          el.addClass('echoforms-element-select-open');
        }
        _ref3 = this.items;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          _ref4 = _ref3[_i], label = _ref4[0], value = _ref4[1];
          el.append("<option value=\"" + value + "\">" + label + "</option>");
        }
        return el;
      };

      return SelectControl;

    })(TypedControl);
    RangeControl = (function(_super) {
      __extends(RangeControl, _super);

      RangeControl.selector = 'range';

      function RangeControl(ui, model, controlClasses, resolver) {
        this.start = ui.attr('start');
        this.end = ui.attr('end');
        this.step = ui.attr('step');
        RangeControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
      }

      return RangeControl;

    })(InputControl);
    SecretControl = (function(_super) {
      __extends(SecretControl, _super);

      function SecretControl() {
        _ref3 = SecretControl.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      SecretControl.selector = 'secret';

      SecretControl.prototype.inputElementType = 'password';

      return SecretControl;

    })(InputControl);
    TextareaControl = (function(_super) {
      __extends(TextareaControl, _super);

      function TextareaControl() {
        _ref4 = TextareaControl.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      TextareaControl.selector = 'textarea';

      TextareaControl.prototype.buildElementsChildrenDom = function() {
        return $("<textarea id=\"" + this.id + "-element\" class=\"echoforms-element-textarea\" autocomplete=\"off\"/>");
      };

      return TextareaControl;

    })(TypedControl);
    GroupingControl = (function(_super) {
      __extends(GroupingControl, _super);

      function GroupingControl(ui, model, controlClasses, resolver) {
        ui.removeAttr('required');
        GroupingControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
      }

      GroupingControl.prototype.inputs = function() {
        return $();
      };

      GroupingControl.prototype.loadFromModel = function() {
        var control, _i, _len, _ref5, _results;
        GroupingControl.__super__.loadFromModel.call(this);
        _ref5 = this.controls;
        _results = [];
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          control = _ref5[_i];
          _results.push(control.loadFromModel());
        }
        return _results;
      };

      GroupingControl.prototype.buildDom = function() {
        var ControlClass, child, childModel, children, control, controls, found, root, ui, _i, _j, _len, _len1, _ref5, _ref6;
        root = GroupingControl.__super__.buildDom.call(this);
        childModel = this.ref();
        ui = this.ui;
        children = $();
        this.controls = controls = [];
        _ref5 = ui.children();
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          child = _ref5[_i];
          if (child.nodeName === 'help' || child.nodeName === 'constraints') {
            continue;
          }
          found = false;
          _ref6 = this.controlClasses;
          for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
            ControlClass = _ref6[_j];
            if ($(child).is(ControlClass.selector)) {
              control = new ControlClass($(child), childModel, this.controlClasses, this.resolver);
              controls.push(control);
              children = children.add(control.el);
              found = true;
              break;
            }
          }
          if (!found) {
            warn("No class available for element:", child);
          }
        }
        root.find('.echoforms-elements').replaceWith($('<div class="echoforms-children"/>').append(children));
        return root;
      };

      GroupingControl.prototype.updateReadonly = function(isReadonly) {
        var control, _i, _len, _ref5, _results;
        GroupingControl.__super__.updateReadonly.call(this, isReadonly);
        _ref5 = this.controls;
        _results = [];
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          control = _ref5[_i];
          _results.push(control.updateReadonly(isReadonly));
        }
        return _results;
      };

      return GroupingControl;

    })(BaseControl);
    FormControl = (function(_super) {
      __extends(FormControl, _super);

      function FormControl(ui, model, controlClasses, resolver) {
        var _this = this;
        ui.attr('ref', model.children()[0].nodeName);
        FormControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
        this.el.bind('echoforms:modelchange', function() {
          return _this.loadFromModel();
        });
        this.loadFromModel();
      }

      FormControl.prototype.isValid = function() {
        return this.el.find('.echoforms-error').length === 0;
      };

      FormControl.prototype.serialize = function() {
        var model;
        model = this.model.children().clone();
        model.find('.echoforms-pruned').remove();
        return $('<div>').append(model).html();
      };

      return FormControl;

    })(GroupingControl);
    GroupControl = (function(_super) {
      __extends(GroupControl, _super);

      function GroupControl() {
        _ref5 = GroupControl.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      GroupControl.selector = 'group';

      GroupControl.prototype.buildLabelDom = function() {
        if (this.label != null) {
          return $("<h1 class=\"echoforms-control-label\">" + this.label + "</h1>");
        } else {
          return $();
        }
      };

      GroupControl.prototype.buildHelpDom = function() {
        var help, result, _i, _len, _ref6;
        result = $();
        _ref6 = this.ui.children('help');
        for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
          help = _ref6[_i];
          result = result.add("<p class=\"echoforms-help\">" + ($(help).text()) + "</>");
        }
        return result;
      };

      GroupControl.prototype.buildDom = function() {
        var result;
        result = GroupControl.__super__.buildDom.call(this);
        result.find('.echoforms-control-label').after(result.find('.echoforms-help'));
        return result;
      };

      return GroupControl;

    })(GroupingControl);
    SelectrefControl = (function(_super) {
      __extends(SelectrefControl, _super);

      SelectrefControl.selector = 'selectref';

      function SelectrefControl(ui, model, controlClasses, resolver) {
        var valueElementName;
        valueElementName = ui.attr('valueElementName');
        if (valueElementName == null) {
          ui.attr('valueElementName', 'value');
        }
        SelectrefControl.__super__.constructor.call(this, ui, model, controlClasses, resolver);
      }

      return SelectrefControl;

    })(SelectControl);
    pluginName = "echoforms";
    defaults = {
      controls: []
    };
    defaultControls = [CheckboxControl, InputControl, UrlOutputControl, OutputControl, SelectControl, RangeControl, SecretControl, TextareaControl, GroupControl, SelectrefControl];
    XPathResolver = (function() {
      function XPathResolver(xml) {
        this.resolve = __bind(this.resolve, this);
        var match, name, namespaceRegexp, namespaces, uri, _ref6;
        namespaces = {};
        namespaceRegexp = /\sxmlns(?::(\w+))?=\"([^\"]+)\"/g;
        match = namespaceRegexp.exec(xml);
        while (match != null) {
          name = (_ref6 = match[1]) != null ? _ref6 : ' default ';
          uri = match[2];
          namespaces[name] = uri;
          match = namespaceRegexp.exec(xml);
        }
        this.namespaces = namespaces;
      }

      XPathResolver.prototype.resolve = function(prefix) {
        return this.namespaces[prefix != null ? prefix : " default "];
      };

      return XPathResolver;

    })();
    EchoFormsInterface = (function() {
      function EchoFormsInterface(root, options) {
        var controlClasses, doc, form, model, resolver, ui;
        this.root = root;
        this.options = $.extend({}, defaults, options);
        this.form = form = this.options['form'];
        this.controlClasses = controlClasses = this.options['controls'].concat(defaultControls);
        if (form == null) {
          error("You must specify a 'form' option when creating an echoforms instance");
        }
        this.resolver = resolver = new XPathResolver(form).resolve;
        this.doc = doc = $(parseXML(form));
        this.model = model = doc.find('form > model> instance');
        this.ui = ui = doc.find('form > ui');
        this.control = new FormControl(ui, model, controlClasses, resolver);
        this.root.append(this.control.element());
      }

      EchoFormsInterface.prototype.destroy = function() {
        return this.root.removeData('echoforms').empty();
      };

      EchoFormsInterface.prototype.isValid = function() {
        return this.control.isValid();
      };

      EchoFormsInterface.prototype.serialize = function() {
        return this.control.serialize();
      };

      return EchoFormsInterface;

    })();
    $.fn[pluginName] = function() {
      var args, method, result, _ref6;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length > 0 && typeof args[0] === 'string') {
        _ref6 = args, method = _ref6[0], args = 2 <= _ref6.length ? __slice.call(_ref6, 1) : [];
        result = this.map(function() {
          var attr, form, x, _ref7;
          form = $.data(this, "echoforms");
          if (/^debug_/.test(method)) {
            _ref7 = method.split('_'), x = _ref7[0], attr = 2 <= _ref7.length ? __slice.call(_ref7, 1) : [];
            return form[attr.join('_')];
          } else if (!/^_/.test(method) && typeof (form != null ? form[method] : void 0) === 'function') {
            return form[method].apply(form, args);
          } else {
            err("Could not call " + method + " on echoforms instance:", this);
            return null;
          }
        });
        return result[0];
      } else if (args.length < 2) {
        return this.each(function() {
          var options;
          options = args[0];
          if (!$.data(this, "echoforms")) {
            return $.data(this, "echoforms", new EchoFormsInterface($(this), options));
          }
        });
      } else {
        err("Bad arguments to echoforms:", args);
        return this;
      }
    };
    return $(document).ready(function() {});
  })(jQuery, window, document);

}).call(this);
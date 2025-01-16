/*!
* rete-auto-arrange-plugin v2.0.2
* (c) 2025 Vitaliy Stoliarov
* Released under the MIT license.
* */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var ELK = require('elkjs');
var rete = require('rete');
var reteAreaPlugin = require('rete-area-plugin');
var _typeof = require('@babel/runtime/helpers/typeof');
var _get = require('@babel/runtime/helpers/get');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);
var ELK__default = /*#__PURE__*/_interopDefaultLegacy(ELK);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);

var Applier = /*#__PURE__*/function () {
  function Applier() {
    _classCallCheck__default["default"](this, Applier);
  }
  return _createClass__default["default"](Applier, [{
    key: "setEditor",
    value: function setEditor(editor) {
      this.editor = editor;
    }
  }, {
    key: "setArea",
    value: function setArea(area) {
      this.area = area;
    }
  }]);
}();

function _callSuper$2(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct$2() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct$2() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$2 = function _isNativeReflectConstruct() { return !!t; })(); }

/**
 * Standard applier. Applies the layout to the nodes and their children immediately
 */
var StandardApplier = /*#__PURE__*/function (_Applier) {
  function StandardApplier() {
    _classCallCheck__default["default"](this, StandardApplier);
    return _callSuper$2(this, StandardApplier, arguments);
  }
  _inherits__default["default"](StandardApplier, _Applier);
  return _createClass__default["default"](StandardApplier, [{
    key: "getValidShapes",
    value: function getValidShapes(shapes) {
      return shapes.filter(function (shape) {
        var x = shape.x,
          y = shape.y,
          width = shape.width,
          height = shape.height;
        return ![_typeof__default["default"](x), _typeof__default["default"](y), _typeof__default["default"](width), _typeof__default["default"](height)].includes('undefined');
      });
    }
  }, {
    key: "resizeNode",
    value: function () {
      var _resizeNode = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(id, width, height) {
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.area.resize(id, width, height);
            case 2:
              return _context.abrupt("return", _context.sent);
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function resizeNode(_x, _x2, _x3) {
        return _resizeNode.apply(this, arguments);
      }
      return resizeNode;
    }()
  }, {
    key: "translateNode",
    value: function () {
      var _translateNode = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(id, x, y) {
        var view;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              view = this.area.nodeViews.get(id);
              if (!view) {
                _context2.next = 4;
                break;
              }
              _context2.next = 4;
              return view.translate(x, y);
            case 4:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function translateNode(_x4, _x5, _x6) {
        return _translateNode.apply(this, arguments);
      }
      return translateNode;
    }()
  }, {
    key: "apply",
    value: function () {
      var _apply = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee4(nodes) {
        var _this = this;
        var offset,
          correctNodes,
          _args4 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              offset = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {
                x: 0,
                y: 0
              };
              correctNodes = this.getValidShapes(nodes);
              _context4.next = 4;
              return Promise.all(correctNodes.map(/*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(_ref) {
                  var id, x, y, width, height, children;
                  return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        id = _ref.id, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, children = _ref.children;
                        _context3.next = 3;
                        return Promise.all([_this.resizeNode(id, width, height), _this.translateNode(id, offset.x + x, offset.y + y)]);
                      case 3:
                        if (!children) {
                          _context3.next = 6;
                          break;
                        }
                        _context3.next = 6;
                        return _this.apply(children, {
                          x: offset.x + x,
                          y: offset.y + y
                        });
                      case 6:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3);
                }));
                return function (_x8) {
                  return _ref2.apply(this, arguments);
                };
              }()));
            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function apply(_x7) {
        return _apply.apply(this, arguments);
      }
      return apply;
    }()
  }]);
}(Applier);

var AnimationSystem = /*#__PURE__*/function () {
  function AnimationSystem() {
    _classCallCheck__default["default"](this, AnimationSystem);
    _defineProperty__default["default"](this, "activeAnimations", new Map());
  }
  return _createClass__default["default"](AnimationSystem, [{
    key: "start",
    value: function start() {
      var _this = this;
      var entries = Array.from(this.activeAnimations.entries());
      entries.forEach(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          key = _ref2[0],
          _ref2$ = _ref2[1],
          startTime = _ref2$.startTime,
          duration = _ref2$.duration,
          cb = _ref2$.cb,
          done = _ref2$.done;
        var t = (Date.now() - startTime) / duration;
        if (t >= 1) t = 1;
        if (t < 0 || t >= 1) {
          _this.activeAnimations["delete"](key);
          if (t >= 1) {
            cb(1);
            done(true);
          }
          return;
        }
        cb(t);
      });
      this.frameId = requestAnimationFrame(function () {
        _this.start();
      });
    }
  }, {
    key: "add",
    value: function () {
      var _add = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(duration, id, tick) {
        var _this2 = this;
        var startTime;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              startTime = Date.now();
              return _context.abrupt("return", new Promise(function (done) {
                _this2.activeAnimations.set(id, {
                  startTime: startTime,
                  duration: duration,
                  cb: function cb(t) {
                    return void tick(t);
                  },
                  done: done
                });
              }));
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function add(_x, _x2, _x3) {
        return _add.apply(this, arguments);
      }
      return add;
    }()
  }, {
    key: "cancel",
    value: function cancel(key) {
      var _this$activeAnimation;
      (_this$activeAnimation = this.activeAnimations.get(key)) === null || _this$activeAnimation === void 0 ? void 0 : _this$activeAnimation.done(false);
      this.activeAnimations["delete"](key);
    }
  }, {
    key: "stop",
    value: function stop() {
      if (typeof this.frameId !== 'undefined') cancelAnimationFrame(this.frameId);
    }
  }]);
}();

function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper$1(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, e, o, r) { var p = _get__default["default"](_getPrototypeOf__default["default"](1 & r ? t.prototype : t), e, o); return 2 & r && "function" == typeof p ? function (t) { return p.apply(o, t); } : p; }

/**
 * Transition applier props
 */

/**
 * Transition applier. Applies the layout to the nodes and their children with transition
 */
var TransitionApplier = /*#__PURE__*/function (_StandardApplier) {
  /**
   * @param props Transition applier props
   */
  function TransitionApplier(props) {
    var _this;
    _classCallCheck__default["default"](this, TransitionApplier);
    _this = _callSuper$1(this, TransitionApplier);
    _defineProperty__default["default"](_this, "animation", new AnimationSystem());
    _this.props = props;
    _this.duration = typeof (props === null || props === void 0 ? void 0 : props.duration) !== 'undefined' ? props.duration : 2000;
    _this.timingFunction = typeof (props === null || props === void 0 ? void 0 : props.timingFunction) !== 'undefined' ? props.timingFunction : function (t) {
      return t;
    };
    _this.animation.start();
    return _this;
  }
  _inherits__default["default"](TransitionApplier, _StandardApplier);
  return _createClass__default["default"](TransitionApplier, [{
    key: "applyTiming",
    value: function applyTiming(from, to, t) {
      var k = this.timingFunction(t);
      return from * (1 - k) + to * k;
    }
  }, {
    key: "resizeNode",
    value: function () {
      var _resizeNode = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(id, width, height) {
        var _this2 = this;
        var node, previous;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              node = this.editor.getNode(id);
              if (node) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return", false);
            case 3:
              previous = {
                width: node.width,
                height: node.height
              };
              _context.next = 6;
              return this.animation.add(this.duration, "".concat(id, "_resize"), function (t) {
                var _this2$props;
                var currentWidth = _this2.applyTiming(previous.width, width, t);
                var currentHeight = _this2.applyTiming(previous.height, height, t);
                if ((_this2$props = _this2.props) !== null && _this2$props !== void 0 && _this2$props.onTick) {
                  _this2.props.onTick(t);
                }
                return _superPropGet(TransitionApplier, "resizeNode", _this2, 3)([id, currentWidth, currentHeight]);
              });
            case 6:
              return _context.abrupt("return", _context.sent);
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function resizeNode(_x, _x2, _x3) {
        return _resizeNode.apply(this, arguments);
      }
      return resizeNode;
    }()
  }, {
    key: "translateNode",
    value: function () {
      var _translateNode = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(id, x, y) {
        var _this3 = this;
        var view, previous;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              view = this.area.nodeViews.get(id);
              if (view) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return", false);
            case 3:
              previous = _objectSpread$1({}, view.position);
              _context2.next = 6;
              return this.animation.add(this.duration, "".concat(id, "_translate"), function (t) {
                var _this3$props;
                var currentX = _this3.applyTiming(previous.x, x, t);
                var currentY = _this3.applyTiming(previous.y, y, t);
                if ((_this3$props = _this3.props) !== null && _this3$props !== void 0 && _this3$props.onTick) {
                  _this3.props.onTick(t);
                }
                return _superPropGet(TransitionApplier, "translateNode", _this3, 3)([id, currentX, currentY]);
              });
            case 6:
              return _context2.abrupt("return", _context2.sent);
            case 7:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function translateNode(_x4, _x5, _x6) {
        return _translateNode.apply(this, arguments);
      }
      return translateNode;
    }()
  }, {
    key: "cancel",
    value: function cancel(id) {
      this.animation.cancel("".concat(id, "_resize"));
      this.animation.cancel("".concat(id, "_translate"));
    }
  }, {
    key: "apply",
    value: function () {
      var _apply = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(nodes) {
        var _this4 = this;
        var offset,
          correctNodes,
          _args3 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              offset = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {
                x: 0,
                y: 0
              };
              correctNodes = this.getValidShapes(nodes);
              _context3.next = 4;
              return Promise.all(correctNodes.map(function (_ref) {
                var _this4$props;
                var id = _ref.id,
                  x = _ref.x,
                  y = _ref.y,
                  width = _ref.width,
                  height = _ref.height,
                  children = _ref.children;
                var hasChilden = children === null || children === void 0 ? void 0 : children.length;
                var needsLayout = (_this4$props = _this4.props) !== null && _this4$props !== void 0 && _this4$props.needsLayout ? _this4.props.needsLayout(id) : true;
                var forceSelf = !hasChilden || needsLayout;
                return Promise.all([hasChilden && _this4.apply(children, {
                  x: offset.x + x,
                  y: offset.y + y
                }), forceSelf && _this4.resizeNode(id, width, height), forceSelf && _this4.translateNode(id, offset.x + x, offset.y + y)]);
              }));
            case 4:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function apply(_x7) {
        return _apply.apply(this, arguments);
      }
      return apply;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      this.animation.stop();
    }
  }]);
}(StandardApplier);

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Applier: Applier,
  StandardApplier: StandardApplier,
  TransitionApplier: TransitionApplier
});

var setup = function setup(props) {
  return function () {
    return {
      port: function port(data) {
        var _spacing$top$bottom$x = {
            spacing: typeof (props === null || props === void 0 ? void 0 : props.spacing) !== 'undefined' ? props.spacing : 35,
            top: typeof (props === null || props === void 0 ? void 0 : props.top) !== 'undefined' ? props.top : 35,
            bottom: typeof (props === null || props === void 0 ? void 0 : props.bottom) !== 'undefined' ? props.bottom : 15,
            x: typeof (props === null || props === void 0 ? void 0 : props.x) !== 'undefined' ? props.x : 0 // Default value for x
          },
          spacing = _spacing$top$bottom$x.spacing,
          top = _spacing$top$bottom$x.top,
          bottom = _spacing$top$bottom$x.bottom,
          x = _spacing$top$bottom$x.x;
        if (data.side === 'output') {
          return {
            x: x,
            // Use the destructured x directly
            y: top + data.index * spacing,
            width: 15,
            height: 15,
            side: 'EAST'
          };
        }
        return {
          x: -x,
          // Use the destructured x directly
          y: data.height - bottom - data.ports * spacing + data.index * spacing,
          width: 15,
          height: 15,
          side: 'WEST'
        };
      }
    };
  };
};

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup
});

/**
 * Built-in presets. Responsible for node port positioning.
 * @module
 */

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  classic: index$1
});

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
/**
 * Auto arrange plugin. Layouts the graph using `elk.js`
 * @priority 10
 */
var AutoArrangePlugin = /*#__PURE__*/function (_Scope) {
  function AutoArrangePlugin() {
    var _this;
    _classCallCheck__default["default"](this, AutoArrangePlugin);
    _this = _callSuper(this, AutoArrangePlugin, ['auto-arrange']);
    _defineProperty__default["default"](_this, "elk", new ELK__default["default"]());
    _defineProperty__default["default"](_this, "demonstration", 'https://rtsys.informatik.uni-kiel.de/elklive/json.html');
    _defineProperty__default["default"](_this, "presets", []);
    return _this;
  }

  /**
   * Adds a preset to the plugin, which will be used to layout the node ports and customize the layout options
   * @param preset Preset to add
   */
  _inherits__default["default"](AutoArrangePlugin, _Scope);
  return _createClass__default["default"](AutoArrangePlugin, [{
    key: "addPreset",
    value: function addPreset(preset) {
      this.presets.push(preset);
    }
  }, {
    key: "findPreset",
    value: function findPreset(nodeId) {
      var _iterator = _createForOfIteratorHelper(this.presets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var presetFactory = _step.value;
          var result = presetFactory(nodeId);
          if (result) return result;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      throw new Error('cannot find preset for node with id = ' + nodeId);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      return this.parentScope(reteAreaPlugin.BaseAreaPlugin);
    }
  }, {
    key: "getEditor",
    value: function getEditor() {
      return this.getArea().parentScope(rete.NodeEditor);
    }
  }, {
    key: "nodeToLayoutChild",
    value: function nodeToLayoutChild(node, context) {
      var _this2 = this,
        _preset$options;
      var id = node.id,
        width = node.width,
        height = node.height;
      var inputs = node.inputs ? Object.entries(node.inputs).map(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          key = _ref2[0],
          input = _ref2[1];
        return {
          key: key,
          input: input
        };
      }) : [];
      var outputs = node.outputs ? Object.entries(node.outputs).map(function (_ref3) {
        var _ref4 = _slicedToArray__default["default"](_ref3, 2),
          key = _ref4[0],
          output = _ref4[1];
        return {
          key: key,
          output: output
        };
      }) : [];
      var preset = this.findPreset(id);
      return _objectSpread(_objectSpread({
        id: id,
        width: width,
        height: height,
        labels: [{
          text: 'label' in node ? node.label : ''
        }]
      }, this.graphToElk(context, id)), {}, {
        ports: [].concat(_toConsumableArray__default["default"](inputs.sort(function (a, b) {
          var _a$input$index, _a$input, _b$input$index, _b$input;
          return ((_a$input$index = (_a$input = a.input) === null || _a$input === void 0 ? void 0 : _a$input.index) !== null && _a$input$index !== void 0 ? _a$input$index : 0) - ((_b$input$index = (_b$input = b.input) === null || _b$input === void 0 ? void 0 : _b$input.index) !== null && _b$input$index !== void 0 ? _b$input$index : 0);
        }).map(function (_ref5, index) {
          var key = _ref5.key;
          var _preset$port = preset.port({
              nodeId: id,
              key: key,
              side: 'input',
              width: width,
              height: height,
              index: index,
              ports: inputs.length
            }),
            side = _preset$port.side,
            portWidth = _preset$port.width,
            portHeight = _preset$port.height,
            x = _preset$port.x,
            y = _preset$port.y;
          return {
            id: _this2.getPortId(id, key, 'input'),
            width: portWidth,
            height: portHeight,
            x: x,
            y: y,
            properties: {
              side: side
            }
          };
        })), _toConsumableArray__default["default"](outputs.sort(function (a, b) {
          var _a$output$index, _a$output, _b$output$index, _b$output;
          return ((_a$output$index = (_a$output = a.output) === null || _a$output === void 0 ? void 0 : _a$output.index) !== null && _a$output$index !== void 0 ? _a$output$index : 0) - ((_b$output$index = (_b$output = b.output) === null || _b$output === void 0 ? void 0 : _b$output.index) !== null && _b$output$index !== void 0 ? _b$output$index : 0);
        }).map(function (_ref6, index) {
          var key = _ref6.key;
          var _preset$port2 = preset.port({
              nodeId: id,
              side: 'output',
              key: key,
              index: index,
              width: width,
              height: height,
              ports: outputs.length
            }),
            side = _preset$port2.side,
            portWidth = _preset$port2.width,
            portHeight = _preset$port2.height,
            x = _preset$port2.x,
            y = _preset$port2.y;
          return {
            id: _this2.getPortId(id, key, 'output'),
            width: portWidth,
            height: portHeight,
            x: x,
            y: y,
            properties: {
              side: side
            }
          };
        }))),
        layoutOptions: _objectSpread(_objectSpread({}, ((_preset$options = preset.options) === null || _preset$options === void 0 ? void 0 : _preset$options.call(preset, id)) || {}), {}, {
          portConstraints: 'FIXED_POS'
        })
      });
    }
  }, {
    key: "connectionToLayoutEdge",
    value: function connectionToLayoutEdge(connection) {
      var source = connection.sourceOutput ? this.getPortId(connection.source, connection.sourceOutput, 'output') : connection.source;
      var target = connection.targetInput ? this.getPortId(connection.target, connection.targetInput, 'input') : connection.target;
      return {
        id: connection.id,
        sources: [source],
        targets: [target]
      };
    }
  }, {
    key: "graphToElk",
    value: function graphToElk(context, parent) {
      var _this3 = this;
      var nodes = context.nodes.filter(function (n) {
        return n.parent === parent;
      });
      return {
        children: nodes.map(function (n) {
          return _this3.nodeToLayoutChild(n, context);
        }),
        edges: context.connections.filter(function () {
          return !parent;
        }).map(function (c) {
          return _this3.connectionToLayoutEdge(c);
        })
      };
    }
  }, {
    key: "getPortId",
    value: function getPortId(id, key, side) {
      return [id, key, side].join('_');
    }

    /**
     * Method to layout the graph
     * @param props Options for the layout
     * @param props.options elk.js options for the layout
     * @param props.applier Layout applier. Responsible for applying node positions to the graph
     * @returns Debug information about the layout
     */
    // eslint-disable-next-line max-statements, complexity
  }, {
    key: "layout",
    value: (function () {
      var _layout = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(props) {
        var _props$nodes, _props$connections, _props$options, _props$applier;
        var nodes, connections, graph, applier, source, result;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              nodes = (_props$nodes = props === null || props === void 0 ? void 0 : props.nodes) !== null && _props$nodes !== void 0 ? _props$nodes : this.getEditor().getNodes();
              connections = (_props$connections = props === null || props === void 0 ? void 0 : props.connections) !== null && _props$connections !== void 0 ? _props$connections : this.getEditor().getConnections();
              graph = _objectSpread({
                id: 'root',
                layoutOptions: _objectSpread({
                  /* eslint-disable @typescript-eslint/naming-convention */
                  'elk.algorithm': 'layered',
                  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
                  'elk.edgeRouting': 'POLYLINE'
                }, (_props$options = props === null || props === void 0 ? void 0 : props.options) !== null && _props$options !== void 0 ? _props$options : {})
              }, this.graphToElk({
                nodes: nodes,
                connections: connections
              }));
              applier = (_props$applier = props === null || props === void 0 ? void 0 : props.applier) !== null && _props$applier !== void 0 ? _props$applier : new StandardApplier();
              source = JSON.stringify(graph, null, '\t');
              applier.setEditor(this.getEditor());
              applier.setArea(this.getArea());
              _context.prev = 7;
              _context.next = 10;
              return this.elk.layout(graph);
            case 10:
              result = _context.sent;
              if (!result.children) {
                _context.next = 14;
                break;
              }
              _context.next = 14;
              return applier.apply(result.children);
            case 14:
              return _context.abrupt("return", {
                demonstration: this.demonstration,
                source: source,
                result: result
              });
            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](7);
              // eslint-disable-next-line no-console
              console.warn('[rete-auto-arrange-plugin]', {
                source: source,
                demonstration: this.demonstration
              });
              throw _context.t0;
            case 21:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[7, 17]]);
      }));
      function layout(_x) {
        return _layout.apply(this, arguments);
      }
      return layout;
    }())
  }]);
}(rete.Scope);

exports.ArrangeAppliers = index$2;
exports.AutoArrangePlugin = AutoArrangePlugin;
exports.Presets = index;
//# sourceMappingURL=rete-auto-arrange-plugin.common.js.map

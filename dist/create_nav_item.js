'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defer2 = require('lodash/defer');

var _defer3 = _interopRequireDefault(_defer2);

var _startsWith2 = require('lodash/startsWith');

var _startsWith3 = _interopRequireDefault(_startsWith2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// use this from context()

exports.default = function (manulRouter) {
  return function (nav) {
    var label = nav.label,
        routeName = nav.routeName,
        disabled = nav.disabled,
        params = nav.params,
        queryParams = nav.queryParams;


    var path = routeName && !disabled ? manulRouter.getPath(routeName, params, queryParams) : null;

    var currentPath = manulRouter.getCurrentPath();
    var active = currentPath === path;
    var navItem = _extends({}, nav, {
      href: path,
      active: active,
      childActive: !active && (0, _startsWith3.default)(currentPath, path),
      label: label
    });
    var go = function go() {
      return manulRouter.go(navItem);
    };
    var onClick = function onClick(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (navItem.active) {
        return;
      }
      (0, _defer3.default)(go);
    };

    return _extends({
      go: go
    }, navItem, {
      // overridable, if not falsy, spreading navItem after this does not handle this correctly
      onClick: nav.onClick || onClick

    });
  };
};
//# sourceMappingURL=create_nav_item.js.map
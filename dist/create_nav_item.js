'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

var _defer = require('lodash/defer');

var _defer2 = _interopRequireDefault(_defer);

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
    var navItem = (0, _extends3.default)({}, nav, {
      href: path,
      active: active,
      childActive: !active && (0, _startsWith2.default)(currentPath, path),
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
      (0, _defer2.default)(go);
    };

    return (0, _extends3.default)({
      go: go
    }, navItem, {
      // overridable, if not falsy, spreading navItem after this does not handle this correctly
      onClick: nav.onClick || onClick
    });
  };
};
//# sourceMappingURL=create_nav_item.js.map
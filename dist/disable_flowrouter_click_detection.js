'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-param-reassign: 0*/

exports.default = function (_ref) {
  var FlowRouter = _ref.FlowRouter,
      Meteor = _ref.Meteor;

  FlowRouter.wait();
  FlowRouter._linkDetectionDisabled = true;
  /* global Package*/

  if (Package['ostrio:flow-router-extra']) {
    // probably the "new" flow router
    Meteor.startup(function () {
      FlowRouter.initialize({
        page: {
          link: false
        }
      });
    });
  } else {
    // patch FlowRouter
    // because of https://github.com/kadirahq/flow-router/issues/705
    Meteor.startup(function () {
      var oldPage = FlowRouter._page;
      FlowRouter._page = function _page() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if ((0, _isObject2.default)(args[0])) {
          args[0].click = false;
        }
        return oldPage.call.apply(oldPage, [this].concat(args));
      };
      (0, _assign2.default)(FlowRouter._page, oldPage); // copy properties

      FlowRouter.initialize();
    });
  }
};
//# sourceMappingURL=disable_flowrouter_click_detection.js.map
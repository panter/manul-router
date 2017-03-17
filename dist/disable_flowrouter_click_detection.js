'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign2 = require('lodash/assign');

var _assign3 = _interopRequireDefault(_assign2);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-param-reassign: 0*/

exports.default = function (_ref) {
  var FlowRouter = _ref.FlowRouter,
      Meteor = _ref.Meteor;

  // patch FlowRouter
  // because of https://github.com/kadirahq/flow-router/issues/705
  FlowRouter._askedToWait = true;
  FlowRouter._linkDetectionDisabled = true;
  Meteor.startup(function () {
    var oldPage = FlowRouter._page;
    FlowRouter._page = function _page() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if ((0, _isObject3.default)(args[0])) {
        args[0].click = false;
      }
      return oldPage.call.apply(oldPage, [this].concat(args));
    };
    (0, _assign3.default)(FlowRouter._page, oldPage); // copy properties

    FlowRouter.initialize();
  });
};
//# sourceMappingURL=disable_flowrouter_click_detection.js.map
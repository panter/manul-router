
import _ from 'lodash';

/* eslint no-param-reassign: 0*/

export default ({ FlowRouter, Meteor }) => {
  // patch FlowRouter
  // because of https://github.com/kadirahq/flow-router/issues/705
  FlowRouter._askedToWait = true;
  FlowRouter._linkDetectionDisabled = true;
  Meteor.startup(() => {
    const oldPage = FlowRouter._page;
    FlowRouter._page = function _page(...args) {
      if (_.isObject(args[0])) {
        args[0].click = false;
      }
      return oldPage.call(this, ...args);
    };
    _.assign(FlowRouter._page, oldPage); // copy properties

    FlowRouter.initialize();
  });
};

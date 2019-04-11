import assign from 'lodash/assign';
import isObject from 'lodash/isObject';

/* eslint no-param-reassign: 0*/

export default ({ FlowRouter, Meteor }) => {
  FlowRouter.wait();
  FlowRouter._linkDetectionDisabled = true;
  /* global Package*/

  if (Package['ostrio:flow-router-extra']) {
    // probably the "new" flow router
    Meteor.startup(() => {
      FlowRouter.initialize({
        page: {
          click: false,
        },
      });
    });
  } else {
    // patch FlowRouter
    // because of https://github.com/kadirahq/flow-router/issues/705
    Meteor.startup(() => {
      const oldPage = FlowRouter._page;
      FlowRouter._page = function _page(...args) {
        if (isObject(args[0])) {
          args[0].click = false;
        }
        return oldPage.call(this, ...args);
      };
      assign(FlowRouter._page, oldPage); // copy properties

      FlowRouter.initialize();
    });
  }
};

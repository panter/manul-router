import tape from 'tape';
import ManulRouter from '../src/manul-router';
import _ from 'lodash';
/* eslint no-shadow: 0*/

const getMocks = () => ({
  Meteor: {
    startup: callback => callback(),
  },
  FlowRouter: {
    initialize() {},
    current() {
      return {
        path: 'my/current/path',
      };
    },
    path() {
      return '/to/my/path';
    },
  },
  i18n: {
    getLocale() {
      return 'de_CH';
    },
  },
});

tape('test getRouteName', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(2);
  FlowRouter.current = () => {
    t.pass('calls FlowRouter.getRouteName');
    return 'myRoute';
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  const routeName = router.getRouteName();
  t.equal(routeName, 'myRoute', 'returns current routeName');
});
tape('test getCurrentPath', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(2);
  FlowRouter.current = () => {
    t.pass('calls FlowRouter.current');
    return {
      path: '/path/to/something',
    };
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  const currentPath = router.getCurrentPath();
  t.equal(currentPath, '/path/to/something', 'returns current path');
});

tape('test getCurrentRoute', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(2);
  FlowRouter.current = () => {
    t.pass('calls FlowRouter.current');
    return {
      route: 'testRoute',
    };
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  const routeName = router.getCurrentRoute();
  t.equal(routeName, 'testRoute', 'returns current path');
});


tape('test getParam', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(2);
  FlowRouter.getParam = (key) => {
    t.equal(key, 'myparamkey', 'calls FlowRouter.getParam with key');
    return 'myvalue';
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  const param = router.getParam('myparamkey');
  t.equal(param, 'myvalue', 'returns the param');
});

tape('test setParams', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(1);
  FlowRouter.setParams = (paramsObject) => {
    t.deepEqual(paramsObject, {
      key1: 'value1',
      key2: 2,
      key3: 'value3',
    }, 'calls FlowRouter.setParams with paramsObject');
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  router.setParams({
    key1: 'value1',
    key2: 2,
    key3: 'value3',
  });
});


tape('test getQueryParam', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(2);
  FlowRouter.getQueryParam = (key) => {
    t.equal(key, 'myparamkey', 'calls FlowRouter.getQueryParam with key');
    return 'myvalue';
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  const param = router.getQueryParam('myparamkey');
  t.equal(param, 'myvalue', 'returns the param');
});

tape('test setQueryParams', (t) => {
  const { Meteor, FlowRouter } = getMocks();
  t.plan(1);
  FlowRouter.setQueryParams = (paramsObject) => {
    t.deepEqual(paramsObject, {
      key1: 'value1',
      key2: 2,
      key3: 'value3',
    },
    'calls FlowRouter.setQueryParams with paramsObject');
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n: {} });
  router.setQueryParams({
    key1: 'value1',
    key2: 2,
    key3: 'value3',
  });
});

tape('test getPath', (t) => {
  const { Meteor, FlowRouter, i18n } = getMocks();
  t.plan(5);
  FlowRouter.path = (routeName, params, queryParams) => {
    t.pass('calls FlowRouter.path');
    t.equal(routeName, 'myRoute');
    t.deepEqual(params, { locale: 'de_CH', pathParam: 'myValue' }, 'uses pathParams and adds locale');
    t.deepEqual(queryParams, { queryParam: 'myValue' });
    return 'myPath/to/something';
  };

  const router = new ManulRouter({ FlowRouter, Meteor, i18n });
  const path = router.getPath('myRoute', { pathParam: 'myValue' }, { queryParam: 'myValue' });
  t.equal(path, 'myPath/to/something', 'returns path from FlowRouter.path');
});

tape('test go', (t) => {
  t.test('can be called with path or routeName and a callback', (t) => {
    t.plan(3);
    const { Meteor, FlowRouter, i18n } = getMocks();
    const globalOnRoute = (nav, next) => {
      t.equals('/to/my/path', nav.href, 'calls global onRoute with nav item');
      next();
    };
    FlowRouter.go = (path) => {
      t.equal(path, '/to/my/path', 'calls FlowRouter.go with path');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n }, { onRoute: globalOnRoute });
    const callback = () => {
      t.pass('callback has been called');
    };
    router.go('/to/my/path', callback);
  });

  t.test('can be called with nav item', (t) => {
    t.plan(4);
    const { Meteor, FlowRouter, i18n } = getMocks();

    const navItem = {
      href: '/to/my/path',
      onRoute: (nav, next) => {
        t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
        next();
      },
    };

    const globalOnRoute = (nav, next) => {
      t.deepEquals(nav, navItem, 'calls global onRoute with nav item');
      next();
    };

    FlowRouter.go = (path) => {
      t.equal(path, '/to/my/path', 'calls FlowRouter.go with path');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n }, { onRoute: globalOnRoute });
    const callback = () => {
      t.pass('callback has been called');
    };
    router.go(navItem, callback);
  });

  t.test('onRoute can be arrays as wel', (t) => {
    t.plan(7);
    const { Meteor, FlowRouter, i18n } = getMocks();

    const navItem = {
      href: '/to/my/path',
      onRoute: [
        (nav, next) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          next();
        },
        (nav, next) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          next();
        },
        (nav, next) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          next();
        },
      ],
    };

    const globalOnRoute = [
      (nav, next) => {
        t.deepEquals(nav, navItem, 'calls global onRoute with nav item');
        next();
      },
      (nav, next) => {
        t.deepEquals(nav, navItem, 'calls global onRoute with nav item');
        next();
      },
    ];

    FlowRouter.go = (path) => {
      t.equal(path, '/to/my/path', 'calls FlowRouter.go with path');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n }, { onRoute: globalOnRoute });
    const callback = () => {
      t.pass('callback has been called');
    };
    router.go(navItem, callback);
  });

  t.test('routing is canceled if a onRoute does not call next', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(1);
    const navItem = {
      href: '/to/my/path',
      onRoute: [
        (nav, next) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          // next(); // no next!
        },
        () => {
        // should fail
          t.fail('routing should have been stopped');
        },
      ],
    };

    FlowRouter.go = () => {
      t.fail('should not call FlowRouter.go');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const callback = () => {
      t.fail('callback has been called');
    };
    router.go(navItem, callback);
  });
  t.test('routing is canceled if a onRoute calls next with false', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(1);
    const navItem = {
      href: '/to/my/path',
      onRoute: [
        (nav, next) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          next(false);
        },
        () => {
          // should fail
          t.fail('routing should have been stopped');
        },
      ],
    };

    FlowRouter.go = () => {
      t.fail('should not call FlowRouter.go');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const callback = () => {
      t.fail('callback has been called');
    };
    router.go(navItem, callback);
  });

  t.test('routing is canceled if a onRoute return false', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(1);
    const navItem = {
      href: '/to/my/path',
      onRoute: [
        (nav) => {
          t.deepEquals(nav, navItem, 'calls navItem.onRoute with nav item');
          return false;
        },
        () => {
        // should fail
          t.fail('routing should have been stopped');
        },
      ],
    };

    FlowRouter.go = () => {
      t.fail('should not call FlowRouter.go');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const callback = () => {
      t.fail('callback has been called');
    };
    router.go(navItem, callback);
  });
});


tape('test redirect', (t) => {
  t.test('can be called with path or routeName and a callback', (t) => {
    t.plan(1);
    const { Meteor, FlowRouter, i18n } = getMocks();
    const globalOnRoute = () => {
      t.fail('redirect does not call onRoute');
    };
    FlowRouter.redirect = (path) => {
      t.equal(path, '/to/my/path', 'calls FlowRouter.redirect with path');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n }, { onRoute: globalOnRoute });

    router.redirect('/to/my/path');
  });

  t.test('can be called with nav item', (t) => {
    t.plan(1);
    const { Meteor, FlowRouter, i18n } = getMocks();

    const navItem = {
      href: '/to/my/path',
    };

    FlowRouter.redirect = (path) => {
      t.equal(path, '/to/my/path', 'calls FlowRouter.redirect with path');
    };

    const router = new ManulRouter({ FlowRouter, Meteor, i18n });

    router.redirect(navItem);
  });
});

tape('test createLocaleRoutesGroup', (t) => {
  const { Meteor, FlowRouter, i18n } = getMocks();
  t.plan(3);
  const group = {};
  FlowRouter.group = (args) => {
    t.equals(args.prefix, '/:locale?');
    t.pass('calls FlowRouter.group');
    return group;
  };
  const router = new ManulRouter({ FlowRouter, Meteor, i18n });

  const localeGroup = router.createLocaleRoutesGroup();
  t.equal(localeGroup, group, 'returns group');
});

/**
this is an internal function that is the localeGroup
**/
tape('test _setLocaleByRoute', (t) => {
  t.test('it sets locale on i18n if it supports it', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(2);

    i18n.supports = (locale) => {
      t.equals(locale, 'it_IT', 'asks i18n if locale is supported');
      return true;
    };
    i18n.setLocale = (locale) => {
      t.equals(locale, 'it_IT', 'sets locale on i18n');
    };
    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const redirect = () => {
      t.fail('does not call this param');
    };
    const stop = () => {
      t.fail('does not call stop');
    };
    router._setLocaleByRoute({ params: { locale: 'it_IT' } }, redirect, stop);
  });

  t.test('it sets fallback locale if locale is not supported', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(4);

    i18n.supports = (locale) => {
      t.equals(locale, 'it_IT', 'asks i18n if locale is supported');
      return false;
    };
    i18n.getFallbackLocale = () => {
      t.pass('calls i18n.getFallbackLocale');
      return 'de_CH';
    };

    FlowRouter.setParams = (params) => {
      t.deepEquals(params, { locale: 'de_CH' }, 'it calls FlowRouter.setParams with fallback locale');
    };
    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const redirect = () => {
      t.fail('does not call this param');
    };
    const stop = () => {
      t.pass('it does call stop');
    };
    router._setLocaleByRoute({ params: { locale: 'it_IT' } }, redirect, stop);
  });
});


tape('test createNavItem', (t) => {
  const nav = {
    label: 'myLabel',
    routeName: 'myRoute',
    disabled: false,
    params: {
      myPathParam: 'mypathValue',
    },
    queryParams: {
      myQueryParam: 'myQueryValue',
    },
  };
  t.test('creates inactive item with href', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(4);

    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const navItem = router.createNavItem(nav);
    t.equals(navItem.href, '/to/my/path'); // from FlowRouter
    t.equals(navItem.active, false);
    t.equals(navItem.childActive, false);
    t.equals(_.isFunction(navItem.onClick), true);
  });

  t.test('is active if current path is given path', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(3);
    FlowRouter.current = () => ({
      path: '/to/my/path',
    });
    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const navItem = router.createNavItem(nav);
    t.equals(navItem.href, '/to/my/path'); // from FlowRouter
    t.equals(navItem.active, true);
    t.equals(navItem.childActive, false);
  });

  t.test('childActive is true if a child path is given', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(3);
    FlowRouter.current = () => ({
      path: '/to/my/path/i/am/a/child',
    });
    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const navItem = router.createNavItem(nav);
    t.equals(navItem.href, '/to/my/path'); // from FlowRouter
    t.equals(navItem.active, false);
    t.equals(navItem.childActive, true);
  });
});


tape('test createNavItemForCurrentPage', (t) => {
  t.test('it creates a nav item with merged params and queryParams', (t) => {
    const { Meteor, FlowRouter, i18n } = getMocks();
    t.plan(5);
    FlowRouter.current = () => ({
      path: '/to/my/current/path',
      route: {
        path: '/to/my/current/path',
      },
      params: {
        myCurrentParam: 'myValue',
        otherParam: 'currentValue',
      },
      queryParams: {
        page: 1,
      },
    });
    FlowRouter.path = () => '/to/my/current/path';
    const router = new ManulRouter({ FlowRouter, Meteor, i18n });
    const navItem = router.createNavItemForCurrentPage({ locale: 'it', otherParam: 'newValue' }, { page: 2 });
    t.equals(navItem.href, '/to/my/current/path');
    t.equals(navItem.active, true);
    t.equals(navItem.childActive, false);
    t.deepEqual(navItem.params, { myCurrentParam: 'myValue', locale: 'it', otherParam: 'newValue' });

    t.deepEqual(navItem.queryParams, { page: 2 });
  });
});

import flatten from 'lodash/flatten';

import last from 'lodash/last';
import isBoolean from 'lodash/isBoolean';

import has from 'lodash/has';

import isFunction from 'lodash/isFunction';

import CreateNavItem from './create_nav_item';
import disableFlowRouterClickDetection from './disable_flowrouter_click_detection';

/**

  const manulRouter = new ManulRouter(
    {FlowRouter, Meteor, i18n},
    {
      // onRoute will be called when route is changed
      // it will be called with the navItem and a next-function
      // route will continue if you either return true or call the next-function
      // otherwise, route change is canceled.
      onRoute(navItem:Object, next:Function)
    }
  );
**/
export default class {
  constructor({ FlowRouter, Meteor, i18n }, globals = {}) {
    this.FlowRouter = FlowRouter;
    this.i18n = i18n;
    this.routeConfirmCallback = null;
    this.globals = globals;
    this.Meteor = Meteor;
    this.createNavItem = CreateNavItem(this);
    // path bad path escaping when setting params
    // see https://github.com/kadirahq/flow-router/issues/601#issuecomment-327393055
    this.FlowRouter.go = function (pathDef, fields, queryParams) {
      let path = this.path(pathDef, fields, queryParams);
      const useReplaceState = this.env.replaceState.get();
      const badSlash = /%252F/g;
      path = path.replace(badSlash, '/');

      if (useReplaceState) {
        this._page.replace(path);
      } else {
        this._page(path);
      }
    };
    disableFlowRouterClickDetection({ FlowRouter, Meteor });
  }

  createNavItemForCurrentPage(newParams = {}, newQueryParams = {}) {
    const current = this.FlowRouter.current();
    return this.createNavItem({
      routeName: current.route.path, // this is the route definition / path with placeholders!
      params: { ...current.params, ...newParams },
      queryParams: { ...current.queryParams, ...newQueryParams },
    });
  }

  /**
    current route name tracker-reactive
  **/
  getRouteName() {
    return this.FlowRouter.getRouteName();
  }
  /**
  get the current path tracker-reactive
  **/
  getCurrentPath(reactive = true) {
    if (reactive) this.FlowRouter.watchPathChange();
    return this.FlowRouter.current().path;
  }

  /**
  get the current route defininition tracker-reactive
  **/
  getCurrentRoute(reactive = true) {
    if (reactive) this.FlowRouter.watchPathChange();
    return this.FlowRouter.current().route;
  }
  /**
  get a url path param by name, tracker-reactive
  **/
  getParam(paramName) {
    return this.FlowRouter.getParam(paramName);
  }

  /**
  set a url path param in the current route
  **/
  setParams(newParams) {
    this.FlowRouter.setParams(newParams);
  }

  /**
  get queryparams, tracker-reactive
  **/
  getQueryParam(queryStringKey) {
    return this.FlowRouter.getQueryParam(queryStringKey);
  }

  /**
    set queryString params, you can pass an object with key:values
  **/
  setQueryParams(newQueryParams) {
    this.FlowRouter.setQueryParams(newQueryParams);
  }

  /**
    construct a path by the routeName, params and queryParams.
    It automatically adds the locale to the route if it is a localeRoute
  **/
  getPath(routeName, params, queryParams) {
    return this.FlowRouter.path(
      routeName,
      { locale: this.i18n.getLocale(), ...params },
      queryParams,
      // flow router does escape "/" in the route-params, but we like to keep them
      // FIXME: may break cases where / is in a queryParam
    ).replace(/%252F/g, '/');
  }

  /**
  got to the given route. The arguments can be:
  - routeName, params, queryParams
  - a path (string)
  - a navItem (created with createNavItem)


  This will trigger route-callbacks (onRoute)

  you can additionally pass a callback as the last param,
  this will be called after all onRoute-Callbacks has been resolved

  **/
  go(...args) {
    const nav = this._wrapAsNavItemIfneeded(args);
    const allOnRoutes = flatten([nav.onRoute, this.globals.onRoute]);
    allOnRoutes
      .reduce(
        (promiseChain, onRoute) =>
          promiseChain.then(
            () =>
              new Promise((next) => {
                if (isFunction(onRoute)) {
                  // onRoute can either return true/ false
                  // or call its second arg (next) with no value or true
                  const should = onRoute(nav, (s = true) => s && next());
                  if (isBoolean(should) && should) {
                    next();
                  }
                } else {
                  next();
                }
              }),
          ),
        Promise.resolve(),
      )
      .then(() => {
        this.FlowRouter.go(nav.href);
        // check if last arg is a callback function and execute
        if (isFunction(last(args))) {
          last(args)();
        }
      });
  }

  createLocaleRoutesGroup(baseRoutes = this.FlowRouter) {
    return baseRoutes.group({
      prefix: '/:locale?',
      triggersEnter: [this._setLocaleByRoute.bind(this)],
    });
  }

  _setLocaleByRoute(
    {
      params: { locale },
    },
    redirect,
    stop,
  ) {
    if (!locale) {
      // do nothing, let it as default. usually this is root page
    } else if (this.i18n.supports(locale)) {
      this.i18n.setLocale(locale);
    } else {
      this.setParams({ locale: this.i18n.getFallbackLocale(locale) });
      stop();
    }
  }

  redirect(...args) {
    // on ios and android cordova reidrect throws a security error.
    // we skip this on both ios and android
    if (this.Meteor.isCordova) {
      this.go(...args);
    } else {
      const nav = this._wrapAsNavItemIfneeded(args);
      this.FlowRouter.redirect(nav.href);
    }
  }

  _wrapAsNavItemIfneeded(args) {
    const firstArg = args[0];
    if (has(firstArg, 'href')) {
      // is already a nav item
      return args[0];
    }
    return this.createNavItem({
      routeName: args[0],
      params: args[1],
      queryParams: args[2],
    });
  }
}

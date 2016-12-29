import _ from 'lodash';
// use this from context()

export default manulRouter => (nav) => {
  const {
    label,
    routeName,
    disabled,
    params,
    queryParams,
  } = nav;

  const path = (
    routeName && !disabled ?
    manulRouter.getPath(routeName, params, queryParams) :
    null
  );

  const currentPath = manulRouter.getCurrentPath();
  const active = currentPath === path;
  const navItem = {
    ...nav,
    href: path,
    active,
    childActive: !active && _.startsWith(currentPath, path),
    label,
  };
  const go = () => manulRouter.go(navItem);
  const onClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (navItem.active) {
      return;
    }
    _.defer(go);
  };

  return {
    go,
    ...navItem,
    // overridable, if not falsy, spreading navItem after this does not handle this correctly
    onClick: nav.onClick || onClick,

  };
};

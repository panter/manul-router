import startsWith from 'lodash/startsWith';
import defer from 'lodash/defer';
// use this from context()

export default manulRouter => (nav) => {
  const { label, routeName, disabled, params, queryParams } = nav;

  const path = routeName && !disabled ? manulRouter.getPath(routeName, params, queryParams) : null;

  const currentPath = manulRouter.getCurrentPath();
  const active = currentPath === path;
  const navItem = {
    ...nav,
    href: path,
    active,
    childActive: !active && startsWith(currentPath, path),
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
    defer(go);
  };

  return {
    go,
    ...navItem,
    // overridable, if not falsy, spreading navItem after this does not handle this correctly
    onClick: nav.onClick || onClick,
  };
};

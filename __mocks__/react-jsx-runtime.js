/**
 * Jest shim: @babel/preset-react "automatic" imports react/jsx-runtime, which exists
 * only from React 17+. This package tests against React 16.13.
 *
 * Automatic runtime calls `jsx(type, props, key)` / `jsxs(type, props, key)` where the
 * third argument is the React **key**, not a child.
 */
const React = require("react");

function jsx(type, props, key) {
  const nextProps =
    key !== undefined && key !== null ? { ...props, key } : props || {};
  return React.createElement(type, nextProps);
}

module.exports = {
  Fragment: React.Fragment,
  jsx,
  jsxs: jsx,
  jsxDEV: jsx,
};

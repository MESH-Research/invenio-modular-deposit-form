/**
 * Jest shim: @babel/preset-react "automatic" imports react/jsx-runtime, which exists
 * only from React 17+. This package tests against React 16.13.
 */
const React = require("react");

module.exports = {
  Fragment: React.Fragment,
  jsx: React.createElement,
  jsxs: React.createElement,
  jsxDEV: React.createElement,
};

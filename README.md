# Manul-Router

Adapter for https://github.com/kadirahq/flow-router for manul/mantra/react-apps

We implemented it to hide FlowRouter and make a transition to react-router more easy.

It also provides a function to create navigation-items that can be used to create navigations.

## Install

`npm install --save @panter/manul-router`

## Features

- **minimal api** exposes some functions of FlowRouter and adds functions to create navigation items that can be used in navgiations
- **No automatic link detection** unlike vanilla FlowRouter, but similar to react-reacter, simple <a>-tags will cause a page-reload! 
You have to create a navItem (with createNavItem) which will have a onClick-Function that can be passed to an <a>-tag. 
The automatic link detection causes problem if you want to interfer with the click, that's why we decided to disable it. 
This makes it easier to switch to react-router because it behaves similarly.




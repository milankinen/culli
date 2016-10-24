# **C**ycle **U**ti**l**ity **Li**braries 

[![Travis branch](https://img.shields.io/travis/milankinen/culli/master.svg?style=flat-square)](https://travis-ci.org/milankinen/culli)

## Motivation 

`TODO`

## Available utilities

The following utilities are available as npm packages:

| **Package**                               | **Version**                                                                                                              | **Description** |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------|
| [`dom`](../tree/master/packages/dom)      | [![npm](https://img.shields.io/npm/v/@culli/dom.svg?style=flat-square)](https://www.npmjs.com/package/@culli/dom)        | Utilities for DOM manipulation |
| [`store`](../tree/master/packages/store)  | [![npm](https://img.shields.io/npm/v/@culli/store.svg?style=flat-square)](https://www.npmjs.com/package/@culli/store)    | Utilities for state management and storage |


## Dev quickstart

```bash
git clone git@github.com:milankinen/culli.git
cd culli && npm i
npm t
```

#### Creating new package

```bash
npm run newpkg
```

#### Updating dependencies

```bash 
npm run upd
```

#### Commiting changes

```bash
npm run ci
```

**ATTENTION:** Please use this command instead of `git commit`


## License

MIT

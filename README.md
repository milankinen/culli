# **C**ycle **U**ti**l**ity **Li**braries 

[![Travis branch](https://img.shields.io/travis/milankinen/culli/master.svg?style=flat-square)](https://travis-ci.org/milankinen/culli)

## Motivation 

I've used CycleJS for a while now. Although CycleJS has some very good ideas and practices,
I've noticed that the current architectural decisions and solutions of Cycle apps can't respond
to the complex requirements that I face every day in my work. I've also followed Cycle's 
[Gitter channel](https://gitter.im/cyclejs/cyclejs) quite intensively and noticed that I'm not 
the only one having these issues. That's why I'm releasing this collection of Cycle utility
libraries: their goal is to provide some well-thought and battle-proven architectural choices 
I've succesfully  used when building web applications (in personal and commercial projects). 

The most important design goals of these utility libraries are:

  * **Consistency:** whether you're building small or huge apps, the application 
    structure and codebase should always follow same conventions and practices
  * **Minimalistic API surface:** each library feature should have one, and only 
    one, domain it solves. And it should solve it as well as possible.
  * **Performance:** theory and practice are two different things. Something that
    looks good in paper doesn't work in practice. Library design should be such that
    user don't need to worry about performance or scalability
  
I hope by releasing these utility libraries, also other people can enjoy the results of
my findings and hopefully give some new ideas that can added to these utilities.


## Available packages

The following utilities are available as npm packages:

| **Package**                | **Version**                                                                                                              | **Description** |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------|
| [`dom`](packages/dom) [WIP]| [![npm](https://img.shields.io/npm/v/@culli/dom.svg?style=flat-square)](https://www.npmjs.com/package/@culli/dom)        | Utilities for DOM manipulation |
| [`store`](packages/store)  | [![npm](https://img.shields.io/npm/v/@culli/store.svg?style=flat-square)](https://www.npmjs.com/package/@culli/store)    | Utilities for state management and storage |


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

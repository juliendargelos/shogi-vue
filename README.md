# Shogi

[![Maintainability](https://api.codeclimate.com/v1/badges/be07d587dbc2f8f75aff/maintainability)](https://codeclimate.com/github/juliendargelos/shogi/maintainability)

[shogi.netlify.com](https://shogi.netlify.com)

A shogi game in VueJS (wip)

## Install

### Clone the repository

```shell
git clone git@github.com:juliendargelos/shogi.git
cd shogi
```

### Check your Ruby version

```shell
ruby -v
```

The ouput should start with something like `ruby 2.5.1`

If not, install the right ruby version using [rbenv](https://github.com/rbenv/rbenv) (it could take a while):

```shell
rbenv install 2.5.1
```

### Install dependencies

Using [Bundler](https://github.com/bundler/bundler) and [Yarn](https://github.com/yarnpkg/yarn):

```shell
bundle && yarn
```

## Serve

```shell
middleman
```

## Build

```shell
middleman build
```

## Deploy

```shell
middleman deploy
```

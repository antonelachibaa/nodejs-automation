const _ = require('lodash');
const url = require('url');

function structure() {
  return {
    content: {},
    navigation: {},
    option: {},
    button: {},
    select: {},
    input: {},
    radio: {},
    checkbox: {},
    validation: {},
    tab: {},
    icon: {},
    link: {},
    list: {},
    card: {},
    upload: {},
    placeholder: {},
    paragraph: {},
    label: {},
    tooltip: {},
    footer: {},
    other: {},
  };
}


class Page {
  constructor() {
    this.domain = '';
    this.route = '/';
    this.is_accesible_via_url = true;
    this.text = structure();
    this.locator = structure();
  }

  get url() {
    return url.resolve(this.domain, this.route);
  }

  load(obj) {
    this.name = obj.name;
    this.domain = obj.domain;
    this.route = obj.route;
    this.is_accesible_via_url = obj.is_accesible_via_url;
    this.text = obj.text;
    this.locator = obj.locator;
  }

  extend(obj) {
    const newInstance = new Page();
    newInstance.load(_.merge(_.cloneDeep(this), obj));
    return newInstance;
  }
}


module.exports = Page;

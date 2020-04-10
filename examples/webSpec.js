const {browser} = require('protractor');
const Action = require('../web/action');

describe('Home Page', () => {
    const action = new Action(browser);
    it('', () => {
        browser.get('https://ing.ro/persoane-fizice')
            .then(() => action.click(by.xpath('//a[@href="https://homebank.ro/hb/hb"]')))
            .then(()=> action.wait.forPresenceOfElement(by.xpath('//img[@alt="homebank-logo"]')))
    });
});

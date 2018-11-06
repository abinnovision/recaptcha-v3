# reCAPTCHA-v3
![NPM Package](https://badge.fury.io/js/recaptcha-v3.svg)

A simple and easy to use reCAPTCHA (v3 only) library.

## Install
With NPM:
```bash
$ npm install recaptcha-v3
```

With Yarn:
```bash
$ yarn add recaptcha-v3
```

## Perquisites
To use this package you only need a valid site key for your domain, which you can easily get [here](https://www.google.com/recaptcha).

# Usage

With promises:
```javascript
import { load } from 'recaptcha-v3'

load('<site key>').then((recaptcha) => {
  recaptcha.execute('<action>').then((token) => {
      console.log(token) // Will print the token
    })
})
```

With async/await:
```javascript
import { load } from 'recaptcha-v3'

async function asyncFunction() {
  const recaptcha = await load('<site key>')
  const token = await recaptcha.execute('<action>')

  console.log(token) // Will also print the token
}
```

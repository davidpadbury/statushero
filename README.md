# StatusHero

Exceptionally simple CLI and API for updating your status on [StatusHero](https://statushero.com).

## CLI

```
npm install -g statushero

statushero --username your@username.com --password yourpassword -- "what you did yesterday" "plans for today" "optional blockers"
```

### Using New Lines in Status

If you using bash you can insert new lines into your update from the CLI by prefixing the string with a dollar.

```
statushero --username your@username.com --password yourpassword -- $'- item 1\n- item 2' $'- today 1\n- today 2'
```

## API

```
var statushero = require('statushero')({
  username: 'your@username.com',
  password: 'yourpassword'
})

var update = {
  yesterday: '- yesterday 1\n- yesterday 2',
  today: '- today 1\n- today 2',
  blockers: 'computer on fire'
}

statushero.updateStatus(update, function (err) { ... })
```

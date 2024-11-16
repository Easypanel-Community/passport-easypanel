# passport-easypanel

A [Passport](http://passportjs.org/) strategy for authenticating with [Easypanel](https://easypanel.io) using bearer tokens.

![npm version](https://img.shields.io/npm/v/passport-easypanel)
![npm downloads](https://img.shields.io/npm/dm/passport-easypanel)
![license](https://img.shields.io/npm/l/passport-easypanel)

## Features

- Full ESM and CommonJS support
- TypeScript type definitions included
- Express.js integration
- 2FA support
- Comprehensive error handling
- Cross-platform compatibility

## Installation

```bash
npm install passport-easypanel passport express
```

## Basic Usage

### ESM
```javascript
import passport from 'passport';
import { EasypanelStrategy } from 'passport-easypanel';

passport.use(new EasypanelStrategy({
  baseUrl: 'https://your-easypanel-domain.tld'
}));
```

### CommonJS
```javascript
const passport = require('passport');
const { EasypanelStrategy } = require('passport-easypanel');

passport.use(new EasypanelStrategy({
  baseUrl: 'https://your-easypanel-domain.tld'
}));
```

## Complete Express.js Example

Here's a full example showing how to integrate the Easypanel authentication strategy with Express.js:

```javascript
import express from 'express';
import passport from 'passport';
import { EasypanelStrategy, EasypanelAuthError } from 'passport-easypanel';

const app = express();

// Parse JSON bodies
app.use(express.json());

// Initialize passport
app.use(passport.initialize());

// Configure Easypanel strategy
passport.use(new EasypanelStrategy({
  baseUrl: 'https://your-easypanel-domain.tld'
}));

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const token = await EasypanelStrategy.login(
      'https://your-easypanel-domain.tld',
      {
        email: req.body.email,
        password: req.body.password,
        rememberMe: req.body.rememberMe || false,
        code: req.body.code // 2FA code if enabled
      }
    );
    
    res.json({ token });
  } catch (error) {
    if (error instanceof EasypanelAuthError) {
      res.status(error.statusCode).json({
        error: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
});

// Protected route example
app.get('/profile', 
  passport.authenticate('easypanel', { session: false }),
  (req, res) => {
    res.json({
      user: req.user
    });
  }
);

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof EasypanelAuthError) {
    res.status(err.statusCode).json({
      error: err.message
    });
  } else {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Complete TypeScript Example

```typescript
import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { EasypanelStrategy, EasypanelAuthError, EasypanelUser } from 'passport-easypanel';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends EasypanelUser {}
  }
}

const app = express();

app.use(express.json());
app.use(passport.initialize());

passport.use(new EasypanelStrategy({
  baseUrl: process.env.EASYPANEL_URL || 'https://your-easypanel-domain.tld'
}));

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  code?: string;
}

app.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const token = await EasypanelStrategy.login(
      process.env.EASYPANEL_URL || 'https://your-easypanel-domain.tld',
      {
        email: req.body.email,
        password: req.body.password,
        rememberMe: req.body.rememberMe,
        code: req.body.code
      }
    );
    
    res.json({ token });
  } catch (error) {
    if (error instanceof EasypanelAuthError) {
      res.status(error.statusCode).json({
        error: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
});

app.get('/profile', 
  passport.authenticate('easypanel', { session: false }),
  (req: Request, res: Response) => {
    res.json({
      user: req.user
    });
  }
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing the Setup

1. Start your server:
```bash
node server.js
```

2. Get a token by logging in:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password",
    "rememberMe": false
  }'
```

3. Access a protected route using the token:
```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## User Object Structure

The authenticated user object contains the following properties:

```typescript
interface EasypanelUser {
  id: string;
  email: string;
  admin: boolean;
  createdAt: Date;
  twoFactorEnabled: boolean;
}
```

## Error Handling

The package exports an `EasypanelAuthError` class for handling authentication-specific errors:

```javascript
try {
  const token = await EasypanelStrategy.login(baseUrl, credentials);
} catch (error) {
  if (error instanceof EasypanelAuthError) {
    console.log(error.statusCode); // HTTP status code
    console.log(error.message);    // Error message
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Support

- Open an issue for bug reports
- Feature requests welcome
- Pull requests accepted
- Commercial support available

## Acknowledgments

- [Passport.js](http://www.passportjs.org/) for the authentication middleware
- [Easypanel](https://easypanel.io) for the server management platform
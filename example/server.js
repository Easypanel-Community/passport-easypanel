import express from 'express';
import passport from 'passport';
import { EasypanelStrategy, EasypanelAuthError } from 'passport-easypanel';

const app = express();

// Serve static files
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Initialize passport
app.use(passport.initialize());

const easypanelUrl = 'https://my-easypanel-instance.tld'

// Configure Easypanel strategy
passport.use(new EasypanelStrategy({
    baseUrl: easypanelUrl,
}));

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const token = await EasypanelStrategy.login(
            easypanelUrl,
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

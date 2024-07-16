import session from 'express-session';
import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import { prisma } from './utils/prisma.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { generateCustomUUID as UUID } from './utils/uuid.js';
import mainRoutes from './routes/mainRoutes.js'

dotenv.config();

if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not defined');
}

const app = express();

app.use(cors({
    origin: `${process.env.FRONTEND}`,
    credentials: true,
}));

app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use('/uploads', express.static(path.join(process.cwd(), './uploads')));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

const formatUsername = (displayName) => {
    return displayName.replace(/[^a-zA-Z0-9-_.]/g, '-');
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND}/api/auth/google/callback`,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let formattedUsername = formatUsername(profile.displayName);

            if (!formattedUsername.startsWith('@')) {
                formattedUsername = `@${formattedUsername}`;
            }

            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
            if (!user) {
                let usernameSuffix = 0;
                let uniqueUsername = formattedUsername;

                while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
                    usernameSuffix += 1;
                    uniqueUsername = `${formattedUsername}-${usernameSuffix}`;
                }

                user = await prisma.user.create({
                    data: {
                        id: UUID(),
                        googleId: profile.id,
                        email: profile.emails ? profile.emails[0].value : '',
                        username: uniqueUsername,
                        image: profile.photos ? profile.photos[0].value : ''
                    },
                });
            } else {
                if (!user.image || (profile.photos && user.image !== profile.photos[0].value)) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { image: profile.photos ? profile.photos[0].value : user.image },
                    });
                }
            }

            await prisma.account.upsert({
                where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.id } },
                update: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_at: profile._json?.expires_at || null,
                    token_type: profile._json?.token_type || null,
                    scope: profile._json?.scope || null,
                    id_token: profile._json?.id_token || null,
                    session_state: profile._json?.session_state || null,
                },
                create: {
                    id: UUID(),
                    userId: user.id,
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: profile.id,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_at: profile._json?.expires_at || null,
                    token_type: profile._json?.token_type || null,
                    scope: profile._json?.scope || null,
                    id_token: profile._json?.id_token || null,
                    session_state: profile._json?.session_state || null,
                },
            });

            return done(null, user);
        } catch (error) {
            if (error.oauthError) {
                const body = await error.oauthError.read();
                console.error('OAuthError:', body.toString());
            } else {
                console.error('Error during authentication:', error);
            }
            return done(error, false);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, (user).id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.userId = (req.user).id;
        res.redirect(`${process.env.FRONTEND}`);
    }
);

app.get('/check-session', async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.session.userId },
                select: { username: true, name: true, image: true }
            });

            if (user) {
                res.status(200).json({
                    loggedIn: true,
                    user: { username: user.username, name: user.name, image: user.image }
                });
            } else {
                res.status(404).json({ loggedIn: false, message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ loggedIn: false, error: 'Internal Server Error' });
        }
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

app.use('/api', mainRoutes)

export default app;
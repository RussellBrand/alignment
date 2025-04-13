import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User, IUser } from "../schemas/userSchema";
import { Request } from "express";

// JWT secret should be in an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Local Strategy (username/password)
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email: string, password: string, done: Function) => {
      try {
        const user = await User.findOne({ email });

        // No user found with that email
        if (!user) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload: { id: string }, done: Function) => {
      try {
        const user = await User.findById(jwtPayload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: IUser, done: Function) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: Function) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;

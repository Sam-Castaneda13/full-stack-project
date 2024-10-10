/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

const app = express();
app.use(express.json());

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    console.log(req.body);
    const { notes, photoUrl } = req.body;
    const sql = `
    insert into "posts" ("notes", "photoUrl", "userId")
    values ($1, $2, $3)
    returning *;
    `;
    const params = [notes, photoUrl, req.user?.userId];
    const results = await db.query(sql, params);
    const create = results.rows[0];
    if (!create) throw new ClientError(404, `Could not create entry`);
    res.json(create);
  } catch (err) {
    next(err);
  }
});

app.get('/api/posts', async (req, res, next) => {
  try {
    const sql = `
    select "posts".*, "username", "image" from "posts"
    join "users" using ("userId")
    `;

    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/posts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!Number.isInteger(+postId)) {
      throw new ClientError(400, 'postId must be an integer');
    }
    const sql = `
      select *
      from "posts"
      where "postId" = $1;
    `;
    const result = await db.query(sql, [postId]);
    const post = result.rows[0];
    if (!post) throw new ClientError(404, `Post ${postId} not Found`);
    res.json(post);
  } catch (err) {
    next(err);
  }
});

app.put('/api/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { notes, photoUrl } = req.body;
    if (!Number.isInteger(+postId)) {
      throw new ClientError(400, 'postId must be an integer');
    }
    if (notes === undefined || photoUrl === undefined) {
      throw new ClientError(400, 'Notes and PhotoUrl are required');
    }

    const sql = `
  update "posts"
  set "notes" = $1,
      "photoUrl" = $2,
      "userId" = $3
  where "postId" = $4
  returning *;
  `;

    const results = await db.query(sql, [
      notes,
      photoUrl,
      req.user?.userId,
      postId,
    ]);
    const update = results.rows[0];
    if (!update) throw new ClientError(404, `post ${postId} not Found`);
    res.json(update);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    delete
    from "posts"
    where "postId" = $1 and "userId" = $2
    returning *
    `;
    const result = await db.query(sql, [postId, req.user?.userId]);
    const erase = result.rows[0];
    if (!erase) throw new ClientError(404, 'Could not delete post');
    res.json(erase);
  } catch (err) {
    next(err);
  }
});

app.get('/api/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const usersql = `
    select * from "users"
    where "userId" = $1
    `;

    const postsql = `
    select "posts".*, "username", "image" from "posts"
    join "users" using ("userId")
    where "userId" = $1
    `;

    const userQuery = await db.query(usersql, [userId]);
    const user = userQuery.rows[0];
    const postQuery = await db.query(postsql, [userId]);
    const posts = postQuery.rows;
    if (!user) throw new ClientError(404, 'Could not delete post');
    res.json({ user, posts });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password, image } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'username and password are required fields');
    }
    const hashedPassword = await argon2.hash(password);
    const sql = `
      insert into "users" ("username", "hashedPassword", image)
      values ($1, $2, $3)
      returning "userId", "username", "createdAt", "image"
    `;
    const params = [username, hashedPassword, image];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    }
    const sql = `
    select "userId",
           "hashedPassword"
      from "users"
     where "username" = $1
  `;
    const params = [username];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user) {
      throw new ClientError(401, 'invalid login');
    }
    const { userId, hashedPassword } = user;
    if (!(await argon2.verify(hashedPassword, password))) {
      throw new ClientError(401, 'invalid login');
    }
    const payload = { userId, username };
    const token = jwt.sign(payload, hashKey);
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
});
/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.  hh
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});

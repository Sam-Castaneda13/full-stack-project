/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg, { escapeLiteral } from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';
import { useParams } from 'react-router-dom';
import { runInNewContext } from 'vm';

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

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
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
      "photoUrl" = $2
  where "postId" = $4 and "userId" = $3
  returning *;
  `;

    const results = await db.query(sql, [
      notes,
      photoUrl,
      req.user?.userId,
      postId,
    ]);
    const update = results.rows[0];
    if (!update)
      throw new ClientError(401, `post ${postId} not Found or Unauthorized`);
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

app.post('/api/like/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
  insert into "likes" ("liked", "post")
  values ($1, $2)
  `;
    const params = [req.user?.userId, postId];
    const result = await db.query(sql, params);
    const like = result.rows[0];
    res.json(like);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/unlike/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    delete
    from "likes"
    where "post" = $1 and "liked" = $2
    returning *;
  `;
    const params = [postId, req.user?.userId];
    const result = await db.query(sql, params);
    const unlike = result.rows[0];
    res.json(unlike);
  } catch (err) {
    next(err);
  }
});

app.post('/api/dislike/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
  insert into "likes" ("disliked", "post")
  values ($1, $2)
  `;
    const params = [req.user?.userId, postId];
    const result = await db.query(sql, params);
    const dislike = result.rows[0];
    res.json(dislike);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/unDislike/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    delete
    from "likes"
    where "post" = $1 and "disliked" = $2
    returning *;
  `;
    const params = [postId, req.user?.userId];
    const result = await db.query(sql, params);
    const unDislike = result.rows[0];
    res.json(unDislike);
  } catch (err) {
    next(err);
  }
});

app.get('/api/ifLiked/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    select "liked" from "likes"
    where "liked" = $1 and "post" = $2
    `;
    const params = [req.user?.userId, postId];
    const results = await db.query(sql, params);
    const ifLiked = results.rows[0];
    res.json(ifLiked ?? {});
  } catch (err) {
    next(err);
  }
});

app.get('/api/ifDisliked/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    select "disliked" from "likes"
    where "disliked" = $1 and "post" = $2
    `;
    const params = [req.user?.userId, postId];
    const results = await db.query(sql, params);
    const ifDisliked = results.rows[0];
    res.json(ifDisliked ?? {});
  } catch (err) {
    next(err);
  }
});

app.get('/api/countLike/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    select count("liked")
    from "likes"
    where "post" = $1
    `;

    const params = [postId];
    const results = await db.query(sql, params);
    const liked = results.rows[0];

    res.json(liked);
  } catch (err) {
    next(err);
  }
});

app.get('/api/countDislike/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const sql = `
    select count("disliked")
    from "likes"
    where "post" =$1
    `;

    const params = [postId];
    const results = await db.query(sql, params);
    const disliked = results.rows[0];
    res.json(disliked);
  } catch (err) {
    next(err);
  }
});

app.get('/api/comments/:postId', async (req, res, next) => {
  try {
    const { postId } = req.body;
    const sql = `
    select "comments".*, "username", "image" from "comments"
    join "users" using ("userId")
    where "postId" = $1
    `;

    const result = await db.query(sql, [postId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/comments/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { commentText } = req.body;

    const sql = `
    insert into "comments" ("commentText", "userId", "postId" )
    values ($1, $2, $3)
    returning *;
    `;

    const params = [commentText, req.user?.userId, postId];
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
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
           "hashedPassword",
           "image"
      from "users"
     where "username" = $1
  `;
    const params = [username];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user) {
      throw new ClientError(401, 'invalid login');
    }
    const { userId, hashedPassword, image } = user;
    if (!(await argon2.verify(hashedPassword, password))) {
      throw new ClientError(401, 'invalid login');
    }
    const payload = { userId, username, image };
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

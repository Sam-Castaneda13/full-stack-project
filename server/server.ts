/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.post('/api/posts', async (req, res, next) => {
  try {
    const { notes, photoUrl } = req.body;
    const sql = `
    insert into "posts" ("notes", "photoUrl")
    values ($1, $2)
    returning *;
    `;
    const params = [notes, photoUrl];
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
    select * from "posts"
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

app.put('/api/posts/:postId', async (req, res, next) => {
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
  where "postId" = $3
  returning *;
  `;

    const results = await db.query(sql, [notes, photoUrl, postId]);
    const update = results.rows[0];
    if (!update) throw new ClientError(404, `post ${postId} not Found`);
    res.json(update);
  } catch (err) {
    next(err);
  }
});

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});

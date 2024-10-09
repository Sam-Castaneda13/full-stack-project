import { User } from './UserContent';

export type Post = {
  postId?: number;
  userId?: number;
  notes: string;
  photoUrl: string;
  createdAt?: string;
  edited: false;
  username?: string;
  image?: string;
};

const authKey = 'um.auth';

type Auth = {
  user: User;
  token: string;
};

export async function readPosts(): Promise<Post[]> {
  const response = await fetch('/api/posts');
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const posts = await response.json();
  return posts;
}

export async function addPost(entry: Post): Promise<Post> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const newPost = await response.json();
  return newPost;
}

export async function readPost(postId: number): Promise<Post | undefined> {
  const response = await fetch(`/api/posts/${postId}`);
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const post = await response.json();
  return post;
}

export async function updatePost(post: Post): Promise<Post> {
  const response = await fetch(`/api/posts/${post.postId}`, {
    method: 'PUT',
    body: JSON.stringify(post),
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const updatedPost = await response.json();
  return updatedPost;
}

export async function deletePost(postId: number): Promise<void> {
  const response = await fetch(`/api/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${readToken()}`,
    },
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
}

export async function addAccount(user: User): Promise<User> {
  const response = await fetch('/api/auth/sign-up', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const newAccount = await response.json();
  return newAccount;
}

export function saveAuth(user: User, token: string): void {
  const auth: Auth = { user, token };
  localStorage.setItem(authKey, JSON.stringify(auth));
}

export function removeAuth(): void {
  localStorage.removeItem(authKey);
}

export function readUser(): User | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).user;
}

export function readToken(): string | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).token;
}

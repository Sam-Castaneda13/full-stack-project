export type Post = {
  postId?: number;
  userId?: number;
  notes: string;
  photoUrl: string;
  createdAt?: string;
  edited: false;
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
    headers: { 'content-type': 'application/json' },
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
    headers: { 'content-type': 'application/json' },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const updatedPost = await response.json();
  return updatedPost;
}

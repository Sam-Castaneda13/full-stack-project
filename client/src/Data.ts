export type Post = {
  postId?: number;
  userId?: number;
  notes: string;
  photoUrl: string;
};

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

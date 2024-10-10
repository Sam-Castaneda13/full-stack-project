import { FormEvent, useEffect, useState } from 'react';
import { type Post, addPost, deletePost, readPost, updatePost } from './Data';
import { useNavigate, useParams } from 'react-router-dom';

export function PostCreation() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post>();
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isEditing = postId && postId !== 'new';

  useEffect(() => {
    async function load(id: number) {
      setIsLoading(true);
      try {
        const post = await readPost(id);
        if (!post) throw new Error(`Post with ID ${id} not found`);
        setPost(post);
        setPhotoUrl(post.photoUrl);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isEditing) load(+postId);
  }, [isEditing, postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newPost = Object.fromEntries(formData) as unknown as Post;
      if (isEditing) {
        await updatePost({ ...post, ...newPost });
      } else {
        await addPost(newPost);
      }
      navigate('/');
    } catch (err) {
      console.log(err);
      alert(String(err));
    }
  }

  function handleDelete() {
    if (!post?.postId) throw new Error(`If you see this well thats bad`);
    deletePost(post.postId);
    navigate('/');
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        Error Loading Post ID {postId}:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit}>
        <div className="create-image">
          <h1>Create Post</h1>

          <div>
            <label htmlFor="photoUrl">Upload Image/Video (not required)</label>
            <br />
            <input
              id="photoUrl"
              name="photoUrl"
              className="photo-url"
              defaultValue={post?.photoUrl ?? ''}
              type="text"
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>
        </div>
        <div>
          <img
            src={photoUrl || '/images/placeholder-image.jpg'}
            className="image-post-create"
          />
        </div>
        <div className="create-text">
          <label htmlFor="notes">Enter text (required)</label>
          <br />
          <textarea
            id="notes"
            name="notes"
            className="text"
            defaultValue={post?.notes ?? ''}
            required
          />
        </div>
        <div className="button-row">
          {' '}
          {isEditing && (
            <button type="button" onClick={() => setIsDeleting(true)}>
              Delete Entry
            </button>
          )}
          {!isEditing && (
            <button type="button" onClick={() => navigate('/')}>
              Cancel
            </button>
          )}
          {isDeleting && (
            <div className="modal-container">
              <div className="modal-row">
                <p>Are you sure you want to delete this Post</p>
              </div>
              <div>
                <button
                  className="modal-button"
                  onClick={() => setIsDeleting(false)}>
                  Cancel
                </button>
                <button className="modal-button" onClick={handleDelete}>
                  Confirm
                </button>
              </div>
            </div>
          )}
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
}

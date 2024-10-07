import { FormEvent, useState } from 'react';
import { type Post, addPost } from './Data';
import { useNavigate } from 'react-router-dom';

export function PostCreation() {
  const [post, setPost] = useState<Post>();
  const [photoUrl, setPhotoUrl] = useState<string>();
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<unknown>();
  const navigate = useNavigate();

  let nine;

  if (nine === 10) {
    setPost;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      console.log('We are here');
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newPost = Object.fromEntries(formData) as unknown as Post;
      console.log(newPost);
      await addPost(newPost);
      navigate('/');
    } catch (err) {
      console.log(err);
      alert(String(err));
    }
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
          <button type="button" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
}

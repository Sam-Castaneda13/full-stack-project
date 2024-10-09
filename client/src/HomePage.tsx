import { useEffect, useState } from 'react';
import { FaCommentAlt } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { MdOutlineHeartBroken } from 'react-icons/md';
import { Post, readPosts } from './Data';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    async function load() {
      try {
        const posts = await readPosts();
        setPosts(posts);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        Error Loading Posts:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }
  return (
    <>
      <div className="container">
        <div className="posts">
          <div className="homepage">
            <ul className="list-posts">
              {posts?.map((post) => (
                <PostDetails key={post.postId} posts={post} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

type PostProps = {
  posts: Post;
};

function PostDetails({ posts }: PostProps) {
  return (
    <>
      <li>
        <div className="homepage">
          <img
            src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
            className="user-profile-post"
          />
          <h4 className="user-name-post">{posts.username}</h4>
          <div>
            <Link to={`/post/${posts.postId}`}>
              <button className="edit-button">Edit</button>
            </Link>
            <p className="time-date">{posts.createdAt}</p>
          </div>
        </div>
        <div className="post-inputs">
          <img src={posts.photoUrl} className="post-image" />
          <h3 className="post-text">{posts.notes}</h3>
        </div>
        <div className="likes-options">
          <div>
            <FaHeart />
          </div>
          <div className="dislike">
            <MdOutlineHeartBroken />
          </div>
          <div className="comment">
            <FaCommentAlt />
          </div>
        </div>
      </li>
    </>
  );
}

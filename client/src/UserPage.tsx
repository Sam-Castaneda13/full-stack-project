import { useEffect, useState } from 'react';
import { FaCommentAlt, FaHeart } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { User } from './UserContent';
import {
  checkIfDisliked,
  checkIfLiked,
  dislikePost,
  likePost,
  Post,
  readUserPage,
  unDislikePost,
  unlikePost,
} from './Data';
import { useUser } from './useUser';
import { MdHeartBroken } from 'react-icons/md';

export function UserPage() {
  const { userId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const isUser = userId;

  useEffect(() => {
    async function loadUser(id: number) {
      setIsLoading(true);
      try {
        const { user, posts } = await readUserPage(id);
        if (!user) throw new Error(`User with ID ${id} not found`);
        setUser(user);
        setPosts(posts);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isUser) loadUser(+userId);
  }, [isUser, userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        Error Loading User ID {userId}:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="user-page-top">
          <div className="user-row">
            <div></div>
            <div className="column-one-fourth">
              <img src={user?.image} className="user-profile-page" />
            </div>
            <div className="user-name-page">
              <h2>{user?.username}</h2>
            </div>
            <div className="column-one-fourth">
              <div>1</div>
              <div>Posts</div>
            </div>
            <div className="column-one-fourth">
              <div>500</div>
              <div>Followers</div>
            </div>
            <div className="column-one-fourth">
              <div>0</div>
              <div>Following</div>
            </div>
          </div>
          <div className="user-row">
            <div>
              <button type="button">View Posts</button>
            </div>
            <div>
              <button type="button">Edit Profile</button>
            </div>
          </div>
        </div>
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
  const { user } = useUser();
  const [like, setLike] = useState('');
  const [dislike, setDisLike] = useState('');

  useEffect(() => {
    async function load(id: number) {
      try {
        const ifLiked = await checkIfLiked(id);
        if (ifLiked.liked === user?.userId) {
          setLike('liked');
        }
        const ifDisliked = await checkIfDisliked(id);
        if (ifDisliked.disliked === user?.userId) {
          setDisLike('disliked');
        }
      } catch (err) {
        console.log(err);
      }
    }
    load(posts.postId);
  }, [posts.postId, user?.userId]);

  async function handleLikeClick(id: number) {
    try {
      if (like === '') {
        await likePost(id);
        setLike('liked');
        if (dislike === 'disliked') {
          await unDislikePost(id);
          setDisLike('');
        }
        return;
      } else if (like === 'liked') {
        await unlikePost(id);
        setLike('');
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDisLikeClick(id: number) {
    try {
      if (dislike === '') {
        await dislikePost(id);
        setDisLike('disliked');
        if (like === 'liked') {
          await unlikePost(id);
          setLike('');
        }
        return;
      } else if (dislike === 'disliked') {
        await unDislikePost(id);
        setDisLike('');
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <li>
        <div className="homepage">
          <Link to={`/user/${posts.userId}`}>
            <img src={posts.image} className="user-profile-post" />
            <h4 className="user-name-post">{posts.username}</h4>
          </Link>
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
          <div className={like} onClick={() => handleLikeClick(posts.postId)}>
            <FaHeart />
          </div>
          <div
            className={dislike}
            onClick={() => handleDisLikeClick(posts.postId)}>
            <MdHeartBroken />
          </div>
          <div className="comment">
            <FaCommentAlt />
          </div>
        </div>
      </li>
    </>
  );
}

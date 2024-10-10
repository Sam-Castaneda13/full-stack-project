import { FormEvent, useEffect, useState } from 'react';
import { FaCommentAlt } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { MdHeartBroken } from 'react-icons/md';
import {
  checkIfDisliked,
  checkIfLiked,
  countDislikes,
  countLikes,
  dislikePost,
  likePost,
  Post,
  readPosts,
  unDislikePost,
  unlikePost,
  Comment,
  readComments,
  addComment,
} from './Data';
import { Link } from 'react-router-dom';
import { useUser } from './useUser';

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
  const { user } = useUser();
  const [comment, setComment] = useState<Comment[]>();
  const [showComments, setShowComments] = useState('hidden');
  const [countLike, setCountLike] = useState(0);
  const [countDislike, setCountDislike] = useState(0);
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
        const likes = await countLikes(id);
        const disliked = await countDislikes(id);
        setCountDislike(disliked.count);
        setCountLike(likes.count);

        const comment = await readComments(id);
        setComment(comment);
      } catch (err) {
        alert(err);
        console.log(err);
      }
    }
    load(posts.postId);
  }, [posts.postId, user?.userId]);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newComment = Object.fromEntries(formData) as unknown as Comment;
      await addComment(newComment, posts.postId);
    } catch (err) {
      alert(err);
      console.log(err);
    }
  }

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
    } finally {
      const likes = await countLikes(id);
      const disliked = await countDislikes(id);
      setCountDislike(disliked.count);
      setCountLike(likes.count);
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
    } finally {
      const likes = await countLikes(id);
      const disliked = await countDislikes(id);
      setCountDislike(disliked.count);
      setCountLike(likes.count);
    }
  }

  function handleCommentClick() {
    if (showComments === 'hidden') {
      setShowComments('');
    } else if (showComments === '') {
      setShowComments('hidden');
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
            {`${countLike}`}
          </div>
          <div
            className={dislike}
            onClick={() => handleDisLikeClick(posts.postId)}>
            <MdHeartBroken />
            {`${countDislike}`}
          </div>
          <div className="comment" onClick={handleCommentClick}>
            <FaCommentAlt />
          </div>
        </div>

        <div className={showComments}>
          <div>
            <form onSubmit={handleCommentSubmit}>
              <div>
                <label htmlFor="commentText">Comment</label>
              </div>
              <input
                id="commentText"
                name="commentText"
                type="text"
                placeholder="Enter your Comment"
                required
              />
              <button type="submit">Comment</button>
            </form>
          </div>
          <ul>
            {comment?.map((com) => (
              <CommentList key={com.commentId} comments={com} />
            ))}
          </ul>
        </div>
      </li>
    </>
  );
}

type CommentProps = {
  comments: Comment;
};
function CommentList({ comments }: CommentProps) {
  return (
    <li>
      <div className="comment-box">
        <div className="comment-profile">
          <img src={comments.image} className="comment-picture" />
          <p>{comments.username}</p>
        </div>
        <div className="comment-text">
          <p>{comments.commentText}</p>
        </div>
      </div>
    </li>
  );
}

import { FaCommentAlt } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa6';
import { MdOutlineHeartBroken } from 'react-icons/md';

export function UserPage() {
  return (
    <>
      <div className="container">
        <div className="user-page-top">
          <div className="user-row">
            <div></div>
            <div className="column-one-fourth">
              <img
                src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
                className="user-profile-page"
              />
            </div>
            <div className="user-name-page">
              <h2>Voldemort</h2>
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
            <img
              src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
              className="user-profile-post"
            />
            <h4 className="user-name-post">Voldemort</h4>
            <p className="time-date">9:12 PM, 9/9/97</p>
          </div>
          <div className="post-inputs">
            <img
              src="https://cdn.images.express.co.uk/img/dynamic/36/590x/secondary/harrydeath-646276.jpg"
              className="post-image"
            />
            <h3 className="post-text">
              I finally got the silly boy who lived!! HAHAHAHHAHAHAHAH It is my
              time to rule and show true bloods are supreme
            </h3>
          </div>
          <div className="likes-options">
            <div>
              <FaRegHeart />
            </div>
            <div>
              <MdOutlineHeartBroken />
            </div>
            <div>
              <FaCommentAlt />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

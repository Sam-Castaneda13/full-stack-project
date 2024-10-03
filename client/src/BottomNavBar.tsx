import { FaHouse } from 'react-icons/fa6';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { Link } from 'react-router-dom';

export function BottomNavBar() {
  return (
    <>
      <div className="bot-nav-row bot-sticky">
        <div className="home-button">
          <Link to="/">
            <FaHouse />
          </Link>
        </div>
        <div className="post-button">
          <IoIosAddCircleOutline />
        </div>
        <Link to="/user">
          <img
            src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
            className="user-photo-home-phone"
          />
        </Link>
      </div>
    </>
  );
}

import { IoReorderThree } from 'react-icons/io5';
import { FaHouse } from 'react-icons/fa6';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { CiLogin } from 'react-icons/ci';
import { CiSettings } from 'react-icons/ci';
import { Link, Outlet } from 'react-router-dom';
export function NavBar() {
  return (
    <>
      <div className="nav-row">
        <a className="website">GamerPage</a>
        <a className="title">HomePage</a>
        <a className="column-one-third">
          <img
            src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
            className="user-photo-home"
          />
        </a>
        <div className="side-options">
          <IoReorderThree />
        </div>
      </div>
      <div className="side-nav">
        <div>
          <a>Gamer Page</a>
        </div>
        <div>
          <CiLogin /> Login/Sign Up
        </div>
        <div>
          <Link to="/">
            <FaHouse /> Home
          </Link>
        </div>
        <div>
          <Link to="/user">
            <img
              src="https://static.wikia.nocookie.net/nondisney/images/f/fa/Lord_Voldemort_image.jpeg"
              className="user-photo-side"
            />
            User Page
          </Link>
        </div>
        <div>
          <IoIosAddCircleOutline /> Create Post
        </div>
        <div>
          <CiSettings /> Settings
        </div>
      </div>
      <Outlet />
    </>
  );
}

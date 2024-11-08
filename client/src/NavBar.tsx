import { IoReorderThree } from 'react-icons/io5';
import { FaHouse } from 'react-icons/fa6';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { CiLogin } from 'react-icons/ci';
import { CiSettings } from 'react-icons/ci';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useUser } from './useUser';
export function NavBar() {
  const { user } = useUser();
  const navigate = useNavigate();
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
        <div onClick={() => navigate('/sign-up')}>
          <CiLogin /> Login/Sign Up
        </div>
        <div onClick={() => navigate('/')}>
          <FaHouse /> Home
        </div>
        <div onClick={() => navigate(`/user/${user?.userId}`)}>
          <FaUser />
          User Page
        </div>
        <div onClick={() => navigate('/post/new')}>
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

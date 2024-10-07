// import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { BottomNavBar } from './BottomNavBar';
import { HomePage } from './HomePage';
import { NavBar } from './NavBar';
import { UserPage } from './UserPage';
import { PostCreation } from './PostCreation';

export default function App() {
  // const [serverData, setServerData] = useState('');

  // useEffect(() => {
  //   async function readServerData() {
  //     const resp = await fetch('/api/hello');
  //     const data = await resp.json();

  //     console.log('Data from server:', data);

  //     setServerData(data.message);
  //   }

  //   readServerData();
  // }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <BottomNavBar />
            </>
          }>
          <Route index element={<HomePage />} />
          <Route path="user" element={<UserPage />} />
          <Route path="/post/:postId" element={<PostCreation />} />
        </Route>
      </Routes>

      {/* <h1>{serverData}</h1> */}
    </>
  );
}

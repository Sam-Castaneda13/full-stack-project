// import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { BottomNavBar } from './BottomNavBar';
import { HomePage } from './HomePage';
import { NavBar } from './NavBar';
import { UserPage } from './UserPage';
import { PostCreation } from './PostCreation';
import { SignUpPage } from './SignUpPage';
import { SignInPage } from './SignInPage';
import { UserProvider } from './UserContent';

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
    <UserProvider>
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
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/post/:postId" element={<PostCreation />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
        </Route>
      </Routes>
      {/* <h1>{serverData}</h1> */}
    </UserProvider>
  );
}

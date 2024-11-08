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
    </UserProvider>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { User, useUser } from './useUser';
import { FormEvent, useState } from 'react';

type AuthData = {
  user: User;
  token: string;
};

export function SignInPage() {
  const { handleSignIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/sign-in', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const { user, token } = (await res.json()) as AuthData;
      handleSignIn(user, token);
      console.log('Signed In', user);
      console.log('Received token:', token);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        Error Loading SignUp page:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }
  return (
    <div className="container">
      <div className="form-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              id="username"
              name="username"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn">
            Sign In
          </button>
        </form>

        <div className="extra-links">
          <p className="signup-link">
            Don't have an account? <Link to="/sign-up">Sign up here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

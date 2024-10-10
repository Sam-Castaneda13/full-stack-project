import { Link, useNavigate } from 'react-router-dom';
import { addAccount } from './Data';
import { User } from './UserContent';
import { FormEvent, useState } from 'react';

export function SignUpPage() {
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      setIsLoading(true);
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newAccount = Object.fromEntries(formData) as unknown as User;
      await addAccount(newAccount);
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
    <div className="container-sign-up">
      <div className="form-box">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">UserName</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your Username"
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

          <div className="input-group">
            <label htmlFor="image">User Profile</label>
            <input
              type="text"
              id="image"
              name="image"
              placeholder="Enter your Profile Picture"
              required
            />
          </div>

          <button type="submit" className="btn">
            Sign Up
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/sign-in">Login here.</Link>
        </p>
      </div>
    </div>
  );
}

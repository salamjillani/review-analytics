import { Link } from 'react-router-dom';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Delivery Analytics</Link>
        <div className="collapse navbar-collapse">
          <div className="navbar-nav ms-auto">
            {!user.token && (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link className="nav-link" to="/users">Manage Users</Link>
            )}
            {user.token && (
              <button 
                className="nav-link btn btn-link" 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location = '/login';
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
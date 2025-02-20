
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Users from "./components/Users";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full">
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <div className="fade-in">
                      <Dashboard />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <div className="fade-in">
                    <Login />
                  </div>
                }
              />
              <Route
                path="/register"
                element={
                  <div className="fade-in">
                    <Register />
                  </div>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <div className="fade-in">
                      <Users />
                    </div>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>

      
        <footer className="mt-auto py-6 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Delivery Agent Review Analytics. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Router>
  );
}

export default App;

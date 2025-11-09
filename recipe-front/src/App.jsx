import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserRecipes from "./pages/UserRecipes";
import Recipe from "./pages/Recipe";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import UpdateRecipe from "./pages/UpdateRecipe";
import NotFound from "./pages/NotFound";
import AuthProtectedRoute from "./components/AuthProtectedRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/recipe" element={<Recipe />} /> {/* presumably unused */}
        <Route path="/recipe/:id" element={<Recipe />} />
        
        {/* Guest-only routes - redirect to home if authenticated */}
        <Route 
          path="/register" 
          element={
            <GuestOnlyRoute>
              <Register />
            </GuestOnlyRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/user-recipes" 
          element={
            <AuthProtectedRoute>
              <UserRecipes />
            </AuthProtectedRoute>
          } 
        />
        <Route 
          path="/recipe/new" 
          element={
            <AuthProtectedRoute>
              <CreateRecipe />
            </AuthProtectedRoute>
          } 
        />
        <Route 
          path="/recipe/:id/edit" 
          element={
            <AuthProtectedRoute>
              <EditRecipe />
            </AuthProtectedRoute>
          } 
        />
        {/* Legacy routes for backward compatibility */}
        <Route 
          path="/create-recipe" 
          element={
            <AuthProtectedRoute>
              <CreateRecipe />
            </AuthProtectedRoute>
          } 
        />
        <Route 
          path="/update-recipe" 
          element={
            <AuthProtectedRoute>
              <UpdateRecipe />
            </AuthProtectedRoute>
          } 
        />
        <Route 
          path="/update-recipe/:id" 
          element={
            <AuthProtectedRoute>
              <UpdateRecipe />
            </AuthProtectedRoute>
          } 
        />

        {/* Fallback route */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;


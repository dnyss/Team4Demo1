import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserRecipes from "./pages/UserRecipes";
import Recipe from "./pages/Recipe";
import CreateRecipe from "./pages/CreateRecipe";
import UpdateRecipe from "./pages/UpdateRecipe";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/user-recipes" element={<UserRecipes />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/update-recipe" element={<UpdateRecipe />} />

        {/* Optional: fallback route */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
}

export default App;

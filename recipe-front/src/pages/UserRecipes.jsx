import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const UserRecipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock user recipe data
  const [userRecipes, setUserRecipes] = useState([
    {
      id: 1,
      title: "My Secret Chocolate Chip Cookies",
      description: "Soft and chewy chocolate chip cookies that are perfect for any occasion. Ready in just 30 minutes!",
      isOwner: true
    },
    {
      id: 2,
      title: "Grandma's Vegetable Stir Fry",
      description: "A quick and healthy vegetable stir fry with a savory sauce. Packed with fresh vegetables and flavor.",
      isOwner: true
    },
    {
      id: 3,
      title: "Homemade Creamy Tomato Soup",
      description: "Comforting homemade tomato soup with a creamy texture. Perfect for chilly days and pairs well with grilled cheese.",
      isOwner: true
    }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching user recipes for:', searchTerm);
  };

  const handleEditRedirect = () => {
    navigate('/user-recipes');
  };

  const handleDeleteRecipe = (recipeId) => {
    console.log('Deleting recipe with ID:', recipeId);
    // In the future, this will show confirmation modal and then delete
    // For now, just remove from state for UI demonstration
    //setUserRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            My Recipes
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your personal recipe collection. Edit, delete, or create new recipes to share with the community.
          </p>

          <div className="flex justify-center space-x-4 mb-8">
            <Link
              to="/create-recipe"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200"
            >
              Create New Recipe
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search through your recipes..."
                className="flex-grow px-6 py-4 border-none focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-orange-500 text-white px-8 py-4 hover:bg-orange-600 transition duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* User Recipes Section */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Recipe Collection ({userRecipes.length})</h3>

          {userRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="mdi:chef-hat" className="text-6xl text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No recipes yet</h4>
              <p className="text-gray-500 mb-6">Start by creating your first recipe!</p>
              <Link
                to="/create-recipe"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200"
              >
                Create Your First Recipe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                >
                  {/* Recipe Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                    <span className="text-gray-500">Recipe Image</span>
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">
                      Your Recipe
                    </div>
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Link
                        to="/update-recipe"
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-200 shadow-lg"
                        title="Edit Recipe"
                      >
                        <Icon icon="mdi:pencil" width="18" height="18" />
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 shadow-lg"
                        title="Delete Recipe"
                      >
                        <Icon icon="mdi:trash-can" width="18" height="18" />
                      </button>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 pr-12">
                      {recipe.title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {recipe.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <button className="text-orange-500 font-semibold hover:text-orange-600 transition duration-200">
                        View Recipe →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UserRecipes;

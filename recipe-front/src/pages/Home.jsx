import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useRecipesStore from '../store/recipesStore';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { recipes, loading, error, searchQuery, fetchAllRecipes, searchRecipes, clearSearch } = useRecipesStore();

  // Fetch all recipes on component mount
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Debounced search - wait 300ms after user stops typing
  useEffect(() => {
    if (searchTerm === '') {
      // If search is cleared, fetch all recipes
      clearSearch();
      return;
    }

    const debounceTimer = setTimeout(() => {
      searchRecipes(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchRecipes, clearSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchRecipes(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Discover Amazing Recipes
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Find your next favorite meal from our collection of delicious recipes crafted by home cooks and professional chefs.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search for recipes, ingredients, or chefs..."
                className="flex-grow px-6 py-4 border-none focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-orange-500 text-white px-8 py-4 hover:bg-orange-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-6 py-4 hover:bg-gray-600 transition duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
          
          {searchQuery && (
            <p className="mt-4 text-gray-600">
              Showing results for: <span className="font-semibold">{searchQuery}</span>
            </p>
          )}
        </section>

        {/* Featured/Search Results Section */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Recipe Image</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {recipe.title}
                    </h4>
                    <p className="text-gray-600">
                      {recipe.description}
                    </p>
                    <Link 
                      to={`/recipe/${recipe.id}`}
                      className="mt-4 inline-block text-orange-500 font-semibold hover:text-orange-600 transition duration-200"
                    >
                      View Recipe →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-12">
                No recipes found.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
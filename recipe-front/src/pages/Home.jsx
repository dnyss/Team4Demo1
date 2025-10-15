import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock recipe data
  const mockRecipes = [
    {
      id: 1,
      title: "Classic Chocolate Chip Cookies",
      description: "Soft and chewy chocolate chip cookies that are perfect for any occasion. Ready in just 30 minutes!"
    },
    {
      id: 2,
      title: "Vegetable Stir Fry",
      description: "A quick and healthy vegetable stir fry with a savory sauce. Packed with fresh vegetables and flavor."
    },
    {
      id: 3,
      title: "Creamy Tomato Soup",
      description: "Comforting homemade tomato soup with a creamy texture. Perfect for chilly days and pairs well with grilled cheese."
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
    // In the future, this will trigger an actual search
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

        {/* Featured Recipes Section */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRecipes.map((recipe) => (
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
                  <button className="mt-4 text-orange-500 font-semibold hover:text-orange-600 transition duration-200">
                    View Recipe →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
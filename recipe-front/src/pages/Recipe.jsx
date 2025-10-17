import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommentBox from '../components/CommentBox';
import useRecipesStore from '../store/recipesStore';

const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRecipe, currentRecipeLoading, currentRecipeError, fetchRecipeById, clearCurrentRecipe } = useRecipesStore();

  useEffect(() => {
    if (id) {
      fetchRecipeById(id);
    }
    
    // Cleanup on unmount
    return () => {
      clearCurrentRecipe();
    };
  }, [id, fetchRecipeById, clearCurrentRecipe]);

  // Helper function to parse ingredients/instructions from string to array
  const parseToArray = (text) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    // Split by newline, comma, or semicolon
    return text.split(/[\n,;]+/).map(item => item.trim()).filter(item => item.length > 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Go Back Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-orange-500 hover:text-orange-600 transition duration-200"
              >
                <Icon icon="mdi:arrow-left" className="mr-2" />
                Back to Recipes
              </button>
            </div>

            {/* Loading State */}
            {currentRecipeLoading && (
              <div className="bg-white rounded-lg shadow-lg p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading recipe details...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {currentRecipeError && !currentRecipeLoading && (
              <div className="bg-white rounded-lg shadow-lg p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Icon icon="mdi:alert-circle-outline" className="text-red-500 text-6xl mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe Not Found</h2>
                  <p className="text-gray-600 mb-6">{currentRecipeError}</p>
                  <Link
                    to="/"
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            )}

            {/* Recipe Content */}
            {currentRecipe && !currentRecipeLoading && !currentRecipeError && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Recipe Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8">
                  <h1 className="text-4xl font-bold mb-4">{currentRecipe.title}</h1>
                  
                  {/* Author Info */}
                  {currentRecipe.user_name && (
                    <div className="mb-4 flex items-center">
                      <Icon icon="mdi:account-circle" className="mr-2 text-2xl" />
                      <span className="text-lg">by <span className="font-semibold">{currentRecipe.user_name}</span></span>
                    </div>
                  )}
                  
                  {/* Dish Type Badge */}
                  {currentRecipe.dish_type && (
                    <div className="mb-4">
                      <span className="inline-block bg-white bg-opacity-20 text-orange-500 text-sm px-4 py-1 rounded-full">
                        {currentRecipe.dish_type}
                      </span>
                    </div>
                  )}
                  
                  {/* Recipe Meta Information */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {currentRecipe.preparation_time && (
                      <div className="flex items-center">
                        <Icon icon="mdi:clock-outline" className="mr-2 text-xl" />
                        <div>
                          <div className="font-semibold">Prep Time</div>
                          <div>{currentRecipe.preparation_time}</div>
                        </div>
                      </div>
                    )}
                    {currentRecipe.servings && (
                      <div className="flex items-center">
                        <Icon icon="mdi:account-group" className="mr-2 text-xl" />
                        <div>
                          <div className="font-semibold">Servings</div>
                          <div>{currentRecipe.servings}</div>
                        </div>
                      </div>
                    )}
                    {currentRecipe.origin && (
                      <div className="flex items-center">
                        <Icon icon="mdi:map-marker" className="mr-2 text-xl" />
                        <div>
                          <div className="font-semibold">Origin</div>
                          <div>{currentRecipe.origin}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-2">
                      <div className="bg-orange-50 rounded-lg p-6 sticky top-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                          <Icon icon="mdi:shopping-cart" className="mr-2 text-orange-500" />
                          Ingredients
                        </h2>
                        <ul className="space-y-3">
                          {parseToArray(currentRecipe.ingredients).map((ingredient, index) => (
                            <li key={index} className="flex items-start">
                              <Icon icon="mdi:circle-small" className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="lg:col-span-2">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <Icon icon="mdi:chef-hat" className="mr-2 text-orange-500" />
                        Preparation Steps
                      </h2>
                      <div className="space-y-6">
                        {parseToArray(currentRecipe.instructions).map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {currentRecipe && !currentRecipeLoading && !currentRecipeError && (
              <CommentBox recipeId={currentRecipe.id} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Recipe;
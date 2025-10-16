import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const CreateRecipe = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating new recipe:', formData);
    
    // In the future, this will make an API call
    console.log('Recipe data to be saved:', {
      title: formData.title,
      description: formData.description,
      ingredients: formData.ingredients.split('\n').filter(ing => ing.trim()),
      steps: formData.steps.split('\n').filter(step => step.trim())
    });
    
    // Reset form after submission
    setFormData({
      title: '',
      description: '',
      ingredients: '',
      steps: ''
    });
    
    alert('Recipe created successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Create New Recipe
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter recipe title (e.g., Classic Chocolate Chip Cookies)"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  placeholder="Describe your recipe (e.g., Soft and chewy cookies perfect for any occasion)"
                  required
                />
              </div>

              {/* Ingredients Field */}
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients *
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm"
                  placeholder="List each ingredient on a new line:
- 2 cups all-purpose flour
- 1 cup chocolate chips
- 1/2 cup butter
..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter each ingredient on a separate line. Use "-" or numbers for lists.</p>
              </div>

              {/* Steps Field */}
              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Steps *
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  value={formData.steps}
                  onChange={handleChange}
                  rows="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm"
                  placeholder="List each step on a new line:
1. Preheat oven to 350°F (175°C)
2. Mix dry ingredients in a bowl
3. Cream butter and sugar together
..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter each step on a separate line. Use numbers for ordered steps.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Link
                  to="/my-recipes"
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg text-center hover:bg-gray-600 transition duration-200"
                >
                  Go Back
                </Link>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
                >
                  Create Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateRecipe;
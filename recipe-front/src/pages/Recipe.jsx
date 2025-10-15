import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Recipe = () => {
  const { recipeId } = useParams();

  // Mock recipe data - in real app, this would come from API based on recipeId
  const mockRecipe = {
    id: recipeId || 1,
    title: "Grandma's Secret Chocolate Chip Cookies",
    description: "These are the most amazing, soft, and chewy chocolate chip cookies you'll ever taste! This family recipe has been passed down for generations and is guaranteed to become your new favorite. Perfect for holidays, parties, or just a cozy night in.",
    prepTime: "15 mins",
    cookTime: "10 mins",
    totalTime: "25 mins",
    servings: "24 cookies",
    ingredients: [
      "2 ¼ cups all-purpose flour",
      "1 teaspoon baking soda",
      "1 teaspoon salt",
      "1 cup unsalted butter, softened",
      "¾ cup granulated sugar",
      "¾ cup packed brown sugar",
      "2 large eggs",
      "2 teaspoons vanilla extract",
      "2 cups semi-sweet chocolate chips",
      "1 cup chopped walnuts (optional)"
    ],
    steps: [
      "Preheat your oven to 375°F (190°C). Line baking sheets with parchment paper.",
      "In a medium bowl, whisk together the flour, baking soda, and salt. Set aside.",
      "In a large bowl, using an electric mixer, cream together the softened butter, granulated sugar, and brown sugar until light and fluffy (about 2-3 minutes).",
      "Beat in the eggs one at a time, then mix in the vanilla extract.",
      "Gradually add the flour mixture to the wet ingredients, mixing on low speed until just combined. Be careful not to overmix.",
      "Fold in the chocolate chips and walnuts (if using) with a spatula until evenly distributed throughout the dough.",
      "Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them about 2 inches apart.",
      "Bake for 9-11 minutes, or until the edges are lightly golden but the centers still look soft.",
      "Remove from oven and let the cookies cool on the baking sheet for 5 minutes before transferring them to a wire rack to cool completely.",
      "Repeat with remaining dough. Store in an airtight container at room temperature for up to 1 week."
    ],
    notes: "For extra chewy cookies, chill the dough for 30 minutes before baking. You can also freeze the dough balls and bake from frozen, adding 1-2 minutes to the baking time."
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Go Back Button - Now inside the same max-w container */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 transition duration-200"
              >
                <Icon icon="mdi:arrow-left" className="mr-2" />
                Back to Recipes
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Recipe Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8">
                <h1 className="text-4xl font-bold mb-4">{mockRecipe.title}</h1>
                <p className="text-orange-100 text-lg mb-6">{mockRecipe.description}</p>
                
                {/* Recipe Meta Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Icon icon="mdi:clock-outline" className="mr-2 text-xl" />
                    <div>
                      <div className="font-semibold">Prep Time</div>
                      <div>{mockRecipe.prepTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:cooking-pot" className="mr-2 text-xl" />
                    <div>
                      <div className="font-semibold">Cook Time</div>
                      <div>{mockRecipe.cookTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:timer-sand" className="mr-2 text-xl" />
                    <div>
                      <div className="font-semibold">Total Time</div>
                      <div>{mockRecipe.totalTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:account-group" className="mr-2 text-xl" />
                    <div>
                      <div className="font-semibold">Servings</div>
                      <div>{mockRecipe.servings}</div>
                    </div>
                  </div>
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
                        {mockRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start">
                            <Icon icon="mdi:circle-small" className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Steps Section */}
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <Icon icon="mdi:chef-hat" className="mr-2 text-orange-500" />
                      Preparation Steps
                    </h2>
                    <div className="space-y-6">
                      {mockRecipe.steps.map((step, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}
                    </div>

                    {/* Notes Section */}
                    {mockRecipe.notes && (
                      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Icon icon="mdi:lightbulb-on" className="mr-2 text-blue-500" />
                          Chef's Notes
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{mockRecipe.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Recipe;
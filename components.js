import { favorites } from "../state/appState.js";

export function showCategories(categories, container, onSelect) {
  container.innerHTML = "";

  categories.forEach(function (category) {
    const card = document.createElement("button");
    card.className = "category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all text-left";
    card.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
          <i class="fa-solid fa-utensils"></i>
        </div>
        <div><h3 class="text-sm font-bold text-gray-900">${category.strCategory}</h3></div>
      </div>
    `;
    card.addEventListener("click", function () {
      onSelect(category.strCategory);
    });
    container.appendChild(card);
  });
}

export function showMeals(meals, container, onOpen) {
  container.innerHTML = "";

  if (meals.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No meals found.</p>';
    return;
  }

  meals.forEach(function (meal) {
    const card = document.createElement("div");
    const isFavorite = favorites.includes(meal.idMeal);

    card.className = "recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
    card.innerHTML = `
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
        <button class="favorite-btn absolute top-3 right-3 bg-white rounded-full w-9 h-9 shadow text-lg"
          type="button" aria-label="Favorite">${isFavorite ? "❤️" : "♡"}</button>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1">${meal.strMeal}</h3>
        <p class="text-xs text-gray-600">Click to see recipe details</p>
      </div>
    `;

    card.querySelector(".favorite-btn").addEventListener("click", function (event) {
      event.stopPropagation();
      const nowFavorite = onFavorite(meal.idMeal);
      this.textContent = nowFavorite ? "❤️" : "♡";
    });

    card.addEventListener("click", function () {
      onOpen(meal.idMeal);
    });

    container.appendChild(card);
  });
}

// This small helper keeps the favorite button connected to the state function.
let onFavorite = function () { return false; };
export function setFavoriteHandler(handler) {
  onFavorite = handler;
}

export function showMealDetails(meal, container) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`<li class="p-2 bg-gray-50 rounded-lg">${measure || ""} ${ingredient}</li>`);
    }
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6">
        <i class="fa-solid fa-arrow-left"></i> Back to Recipes
      </button>
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-72 object-cover">
        <div class="p-6">
          <p class="text-emerald-600 font-semibold">${meal.strCategory || ""} ${meal.strArea ? "• " + meal.strArea : ""}</p>
          <h1 class="text-3xl font-bold text-gray-900 mt-2">${meal.strMeal}</h1>
          <button id="log-meal-btn" class="mt-5 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">
            <i class="fa-solid fa-clipboard-list"></i> Log This Meal
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow">
          <h2 class="text-xl font-bold mb-4">Ingredients</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">${ingredients.join("")}</ul>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow">
          <h2 class="text-xl font-bold mb-4">Instructions</h2>
          <p class="text-gray-700 whitespace-pre-line">${meal.strInstructions || "No instructions available."}</p>
          ${meal.strYoutube ? `<a class="text-emerald-700 underline inline-block mt-4" href="${meal.strYoutube}" target="_blank">Watch video</a>` : ""}
        </div>
      </div>
    </div>
  `;
}

// Simple state for the application.
// Food log and favorites are saved in the browser.

export let allMeals = [];
export let currentMeals = [];
export let currentMeal = null;
export let loggedFoods = JSON.parse(localStorage.getItem("nutriplan-food-log")) || [];
export let favorites = JSON.parse(localStorage.getItem("nutriplan-favorites")) || [];

export function setAllMeals(meals) {
  allMeals = meals;
  currentMeals = meals;
}

export function setCurrentMeals(meals) {
  currentMeals = meals;
}

export function setCurrentMeal(meal) {
  currentMeal = meal;
}

export function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(function (mealId) {
      return mealId !== id;
    });
  } else {
    favorites.push(id);
  }
  localStorage.setItem("nutriplan-favorites", JSON.stringify(favorites));
  return favorites.includes(id);
}

export function addFood(food) {
  loggedFoods.push(food);
  localStorage.setItem("nutriplan-food-log", JSON.stringify(loggedFoods));
}

export function removeFood(index) {
  loggedFoods.splice(index, 1);
  localStorage.setItem("nutriplan-food-log", JSON.stringify(loggedFoods));
}

export function clearFoods() {
  loggedFoods = [];
  localStorage.setItem("nutriplan-food-log", JSON.stringify(loggedFoods));
}

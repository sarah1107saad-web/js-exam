import {
  getCategories,
  getMeals,
  searchMeals,
  getMealsByCategory,
  getMealDetails
} from "./api/mealdb.js";

import {
  allMeals,
  currentMeals,
  loggedFoods,
  setAllMeals,
  setCurrentMeals,
  setCurrentMeal,
  toggleFavorite,
  addFood,
  removeFood,
  clearFoods
} from "./state/appState.js";

import {
  showCategories,
  showMeals,
  showMealDetails,
  setFavoriteHandler
} from "./ui/components.js";

// Get HTML elements
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");
const recipesCount = document.getElementById("recipes-count");
const searchInput = document.getElementById("search-input");
const loading = document.getElementById("app-loading-overlay");

const mealsSections = [
  document.getElementById("search-filters-section"),
  document.getElementById("meal-categories-section"),
  document.getElementById("all-recipes-section")
];
const detailsSection = document.getElementById("meal-details");
const productsSection = document.getElementById("products-section");
const foodlogSection = document.getElementById("foodlog-section");

let selectedProductGrade = "";
let lastProducts = [];

// ---------------- MEALS ----------------

async function loadMealsPage() {
  try {
    const categories = await getCategories();
    showCategories(categories, categoriesGrid, filterCategory);

    const meals = await getMeals();
    setAllMeals(meals);
    showMeals(meals, recipesGrid, openMeal);
    recipesCount.textContent = "Showing " + meals.length + " recipes";
  } catch (error) {
    recipesGrid.innerHTML = '<p class="text-red-600">Could not load meals. Please refresh the page.</p>';
    console.log(error);
  } finally {
    loading.style.display = "none";
  }
}

async function filterCategory(category) {
  try {
    const meals = await getMealsByCategory(category);
    setCurrentMeals(meals);
    showMeals(meals, recipesGrid, openMeal);
    recipesCount.textContent = "Showing " + meals.length + " " + category + " recipes";
  } catch (error) {
    alert("Could not load this category.");
    console.log(error);
  }
}

searchInput.addEventListener("input", async function () {
  const word = searchInput.value.trim();

  if (word === "") {
    showMeals(allMeals, recipesGrid, openMeal);
    recipesCount.textContent = "Showing " + allMeals.length + " recipes";
    return;
  }

  try {
    const meals = await searchMeals(word);
    setCurrentMeals(meals);
    showMeals(meals, recipesGrid, openMeal);
    recipesCount.textContent = "Found " + meals.length + " recipes";
  } catch (error) {
    console.log(error);
  }
});

setFavoriteHandler(toggleFavorite);

async function openMeal(id) {
  try {
    const meal = await getMealDetails(id);
    if (!meal) return;

    setCurrentMeal(meal);
    mealsSections.forEach(function (section) {
      section.style.display = "none";
    });
    detailsSection.style.display = "block";
    showMealDetails(meal, detailsSection);

    document.getElementById("back-to-meals-btn").addEventListener("click", showMealsPage);
    document.getElementById("log-meal-btn").addEventListener("click", function () {
      addFood({
        name: meal.strMeal,
        image: meal.strMealThumb,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: new Date().toLocaleDateString()
      });
      updateFoodLog();
      alert("Meal added to your Food Log. Nutrition values are not provided by this meals API.");
    });
  } catch (error) {
    alert("Could not load meal details.");
    console.log(error);
  }
}

function showMealsPage() {
  mealsSections.forEach(function (section) {
    section.style.display = "";
  });
  detailsSection.style.display = "none";
  productsSection.style.display = "none";
  foodlogSection.style.display = "none";
}

function showPage(page) {
  mealsSections.forEach(function (section) {
    section.style.display = "none";
  });
  detailsSection.style.display = "none";
  productsSection.style.display = "none";
  foodlogSection.style.display = "none";

  if (page === "meals") showMealsPage();
  if (page === "products") productsSection.style.display = "block";
  if (page === "foodlog") {
    foodlogSection.style.display = "block";
    updateFoodLog();
  }
}

document.querySelectorAll(".nav-link").forEach(function (link, index) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    if (index === 0) showPage("meals");
    if (index === 1) showPage("products");
    if (index === 2) showPage("foodlog");
  });
});

// Grid and list view
document.getElementById("grid-view-btn").addEventListener("click", function () {
  recipesGrid.className = "grid grid-cols-4 gap-5";
});
document.getElementById("list-view-btn").addEventListener("click", function () {
  recipesGrid.className = "grid grid-cols-1 gap-5";
});

// Sidebar buttons
const sidebar = document.getElementById("sidebar");
document.getElementById("header-menu-btn").addEventListener("click", function () {
  sidebar.classList.toggle("open");
});
document.getElementById("sidebar-close-btn").addEventListener("click", function () {
  sidebar.classList.remove("open");
});

// ---------------- PRODUCT SCANNER ----------------

async function searchProducts() {
  const word = document.getElementById("product-search-input").value.trim();
  if (word === "") {
    alert("Please enter a product name.");
    return;
  }

  const grid = document.getElementById("products-grid");
  const count = document.getElementById("products-count");
  grid.innerHTML = '<p class="text-gray-500">Loading products...</p>';

  try {
    const response = await fetch("https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURIComponent(word) + "&search_simple=1&action=process&json=1&page_size=20");
    const data = await response.json();
    lastProducts = data.products || [];
    showProducts(lastProducts);
    count.textContent = lastProducts.length + " products found";
  } catch (error) {
    grid.innerHTML = '<p class="text-red-600">Could not load products.</p>';
    console.log(error);
  }
}

async function searchBarcode() {
  const barcode = document.getElementById("barcode-input").value.trim();
  if (barcode === "") {
    alert("Please enter a barcode.");
    return;
  }

  const grid = document.getElementById("products-grid");
  grid.innerHTML = '<p class="text-gray-500">Searching...</p>';

  try {
    const response = await fetch("https://world.openfoodfacts.org/api/v0/product/" + encodeURIComponent(barcode) + ".json");
    const data = await response.json();

    if (data.status === 1) {
      lastProducts = [data.product];
      showProducts(lastProducts);
      document.getElementById("products-count").textContent = "1 product found";
    } else {
      grid.innerHTML = '<p class="text-gray-500">Product not found.</p>';
      document.getElementById("products-count").textContent = "No products found";
    }
  } catch (error) {
    grid.innerHTML = '<p class="text-red-600">Could not search this barcode.</p>';
  }
}

function showProducts(products) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  const filteredProducts = products.filter(function (product) {
    const grade = (product.nutriscore_grade || "").toLowerCase();
    return selectedProductGrade === "" || grade === selectedProductGrade;
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p class="text-gray-500">No products found for this filter.</p>';
    return;
  }

  filteredProducts.forEach(function (product) {
    const name = product.product_name || "Unknown product";
    const brand = product.brands || "Unknown brand";
    const image = product.image_front_url || product.image_url || "";
    const grade = (product.nutriscore_grade || "N/A").toUpperCase();
    const nutriments = product.nutriments || {};

    const card = document.createElement("div");
    card.className = "product-card bg-white rounded-xl overflow-hidden shadow-sm p-4";
    card.innerHTML = `
      <div class="h-40 bg-gray-100 flex items-center justify-center mb-3 rounded-lg overflow-hidden">
        ${image ? `<img src="${image}" alt="${name}" class="w-full h-full object-contain">` : '<span class="text-gray-400">No image</span>'}
      </div>
      <p class="text-xs text-emerald-600 font-semibold mb-1">${brand}</p>
      <h3 class="font-bold text-gray-900 mb-2">${name}</h3>
      <p class="text-sm text-gray-600 mb-2">Nutri-Score: ${grade}</p>
      <p class="text-xs text-gray-600">Calories: ${nutriments["energy-kcal_100g"] || 0} kcal / 100g</p>
      <p class="text-xs text-gray-600">Protein: ${nutriments.proteins_100g || 0}g</p>
      <p class="text-xs text-gray-600">Carbs: ${nutriments.carbohydrates_100g || 0}g</p>
      <p class="text-xs text-gray-600">Fat: ${nutriments.fat_100g || 0}g</p>
      <button class="add-product-log mt-3 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Add to Food Log</button>
    `;

    card.querySelector(".add-product-log").addEventListener("click", function () {
      addFood({
        name: name,
        image: image,
        calories: Number(nutriments["energy-kcal_100g"]) || 0,
        protein: Number(nutriments.proteins_100g) || 0,
        carbs: Number(nutriments.carbohydrates_100g) || 0,
        fat: Number(nutriments.fat_100g) || 0,
        date: new Date().toLocaleDateString()
      });
      alert("Product added to Food Log.");
    });

    grid.appendChild(card);
  });
}

document.getElementById("search-product-btn").addEventListener("click", searchProducts);
document.getElementById("lookup-barcode-btn").addEventListener("click", searchBarcode);
document.getElementById("product-search-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") searchProducts();
});
document.getElementById("barcode-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") searchBarcode();
});

document.querySelectorAll(".nutri-score-filter").forEach(function (button) {
  button.addEventListener("click", function () {
    selectedProductGrade = button.dataset.grade || "";
    showProducts(lastProducts);
  });
});

// ---------------- FOOD LOG ----------------

function updateFoodLog() {
  const list = document.getElementById("logged-items-list");
  const dateElement = document.getElementById("foodlog-date");
  const today = new Date().toLocaleDateString();

  dateElement.textContent = new Date().toDateString();

  if (loggedFoods.length === 0) {
    list.innerHTML = '<div class="text-center py-8 text-gray-500"><p class="font-medium">No meals logged today</p><p class="text-sm">Add meals from the Meals page or scan products</p></div>';
  } else {
    list.innerHTML = "";
    loggedFoods.forEach(function (food, index) {
      const item = document.createElement("div");
      item.className = "flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2";
      item.innerHTML = `
        <div class="flex items-center gap-3">
          ${food.image ? `<img src="${food.image}" class="w-12 h-12 rounded-lg object-cover" alt="">` : ""}
          <div><p class="font-semibold text-gray-800">${food.name}</p>
          <p class="text-xs text-gray-500">${food.calories || 0} kcal</p></div>
        </div>
        <button class="remove-food text-red-500" data-index="${index}">Remove</button>
      `;
      item.querySelector(".remove-food").addEventListener("click", function () {
        removeFood(index);
        updateFoodLog();
      });
      list.appendChild(item);
    });
  }

  const totalCalories = loggedFoods.reduce(function (sum, food) { return sum + (Number(food.calories) || 0); }, 0);
  const totalProtein = loggedFoods.reduce(function (sum, food) { return sum + (Number(food.protein) || 0); }, 0);
  const totalCarbs = loggedFoods.reduce(function (sum, food) { return sum + (Number(food.carbs) || 0); }, 0);
  const totalFat = loggedFoods.reduce(function (sum, food) { return sum + (Number(food.fat) || 0); }, 0);

  const boxes = document.querySelectorAll("#foodlog-today-section .grid > div");
  const totals = [totalCalories + " / 2000 kcal", totalProtein + " / 50 g", totalCarbs + " / 250 g", totalFat + " / 65 g"];
  boxes.forEach(function (box, index) {
    const value = box.querySelector(".text-gray-500");
    if (value && totals[index]) value.textContent = totals[index];
  });

  const heading = document.querySelector("#foodlog-today-section .border-t h3");
  if (heading) heading.textContent = "Logged Items (" + loggedFoods.length + ")";
}

document.getElementById("clear-foodlog").addEventListener("click", function () {
  if (confirm("Clear all logged foods?")) {
    clearFoods();
    updateFoodLog();
  }
});

document.querySelectorAll(".quick-log-btn").forEach(function (button, index) {
  button.addEventListener("click", function () {
    if (index === 0) showPage("meals");
    if (index === 1) showPage("products");
    if (index === 2) {
      const name = prompt("Enter food name:");
      if (name) {
        addFood({
          name: name,
          calories: Number(prompt("Calories (enter 0 if unknown):")) || 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          date: new Date().toLocaleDateString()
        });
        updateFoodLog();
      }
    }
  });
});

// Set initial page
detailsSection.style.display = "none";
productsSection.style.display = "none";
foodlogSection.style.display = "none";
loadMealsPage();
updateFoodLog();

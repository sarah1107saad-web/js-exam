const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

export async function getCategories() {
  const response = await fetch(BASE_URL + "categories.php");
  if (!response.ok) throw new Error("Could not load categories");
  const data = await response.json();
  return data.categories || [];
}

export async function getMeals() {
  const response = await fetch(BASE_URL + "search.php?f=a");
  if (!response.ok) throw new Error("Could not load meals");
  const data = await response.json();
  return data.meals || [];
}

export async function searchMeals(word) {
  const response = await fetch(BASE_URL + "search.php?f=a" + encodeURIComponent(word));
  if (!response.ok) throw new Error("Search failed");
  const data = await response.json();
  return data.meals || [];
}

export async function getMealsByCategory(category) {
  const response = await fetch(BASE_URL + "filter.php?c=" + encodeURIComponent(category));
  if (!response.ok) throw new Error("Could not filter meals");
  const data = await response.json();
  return data.meals || [];
}

export async function getMealDetails(id) {
  const response = await fetch(BASE_URL + "lookup.php?i=" + id);
  if (!response.ok) throw new Error("Could not load meal details");
  const data = await response.json();
  return data.meals ? data.meals[0] : null;
}

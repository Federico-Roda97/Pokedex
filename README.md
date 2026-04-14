# Pokédex Web App

## Overview

This project is a dynamic Pokédex web application built with vanilla HTML, CSS, and JavaScript.
It fetches real-time data from the PokéAPI and provides an interactive interface to browse, search, and explore Pokémon.

The application focuses on clean UI interactions, efficient data handling, and a smooth user experience without using external frameworks.

---

## Features:

### Pokémon Browsing

* Paginated Pokémon list (20 items per page)
* Dynamic table rendering with:

  * Image
  * Name
  * ID (formatted)
  * Type(s)
  * Height and weight

### Pagination System

* First, Previous, Next, Last page navigation
* Dynamic page number rendering
* Current page and total pages indicator

### Search & Autocomplete

* Real-time search suggestions
* Autocomplete based on full Pokémon dataset
* Instant lookup by name
* Keyboard support (Enter to select first suggestion)

### Pokémon Details Panel

* Click on a Pokémon to open a detailed view
* Displays:

  * Image
  * ID
  * Types
  * Height & weight
  * Base stats
* Dynamic gradient background based on Pokémon types
* Animated UI with smooth transitions

### Dark Mode

* Toggle between light and dark theme
* Dynamic icon switching (moon/sun)
* Persistent UI styling via CSS classes

### User Experience Enhancements

* Click outside to close detail panel
* Responsive layout
* Smooth UI updates without page reload

---

## Technologies Used

* **HTML5** – Structure and layout
* **CSS3** – Styling, animations, and responsive design
* **JavaScript (ES6+)** – Application logic and DOM manipulation
* **Fetch API** – Asynchronous data retrieval

---

## API Integration

This project uses the public PokéAPI:

* Base endpoint: https://pokeapi.co/api/v2/pokemon
* Supports:

  * Pagination via `limit` and `offset`
  * Individual Pokémon lookup
  * Detailed data (types, stats, sprites)

---

## Project Structure (Conceptual)

```
/project
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## How It Works

1. On page load:

   * The app fetches a paginated list of Pokémon
   * It also preloads all Pokémon names for search

2. Data Flow:

   * List endpoint → basic Pokémon data
   * Individual endpoints → detailed data for each Pokémon

3. Rendering:

   * Data is dynamically injected into the DOM
   * Table and pagination update on each interaction

4. Search:

   * Uses a preloaded dataset for fast autocomplete
   * Fetches a single Pokémon on selection

---

## Purpose

This project was created to strengthen skills in:

* JavaScript fundamentals
* Asynchronous programming (async/await)
* DOM manipulation
* API integration
* UI/UX design without frameworks

---

## Possible Improvements

* Code modularization (separate logic into modules)
* Add caching for API requests
* Improve accessibility (ARIA labels, keyboard navigation)
* Add favorites system (localStorage)
* Debounce search input for performance optimization

---

## Author
Federico Roda

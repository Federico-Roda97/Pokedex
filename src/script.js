let currentOffset = 0;
let currentPokemonList = [];
let totalPokemon = 0;
let allPokemonNames = [];

const limit = 20;
let currentPage = 1;
let totalPages = 0;

/* BUTTONS */
const primaryBtn = document.getElementById('primaPagina');
const previousBtn = document.getElementById('precedente');
const nextBtn = document.getElementById('successiva');
const lastBtn = document.getElementById('ultimaPagina');

/* THEME */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

/* SEARCH */
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');

/* DARK MODE */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');

  const isDark = document.body.classList.contains('dark');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
});

document.addEventListener('DOMContentLoaded', () => {
  loadPokemonListForSearch();
  loadpokemon(0);
  setupButtons();
  setupSearch();
});

/* LOAD ALL NAMES (SEARCH) */
async function loadPokemonListForSearch() {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
    const data = await res.json();
    allPokemonNames = data.results.map((p) => p.name);
  } catch (err) {
    console.error('Errore caricamento nomi Pokémon', err);
  }
}

/* SEARCH SETUP */
function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener('input', handleSearchInput);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = suggestionsBox.querySelector('.suggestion-item');
      if (first) {
        searchPokemon(first.textContent);
        suggestionsBox.innerHTML = '';
        searchInput.value = '';
      }
    }
  });
}

/* AUTOCOMPLETE */
function handleSearchInput(e) {
  const value = e.target.value.toLowerCase();

  if (!value) {
    suggestionsBox.innerHTML = '';
    return;
  }

  const filtered = allPokemonNames
    .filter((name) => name.includes(value))
    .slice(0, 8);

  suggestionsBox.innerHTML = filtered
    .map((name) => `<div class="suggestion-item">${name}</div>`)
    .join('');

  document.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', () => {
      searchPokemon(item.textContent);
      suggestionsBox.innerHTML = '';
      searchInput.value = '';
    });
  });
}

/* SEARCH POKEMON */
async function searchPokemon(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();

    displayPokemonTable([data]);
  } catch (err) {
    console.error('Pokemon non trovato');
  }
}

/* BUTTONS */
function setupButtons() {
  primaryBtn.addEventListener('click', () => {
    loadpokemon(0);
  });

  previousBtn.addEventListener('click', () => {
    if (currentOffset > 0) {
      loadpokemon(currentOffset - limit);
    }
  });

  nextBtn.addEventListener('click', () => {
    loadpokemon(currentOffset + limit);
  });

  lastBtn.addEventListener('click', () => {
    const lastPageOffset = (totalPages - 1) * limit;
    loadpokemon(lastPageOffset);
  });
}

/* FETCH */
async function loadpokemon(offset = 0) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) throw new Error('Errore nel caricamento');

    const data = await response.json();

    currentOffset = offset;
    currentPage = offset / limit + 1;

    totalPokemon = data.count;
    totalPages = Math.ceil(totalPokemon / limit);

    const pokemonPromises = data.results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      return await detailResponse.json();
    });

    currentPokemonList = await Promise.all(pokemonPromises);

    displayPokemonTable(currentPokemonList);
    renderPagination();
    updatePaginationInfo();
  } catch (error) {
    console.error(error);
  }
}

/* TABLE */
function displayPokemonTable(list) {
  const tbody = document.getElementById('pokemonTableBody');
  tbody.innerHTML = '';

  list.forEach((pokemon) => {
    const row = document.createElement('tr');

    const typesHTML = renderTypes(pokemon.types);

    row.innerHTML = `
      <td><img src="${pokemon.sprites.front_default}" class="pokemon-image"></td>
      <td class="pokemon-name">${pokemon.name}</td>
      <td>#${pokemon.id.toString().padStart(3, '0')}</td>
      <td>${typesHTML}</td>
      <td>${(pokemon.height / 10).toFixed(1)}m</td>
      <td>${(pokemon.weight / 10).toFixed(1)}kg</td>
    `;

    row.addEventListener('click', () => openDetail(pokemon));

    tbody.appendChild(row);
  });
}

/* TYPES */
function renderTypes(types) {
  return `
    <div class="pokemon-type-container">
      ${types
        .map((t) => {
          const name = t.type.name;
          return `<span class="pokemon-type ${name}">${name}</span>`;
        })
        .join('')}
    </div>
  `;
}

/* DETAIL PANEL */
function openDetail(pokemon) {
  const panel = document.getElementById('detailPanel');

  const typeColors = {
    fire: '#f97316',
    water: '#3b82f6',
    grass: '#22c55e',
    electric: '#facc15',
    rock: '#a16207',
    ground: '#b45309',
    psychic: '#ec4899',
    ice: '#38bdf8',
    dragon: '#6366f1',
    dark: '#374151',
    fairy: '#f472b6',
    normal: '#9ca3af',
    poison: '#a855f7',
    bug: '#84cc16',
    flying: '#60a5fa',
  };

  const types = pokemon.types.map((t) => t.type.name);

  const color1 = typeColors[types[0]] || '#ffffff';
  const color2 = typeColors[types[1]] || color1;

  panel.style.background = `linear-gradient(-45deg, ${color1}, ${color2}, ${color1})`;
  panel.style.backgroundSize = '400% 400%';
  panel.style.animation = 'gradientMove 8s ease infinite';

  panel.style.boxShadow = `0 0 30px ${color1}aa, 0 0 60px ${color2}66`;

  const stats = pokemon.stats
    .map((s) => `<p>${s.stat.name}: ${s.base_stat}</p>`)
    .join('');

  panel.innerHTML = `
    <button class="close-btn" onclick="closePanel()">X</button>

    <img src="${pokemon.sprites.front_default}" />
    <h2 class="detail-title">${pokemon.name}</h2>

    <p><strong>ID:</strong> #${pokemon.id}</p>
    <p><strong>Type:</strong> ${types.join(', ')}</p>
    <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
    <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>

    <h3>Stats</h3>
    ${stats}
  `;

  panel.classList.remove('hidden');
}

/* CLOSE */
function closePanel() {
  document.getElementById('detailPanel').classList.add('hidden');
}

/* CLICK OUTSIDE */
document.addEventListener('click', (event) => {
  const panel = document.getElementById('detailPanel');

  if (panel.classList.contains('hidden')) return;
  if (panel.contains(event.target)) return;
  if (event.target.closest('tr')) return;

  panel.classList.add('hidden');
});

/* PAGINATION INFO */
function updatePaginationInfo() {
  const pagination = document.getElementById('paginationInfo');

  pagination.innerHTML = `
    Page ${currentPage} / ${totalPages} | Total Pokémon: ${totalPokemon}
  `;
}

/* PAGINATION */
function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const createBtn = (text, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'btn';

    if (active) btn.classList.add('primary');

    if (disabled) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      return btn;
    }

    btn.addEventListener('click', () => {
      loadpokemon((page - 1) * limit);
    });

    return btn;
  };

  pagination.appendChild(createBtn('⏮', 1, currentPage === 1));
  pagination.appendChild(createBtn('◀', currentPage - 1, currentPage === 1));

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pagination.appendChild(createBtn(i, i, false, i === currentPage));
  }

  pagination.appendChild(
    createBtn('▶', currentPage + 1, currentPage === totalPages)
  );

  pagination.appendChild(
    createBtn('⏭', totalPages, currentPage === totalPages)
  );
}

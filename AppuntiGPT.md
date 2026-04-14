// ==============================
// VARIABILI GLOBALI
// ==============================

let currentOffset = 0; 
// Indica da quale elemento partire nella lista (serve per la paginazione API)

let currentPokemonList = []; 
// Contiene i Pokémon attualmente mostrati nella tabella

let totalPokemon = 0; 
// Numero totale di Pokémon disponibili nell'API

let allPokemonNames = []; 
// Array con tutti i nomi dei Pokémon (usato per la ricerca/autocomplete)

const limit = 20; 
// Numero di Pokémon mostrati per ogni pagina

let currentPage = 1; 
// Pagina corrente

let totalPages = 0; 
// Numero totale di pagine


// ==============================
// ELEMENTI HTML (BOTTONI)
// ==============================

const primaryBtn = document.getElementById('primaPagina'); 
// Bottone per andare alla prima pagina

const previousBtn = document.getElementById('precedente'); 
// Bottone per pagina precedente

const nextBtn = document.getElementById('successiva'); 
// Bottone per pagina successiva

const lastBtn = document.getElementById('ultimaPagina'); 
// Bottone per ultima pagina


// ==============================
// DARK MODE ELEMENTI
// ==============================

const themeToggle = document.getElementById('themeToggle'); 
// Bottone per attivare/disattivare la dark mode

const themeIcon = document.getElementById('themeIcon'); 
// Icona che cambia tra sole e luna


// ==============================
// SEARCH ELEMENTI
// ==============================

const searchInput = document.getElementById('searchInput'); 
// Campo input per la ricerca Pokémon

const suggestionsBox = document.getElementById('suggestions'); 
// Contenitore dei suggerimenti autocomplete


// ==============================
// DARK MODE LOGIC
// ==============================

themeToggle.addEventListener('click', () => { 
  // Quando clicco il bottone della dark mode

  document.body.classList.toggle('dark'); 
  // Aggiunge o rimuove la classe "dark" al body

  const isDark = document.body.classList.contains('dark'); 
  // Controlla se la dark mode è attiva

  themeIcon.textContent = isDark ? '☀️' : '🌙'; 
  // Cambia icona: sole se dark attiva, luna se disattiva
});


// ==============================
// AVVIO APP
// ==============================

document.addEventListener('DOMContentLoaded', () => { 
  // Quando il DOM è completamente caricato

  loadPokemonListForSearch(); 
  // Carica tutti i nomi dei Pokémon per la ricerca

  loadpokemon(0); 
  // Carica la prima pagina (offset 0)

  setupButtons(); 
  // Inizializza eventi dei bottoni

  setupSearch(); 
  // Inizializza la ricerca
});


// ==============================
// CARICA TUTTI I NOMI POKEMON
// ==============================

async function loadPokemonListForSearch() { 
  // Funzione asincrona per ottenere tutti i nomi

  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000'); 
    // Chiamata API con limite alto per prendere tutti i Pokémon

    const data = await res.json(); 
    // Converte la risposta in JSON

    allPokemonNames = data.results.map((p) => p.name); 
    // Estrae solo i nomi e li salva in un array

  } catch (err) {
    console.error('Errore caricamento nomi Pokémon', err); 
    // Stampa errore in console
  }
}


// ==============================
// SETUP SEARCH
// ==============================

function setupSearch() {

  if (!searchInput) return; 
  // Se input non esiste, esce dalla funzione

  searchInput.addEventListener('input', handleSearchInput); 
  // Quando scrivi, attiva autocomplete

  searchInput.addEventListener('keydown', (e) => { 
    // Quando premi un tasto nella input

    if (e.key === 'Enter') { 
      // Se premi INVIO

      const first = suggestionsBox.querySelector('.suggestion-item'); 
      // Prende il primo suggerimento disponibile

      if (first) {
        searchPokemon(first.textContent); 
        // Cerca il Pokémon selezionato

        suggestionsBox.innerHTML = ''; 
        // Svuota suggerimenti

        searchInput.value = ''; 
        // Pulisce input
      }
    }
  });
}


// ==============================
// AUTOCOMPLETE
// ==============================

function handleSearchInput(e) {

  const value = e.target.value.toLowerCase(); 
  // Prende il testo inserito e lo rende minuscolo

  if (!value) {
    suggestionsBox.innerHTML = ''; 
    // Se vuoto, cancella suggerimenti
    return;
  }

  const filtered = allPokemonNames
    .filter((name) => name.includes(value)) 
    // Filtra nomi che contengono il testo

    .slice(0, 8); 
    // Limita a massimo 8 risultati

  suggestionsBox.innerHTML = filtered
    .map((name) => `<div class="suggestion-item">${name}</div>`) 
    // Crea HTML per ogni suggerimento

    .join(''); 
    // Unisce tutto in una stringa

  document.querySelectorAll('.suggestion-item').forEach((item) => { 
    // Per ogni suggerimento

    item.addEventListener('click', () => { 
      // Quando clicchi

      searchPokemon(item.textContent); 
      // Cerca quel Pokémon

      suggestionsBox.innerHTML = ''; 
      // Pulisce suggerimenti

      searchInput.value = ''; 
      // Pulisce input
    });
  });
}


// ==============================
// CERCA POKEMON
// ==============================

async function searchPokemon(name) {

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`); 
    // Fetch del Pokémon specifico

    const data = await res.json(); 
    // Converte risposta

    displayPokemonTable([data]); 
    // Mostra solo quel Pokémon (array con un elemento)

  } catch (err) {
    console.error('Pokemon non trovato'); 
    // Errore se non esiste
  }
}


// ==============================
// BOTTONI PAGINAZIONE
// ==============================

function setupButtons() {

  primaryBtn.addEventListener('click', () => {
    loadpokemon(0); 
    // Vai alla prima pagina
  });

  previousBtn.addEventListener('click', () => {
    if (currentOffset > 0) { 
      // Evita offset negativo
      loadpokemon(currentOffset - limit); 
      // Vai indietro di una pagina
    }
  });

  nextBtn.addEventListener('click', () => {
    loadpokemon(currentOffset + limit); 
    // Vai avanti di una pagina
  });

  lastBtn.addEventListener('click', () => {
    const lastPageOffset = (totalPages - 1) * limit; 
    // Calcola offset ultima pagina

    loadpokemon(lastPageOffset); 
    // Vai all'ultima pagina
  });
}


// ==============================
// FETCH POKEMON
// ==============================

async function loadpokemon(offset = 0) {

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    ); 
    // Richiede lista Pokémon con paginazione

    if (!response.ok) throw new Error('Errore nel caricamento'); 
    // Controllo errore HTTP

    const data = await response.json(); 
    // Converte risposta

    currentOffset = offset; 
    // Aggiorna offset

    currentPage = offset / limit + 1; 
    // Calcola pagina corrente

    totalPokemon = data.count; 
    // Numero totale Pokémon

    totalPages = Math.ceil(totalPokemon / limit); 
    // Calcola numero totale pagine

    const pokemonPromises = data.results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url); 
      // Fetch dettagli Pokémon

      return await detailResponse.json(); 
      // Restituisce JSON
    });

    currentPokemonList = await Promise.all(pokemonPromises); 
    // Attende tutti i fetch

    displayPokemonTable(currentPokemonList); 
    // Mostra tabella

    renderPagination(); 
    // Disegna paginazione

    updatePaginationInfo(); 
    // Aggiorna info pagine

  } catch (error) {
    console.error(error); 
    // Stampa errore
  }
}


// ==============================
// TABELLA
// ==============================

function displayPokemonTable(list) {

  const tbody = document.getElementById('pokemonTableBody'); 
  // Prende il body della tabella

  tbody.innerHTML = ''; 
  // Svuota tabella

  list.forEach((pokemon) => {

    const row = document.createElement('tr'); 
    // Crea riga

    const typesHTML = renderTypes(pokemon.types); 
    // Genera HTML dei tipi

    row.innerHTML = `
      <td><img src="${pokemon.sprites.front_default}" class="pokemon-image"></td>
      <td class="pokemon-name">${pokemon.name}</td>
      <td>#${pokemon.id.toString().padStart(3, '0')}</td>
      <td>${typesHTML}</td>
      <td>${(pokemon.height / 10).toFixed(1)}m</td>
      <td>${(pokemon.weight / 10).toFixed(1)}kg</td>
    `; 
    // Inserisce contenuto nella riga

    row.addEventListener('click', () => openDetail(pokemon)); 
    // Click → apre dettaglio

    tbody.appendChild(row); 
    // Aggiunge riga alla tabella
  });
}


// ==============================
// TIPI POKEMON
// ==============================

function renderTypes(types) {
  return `
    <div class="pokemon-type-container">
      ${types
        .map((t) => {
          const name = t.type.name; 
          // Nome tipo
          return `<span class="pokemon-type ${name}">${name}</span>`; 
          // Badge tipo
        })
        .join('')}
    </div>
  `;
}


// ==============================
// DETTAGLIO POKEMON
// ==============================

function openDetail(pokemon) {

  const panel = document.getElementById('detailPanel'); 
  // Pannello dettaglio

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
  // Colori per tipo

  const types = pokemon.types.map((t) => t.type.name); 
  // Estrae tipi

  const color1 = typeColors[types[0]] || '#ffffff'; 
  // Colore principale

  const color2 = typeColors[types[1]] || color1; 
  // Secondo colore

  panel.style.background = `linear-gradient(-45deg, ${color1}, ${color2}, ${color1})`; 
  // Background animato

  panel.style.backgroundSize = '400% 400%'; 
  // Dimensione animazione

  panel.style.animation = 'gradientMove 8s ease infinite'; 
  // Animazione continua

  panel.style.boxShadow = `0 0 30px ${color1}aa, 0 0 60px ${color2}66`; 
  // Ombra colorata

  const stats = pokemon.stats
    .map((s) => `<p>${s.stat.name}: ${s.base_stat}</p>`) 
    // Genera stats

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
  // Inserisce contenuto pannello

  panel.classList.remove('hidden'); 
  // Mostra pannello
}


// ==============================
// CHIUSURA PANEL
// ==============================

function closePanel() {
  document.getElementById('detailPanel').classList.add('hidden'); 
  // Nasconde pannello
}


// ==============================
// CLICK FUORI DAL PANEL
// ==============================

document.addEventListener('click', (event) => {

  const panel = document.getElementById('detailPanel'); 

  if (panel.classList.contains('hidden')) return; 
  // Se già nascosto → niente

  if (panel.contains(event.target)) return; 
  // Se clic dentro → niente

  if (event.target.closest('tr')) return; 
  // Se clic su riga → niente

  panel.classList.add('hidden'); 
  // Altrimenti chiude
});


// ==============================
// INFO PAGINAZIONE
// ==============================

function updatePaginationInfo() {

  const pagination = document.getElementById('paginationInfo'); 

  pagination.innerHTML = `
    Page ${currentPage} / ${totalPages} | Total Pokémon: ${totalPokemon}
  `; 
  // Mostra info pagine
}


// ==============================
// PAGINAZIONE DINAMICA
// ==============================

function renderPagination() {

  const pagination = document.getElementById('pagination'); 
  // Container bottoni

  pagination.innerHTML = ''; 
  // Svuota

  const createBtn = (text, page, disabled = false, active = false) => {

    const btn = document.createElement('button'); 
    // Crea bottone

    btn.textContent = text; 
    // Testo bottone

    btn.className = 'btn'; 
    // Classe base

    if (active) btn.classList.add('primary'); 
    // Evidenzia pagina attiva

    if (disabled) {
      btn.disabled = true; 
      btn.style.opacity = '0.5'; 
      return btn;
    }

    btn.addEventListener('click', () => {
      loadpokemon((page - 1) * limit); 
      // Carica pagina cliccata
    });

    return btn;
  };

  pagination.appendChild(createBtn('⏮', 1, currentPage === 1)); 
  // Prima pagina

  pagination.appendChild(createBtn('◀', currentPage - 1, currentPage === 1)); 
  // Precedente

  const start = Math.max(1, currentPage - 2); 
  // Inizio range

  const end = Math.min(totalPages, currentPage + 2); 
  // Fine range

  for (let i = start; i <= end; i++) {
    pagination.appendChild(createBtn(i, i, false, i === currentPage)); 
    // Bottoni numerici
  }

  pagination.appendChild(
    createBtn('▶', currentPage + 1, currentPage === totalPages)
  ); 
  // Successiva

  pagination.appendChild(
    createBtn('⏭', totalPages, currentPage === totalPages)
  ); 
  // Ultima
}
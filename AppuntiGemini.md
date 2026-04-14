/* STATO GLOBALE DELL'APPLICAZIONE */
let currentOffset = 0; // Tiene traccia di quanti Pokémon abbiamo saltato nella paginazione
let currentPokemonList = []; // Array per memorizzare i dati completi dei Pokémon visualizzati
let totalPokemon = 0; // Numero totale di Pokémon esistenti restituito dall'API
let allPokemonNames = []; // Database locale di nomi per rendere la ricerca istantanea

/* COSTANTI DI CONFIGURAZIONE */
const limit = 20; // Numero di Pokémon da caricare per ogni singola pagina
let currentPage = 1; // Pagina attualmente visualizzata (parte da 1 per l'utente)
let totalPages = 0; // Totale pagine calcolato dividendo il totale Pokémon per il limite

/* RIFERIMENTI AGLI ELEMENTI HTML (BOTTONI NAVIGAZIONE) */
const primaryBtn = document.getElementById('primaPagina');
const previousBtn = document.getElementById('precedente');
const nextBtn = document.getElementById('successiva');
const lastBtn = document.getElementById('ultimaPagina');

/* RIFERIMENTI TEMA (DARK MODE) */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

/* RIFERIMENTI RICERCA */
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');

/* GESTIONE TEMA (DARK MODE): Al click inverte la classe e l'icona */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark'); // Applica o rimuove la classe CSS .dark
  const isDark = document.body.classList.contains('dark');
  themeIcon.textContent = isDark ? '☀️' : '🌙'; // Cambia l'emoji in base allo stato
});

/* INIZIALIZZAZIONE: Avvia le funzioni principali al caricamento del DOM */
document.addEventListener('DOMContentLoaded', () => {
  loadPokemonListForSearch(); // Carica tutti i nomi per i suggerimenti della ricerca
  loadpokemon(0);             // Carica i primi 20 Pokémon (offset 0)
  setupButtons();             // Configura i listener per i pulsanti di navigazione
  setupSearch();              // Configura i listener per la barra di ricerca
});

/* CARICAMENTO NOMI: Scarica la lista massiva di nomi per la ricerca locale */
async function loadPokemonListForSearch() {
  try {
    // Scarichiamo un numero elevato (10000) per avere tutti i nomi disponibili in memoria
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
    const data = await res.json();
    allPokemonNames = data.results.map((p) => p.name); // Estraiamo solo la proprietà "name"
  } catch (err) {
    console.error('Errore caricamento nomi Pokémon', err);
  }
}

/* CONFIGURAZIONE RICERCA: Gestisce input e tasto Invio */
function setupSearch() {
  if (!searchInput) return;

  // Evento "input": si attiva ogni volta che l'utente scrive o cancella una lettera
  searchInput.addEventListener('input', handleSearchInput);

  // Se l'utente preme Invio, cerca automaticamente il primo suggerimento disponibile
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = suggestionsBox.querySelector('.suggestion-item');
      if (first) {
        searchPokemon(first.textContent); // Esegue la ricerca
        suggestionsBox.innerHTML = '';    // Pulisce i suggerimenti
        searchInput.value = '';           // Pulisce l'input
      }
    }
  });
}

/* LOGICA SUGGERIMENTI (AUTOCOMPLETE) */
function handleSearchInput(e) {
  const value = e.target.value.toLowerCase(); // Convertiamo l'input in minuscolo

  if (!value) {
    suggestionsBox.innerHTML = ''; // Se l'input è vuoto, nascondiamo i suggerimenti
    return;
  }

  // Filtriamo i nomi che contengono le lettere cercate e limitiamo a 8 risultati
  const filtered = allPokemonNames
    .filter((name) => name.includes(value))
    .slice(0, 8);

  // Generiamo il codice HTML per ogni suggerimento
  suggestionsBox.innerHTML = filtered
    .map((name) => `<div class="suggestion-item">${name}</div>`)
    .join('');

  // Aggiungiamo il click su ogni suggerimento per avviare la ricerca specifica
  document.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', () => {
      searchPokemon(item.textContent);
      suggestionsBox.innerHTML = '';
      searchInput.value = '';
    });
  });
}

/* RICERCA SPECIFICA: Cerca un Pokémon per nome nell'API */
async function searchPokemon(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    displayPokemonTable([data]); // Mostriamo il risultato singolo passandolo come array
  } catch (err) {
    console.error('Pokemon non trovato');
  }
}

/* LOGICA NAVIGAZIONE: Pulsanti di paginazione */
function setupButtons() {
  primaryBtn.addEventListener('click', () => loadpokemon(0)); // Vai alla prima pagina

  previousBtn.addEventListener('click', () => {
    if (currentOffset > 0) { // Impedisce di andare sotto lo zero
      loadpokemon(currentOffset - limit);
    }
  });

  nextBtn.addEventListener('click', () => {
    loadpokemon(currentOffset + limit); // Vai alla pagina successiva
  });

  lastBtn.addEventListener('click', () => {
    const lastPageOffset = (totalPages - 1) * limit; // Calcola l'offset dell'ultima pagina
    loadpokemon(lastPageOffset);
  });
}

/* CORE FETCH: Carica i dati della pagina e i dettagli di ogni Pokémon */
async function loadpokemon(offset = 0) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) throw new Error('Errore nel caricamento');

    const data = await response.json();

    // Aggiornamento variabili di stato
    currentOffset = offset;
    currentPage = offset / limit + 1; // Esempio: offset 20 / limite 20 + 1 = Pagina 2
    totalPokemon = data.count;
    totalPages = Math.ceil(totalPokemon / limit); // Calcolo numero totale pagine

    // L'API principale dà solo nomi e link; facciamo fetch parallele per avere immagini e tipi
    const pokemonPromises = data.results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      return await detailResponse.json();
    });

    // Aspettiamo che TUTTE le fetch dei dettagli siano completate
    currentPokemonList = await Promise.all(pokemonPromises);

    displayPokemonTable(currentPokemonList); // Riempie la tabella
    renderPagination();                      // Aggiorna i pulsanti numerati
    updatePaginationInfo();                  // Aggiorna la stringa "Pagina X di Y"
  } catch (error) {
    console.error(error);
  }
}

/* DISPLAY TABELLA: Genera le righe HTML per ogni Pokémon */
function displayPokemonTable(list) {
  const tbody = document.getElementById('pokemonTableBody');
  tbody.innerHTML = ''; // Pulisce la tabella attuale

  list.forEach((pokemon) => {
    const row = document.createElement('tr'); // Crea un elemento riga
    const typesHTML = renderTypes(pokemon.types); // Formatta i tipi (es. Fire, Poison)

    // Inseriamo i dati convertendo unità di misura (decimetri -> metri, ettogrammi -> kg)
    row.innerHTML = `
      <td><img src="${pokemon.sprites.front_default}" class="pokemon-image"></td>
      <td class="pokemon-name">${pokemon.name}</td>
      <td>#${pokemon.id.toString().padStart(3, '0')}</td>
      <td>${typesHTML}</td>
      <td>${(pokemon.height / 10).toFixed(1)}m</td>
      <td>${(pokemon.weight / 10).toFixed(1)}kg</td>
    `;

    // Aggiungiamo l'evento click alla riga per aprire i dettagli
    row.addEventListener('click', () => openDetail(pokemon));
    tbody.appendChild(row); // Inserisce la riga nel corpo della tabella
  });
}

/* FORMATTA TIPI: Ritorna HTML con classi CSS corrispondenti ai tipi */
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

/* PANNELLO DETTAGLIO: Mostra informazioni estese con sfondo dinamico */
function openDetail(pokemon) {
  const panel = document.getElementById('detailPanel');

  // Mappa dei colori per lo stile visivo
  const typeColors = {
    fire: '#f97316', water: '#3b82f6', grass: '#22c55e', electric: '#facc15',
    rock: '#a16207', ground: '#b45309', psychic: '#ec4899', ice: '#38bdf8',
    dragon: '#6366f1', dark: '#374151', fairy: '#f472b6', normal: '#9ca3af',
    poison: '#a855f7', bug: '#84cc16', flying: '#60a5fa',
  };

  const types = pokemon.types.map((t) => t.type.name);
  const color1 = typeColors[types[0]] || '#ffffff';
  const color2 = typeColors[types[1]] || color1;

  // Applichiamo un gradiente basato sui colori del tipo di Pokémon
  panel.style.background = `linear-gradient(-45deg, ${color1}, ${color2}, ${color1})`;
  panel.style.backgroundSize = '400% 400%';
  panel.style.animation = 'gradientMove 8s ease infinite';
  panel.style.boxShadow = `0 0 30px ${color1}aa, 0 0 60px ${color2}66`;

  // Creiamo la lista delle statistiche base
  const stats = pokemon.stats
    .map((s) => `<p>${s.stat.name}: ${s.base_stat}</p>`)
    .join('');

  // Riempimento del pannello
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

  panel.classList.remove('hidden'); // Mostra il pannello rimuovendo la classe di nascondiglio
}

/* CHIUSURA DETTAGLI: Nasconde il pannello */
function closePanel() {
  document.getElementById('detailPanel').classList.add('hidden');
}

/* CHIUSURA SMART: Chiude se clicchi fuori dal pannello, ma non sulla riga della tabella */
document.addEventListener('click', (event) => {
  const panel = document.getElementById('detailPanel');
  if (panel.classList.contains('hidden')) return;
  if (panel.contains(event.target)) return;
  if (event.target.closest('tr')) return;

  panel.classList.add('hidden');
});

/* INFO PAGINAZIONE: Aggiorna il testo informativo */
function updatePaginationInfo() {
  const pagination = document.getElementById('paginationInfo');
  pagination.innerHTML = `
    Page ${currentPage} / ${totalPages} | Total Pokémon: ${totalPokemon}
  `;
}

/* RENDERIZZAZIONE PAGINAZIONE: Genera i numeri di pagina cliccabili */
function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = ''; // Pulisce i pulsanti precedenti

  // Funzione interna per creare un bottone configurato
  const createBtn = (text, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'btn';
    if (active) btn.classList.add('primary'); // Evidenzia la pagina corrente
    if (disabled) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      return btn;
    }
    btn.addEventListener('click', () => {
      loadpokemon((page - 1) * limit); // Carica la pagina cliccata ricalcolando l'offset
    });
    return btn;
  };

  // Logica per mostrare numeri vicini alla pagina attuale (range di 5 numeri)
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  pagination.appendChild(createBtn('⏮', 1, currentPage === 1)); // Pulsante "Prima Pagina"
  pagination.appendChild(createBtn('◀', currentPage - 1, currentPage === 1)); // Pulsante "Indietro"

  for (let i = start; i <= end; i++) {
    pagination.appendChild(createBtn(i, i, false, i === currentPage));
  }

  pagination.appendChild(createBtn('▶', currentPage + 1, currentPage === totalPages)); // Pulsante "Avanti"
  pagination.appendChild(createBtn('⏭', totalPages, currentPage === totalPages)); // Pulsante "Ultima Pagina"
}
let books = []; 
let favorites = new Set();
let showingFavorites = false;

const bookList = document.querySelector(".book-list");
const genreFilter = document.querySelector(".filters .filter-group:nth-child(2)");
const yearFilter = document.querySelector(".filters .filter-group:nth-child(4)");
const languageFilter = document.querySelector(".filters .filter-group:nth-child(5)");
const authorInput = document.querySelector("input[type='text']");
const sortSelect = document.querySelector(".sort-select");
const filterBtn = document.querySelector(".filter-btn");

fetch("books.json")
  .then(res => res.json())
  .then(data => {
    books = data;
    renderFilters();
    setupMobileFilters();
    relocateSortSelectResponsive();
    renderBooks();
  });

function renderFilters() {
  const genres = [...new Set(books.map(b => b.genre))];
  const years = [...new Set(books.map(b => b.year))];
  const languages = [...new Set(books.map(b => b.language))];

  genreFilter.innerHTML = "<h3>Genre</h3>" + genres.map(g => `
    <label><input type="checkbox" checked value="${g}"> ${g}</label>
  `).join("");

  yearFilter.innerHTML = "<h3>Year</h3>" + years.map(y => `
    <label><input type="checkbox" value="${y}"> ${y}</label>
  `).join("");

  languageFilter.innerHTML = "<h3>Language</h3>" + languages.map(l => `
    <label><input type="checkbox" checked value="${l}"> ${l}</label>
  `).join("");

  [genreFilter, yearFilter, languageFilter].forEach(group => {
    group.addEventListener("change", renderBooks);
  });

  authorInput.addEventListener("input", renderBooks);

  sortSelect.innerHTML = `
    <option value="">Sort by:</option>
    <option value="year">Year</option>
    <option value="genre">Genre</option>
  `;
  sortSelect.addEventListener("change", renderBooks);
}

function renderBooks() {
  const selectedGenres = Array.from(genreFilter.querySelectorAll("input:checked")).map(i => i.value);
  const selectedYears = Array.from(yearFilter.querySelectorAll("input:checked")).map(i => parseInt(i.value));
  const selectedLanguages = Array.from(languageFilter.querySelectorAll("input:checked")).map(i => i.value);
  const authorQuery = authorInput.value.trim().toLowerCase();

  let filtered = books.filter(b =>
    selectedGenres.includes(b.genre) &&
    (selectedYears.length === 0 || selectedYears.includes(b.year)) &&
    selectedLanguages.includes(b.language) &&
    b.author.toLowerCase().includes(authorQuery)
  );

  if (showingFavorites) {
    filtered = filtered.filter(b => favorites.has(b.title));
  }

  const sortBy = sortSelect.value;
  if (sortBy === "year") filtered.sort((a, b) => a.year - b.year);
  if (sortBy === "genre") filtered.sort((a, b) => a.genre.localeCompare(b.genre));

  bookList.innerHTML = "";
  filtered.forEach(book => {
    const bookDiv = document.createElement("div");
    bookDiv.className = "book";
    bookDiv.innerHTML = `
      <img src="${book.image}" alt="${book.title}">
      <div class="book-info">
        <p class="title">${book.title}</p>
        <p class="author">${book.author}</p>
      </div>
    `;
    bookDiv.addEventListener("click", () => openPopup(book));
    bookList.appendChild(bookDiv);
  });
}

function openPopup(book) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup-content";

  popup.innerHTML = `
    <button class="close">&times;</button>
    <img src="${book.image}" alt="${book.title}"/>
    <h2>${book.title}</h2>
    <p><strong>Author:</strong> ${book.author}</p>
    <p><strong>Genre:</strong> ${book.genre}</p>
    <p><strong>Year:</strong> ${book.year}</p>
    <p><strong>Language:</strong> ${book.language}</p>
    <button class="fav-btn">${favorites.has(book.title) ? "Remove from" : "Add to"} Favorites</button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  popup.querySelector(".close").onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  popup.querySelector(".fav-btn").onclick = () => {
    if (favorites.has(book.title)) favorites.delete(book.title);
    else favorites.add(book.title);
    overlay.remove();
    renderBooks();
  };
}

const favToggle = document.createElement("button");
favToggle.textContent = "Show Favorites";
favToggle.style.marginLeft = "1rem";
document.querySelector(".content-header").appendChild(favToggle);

favToggle.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  favToggle.textContent = showingFavorites ? "Back to All" : "Show Favorites";
  renderBooks();
});

function setupMobileFilters() {
  const desktopFilters = document.querySelector(".filters");
  const mobileFilters = document.createElement("div");
  mobileFilters.classList.add("mobile-filters");

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.className = "close-mobile";
  mobileFilters.appendChild(closeBtn);

  const filterContainer = document.createElement("div");
  filterContainer.innerHTML = desktopFilters.innerHTML;
  mobileFilters.appendChild(filterContainer);

  document.body.appendChild(mobileFilters);

  filterBtn.addEventListener("click", () => {
    syncMainFiltersToMobile();
    mobileFilters.classList.toggle("active");
  });

  closeBtn.addEventListener("click", () => {
    mobileFilters.classList.remove("active");
  });

  mobileFilters.addEventListener("input", () => {
    syncMobileFiltersToMain();
    renderBooks();
  });
  mobileFilters.addEventListener("change", () => {
    syncMobileFiltersToMain();
    renderBooks();
  });
}

function syncMobileFiltersToMain() {
  const desktopInputs = document.querySelectorAll(".filters input, .filters select");
  const mobileInputs = document.querySelectorAll(".mobile-filters input, .mobile-filters select");

  desktopInputs.forEach((input, i) => {
    if (input.type === "checkbox" || input.type === "radio") {
      input.checked = mobileInputs[i].checked;
    } else {
      input.value = mobileInputs[i].value;
    }
  });
}

function syncMainFiltersToMobile() {
  const desktopInputs = document.querySelectorAll(".filters input, .filters select");
  const mobileInputs = document.querySelectorAll(".mobile-filters input, .mobile-filters select");

  desktopInputs.forEach((input, i) => {
    if (input.type === "checkbox" || input.type === "radio") {
      mobileInputs[i].checked = input.checked;
    } else {
      mobileInputs[i].value = input.value;
    }
  });
}

function relocateSortSelectResponsive() {
  const sortSelect = document.querySelector(".sort-select");
  const contentHeader = document.querySelector(".content-header");
  const topControls = document.querySelector(".filter-sort-buttons");

  const moveSortSelect = () => {
    if (window.innerWidth <= 1023) {
      if (!topControls.contains(sortSelect)) {
        topControls.appendChild(sortSelect);
      }
    } else {
      if (!contentHeader.contains(sortSelect)) {
        contentHeader.appendChild(sortSelect);
      }
    }
  };

  moveSortSelect();
  window.addEventListener("resize", moveSortSelect);
}

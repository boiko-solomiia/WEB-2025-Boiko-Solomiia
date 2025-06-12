document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".add-item input");
  const addBtn = document.querySelector(".add-btn");
  const productList = document.querySelector(".product-list");
  const leftBadgeList = document.querySelectorAll(".right-column .badge-list")[0];
  const boughtBadgeList = document.querySelectorAll(".right-column .badge-list")[1];

  let items = JSON.parse(localStorage.getItem("buylist")) || [
    { id: 1, name: "Помідори", count: 2, bought: true },
    { id: 2, name: "Печиво", count: 2, bought: false },
    { id: 3, name: "Сир", count: 1, bought: false },
  ];

  let nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

  function saveState() {
    localStorage.setItem("buylist", JSON.stringify(items));
  }

  function renderList() {
    productList.innerHTML = "";
    leftBadgeList.innerHTML = "";
    boughtBadgeList.innerHTML = "";
    items.forEach(renderItem);
  }

  function renderItem(item) {
    const li = document.createElement("li");
    li.className = "product" + (item.bought ? " bought" : "");
    li.dataset.id = item.id;

    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.innerHTML = item.bought ? `<s>${item.name}</s>` : item.name;

    if (!item.bought) {
      nameSpan.addEventListener("click", () => editName(item.id, nameSpan));
    }

    const counterBox = document.createElement("div");
    counterBox.className = "counter-box";

    if (!item.bought) {
      const minusBtn = document.createElement("button");
      minusBtn.className = "count-btn minus";
      minusBtn.textContent = "−";
      minusBtn.disabled = item.count <= 1;
      minusBtn.onclick = () => {
        item.count--;
        saveState();
        updateItem(item.id);
      };

      const plusBtn = document.createElement("button");
      plusBtn.className = "count-btn plus";
      plusBtn.textContent = "+";
      plusBtn.onclick = () => {
        item.count++;
        saveState();
        updateItem(item.id);
      };

      counterBox.append(minusBtn, createCounter(item.count), plusBtn);
    } else {
      counterBox.append(createCounter(item.count));
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-btn" + (item.bought ? " single" : "");
    toggleBtn.textContent = item.bought ? "Не куплено" : "Куплено";
    toggleBtn.onclick = () => {
      item.bought = !item.bought;
      saveState();
      updateItem(item.id, true);
    };
    actions.append(toggleBtn);

    if (!item.bought) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "✖";
      removeBtn.onclick = () => {
        removeItem(item.id);
      };
      actions.append(removeBtn);
    }

    li.append(nameSpan, counterBox, actions);
    productList.appendChild(li);
    updateBadge();
  }

  function updateItem(id, rerender = false) {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;

    if (rerender) {
      renderList(); 
    } else {
      const li = productList.querySelector(`li[data-id='${id}']`);
      if (!li) return;

      const counter = li.querySelector(".counter");
      counter.textContent = items[index].count;

      const minusBtn = li.querySelector(".minus");
      if (minusBtn) minusBtn.disabled = items[index].count <= 1;

      updateBadge();
    }
  }

  function removeItem(id) {
    items = items.filter(item => item.id !== id);
    saveState();
    renderList();
  }

  function updateBadge() {
    leftBadgeList.innerHTML = "";
    boughtBadgeList.innerHTML = "";
    items.forEach((item) => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.innerHTML = `${item.bought ? `<s>${item.name}</s>` : item.name} <span class="count">${item.count}</span>`;
      (item.bought ? boughtBadgeList : leftBadgeList).appendChild(badge);
    });
  }

  function createCounter(count) {
    const span = document.createElement("span");
    span.className = "counter";
    span.textContent = count;
    return span;
  }

  function editName(id, span) {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;

    const input = document.createElement("input");
    input.type = "text";
    input.value = items[index].name;
    span.replaceWith(input);
    input.focus();
    input.addEventListener("blur", () => {
      const newName = input.value.trim();
      if (newName) items[index].name = newName;
      saveState();
      renderList();
    });
  }

  function addItem() {
    const name = input.value.trim();
    if (name) {
      items.push({ id: nextId++, name, count: 1, bought: false });
      input.value = "";
      input.focus();
      saveState();
      renderList();
    }
  }

  addBtn.addEventListener("click", () => addItem());
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addItem();
  });

  renderList();
});

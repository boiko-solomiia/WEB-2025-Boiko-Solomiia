document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".add-item input");
  const addBtn = document.querySelector(".add-btn");
  const productList = document.querySelector(".product-list");
  const leftBadgeList = document.querySelectorAll(".right-column .badge-list")[0];
  const boughtBadgeList = document.querySelectorAll(".right-column .badge-list")[1];
   //localStorage.removeItem("buylist"); 

  let items = JSON.parse(localStorage.getItem("buylist")) || [
    { name: "Помідори", count: 2, bought: true },
    { name: "Печиво", count: 2, bought: false },
    { name: "Сир", count: 1, bought: false },
  ];

  function saveState() {
    localStorage.setItem("buylist", JSON.stringify(items));
  }

  function renderList() {
    productList.innerHTML = "";
    leftBadgeList.innerHTML = "";
    boughtBadgeList.innerHTML = "";
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "product" + (item.bought ? " bought" : "");

      const nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.innerHTML = item.bought ? `<s>${item.name}</s>` : item.name;

      if (!item.bought) {
        nameSpan.addEventListener("click", () => editName(index, nameSpan));
      }

      const counterBox = document.createElement("div");
      counterBox.className = "counter-box";

      if (!item.bought) {
        const minusBtn = document.createElement("button");
        minusBtn.className = "count-btn minus";
        minusBtn.textContent = "−";
        minusBtn.disabled = item.count <= 1;
        minusBtn.onclick = () => { item.count--; saveState(); renderList(); };

        const plusBtn = document.createElement("button");
        plusBtn.className = "count-btn plus";
        plusBtn.textContent = "+";
        plusBtn.onclick = () => { item.count++; saveState(); renderList(); };

        counterBox.append(minusBtn);
        counterBox.append(createCounter(item.count));
        counterBox.append(plusBtn);
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
        renderList();
      };
      actions.append(toggleBtn);

      if (!item.bought) {
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "✖";
        removeBtn.onclick = () => {
          items.splice(index, 1);
          saveState();
          renderList();
        };
        actions.append(removeBtn);
      }

      li.append(nameSpan);
      li.append(counterBox);
      li.append(actions);
      productList.appendChild(li);

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

  function editName(index, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = items[index].name;
    span.replaceWith(input);
    input.focus();
    input.addEventListener("blur", () => {
      items[index].name = input.value.trim() || items[index].name;
      saveState();
      renderList();
    });
  }

  addBtn.addEventListener("click", () => addItem());
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addItem();
  });

  function addItem() {
    const name = input.value.trim();
    if (name) {
      items.push({ name, count: 1, bought: false });
      input.value = "";
      input.focus();
      saveState();
      renderList();
    }
  }

  renderList();
});

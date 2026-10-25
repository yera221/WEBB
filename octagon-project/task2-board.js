(function () {
  const MAX_DOING = 3;

  const COLUMNS = [
    { key: "todo", name: "To do" },
    { key: "doing", name: "In progress" },
    { key: "done", name: "Done" }
  ];

  const PRIORITY_NAMES = { 1: "High", 2: "Medium", 3: "Low" };

  let cards = [
    { id: 1, title: "Morning run 8 km", tag: "cardio", priority: 2, hours: 1, column: "todo", urgent: false },
    { id: 2, title: "Sparring 5 rounds", tag: "sparring", priority: 1, hours: 2, column: "doing", urgent: true },
    { id: 3, title: "Wrestling drills", tag: "grappling", priority: 2, hours: 1.5, column: "doing", urgent: false },
    { id: 4, title: "Heavy bag combinations", tag: "striking", priority: 3, hours: 1, column: "todo", urgent: false },
    { id: 5, title: "Jiu-jitsu rolling", tag: "grappling", priority: 1, hours: 2, column: "todo", urgent: true },
    { id: 6, title: "Weight cut check", tag: "nutrition", priority: 1, hours: 0.5, column: "done", urgent: true },
    { id: 7, title: "Film study of the rival", tag: "strategy", priority: 3, hours: 1, column: "todo", urgent: false },
    { id: 8, title: "Strength and conditioning", tag: "strength", priority: 2, hours: 1.5, column: "doing", urgent: false },
    { id: 9, title: "Shadow boxing", tag: "striking", priority: 3, hours: 0.5, column: "done", urgent: false },
    { id: 10, title: "Stretching and mobility", tag: "recovery", priority: 3, hours: 0.5, column: "done", urgent: false },
    { id: 11, title: "Pad work with the coach", tag: "striking", priority: 2, hours: 1, column: "todo", urgent: false },
    { id: 12, title: "Ice bath", tag: "recovery", priority: 3, hours: 0.5, column: "todo", urgent: false }
  ];

  let filterTag = "all";
  let searchText = "";
  let sortOn = false;
  let message = "";

  const board = document.getElementById("board");
  const searchInput = document.getElementById("search");
  const tagSelect = document.getElementById("tag-filter");
  const sortBtn = document.getElementById("sort-btn");
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress");
  const messageEl = document.getElementById("board-message");
  const emptyNote = document.getElementById("empty-note");

  function findCard(id) {
    for (const card of cards) {
      if (card.id === id) {
        return card;
      }
    }
    return null;
  }

  function columnIndex(key) {
    for (let i = 0; i < COLUMNS.length; i++) {
      if (COLUMNS[i].key === key) {
        return i;
      }
    }
    return -1;
  }

  function countIn(key) {
    let count = 0;
    for (const card of cards) {
      if (card.column === key) {
        count += 1;
      }
    }
    return count;
  }

  function calcStats() {
    let done = 0;
    let hoursAll = 0;
    let hoursDone = 0;
    for (const card of cards) {
      hoursAll += card.hours;
      if (card.column === "done") {
        done += 1;
        hoursDone += card.hours;
      }
    }
    return { total: cards.length, done: done, hoursAll: hoursAll, hoursDone: hoursDone };
  }

  function getVisible() {
    const list = [];
    for (const card of cards) {
      const tagOk = filterTag === "all" || card.tag === filterTag;
      const textOk = card.title.toLowerCase().includes(searchText);
      if (tagOk && textOk) {
        list.push(card);
      }
    }
    if (sortOn) {
      list.sort(function (a, b) {
        return a.priority - b.priority;
      });
    }
    return list;
  }

  function buildTagOptions() {
    const tags = [];
    for (const card of cards) {
      if (!tags.includes(card.tag)) {
        tags.push(card.tag);
      }
    }
    tagSelect.textContent = "";
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "All tags";
    tagSelect.appendChild(all);
    for (const tag of tags) {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagSelect.appendChild(option);
    }
  }

  function makeCard(card, colIndex) {
    const article = document.createElement("article");
    article.classList.add("card", "priority-" + card.priority);
    article.classList.toggle("finished", card.column === "done");
    article.dataset.id = card.id;

    const title = document.createElement("h4");
    title.textContent = card.title;
    if (card.urgent) {
      const badge = document.createElement("span");
      badge.classList.add("badge");
      badge.textContent = "URGENT";
      title.appendChild(badge);
    }
    article.appendChild(title);

    const meta = document.createElement("p");
    meta.textContent = "#" + card.tag + " | " + card.hours + " h | " + PRIORITY_NAMES[card.priority] + " priority";
    article.appendChild(meta);

    const buttons = document.createElement("div");
    buttons.classList.add("card-buttons");

    const left = document.createElement("button");
    left.type = "button";
    left.textContent = "<";
    left.dataset.id = card.id;
    left.dataset.action = "left";
    left.disabled = colIndex === 0;
    left.setAttribute("aria-label", "Move " + card.title + " left");
    buttons.appendChild(left);

    const right = document.createElement("button");
    right.type = "button";
    right.textContent = ">";
    right.dataset.id = card.id;
    right.dataset.action = "right";
    right.disabled = colIndex === COLUMNS.length - 1;
    right.setAttribute("aria-label", "Move " + card.title + " right");
    buttons.appendChild(right);

    article.appendChild(buttons);
    return article;
  }

  function render() {
    const visible = getVisible();
    const stats = calcStats();
    const percent = stats.total === 0 ? 0 : Math.round(stats.done / stats.total * 100);

    progressBar.max = stats.total;
    progressBar.value = stats.done;
    progressText.textContent = "Finished: " + stats.done + " of " + stats.total +
      " cards (" + percent + "%) | Hours done: " + stats.hoursDone + " of " + stats.hoursAll;

    sortBtn.textContent = "Sort by priority: " + (sortOn ? "on" : "off");
    sortBtn.classList.toggle("active", sortOn);

    messageEl.textContent = message;
    messageEl.classList.toggle("error", message !== "");

    emptyNote.hidden = visible.length !== 0;
    emptyNote.textContent = "Nothing found. Change the search or choose another tag.";

    board.textContent = "";
    for (let i = 0; i < COLUMNS.length; i++) {
      const col = COLUMNS[i];
      const section = document.createElement("section");
      section.classList.add("column");
      section.dataset.column = col.key;

      const heading = document.createElement("h3");
      let headingText = col.name + " (" + countIn(col.key);
      if (col.key === "doing") {
        headingText += "/" + MAX_DOING;
        section.classList.toggle("full", countIn("doing") >= MAX_DOING);
      }
      heading.textContent = headingText + ")";
      section.appendChild(heading);

      let shown = 0;
      for (const card of visible) {
        if (card.column === col.key) {
          section.appendChild(makeCard(card, i));
          shown += 1;
        }
      }
      if (shown === 0) {
        const empty = document.createElement("p");
        empty.classList.add("empty");
        empty.textContent = "No cards";
        section.appendChild(empty);
      }
      board.appendChild(section);
    }
  }

  function moveCard(id, direction) {
    const card = findCard(id);
    if (card === null) {
      return;
    }
    const index = columnIndex(card.column);
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= COLUMNS.length) {
      return;
    }
    const targetKey = COLUMNS[target].key;
    if (targetKey === "doing" && countIn("doing") >= MAX_DOING) {
      message = "In progress is full (max " + MAX_DOING + " cards). Finish a card first.";
      render();
      return;
    }
    card.column = targetKey;
    message = "";
    render();
  }

  board.addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-action]");
    if (btn === null || btn.disabled) {
      return;
    }
    moveCard(Number(btn.dataset.id), btn.dataset.action);
  });

  searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim().toLowerCase();
    message = "";
    render();
  });

  tagSelect.addEventListener("change", function () {
    filterTag = tagSelect.value;
    message = "";
    render();
  });

  sortBtn.addEventListener("click", function () {
    sortOn = !sortOn;
    render();
  });

  buildTagOptions();
  render();
})();

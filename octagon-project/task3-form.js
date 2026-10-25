(function () {
  const EVENTS = [
    { id: "night1", name: "Octagon Night 1" },
    { id: "title", name: "Heavyweight Title Night" },
    { id: "rookie", name: "Rookie Brawl" }
  ];

  const TICKET_TYPES = [
    { id: "general", name: "General", price: 50, seats: 20 },
    { id: "floor", name: "Floor", price: 120, seats: 6 },
    { id: "cage", name: "Cage side", price: 300, seats: 2 }
  ];

  const PROMOS = [
    { code: "CAGE10", percent: 10 },
    { code: "KO20", percent: 20 },
    { code: "FIGHT30", percent: 30 }
  ];

  const SOLD_OUT_DATES = ["2026-12-12", "2026-12-19"];
  const TAKEN_EMAILS = ["taken@mail.com", "fighter@gmail.com"];

  const CODE_PREFIX = "OCT-";
  const CODE_LENGTH = 6;
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function money(amount) {
    return "$" + amount.toFixed(2);
  }

  function todayString() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
  }

  const form = document.getElementById("ticket-form");
  form.noValidate = true;

  const eventEl = document.getElementById("event");
  const dateEl = document.getElementById("date");
  const typeEl = document.getElementById("type");
  const quantityEl = document.getElementById("quantity");
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const promoEl = document.getElementById("promo");
  const summary = document.getElementById("error-summary");
  const resultBox = document.getElementById("ticket-result");

  const fields = [eventEl, dateEl, typeEl, quantityEl, nameEl, emailEl, promoEl];
  const touched = new Set();

  function findEvent(id) {
    for (const item of EVENTS) {
      if (item.id === id) {
        return item;
      }
    }
    return null;
  }

  function findType(id) {
    for (const item of TICKET_TYPES) {
      if (item.id === id) {
        return item;
      }
    }
    return null;
  }

  function findPromo(code) {
    const clean = code.trim().toUpperCase();
    for (const item of PROMOS) {
      if (item.code === clean) {
        return item;
      }
    }
    return null;
  }

  function calcTotal(type, qty, promo) {
    let subtotal = 0;
    if (type !== null && qty > 0) {
      subtotal = type.price * qty;
    }
    let discount = 0;
    if (promo !== null) {
      discount = subtotal * promo.percent / 100;
    }
    return { subtotal: subtotal, discount: discount, total: subtotal - discount };
  }

  function makeOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
  }

  function buildEventOptions() {
    eventEl.textContent = "";
    eventEl.appendChild(makeOption("", "Choose an event"));
    for (const item of EVENTS) {
      eventEl.appendChild(makeOption(item.id, item.name));
    }
  }

  function buildTypeOptions() {
    typeEl.textContent = "";
    typeEl.appendChild(makeOption("", "Choose ticket type"));
    for (const item of TICKET_TYPES) {
      const left = item.seats === 0 ? "sold out" : item.seats + " left";
      typeEl.appendChild(makeOption(item.id, item.name + " - $" + item.price + " (" + left + ")"));
    }
  }

  function validateEvent(field) {
    if (field.validity.valueMissing) {
      return "Choose an event.";
    }
    return "";
  }

  function validateDate(field) {
    if (field.validity.valueMissing || field.validity.badInput) {
      return "Choose a valid date.";
    }
    if (field.value < todayString()) {
      return "The date cannot be in the past.";
    }
    if (SOLD_OUT_DATES.includes(field.value)) {
      return "This date is sold out. Pick another date.";
    }
    return "";
  }

  function validateType(field) {
    if (field.validity.valueMissing) {
      return "Choose a ticket type.";
    }
    return "";
  }

  function validateQuantity(field) {
    if (field.validity.valueMissing || field.validity.badInput) {
      return "Enter the number of tickets.";
    }
    if (field.validity.stepMismatch) {
      return "Use a whole number.";
    }
    if (field.validity.rangeUnderflow) {
      return "The minimum is " + field.min + " ticket.";
    }
    if (field.validity.rangeOverflow) {
      return "The maximum is " + field.max + " tickets per booking.";
    }
    const type = findType(typeEl.value);
    const qty = Number(field.value);
    if (type !== null && qty > type.seats) {
      if (type.seats === 0) {
        return type.name + " tickets are sold out.";
      }
      return "Only " + type.seats + " " + type.name + " seats left.";
    }
    return "";
  }

  function validateName(field) {
    const value = field.value.trim();
    if (field.validity.valueMissing || value === "") {
      return "Enter your full name.";
    }
    if (field.validity.patternMismatch) {
      return "Use letters, spaces and hyphens only.";
    }
    if (field.validity.tooShort) {
      return "The name is too short.";
    }
    const words = value.split(" ").filter(function (word) {
      return word.length >= 2;
    });
    if (words.length < 2) {
      return "Enter first and last name (two words).";
    }
    return "";
  }

  function validateEmail(field) {
    const value = field.value.trim().toLowerCase();
    if (field.validity.valueMissing || value === "") {
      return "Enter your email.";
    }
    if (field.validity.typeMismatch) {
      return "Enter a valid email, for example name@mail.com.";
    }
    const domain = value.split("@")[1];
    if (domain.indexOf(".") === -1) {
      return "The email domain must contain a dot, for example mail.com.";
    }
    if (TAKEN_EMAILS.includes(value)) {
      return "This email already has a booking.";
    }
    return "";
  }

  function validatePromo(field) {
    const value = field.value.trim();
    if (value === "") {
      return "";
    }
    if (findPromo(value) === null) {
      return "Unknown promo code.";
    }
    return "";
  }

  const validators = {
    event: validateEvent,
    date: validateDate,
    type: validateType,
    quantity: validateQuantity,
    name: validateName,
    email: validateEmail,
    promo: validatePromo
  };

  function checkField(field) {
    field.setCustomValidity("");
    const error = validators[field.id](field);
    field.setCustomValidity(error);
    document.getElementById(field.id + "-error").textContent = error;
    field.setAttribute("aria-invalid", error === "" ? "false" : "true");
    field.classList.toggle("invalid", error !== "");
    field.classList.toggle("valid", error === "" && field.value.trim() !== "");
    return error;
  }

  function clearErrors() {
    for (const field of fields) {
      field.setCustomValidity("");
      document.getElementById(field.id + "-error").textContent = "";
      field.removeAttribute("aria-invalid");
      field.classList.remove("invalid", "valid");
    }
  }

  function show(id, text) {
    document.getElementById(id).textContent = text === "" ? "-" : text;
  }

  function updatePreview() {
    const chosenEvent = findEvent(eventEl.value);
    const type = findType(typeEl.value);
    const promo = findPromo(promoEl.value);
    const qty = Number(quantityEl.value);
    const totals = calcTotal(type, qty, promo);

    show("pv-event", chosenEvent === null ? "" : chosenEvent.name);
    show("pv-date", dateEl.value);
    show("pv-type", type === null ? "" : type.name);
    show("pv-qty", quantityEl.value);
    show("pv-name", nameEl.value.trim());
    show("pv-email", emailEl.value.trim());
    show("pv-subtotal", money(totals.subtotal));
    show("pv-discount", promo === null ? "none" : promo.percent + "% off (-" + money(totals.discount) + ")");
    show("pv-total", money(totals.total));
  }

  function randomCode() {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_CHARS[randInt(0, CODE_CHARS.length - 1)];
    }
    return CODE_PREFIX + code;
  }

  function buildTicket(data) {
    resultBox.textContent = "";

    const ok = document.createElement("p");
    ok.classList.add("success");
    ok.textContent = "Booking confirmed. Keep your booking code.";
    resultBox.appendChild(ok);

    const ticket = document.createElement("article");
    ticket.classList.add("ticket");

    const title = document.createElement("h3");
    title.textContent = "Your ticket";
    ticket.appendChild(title);

    const code = document.createElement("p");
    code.classList.add("code");
    code.textContent = data.code;
    ticket.appendChild(code);

    const rows = [
      ["Event", data.event],
      ["Date", data.date],
      ["Type", data.type],
      ["Tickets", String(data.qty)],
      ["Name", data.name],
      ["Email", data.email],
      ["Promo", data.promo],
      ["Total", data.total]
    ];
    for (const row of rows) {
      const line = document.createElement("p");
      const label = document.createElement("strong");
      label.textContent = row[0] + ": ";
      line.appendChild(label);
      line.appendChild(document.createTextNode(row[1]));
      ticket.appendChild(line);
    }
    resultBox.appendChild(ticket);
  }

  form.addEventListener("blur", function (event) {
    const field = event.target;
    if (validators[field.id] === undefined) {
      return;
    }
    touched.add(field.id);
    checkField(field);
  }, true);

  form.addEventListener("input", function (event) {
    const field = event.target;
    updatePreview();
    if (validators[field.id] === undefined) {
      return;
    }
    if (touched.has(field.id)) {
      checkField(field);
    }
    if (field.id === "type" && touched.has("quantity")) {
      checkField(quantityEl);
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let errorCount = 0;
    let firstBad = null;
    for (const field of fields) {
      touched.add(field.id);
      if (checkField(field) !== "") {
        errorCount += 1;
        if (firstBad === null) {
          firstBad = field;
        }
      }
    }

    if (errorCount > 0) {
      summary.textContent = errorCount + (errorCount === 1 ? " error" : " errors") + " found. Fix them and try again.";
      summary.hidden = false;
      firstBad.focus();
      return;
    }

    const type = findType(typeEl.value);
    const chosenEvent = findEvent(eventEl.value);
    const promo = findPromo(promoEl.value);
    const qty = Number(quantityEl.value);
    const totals = calcTotal(type, qty, promo);

    const data = {
      code: randomCode(),
      event: chosenEvent.name,
      date: dateEl.value,
      type: type.name,
      qty: qty,
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      promo: promo === null ? "none" : promo.code + " (" + promo.percent + "% off)",
      total: money(totals.total)
    };

    type.seats -= qty;

    buildTicket(data);
    resultBox.focus();

    form.reset();
    touched.clear();
    clearErrors();
    buildTypeOptions();
    updatePreview();
    summary.hidden = true;
    summary.textContent = "";
  });

  dateEl.min = todayString();
  document.getElementById("date-hint").textContent = "Sold out dates: " + SOLD_OUT_DATES.join(", ");

  const promoCodes = [];
  for (const item of PROMOS) {
    promoCodes.push(item.code);
  }
  document.getElementById("promo-hint").textContent = "Available codes: " + promoCodes.join(", ");

  buildEventOptions();
  buildTypeOptions();
  updatePreview();
})();

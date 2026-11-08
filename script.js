"use strict";

/* North Star Bakery - Touchstone 4
   Feature: a saved "Pre-Order List" so customers can pick items while they browse
   and have them filled into the pre-order form.
   Also included: JavaScript form validation and localStorage. */

/* ==========================================================
   1. DATA (arrays and objects)
   ========================================================== */

// Array of objects: every item a customer can add to their list
const PRODUCTS = [
  { id: "signature-loaf",    name: "Signature Loaf",        category: "Breads",   price: "$7 to $9" },
  { id: "sourdough-boule",   name: "Sourdough Boule",       category: "Breads",   price: "$8 to $10" },
  { id: "dinner-rolls",      name: "Dinner Rolls (half dozen)", category: "Breads", price: "$6 to $8" },
  { id: "butter-croissant",  name: "Butter Croissant",      category: "Pastries", price: "$3 to $4" },
  { id: "fruit-danish",      name: "Seasonal Fruit Danish", category: "Pastries", price: "$4 to $5" },
  { id: "cinnamon-bun",      name: "Cinnamon Morning Bun",  category: "Pastries", price: "$4 to $5" },
  { id: "everyday-cake",     name: "Everyday Cake (6 inch)", category: "Cakes",   price: "$28 to $35" },
  { id: "celebration-cake",  name: "Celebration Cake (9 inch)", category: "Cakes", price: "$50 to $75" },
  { id: "cupcakes",          name: "Cupcakes (dozen)",      category: "Cakes",    price: "$30 to $40" },
  { id: "honey-oat-loaf",    name: "Honey Oat Loaf",        category: "Featured", price: "$7 to $9" }
];

// Object: the localStorage keys used by this site
const STORAGE_KEYS = {
  list: "northStarPreorderList",
  contact: "northStarContactInfo"
};

// Object: validation rules and error messages for each form field
const FIELD_RULES = {
  "full-name": {
    label: "Full name",
    required: true,
    minLength: 2,
    maxLength: 60,
    messages: {
      required: "Please enter your full name so we know who to look for at pickup.",
      minLength: "Your name needs at least 2 characters.",
      maxLength: "Your name can be up to 60 characters."
    }
  },
  email: {
    label: "Email address",
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    messages: {
      required: "Please enter your email so we can confirm your order.",
      pattern: "Please enter a valid email address, like name@example.com."
    }
  },
  phone: {
    label: "Phone number",
    required: false,
    pattern: /^\d{3}-\d{3}-\d{4}$/,
    messages: {
      pattern: "Please use the format 555-555-5555, or leave this blank."
    }
  },
  "request-type": {
    label: "Request type",
    required: true,
    messages: {
      required: "Please choose what kind of request this is."
    }
  },
  "pickup-date": {
    label: "Pickup date",
    required: false,
    messages: {
      required: "Please choose a pickup date for your pre-order.",
      past: "Please choose today or a later date."
    }
  },
  "item-details": {
    label: "Item details",
    required: true,
    minLength: 5,
    maxLength: 500,
    messages: {
      required: "Please tell us what you would like, or add items from the Products page.",
      minLength: "Please add a little more detail (at least 5 characters).",
      maxLength: "Please keep item details under 500 characters."
    }
  },
  "allergy-notes": {
    label: "Allergy notes",
    required: false,
    maxLength: 300,
    messages: {
      maxLength: "Please keep allergy notes under 300 characters."
    }
  }
};

/* ==========================================================
   2. LOCAL STORAGE HELPERS
   ========================================================== */

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be blocked (private mode), so the site still works without it.
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Nothing to do if storage is blocked.
  }
}

/* ==========================================================
   3. PRE-ORDER LIST FEATURE
   ========================================================== */

function getSavedList() {
  const saved = readStorage(STORAGE_KEYS.list, []);
  // Only keep ids that still match a real product
  return saved.filter(function (id) {
    return findProduct(id) !== undefined;
  });
}

function saveList(list) {
  writeStorage(STORAGE_KEYS.list, list);
}

function findProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

function isInList(id) {
  return getSavedList().includes(id);
}

function toggleItem(id) {
  const list = getSavedList();
  const index = list.indexOf(id);
  if (index === -1) {
    list.push(id);
  } else {
    list.splice(index, 1);
  }
  saveList(list);
  refreshListUI();
}

function removeItem(id) {
  saveList(getSavedList().filter(function (savedId) {
    return savedId !== id;
  }));
  refreshListUI();
}

function clearList() {
  removeStorage(STORAGE_KEYS.list);
  refreshListUI();
}

function listToText(list) {
  const names = list.map(function (id) {
    return findProduct(id).name;
  });
  return names.join(", ");
}

/* ----- Showing the list on the page ----- */

function updateButtons() {
  document.querySelectorAll(".add-item").forEach(function (button) {
    const product = findProduct(button.dataset.id);
    if (!product) {
      return;
    }
    const added = isInList(product.id);
    button.setAttribute("aria-pressed", String(added));
    button.textContent = added ? "Added ✓ (click to remove)" : "Add to pre-order list";
    button.setAttribute("aria-label",
      (added ? "Remove " : "Add ") + product.name + (added ? " from" : " to") + " pre-order list");
  });
}

function updateNavCount() {
  const link = document.querySelector('nav a[href="contact.html"]');
  if (!link) {
    return;
  }
  let badge = link.querySelector(".list-count");
  const count = getSavedList().length;
  if (count === 0) {
    if (badge) {
      badge.remove();
    }
    return;
  }
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "list-count";
    link.appendChild(badge);
  }
  badge.textContent = count;
  badge.setAttribute("aria-label", count + (count === 1 ? " item" : " items") + " in your list");
}

function renderListPanel() {
  const listElement = document.getElementById("list-items");
  const status = document.getElementById("list-status");
  const clearButton = document.getElementById("clear-list");
  if (!listElement || !status) {
    return; // This page has no list panel
  }

  const list = getSavedList();
  listElement.innerHTML = "";

  list.forEach(function (id) {
    const product = findProduct(id);
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = product.name + " (" + product.price + ")";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove " + product.name + " from your list");
    removeButton.addEventListener("click", function () {
      removeItem(id);
    });

    item.appendChild(text);
    item.appendChild(removeButton);
    listElement.appendChild(item);
  });

  if (list.length === 0) {
    status.textContent = "Your list is empty. Choose “Add to pre-order list” on any item and it will be saved here.";
  } else {
    status.textContent = "You have " + list.length + (list.length === 1 ? " item" : " items") +
      " saved. Your list stays here even if you leave the page.";
  }
  if (clearButton) {
    clearButton.hidden = list.length === 0;
  }
}

function refreshListUI() {
  updateButtons();
  updateNavCount();
  renderListPanel();
}

function setUpListFeature() {
  document.querySelectorAll(".add-item").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleItem(button.dataset.id);
    });
  });

  const clearButton = document.getElementById("clear-list");
  if (clearButton) {
    clearButton.addEventListener("click", clearList);
  }
  refreshListUI();
}

/* ==========================================================
   4. FORM: PRE-FILL FROM STORAGE
   ========================================================== */

function prefillForm(form) {
  // Remembered contact details from an earlier request
  const contact = readStorage(STORAGE_KEYS.contact, {});
  if (contact.name && !form.elements["full-name"].value) {
    form.elements["full-name"].value = contact.name;
  }
  if (contact.email && !form.elements.email.value) {
    form.elements.email.value = contact.email;
  }

  // Items chosen on the Products page
  const list = getSavedList();
  const details = form.elements["item-details"];
  const note = document.getElementById("prefill-note");
  if (list.length > 0 && !details.value.trim()) {
    details.value = "Pre-order: " + listToText(list);
    if (form.elements["request-type"].value === "") {
      form.elements["request-type"].value = "pre-order";
    }
    if (note) {
      note.textContent = "We filled this in from your pre-order list. You can edit it.";
    }
  }
}

function saveContactInfo(form) {
  writeStorage(STORAGE_KEYS.contact, {
    name: form.elements["full-name"].value.trim(),
    email: form.elements.email.value.trim()
  });
}

/* ==========================================================
   5. FORM VALIDATION
   ========================================================== */

function getTodayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return today.getFullYear() + "-" + month + "-" + day;
}

// Returns an error message string, or "" if the field is valid
function checkField(form, name) {
  const rules = FIELD_RULES[name];
  const field = form.elements[name];
  const value = field.value.trim();

  // The pickup date is required only for pre-orders
  const required = name === "pickup-date"
    ? form.elements["request-type"].value === "pre-order"
    : rules.required;

  if (required && value === "") {
    return rules.messages.required;
  }
  if (value === "") {
    return "";
  }
  if (rules.minLength && value.length < rules.minLength) {
    return rules.messages.minLength;
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.messages.maxLength;
  }
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.messages.pattern;
  }
  if (name === "pickup-date" && value < getTodayString()) {
    return rules.messages.past;
  }
  return "";
}

function showError(name, message) {
  const field = document.getElementById(name);
  const errorBox = document.getElementById(name + "-error");
  errorBox.textContent = message;
  field.setAttribute("aria-invalid", "true");
  field.classList.add("invalid");
}

function clearError(name) {
  const field = document.getElementById(name);
  const errorBox = document.getElementById(name + "-error");
  errorBox.textContent = "";
  field.removeAttribute("aria-invalid");
  field.classList.remove("invalid");
}

function validateField(form, name) {
  const message = checkField(form, name);
  if (message) {
    showError(name, message);
    return false;
  }
  clearError(name);
  return true;
}

function validateForm(form) {
  const names = Object.keys(FIELD_RULES);
  const invalid = names.filter(function (name) {
    return !validateField(form, name);
  });
  if (invalid.length > 0) {
    document.getElementById(invalid[0]).focus();
  }
  return invalid.length === 0;
}

function showFormMessage(text) {
  const box = document.getElementById("form-message");
  box.textContent = text;
  box.hidden = false;
  box.focus();
}

function handleSubmit(event, form) {
  event.preventDefault(); // always stop the page from reloading
  const box = document.getElementById("form-message");
  box.hidden = true;

  if (!validateForm(form)) {
    return; // keep everything the user typed so they can fix it
  }

  const name = form.elements["full-name"].value.trim();
  saveContactInfo(form);
  clearList(); // the list has been sent, so start fresh
  form.reset();
  prefillForm(form); // keep name and email remembered for next time
  document.getElementById("prefill-note").textContent = "";
  showFormMessage("Thank you, " + name + "! We got your request and will email you within one business day.");
}

function setUpForm() {
  const form = document.getElementById("preorder-form");
  if (!form) {
    return; // This page has no form
  }

  prefillForm(form);
  form.elements["item-details"].addEventListener("input", function () {
    document.getElementById("prefill-note").textContent = ""; // they edited it, so the note is no longer true
  });
  form.addEventListener("submit", function (event) {
    handleSubmit(event, form);
  });

  // After an error is shown, re-check that field as the user types so they can fix it.
  // (Errors are not shown on blur, because a message appearing could push the
  // Send button down and make a click on it miss.)
  Object.keys(FIELD_RULES).forEach(function (name) {
    const field = form.elements[name];
    field.addEventListener("input", function () {
      if (field.hasAttribute("aria-invalid")) {
        validateField(form, name);
      }
    });
  });

  // Pickup date depends on request type, so re-check it when that changes
  form.elements["request-type"].addEventListener("change", function () {
    if (form.elements["pickup-date"].hasAttribute("aria-invalid")) {
      validateField(form, "pickup-date");
    }
  });
}

/* ==========================================================
   6. START
   ========================================================== */

function init() {
  setUpListFeature();
  setUpForm();
}

document.addEventListener("DOMContentLoaded", init);

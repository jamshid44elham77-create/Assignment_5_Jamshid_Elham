
"use strict";

// Configuration
const TICKET_PRICES = {
    Standard: 30,
    VIP: 60
};

const PROMO_CODES = {
    SAVE10: 0.10,
    SAVE20: 0.20
};

const SOLD_OUT_DATES = ["2026-11-15"];

const INVENTORY = [
    { date: "2026-11-10", type: "Standard", remaining: 20 },
    { date: "2026-11-10", type: "VIP", remaining: 5 },
    { date: "2026-11-15", type: "Standard", remaining: 0 },
    { date: "2026-11-15", type: "VIP", remaining: 0 },
    { date: "2026-11-20", type: "Standard", remaining: 10 },
    { date: "2026-11-20", type: "VIP", remaining: 3 }
];

const TAKEN_EMAILS = ["booked@example.com"];

const form = document.querySelector("#ticket-form");
const result = document.querySelector("#ticket-result");
const formSummary = document.querySelector("#form-summary");

const fields = {
    fullName: document.querySelector("#full-name"),
    email: document.querySelector("#email"),
    event: document.querySelector("#event"),
    date: document.querySelector("#event-date"),
    type: document.querySelector("#ticket-type"),
    quantity: document.querySelector("#quantity"),
    promo: document.querySelector("#promo-code")
};

const errors = {
    fullName: document.querySelector("#name-error"),
    email: document.querySelector("#email-error"),
    event: document.querySelector("#event-error"),
    date: document.querySelector("#date-error"),
    type: document.querySelector("#type-error"),
    quantity: document.querySelector("#quantity-error"),
    promo: document.querySelector("#promo-error")
};

const touched = new Set();

// Use our own messages instead of browser-generated messages.
form.noValidate = true;

function getInventory(date, type) {
    return INVENTORY.find(function (item) {
        return item.date === date && item.type === type;
    });
}

function getPromoDiscount() {
    const code = fields.promo.value.trim().toUpperCase();
    return PROMO_CODES[code] || 0;
}

function calculateTotal() {
    const type = fields.type.value;
    const quantity = Number(fields.quantity.value);

    if (!Object.hasOwn(TICKET_PRICES, type) ||
        !Number.isInteger(quantity) || quantity < 1) {
        return 0;
    }

    const subtotal = TICKET_PRICES[type] * quantity;
    return subtotal * (1 - getPromoDiscount());
}

function validateField(name) {
    const field = fields[name];
    const value = field.value.trim();
    let message = "";

    if (name === "fullName") {
        const parts = value.split(/\s+/).filter(Boolean);

        if (parts.length < 2) {
            message = "Enter your first name and last name.";
        }
    }

    if (name === "email") {
        if (field.validity.valueMissing) {
            message = "Please enter your email address.";
        } else if (field.validity.typeMismatch) {
            message = "Enter a valid email address.";
        } else if (TAKEN_EMAILS.includes(value.toLowerCase())) {
            message = "This email already has a booking.";
        }
    }

    if (name === "event" && value === "") {
        message = "Please select an event.";
    }

    if (name === "date") {
        if (value === "") {
            message = "Please select an event date.";
        } else if (SOLD_OUT_DATES.includes(value)) {
            message = "This date is sold out. Choose another date.";
        }
    }

    if (name === "type") {
        if (value === "") {
            message = "Please select a ticket type.";
        } else if (!Object.hasOwn(TICKET_PRICES, value)) {
            message = "This ticket type is not available.";
        }
    }

    if (name === "quantity") {
        const quantity = Number(value);
        const type = fields.type.value;
        const date = fields.date.value;
        const stock = getInventory(date, type);

        if (value === "" || !Number.isInteger(quantity) || quantity < 1) {
            message = "Enter a whole number of at least 1.";
        } else if (quantity > 6) {
            message = "You can book at most 6 tickets.";
        } else if (SOLD_OUT_DATES.includes(date)) {
            message = "This date is sold out.";
        } else if (type !== "" && date !== "" &&
                   (!stock || quantity > stock.remaining)) {
            message = stock
                ? `Only ${stock.remaining} tickets remain.`
                : "Choose a valid date and ticket type first.";
        }
    }

    if (name === "promo" && value !== "") {
        if (!Object.hasOwn(PROMO_CODES, value.toUpperCase())) {
            message = "Unknown promo code. Try SAVE10 or SAVE20.";
        }
    }

    errors[name].textContent = message;

    if (touched.has(name)) {
        field.setAttribute("aria-invalid", String(message !== ""));
    }

    return message === "";
}

function validateAll() {
    let errorCount = 0;
    let firstInvalidField = null;

    for (const name of Object.keys(fields)) {
        touched.add(name);

        if (!validateField(name)) {
            errorCount++;

            if (firstInvalidField === null) {
                firstInvalidField = fields[name];
            }
        }
    }

    if (errorCount > 0) {
        formSummary.textContent =
            `Please correct ${errorCount} error(s) before continuing.`;
        formSummary.className = "message error";
        firstInvalidField.focus();
        return false;
    }

    formSummary.textContent = "";
    formSummary.className = "message";
    return true;
}

function updatePreview() {
    const name = fields.fullName.value.trim();
    const eventName = fields.event.value;
    const date = fields.date.value;
    const type = fields.type.value;
    const quantity = fields.quantity.value;
    const promo = fields.promo.value.trim().toUpperCase();

    document.querySelector("#preview-name").textContent =
        name || "Your name";

    document.querySelector("#preview-event").textContent =
        eventName || "Your event";

    document.querySelector("#preview-date").textContent =
        date || "Your date";

    document.querySelector("#preview-type").textContent =
        type || "Your ticket type";

    document.querySelector("#preview-quantity").textContent =
        `Quantity: ${quantity || 0}`;

    document.querySelector("#preview-total").textContent =
        `Estimated total: $${calculateTotal().toFixed(2)}`;

    document.querySelector("#preview-promo").textContent =
        promo && Object.hasOwn(PROMO_CODES, promo)
            ? `Promo discount: ${PROMO_CODES[promo] * 100}%`
            : "No promo code applied";
}

// First check a field on blur; then validate it on every input.
for (const name of Object.keys(fields)) {
    const field = fields[name];

    field.addEventListener("blur", function () {
        touched.add(name);
        validateField(name);
    });

    field.addEventListener("input", function () {
        if (touched.has(name)) {
            validateField(name);
        }

        // Changing a date or ticket type may affect quantity validity.
        if (name === "date" || name === "type") {
            if (touched.has("quantity")) {
                validateField("quantity");
            }
        }

        updatePreview();
    });

    field.addEventListener("change", function () {
        if (touched.has(name)) {
            validateField(name);
        }

        if (name === "date" || name === "type") {
            if (touched.has("quantity")) {
                validateField("quantity");
            }
        }

        updatePreview();
    });
}

function makeBookingCode() {
    const number = Math.floor(Math.random() * 900000) + 100000;
    return `EVT-${number}`;
}

function addResultLine(parent, label, value) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;
    paragraph.append(strong, document.createTextNode(value));
    parent.append(paragraph);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateAll()) {
        return;
    }

    const date = fields.date.value;
    const type = fields.type.value;
    const quantity = Number(fields.quantity.value);
    const stock = getInventory(date, type);

    // Check availability again before booking.
    if (!stock || quantity > stock.remaining) {
        errors.quantity.textContent = "Not enough tickets remain.";
        fields.quantity.setAttribute("aria-invalid", "true");
        formSummary.textContent = "Your booking could not be completed.";
        formSummary.className = "message error";
        fields.quantity.focus();
        return;
    }

    const email = fields.email.value.trim().toLowerCase();
    const bookingCode = makeBookingCode();
    const total = calculateTotal();

    // Build the result using DOM methods, not innerHTML.
    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Booking Confirmed!";
    result.append(heading);

    addResultLine(result, "Booking code", bookingCode);
    addResultLine(result, "Name", fields.fullName.value.trim());
    addResultLine(result, "Email", fields.email.value.trim());
    addResultLine(result, "Event", fields.event.value);
    addResultLine(result, "Date", date);
    addResultLine(result, "Ticket type", type);
    addResultLine(result, "Quantity", String(quantity));
    addResultLine(result, "Total paid", `$${total.toFixed(2)}`);

    stock.remaining -= quantity;
    TAKEN_EMAILS.push(email);

    result.classList.add("success");
    result.focus();

    form.reset();
    touched.clear();

    for (const name of Object.keys(fields)) {
        errors[name].textContent = "";
        fields[name].removeAttribute("aria-invalid");
    }

    formSummary.textContent = "Your ticket has been created successfully.";
    formSummary.className = "message success";

    updatePreview();
});

// Initial preview only; do not show validation errors on page load.
updatePreview();

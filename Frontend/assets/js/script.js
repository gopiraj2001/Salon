'use strict';

fetch('haircut.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('haircut-section-placeholder').innerHTML = html
  });

/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const toggleNavbar = () => navbar.classList.toggle("active");

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = () => navbar.classList.remove("active");

addEventOnElem(navLinks, "click", closeNavbar);



/**
 * header & back top btn active when scroll down to 100px
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", headerActive);



/**
 * filter function
 */

const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter]");

let lastClickedFilterBtn = filterBtns[0];

const filter = function () {
  lastClickedFilterBtn.classList.remove("active");
  this.classList.add("active");
  lastClickedFilterBtn = this;

  for (let i = 0; i < filterItems.length; i++) {
    if (this.dataset.filterBtn === filterItems[i].dataset.filter ||
      this.dataset.filterBtn === "all") {

      filterItems[i].style.display = "block";
      filterItems[i].classList.add("active");

    } else {

      filterItems[i].style.display = "none";
      filterItems[i].classList.remove("active");

    }
  }
}

addEventOnElem(filterBtns, "click", filter);

/** Haircut */
const modal = document.createElement('div');
modal.classList.add('image-modal');
document.body.appendChild(modal);

// Open image in modal
document.querySelectorAll('.open-image').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const imgSrc = this.getAttribute('href');
    modal.innerHTML = `<img src="${imgSrc}" alt=""><span class="close-btn"></span>`;
    modal.classList.add('active');
  });
});

// Close modal when clicked
modal.addEventListener('click', function () {
  modal.classList.remove('active');
});


const datePicker = document.getElementById("datePicker");
const timeSlots = document.getElementById("timeSlots");

// When user picks a date, load available slots
// When user picks a date, load available slots
datePicker.addEventListener("change", async () => {
  const date = datePicker.value;
  if (!date) return;

  try {
    const res = await fetch(`http://localhost:5000/available-slots/${date}`);
    const data = await res.json();

    // Reset dropdown
    timeSlots.innerHTML = '<option value="">Select time slot</option>';

    if (data.availableSlots.length > 0) {
      data.availableSlots.forEach(slot => {
        const [h, m] = slot.split(":");
        let hour = parseInt(h, 10);
        let suffix = hour >= 12 ? "PM" : "AM";
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;

        const formatted = `${hour}:${m} ${suffix}`;
        const option = document.createElement("option");
        option.value = slot;
        option.textContent = formatted;
        timeSlots.appendChild(option);
      });
    } else {
      // No slots free
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No slots available";
      timeSlots.appendChild(opt);
    }
  } catch (err) {
    console.error(err);
    alert("Could not fetch available slots. Try again later.");
  }
});


// Handle form submit
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const body = {
    name: formData.get("name"),
    contact: formData.get("phone"),
    email: formData.get("email"),
    category: formData.get("category"),
    date: formData.get("date"),
    time: formData.get("time"),
    message: formData.get("message")
  };

  try {
    const res = await fetch("http://localhost:5000/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    alert(data.message);
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert("Error booking appointment. Please try again.");
  }
});

if (data.availableSlots.length > 0) {
  data.availableSlots.forEach(slot => {
    const [h, m] = slot.split(":"); // slot like "09:00"
    let hour = parseInt(h);
    let suffix = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    const formatted = `${hour}:${m} ${suffix}`;

    const option = document.createElement("option");
    option.value = slot;
    option.textContent = formatted;
    timeSlots.appendChild(option);
  });
}


import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    if (req.method === "POST") {
      const { name, phone, service } = req.body;
      await connection.execute(
        "INSERT INTO bookings (name, phone, service) VALUES (?, ?, ?)",
        [name, phone, service]
      );
      res.status(200).json({ message: "Booking saved" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


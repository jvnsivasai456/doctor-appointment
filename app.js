// ==========================================================================
// MediBook Chennai - Client Application Logic
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Data Definitions & State
  const LOCATIONS = [
    "Anna Nagar",
    "Adyar",
    "Greams Road",
    "Vadapalani",
    "Alwarpet",
    "Kottivakkam",
    "Perumbakkam",
    "OMRS",
    "Sholinganallur",
  ];

  const CATEGORIES = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Neurology",
    "Gynecology",
  ];

  const CATEGORY_ICONS = {
    "General Medicine": "🩺",
    Cardiology: "❤️",
    Dermatology: "✨",
    Orthopedics: "🦴",
    Pediatrics: "👶",
    Neurology: "🧠",
    Gynecology: "🌸",
  };

  // State
  let selectedLocation = LOCATIONS[0]; // Default to first location
  let selectedCategory = "All";
  let searchQuery = "";
  let currentSort = "rating";
  let activeDoctorForBooking = null;

  // In-memory bookings store (as requested: store bookings in memory only)
  const inMemoryBookings = [];

  // 2. DOM Elements
  const locationSelect = document.getElementById("locationSelect");
  const categoryChipsContainer = document.getElementById("categoryChips");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const categoriesContainer = document.getElementById("categoriesContainer");
  const emptyState = document.getElementById("emptyState");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  const doctorCountSpan = document.getElementById("doctorCount");
  const locationNameSpan = document.getElementById("locationName");
  const activeFilterBadge = document.getElementById("activeFilterBadge");
  const bookingsBadge = document.getElementById("bookingsBadge");

  // Booking Modal Elements
  const bookingModal = document.getElementById("bookingModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBookingBtn = document.getElementById("cancelBookingBtn");
  const bookingFormSection = document.getElementById("bookingFormSection");
  const bookingSuccessSection = document.getElementById("bookingSuccessSection");
  const appointmentForm = document.getElementById("appointmentForm");
  const successDoneBtn = document.getElementById("successDoneBtn");

  const modalDocName = document.getElementById("modalDocName");
  const modalDocMeta = document.getElementById("modalDocMeta");
  const patientNameInput = document.getElementById("patientName");
  const patientPhoneInput = document.getElementById("patientPhone");
  const bookingDateInput = document.getElementById("bookingDate");
  const bookingSlotSelect = document.getElementById("bookingSlot");

  // Confirmation Elements
  const confirmToken = document.getElementById("confirmToken");
  const confirmPatient = document.getElementById("confirmPatient");
  const confirmDoctor = document.getElementById("confirmDoctor");
  const confirmClinic = document.getElementById("confirmClinic");
  const confirmDateTime = document.getElementById("confirmDateTime");
  const confirmFee = document.getElementById("confirmFee");

  // My Bookings Modal Elements
  const viewBookingsBtn = document.getElementById("viewBookingsBtn");
  const myBookingsModal = document.getElementById("myBookingsModal");
  const closeMyBookingsBtn = document.getElementById("closeMyBookingsBtn");
  const closeMyBookingsFooterBtn = document.getElementById("closeMyBookingsFooterBtn");
  const myBookingsList = document.getElementById("myBookingsList");

  // 3. Initialize Controls
  function initControls() {
    // Populate Location Dropdown (9 Locations)
    locationSelect.innerHTML = "";
    LOCATIONS.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc;
      option.textContent = `📍 ${loc}`;
      locationSelect.appendChild(option);
    });
    locationSelect.value = selectedLocation;

    // Populate Category Chips (All + 7 Categories)
    categoryChipsContainer.innerHTML = "";
    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "category-chip active";
    allChip.textContent = "All Categories";
    allChip.dataset.category = "All";
    categoryChipsContainer.appendChild(allChip);

    CATEGORIES.forEach((cat) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "category-chip";
      chip.innerHTML = `${CATEGORY_ICONS[cat] || "•"} ${cat}`;
      chip.dataset.category = cat;
      categoryChipsContainer.appendChild(chip);
    });

    // Set Default Booking Date (Tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    bookingDateInput.value = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.min = new Date().toISOString().split("T")[0];
  }

  // 4. Render Doctor Cards & Grouped Categories
  function renderView() {
    locationNameSpan.textContent = selectedLocation;

    // Filter by location
    let list = DOCTORS_DATA.filter((d) => d.location === selectedLocation);

    // Filter by search query (Doctor Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    // Filter by category chip
    if (selectedCategory !== "All") {
      list = list.filter((d) => d.category === selectedCategory);
      activeFilterBadge.textContent = `${selectedCategory} Filtered`;
    } else {
      activeFilterBadge.textContent = "All 7 Categories Active";
    }

    // Sort function
    list.sort((a, b) => {
      if (currentSort === "rating") return b.rating - a.rating;
      if (currentSort === "experience") return b.experienceYears - a.experienceYears;
      if (currentSort === "fee_asc") return a.consultationFee - b.consultationFee;
      if (currentSort === "fee_desc") return b.consultationFee - a.consultationFee;
      return 0;
    });

    doctorCountSpan.textContent = list.length;

    // Empty State Check
    if (list.length === 0) {
      categoriesContainer.innerHTML = "";
      emptyState.style.display = "block";
      return;
    } else {
      emptyState.style.display = "none";
    }

    // Group doctors by category
    const grouped = {};
    // Determine categories to show
    const categoriesToShow =
      selectedCategory === "All" ? CATEGORIES : [selectedCategory];

    categoriesToShow.forEach((cat) => {
      const docsInCat = list.filter((d) => d.category === cat);
      if (docsInCat.length > 0) {
        grouped[cat] = docsInCat;
      }
    });

    // Build HTML for grouped categories
    let html = "";
    Object.keys(grouped).forEach((cat) => {
      const docs = grouped[cat];
      const icon = CATEGORY_ICONS[cat] || "🩺";

      html += `
        <section class="category-section">
          <div class="category-header">
            <div class="category-header-title">
              <span class="category-icon-box">${icon}</span>
              <span>${cat}</span>
              <span class="category-badge">${docs.length} ${docs.length === 1 ? "Doctor" : "Doctors"}</span>
            </div>
          </div>
          <div class="doctor-grid">
            ${docs.map((d) => createDoctorCardHtml(d)).join("")}
          </div>
        </section>
      `;
    });

    categoriesContainer.innerHTML = html;

    // Attach Click Handlers to Book Buttons
    document.querySelectorAll(".btn-book").forEach((btn) => {
      btn.addEventListener("click", () => {
        const docId = btn.dataset.doctorId;
        const doctor = DOCTORS_DATA.find((d) => d.id === docId);
        if (doctor) {
          openBookingModal(doctor);
        }
      });
    });
  }

  // Doctor Card HTML Template
  function createDoctorCardHtml(doc) {
    const initials = doc.name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return `
      <div class="doctor-card" data-doctor-id="${doc.id}">
        <div>
          <div class="card-top">
            <div class="doctor-avatar-wrapper">
              <img
                src="${escapeHtml(doc.photo)}"
                alt="${escapeHtml(doc.name)}"
                class="doctor-img-thumb"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div class="doctor-avatar-circle" style="display: none;">${initials}</div>
              <span class="doctor-verified-badge" title="Verified Specialist">✓</span>
            </div>
            <div class="rating-pill">
              <span>★</span>
              <span>${doc.rating.toFixed(1)}</span>
            </div>
          </div>

          <h4 class="doctor-name">${escapeHtml(doc.name)}</h4>
          <p class="doctor-qual">${escapeHtml(doc.qualification)}</p>

          <div class="doctor-details-box">
            <div class="detail-item">
              <span class="detail-icon">🏥</span>
              <span class="detail-clinic">${escapeHtml(doc.clinicName)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏳</span>
              <span>${doc.experienceYears} Years Clinical Experience</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">🗓️</span>
              <span>${escapeHtml(doc.availableDays)} • ${escapeHtml(doc.timings)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📞</span>
              <span>${escapeHtml(doc.phone)}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="fee-container">
            <span class="fee-label">Consultation</span>
            <span class="fee-amount">₹${doc.consultationFee}</span>
          </div>
          <button class="btn-book" data-doctor-id="${doc.id}">
            <span>Book Appointment</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    `;
  }

  // 5. Booking Modal Handlers
  function openBookingModal(doctor) {
    activeDoctorForBooking = doctor;
    const modalDocSummary = document.querySelector(".modal-doc-summary");
    modalDocSummary.innerHTML = `
      <img src="${escapeHtml(doctor.photo)}" alt="${escapeHtml(doctor.name)}" class="modal-doc-thumb" onerror="this.style.display='none';" />
      <div>
        <div id="modalDocName" class="modal-doc-name">${escapeHtml(doctor.name)}</div>
        <div id="modalDocMeta" class="modal-doc-meta">${escapeHtml(doctor.category)} • ${escapeHtml(doctor.clinicName)} (Fee: ₹${doctor.consultationFee})</div>
      </div>
    `;

    // Reset Form
    bookingFormSection.style.display = "block";
    bookingSuccessSection.style.display = "none";
    patientNameInput.value = "";
    patientPhoneInput.value = "";

    bookingModal.classList.add("active");
  }

  function closeBookingModal() {
    bookingModal.classList.remove("active");
    activeDoctorForBooking = null;
  }

  appointmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!activeDoctorForBooking) return;

    const patientName = patientNameInput.value.trim();
    const patientPhone = patientPhoneInput.value.trim();
    const date = bookingDateInput.value;
    const slot = bookingSlotSelect.value;

    if (!patientName || !patientPhone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    // Generate in-memory booking
    const bookingId = `MB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      patientName,
      patientPhone,
      doctor: activeDoctorForBooking,
      date,
      slot,
      bookedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Store booking in memory only
    inMemoryBookings.push(newBooking);
    bookingsBadge.textContent = inMemoryBookings.length;

    // Show Confirmation Receipt
    confirmToken.textContent = `#${bookingId}`;
    confirmPatient.textContent = patientName;
    confirmDoctor.textContent = activeDoctorForBooking.name;
    confirmClinic.textContent = activeDoctorForBooking.clinicName;
    confirmDateTime.textContent = `${date} at ${slot}`;
    confirmFee.textContent = `₹${activeDoctorForBooking.consultationFee}`;

    bookingFormSection.style.display = "none";
    bookingSuccessSection.style.display = "block";
  });

  // Modal Close Buttons
  closeModalBtn.addEventListener("click", closeBookingModal);
  cancelBookingBtn.addEventListener("click", closeBookingModal);
  successDoneBtn.addEventListener("click", closeBookingModal);
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  // 6. "My Bookings" In-Memory Viewer
  viewBookingsBtn.addEventListener("click", () => {
    if (inMemoryBookings.length === 0) {
      myBookingsList.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--slate-400);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
          <p style="font-weight: 700; color: var(--slate-700);">No appointments booked yet</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Book any doctor above to see your in-memory reservations here.</p>
        </div>
      `;
    } else {
      myBookingsList.innerHTML = inMemoryBookings
        .map(
          (b) => `
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span style="font-weight: 800; color: var(--primary); font-size: 0.9rem;">#${b.id}</span>
              <span style="background: #d1fae5; color: #065f46; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 999px;">Confirmed</span>
            </div>
            <div style="font-weight: 700; color: var(--slate-900); font-size: 0.95rem;">${escapeHtml(b.doctor.name)}</div>
            <div style="font-size: 0.775rem; color: var(--slate-500); margin-bottom: 0.5rem;">${escapeHtml(b.doctor.clinicName)}</div>
            <div style="font-size: 0.8rem; display: flex; justify-content: space-between; border-top: 1px solid var(--slate-200); padding-top: 0.4rem;">
              <span>🗓️ ${b.date} at ${b.slot}</span>
              <span style="font-weight: 700; color: var(--slate-800);">Fee: ₹${b.doctor.consultationFee}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.2rem;">Patient: ${escapeHtml(b.patientName)} (${escapeHtml(b.patientPhone)})</div>
          </div>
        `
        )
        .join("");
    }
    myBookingsModal.classList.add("active");
  });

  closeMyBookingsBtn.addEventListener("click", () => {
    myBookingsModal.classList.remove("active");
  });
  closeMyBookingsFooterBtn.addEventListener("click", () => {
    myBookingsModal.classList.remove("active");
  });
  myBookingsModal.addEventListener("click", (e) => {
    if (e.target === myBookingsModal) myBookingsModal.classList.remove("active");
  });

  // 7. Event Listeners for Filters
  locationSelect.addEventListener("change", (e) => {
    selectedLocation = e.target.value;
    renderView();
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderView();
  });

  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderView();
  });

  categoryChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".category-chip");
    if (!chip) return;

    document
      .querySelectorAll(".category-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    selectedCategory = chip.dataset.category;
    renderView();
  });

  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    selectedCategory = "All";
    document
      .querySelectorAll(".category-chip")
      .forEach((c) => c.classList.remove("active"));
    const allChip = categoryChipsContainer.querySelector('[data-category="All"]');
    if (allChip) allChip.classList.add("active");
    renderView();
  });

  // Helper: HTML Escaping
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 8. Start Application
  initControls();
  renderView();
});

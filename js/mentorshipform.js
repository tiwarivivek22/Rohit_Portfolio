
/**
 * Mentorship Form JavaScript
 * Handles URL parameters, auto-fill, calendar, time slots, and Razorpay payment
 */

//  PLAN CONFIGURATION 

const PLAN_DATA = {
  "30min-quick": {
    planName: "30-min Quick Call",
    duration: "30min",
    durationLabel: "30 Minutes",
    price: 999,
    durationMinutes: 30
  },
  "1hr-strategy": {
    planName: "1-hour Strategy Session",
    duration: "1hr",
    durationLabel: "1 Hour",
    price: 1999,
    durationMinutes: 60
  },
  "startup-deep": {
    planName: "Startup Deep-Dive",
    duration: "2hr",
    durationLabel: "2 Hours",
    price: 4999,
    durationMinutes: 120
  }
};



let calendarDate = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let availableSlots = [];
let durationSelect = null;
let timeSlotsContainer = null;
let monthYearEl = null;
let datesContainerEl = null;
let initialPlanFromUrl = null;


const form = document.getElementById("mentorshipForm");
const nameInput = document.querySelector('input[name="fullName"]');
const contactInput = document.querySelector('input[name="contactNumber"]');
const emailInput = document.querySelector('input[name="emailAddress"]');
const priceInput = document.querySelector('input[name="priceAmount"]');
const planNameSelect = document.querySelector('select[name="planName"]');
const bookBtn = document.querySelector(".book-btn");
const agreeCheckbox = document.querySelector('.agree-card input[type="checkbox"]');

//  URL PARAMETER HANDLING

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    plan: params.get('plan') || null,
    planName: params.get('plan_name') || null,
    duration: params.get('duration') || null,
    price: params.get('price') || null
  };
}

function applyUrlParams() {
  const params = getUrlParams();

  // Get fresh references to elements
  durationSelect = document.querySelector('select[name="duration"]');

  if (params.plan && PLAN_DATA[params.plan]) {
    const planData = PLAN_DATA[params.plan];

    // Store initial plan from URL
    initialPlanFromUrl = params.plan;

    // Auto-fill fields from URL parameters
    if (planNameSelect) {
      planNameSelect.value = planData.planName;
      console.log("Plan Name set to:", planData.planName);
    }

    if (durationSelect) {
      durationSelect.value = params.duration || planData.duration;
      console.log("Duration set to:", params.duration || planData.duration);
    }

    if (priceInput) {
      priceInput.value = params.price || planData.price;
      console.log("Price set to:", params.price || planData.price);
    }

    // Lock duration and price fields (can't be edited manually)
    lockDurationAndPriceFields();

    // Mark fields as valid
    if (planNameSelect) planNameSelect.classList.add('valid');
    if (durationSelect) durationSelect.classList.add('valid');
    if (priceInput) priceInput.classList.add('valid');

    console.log("Plan auto-filled from URL:", planData.planName);
    console.log("Duration and price are locked. Change plan name to update them.");
  } else {
    console.log("No plan params found in URL");
    console.log("URL params:", params);
  }
}

function lockDurationAndPriceFields() {
  // Lock duration dropdown
  if (durationSelect) {
    durationSelect.classList.add('locked');
    durationSelect.disabled = true;
  }

  // Lock price input
  if (priceInput) {
    priceInput.classList.add('locked');
    priceInput.readOnly = true;
  }
}

function unlockDurationAndPriceFields() {
  // Unlock duration dropdown
  if (durationSelect) {
    durationSelect.classList.remove('locked');
    durationSelect.disabled = false;
  }

  // Unlock price input
  if (priceInput) {
    priceInput.classList.remove('locked');
    priceInput.readOnly = false;
  }
}

//  PLAN CHANGE HANDLER 

function setupPlanChangeHandler() {
  if (!planNameSelect) return;

  planNameSelect.addEventListener('change', function () {
    updateDurationAndPrice(this.value);
  });
}

function updateDurationAndPrice(planName) {
  if (planName === "30-min Quick Call") {
    if (durationSelect) durationSelect.value = "30min";
    if (priceInput) priceInput.value = 999;
    console.log("Plan changed to: 30-min Quick Call - Duration: 30min, Price: ₹999");
  } else if (planName === "1-hour Strategy Session") {
    if (durationSelect) durationSelect.value = "1hr";
    if (priceInput) priceInput.value = 1999;
    console.log("Plan changed to: 1-hour Strategy Session - Duration: 1hr, Price: ₹1999");
  } else if (planName === "Startup Deep-Dive") {
    if (durationSelect) durationSelect.value = "2hr";
    if (priceInput) priceInput.value = 4999;
    console.log("Plan changed to: Startup Deep-Dive - Duration: 2hr, Price: ₹4999");
  } else if (planName === "") {
    if (durationSelect) durationSelect.value = "";
    if (priceInput) priceInput.value = "";
    console.log("Plan reset - please select a plan");
  }

  // Always keep duration and price locked after change
  lockDurationAndPriceFields();

  if (durationSelect) validateField(durationSelect);
  if (priceInput) validateField(priceInput);

  if (selectedDate) {
    selectedTimeSlot = null;
    fetchAvailability();
  }
}

// CALENDAR 

function initCalendar() {
  monthYearEl = document.getElementById("monthYear");
  datesContainerEl = document.getElementById("dates");
  durationSelect = document.querySelector('select[name="duration"]');
  timeSlotsContainer = document.getElementById("timeSlots");

  if (!monthYearEl || !datesContainerEl) {
    console.error("Calendar elements not found!");
    return;
  }

  renderCalendar();

  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  if (prevBtn) {
    prevBtn.onclick = () => {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    };
  }

  if (durationSelect) {
    durationSelect.addEventListener("change", () => {
      validateField(durationSelect);
      selectedTimeSlot = null;
      fetchAvailability();
    });
  }

  console.log("Calendar initialized successfully");
}

function renderCalendar() {
  if (!datesContainerEl || !monthYearEl) return;

  datesContainerEl.innerHTML = "";

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  monthYearEl.innerText = calendarDate.toLocaleString("default", { month: "long" }) + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < firstDay; i++) {
    datesContainerEl.innerHTML += "<span></span>";
  }

  for (let d = 1; d <= lastDate; d++) {
    const span = document.createElement("span");
    span.innerText = d;
    span.className = "date-item";

    const checkDate = new Date(year, month, d);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      span.classList.add("disabled");
    } else {
      span.onclick = () => selectDate(span, checkDate);
    }

    if (selectedDate && d === selectedDate.getDate() &&
      month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
      span.classList.add("active");
    }

    datesContainerEl.appendChild(span);
  }
}

function selectDate(element, date) {
  document.querySelectorAll(".date-item").forEach(s => s.classList.remove("active"));
  element.classList.add("active");
  selectedDate = date;
  selectedTimeSlot = null;

  document.querySelectorAll(".time-slots button").forEach(b => b.classList.remove("active"));

  const calendarBox = document.querySelector(".calendar-box");
  if (calendarBox) calendarBox.classList.remove("validation-pending");

  fetchAvailability();
}

// TIME SLOTS FUNCTIONALITY 

function convertDurationToMinutes(value) {
  const durationMap = {
    "30min": 30,
    "1hr": 60,
    "2hr": 120,
    "4hr": 240,
    "8hr": 480
  };
  return durationMap[value] || 60;
}

async function fetchAvailability() {
  if (!selectedDate || !durationSelect || !durationSelect.value) {
    if (timeSlotsContainer) {
      timeSlotsContainer.innerHTML = '<p class="no-slots">Select a date and duration to see available slots</p>';
    }
    availableSlots = [];
    return;
  }

  if (timeSlotsContainer) {
    timeSlotsContainer.innerHTML = '<div class="loading-slots"><span class="spinner"></span> Checking availability...</div>';
  }

  const durationMinutes = convertDurationToMinutes(durationSelect.value);
  const dateStr = formatDateForAPI(selectedDate);

  console.log("Fetching availability for:", dateStr, "duration:", durationMinutes);

  try {
    const result = await getMentorshipAvailability(dateStr, durationMinutes);

    if (result.success && result.data && result.data.slots && result.data.slots.length > 0) {
      availableSlots = result.data.slots;
      renderTimeSlots(availableSlots);
    } else {
      console.log("No slots from API, generating mock slots...");
      availableSlots = generateMockSlots(durationMinutes);
      renderTimeSlots(availableSlots);
    }
  } catch (error) {
    console.error("Error fetching availability:", error);
    availableSlots = generateMockSlots(durationMinutes);
    renderTimeSlots(availableSlots);
  }
}

function generateMockSlots(durationMinutes) {
  const slots = [];
  const startHour = 10;
  const endHour = 18;

  let currentStart = startHour * 60;

  while (currentStart + durationMinutes <= endHour * 60) {
    const endTime = currentStart + durationMinutes;

    slots.push({
      startMinutes: currentStart,
      endMinutes: endTime,
      start: formatTime(currentStart),
      end: formatTime(endTime)
    });

    currentStart = endTime + 30;
  }

  return slots;
}

function formatTime(minutes) {
  let h = Math.floor(minutes / 60);
  let m = minutes % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;

  return `${h}:${m}`;
}

function renderTimeSlots(slots) {
  if (!timeSlotsContainer) return;

  timeSlotsContainer.innerHTML = "";

  if (!slots || slots.length === 0) {
    timeSlotsContainer.innerHTML = '<p class="no-slots">No slots available for this date</p>';
    return;
  }

  slots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-slot-btn";
    btn.dataset.start = slot.start;
    btn.dataset.end = slot.end;
    btn.innerText = `${slot.start} - ${slot.end}`;

    btn.onclick = () => {
      document.querySelectorAll(".time-slots button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTimeSlot = { start: slot.start, end: slot.end, startMinutes: slot.startMinutes, endMinutes: slot.endMinutes };

      const timeBox = document.querySelector(".time-box");
      if (timeBox) timeBox.classList.remove("validation-pending");
    };

    timeSlotsContainer.appendChild(btn);
  });
}

function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// FORM VALIDATION

const allInputs = form?.querySelectorAll("input[required], select[required], textarea[required]") || [];

function validateField(field) {
  if (!field) return true;

  const fieldContainer = field.closest(".field");
  const errorMessage = fieldContainer?.querySelector(".error-message");

  let isValid = true;
  let errorText = "";

  if (field.required && !field.value.trim()) {
    isValid = false;
    errorText = "This field is required";
  } else if (field.name === "fullName") {
    if (field.value.trim().length < 2) {
      isValid = false;
      errorText = "Name must be at least 2 characters";
    } else if (field.value.trim().length > 50) {
      isValid = false;
      errorText = "Name cannot exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(field.value)) {
      isValid = false;
      errorText = "Name should only contain letters";
    }
  } else if (field.name === "contactNumber") {
    if (field.value.length !== 10) {
      isValid = false;
      errorText = "Mobile number must be 10 digits";
    } else if (!/^[0-9]{10}$/.test(field.value)) {
      isValid = false;
      errorText = "Please enter a valid 10-digit number";
    }
  } else if (field.name === "emailAddress") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value)) {
      isValid = false;
      errorText = "Please enter a valid email address";
    }
  } else if (field.name === "priceAmount") {
    if (!field.value || parseInt(field.value) < 1) {
      isValid = false;
      errorText = "Please enter a valid price amount";
    }
  } else if (field.name === "planName" || field.name === "duration") {
    if (!field.value) {
      isValid = false;
      errorText = "Please select an option";
    }
  }

  if (isValid) {
    field.classList.remove("invalid");
    field.classList.add("valid");
    if (errorMessage) errorMessage.style.display = "none";
  } else {
    field.classList.remove("valid");
    field.classList.add("invalid");
    if (errorMessage) {
      errorMessage.textContent = errorText;
      errorMessage.style.display = "block";
    }
  }

  return isValid;
}

//INPUT FILTERS 

if (contactInput) {
  contactInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
}

if (priceInput) {
  priceInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
    if (this.value && parseInt(this.value) < 1) {
      this.value = "1";
    }
  });
}

if (nameInput) {
  nameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
  });
}

// RAZORPAY PAYMENT INTEGRATION 

let razorpayOrderId = null;
let razorpayPaymentId = null;
let razorpaySignature = null;

async function initiatePayment(bookingData) {
  try {
    const orderResult = await createPaymentOrder(bookingData.price);

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || "Failed to create payment order");
    }

    const order = orderResult.order;

    // Store order_id for use after payment
    razorpayOrderId = order.order_id;

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount * 100, // Convert to paise
      currency: "INR",
      name: "Mentorship Session",
      description: `${bookingData.plan_name} - ${bookingData.topic || 'General Discussion'}`,
      order_id: order.order_id,
      handler: async function (response) {
        // Razorpay returns these fields on successful payment
        razorpayPaymentId = response.razorpay_payment_id;
        razorpaySignature = response.razorpay_signature;
        razorpayOrderId = response.razorpay_order_id || razorpayOrderId;

        console.log("Payment successful:", {
          order_id: razorpayOrderId,
          payment_id: razorpayPaymentId,
          signature: razorpaySignature
        });

        await completeBooking({
          ...bookingData,
          payment_method: "razorpay",
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        });
      },
      prefill: {
        name: bookingData.full_name,
        email: bookingData.email,
        contact: bookingData.contact
      },
      notes: {
        date: bookingData.selected_date,
        time: bookingData.selected_start_time,
        plan: bookingData.plan_name
      },
      theme: {
        color: "#4F46E5"
      }
    };

    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
      console.error("Razorpay SDK not loaded!");
      showNotification("Payment system is loading. Please refresh the page or try again in a moment.", "error");
      resetSubmitButton();
      return;
    }

    // Open Razorpay checkout
    const rzp = new Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("Payment error:", error);
    showNotification("Payment initialization failed: " + error.message, "error");
    resetSubmitButton();
  }
}

async function completeBooking(bookingData) {
  const result = await bookMentorshipSession(bookingData);

  if (result.success) {
    const eventLink = result.data?.event_link;

    if (eventLink) {
      showNotification("Booking confirmed! Event link sent to your email.", "success");
      // Show event link in alert for user convenience
      alert(`Mentorship session booked successfully!\n\nAdd to Calendar: ${eventLink}`);
    } else {
      showNotification("Booking confirmed! Check your email for details.", "success");
      alert("Mentorship session booked successfully!");
    }

    resetForm();
  } else {
    showNotification("Booking failed: " + (result.error || "Unknown error"), "error");
  }

  resetSubmitButton();
}

// FORM SUBMISSION 

function resetSubmitButton() {
  if (bookBtn) {
    bookBtn.disabled = false;
    bookBtn.innerHTML = '<span class="btn-text">Book Your Session</span>';
  }
}

function resetForm() {
  if (form) form.reset();
  selectedDate = null;
  selectedTimeSlot = null;
  availableSlots = [];

  allInputs.forEach(input => {
    input.classList.remove("valid", "invalid");
  });

  document.querySelectorAll(".date-item").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));

  if (timeSlotsContainer) {
    timeSlotsContainer.innerHTML = '<p class="no-slots">Select a date and duration to see available slots</p>';
  }

  document.querySelectorAll('input[name="payment_method"]').forEach(r => r.checked = false);

  const termsCheckbox = document.querySelector('.agree-card input[type="checkbox"]');
  if (termsCheckbox) termsCheckbox.checked = false;
}

if (bookBtn) {
  bookBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    let isFormValid = true;
    let firstInvalidField = null;

    allInputs.forEach(input => {
      if (!validateField(input)) {
        isFormValid = false;
        if (!firstInvalidField) firstInvalidField = input;
      }
    });

    if (!selectedDate) {
      document.querySelector(".calendar-box")?.classList.add("validation-pending");
      isFormValid = false;
      if (!firstInvalidField) firstInvalidField = document.querySelector(".calendar-box");
    }

    if (!selectedTimeSlot) {
      document.querySelector(".time-box")?.classList.add("validation-pending");
      isFormValid = false;
    }

    const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
    const paymentSection = document.querySelector(".payment-section");
    if (!paymentMethod) {
      paymentSection?.classList.add("validation-pending");
      isFormValid = false;
    } else {
      paymentSection?.classList.remove("validation-pending");
    }

    const termsCheckbox = document.querySelector('.agree-card input[type="checkbox"]');
    const agreeSection = document.querySelector(".agree-section");
    if (!termsCheckbox?.checked) {
      agreeSection?.classList.add("validation-pending");
      isFormValid = false;
    } else {
      agreeSection?.classList.remove("validation-pending");
    }

    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
      if (firstInvalidField.focus) firstInvalidField.focus();
    }

    if (!isFormValid) {
      showNotification("Please fill in all required fields correctly", "error");
      return;
    }

    const durationValue = durationSelect?.value;
    const durationMinutes = convertDurationToMinutes(durationValue);
    const planText = planNameSelect?.options?.[planNameSelect.selectedIndex]?.text || planNameSelect?.value;

    const bookingData = {
      full_name: nameInput?.value.trim(),
      contact: contactInput?.value.trim(),
      email: emailInput?.value.trim(),
      plan_name: planText,
      price: parseInt(priceInput?.value),
      duration_minutes: durationMinutes,
      selected_date: formatDateForAPI(selectedDate),
      selected_start_time: selectedTimeSlot?.start,
      topic: document.querySelector('textarea[name="discussionTopic"]')?.value || ""
    };

    console.log("Submitting booking:", bookingData);

    bookBtn.disabled = true;
    bookBtn.innerHTML = '<span class="spinner"></span> Processing...';

    await initiatePayment(bookingData);
  });
}

// INITIALIZATION 

// Debug function to log all URL params
function debugUrlParams() {
  const params = new URLSearchParams(window.location.search);
  console.log("=== URL Debug ===");
  for (const [key, value] of params) {
    console.log(`${key}: ${value}`);
  }
  console.log("================");
}

document.addEventListener("DOMContentLoaded", () => {
  // Debug: Log URL params
  debugUrlParams();

  // Initialize calendar first (this sets up durationSelect)
  initCalendar();

  // Then apply URL params (now durationSelect should be available)
  applyUrlParams();

  // Setup plan change handler
  setupPlanChangeHandler();

  if (timeSlotsContainer) {
    timeSlotsContainer.innerHTML = '<p class="no-slots">Select a date and duration to see available slots</p>';
  }

  allInputs.forEach(input => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) validateField(input);
    });
  });

  console.log("Mentorship form initialized");
  console.log("Initial plan from URL:", initialPlanFromUrl);
});
// STYLES FOR SPINNER AND VALIDATION

const spinnerStyle = document.createElement("style");
spinnerStyle.textContent = `
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
    margin-right: 8px;
  }
  .loading-slots { text-align: center; padding: 20px; color: #666; }
  .loading-slots .spinner { border-color: #4F46E5; border-top-color: transparent; }
  .no-slots { text-align: center; padding: 20px; color: #999; font-size: 14px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .time-slot-btn { transition: all 0.2s ease; }
  .time-slot-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
  .book-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .date-item { cursor: pointer; padding: 5px; border-radius: 50%; }
  .date-item:hover:not(.disabled) { background-color: #e0e7ff; }
  .date-item.active { background-color: #4F46E5 !important; color: white !important; }
  .date-item.disabled { color: #ccc; cursor: not-allowed; }
`;
document.head.appendChild(spinnerStyle);

const validationStyles = document.createElement("style");
validationStyles.textContent = `
  .field input.invalid, .field select.invalid, .field textarea.invalid {
    border-color: #e74c3c !important; background: #fff5f5 !important;
  }
  .field input.valid, .field select.valid, .field textarea.valid {
    border-color: #27ae60 !important; background: #f0fff4 !important;
  }
  .error-message { display: none; color: #e74c3c; font-size: 12px; margin-top: 5px; padding-left: 4px; }
  .validation-pending { border: 2px dashed #e74c3c !important; border-radius: 12px; padding: 10px; }
  .payment-section.validation-pending h3 { color: #e74c3c; }
  .agree-section.validation-pending .agree-card { border: 2px dashed #e74c3c; border-radius: 8px; padding: 10px; }
`;
document.head.appendChild(validationStyles);

document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.querySelector(".payment-section")?.classList.remove("validation-pending");
  });
});

if (agreeCheckbox) {
  agreeCheckbox.addEventListener("change", () => {
    document.querySelector(".agree-section")?.classList.remove("validation-pending");
  });
}

console.log("Mentorship form JS loaded successfully!");


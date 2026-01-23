/* CALENDAR  */

const monthYear = document.getElementById("monthYear");
const dates = document.getElementById("dates");

let date = new Date();
let selectedDate = null;

function renderCalendar() {
  dates.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.innerText =
    date.toLocaleString("default", { month: "long" }) + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    dates.innerHTML += "<span></span>";
  }

  for (let d = 1; d <= lastDate; d++) {
    const span = document.createElement("span");
    span.innerText = d;

    // Disable past dates
    const today = new Date();
    const checkDate = new Date(year, month, d);
    if (checkDate < today.setHours(0, 0, 0, 0)) {
      span.classList.add("disabled");
    } else {
      span.onclick = () => {
        document
          .querySelectorAll(".dates span")
          .forEach(s => s.classList.remove("active"));
        span.classList.add("active");
        selectedDate = new Date(year, month, d);
        validateField(span.closest('.calendar-box').querySelector('input, select, textarea'));
      };
    }

    if (selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
      span.classList.add("active");
    }

    dates.appendChild(span);
  }
}

document.getElementById("prevMonth").onclick = () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
};

renderCalendar();

/* TIME SLOTS  */

const durationSelect = document.querySelector(".right select");
const timeSlotsContainer = document.getElementById("timeSlots");

durationSelect.addEventListener("change", generateTimeSlots);

function generateTimeSlots() {
  timeSlotsContainer.innerHTML = "";

  let gap;
  // Match with the new option values
  if (durationSelect.value === "30min") gap = 30;
  else if (durationSelect.value === "1hr") gap = 60;
  else if (durationSelect.value === "2hr") gap = 120;
  else if (durationSelect.value === "4hr") gap = 240;
  else if (durationSelect.value === "8hr") gap = 480;
  else return;

  let startMinutes = 10 * 60; // 10:00 AM
  let endMinutes = 18 * 60;   // 6:00 PM

  while (startMinutes + gap <= endMinutes) {
    const endTime = startMinutes + gap;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.start = startMinutes;
    btn.dataset.end = endTime;
    btn.innerText = formatTime(startMinutes) + " - " + formatTime(endTime);

    btn.onclick = () => {
      document
        .querySelectorAll(".time-slots button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      validateField(durationSelect);
    };

    timeSlotsContainer.appendChild(btn);
    startMinutes = endTime;
  }
}

function formatTime(minutes) {
  let h = Math.floor(minutes / 60);
  let m = minutes % 60;
  let ampm = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;
  m = m < 10 ? "0" + m : m;

  return `${h}:${m} ${ampm}`;
}

/* FORM VALIDATION */

// Get all form fields
const form = document.getElementById("mentorshipForm");
const nameInput = document.querySelector('input[name="fullName"]');
const contactInput = document.querySelector('input[name="contactNumber"]');
const emailInput = document.querySelector('input[name="emailAddress"]');
const priceInput = document.querySelector('input[name="priceAmount"]');

// Input filtering for numeric fields
contactInput.addEventListener("input", function (e) {
  // Remove any non-numeric characters
  this.value = this.value.replace(/[^0-9]/g, "");
});

priceInput.addEventListener("input", function (e) {
  // Ensure only positive numbers
  this.value = this.value.replace(/[^0-9]/g, "");
  if (this.value && parseInt(this.value) < 1) {
    this.value = "1";
  }
});

// Name input - only allow letters and spaces
nameInput.addEventListener("input", function (e) {
  this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
});

// Real-time validation on blur
const allInputs = form.querySelectorAll("input[required], select[required], textarea[required]");
allInputs.forEach(input => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) {
      validateField(input);
    }
  });
});

function validateField(field) {
  const fieldContainer = field.closest(".field");
  const errorMessage = fieldContainer.querySelector(".error-message");

  let isValid = true;
  let errorText = "";

  // Check if field is required and empty
  if (field.required && !field.value.trim()) {
    isValid = false;
    errorText = "This field is required";
  }
  // Check specific validations
  else if (field.name === "fullName") {
    if (field.value.trim().length < 2) {
      isValid = false;
      errorText = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(field.value)) {
      isValid = false;
      errorText = "Name should only contain letters";
    }
  }
  else if (field.name === "contactNumber") {
    if (field.value.length !== 10) {
      isValid = false;
      errorText = "Mobile number must be 10 digits";
    } else if (!/^[0-9]{10}$/.test(field.value)) {
      isValid = false;
      errorText = "Please enter a valid 10-digit number";
    }
  }
  else if (field.name === "emailAddress") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value)) {
      isValid = false;
      errorText = "Please enter a valid email address";
    }
  }
  else if (field.name === "priceAmount") {
    if (!field.value || parseInt(field.value) < 1) {
      isValid = false;
      errorText = "Please enter a valid price amount";
    }
  }
  else if (field.name === "planName" || field.name === "duration") {
    if (!field.value) {
      isValid = false;
      errorText = "Please select an option";
    }
  }

  // Update UI
  if (isValid) {
    field.classList.remove("invalid");
    field.classList.add("valid");
    if (errorMessage) {
      errorMessage.style.display = "none";
    }
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

function validateDateSelection() {
  const timeSlots = document.querySelectorAll(".time-slots button");
  const hasSelectedTime = document.querySelector(".time-slots button.active");
  const calendarBox = document.querySelector(".calendar-box");

  if (!selectedDate || !hasSelectedTime) {
    calendarBox.classList.add("validation-pending");
    return false;
  }
  calendarBox.classList.remove("validation-pending");
  return true;
}

// Form submission
document.querySelector(".book-btn").addEventListener("click", function (e) {
  e.preventDefault();

  let isFormValid = true;
  let firstInvalidField = null;

  // Validate all required fields
  allInputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
      if (!firstInvalidField) {
        firstInvalidField = input;
      }
    }
  });

  // Validate date and time selection
  if (!validateDateSelection()) {
    isFormValid = false;
  }

  // Validate payment method
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
  const paymentSection = document.querySelector(".payment-section");
  if (!paymentMethod) {
    paymentSection.classList.add("validation-pending");
    isFormValid = false;
  } else {
    paymentSection.classList.remove("validation-pending");
  }

  // Scroll to first invalid field
  if (firstInvalidField) {
    firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalidField.focus();
  }

  if (isFormValid) {
    // Collect form data
    const formData = {
      fullName: nameInput.value,
      contactNumber: contactInput.value,
      emailAddress: emailInput.value,
      planName: document.querySelector('select[name="planName"]').options[document.querySelector('select[name="planName"]').selectedIndex].text,
      priceAmount: priceInput.value,
      discussionTopic: document.querySelector('textarea[name="discussionTopic"]').value,
      duration: document.querySelector('select[name="duration"]').options[document.querySelector('select[name="duration"]').selectedIndex].text,
      selectedDate: selectedDate ? selectedDate.toLocaleDateString() : null,
      selectedTime: document.querySelector(".time-slots button.active")?.innerText || null,
      paymentMethod: paymentMethod?.value || null
    };

    console.log("Form Submitted Successfully:", formData);
    alert("Booking Button Clicked Successfully ✅\n\nForm is valid and ready for submission!");
  } else {
    alert("Please fill in all required fields correctly ❌");
  }
});

// Add validation styles for date/time/payment
const style = document.createElement("style");
style.textContent = `
  .field input.invalid,
  .field select.invalid,
  .field textarea.invalid {
    border-color: #e74c3c !important;
    background: #fff5f5 !important;
  }
  
  .field input.valid,
  .field select.valid,
  .field textarea.valid {
    border-color: #27ae60 !important;
    background: #f0fff4 !important;
  }
  
  .error-message {
    display: none;
    color: #e74c3c;
    font-size: 12px;
    margin-top: 5px;
    padding-left: 4px;
  }
  
  .validation-pending {
    border: 2px dashed #e74c3c !important;
    border-radius: 12px;
    padding: 10px;
  }
  
  .payment-section.validation-pending h3 {
    color: #e74c3c;
  }
`;
document.head.appendChild(style);


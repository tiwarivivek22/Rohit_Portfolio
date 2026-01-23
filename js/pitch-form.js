/**
 * Pitch Form Validation and Submission Handler
 * Enhanced with proper validation, real-time feedback
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize pitch form if it exists
    const pitchForm = document.querySelector('.pitch-form');
    if (pitchForm) {
        initPitchForm(pitchForm);
    }
});

/**
 * Initialize Pitch Form with all validations and event handlers
 */
function initPitchForm(form) {
    // Cache DOM elements
    const elements = {
        name: document.getElementById('name'),
        company: document.getElementById('company'),
        sector: document.getElementById('sector'),
        investment: document.getElementById('investment'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        pitchSummary: document.getElementById('pitch-summary'),
        uploadBox: document.getElementById('upload-box'),
        fileInput: document.getElementById('file-upload'),
        submitBtn: document.getElementById('submit-btn'),
        formMessage: document.getElementById('form-message')
    };

    // Track form state
    let uploadedFile = null;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const PITCH_SUMMARY_MIN_CHARS = 50;
    const PITCH_SUMMARY_MAX_CHARS = 2000;

    // FIELD VALIDATION FUNCTIONS
    /**
     * Validate name field
     * Rules: Minimum 2 characters, alphabets and spaces only
     */
    function validateName(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Name is required' };
        }

        if (trimmed.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }

        // Allow alphabets, spaces, hyphens, apostrophes, and periods
        const nameRegex = /^[a-zA-Z][a-zA-Z\s\-'.]{1,49}$/;
        if (!nameRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid name (letters, spaces, hyphens only)' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate company name
     * Rules: Minimum 2 characters
     */
    function validateCompany(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Company name is required' };
        }

        if (trimmed.length < 2) {
            return { isValid: false, message: 'Company name must be at least 2 characters' };
        }

        // Allow alphanumeric, spaces, and common business characters
        const companyRegex = /^[a-zA-Z0-9][a-zA-Z0-9\s\-'.&()]{1,99}$/;
        if (!companyRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid company name' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate sector field
     * Rules: Minimum 2 characters, should not be numeric only
     */
    function validateSector(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Sector is required' };
        }

        if (trimmed.length < 2) {
            return { isValid: false, message: 'Sector must be at least 2 characters' };
        }

        // Should not be purely numeric
        const numericRegex = /^\d+$/;
        if (numericRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid sector (not just numbers)' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate investment amount
     * Rules: Should match common formats like ₹10 Lakhs, ₹1 Crore, $100K, etc.
     */
    function validateInvestment(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Investment amount is required' };
        }

        if (trimmed.length < 3) {
            return { isValid: false, message: 'Please enter a valid investment amount' };
        }

        // Allow currency symbols, numbers, and common terms
        const investmentRegex = /^[₹$€£]?\s*\d+(\.\d+)?\s*(Lakhs?|Crore[s]?|K|Million[s]?|Billion[s]?|Thousand[s]?)?$/i;
        if (!investmentRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid amount (e.g., ₹10 Lakhs, ₹1 Crore)' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate email address
     * Rules: Standard email format validation
     */
    function validateEmail(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Email is required' };
        }

        // Standard email regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

        if (!emailRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        // Additional checks for common issues
        if (trimmed.length > 254) {
            return { isValid: false, message: 'Email address is too long' };
        }

        const [local, domain] = trimmed.split('@');
        if (local.length > 64) {
            return { isValid: false, message: 'Email local part is too long' };
        }

        if (domain.length > 253) {
            return { isValid: false, message: 'Email domain is too long' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate phone number
     * Rules: Accept international formats, 10-15 digits
     */
    function validatePhone(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Phone number is required' };
        }

        // Remove all non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');

        // Check for valid digit count (10-15)
        if (digitsOnly.length < 10) {
            return { isValid: false, message: 'Phone number must have at least 10 digits' };
        }

        if (digitsOnly.length > 15) {
            return { isValid: false, message: 'Phone number is too long' };
        }

        // Check for invalid patterns (all same digit, sequential, etc.)
        const invalidPatterns = /^(.)\1{9,}$/; // All same digit repeated 10+ times
        if (invalidPatterns.test(digitsOnly)) {
            return { isValid: false, message: 'Please enter a valid phone number' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate pitch summary
     * Rules: Minimum 50 characters, maximum 2000 characters
     */
    function validatePitchSummary(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Pitch summary is required' };
        }

        if (trimmed.length < PITCH_SUMMARY_MIN_CHARS) {
            return { isValid: false, message: `Please provide at least ${PITCH_SUMMARY_MIN_CHARS} characters` };
        }

        if (trimmed.length > PITCH_SUMMARY_MAX_CHARS) {
            return { isValid: false, message: `Maximum ${PITCH_SUMMARY_MAX_CHARS} characters allowed` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate file upload
     */
    function validateFile(file) {
        if (!file) {
            // File is optional, so this is valid
            return { isValid: true, message: '' };
        }

        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return {
                isValid: false,
                message: 'Invalid file type. Please upload PDF, PPT, or DOCX only.'
            };
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            return {
                isValid: false,
                message: `File size (${sizeInMB}MB) exceeds 10MB limit`
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        const results = {
            name: validateName(elements.name.value),
            company: validateCompany(elements.company.value),
            sector: validateSector(elements.sector.value),
            investment: validateInvestment(elements.investment.value),
            email: validateEmail(elements.email.value),
            phone: validatePhone(elements.phone.value),
            pitchSummary: validatePitchSummary(elements.pitchSummary.value),
            file: validateFile(uploadedFile)
        };

        // Check if all fields are valid
        const isFormValid = Object.values(results).every(r => r.isValid);

        return { isValid: isFormValid, results };
    }

    // UI UPDATE FUNCTIONS
    /**
     * Update field UI with validation result
     */
    function updateFieldUI(fieldElement, result, showSuccess = true) {
        const fieldContainer = fieldElement.parentElement;

        // Remove existing classes
        fieldContainer.classList.remove('valid', 'error');

        // Add appropriate class
        if (result.isValid) {
            if (showSuccess && fieldElement.value.trim()) {
                fieldContainer.classList.add('valid');
            }
        } else {
            fieldContainer.classList.add('error');
        }

        // Update error message
        const errorElement = fieldContainer.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = result.message;
        }
    }

    /**
     * Update character count for pitch summary
     */
    function updateCharCount() {
        const currentLength = elements.pitchSummary.value.length;
        const percentage = (currentLength / PITCH_SUMMARY_MAX_CHARS) * 100;

        // Create or update character count display
        let countDisplay = document.querySelector('.char-count');
        if (!countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.className = 'char-count';
            countDisplay.style.cssText = `
                font-size: 0.8rem;
                color: #666;
                text-align: right;
                margin-top: 4px;
            `;
            elements.pitchSummary.parentElement.appendChild(countDisplay);
        }

        countDisplay.textContent = `${currentLength}/${PITCH_SUMMARY_MAX_CHARS} characters`;

        // Change color based on length
        if (currentLength < PITCH_SUMMARY_MIN_CHARS) {
            countDisplay.style.color = '#f44336';
        } else if (currentLength >= PITCH_SUMMARY_MIN_CHARS && currentLength <= PITCH_SUMMARY_MAX_CHARS) {
            countDisplay.style.color = '#4CAF50';
        } else {
            countDisplay.style.color = '#f44336';
        }
    }

    /**
     * Update file upload UI
     */
    function updateFileUI(file, errorMessage = null) {
        const uploadContent = elements.uploadBox.querySelector('.upload-content');
        const fileInfo = elements.uploadBox.querySelector('.file-info');
        const fileName = elements.uploadBox.querySelector('.file-name');

        elements.uploadBox.classList.remove('has-file', 'error');

        // Remove existing error messages
        const existingError = elements.uploadBox.querySelector('.upload-size-error');
        if (existingError) existingError.remove();

        if (errorMessage) {
            elements.uploadBox.classList.add('error');
            const errorEl = document.createElement('small');
            errorEl.className = 'upload-size-error';
            errorEl.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin-top: 8px; display: block;';
            errorEl.textContent = errorMessage;
            elements.uploadBox.appendChild(errorEl);
            return;
        }

        if (file) {
            elements.uploadBox.classList.add('has-file');
            if (uploadContent) uploadContent.style.display = 'none';
            if (fileInfo) fileInfo.style.display = 'block';
            if (fileName) fileName.textContent = file.name;
        } else {
            if (uploadContent) uploadContent.style.display = 'block';
            if (fileInfo) fileInfo.style.display = 'none';
        }
    }

    /**
     * Show form message
     */
    function showFormMessage(message, type = 'success') {
        if (elements.formMessage) {
            // Add icon based on type
            const icon = type === 'success' ? '✓ ' : '✗ ';
            elements.formMessage.textContent = icon + message;
            elements.formMessage.className = 'form-message ' + type;

            // Auto-hide for success messages
            if (type === 'success') {
                setTimeout(() => {
                    elements.formMessage.className = 'form-message';
                }, 8000);
            }

            // Scroll to message
            elements.formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Set button loading state
     */
    function setButtonLoading(isLoading) {
        const btnText = elements.submitBtn.querySelector('.btn-text');
        const btnLoader = elements.submitBtn.querySelector('.btn-loader');

        elements.submitBtn.disabled = isLoading;

        if (isLoading) {
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-block';
        } else {
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    // INPUT TYPE RESTRICTIONS

    /**
     * Add input restrictions for proper data entry
     */
    function setupInputRestrictions() {
        // Name field - letters, spaces, hyphens, apostrophes, periods only
        if (elements.name) {
            elements.name.addEventListener('input', function (e) {
                // Allow letters, spaces, hyphens, apostrophes, periods
                this.value = this.value.replace(/[^a-zA-Z\s\-'.]/g, '');
            });
        }

        // Company field - alphanumeric, spaces, and common business characters
        if (elements.company) {
            elements.company.addEventListener('input', function (e) {
                // Allow alphanumeric, spaces, hyphens, apostrophes, periods, ampersand, parentheses
                this.value = this.value.replace(/[^a-zA-Z0-9\s\-'.&()]/g, '');
            });
        }

        // Sector field - letters, spaces, slashes only
        if (elements.sector) {
            elements.sector.addEventListener('input', function (e) {
                // Allow letters, spaces, slashes
                this.value = this.value.replace(/[^a-zA-Z\s/]/g, '');
            });
        }

        // Investment field - currency symbols, numbers, decimals, and common terms
        if (elements.investment) {
            elements.investment.addEventListener('input', function (e) {
                // Allow currency symbols, numbers, decimals, and common terms
                this.value = this.value.replace(/[^₹$€£\d.\s]/g, '');
            });
        }

        // Phone field - numbers only
        if (elements.phone) {
            elements.phone.addEventListener('input', function (e) {
                // Remove all non-digit characters except + at start
                let value = this.value;
                if (!value.startsWith('+')) {
                    value = value.replace(/\D/g, '');
                } else {
                    // Allow +, digits, and spaces/dashes
                    value = '+' + value.substring(1).replace(/[^\d\s-]/g, '');
                }
                this.value = value;
            });
        }
    }

    // EVENT HANDLERS

    /**
     * Add real-time validation on blur
     */
    function addBlurValidation(fieldElement, validateFn) {
        fieldElement.addEventListener('blur', function () {
            const result = validateFn(this.value);
            updateFieldUI(this, result, true);
        });
    }

    // Setup field validations
    const fieldValidators = {
        name: validateName,
        company: validateCompany,
        sector: validateSector,
        investment: validateInvestment,
        email: validateEmail,
        phone: validatePhone,
        pitchSummary: validatePitchSummary
    };

    // Setup input restrictions first
    setupInputRestrictions();

    Object.keys(fieldValidators).forEach(fieldName => {
        const fieldElement = elements[fieldName];
        if (fieldElement) {
            addBlurValidation(fieldElement, fieldValidators[fieldName]);

            // Clear error on input
            fieldElement.addEventListener('input', function () {
                const fieldContainer = this.parentElement;
                if (fieldContainer.classList.contains('error')) {
                    const result = fieldValidators[fieldName](this.value);
                    updateFieldUI(this, result, true);
                }
            });
        }
    });

    // Character count for pitch summary
    if (elements.pitchSummary) {
        elements.pitchSummary.addEventListener('input', function () {
            updateCharCount();

            // Clear error on input
            const fieldContainer = this.parentElement;
            if (fieldContainer.classList.contains('error')) {
                const result = validatePitchSummary(this.value);
                updateFieldUI(this, result, true);
            }
        });

        // Initialize character count
        updateCharCount();
    }

    // FILE UPLOAD HANDLING

    if (elements.uploadBox && elements.fileInput) {
        // Click to upload
        elements.uploadBox.addEventListener('click', function () {
            elements.fileInput.click();
        });

        // File input change
        elements.fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const validation = validateFile(file);

                if (validation.isValid) {
                    uploadedFile = file;
                    updateFileUI(file);
                } else {
                    updateFileUI(null, validation.message);
                    this.value = ''; // Clear input
                }
            }
        });

        // Drag and drop
        elements.uploadBox.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        elements.uploadBox.addEventListener('dragleave', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        elements.uploadBox.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files && files[0]) {
                const file = files[0];
                const validation = validateFile(file);

                if (validation.isValid) {
                    elements.fileInput.files = files;
                    uploadedFile = file;
                    updateFileUI(file);
                } else {
                    updateFileUI(null, validation.message);
                    elements.fileInput.value = '';
                }
            }
        });

        // Remove file button
        const removeBtn = elements.uploadBox.querySelector('.remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                uploadedFile = null;
                elements.fileInput.value = '';
                updateFileUI(null);
            });
        }
    }

    // FORM SUBMISSION

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate all fields
            const validation = validateForm();

            // Update UI for all fields
            Object.keys(fieldValidators).forEach(fieldName => {
                const fieldElement = elements[fieldName];
                if (fieldElement && validation.results[fieldName]) {
                    updateFieldUI(fieldElement, validation.results[fieldName], false);
                }
            });

            // Show first error if form is invalid
            if (!validation.isValid) {
                const firstError = Object.entries(validation.results).find(([_, r]) => !r.isValid);
                if (firstError) {
                    const [fieldName, result] = firstError;
                    showFormMessage(result.message, 'error');

                    // Focus first invalid field
                    const fieldElement = elements[fieldName];
                    if (fieldElement) {
                        fieldElement.focus();
                    }
                }
                return;
            }

            // Set loading state
            setButtonLoading(true);

            try {
                // Prepare form data
                const formData = {
                    name: elements.name.value.trim(),
                    company: elements.company.value.trim(),
                    sector: elements.sector.value.trim(),
                    investment: elements.investment.value.trim(),
                    email: elements.email.value.trim(),
                    phone: elements.phone.value.trim(),
                    pitchSummary: elements.pitchSummary.value.trim(),
                    file: uploadedFile
                };

                // Submit to backend
                const result = await submitPitch(formData);

                if (result.success) {
                    showFormMessage('Pitch submitted successfully! We\'ll review and get back to you soon.', 'success');
                    form.reset();
                    uploadedFile = null;
                    updateFileUI(null);

                    // Clear validation classes
                    document.querySelectorAll('.form-field').forEach(el => {
                        el.classList.remove('valid', 'error');
                    });

                    // Reset character count
                    updateCharCount();
                } else {
                    showFormMessage('Error submitting pitch: ' + (result.error || 'Please try again.'), 'error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showFormMessage('Error submitting pitch. Please try again or email us directly.', 'error');
            } finally {
                setButtonLoading(false);
            }
        });
    }
}


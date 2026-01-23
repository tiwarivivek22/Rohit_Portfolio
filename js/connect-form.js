/**
 * Connect Modal Form Validation Handler
 * Enhanced with proper validation, real-time feedback, and better UX
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize connect form if it exists
    const connectForm = document.getElementById('connect-form');
    if (connectForm) {
        initConnectForm(connectForm);
    }
});

/**
 * Initialize Connect Form with all validations and event handlers
 */
function initConnectForm(form) {
    // Cache DOM elements
    const elements = {
        name: document.getElementById('connect-name'),
        email: document.getElementById('connect-email'),
        purpose: document.getElementById('connect-purpose'),
        message: document.getElementById('connect-message'),
        submitBtn: form.querySelector('button[type="submit"]'),
        formMessage: document.getElementById('connect-form-message')
    };

    const MESSAGE_MIN_CHARS = 10;
    const MESSAGE_MAX_CHARS = 1000;
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
            return { isValid: false, message: 'Please enter a valid name (letters only)' };
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
     * Validate purpose field
     * Rules: Minimum 2 characters, should not be numeric only
     */
    function validatePurpose(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Purpose is required' };
        }

        if (trimmed.length < 2) {
            return { isValid: false, message: 'Purpose must be at least 2 characters' };
        }

        // Should not be purely numeric
        const numericRegex = /^\d+$/;
        if (numericRegex.test(trimmed)) {
            return { isValid: false, message: 'Please enter a valid purpose (not just numbers)' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate message field
     * Rules: Minimum 10 characters, maximum 1000 characters
     */
    function validateMessage(value) {
        const trimmed = value.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Message is required' };
        }

        if (trimmed.length < MESSAGE_MIN_CHARS) {
            return { isValid: false, message: `Please provide at least ${MESSAGE_MIN_CHARS} characters` };
        }

        if (trimmed.length > MESSAGE_MAX_CHARS) {
            return { isValid: false, message: `Maximum ${MESSAGE_MAX_CHARS} characters allowed` };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        const results = {
            name: validateName(elements.name.value),
            email: validateEmail(elements.email.value),
            purpose: validatePurpose(elements.purpose.value),
            message: validateMessage(elements.message.value)
        };

        // Check if all fields are valid
        const isFormValid = Object.values(results).every(r => r.isValid);

        return { isValid: isFormValid, results };
    }
    /**
     * Update field UI with validation result
     */
    function updateFieldUI(fieldElement, result) {
        const fieldContainer = fieldElement.parentElement;

        // Remove existing classes
        fieldContainer.classList.remove('valid', 'error');

        // Add appropriate class
        if (result.isValid) {
            if (fieldElement.value.trim()) {
                fieldContainer.classList.add('valid');
            }
        } else {
            fieldContainer.classList.add('error');
        }
    }

    /**
     * Update character count for message
     */
    function updateCharCount() {
        const currentLength = elements.message.value.length;

        // Create or update character count display
        let countDisplay = form.querySelector('.char-count');
        if (!countDisplay) {
            countDisplay = document.createElement('div');
            countDisplay.className = 'char-count';
            countDisplay.style.cssText = `
                font-size: 0.75rem;
                color: #e74c3c;
                text-align: right;
                margin-top: 4px;
                transition: color 0.3s ease;
            `;
            elements.message.parentElement.appendChild(countDisplay);
        }

        countDisplay.textContent = `${currentLength}/${MESSAGE_MAX_CHARS}`;

        // Change color based on length - red for error/incomplete, green for valid
        if (currentLength < MESSAGE_MIN_CHARS) {
            countDisplay.style.color = '#e74c3c';
            countDisplay.classList.remove('success');
        } else if (currentLength >= MESSAGE_MIN_CHARS && currentLength <= MESSAGE_MAX_CHARS) {
            countDisplay.style.color = '#27ae60';
            countDisplay.classList.add('success');
        } else {
            countDisplay.style.color = '#e74c3c';
            countDisplay.classList.remove('success');
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
                }, 5000);
            }
        }
    }

    /**
     * Set button loading state
     */
    function setButtonLoading(isLoading) {
        elements.submitBtn.disabled = isLoading;

        if (isLoading) {
            elements.submitBtn.textContent = 'SENDING...';
        } else {
            elements.submitBtn.textContent = 'SEND MESSAGE';
        }
    }
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

        // Purpose field - letters, spaces only
        if (elements.purpose) {
            elements.purpose.addEventListener('input', function (e) {
                // Allow letters, spaces, slashes, ampersand
                this.value = this.value.replace(/[^a-zA-Z\s/&]/g, '');
            });
        }

        // Message field - allow letters, numbers, basic punctuation
        if (elements.message) {
            elements.message.addEventListener('input', function (e) {
                // Allow letters, numbers, spaces, basic punctuation
                this.value = this.value.replace(/[^a-zA-Z0-9\s\-'.!?,()@]/g, '');
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
            updateFieldUI(this, result);
        });
    }

    // Setup field validations
    const fieldValidators = {
        name: validateName,
        email: validateEmail,
        purpose: validatePurpose,
        message: validateMessage
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
                    updateFieldUI(this, result);
                }
            });
        }
    });

    // Character count for message
    if (elements.message) {
        elements.message.addEventListener('input', function () {
            updateCharCount();

            // Clear error on input
            const fieldContainer = this.parentElement;
            if (fieldContainer.classList.contains('error')) {
                const result = validateMessage(this.value);
                updateFieldUI(this, result);
            }
        });

        // Initialize character count
        updateCharCount();
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
                    updateFieldUI(fieldElement, validation.results[fieldName]);
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
                    email: elements.email.value.trim(),
                    purpose: elements.purpose.value.trim(),
                    message: elements.message.value.trim()
                };

                // Submit to backend
                const result = await submitConnect(formData);

                if (result.success) {
                    showFormMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
                    form.reset();

                    // Clear validation classes
                    form.querySelectorAll('.form-field, .connect-form > label').forEach(el => {
                        el.classList.remove('valid', 'error');
                    });

                    // Reset character count
                    updateCharCount();

                    // Close modal after 2 seconds
                    setTimeout(() => {
                        closeModal();
                        elements.formMessage.className = 'form-message';
                    }, 2000);
                } else {
                    showFormMessage('Error sending message: ' + (result.error || 'Please try again.'), 'error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showFormMessage('Error sending message. Please try again.', 'error');
            } finally {
                setButtonLoading(false);
            }
        });
    }
}


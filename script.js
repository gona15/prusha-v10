/**
 * ArmanLeads Premium Interactive JavaScript
 * Sophisticated micro-interactions and animations for landing page
 */
(function() {
    'use strict';
    
    // Performance and state management
    let scrollTicking = false;
    let resizeTicking = false;
    let lastScrollY = 0;
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;
    
    // Cache DOM elements for performance
    const elements = {};
    
    // Animation easing curves
    const easings = {
        easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
        easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
        easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    };
    
    // Utility functions
    const utils = {
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        lerp(start, end, factor) {
            return start * (1 - factor) + end * factor;
        },
        
        mapRange(value, inMin, inMax, outMin, outMax) {
            return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
        },
        
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        
        getScrollProgress() {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            return Math.min(scrollTop / documentHeight, 1);
        },
        
        isInViewport(element, threshold = 0.1) {
            const rect = element.getBoundingClientRect();
            const elementHeight = rect.height;
            const elementTop = rect.top;
            const elementBottom = rect.bottom;
            
            const visibleHeight = Math.min(elementBottom, windowHeight) - Math.max(elementTop, 0);
            const visiblePercentage = visibleHeight / elementHeight;
            
            return visiblePercentage >= threshold;
        }
    };
    
    // Cache DOM elements on initialization
    function cacheElements() {
        elements.navbar = document.querySelector('.nav');
        elements.heroSection = document.querySelector('.hero');
        elements.heroHeadline = document.querySelector('.hero-headline');
        elements.heroPhoto = document.querySelector('.hero-photo');
        elements.faqItems = document.querySelectorAll('.faq-item');
        elements.fadeElements = document.querySelectorAll('.fade-in');
        elements.form = document.getElementById('auditForm');
        elements.buttons = document.querySelectorAll('.btn');
        elements.problemCards = document.querySelectorAll('.problem-card');
        elements.benefitCards = document.querySelectorAll('.benefit-card');
        elements.stepCards = document.querySelectorAll('.step-card');
        elements.urgencyStats = document.querySelectorAll('.urgency-stat');
    }
    
    // Hero Section Animations
    class HeroAnimations {
        constructor() {
            this.heroPhoto = elements.heroPhoto;
            this.heroHeadline = elements.heroHeadline;
            this.mouseX = 0;
            this.mouseY = 0;
            this.currentX = 0;
            this.currentY = 0;
            
            this.init();
        }
        
        init() {
            if (!this.heroPhoto || !this.heroHeadline) return;
            
            this.setupParallax();
            this.setupMouseMovement();
            this.animateEntrance();
        }
        
        setupParallax() {
            const handleScroll = () => {
                if (!scrollTicking) {
                    requestAnimationFrame(() => {
                        const scrolled = window.pageYOffset;
                        const parallaxSpeed = 0.5;
                        
                        // Subtle parallax on hero image
                        if (this.heroPhoto && scrolled < windowHeight) {
                            const yPos = scrolled * parallaxSpeed;
                            this.heroPhoto.style.transform = `translateY(${yPos}px) scale(${1 + scrolled * 0.0002})`;
                        }
                        
                        scrollTicking = false;
                    });
                    scrollTicking = true;
                }
            };
            
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        setupMouseMovement() {
            const heroSection = elements.heroSection;
            if (!heroSection) return;
            
            const handleMouseMove = (e) => {
                const rect = heroSection.getBoundingClientRect();
                this.mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
                this.mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
            };
            
            const animate = () => {
                this.currentX = utils.lerp(this.currentX, this.mouseX * 10, 0.1);
                this.currentY = utils.lerp(this.currentY, this.mouseY * 10, 0.1);
                
                if (this.heroPhoto) {
                    this.heroPhoto.style.transform += ` translate(${this.currentX}px, ${this.currentY}px)`;
                }
                
                if (this.heroHeadline) {
                    this.heroHeadline.style.transform = `translate(${this.currentX * 0.5}px, ${this.currentY * 0.5}px)`;
                }
                
                requestAnimationFrame(animate);
            };
            
            heroSection.addEventListener('mousemove', utils.throttle(handleMouseMove, 16));
            animate();
        }
        
        animateEntrance() {
            // Staggered entrance animation
            const timeline = [
                { element: this.heroHeadline, delay: 0 },
                { element: document.querySelector('.hero-subheadline'), delay: 200 },
                { element: document.querySelector('.hero-actions'), delay: 400 },
                { element: this.heroPhoto, delay: 600 }
            ];
            
            timeline.forEach(({ element, delay }) => {
                if (!element) return;
                
                element.style.opacity = '0';
                element.style.transform = 'translateY(40px)';
                
                setTimeout(() => {
                    element.style.transition = `opacity 0.8s ${easings.easeOutExpo}, transform 0.8s ${easings.easeOutExpo}`;
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);
            });
        }
    }
    
    // Navigation Scroll Behavior
    class NavigationController {
        constructor() {
            this.navbar = elements.navbar;
            this.isVisible = false;
            this.lastScrollY = 0;
            this.scrollThreshold = 100;
            
            this.init();
        }
        
        init() {
            if (!this.navbar) return;
            
            this.setupScrollBehavior();
            this.setupSmoothScrolling();
        }
        
        setupScrollBehavior() {
            const handleScroll = () => {
                const currentScrollY = window.pageYOffset;
                const scrollingDown = currentScrollY > this.lastScrollY;
                const beyondThreshold = currentScrollY > this.scrollThreshold;
                
                if (beyondThreshold && scrollingDown && !this.isVisible) {
                    this.show();
                } else if ((!beyondThreshold || !scrollingDown) && this.isVisible) {
                    this.hide();
                }
                
                this.lastScrollY = currentScrollY;
            };
            
            window.addEventListener('scroll', utils.throttle(handleScroll, 16), { passive: true });
        }
        
        show() {
            if (!this.navbar || this.isVisible) return;
            
            this.navbar.style.transition = `transform 0.3s ${easings.easeOutCubic}, opacity 0.3s ease`;
            this.navbar.style.transform = 'translateY(0)';
            this.navbar.style.opacity = '1';
            this.navbar.classList.add('visible');
            this.isVisible = true;
        }
        
        hide() {
            if (!this.navbar || !this.isVisible) return;
            
            this.navbar.style.transition = `transform 0.3s ${easings.easeOutCubic}, opacity 0.3s ease`;
            this.navbar.style.transform = 'translateY(-100%)';
            this.navbar.style.opacity = '0';
            this.navbar.classList.remove('visible');
            this.isVisible = false;
        }
        
        setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (!target) return;
                    
                    e.preventDefault();
                    
                    const navHeight = this.navbar ? this.navbar.offsetHeight : 0;
                    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                    
                    window.scrollTo({
                        top: Math.max(0, targetTop),
                        behavior: 'smooth'
                    });
                });
            });
        }
    }
    
    // FAQ Accordion System
    class FAQController {
        constructor() {
            this.faqItems = elements.faqItems;
            this.activeItem = null;
            
            this.init();
        }
        
        init() {
            if (!this.faqItems.length) return;
            
            this.faqItems.forEach((item, index) => this.setupFAQItem(item, index));
        }
        
        setupFAQItem(item, index) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = question?.querySelector('.faq-icon');
            
            if (!question || !answer || !icon) return;
            
            // Set up ARIA attributes
            const answerId = `faq-answer-${index + 1}`;
            answer.id = answerId;
            answer.setAttribute('role', 'region');
            question.setAttribute('aria-controls', answerId);
            question.setAttribute('aria-expanded', 'false');
            
            // Initial state
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = `max-height 0.4s ${easings.easeInOutQuart}, opacity 0.3s ease`;
            
            // Event listeners
            question.addEventListener('click', () => this.toggleFAQ(item));
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(item);
                }
            });
            
            // Hover effects
            item.addEventListener('mouseenter', () => this.addHoverEffect(item));
            item.addEventListener('mouseleave', () => this.removeHoverEffect(item));
        }
        
        toggleFAQ(targetItem) {
            const isCurrentlyActive = this.activeItem === targetItem;
            
            // Close all items
            this.faqItems.forEach(item => {
                if (item !== targetItem || isCurrentlyActive) {
                    this.closeFAQ(item);
                }
            });
            
            // Open target item if it wasn't active
            if (!isCurrentlyActive) {
                this.openFAQ(targetItem);
                this.activeItem = targetItem;
            } else {
                this.activeItem = null;
            }
        }
        
        openFAQ(item) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = question?.querySelector('.faq-icon');
            
            if (!question || !answer || !icon) return;
            
            // Update ARIA
            question.setAttribute('aria-expanded', 'true');
            
            // Animate opening
            const scrollHeight = answer.scrollHeight;
            answer.style.maxHeight = scrollHeight + 'px';
            answer.style.opacity = '1';
            
            // Icon rotation
            icon.style.transition = `transform 0.3s ${easings.easeInOutQuart}`;
            icon.style.transform = 'rotate(45deg)';
            
            // Add active class
            item.classList.add('open');
            
            // Focus management for accessibility
            setTimeout(() => {
                answer.setAttribute('tabindex', '-1');
                answer.focus({ preventScroll: true });
            }, 400);
        }
        
        closeFAQ(item) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = question?.querySelector('.faq-icon');
            
            if (!question || !answer || !icon) return;
            
            // Update ARIA
            question.setAttribute('aria-expanded', 'false');
            
            // Animate closing
            answer.style.maxHeight = '0';
            answer.style.opacity = '0';
            
            // Icon rotation
            icon.style.transform = 'rotate(0deg)';
            
            // Remove active class
            item.classList.remove('open');
            
            // Clean up focus
            answer.removeAttribute('tabindex');
        }
        
        addHoverEffect(item) {
            if (item.classList.contains('open')) return;
            
            item.style.transition = `transform 0.2s ${easings.easeOutCubic}, box-shadow 0.2s ease`;
            item.style.transform = 'translateY(-2px)';
            item.style.boxShadow = 'var(--shadow-lg)';
        }
        
        removeHoverEffect(item) {
            if (item.classList.contains('open')) return;
            
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = 'var(--shadow-sm)';
        }
    }
    
    // Form Enhancement System
    class FormController {
        constructor() {
            this.form = elements.form;
            this.fields = {};
            this.validationRules = {
                name: { required: true, minLength: 2 },
                practice: { required: true, minLength: 2 },
                email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                website: { required: false, pattern: /^https?:\/\/.+/ }
            };
            
            this.init();
        }
        
        init() {
            if (!this.form) return;
            
            this.cacheFormElements();
            this.setupRealTimeValidation();
            this.setupSubmission();
            this.addFloatingLabels();
        }
        
        cacheFormElements() {
            Object.keys(this.validationRules).forEach(fieldName => {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    this.fields[fieldName] = {
                        input: field,
                        error: document.getElementById(`${fieldName}-error`) || this.createErrorElement(field),
                        valid: false
                    };
                }
            });
        }
        
        createErrorElement(input) {
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            errorEl.id = `${input.name}-error`;
            input.parentNode.appendChild(errorEl);
            return errorEl;
        }
        
        setupRealTimeValidation() {
            Object.entries(this.fields).forEach(([fieldName, field]) => {
                const { input, error } = field;
                
                // Focus effects
                input.addEventListener('focus', () => this.addFocusEffect(input));
                input.addEventListener('blur', () => {
                    this.removeFocusEffect(input);
                    this.validateField(fieldName);
                });
                
                // Real-time validation on input
                input.addEventListener('input', utils.debounce(() => {
                    this.validateField(fieldName);
                }, 300));
            });
        }
        
        addFocusEffect(input) {
            input.style.transition = `border-color 0.2s ${easings.easeOutCubic}, box-shadow 0.2s ease`;
            input.style.borderColor = 'var(--primary-charcoal)';
            input.style.boxShadow = '0 0 0 3px rgba(10, 10, 10, 0.1)';
        }
        
        removeFocusEffect(input) {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
        
        validateField(fieldName) {
            const field = this.fields[fieldName];
            const { input, error } = field;
            const value = input.value.trim();
            const rules = this.validationRules[fieldName];
            
            let isValid = true;
            let errorMessage = '';
            
            if (rules.required && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            } else if (value && rules.minLength && value.length < rules.minLength) {
                isValid = false;
                errorMessage = `Minimum ${rules.minLength} characters required`;
            } else if (value && rules.pattern && !rules.pattern.test(value)) {
                isValid = false;
                if (fieldName === 'email') {
                    errorMessage = 'Please enter a valid email address';
                } else if (fieldName === 'website') {
                    errorMessage = 'Please enter a valid URL (https://...)';
                }
            }
            
            field.valid = isValid;
            this.updateFieldState(input, error, isValid, errorMessage);
            
            return isValid;
        }
        
        updateFieldState(input, error, isValid, errorMessage) {
            if (isValid) {
                input.style.borderColor = 'var(--accent-emerald)';
                error.textContent = '';
                error.style.opacity = '0';
            } else {
                input.style.borderColor = 'var(--accent-crimson)';
                error.textContent = errorMessage;
                error.style.opacity = '1';
                error.style.transition = 'opacity 0.2s ease';
            }
        }
        
        addFloatingLabels() {
            Object.values(this.fields).forEach(({ input }) => {
                const label = this.form.querySelector(`label[for="${input.id}"]`);
                if (!label) return;
                
                const updateLabelPosition = () => {
                    if (input.value || input === document.activeElement) {
                        label.style.transform = 'translateY(-20px) scale(0.85)';
                        label.style.color = 'var(--text-primary)';
                    } else {
                        label.style.transform = 'translateY(0) scale(1)';
                        label.style.color = 'var(--text-tertiary)';
                    }
                };
                
                label.style.transition = `transform 0.2s ${easings.easeOutCubic}, color 0.2s ease`;
                label.style.transformOrigin = 'left top';
                
                input.addEventListener('focus', updateLabelPosition);
                input.addEventListener('blur', updateLabelPosition);
                input.addEventListener('input', updateLabelPosition);
                
                // Initial state
                updateLabelPosition();
            });
        }
        
        setupSubmission() {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        handleSubmit() {
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (!submitButton || submitButton.disabled) return;
            
            // Validate all fields
            const isFormValid = Object.keys(this.fields).every(fieldName => 
                this.validateField(fieldName)
            );
            
            if (!isFormValid) {
                this.showFormError('Please correct the errors above');
                return;
            }
            
            this.showLoadingState(submitButton);
            
            // Simulate submission
            setTimeout(() => {
                this.showSuccessState(submitButton);
                this.form.reset();
                
                // Reset label positions
                Object.values(this.fields).forEach(({ input }) => {
                    const label = this.form.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        label.style.transform = 'translateY(0) scale(1)';
                        label.style.color = 'var(--text-tertiary)';
                    }
                });
            }, 2000);
        }
        
        showLoadingState(button) {
            const originalText = button.textContent;
            button.textContent = 'Sending Analysis...';
            button.disabled = true;
            button.style.opacity = '0.7';
            button.dataset.originalText = originalText;
        }
        
        showSuccessState(button) {
            button.textContent = 'Analysis Sent! ✓';
            button.style.backgroundColor = 'var(--accent-emerald)';
            button.style.opacity = '1';
            
            setTimeout(() => {
                button.textContent = button.dataset.originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 3000);
        }
        
        showFormError(message) {
            // Create or update form-level error message
            let formError = this.form.querySelector('.form-error');
            if (!formError) {
                formError = document.createElement('div');
                formError.className = 'form-error';
                formError.style.color = 'var(--accent-crimson)';
                formError.style.textAlign = 'center';
                formError.style.marginTop = 'var(--space-12)';
                this.form.appendChild(formError);
            }
            
            formError.textContent = message;
            formError.style.opacity = '1';
        }
    }
    
    // Intersection Observer for Scroll Animations
    class ScrollAnimationController {
        constructor() {
            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };
            
            this.countersAnimated = new Set();
            
            this.init();
        }
        
        init() {
            this.setupFadeInAnimations();
            this.setupCardHoverEffects();
            this.setupCounterAnimations();
        }
        
        setupFadeInAnimations() {
            if (!('IntersectionObserver' in window)) {
                // Fallback: show all elements
                elements.fadeElements.forEach(el => el.classList.add('visible'));
                return;
            }
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                    }
                });
            }, this.observerOptions);
            
            elements.fadeElements.forEach(el => observer.observe(el));
        }
        
        animateElement(element) {
            element.style.transition = `opacity 0.8s ${easings.easeOutExpo}, transform 0.8s ${easings.easeOutExpo}`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('visible');
        }
        
        setupCardHoverEffects() {
            const cardSelectors = ['.problem-card', '.benefit-card', '.step-card'];
            
            cardSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(card => {
                    this.addCardHoverEffect(card);
                });
            });
        }
        
        addCardHoverEffect(card) {
            card.addEventListener('mouseenter', () => {
                card.style.transition = `transform 0.3s ${easings.easeOutCubic}, box-shadow 0.3s ease`;
                card.style.transform = 'translateY(-8px)';
                
                // Enhance icon if present
                const icon = card.querySelector('.icon-problem, .icon-benefit');
                if (icon) {
                    icon.style.transition = `transform 0.3s ${easings.spring}`;
                    icon.style.transform = 'scale(1.1) rotate(2deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                
                const icon = card.querySelector('.icon-problem, .icon-benefit');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        }
        
        setupCounterAnimations() {
            const statsContainer = document.querySelector('.urgency-stats');
            if (!statsContainer) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.countersAnimated.has(entry.target)) {
                        this.animateCounters(entry.target);
                        this.countersAnimated.add(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(statsContainer);
        }
        
        animateCounters(container) {
            const numbers = container.querySelectorAll('.urgency-number');
            
            numbers.forEach((number, index) => {
                setTimeout(() => {
                    const text = number.textContent;
                    const matches = text.match(/(\d+)/);
                    
                    if (matches) {
                        const finalValue = parseInt(matches[1]);
                        this.animateNumber(number, 0, finalValue, 1500, text);
                    }
                }, index * 200);
            });
        }
        
        animateNumber(element, start, end, duration, originalText) {
            const startTime = performance.now();
            
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Eased progress
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(start + (end - start) * easedProgress);
                
                element.textContent = originalText.replace(/\d+/, currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            
            requestAnimationFrame(update);
        }
    }
    
    // Button Enhancement System
    class ButtonController {
        constructor() {
            this.buttons = elements.buttons;
            this.init();
        }
        
        init() {
            if (!this.buttons.length) return;
            
            this.buttons.forEach(button => this.enhanceButton(button));
        }
        
        enhanceButton(button) {
            // Skip if already enhanced
            if (button.dataset.enhanced) return;
            button.dataset.enhanced = 'true';
            
            // Ripple effect on click
            button.addEventListener('click', (e) => this.createRipple(e, button));
            
            // Magnetic effect on hover
            if (!button.classList.contains('btn-secondary')) {
                this.addMagneticEffect(button);
            }
            
            // Loading state for form submissions
            if (button.type === 'submit') {
                button.addEventListener('click', () => this.handleSubmitButton(button));
            }
        }
        
        createRipple(event, button) {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out forwards;
                pointer-events: none;
            `;
            
            // Add ripple keyframes if not exists
            if (!document.querySelector('#ripple-keyframes')) {
                const style = document.createElement('style');
                style.id = 'ripple-keyframes';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }
        
        addMagneticEffect(button) {
            let isHovering = false;
            
            button.addEventListener('mouseenter', () => {
                isHovering = true;
                button.style.transition = `transform 0.3s ${easings.easeOutCubic}`;
            });
            
            button.addEventListener('mouseleave', () => {
                isHovering = false;
                button.style.transform = 'translate(0, 0) scale(1)';
            });
            
            button.addEventListener('mousemove', (e) => {
                if (!isHovering) return;
                
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) * 0.1;
                const deltaY = (e.clientY - centerY) * 0.1;
                
                button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
            });
        }
        
        handleSubmitButton(button) {
            // Prevent double submissions
            if (button.disabled) return;
            
            // Add subtle loading animation
            const originalText = button.textContent;
            button.dataset.originalText = originalText;
        }
    }
    
    // Image Loading Enhancement
    class ImageController {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupLazyLoading();
            this.setupImageHoverEffects();
        }
        
        setupLazyLoading() {
            const images = document.querySelectorAll('img[data-src], img[data-srcset]');
            if (images.length === 0) return;
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0,
                    rootMargin: '50px 0px'
                });
                
                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback: load all images
                images.forEach(img => this.loadImage(img));
            }
        }
        
        loadImage(img) {
            // Add loading class for fade-in effect
            img.style.opacity = '0';
            img.style.transition = `opacity 0.5s ${easings.easeOutCubic}`;
            
            const loadHandler = () => {
                img.style.opacity = '1';
                img.classList.add('loaded');
            };
            
            const errorHandler = () => {
                img.style.opacity = '0.5';
                console.warn('Image failed to load:', img.src || img.dataset.src);
            };
            
            if (img.dataset.src) {
                img.addEventListener('load', loadHandler, { once: true });
                img.addEventListener('error', errorHandler, { once: true });
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
            
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                delete img.dataset.srcset;
            }
        }
        
        setupImageHoverEffects() {
            const heroPhoto = elements.heroPhoto;
            if (heroPhoto) {
                heroPhoto.addEventListener('mouseenter', () => {
                    heroPhoto.style.transition = `transform 0.5s ${easings.easeOutCubic}`;
                    heroPhoto.style.transform = 'scale(1.05)';
                });
                
                heroPhoto.addEventListener('mouseleave', () => {
                    heroPhoto.style.transform = 'scale(1)';
                });
            }
        }
    }
    
    // Accessibility Enhancement
    class AccessibilityController {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupScreenReaderSupport();
            this.setupReducedMotionSupport();
        }
        
        setupKeyboardNavigation() {
            // Add visual focus indicators
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });
            
            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
            
            // Enhanced focus styles
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            focusableElements.forEach(element => {
                element.addEventListener('focus', () => {
                    element.style.outline = '2px solid var(--accent-crimson)';
                    element.style.outlineOffset = '2px';
                });
                
                element.addEventListener('blur', () => {
                    element.style.outline = '';
                    element.style.outlineOffset = '';
                });
            });
        }
        
        setupFocusManagement() {
            // Focus trap for modals/expanded content
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const openFAQ = document.querySelector('.faq-item.open');
                    if (openFAQ) {
                        const question = openFAQ.querySelector('.faq-question');
                        if (question) question.click();
                    }
                }
            });
        }
        
        setupScreenReaderSupport() {
            // Live region for dynamic content
            let liveRegion = document.getElementById('live-region');
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }
            
            this.liveRegion = liveRegion;
        }
        
        announce(message) {
            if (this.liveRegion) {
                this.liveRegion.textContent = message;
                setTimeout(() => {
                    this.liveRegion.textContent = '';
                }, 1000);
            }
        }
        
        setupReducedMotionSupport() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (mediaQuery.matches) {
                this.disableAnimations();
            }
            
            mediaQuery.addEventListener('change', (e) => {
                if (e.matches) {
                    this.disableAnimations();
                } else {
                    this.enableAnimations();
                }
            });
        }
        
        disableAnimations() {
            document.documentElement.style.setProperty('--transition-all', 'none');
            document.documentElement.style.setProperty('--transition-fast', 'none');
            document.documentElement.style.setProperty('--transition-slow', 'none');
            
            // Remove scroll-based animations
            elements.fadeElements.forEach(el => el.classList.add('visible'));
        }
        
        enableAnimations() {
            document.documentElement.style.removeProperty('--transition-all');
            document.documentElement.style.removeProperty('--transition-fast');
            document.documentElement.style.removeProperty('--transition-slow');
        }
    }
    
    // Performance Monitor
    class PerformanceController {
        constructor() {
            this.metrics = {
                scrollEvents: 0,
                animationFrames: 0,
                lastScrollTime: 0
            };
            
            this.init();
        }
        
        init() {
            this.monitorPerformance();
            this.optimizeScrollHandlers();
        }
        
        monitorPerformance() {
            // Monitor scroll performance
            window.addEventListener('scroll', () => {
                this.metrics.scrollEvents++;
                this.metrics.lastScrollTime = performance.now();
            }, { passive: true });
            
            // Log performance metrics in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                setInterval(() => {
                    console.log('Performance Metrics:', this.metrics);
                }, 5000);
            }
        }
        
        optimizeScrollHandlers() {
            // Batch scroll updates
            let scrollTimeout;
            const batchedScrollUpdates = [];
            
            window.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                
                scrollTimeout = setTimeout(() => {
                    // Process batched updates
                    batchedScrollUpdates.forEach(fn => fn());
                    batchedScrollUpdates.length = 0;
                    scrollTimeout = null;
                }, 16); // ~60fps
            }, { passive: true });
        }
    }
    
    // Main App Controller
    class ArmanLeadsApp {
        constructor() {
            this.controllers = {};
            this.init();
        }
        
        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        }
        
        initializeApp() {
            try {
                // Cache DOM elements first
                cacheElements();
                
                // Initialize controllers in order
                this.controllers.hero = new HeroAnimations();
                this.controllers.navigation = new NavigationController();
                this.controllers.faq = new FAQController();
                this.controllers.form = new FormController();
                this.controllers.scroll = new ScrollAnimationController();
                this.controllers.buttons = new ButtonController();
                this.controllers.images = new ImageController();
                this.controllers.accessibility = new AccessibilityController();
                this.controllers.performance = new PerformanceController();
                
                // Update window dimensions on resize
                window.addEventListener('resize', utils.debounce(() => {
                    windowHeight = window.innerHeight;
                    windowWidth = window.innerWidth;
                }, 250), { passive: true });
                
                // Development console message
                this.showConsoleMessage();
                
                console.log('ArmanLeads Premium JavaScript initialized successfully');
                
            } catch (error) {
                console.error('Error initializing ArmanLeads app:', error);
            }
        }
        
        showConsoleMessage() {
            if (typeof console !== 'undefined' && console.log) {
                const styles = [
                    'color: #DC2626; font-size: 24px; font-weight: bold;',
                    'color: #6B7280; font-size: 14px; line-height: 1.5;'
                ];
                
                console.log(
                    '%cArmanLeads%c\n\nPremium Dental Marketing Solutions\nSophisticated interactions powered by modern JavaScript\n\nInterested in the implementation?\nContact: hello@armanleads.com',
                    ...styles
                );
            }
        }
        
        // Public API for external interaction
        getController(name) {
            return this.controllers[name];
        }
        
        // Cleanup method for SPA navigation
        destroy() {
            Object.values(this.controllers).forEach(controller => {
                if (controller.destroy) controller.destroy();
            });
        }
    }
    
    // Initialize the application
    window.ArmanLeadsApp = new ArmanLeadsApp();
    
    // Export for potential external use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ArmanLeadsApp;
    }

})();
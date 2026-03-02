/**
 * MOBILE NAVIGATION MENU
 * Handles hamburger menu toggle and smooth scrolling
 * Building Sustainability Framework
 */

(function() {
    'use strict';

    // DOM Elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Check if all required elements exist
    if (!mobileMenuBtn || !mobileMenuClose || !mobileMenu || !mobileMenuOverlay) {
        console.warn('Navigation: Some mobile menu elements not found');
        return;
    }

    /**
     * Open mobile menu
     */
    function openMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Smooth scroll to section
     * @param {string} targetId - ID of the target section
     */
    function smoothScrollTo(targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            console.warn(`Navigation: Target element #${targetId} not found`);
            return;
        }

        // Calculate offset (account for fixed header)
        const headerHeight = 80; // Adjust based on your header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Event Listeners
    // Open menu
    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    // Close menu - close button
    mobileMenuClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });

    // Close menu - overlay
    mobileMenuOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Navigation links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            // Extract target ID (remove #)
            const targetId = href.substring(1);

            // Close menu
            closeMenu();

            // Smooth scroll after menu closes (small delay for better UX)
            setTimeout(() => {
                smoothScrollTo(targetId);
            }, 300);
        });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Handle desktop nav links (smooth scrolling)
    const desktopNavLinks = document.querySelectorAll('.nav-link');
    desktopNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#') || href === '#') return;

            e.preventDefault();
            const targetId = href.substring(1);
            smoothScrollTo(targetId);
        });
    });

    console.log('✅ Mobile Navigation initialized');
})();

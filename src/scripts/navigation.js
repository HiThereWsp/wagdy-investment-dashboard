/**
 * Navigation Module
 * Handles sidebar navigation and scroll-based highlighting
 */

/**
 * Scroll to a specific section
 */
export function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Update active nav item
 */
export function setActiveNavItem(sectionId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        const onclick = item.getAttribute('onclick') || item.dataset.section;
        if (onclick && onclick.includes(sectionId)) {
            item.classList.add('active');
        }
    });
}

/**
 * Initialize scroll-based navigation highlighting
 */
export function initScrollObserver() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');

    const observerOptions = {
        rootMargin: '-20% 0px -60% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                setActiveNavItem(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/**
 * Initialize mobile menu toggle
 */
export function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (!toggle || !sidebar || !overlay) return;

    const openMenu = () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    // Close menu when nav item is clicked (mobile)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                closeMenu();
            }
        });
    });

    // Close menu on window resize if wider than mobile
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
}

/**
 * Initialize navigation click handlers
 */
export function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionId = item.dataset.section;
            if (sectionId) {
                scrollToSection(sectionId);
                setActiveNavItem(sectionId);
            }
        });
    });

    // Initialize scroll observer
    initScrollObserver();

    // Initialize mobile menu
    initMobileMenu();
}

export default {
    scrollToSection,
    setActiveNavItem,
    initScrollObserver,
    initNavigation,
    initMobileMenu
};

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
}

export default {
    scrollToSection,
    setActiveNavItem,
    initScrollObserver,
    initNavigation
};

// TravelBrain - Landing Page JavaScript

ready(() => {
  console.log('TravelBrain Landing Page Loaded');
  
  // Check if user is already logged in
  if (isAuthenticated()) {
    // Optionally redirect to dashboard
    // redirectTo('dashboard.html');
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add scroll effect to header
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header.classList.remove('scroll-up');
      return;
    }

    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
      // Scroll down
      header.classList.remove('scroll-up');
      header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
      // Scroll up
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }

    lastScroll = currentScroll;
  });

  // Parallax effect for hero image
  const heroImage = document.querySelector('.seasons-img');
  if (heroImage) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      heroImage.style.transform = `translateY(${parallax}px)`;
    });
  }

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements
  document.querySelectorAll('.card, .features-content, .video-wrapper').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Video autoplay on scroll (if not autoplay attribute)
  const video = document.querySelector('.hero-video');
  if (video && !video.hasAttribute('autoplay')) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    videoObserver.observe(video);
  }

  // Add loading states to buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.classList.contains('btn-loading')) return;
      
      // Add loading class if navigating
      if (this.href && !this.href.includes('#')) {
        this.classList.add('btn-loading');
      }
    });
  });
});

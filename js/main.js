document.addEventListener('DOMContentLoaded', () => {
  let lenis;

  try {
    lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (e) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      nav.classList.toggle('scrolled', scroll > 60);
    });
  } else {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      if (links.classList.contains('open')) {
        if (lenis) lenis.stop();
        document.body.style.overflow = 'hidden';
      } else {
        if (lenis) lenis.start();
        document.body.style.overflow = '';
      }
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        if (lenis) lenis.start();
        document.body.style.overflow = '';
      });
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children)
          .filter(c => c.classList.contains('fade-in'));
        const delay = siblings.indexOf(entry.target) * 120;
        setTimeout(() => entry.target.classList.add('visible'), delay);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  document.querySelectorAll('.menu-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
      });
    });
  });
});

const testimonials = [...document.querySelectorAll('.testimonial')]; let testimonialIndex = 0;
const arabicNumber = number => String(number).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const setTestimonial = index => { testimonialIndex = (index + testimonials.length) % testimonials.length; testimonials.forEach((item, i) => item.classList.toggle('active', i === testimonialIndex)); document.querySelector('#testimonialCurrent').textContent = arabicNumber(testimonialIndex + 1).padStart(2, '٠'); };
document.querySelector('[data-testimonial="prev"]')?.addEventListener('click', () => setTestimonial(testimonialIndex - 1));
document.querySelector('[data-testimonial="next"]')?.addEventListener('click', () => setTestimonial(testimonialIndex + 1));
setInterval(() => setTestimonial(testimonialIndex + 1), 7500);

export const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.toggle("sticker-highlight");
                setTimeout(() => {
                    entry.target.classList.toggle("sticker-highlight");
                }, 1500);
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.9,
    }
);

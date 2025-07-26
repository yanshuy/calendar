export const observer =
    new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("sticker-highlight");
                    (entry.target as HTMLDivElement).onanimationend = () => entry.target.classList.remove("sticker-highlight");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.9,
        }
    );

(() => {
  const intro = document.querySelector(".cinematic-intro");

  if (!intro) return;
  if (!window.gsap || !window.ScrollTrigger) {
    intro.hidden = true;
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const laptop = intro.querySelector(".laptop");
  const laptopAnchor = intro.querySelector(".laptop-anchor");
  const laptopScreen = intro.querySelector(".laptop-screen");
  const screenContent = intro.querySelector(".laptop-screen-content");
  const laptopBase = intro.querySelector(".laptop-base");
  const laptopHinge = intro.querySelector(".laptop-hinge");
  const background = intro.querySelector(".workspace-background");
  const shade = intro.querySelector(".workspace-shade");
  const copy = intro.querySelector(".cinematic-copy");
  const scrollCue = intro.querySelector(".cinematic-scroll-cue");
  const metrics = { previewScale: 1, verticalOffset: 0 };
  const media = gsap.matchMedia();

  media.add(
    {
      desktop: "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
      reducedMotion: "(prefers-reduced-motion: reduce)",
    },
    ({ conditions }) => {
      if (conditions.reducedMotion) {
        intro.hidden = true;
        return;
      }

      intro.hidden = false;

      const updateMetrics = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollDistance = Math.round(intro.offsetHeight * (conditions.mobile ? 1.25 : 1.9));

        intro.style.setProperty("--screen-ratio", `${viewportWidth / viewportHeight}`);
        intro.style.marginBottom = `${Math.max(0, scrollDistance - intro.offsetHeight)}px`;

        const screenWidth = screenContent.clientWidth;
        const screenCenterX =
          laptop.offsetLeft + laptopScreen.offsetLeft + screenContent.offsetLeft + screenWidth / 2;
        const screenCenterY =
          laptop.offsetTop +
          laptopScreen.offsetTop +
          screenContent.offsetTop +
          screenContent.clientHeight / 2;
        const anchorTop = laptopAnchor.getBoundingClientRect().top;

        metrics.previewScale = screenWidth / viewportWidth;
        metrics.verticalOffset = viewportHeight / 2 - (anchorTop + screenCenterY);

        intro.style.setProperty("--preview-scale", `${metrics.previewScale}`);
        gsap.set(laptop, { transformOrigin: `${screenCenterX}px ${screenCenterY}px` });
      };

      updateMetrics();
      ScrollTrigger.addEventListener("refreshInit", updateMetrics);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: intro,
          start: "top top",
          end: () => `+=${Math.round(intro.offsetHeight * (conditions.mobile ? 1.25 : 1.9))}`,
          pin: true,
          pinSpacing: false,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(
        laptop,
        {
          scale: () => 1 / metrics.previewScale,
          y: () => metrics.verticalOffset,
          duration: 1,
          ease: "none",
        },
        0,
      );
      timeline.to(background, { scale: 1.12, duration: 1, ease: "none" }, 0);
      timeline.to(copy, { autoAlpha: 0, y: -30, duration: 0.18, ease: "none" }, 0);
      timeline.to(scrollCue, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0);
      timeline.to(laptopBase, { autoAlpha: 0, duration: 0.18, ease: "none" }, 0.68);
      timeline.to(laptopHinge, { autoAlpha: 0, duration: 0.18, ease: "none" }, 0.68);
      timeline.to(shade, { autoAlpha: 0, duration: 0.22, ease: "none" }, 0.76);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", updateMetrics);
        timeline.scrollTrigger?.kill();
        timeline.kill();
        intro.style.removeProperty("--screen-ratio");
        intro.style.removeProperty("--preview-scale");
        intro.style.removeProperty("margin-bottom");
      };
    },
  );

  window.addEventListener("pagehide", () => media.revert(), { once: true });
})();

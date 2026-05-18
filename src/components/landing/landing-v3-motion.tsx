"use client";

import { useEffect } from "react";

export function LandingV3Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".landing-v3");
    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      root.querySelectorAll("[data-r], .chat-msg").forEach((element) => {
        element.classList.add("in");
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -36px 0px", threshold: 0.08 },
    );

    root.querySelectorAll("[data-r]").forEach((element) => {
      revealObserver.observe(element);
    });

    const chatObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".chat-msg").forEach((message, index) => {
              window.setTimeout(() => message.classList.add("in"), index * 160);
            });
            chatObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );

    const chatThread = root.querySelector(".chat-thread");
    if (chatThread) {
      chatObserver.observe(chatThread);
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
            continue;
          }

          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.6 },
    );

    root.querySelectorAll<HTMLElement>("[data-counter]").forEach((counter) => {
      counterObserver.observe(counter);
    });

    const hero = root.querySelector<HTMLElement>(".hero");
    const glow = root.querySelector<HTMLElement>(".hero-cursor-glow");
    const handleHeroEnter = () => {
      if (glow) {
        glow.style.opacity = "1";
      }
    };
    const handleHeroLeave = () => {
      if (glow) {
        glow.style.opacity = "0";
      }
    };
    const handleHeroMove = (event: MouseEvent) => {
      if (!hero || !glow) {
        return;
      }
      const rect = hero.getBoundingClientRect();
      glow.style.left = `${event.clientX - rect.left}px`;
      glow.style.top = `${event.clientY - rect.top}px`;
    };

    hero?.addEventListener("mouseenter", handleHeroEnter);
    hero?.addEventListener("mouseleave", handleHeroLeave);
    hero?.addEventListener("mousemove", handleHeroMove);

    const magneticButtons = Array.from(root.querySelectorAll<HTMLElement>("[data-mag]"));
    const magneticCleanups = magneticButtons.map((button) => {
      const handleMove = (event: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${dx * 0.16}px, ${dy * 0.24}px)`;
      };
      const handleLeave = () => {
        button.style.transform = "";
      };

      button.addEventListener("mousemove", handleMove);
      button.addEventListener("mouseleave", handleLeave);

      return () => {
        button.removeEventListener("mousemove", handleMove);
        button.removeEventListener("mouseleave", handleLeave);
      };
    });

    const faqButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".faq-q"));
    const faqCleanups = faqButtons.map((button) => {
      const handleClick = () => {
        const item = button.closest(".faq-item");
        const wasOpen = item?.classList.contains("open");

        root.querySelectorAll(".faq-item.open").forEach((openItem) => {
          openItem.classList.remove("open");
          openItem.querySelector("button")?.setAttribute("aria-expanded", "false");
        });

        if (item && !wasOpen) {
          item.classList.add("open");
          button.setAttribute("aria-expanded", "true");
        }
      };

      button.addEventListener("click", handleClick);

      return () => button.removeEventListener("click", handleClick);
    });

    return () => {
      revealObserver.disconnect();
      chatObserver.disconnect();
      counterObserver.disconnect();
      hero?.removeEventListener("mouseenter", handleHeroEnter);
      hero?.removeEventListener("mouseleave", handleHeroLeave);
      hero?.removeEventListener("mousemove", handleHeroMove);
      for (const cleanup of magneticCleanups) {
        cleanup();
      }
      for (const cleanup of faqCleanups) {
        cleanup();
      }
    };
  }, []);

  return null;
}

function animateCounter(element: HTMLElement) {
  const target = Number.parseFloat(element.dataset.to ?? "0");
  const prefix = element.dataset.prefix ?? "";
  const suffix = element.dataset.suffix ?? "";
  const startedAt = performance.now();
  const duration = 1400;

  function tick(now: number) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = target * eased;
    const display = Number.isInteger(target)
      ? Math.floor(value).toString()
      : value.toFixed(1);

    element.textContent = `${prefix}${display}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

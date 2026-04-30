"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { InstagramIcon, FacebookIcon, GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import "./OrganizerProfileModal.css";

/* ============================================ */
/* DATA STRUCTURE: Separated image from details */
/* ============================================ */
export interface OrganizerImage {
  src: string;
  alt: string;
}

export interface OrganizerSocial {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
}

export interface OrganizerDetails {
  name: string;
  role: string;
  quote: string;
  bio: string;
  social: OrganizerSocial;
  status: string;
  specialization: string;
}

export interface OrganizerData {
  image: OrganizerImage;
  details: OrganizerDetails;
}

/* ============================================ */
/* PROPS                                        */
/* ============================================ */
interface OrganizerProfileModalProps {
  organizer: OrganizerData;
  onClose: () => void;
  /** Label shown on the bottom action badge. Defaults to "Approved Architect" */
  actionLabel?: string;
}

/* ============================================ */
/* COMPONENT                                    */
/* ============================================ */
export default function OrganizerProfileModal({
  organizer,
  onClose,
  actionLabel = "Approved Architect",
}: OrganizerProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- Lock body scroll ---- */
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  /* ---- ESC key close ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* ---- Focus trap ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    first?.focus();
    return () => document.removeEventListener("keydown", trap);
  }, []);

  const { image, details } = organizer;
  const hasSocials =
    details.social.instagram ||
    details.social.facebook ||
    details.social.linkedin ||
    details.social.github;

  return (
    /* ---- Overlay ---- */
    <div
      ref={overlayRef}
      className="opm-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile of ${details.name}`}
    >
      {/* ---- Modal Container ---- */}
      <div ref={containerRef} className="opm-container">
        {/* ---- Close Button ---- */}
        <button
          className="opm-close"
          onClick={onClose}
          aria-label="Close profile modal"
        >
          <X size={18} />
        </button>

        {/* ============================================ */}
        {/* IMAGE PANEL — renders independently          */}
        {/* ============================================ */}
        <div className="opm-image-panel">
          {image.src ? (
            <img src={image.src} alt={image.alt} />
          ) : (
            <div className="opm-fallback">{details.name.charAt(0)}</div>
          )}
        </div>

        {/* ============================================ */}
        {/* TEXT PANEL — all detail rendering             */}
        {/* ============================================ */}
        <div className="opm-text-panel custom-scrollbar">
          {/* Mobile WhatsApp-style avatar overlay */}
          <div className="opm-avatar-overlay">
            <div className="opm-avatar-circle">
              {image.src ? (
                <img src={image.src} alt={image.alt} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "var(--color-brown-primary)",
                    background: "var(--color-parchment-contrast)",
                  }}
                >
                  {details.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="opm-name serif">{details.name}</h2>

          {/* Role */}
          <p className="opm-role">{details.role}</p>

          {/* Quote */}
          {details.quote && (
            <blockquote className="opm-quote serif">
              &ldquo;{details.quote}&rdquo;
            </blockquote>
          )}

          {/* Social Icons */}
          {hasSocials && (
            <div className="opm-social-row">
              {details.social.instagram && (
                <a
                  href={details.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opm-social-link"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
              )}
              {details.social.facebook && (
                <a
                  href={details.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opm-social-link"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              )}
              {details.social.linkedin && (
                <a
                  href={details.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opm-social-link"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={20} />
                </a>
              )}
              {details.social.github && (
                <a
                  href={details.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opm-social-link"
                  aria-label="GitHub"
                >
                  <GithubIcon size={20} />
                </a>
              )}
            </div>
          )}

          {/* Status Chips */}
          {(details.status || details.specialization) && (
            <div className="opm-chips">
              {details.status && (
                <span className="opm-chip">
                  <Sparkles size={12} /> {details.status}
                </span>
              )}
              {details.specialization && (
                <span className="opm-chip">{details.specialization}</span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="opm-divider" />

          {/* Bio Text */}
          {details.bio && <p className="opm-bio">{details.bio}</p>}

          {/* Action Button */}
          <div className="opm-action-btn">
            <Sparkles size={14} /> {actionLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

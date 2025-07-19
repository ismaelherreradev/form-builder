"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  createContext,
  useContext,
} from "react";
import { toast } from "sonner";

// Accessibility context for managing focus and announcements
interface AccessibilityContextType {
  announceToScreenReader: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void;
  setFocusTrap: (element: HTMLElement | null) => void;
  manageFocus: (elementId: string) => void;
  isReducedMotion: boolean;
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null,
);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  }
  return context;
};

// Accessibility Provider
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium",
  );
  const announceRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);

  // Detect user preferences
  useEffect(() => {
    // Reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) =>
      setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    // High contrast preference
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    setHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) =>
      setHighContrast(e.matches);
    contrastQuery.addEventListener("change", handleContrastChange);

    // Font size preference from localStorage
    const savedFontSize = localStorage.getItem("form-builder-font-size") as
      | "small"
      | "medium"
      | "large";
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
    };
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (announceRef.current) {
        announceRef.current.setAttribute("aria-live", priority);
        announceRef.current.textContent = message;

        // Clear after announcement
        setTimeout(() => {
          if (announceRef.current) {
            announceRef.current.textContent = "";
          }
        }, 1000);
      }
    },
    [],
  );

  // Focus trap management
  const setFocusTrap = useCallback((element: HTMLElement | null) => {
    focusTrapRef.current = element;

    if (element) {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }

          if (e.key === "Escape") {
            const closeButton = element.querySelector(
              "[data-dismiss]",
            ) as HTMLElement;
            if (closeButton) {
              closeButton.click();
            }
          }
        };

        element.addEventListener("keydown", handleKeyDown);
        firstElement.focus();

        return () => {
          element.removeEventListener("keydown", handleKeyDown);
        };
      }
    }
  }, []);

  // Focus management
  const manageFocus = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        announceToScreenReader(
          `Focused on ${element.getAttribute("aria-label") || element.textContent || "element"}`,
        );
      }
    },
    [announceToScreenReader],
  );

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        setFocusTrap,
        manageFocus,
        isReducedMotion,
        highContrast,
        fontSize,
      }}
    >
      {children}
      {/* Screen reader announcement area */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  );
}

// Keyboard navigation hook
export const useKeyboardNavigation = (
  elements: string[],
  onSelect?: (elementId: string) => void,
  options: {
    wrap?: boolean;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
  } = {},
) => {
  const { wrap = true, orientation = "vertical", disabled = false } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isVertical = orientation === "vertical";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

      if (e.key === nextKey || e.key === prevKey) {
        e.preventDefault();

        let newIndex = currentIndex;

        if (e.key === nextKey) {
          newIndex = currentIndex + 1;
          if (newIndex >= elements.length) {
            newIndex = wrap ? 0 : elements.length - 1;
          }
        } else {
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? elements.length - 1 : 0;
          }
        }

        setCurrentIndex(newIndex);
        onSelect?.(elements[newIndex]);
        announceToScreenReader(`Item ${newIndex + 1} of ${elements.length}`);
      }

      if (e.key === "Home") {
        e.preventDefault();
        setCurrentIndex(0);
        onSelect?.(elements[0]);
        announceToScreenReader("First item");
      }

      if (e.key === "End") {
        e.preventDefault();
        const lastIndex = elements.length - 1;
        setCurrentIndex(lastIndex);
        onSelect?.(elements[lastIndex]);
        announceToScreenReader("Last item");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    elements,
    onSelect,
    wrap,
    orientation,
    disabled,
    announceToScreenReader,
  ]);

  return { currentIndex, setCurrentIndex };
};

// Accessible drag and drop announcements
export const useDragDropAnnouncements = () => {
  const { announceToScreenReader } = useAccessibility();

  const announceDragStart = useCallback(
    (elementLabel: string) => {
      announceToScreenReader(
        `Started dragging ${elementLabel}. Use arrow keys to move, space to drop.`,
        "assertive",
      );
    },
    [announceToScreenReader],
  );

  const announceDragMove = useCallback(
    (position: string) => {
      announceToScreenReader(`Moved to ${position}`, "polite");
    },
    [announceToScreenReader],
  );

  const announceDragEnd = useCallback(
    (elementLabel: string, success: boolean) => {
      if (success) {
        announceToScreenReader(
          `Successfully moved ${elementLabel}`,
          "assertive",
        );
      } else {
        announceToScreenReader(`Cancelled moving ${elementLabel}`, "assertive");
      }
    },
    [announceToScreenReader],
  );

  const announceDropZone = useCallback(
    (isValid: boolean, position?: string) => {
      if (isValid) {
        announceToScreenReader(
          `Valid drop zone${position ? ` at ${position}` : ""}`,
          "polite",
        );
      } else {
        announceToScreenReader("Invalid drop zone", "polite");
      }
    },
    [announceToScreenReader],
  );

  return {
    announceDragStart,
    announceDragMove,
    announceDragEnd,
    announceDropZone,
  };
};

// Skip link component
export function SkipLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      onFocus={() => {
        toast.info("Press Enter to skip to main content");
      }}
    >
      {children}
    </a>
  );
}

// Accessible button with enhanced keyboard support
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  loading?: boolean;
  shortcut?: string;
  description?: string;
}

export function AccessibleButton({
  children,
  variant = "default",
  size = "default",
  loading = false,
  shortcut,
  description,
  disabled,
  onClick,
  ...props
}: AccessibleButtonProps) {
  const { announceToScreenReader } = useAccessibility();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      onClick?.(e);

      if (description) {
        announceToScreenReader(description);
      }
    },
    [onClick, loading, disabled, description, announceToScreenReader],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (shortcut && e.key === shortcut && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleClick(e as any);
      }
    },
    [shortcut, handleClick],
  );

  useEffect(() => {
    if (shortcut) {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === shortcut && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          buttonRef.current?.click();
        }
      };

      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, [shortcut]);

  return (
    <button
      ref={buttonRef}
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-busy={loading}
      aria-describedby={description ? `${props.id}-description` : undefined}
      aria-keyshortcuts={
        shortcut
          ? `${navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"}+${shortcut}`
          : undefined
      }
      className={`
        relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
        ${variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
        ${variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : ""}
        ${variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}
        ${variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" : ""}
        ${size === "sm" ? "h-9 px-3" : size === "lg" ? "h-11 px-8" : "h-10 px-4 py-2"}
      `}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
      {shortcut && (
        <span className="ml-2 text-xs opacity-60">
          {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+{shortcut}
        </span>
      )}
      {description && (
        <span id={`${props.id}-description`} className="sr-only">
          {description}
        </span>
      )}
    </button>
  );
}

// Accessible form field wrapper
interface AccessibleFieldProps {
  children: React.ReactNode;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  id: string;
}

export function AccessibleField({
  children,
  label,
  description,
  error,
  required = false,
  id,
}: AccessibleFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(
          children as React.ReactElement,
          {
            id,
            "aria-describedby":
              [
                description ? `${id}-description` : "",
                error ? `${id}-error` : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined,
            "aria-invalid": error ? "true" : undefined,
            "aria-required": required,
          } as any,
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("form-builder-high-contrast") === "true";
    setIsHighContrast(saved);

    if (saved) {
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem("form-builder-high-contrast", String(newValue));

    if (newValue) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    toast.success(`High contrast mode ${newValue ? "enabled" : "disabled"}`);
  }, [isHighContrast]);

  return (
    <AccessibleButton
      variant="outline"
      size="sm"
      onClick={toggleHighContrast}
      description={`Toggle high contrast mode. Currently ${isHighContrast ? "enabled" : "disabled"}`}
      aria-pressed={isHighContrast}
    >
      {isHighContrast ? "Disable" : "Enable"} High Contrast
    </AccessibleButton>
  );
}

// Font size controls
export function FontSizeControls() {
  const { fontSize } = useAccessibility();
  const [currentSize, setCurrentSize] = useState(fontSize);

  const handleSizeChange = useCallback(
    (newSize: "small" | "medium" | "large") => {
      setCurrentSize(newSize);
      localStorage.setItem("form-builder-font-size", newSize);

      // Apply font size class to document
      document.documentElement.classList.remove(
        "font-small",
        "font-medium",
        "font-large",
      );
      document.documentElement.classList.add(`font-${newSize}`);

      toast.success(`Font size changed to ${newSize}`);
    },
    [],
  );

  return (
    <div role="group" aria-labelledby="font-size-label" className="flex gap-2">
      <span id="font-size-label" className="text-sm font-medium">
        Font Size:
      </span>

      {(["small", "medium", "large"] as const).map((size) => (
        <AccessibleButton
          key={size}
          variant={currentSize === size ? "default" : "outline"}
          size="sm"
          onClick={() => handleSizeChange(size)}
          aria-pressed={currentSize === size}
          description={`Set font size to ${size}`}
        >
          {size.charAt(0).toUpperCase() + size.slice(1)}
        </AccessibleButton>
      ))}
    </div>
  );
}

// Accessibility checker utility
export const checkAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll("img");
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute("aria-hidden")) {
      issues.push(`Image ${index + 1} is missing alt text`);
    }
  });

  // Check for buttons without accessible names
  const buttons = element.querySelectorAll("button");
  buttons.forEach((button, index) => {
    const hasAccessibleName =
      button.textContent?.trim() ||
      button.getAttribute("aria-label") ||
      button.getAttribute("aria-labelledby");

    if (!hasAccessibleName) {
      issues.push(`Button ${index + 1} has no accessible name`);
    }
  });

  // Check for form inputs without labels
  const inputs = element.querySelectorAll("input, select, textarea");
  inputs.forEach((input, index) => {
    const hasLabel =
      input.getAttribute("aria-label") ||
      input.getAttribute("aria-labelledby") ||
      element.querySelector(`label[for="${input.id}"]`);

    if (!hasLabel) {
      issues.push(`Form field ${index + 1} has no associated label`);
    }
  });

  // Check color contrast (basic check)
  const elementsWithText = element.querySelectorAll("*");
  elementsWithText.forEach((el) => {
    if (el.textContent?.trim()) {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // This is a simplified check - in production you'd use a proper contrast checking library
      if (color && backgroundColor && color === backgroundColor) {
        issues.push(`Element may have insufficient color contrast`);
      }
    }
  });

  return issues;
};

// Live region for dynamic content announcements
export function LiveRegion({
  message,
  priority = "polite",
}: {
  message: string;
  priority?: "polite" | "assertive";
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}

// Focus management hook for modal dialogs
export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const captureFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { captureFocus, restoreFocus };
};

// Reduced motion wrapper
export function ReducedMotionWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isReducedMotion } = useAccessibility();

  if (isReducedMotion && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={isReducedMotion ? "motion-reduce" : ""}>{children}</div>
  );
}

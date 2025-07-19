"use client";

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { FixedSizeList as List } from "react-window";
import { debounce, throttle } from "lodash-es";

import { FormElementInstance } from "../elements";

// Performance monitoring utilities
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      const measurements = this.metrics.get(name)!;
      measurements.push(duration);

      // Keep only the last 100 measurements
      if (measurements.length > 100) {
        measurements.splice(0, measurements.length - 100);
      }
    };
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;

    return (
      measurements.reduce((sum, time) => sum + time, 0) / measurements.length
    );
  }

  getMetrics(): Record<
    string,
    { average: number; count: number; min: number; max: number }
  > {
    const result: Record<
      string,
      { average: number; count: number; min: number; max: number }
    > = {};

    this.metrics.forEach((measurements, name) => {
      if (measurements.length > 0) {
        result[name] = {
          average:
            measurements.reduce((sum, time) => sum + time, 0) /
            measurements.length,
          count: measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements),
        };
      }
    });

    return result;
  }

  observeLCP(callback: (value: number) => void): void {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          callback(lastEntry.startTime);
        }
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.set("lcp", observer);
    }
  }

  observeFID(callback: (value: number) => void): void {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === "first-input-delay") {
            callback(entry.value);
          }
        });
      });

      observer.observe({ entryTypes: ["first-input"] });
      this.observers.set("fid", observer);
    }
  }

  observeCLS(callback: (value: number) => void): void {
    if ("PerformanceObserver" in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            callback(clsValue);
          }
        });
      });

      observer.observe({ entryTypes: ["layout-shift"] });
      this.observers.set("cls", observer);
    }
  }

  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Virtual scrolling for large lists
interface VirtualizedElementListProps {
  elements: FormElementInstance[];
  height: number;
  width: number;
  itemHeight: number;
  renderElement: (
    element: FormElementInstance,
    index: number,
  ) => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  overscan?: number;
}

export const VirtualizedElementList = memo(
  ({
    elements,
    height,
    width,
    itemHeight,
    renderElement,
    onScroll,
    overscan = 5,
  }: VirtualizedElementListProps) => {
    const listRef = useRef<List>(null);

    const ItemRenderer = useCallback(
      ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const element = elements[index];
        return <div style={style}>{renderElement(element, index)}</div>;
      },
      [elements, renderElement],
    );

    const handleScroll = useCallback(
      throttle((props: any) => {
        onScroll?.(props.scrollTop);
      }, 16), // ~60fps
      [onScroll],
    );

    return (
      <List
        ref={listRef}
        height={height}
        width={width}
        itemCount={elements.length}
        itemSize={itemHeight}
        onScroll={handleScroll}
        overscanCount={overscan}
      >
        {ItemRenderer}
      </List>
    );
  },
);

VirtualizedElementList.displayName = "VirtualizedElementList";

// Debounced input hook for performance
export const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();

    return () => {
      handler.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback as unknown as T;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options,
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};

// Memoized element wrapper for preventing unnecessary re-renders
interface MemoizedElementWrapperProps {
  element: FormElementInstance;
  isSelected: boolean;
  children: React.ReactNode;
  onSelect?: (elementId: string) => void;
}

export const MemoizedElementWrapper = memo(
  ({
    element,
    isSelected,
    children,
    onSelect,
  }: MemoizedElementWrapperProps) => {
    const handleClick = useCallback(() => {
      onSelect?.(element.id);
    }, [element.id, onSelect]);

    return (
      <div
        onClick={handleClick}
        className={`element-wrapper ${isSelected ? "selected" : ""}`}
        data-element-id={element.id}
      >
        {children}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.element.id === nextProps.element.id &&
      prevProps.isSelected === nextProps.isSelected &&
      JSON.stringify(prevProps.element.extraAttributes) ===
        JSON.stringify(nextProps.element.extraAttributes)
    );
  },
);

MemoizedElementWrapper.displayName = "MemoizedElementWrapper";

// Performance-optimized form state hook
export const useOptimizedFormState = (
  initialElements: FormElementInstance[],
) => {
  const [elements, setElements] = useState(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  // Memoized selectors
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedElementId) || null,
    [elements, selectedElementId],
  );

  const elementMap = useMemo(
    () => new Map(elements.map((el) => [el.id, el])),
    [elements],
  );

  // Optimized update function that only updates specific element
  const updateElement = useCallback(
    (elementId: string, updates: Partial<FormElementInstance>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
      );
    },
    [],
  );

  // Batch updates for better performance
  const batchUpdateElements = useCallback(
    (updates: Array<{ id: string; updates: Partial<FormElementInstance> }>) => {
      setElements((prev) => {
        const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
        return prev.map((el) => {
          const elementUpdates = updateMap.get(el.id);
          return elementUpdates ? { ...el, ...elementUpdates } : el;
        });
      });
    },
    [],
  );

  return {
    elements,
    setElements,
    selectedElement,
    selectedElementId,
    setSelectedElementId,
    elementMap,
    updateElement,
    batchUpdateElements,
  };
};

// Image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage = memo(
  ({ src, alt, className, placeholder }: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={imgRef} className={className}>
        {isInView && (
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        )}
        {!isLoaded && placeholder && (
          <div className="placeholder bg-gray-200 animate-pulse">
            {placeholder}
          </div>
        )}
      </div>
    );
  },
);

LazyImage.displayName = "LazyImage";

// Performance monitoring React component
interface PerformanceMonitorComponentProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: Record<string, any>) => void;
}

export const PerformanceMonitorComponent = ({
  enabled = false,
  onMetricsUpdate,
}: PerformanceMonitorComponentProps) => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const monitor = useMemo(() => PerformanceMonitor.getInstance(), []);

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const currentMetrics = {
        ...monitor.getMetrics(),
        timestamp: Date.now(),
      };
      setMetrics(currentMetrics);
      onMetricsUpdate?.(currentMetrics);
    };

    const interval = setInterval(updateMetrics, 2000);

    // Observe Core Web Vitals
    monitor.observeLCP((lcp) => {
      setMetrics((prev) => ({ ...prev, lcp }));
    });

    monitor.observeFID((fid) => {
      setMetrics((prev) => ({ ...prev, fid }));
    });

    monitor.observeCLS((cls) => {
      setMetrics((prev) => ({ ...prev, cls }));
    });

    return () => {
      clearInterval(interval);
      monitor.disconnect();
    };
  }, [enabled, monitor, onMetricsUpdate]);

  if (!enabled || Object.keys(metrics).length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 text-xs space-y-1 shadow-lg z-50">
      <div className="font-semibold">Performance Metrics</div>
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex justify-between gap-2">
          <span className="text-muted-foreground">{key}:</span>
          <span className="font-mono">
            {typeof value === "number" ? value.toFixed(2) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Optimized render function with automatic performance timing
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  name: string,
) => {
  const TrackedComponent = (props: P) => {
    const monitor = PerformanceMonitor.getInstance();

    useEffect(() => {
      const endTiming = monitor.startTiming(`${name}_render`);
      return endTiming;
    });

    return <Component {...props} />;
  };

  TrackedComponent.displayName = `withPerformanceTracking(${Component.displayName || Component.name || "Component"})`;

  return TrackedComponent;
};

// Bundle size analyzer utility
export const getBundleSize = (): Promise<number> => {
  return new Promise((resolve) => {
    if ("navigator" in window && "connection" in navigator) {
      const connection = (navigator as any).connection;
      resolve(connection.downlink || 0);
    } else {
      resolve(0);
    }
  });
};

// Render optimization hook
export const useRenderOptimization = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Render #${renderCount.current}, time since last: ${timeSinceLastRender.toFixed(2)}ms`,
      );
    }
  });

  return {
    renderCount: renderCount.current,
    measureRender: useCallback((name: string) => {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.startTiming(name);
    }, []),
  };
};

export { PerformanceMonitor };

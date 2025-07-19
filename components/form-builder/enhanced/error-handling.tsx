"use client";

import {
  Component,
  ErrorInfo,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  AlertTriangle,
  RefreshCcw,
  Save,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { FormElementInstance } from "../elements";

// Error types and interfaces
export interface FormBuilderError {
  type:
    | "drag_drop"
    | "ai_generation"
    | "preview"
    | "validation"
    | "save"
    | "load"
    | "network"
    | "unknown";
  message: string;
  elementId?: string;
  recoverable: boolean;
  suggestions: string[];
  stack?: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<void> | void;
  destructive?: boolean;
}

export interface AutoSaveState {
  isEnabled: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveInProgress: boolean;
  autoSaveInterval: number;
  retryCount: number;
  maxRetries: number;
}

// Error context
interface ErrorContextType {
  errors: FormBuilderError[];
  addError: (error: Omit<FormBuilderError, "timestamp">) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  lastError: FormBuilderError | null;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorHandler must be used within ErrorProvider");
  }
  return context;
};

// Error Provider
interface ErrorProviderProps {
  children: ReactNode;
  onError?: (error: FormBuilderError) => void;
}

export function ErrorProvider({ children, onError }: ErrorProviderProps) {
  const [errors, setErrors] = useState<FormBuilderError[]>([]);

  const addError = useCallback(
    (error: Omit<FormBuilderError, "timestamp">) => {
      const fullError: FormBuilderError = {
        ...error,
        timestamp: new Date(),
      };

      setErrors((prev) => [...prev, fullError]);
      onError?.(fullError);

      // Auto-remove low severity errors after 5 seconds
      if (error.severity === "low") {
        setTimeout(() => {
          setErrors((prev) => prev.filter((e) => e !== fullError));
        }, 5000);
      }
    },
    [onError],
  );

  const removeError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const lastError = errors.length > 0 ? errors[errors.length - 1] : null;

  return (
    <ErrorContext.Provider
      value={{ errors, addError, removeError, clearErrors, lastError }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

// Enhanced Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    retry: () => void,
  ) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error details
    console.group("🚨 Form Builder Error");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();

    // Report to error tracking service (if available)
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
        custom_map: {
          error_id: this.state.errorId,
          component_stack: errorInfo.componentStack,
        },
      });
    }
  }

  retry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: "",
      });
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.retry,
        );
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.retry}
          canRetry={this.retryCount < this.maxRetries}
          retryCount={this.retryCount}
          enableRecovery={this.props.enableRecovery}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  canRetry: boolean;
  retryCount: number;
  enableRecovery?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  canRetry,
  retryCount,
  enableRecovery = true,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const handleSendReport = useCallback(async () => {
    try {
      // Simulate sending error report
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReportSent(true);
    } catch (err) {
      console.error("Failed to send error report:", err);
    }
  }, []);

  const handleDownloadLogs = useCallback(() => {
    const logs = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: errorInfo?.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-builder-error-${errorId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [error, errorInfo, errorId]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                The form builder encountered an unexpected error
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Badge variant="outline">Error ID: {errorId}</Badge>
            <Badge variant="outline">
              Retry {retryCount}/{3}
            </Badge>
          </div>

          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="actions">Recovery Actions</TabsTrigger>
              <TabsTrigger value="details">Error Details</TabsTrigger>
              <TabsTrigger value="report">Report Issue</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid gap-3">
                {canRetry && (
                  <Button onClick={onRetry} className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reload Page
                </Button>

                {enableRecovery && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDownloadLogs}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Error Log
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const backup = localStorage.getItem(
                          "form-builder-backup",
                        );
                        if (backup) {
                          console.log("Form backup found:", backup);
                          // Could implement restore functionality here
                        }
                      }}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Restore from Backup
                    </Button>
                  </>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>If the problem persists:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Check your internet connection</li>
                  <li>Contact support with the error ID</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Error Message</label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                    {error.message}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Error Type</label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                    {error.name}
                  </div>
                </div>

                {error.stack && (
                  <div>
                    <label className="text-sm font-medium">Stack Trace</label>
                    <ScrollArea className="mt-1 h-32">
                      <pre className="p-3 bg-muted rounded-md text-xs font-mono">
                        {error.stack}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div>
                    <label className="text-sm font-medium">
                      Component Stack
                    </label>
                    <ScrollArea className="mt-1 h-32">
                      <pre className="p-3 bg-muted rounded-md text-xs font-mono">
                        {errorInfo.componentStack}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="report" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Additional Information
                  </label>
                  <Textarea
                    placeholder="Describe what you were doing when this error occurred..."
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSendReport}
                  disabled={reportSent}
                  className="w-full gap-2"
                >
                  {reportSent ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Report Sent
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Send Error Report
                    </>
                  )}
                </Button>

                {reportSent && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Thank you for reporting this issue. Our team will
                      investigate and work on a fix.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Auto-save hook
export const useAutoSave = (
  data: FormElementInstance[],
  saveFunction: (data: FormElementInstance[]) => Promise<void>,
  options: {
    interval?: number;
    maxRetries?: number;
    enabled?: boolean;
  } = {},
) => {
  const {
    interval = 30000, // 30 seconds
    maxRetries = 3,
    enabled = true,
  } = options;

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isEnabled: enabled,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveInProgress: false,
    autoSaveInterval: interval,
    retryCount: 0,
    maxRetries,
  });

  const lastSavedDataRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addError } = useErrorHandler();

  // Check for changes
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    const hasChanges = currentDataString !== lastSavedDataRef.current;

    setAutoSaveState((prev) => ({
      ...prev,
      hasUnsavedChanges: hasChanges,
    }));

    if (
      hasChanges &&
      autoSaveState.isEnabled &&
      !autoSaveState.saveInProgress
    ) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, interval);
    }
  }, [data]);

  const performAutoSave = useCallback(async () => {
    if (!autoSaveState.isEnabled || autoSaveState.saveInProgress) return;

    setAutoSaveState((prev) => ({ ...prev, saveInProgress: true }));

    try {
      await saveFunction(data);

      lastSavedDataRef.current = JSON.stringify(data);
      setAutoSaveState((prev) => ({
        ...prev,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveInProgress: false,
        retryCount: 0,
      }));

      // Also save to local storage as backup
      localStorage.setItem(
        "form-builder-backup",
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      const newRetryCount = autoSaveState.retryCount + 1;

      setAutoSaveState((prev) => ({
        ...prev,
        saveInProgress: false,
        retryCount: newRetryCount,
      }));

      addError({
        type: "save",
        message: `Auto-save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        severity: newRetryCount >= maxRetries ? "high" : "medium",
        recoverable: true,
        suggestions: [
          "Check your internet connection",
          "Try saving manually",
          "Your work is backed up locally",
        ],
      });

      // Retry if under limit
      if (newRetryCount < maxRetries) {
        setTimeout(
          () => {
            performAutoSave();
          },
          Math.pow(2, newRetryCount) * 1000,
        ); // Exponential backoff
      }
    }
  }, [data, saveFunction, autoSaveState, maxRetries, interval, addError]);

  const manualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    autoSaveState,
    manualSave,
    toggleAutoSave,
  };
};

// Auto-save indicator component
interface AutoSaveIndicatorProps {
  autoSaveState: AutoSaveState;
  onManualSave?: () => void;
}

export function AutoSaveIndicator({
  autoSaveState,
  onManualSave,
}: AutoSaveIndicatorProps) {
  const getStatusIcon = () => {
    if (autoSaveState.saveInProgress) {
      return <RefreshCcw className="h-4 w-4 animate-spin" />;
    }
    if (autoSaveState.hasUnsavedChanges) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (autoSaveState.saveInProgress) {
      return "Saving...";
    }
    if (autoSaveState.hasUnsavedChanges) {
      return "Unsaved changes";
    }
    if (autoSaveState.lastSaved) {
      const timeSince = Date.now() - autoSaveState.lastSaved.getTime();
      const minutes = Math.floor(timeSince / 60000);
      if (minutes === 0) {
        return "Saved just now";
      }
      return `Saved ${minutes}m ago`;
    }
    return "Not saved";
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {getStatusIcon()}
      <span>{getStatusText()}</span>

      {autoSaveState.hasUnsavedChanges && onManualSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onManualSave}
          className="h-6 px-2 text-xs"
        >
          Save now
        </Button>
      )}

      {!autoSaveState.isEnabled && (
        <Badge variant="outline" className="text-xs">
          Auto-save off
        </Badge>
      )}
    </div>
  );
}

// Error notification component
export function ErrorNotifications() {
  const { errors, removeError } = useErrorHandler();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {errors.map((error, index) => (
        <Alert
          key={`${error.timestamp.getTime()}-${index}`}
          variant={
            error.severity === "critical" || error.severity === "high"
              ? "destructive"
              : "default"
          }
          className={cn(
            "w-80 shadow-lg",
            error.severity === "low" &&
              "animate-in slide-in-from-right duration-300",
          )}
        >
          {error.severity === "critical" || error.severity === "high" ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <p className="font-medium">{error.message}</p>
              {error.suggestions.length > 0 && (
                <ul className="mt-2 text-xs opacity-80">
                  {error.suggestions.slice(0, 2).map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeError(index)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { DocumentViewerModal } from './DocumentViewerModal';

interface DocumentViewerContextValue {
  openDocument: (url: string, title?: string) => void;
}

const DocumentViewerContext = createContext<DocumentViewerContextValue | null>(
  null
);

export function DocumentViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    url: string;
    title?: string;
  } | null>(null);

  const openDocument = useCallback((url: string, title?: string) => {
    setState({ url, title });
  }, []);

  const close = useCallback(() => setState(null), []);

  return (
    <DocumentViewerContext.Provider value={{ openDocument }}>
      {children}
      {state && (
        <DocumentViewerModal
          url={state.url}
          title={state.title}
          onClose={close}
        />
      )}
    </DocumentViewerContext.Provider>
  );
}

export function useDocumentViewer() {
  const ctx = useContext(DocumentViewerContext);
  if (!ctx) {
    throw new Error('useDocumentViewer must be used within DocumentViewerProvider');
  }
  return ctx;
}

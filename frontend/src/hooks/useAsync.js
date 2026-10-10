import { useEffect, useState } from "react";

// Runs an async function whenever `deps` change and tracks loading / error state.
// Previous data is kept while reloading so lists don't flash empty.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

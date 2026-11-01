import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import { getErrorMessage } from "../utils/format";

// Read-only public resources; stale responses are ignored on unmount/reload.
export default function useApiResource(endpoint) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  useEffect(() => {
    let ignore = false;
    API.get(endpoint).then((response) => {
      if (!ignore) setState({ data: response.data?.data ?? response.data, loading: false, error: "" });
    }).catch((error) => {
      if (!ignore) setState({ data: null, loading: false, error: getErrorMessage(error, "Data belum dapat dimuat. Silakan coba lagi.") });
    });
    return () => { ignore = true; };
  }, [endpoint, revision]);
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setRevision((value) => value + 1);
  }, []);
  return { ...state, reload };
}

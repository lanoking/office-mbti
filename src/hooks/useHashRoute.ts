import { useCallback, useEffect, useState } from 'react';
import { parseHash, routeToHash, type Route } from '../lib/router';

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route, opts?: { replace?: boolean }) => {
    const hash = routeToHash(next);
    if (opts?.replace) {
      window.history.replaceState(null, '', hash);
      setRoute(next);
      window.scrollTo({ top: 0 });
    } else if (window.location.hash !== hash) {
      window.location.hash = hash; // hashchange 이벤트가 상태를 갱신한다
    } else {
      setRoute(next);
    }
  }, []);

  return { route, navigate };
}

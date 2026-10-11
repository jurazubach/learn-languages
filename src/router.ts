import { useEffect, useState } from 'react';

// Hash-роутинг: GitHub Pages отдаёт только статику, а #/... работает
// без серверных редиректов и под любым путём репозитория.
export interface Route {
  parts: string[];
  params: URLSearchParams;
  hash: string;
}

function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query), hash };
}

export function useRoute(): Route {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parse(hash);
}

export function go(path: string) {
  window.location.hash = path;
}


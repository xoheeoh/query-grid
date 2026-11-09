/**
 * 앱이 놓인 하위 경로를 붙여 주소를 만든다.
 * 로컬은 "/"에 뜨지만 GitHub Pages에서는 "/query-grid/" 아래에 뜨므로, "/img/..."나 "/sample"처럼 맨 앞이 "/"인 주소는 그대로 쓰면 안 된다.
 * BASE_URL은 vite.config.ts의 base 값이다.
 */
export function appPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}

/** 지금 주소가 앱 안의 어떤 화면인지 비교한다. 하위 경로를 떼고 본다. */
export function isAppRoute(pathname: string, route: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return rest.startsWith(route);
}

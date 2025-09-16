// This page will now be handled by the middleware and the [lang] directory.
// This root page.tsx only needs to exist.
// We can render null and the middleware will handle the redirect.
export default function RootPage() {
  return null;
}

import About from './about/page';
import RouteGuard from './components/RouteGuard';

export default function HomePage() {
  return (
    <RouteGuard requireAuth={false}>
      <div>
        <About />
      </div>
    </RouteGuard>
  );
}

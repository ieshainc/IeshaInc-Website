import AuthPageContent from './components/AuthPageContent';
import RouteGuard from './components/RouteGuard';

export default function HomePage() {
  return (
    <RouteGuard requireAuth={false}>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <AuthPageContent />
      </div>
    </RouteGuard>
  );
}

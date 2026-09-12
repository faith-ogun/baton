import { usePath } from './lib/router';
import { Dashboard } from './app/Dashboard';
import { Landing } from './landing/Landing';

export default function App() {
  const [path] = usePath();
  return path.startsWith('/app') ? <Dashboard /> : <Landing />;
}

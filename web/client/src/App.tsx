import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdvancedPage } from './pages/AdvancedPage';
import { AudioPage } from './pages/AudioPage';
import { FormatsPage } from './pages/FormatsPage';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { NetworkPage } from './pages/NetworkPage';
import { SubtitlesPage } from './pages/SubtitlesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="formats" element={<FormatsPage />} />
        <Route path="subtitles" element={<SubtitlesPage />} />
        <Route path="audio" element={<AudioPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="advanced" element={<AdvancedPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

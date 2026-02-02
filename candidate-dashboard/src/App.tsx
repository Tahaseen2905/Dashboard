import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateDashboard from './components/CandidateDashboard';
import CandidateDetails from './components/CandidateDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CandidateDashboard />} />
        <Route path="/candidate-details" element={<CandidateDetails />} />
      </Routes>
    </Router>
  );
}

export default App;

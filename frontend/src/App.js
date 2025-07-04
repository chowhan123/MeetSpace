import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LadingPage from './Pages/landing';
import Authentication from './Pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './Pages/videoMeet';
import HomeComponent from './Pages/home';
import History from './Pages/history';

function App() {
  return (
    <div className='App'> 
      <Router>
        <AuthProvider>
          <Routes>

            <Route path="/" element={<LadingPage/>} />
            <Route path="/auth" element={<Authentication/>} />
            <Route path="/home" element={<HomeComponent/>} />
            <Route path="/:url" element={<VideoMeetComponent/>} />
            <Route path="/history" element={<History/>} />

          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

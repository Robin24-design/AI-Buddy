import { Toaster } from "./toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './PageNotFound';
import { AuthProvider, useAuth } from './AuthContext';
import UserNotRegisteredError from './UserNotRegisteredError';
import ScrollToTop from './ScrollToTop';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './Dashboard';
import EmailGenerator from './EmailGenerator';
import MeetingSummarizer from './MeetingSummarizer';
import TaskPlanner from './TaskPlanner';
import ResearchAssistant from './ResearchAssistant';
import Chatbot from './Chatbot';
import SavedLibrary from './SavedLibrary';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/email" element={<EmailGenerator />} />
          <Route path="/notes" element={<MeetingSummarizer />} />
          <Route path="/tasks" element={<TaskPlanner />} />
          <Route path="/research" element={<ResearchAssistant />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/library" element={<SavedLibrary />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

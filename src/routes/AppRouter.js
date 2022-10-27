import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { IntegrationsPage } from '../pages/IntegrationsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { PasswordResetPage } from '../pages/PasswordResetPage';
import { NewPasswordPage } from '../pages/NewPasswordPage';
import { PrivateRoute } from '../pages/PrivateRoute.js';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AuthProvider } from '../contexts/AuthContext';
import { FacebookAuthProvider } from '../contexts/FacebookContext';
import { FirestoreProvider } from '../contexts/FirestoreContext';

// initialize react router for handling of app route and any other possible routes
const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <FirestoreProvider>
        <FacebookAuthProvider>
          <Switch>
            {/* Private Dashboard route*/}
            <PrivateRoute exact path="/integrations" component={IntegrationsPage} />
            {/* Private Profile route*/}
            <PrivateRoute exact path="/profile" component={ProfilePage} />
            {/* Private Dashboard route*/}
            <PrivateRoute exact path="/dashboard" component={DashboardPage} />
            {/* Login route*/}
            <Route path="/login" component={LoginPage} />
            {/* password reset route*/}
            <Route path="/password-reset" component={PasswordResetPage} />
            {/* choose new password route*/}
            <Route path="/new-password" component={NewPasswordPage} />
            {/* 404 page*/}
            <Route component={NotFoundPage} />
          </Switch>
        </FacebookAuthProvider>
      </FirestoreProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;

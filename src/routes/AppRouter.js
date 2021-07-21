import { BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

// initialize react router for handling of app route and any other possible routes
const AppRouter = () => (
  <BrowserRouter>
    <Switch>
      {/* Home route*/}
      <Route path="/" exact component={HomePage} />
      {/* 404 page*/}
      <Route component={NotFoundPage} />
    </Switch>
  </BrowserRouter>
);

export default AppRouter;

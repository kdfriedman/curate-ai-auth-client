import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
      <div>404: Not found</div>
      <NavLink to="/login">
        <button>Back to login</button>
      </NavLink>
    </>
  );
};

export default NotFoundPage;

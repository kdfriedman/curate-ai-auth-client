import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
      <div>404: Not found</div>
      <NavLink to="/">
        <button>Back home</button>
      </NavLink>
    </>
  );
};

export default NotFoundPage;

import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // hide onLoad spinner icon
      const onLoadSpinner = document.querySelector(
        '[data-on-load-spinner="true"]'
      );
      onLoadSpinner.style.display = 'none';
    }
    return () => {
      isMounted = false;
    };
  });
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

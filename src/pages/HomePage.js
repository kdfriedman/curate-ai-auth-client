import { useState, useEffect } from 'react';
import authenticateWithFacebook from '../services/firebase/auth/firebase-auth';

const HomePage = () => {
  const [isFacebookLoginAction, updateFacebookLoginAction] = useState(false);

  useEffect(() => {
    const retrieveFacebookAuthResponse = async () => {
      // call firebase facebook auth client
      const facebookAuthResponse = await authenticateWithFacebook();
      console.log(facebookAuthResponse);

      // TODO: setup next set of routes for system user creation

      // reset the isFacebookLoginAction state to false
      updateFacebookLoginAction(false);
    };
    if (isFacebookLoginAction) {
      retrieveFacebookAuthResponse();
    }
  }, [isFacebookLoginAction]);

  return (
    <>
      <main
        className="home-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <header
          style={{
            margin: '1.5rem',
            color: 'black',
            fontWeight: 700,
            fontSize: '2rem',
            display: 'flex',
          }}
        >
          CurateApp.AI facebook login
        </header>
        <button
          style={{
            width: '10rem',
            height: '3rem',
            backgroundColor: '#0a2540',
            color: 'white',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 600,
            fontSize: '18px',
          }}
          id="facebookLogin"
          onClick={() => updateFacebookLoginAction(true)}
        >
          Facebook Login
        </button>
      </main>
    </>
  );
};

export default HomePage;

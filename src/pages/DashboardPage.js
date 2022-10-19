import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { useEffect, useState } from 'react';
import { Flex, Button, Box, useMediaQuery } from '@chakra-ui/react';

export const DashboardPage = () => {
  const [isLoading, setLoading] = useState(false);

  return (
    <>
      <Header />
      <Loader isLoading={isLoading} loadingMessage="Loading..." />
      <div>Dashboard Page</div>
    </>
  );
};

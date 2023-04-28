import { Flex, Link, Box, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <>
      <Flex>
        <Box className="footer__contact-sales">
          <Text fontSize="14px" whiteSpace="nowrap">
            Interested in using CurateAI?{' '}
            <Link
              color="#635bff"
              href="mailto:
          ryanwelling@curateapp.ai?cc=kevinfriedman@curateapp.ai,murraywebb@curateapp.ai&subject=CurateAI:%20Contact%20Sales"
            >
              Contact our team.
            </Link>
          </Text>
        </Box>
      </Flex>
      <Flex margin="1.5rem" className="footer__copy-right" color="#6c757d" fontWeight="500">
        © CurateAI {new Date().getFullYear()}
      </Flex>
    </>
  );
};

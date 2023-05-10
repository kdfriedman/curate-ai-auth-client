import { useHistory, NavLink } from 'react-router-dom';
import {
  Flex,
  Link,
  Box,
  Divider,
  Center,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  IconButton,
  useMediaQuery,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';
import { Logo } from './Logo';

const MenuItems = ({ menuItems }) => {
  return menuItems.map((item) => {
    const { parent: Parent, child: Child, id, props, parentProps, label } = item;
    return (
      <React.Fragment key={id}>
        <Parent {...parentProps}>
          <Child {...props}>{label}</Child>
        </Parent>
      </React.Fragment>
    );
  });
};

export const Header = () => {
  const { logout } = useAuth();
  const history = useHistory();
  const [hasLogoutEvent, setLogoutEvent] = useState(false);
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  useEffect(() => {
    const logoutUser = async () => {
      await logout();
      history.push('/login');
    };
    if (hasLogoutEvent) {
      logoutUser();
    }
  }, [logout, hasLogoutEvent, history]);

  const ROUTES = {
    integrations: 'integrations',
    profile: 'profile',
    dashboard: 'dashboard',
    support: 'support',
  };
  const MenuListItem = ({ children, ...props }) => {
    return <li {...props}>{children}</li>;
  };

  const menuItemsLG = [
    {
      id: 0,
      parent: Link,
      child: MenuListItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/profile',
        style: {
          textDecoration: 'none',
          color: `${
            history.location.pathname.slice(1, history.location.pathname.length) === ROUTES.profile
              ? '#635bff'
              : '#1a202c'
          }`,
        },
        className: 'header__nav-menu-item',
      },
      label: 'My Profile',
    },
    {
      id: 1,
      parent: Link,
      child: MenuListItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/integrations',
        style: {
          textDecoration: 'none',
          color: `${
            history.location.pathname.slice(1, history.location.pathname.length) === ROUTES.integrations
              ? '#635bff'
              : '#1a202c'
          }`,
        },
        className: 'header__nav-menu-item',
      },
      label: 'Integrations',
    },
    {
      id: 2,
      parent: Link,
      child: MenuListItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/dashboard',
        style: {
          textDecoration: 'none',
          color: `${
            history.location.pathname.slice(1, history.location.pathname.length) === ROUTES.dashboard
              ? '#635bff'
              : '#1a202c'
          }`,
        },
        className: 'header__nav-menu-item',
      },
      label: 'Dashboard',
    },
    {
      id: 3,
      parent: Link,
      child: MenuListItem,
      parentProps: {
        as: NavLink,
        to: '/support',
        style: {
          textDecoration: 'none',
          color: `${
            history.location.pathname.slice(1, history.location.pathname.length) === ROUTES.support
              ? '#635bff'
              : '#1a202c'
          }`,
        },
        className: 'header__nav-menu-item',
      },
      props: {
        style: { fontSize: '1.25rem', fontWeight: 500, cursor: 'pointer' },
      },
      label: 'Help & Support',
    },
    {
      id: 4,
      parent: Box,
      child: MenuListItem,
      props: {
        onClick: () => setLogoutEvent(true),
        style: { fontSize: '1.25rem', fontWeight: 500, cursor: 'pointer' },
      },
      parentProps: { style: { textDecoration: 'none' }, className: 'header__nav-menu-item' },
      label: 'Logout',
    },
  ];

  const menuItemsSM = [
    {
      id: 0,
      parent: Link,
      child: MenuItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/profile',
        style: { textDecoration: 'none' },
        className: 'header__nav-menu-item',
      },
      label: 'My Profile',
    },
    {
      id: 1,
      parent: Link,
      child: MenuItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/integrations',
        style: { textDecoration: 'none' },
        className: 'header__nav-menu-item',
      },
      label: 'Integrations',
    },
    {
      id: 2,
      parent: Link,
      child: MenuItem,
      props: { style: { fontSize: '1.25rem', fontWeight: 500 } },
      parentProps: {
        as: NavLink,
        to: '/dashboard',
        style: { textDecoration: 'none' },
        className: 'header__nav-menu-item',
      },
      label: 'Dashboard',
    },
    {
      id: 3,
      parent: Link,
      child: MenuItem,
      parentProps: {
        as: NavLink,
        to: '/support',
        style: { textDecoration: 'none' },
        className: 'header__nav-menu-item',
      },
      props: {
        style: { fontSize: '1.25rem', fontWeight: 500, cursor: 'pointer' },
      },
      label: 'Help & Support',
    },
    {
      id: 4,
      parent: Box,
      child: MenuItem,
      props: {
        onClick: () => setLogoutEvent(true),
        style: { fontSize: '1.25rem', fontWeight: 500, cursor: 'pointer' },
      },
      parentProps: { style: { textDecoration: 'none' }, className: 'header__nav-menu-item' },
      label: 'Logout',
    },
  ];

  const setMenuListStyles = (id) => {
    const menuItemList = document.getElementById(id);
    const menuItems = [...menuItemList.children];
    menuItems.forEach((menuItem) => {
      if (menuItem.classList.contains('active')) {
        return (menuItem.firstElementChild.style.color = '#635bff');
      }
      menuItem.firstElementChild.style.color = '#6c757d';
    });
  };

  return (
    <header style={{ height: '100%' }}>
      <Flex height="100%">
        <nav
          style={{
            ...(isEqualToOrLessThan800[0] ? { width: '100%' } : {}),
            ...(isEqualToOrLessThan800[0] ? { alignItems: 'center' } : {}),
            display: 'flex',
            flexDirection: `${isEqualToOrLessThan800[0] ? 'row' : 'column'}`,
            gap: '2rem',
            margin: '1.5rem 0 0 2rem',
          }}
        >
          <Flex className="header__nav-logo-container" flexGrow={isEqualToOrLessThan800[0] ? 1 : 0}>
            <Link as={NavLink} to="/integrations" style={{ textDecoration: 'none' }}>
              <Logo />
            </Link>
          </Flex>
          <Flex className="header__nav-avatar-container">
            {isEqualToOrLessThan800[0] ? (
              <Menu id="sm" onOpen={() => setMenuListStyles('menu-list-sm')}>
                <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
                <MenuList>
                  <MenuItems menuItems={menuItemsSM} />
                </MenuList>
              </Menu>
            ) : (
              <ul
                data-id="menu-list-lg"
                style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <MenuItems menuItems={menuItemsLG} />
              </ul>
            )}
          </Flex>
        </nav>
        {!isEqualToOrLessThan800[0] ? (
          <Center height="100%" marginLeft="3rem">
            <Divider className="v-divider-left-justified" orientation="vertical" />
          </Center>
        ) : null}
      </Flex>
    </header>
  );
};

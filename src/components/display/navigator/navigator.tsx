import { Copyright } from '@/components/common';
import { Route, routes } from '@/routes';
import { ChevronLeft, ExpandMore } from '@mui/icons-material';

import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type NavigatorProps = {
  open: boolean;
  onClose: () => void;
};

export function Navigator({ open, onClose }: NavigatorProps) {
  const [dropdownOpened, setDropdownOpened] = useState<string>('');
  const isSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { push } = useRouter();
  const pathName = usePathname();

  const isSelectedPath = (route: Route) => {
    if (
      route.path === pathName ||
      route.id === dropdownOpened ||
      route.subRoutes?.some((sub) => sub.path === pathName) ||
      route.subRoutes?.some((sub) => sub.id === dropdownOpened)
    ) {
      return true;
    }

    return false;
  };

  const isCollapsed = (route: Route) => {
    return (
      route.id === dropdownOpened ||
      route.subRoutes?.some((sub) => sub.id === dropdownOpened)
    );
  };

  const handleSelectRoute = (route: Route) => {
    if (!route.subRoutes) {
      push(route.path);
      onClose();
    } else {
      setDropdownOpened((prev) => (prev === route.id ? '' : route.id));
    }
  };

  const isOpened = useMemo(() => {
    if (isSm) {
      return open;
    }
    return true;
  }, [isSm, open]);

  return (
    <Drawer
      variant={isSm ? 'temporary' : 'permanent'}
      open={isOpened}
      onClose={onClose}
      sx={{
        flexShrink: 0,
        zIndex: 110,
        position: 'relative',
        '& .MuiDrawer-paper': {
          width: isSm ? 240 : 72,
          boxSizing: 'border-box',
          backgroundColor: 'primary.main',
          color: 'white',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          transition: 'width 0.5s ease',
          msOverflowStyle: 'none',
          overflowY: 'auto',
          '.copyright-box': {
            display: isSm ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
          },
          '.route-name': {
            display: isSm ? 'inline' : 'none',
          },
          svg: {
            fontSize: isSm ? '24px' : '36px',
          },
          '.route-collapse': {
            display: isSm ? 'block' : 'none',
          },
          '&:hover': {
            width: 240,
            '.copyright-box': {
              display: 'flex',
            },
            '.route-name': {
              display: 'inline',
            },
            '.route-collapse': {
              display: 'block',
            },
            svg: {
              fontSize: '24px',
            },
          },
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        pl={2}
        py={{ xs: 4.5, sm: 3.9 }}
        justifyContent="space-between"
        height={{ sm: 100, xs: 72 }}
      >
        <Box justifyContent="center" alignItems="center"></Box>
        <IconButton onClick={onClose}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <Divider />

      <Box
        pb={1}
        bgcolor="primary.main"
        height="100%"
        color="white"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <List disablePadding>
          {routes.map((route) => (
            <Box key={route.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSelectRoute(route)}
                  selected={isSelectedPath(route)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemIcon className="route-icon">
                    {route.icon}
                  </ListItemIcon>
                  <ListItemText className="route-name">{route.id}</ListItemText>
                  {route.subRoutes && (
                    <ExpandMore className="route-name" sx={{ mr: -1 }} />
                  )}
                </ListItemButton>
              </ListItem>
              {route.subRoutes && (
                <Collapse
                  in={isCollapsed(route)}
                  timeout="auto"
                  unmountOnExit
                  className="route-collapse"
                >
                  <List
                    component="div"
                    disablePadding
                    sx={{ bgcolor: 'primary.dark' }}
                  >
                    {route.subRoutes?.map((childrenRoute) => (
                      <Box key={childrenRoute.id}>
                        <ListItem>
                          <ListItemButton
                            onClick={() => handleSelectRoute(childrenRoute)}
                          >
                            <ListItemText className="route-name">
                              {childrenRoute.id}
                            </ListItemText>
                            {childrenRoute.subRoutes && (
                              <ExpandMore
                                className="route-name"
                                sx={{ mr: -1 }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                        <Collapse
                          in={isCollapsed(childrenRoute)}
                          timeout="auto"
                          unmountOnExit
                          className="route-collapse"
                        >
                          <List
                            component="div"
                            disablePadding
                            sx={{ bgcolor: 'primary.dark' }}
                          >
                            {childrenRoute.subRoutes?.map(
                              (childrenSubRoute) => (
                                <ListItem
                                  key={childrenSubRoute.id}
                                  sx={{ position: 'relative' }}
                                >
                                  {isSelectedPath(childrenSubRoute) && (
                                    <Box
                                      bgcolor="primary.light"
                                      width="100%"
                                      height="100%"
                                      position="absolute"
                                      left={0}
                                      top={0}
                                    />
                                  )}

                                  <ListItemButton
                                    onClick={() =>
                                      handleSelectRoute(childrenSubRoute)
                                    }
                                  >
                                    <ListItemText
                                      className="route-name"
                                      sx={{ pl: 4 }}
                                    >
                                      {childrenSubRoute.id}
                                    </ListItemText>
                                  </ListItemButton>
                                </ListItem>
                              ),
                            )}
                          </List>
                        </Collapse>
                      </Box>
                    ))}
                  </List>
                </Collapse>
              )}
              <Divider />
            </Box>
          ))}
        </List>
        <Box className="copyright-box">
          <Copyright />
        </Box>
      </Box>
    </Drawer>
  );
}

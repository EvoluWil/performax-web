"use client";
import { SelectCompanyModal } from "@/components/modal";
import { UpdatePassword } from "@/features/auth/components";
import { useSession } from "@/providers/auth";
import { companyService } from "@/services/company.service";
import {
  BusinessOutlined,
  LockResetOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { Avatar, Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";

export const HeaderUser = () => {
  const [started, setStarted] = useState(false);
  const [updatePasswordOpen, setUpdatePasswordOpen] = useState(false);
  const [selectCompanyModalOpen, setSelectCompanyModalOpen] = useState(false);
  const { user } = useSession();

  const company = companyService.getDefaultCompany();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSignOut = () => {
    signOut({
      callbackUrl: "/auth/sign-in",
    });
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleNavigateToMyAccount = () => {
  //   push('/profile');
  //   handleClose();
  // };

  const handleUpdateCompany = async () => {
    setSelectCompanyModalOpen(true);
  };

  const handleUpdatePassword = () => {
    setUpdatePasswordOpen(true);
    handleClose();
  };

  useEffect(() => {
    setStarted(true);
  }, []);

  if (!started) {
    return null;
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        ml="auto"
        onClick={handleClick}
        component={Button}
        sx={{
          boxShadow: {
            xs: "none",
            sm: "2px 2px 6px rgba(0, 0, 0, 0.1)",
          },
          borderRadius: 2,
        }}
      >
        <Avatar
          alt="User Avatar"
          sx={{
            color: "primary.main",
            position: "relative",
            backgroundColor: "grey.100",
            width: { xs: 36, sm: 54 },
            height: { xs: 36, sm: 54 },
          }}
        >
          <Typography variant="h6" zIndex={1}>
            {user?.name[0] || "P"}
          </Typography>
        </Avatar>
        <Box
          display={{ xs: "none", sm: "flex" }}
          flexDirection="column"
          alignItems="flex-start"
        >
          <Typography variant="body2" color="grey.100">
            {user?.name}
          </Typography>
          {!!company && (
            <Typography variant="caption" color="grey.300">
              {company ? company.name : "Selecione uma empresa"}
            </Typography>
          )}
        </Box>
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleUpdateCompany} sx={{ minWidth: 210 }}>
          <BusinessOutlined fontSize="small" color="primary" sx={{ mr: 1 }} />
          Trocar empresa
        </MenuItem>
        <MenuItem onClick={handleUpdatePassword} sx={{ minWidth: 210 }}>
          <LockResetOutlined fontSize="small" color="primary" sx={{ mr: 1 }} />
          Alterar senha
        </MenuItem>
        <MenuItem onClick={handleSignOut} sx={{ minWidth: 210 }}>
          <LogoutOutlined fontSize="small" color="primary" sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>
      <UpdatePassword
        open={updatePasswordOpen}
        onClose={() => setUpdatePasswordOpen(false)}
      />
      <SelectCompanyModal
        open={selectCompanyModalOpen}
        onClose={() => setSelectCompanyModalOpen(false)}
      />
    </>
  );
};

"use client";

import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import React from "react";

export type SplitActionItem = {
  key?: string;
  label: string;
  onClick: () => void | Promise<void>;
  visible?: boolean;
};

export type SplitActionsProps = {
  actions: SplitActionItem[];
  primaryLabel?: string; // label shown on the main button
};

export const SplitActions: React.FC<SplitActionsProps> = ({
  actions,
  primaryLabel,
}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  const visibleActions = (actions || []).filter((a) => a.visible !== false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleItemClick = async (action: SplitActionItem) => {
    handleClose();
    try {
      await action.onClick();
    } catch {
      // swallow — caller can handle errors
    }
  };

  if (!visibleActions.length) return null;

  return (
    <>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="split actions"
      >
        <Button
          onClick={() => {
            /* no-op primary click */
          }}
        >
          {primaryLabel ?? "Ações"}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 1400 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "center top" }}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-menu">
                  {visibleActions.map((a, idx) => (
                    <MenuItem
                      key={a.key ?? idx}
                      onClick={() => handleItemClick(a)}
                    >
                      {a.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default SplitActions;

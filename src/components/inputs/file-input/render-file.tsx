import { File as IFile, imageExtensions, videoExtensions } from "@/types/file";
import { getFileName } from "@/utils/file";
import {
  Close as CloseIcon,
  InsertDriveFileOutlined,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React from "react";

interface RenderFileProps {
  file: IFile;
  onRemoveFile?: () => void;
  loading?: boolean;
}

export const RenderFile: React.FC<RenderFileProps> = ({
  file,
  onRemoveFile,
  loading = false,
}) => {
  const handleClick = () => {
    window.open(file.url, "_blank");
  };

  const ext = (file?.type || "").toLowerCase();
  const isImage = imageExtensions.includes(ext);
  const isVideo = videoExtensions.includes(ext);

  return (
    <Box
      onClick={handleClick}
      role="button"
      sx={{
        position: "relative",
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        width: 80,
        height: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        bgcolor: "background.paper",
        transition: "background-color 200ms",
        "&:hover": { bgcolor: "action.hover" },
        overflow: "hidden",
      }}
    >
      {isImage && (
        <Image
          id={file.url}
          src={file.url}
          alt={getFileName(file)}
          fill
          sizes="112px"
          style={{ objectFit: "cover" }}
        />
      )}

      {isVideo && (
        <Box
          component="video"
          src={file.url}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {!isImage && !isVideo && (
        <>
          <InsertDriveFileOutlined
            sx={{ fontSize: 60, color: "primary.main" }}
          />
          <Typography
            variant="caption"
            noWrap
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              color: "text.primary",
              px: 0.5,
              width: "100%",
            }}
          >
            {getFileName(file)}
          </Typography>
        </>
      )}

      {onRemoveFile && (
        <Tooltip title="Remover">
          <span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
              disabled={loading}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "background.paper",
              }}
            >
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <CloseIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

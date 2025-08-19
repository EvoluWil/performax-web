import { File as IFile } from '@/types/file';
import { AttachFileOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { RenderFile } from './render-file';

export interface FileInputBaseProps {
  onRemoveDefaultFile: (file: IFile) => Promise<void>;
  defaultFiles?: IFile[];
  multiple?: boolean;
  accept?: string;
  label?: string;
}

export type FileInputProps<T extends FieldValues> = FileInputBaseProps &
  UseControllerProps<T>;

export function FileInput<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  defaultFiles = [],
  multiple = false,
  onRemoveDefaultFile,
  accept,
  label = 'Adicionar arquivos',
}: FileInputProps<T>) {
  const [loading, setLoading] = useState(false);
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control, defaultValue, rules, shouldUnregister });

  const value: File[] = Array.isArray(field.value) ? field.value : [];

  const handleAddFile = (file: File) => {
    if (multiple) {
      field.onChange([...(value || []), file]);
    } else {
      field.onChange([file]);
    }
  };

  const handleRemoveAt = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    field.onChange(next);
  };

  const handleRemoveDefaultFile = async (file: IFile) => {
    setLoading(true);
    await onRemoveDefaultFile(file);
    setLoading(false);
  };

  return (
    <Box width="100%" display="flex" flexDirection="column">
      <Divider sx={{ my: 2 }} />

      <Box
        display="flex"
        gap={2}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        {value?.map((file, index) => {
          const url = URL.createObjectURL(file);
          const type = file.name.split('.').pop() || '';
          return (
            <RenderFile
              file={{ url, type }}
              key={`${file.name}-${index}`}
              onRemoveFile={() => handleRemoveAt(index)}
            />
          );
        })}

        {value?.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nenhum arquivo adicionado
          </Typography>
        )}
      </Box>

      {defaultFiles?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Arquivos adicionados anteriormente
          </Typography>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            my={2}
          >
            {defaultFiles?.map((file, index) => (
              <RenderFile
                file={file}
                key={index}
                onRemoveFile={() => handleRemoveDefaultFile(file)}
                loading={loading}
              />
            ))}
          </Box>
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        component="label"
        fullWidth
        sx={{ maxWidth: 320, alignSelf: 'center' }}
        startIcon={<AttachFileOutlined />}
        disabled={disabled || isSubmitting}
      >
        {label}
        <input
          type="file"
          hidden
          accept={accept}
          onChange={({ target }) => {
            const files = target?.files;
            if (files?.length) {
              handleAddFile(files[0]);
            }
            if (target) target.value = '';
          }}
          multiple={multiple}
        />
      </Button>
      {!!error?.message && (
        <FormHelperText error sx={{ mx: 2, mt: 0.5 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
}

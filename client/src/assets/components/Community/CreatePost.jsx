import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  Typography, 
  TextField, 
  Button, 
  Box,
  IconButton,
  styled,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import Compressor from 'compressorjs';
import { JsonInput } from '@mantine/core';

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'var(--white)',
    },
    '&:hover fieldset': {
      borderColor: 'var(--gold)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--gold)',
    },
    '& input, & textarea': {
      color: 'var(--white)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--white)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--gold)',
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--white)',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    color: 'var(--white)',
    opacity: 0.7,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--gold)',
  color: 'var(--black)',
  '&:hover': {
    backgroundColor: 'var(--white)',
  },
  borderRadius: '1rem',
  padding: '0.5rem 1rem',
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: 'var(--white)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

export default function CreatePost({ onClose, communityId, onNewPost }) {
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Added error state
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      new Compressor(file, {
        quality: 0.6, // adjust this value to change compression level
        success: (compressedFile) => {
          setMedia(compressedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
          };
          reader.readAsDataURL(compressedFile);
        },
        error: (err) => {
          console.error('Compression failed:', err);
          // Fallback to original file if compression fails
          setMedia(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
          };
          reader.readAsDataURL(file);
        },
      });
    }
  };

  const handleRemoveImage = () => {
    setMedia(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('communityId', communityId);
      const userId = JSON.parse(localStorage.getItem("user")).id;
      formData.append('userId', userId);
      if (media) {
        formData.append('media', media, media.name);
      }

      console.log('Sending data:', Object.fromEntries(formData));

      const response = await axios.post('http://localhost:3000/posts/createPost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created:', response.data);

 
      const userData = JSON.parse(localStorage.getItem("user"));

      // Combine post data with user information
      const completePostData = {
        ...response.data,
        userId: {
          _id: userData.id,
          username: userData.username,
          profilePhoto: userData.profilePhoto
        }
      };

      onNewPost(completePostData);
      setDescription('');
      setMedia(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Typography variant="h6" component="h2" sx={{ color: 'var(--white)', mb: 2, fontWeight: 600, fontFamily: 'Poppins' }}>
        Create a New Post
      </Typography>
      <StyledTextField
        fullWidth
        id="description"
        label="What's on your mind?"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        inputProps={{ maxLength: 500 }}
      />
      
      {preview && (
        <ImagePreview>
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: '0.5rem' }}
          />
          <CloseButton onClick={handleRemoveImage} size="small">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ImagePreview>
      )}
      <StyledButton
        variant="contained"
        component="label"
        startIcon={<ImageIcon />}
        sx={{ mt: 2, width: '20rem', alignSelf: 'center' }}
      >
        Upload Picture
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleMediaChange}
          ref={fileInputRef}
        />
      </StyledButton>
      <StyledButton
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 2, width: '20rem', alignSelf: 'center' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Post'}
      </StyledButton>
      {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
    </StyledForm>
  );
}


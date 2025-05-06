import React, { useState, useRef } from 'react';
import axios from 'axios';
import Compressor from 'compressorjs';
import {
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  styled,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { useNavigate } from 'react-router-dom';

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

const StyledSelect = styled(TextField)(({ theme }) => ({
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
  },
  '& .MuiInputLabel-root': {
    color: 'var(--white)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--gold)',
  },
  '& .MuiSelect-icon': {
    color: 'var(--white)',
  },
  '& .MuiSelect-select': {
    color: 'var(--white)',
  },
  '& .MuiMenuItem-root': {
    color: 'var(--black)',
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
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  overflow: 'hidden',
  margin: '0 auto',
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

const categories = ['Technology', 'Food', 'Movies and shows', 'News', 'Vehicles'];

export default function CreateCommunity({ onClose }) {
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [communityPhoto, setCommunityPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1000,
        maxHeight: 1000,
        success: (compressedFile) => {
          setCommunityPhoto(compressedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
          };
          reader.readAsDataURL(compressedFile);
        },
        error: (err) => {
          console.error('Compression failed:', err);
          setCommunityPhoto(file);
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
    setCommunityPhoto(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('communityName', communityName);
      formData.append('category', selectedCategory);
      formData.append('description', communityDescription);
      if (communityPhoto) {
        formData.append('communityPhoto', communityPhoto, communityPhoto.name);
      }
      formData.append('userId', JSON.parse(localStorage.getItem('user')).id);

      const response = await axios.post('http://localhost:3000/communities/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Community created:', response.data);

      // Reset form
      setCommunityName('');
      setCommunityDescription('');
      setCommunityPhoto(null);
      setPreview(null);
      setSelectedCategory('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Close the modal
      onClose();



      const profileIcon = response.data.communityPhoto;

      navigate(`/community/${response.data._id}`, {
        state: { communityName, totalMembers : 1, profileIcon },
      });



    } catch (error) {
      console.error('Failed to create community:', error);
      setError('Failed to create community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Typography variant="h6" component="h2" sx={{ color: 'var(--gold)', mb: 2, fontWeight: 600 }}>
        Create a New Community
      </Typography>
      <StyledTextField
        fullWidth
        id="communityName"
        label="Community Name"
        value={communityName}
        onChange={(e) => setCommunityName(e.target.value)}
        required
        inputProps={{ maxLength: 100 }}
      />
      <StyledTextField
        fullWidth
        id="communityDescription"
        label="Community Description"
        value={communityDescription}
        onChange={(e) => setCommunityDescription(e.target.value)}
        required
        multiline
        rows={3}
        inputProps={{ maxLength: 150 }} // Max length set to 150
      />
      <StyledSelect
        select
        fullWidth
        id="category"
        label="Category"
        value={selectedCategory}
        onChange={handleCategoryChange}
        required
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </StyledSelect>
      {preview && (
        <ImagePreview>
          <img
            src={preview}
            alt="Community Photo Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
        sx={{ mt: 2, width: '20rem', alignSelf: 'center', borderRadius: '0.5rem' }}
      >
        Upload Community Photo
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handlePhotoChange}
          ref={fileInputRef}
        />
      </StyledButton>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <StyledButton
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 2, width: '20rem', alignSelf: 'center',  borderRadius: '0.5rem' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Community'}
      </StyledButton>
    </StyledForm>
  );
}

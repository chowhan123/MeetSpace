import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // ✅ CORRECTED
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getRandomImageUrl } from '../Utils/getUnsplashIamhe';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [bgImage, setBgImage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  // Fetch random background image from Unsplash
  React.useEffect(() => {
    const fetchBackground = async () => {
      const imgUrl = await getRandomImageUrl();
      if (imgUrl) {
        setBgImage(imgUrl);
      }
    };
    fetchBackground();
  }, []);

  // Clear errors when switching between forms
  React.useEffect(() => {
    setError('');
    setMessage('');
  }, [formState]);

  // Handle authentication (both Login and Registration)
  const handleAuth = async (e) => {
    e?.preventDefault();
    
    setError('');
    setMessage('');

    // Validation
    if (formState === 1 && !name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);

      if (formState === 0) {
        const res = await handleLogin(username.trim(), password);
        setMessage(res || 'Login successful!');
        setSnackbarSeverity('success');
        setOpen(true);
      } else {
        const result = await handleRegister(name.trim(), username.trim(), password);
        setMessage(result || 'Registration successful! Please sign in.');
        setSnackbarSeverity('success');
        
        setName('');
        setUsername('');
        setPassword('');
        setError('');
        setOpen(true);
        
        setTimeout(() => {
          setFormState(0);
        }, 2000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Something went wrong. Please try again.';
      
      setError(errorMessage);
      setSnackbarSeverity('error');
      setMessage(errorMessage);
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth(e);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      
      <Box
        component="main"
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
          '@media (max-width: 768px)': {
            flexDirection: 'column',
          },
        }}
      >
        {/* Left Side: Image */}
        <Box
          sx={{
            flex: '1 1 60%', 
            minHeight: '100vh',
            position: 'relative',
            backgroundImage: bgImage 
              ? `url(${bgImage})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '@media (max-width: 768px)': {
              flex: '0 0 200px',
              minHeight: '200px',
            },
            '@media (max-width: 600px)': {
              display: 'none',
            },
          }}
        />
        
        {/* Right Side: Form */}
        <Paper 
          elevation={6}
          square
          sx={{
            flex: '1 1 40%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 768px)': {
              flex: '1 1 auto',
              minHeight: 'calc(100vh - 200px)',
            },
            '@media (max-width: 600px)': {
              minHeight: '100vh',
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
        
            <Box sx={{ marginBottom: '1rem' }}>
              <Button 
                variant={formState === 0 ? 'contained' : 'text'} 
                onClick={() => setFormState(0)}
                sx={{ mr: 1 }}
                disabled={isLoading}
              >
                Sign In
              </Button>

              <Button 
                variant={formState === 1 ? 'contained' : 'text'} 
                onClick={() => setFormState(1)}
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </Box>

            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              {formState === 0 ? 'Sign In' : 'Sign Up'}
            </Typography>
            
            <Box 
              component="form" 
              noValidate 
              sx={{ width: '100%' }}
              onSubmit={handleAuth}
            >
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus={formState === 1}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus={formState === 0}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {error && (
                <Typography color="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                  {error}
                </Typography>
              )}
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    {formState === 0 ? 'Signing In...' : 'Registering...'}
                  </>
                ) : (
                  formState === 0 ? 'Sign In' : 'Sign Up'
                )}
              </Button>

              <Typography 
                variant="body2" 
                align="center" 
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                {formState === 0 
                  ? "Don't have an account? Click Sign Up above" 
                  : "Already have an account? Click Sign In above"
                }
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar 
        open={open} 
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
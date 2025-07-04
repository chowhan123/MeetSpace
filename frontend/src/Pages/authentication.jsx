import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
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
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  // useEffect to fetch a random background image from Unsplash when component mounts
  React.useEffect(() => {
    const fetchBackground = async () => {
      const imgUrl = await getRandomImageUrl();
      setBgImage(imgUrl);
    };
    fetchBackground();
  }, []);

  // Function to handle authentication (both Login and Registration)
  const handleAuth = async () => {
    try {
      // If formState is 0 → user is trying to login
      if (formState === 0) {
        let res = await handleLogin(username, password);
        setMessage(res || 'Login successful!');
      } else {
        // If formState is 1 → user is trying to register
        let result = await handleRegister(name, username, password);
        setMessage(result || 'Registration successful!');
        setName('');
        setUsername('');
        setPassword('');
        setError('');
        setOpen(true);
        setFormState(0); // Switch back to login form after registration
      }
    } catch (error) {
      let message = error?.response?.data?.message || error?.message || 'Something went wrong';
      setError(message);
    }
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
          backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '@media (max-width: 768px)': {
            flex: '0 0 200px', // Fixed height on mobile
            minHeight: '200px',
          },
          '@media (max-width: 600px)': {
            display: 'none', // Hide on small screens
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
              >
                Sign In
              </Button>

              <Button variant={formState === 1 ? 'contained' : 'text'} 
                onClick={() => setFormState(1)}
                >
                  Sign Up
              </Button>
              
              </Box>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                  {formState === 0 ? 'Sign In' : 'Sign Up'}
                </Typography>
                
                <Box component="form" noValidate sx={{ width: '100%' }}>
                  <Box sx={{ height: '72px', marginBottom: '8px' }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ visibility: formState === 1 ? 'visible' : 'hidden' }}
                    />
                  </Box>
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Username"
                    value={username}
                    autoComplete="username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                   )}
                   
                   <Button type="button" fullWidth variant="contained" x={{ mt: 3, mb: 2 }} onClick={handleAuth}>
                    {formState === 0 ? 'Login' : 'Register'}
                   </Button>
                  </Box>
                </Box>
              </Paper>
          </Box>
          <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  )
}

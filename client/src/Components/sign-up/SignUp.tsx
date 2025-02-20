import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { GoogleIcon } from './CustomIcons';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useUser } from '../Contexts/userContext';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useToken } from '../Contexts/tokenContext';

// Reduced padding in the card
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(2), // Reduced from 3
  gap: theme.spacing(1.5), // Reduced from 2
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '400px', // Reduced from 450px
    padding: theme.spacing(3), // Reduced from 4
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

// Optimized container with reduced padding and explicit max-height
const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: 'auto', // Changed from 100%
  maxHeight: '100vh',
  width: '100%',
  padding: theme.spacing(1), // Reduced from 1.5
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2), // Reduced from 3
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3), // Reduced from 4
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

type CodeResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [user, setUser] = useState<CodeResponse | null>(null);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>("")

  const { loginUser } = useUser()
  const { SetToken } = useToken()

  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const createAccount = async () => {
      if (!user) return;

      if (username.length > 15) {
        window.alert('Username must be less than 16 characters!')
        return
      }

      try {
        const res = await axios.post(`http://localhost:5000/users/createAccount`, {
          accessToken: user.access_token,
          userName: username
        });

        const userAccount = res.data.user
        const { accessToken, refreshToken } = res.data;
        SetToken('accessToken', accessToken)
        SetToken('refreshToken', refreshToken)

        loginUser(userAccount)
        navigate('/', { replace: true })
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          const errorResponse = error.response.data
          setError(errorResponse)
        } else {
          setError("Network error. Please try again")
        }
      }
    }
    createAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleInput = (value: string) => {
    if (error.length > 0) {
      setError("")
    }
    setUsername(value)
  }

  const login = useGoogleLogin({
    onSuccess: (codeResponse: CodeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login failed: ', error),
    scope: 'email profile'
  });

  const handleSignUp = () => {
    if (!username || username.length == 0) {
      setError("Must enter a username")
      return
    }
    if (error.length > 0) {
      setError("")
    }
    login()

  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          {/*<SitemarkIcon />*/}
          <Typography
            component="h1"
            variant="h5" // Reduced from h4
            sx={{
              width: '100%',
              fontSize: {
                xs: '1.25rem', // Reduced from 1.5rem
                sm: '1.5rem' // Reduced from 2rem
              },
              textAlign: 'center',
              fontFamily: 'basicText',
              mb: 0.5 // Added small margin bottom
            }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column' }} // Reduced gap
          >
            <FormControl size="small"> {/* Added size small */}
              <FormLabel htmlFor="name">Username</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                color={'primary'}
                size="small" // Added size small
                onChange={(e) => handleInput(String(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}> {/* Reduced gap */}
            {error.length > 0 && <Typography sx={{ mb: '2px', ml: '6px', fontFamily: 'basicText', color: '#fc1103', fontSize: '12px' }}>
              {error}
            </Typography>}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleSignUp()}
              startIcon={<GoogleIcon />}
              size="small" // Added size small
              sx={{ py: { xs: 0.75, sm: 1 } }} // Reduced padding
            >
              Sign up with Google
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '0.875rem', my: '0.7rem' }}> {/* Reduced text size */}
              Already have an account?{' '}
              <Link
                href="/login"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}

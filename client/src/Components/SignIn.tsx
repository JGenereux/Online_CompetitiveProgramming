import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { GoogleIcon } from './CustomIcons';
import AppTheme from './shared-theme/AppTheme.tsx';
import ColorModeSelect from './shared-theme/ColorModeSelect.tsx';
import { useEffect, useState } from "react";
import { useUser } from "./Contexts/userContext.tsx"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToken } from './Contexts/tokenContext.tsx';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
    const [user, setUser] = useState<CodeResponse | null>(null);
    const { loginUser } = useUser()
    const { SetToken } = useToken()

    const navigate = useNavigate();
    useEffect(() => {
        async function fetchUser() {
            if (!user) return;

            try {
                const res = await axios.post(`http://localhost:5000/users/login`, {
                    accessToken: user.access_token,
                });

                const userAccount = res.data.user
                const { accessToken, refreshToken } = res.data;
                SetToken('accessToken', accessToken)
                SetToken('refreshToken', refreshToken)

                loginUser(userAccount)
                navigate('/', { replace: true })
            } catch (error) {
                console.log(error)
            }
        }
        fetchUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const login = useGoogleLogin({
        onSuccess: (codeResponse: CodeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login failed: ', error),
        scope: 'email profile'
    });

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <SignInContainer direction="column" justifySelf="center" justifyContent="space-between" width="50%">
                <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
                <Card variant="outlined">
                    {/*replace with logo <SitemarkIcon />*/}
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(1.25rem, 0vw, 0rem)' }}
                    >
                        Sign in
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => login()}
                            startIcon={<GoogleIcon />}
                        >
                            Sign in with Google
                        </Button>
                        <Typography sx={{ textAlign: 'center' }}>
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/signup"
                                variant="body2"
                                sx={{ alignSelf: 'center' }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignInContainer>
        </AppTheme>
    );
}

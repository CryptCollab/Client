import * as React from 'react';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';


function Home() {  

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const cards = [
  {
    title: 'End to End Encrypted',    
    description: [
      'Your data is safe with us',
      'Write without any worries',      
    ],    
  },
  {
    title: 'Real-Time Collaboration',    
    description: [
      'Invite your friends!!',
      'Collaborate with ease',
    ],    
  },
  {
    title: 'Conflict Resolution with CRDTs',    
    description: [
      'Resolves conflicts',
      'Guarantees convergence',      
    ],    
  },
];


  return (   
    <React.Fragment>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar/>
      <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
        <Typography
          component="h1"
          variant="h3"
          align="center"
          color="primary"
          gutterBottom
        >
          CryptCollab
        </Typography>        
      </Container>
      
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          {cards.map((card) => (           
            <Grid
              item
              key={card.title}
              xs={12}
              sm={card.title === 'Conflict Resolution with CRDTs' ? 12 : 6}
              md={4}
            >
              <Card>
                <CardHeader
                  title={<Typography
                  component="h1"
                  variant="h5"
                  align="center"
                  color="primary"
                  gutterBottom
                >
                  {card.title}
                  </Typography>  }                
                  titleTypographyProps={{ align: 'center' }}                  
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                  sx={{                    
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[700],
                  }}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >                    
                  </Box>
                  <ul>
                    {card.description.map((line) => (
                      <Typography
                        component="li"
                        variant="subtitle1"
                        align="center"
                        key={line}
                      >
                        {line}
                      </Typography>
                    ))}
                  </ul>
                </CardContent>                
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>      
      </ThemeProvider>        
    </React.Fragment>
  )
}

export default Home;

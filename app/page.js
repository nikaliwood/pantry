'use client'
import { Box, IconButton, Stack, TextField, Typography, handleSubmit} from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faCheck, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';  
import { ST } from 'next/dist/shared/lib/utils';



export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [showTextField, setShowTextField] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => { 
      pantryList.push({"name": doc.id, ... doc.data()});
    });
    console.log(pantryList);
    setPantry(pantryList);
  }

  useEffect(() => { 
  
    updatePantry();
  }, []);

  const handleIconClick = () => {
    setShowTextField(!showTextField);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore,'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()){
      const {count} = docSnap.data()
    
    await setDoc(docRef,{count: count+ 1})
    }
    else{
      await setDoc(docRef,{count: 1})
    }
    await updatePantry();
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore,'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if(count === 1){
        await deleteDoc(docRef)
      }else {
        await setDoc(docRef, {count: count-1})
      }
    }
    await updatePantry()
  }
  const filteredPantry = pantry.filter((item) =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  return (
    // main container for webpage
    <Box
      width="100vw"
      height="100vh"
      bgcolor={"#f1eff7"}
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      position="relative" // Set position to relative to position children absolutely
    >
      <Box border={'solid'} borderRadius={'10px'} bgcolor={'white'}>
        {/* Box to hold header title */}
        <Box width="820px" height="100px" bgcolor={'#9c2e9f'} display={'flex'} justifyContent={'center'} alignItems={'center'} borderBottom={'solid'} borderRadius={'7px'} marginBottom={0}>
          <Typography variant={'h2'} color={'white'} textAlign={'center'}>
            Pantry Tracker
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end" marginRight={1.6} py={.7} >
            <TextField
              label="Search Pantry"
              variant="outlined"
              size="small"
              value={searchQuery}
        
      
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </Box>
        {/* use stack to have items be in boxes vertically */}
        <Stack width="800px" height="300px" spacing={0.5} overflow={'auto'} marginLeft={1} marginRight={0.5}>
          {filteredPantry.map(({name, count}) => (
            <Box
              key={name}
              width="100%"
              minHeight="90px"
              display={'flex'}
              justifyContent={'center'}

              alignItems={'center'}
              bgcolor={'pink'}
              borderRadius={'16px'}
              position={'relative'} // Added relative positioning
            >
              <Typography
                  fontSize= '38px'
                  display={'inline'}
                  justifyContent={'right'}
                  marginLeft={.5}

                >
                  {count}
                </Typography>
              <Typography
                variant={'h3'}
                color={'#333'}
                textAlign={'center'}
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  width: 'calc(100% - 48px)',
                }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack>
                <IconButton
                  aria-label='deleteItem'
                  onClick={()=> addItem(name)}>
                  <FontAwesomeIcon icon={faPlus} />
                </IconButton>
                <IconButton
                  aria-label='deleteItem'
                  onClick={()=> removeItem(name)}>
                  <FontAwesomeIcon icon={faMinus} />
                </IconButton>
              </Stack>

            </Box>
          ))}
        </Stack>
      </Box>
      <IconButton
        aria-label='addItem'
        onClick={handleIconClick}
        sx={{
          position: 'absolute',
          bottom: '5px',
          left: '0px', // Positioned to the left
          zIndex: 2, // Ensure the button is on top of the TextField
        }}
      >
        <FontAwesomeIcon icon={faCirclePlus} size='2x' color='#ce93d8' />
      </IconButton>
      <Box
        sx={{
          position: 'absolute',
          bottom: '16px',
          left: '16px', // Align with IconButton
          display: 'flex',
          opacity: showTextField ? 1 : 0, // Make the TextField visible or hidden
          transform: showTextField ? 'translateX(48px)' : 'translateX(-300px)', // Adjust translateX to slide in/out
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          zIndex: 1, // Ensure the container is behind the IconButton initially
        }}
      >
        <TextField
          label="       Add Item"
          variant="standard"
          size="small"
          sx={{
            width: '200px', // Fixed width for the TextField
          }}
          value={itemName}
          onChange={(e)=> setItemName(e.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
              addItem(itemName)
            setItemName('')
            handleSubmit
              ev.preventDefault();
            }
          }}
        />
      <IconButton
          aria-label="submit"
          onClick ={()=> {
            addItem(itemName)
            setItemName('')
            handleSubmit}}
          sx={{ marginLeft: 1 }}
          color='success'
        >
         <FontAwesomeIcon icon={faCheck} />
        </IconButton>
      </Box>
    </Box>
  )
}

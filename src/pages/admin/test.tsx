import { LayoutAdmin } from '@/Layout_Admin';
import { createClient } from '@supabase/supabase-js';

import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { log } from 'console';

export const fetchSponsors = async () => {
  const { data, error } = await supabase.storage.getBucket('sponsorer');
  if (!data) {
    console.log('error', error);
  }
  console.log('data', data);
  console.log('Hej');
};

export default function Admin() {
  const [file, setFile] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<any>();

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
      console.log(e.target.files[0]);
      setFileDetails(e.target.files[0]);
    }
  }

  async function uploadImage() {
    const { data, error } = await supabase.storage.from('sponsorer').upload(file as string, fileDetails);
    console.log(data);
    console.log(error);
  }
  // COMMENT OUT FROM HERE TO DISABLE LOGIN GUARD
  const router = useRouter();

  useEffect(() => {
    getSession();
  }, []);

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (data.session === null) {
      router.push('/login');
    }
  }
  // COMMENT OUT TO HERE TO DISABLE LOGIN GUARD

  return (
    <>
      <LayoutAdmin>
        <main className='spacer'>
          <h1 className='mt-20' onClick={() => console.log(fileDetails)}>
            {' '}
            TEST site - For storage upload{' '}
          </h1>
          <div className=' flex flex-col gap-4 mt-6'>
            <input type='file' onChange={handleInput} />
            {file && <img src={file} alt='Uploaded file' width='150' height='auto' />}
          </div>
          <button onClick={() => uploadImage()}>Upload to Supabase </button>
        </main>
      </LayoutAdmin>
    </>
  );
}
